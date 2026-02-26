/**
 * Testes de comunicacao entre contextos via eventos.
 * Valida US-ARQ-03 e US-ARQ-06 criterios de aceite.
 * @see ADR 0004, docs/domain/domain-events.md
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { eventBus, subscribeToEvent, publishEvent } from '../../src/infrastructure/events/index.js';
import {
  APPOINTMENT_COMPLETED_EVENT,
  createAppointmentCompletedEvent,
  type AppointmentCompletedEvent,
} from '../../src/scheduling/domain/index.js';
import {
  createAttendanceHandler,
  type CreateAttendanceUseCase,
} from '../../src/clinical/application/index.js';
import {
  createReceivableHandler,
  type CreateReceivableUseCase,
  type TariffResolver,
} from '../../src/billing/application/index.js';
import type { Attendance, AttendanceRepository } from '../../src/clinical/domain/index.js';
import type { Receivable, ReceivableRepository, Money } from '../../src/billing/domain/index.js';

describe('US-ARQ-03: Comunicacao entre contextos via eventos', () => {
  beforeEach(() => {
    eventBus.clearAll();
  });

  afterEach(() => {
    eventBus.clearAll();
  });

  describe('EventBus', () => {
    it('deve publicar e consumir evento corretamente', async () => {
      let receivedEvent: AppointmentCompletedEvent | null = null;

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        async (event: AppointmentCompletedEvent) => {
          receivedEvent = event;
        },
        'test-module'
      );

      const event = createAppointmentCompletedEvent({
        tenantId: 'tenant-123',
        aggregateId: 'aggregate-456',
        appointmentId: 'appointment-789',
        patientId: 'patient-001',
        professionalId: 'professional-002',
        scheduledAt: new Date('2026-02-17T10:00:00Z'),
        completedAt: new Date('2026-02-17T11:00:00Z'),
        appointmentType: 'consultation',
      });

      await publishEvent(event);

      expect(receivedEvent).not.toBeNull();
      expect(receivedEvent?.eventName).toBe(APPOINTMENT_COMPLETED_EVENT);
      expect(receivedEvent?.tenantId).toBe('tenant-123');
      expect(receivedEvent?.appointmentId).toBe('appointment-789');
    });

    it('deve suportar multiplos handlers para o mesmo evento', async () => {
      const calls: string[] = [];

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        () => { calls.push('handler1'); },
        'module1'
      );

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        () => { calls.push('handler2'); },
        'module2'
      );

      const event = createAppointmentCompletedEvent({
        tenantId: 'tenant-123',
        aggregateId: 'agg-1',
        appointmentId: 'apt-1',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        scheduledAt: new Date(),
        completedAt: new Date(),
        appointmentType: 'consultation',
      });

      await publishEvent(event);

      expect(calls).toContain('handler1');
      expect(calls).toContain('handler2');
    });

    it('deve registrar falhas na dead letter queue', async () => {
      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        () => { throw new Error('Handler failed'); },
        'failing-module'
      );

      const event = createAppointmentCompletedEvent({
        tenantId: 'tenant-123',
        aggregateId: 'agg-1',
        appointmentId: 'apt-1',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        scheduledAt: new Date(),
        completedAt: new Date(),
        appointmentType: 'consultation',
      });

      await publishEvent(event);

      const dlq = eventBus.getDeadLetterQueue();
      expect(dlq.length).toBe(1);
      expect(dlq[0].event).toBe(event);
      expect(dlq[0].error.message).toBe('Handler failed');
    });
  });

  describe('AgendamentoRealizado -> Clinical (Atendimento)', () => {
    it('deve criar atendimento quando evento e publicado', async () => {
      const attendances: Map<string, Attendance> = new Map();

      const mockRepository: AttendanceRepository = {
        findById: async (id) => attendances.get(id) ?? null,
        findByAppointmentId: async (aptId) => {
          for (const a of attendances.values()) {
            if (a.appointmentId === aptId) return a;
          }
          return null;
        },
        save: async (attendance) => { attendances.set(attendance.id, attendance); },
      };

      const useCase: CreateAttendanceUseCase = {
        execute: async (input) => {
          const attendance: Attendance = {
            id: crypto.randomUUID(),
            ...input,
            status: 'completed',
            createdAt: new Date(),
          };
          await mockRepository.save(attendance);
          return attendance;
        },
      };

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        createAttendanceHandler(useCase),
        'clinical'
      );

      const event = createAppointmentCompletedEvent({
        tenantId: 'tenant-123',
        aggregateId: 'attendance-001',
        appointmentId: 'apt-001',
        patientId: 'pat-001',
        professionalId: 'prof-001',
        scheduledAt: new Date('2026-02-17T10:00:00Z'),
        completedAt: new Date('2026-02-17T11:00:00Z'),
        appointmentType: 'psychology',
      });

      await publishEvent(event);

      const savedAttendance = await mockRepository.findByAppointmentId('apt-001');
      expect(savedAttendance).not.toBeNull();
      expect(savedAttendance?.patientId).toBe('pat-001');
      expect(savedAttendance?.professionalId).toBe('prof-001');
    });
  });

  describe('AgendamentoRealizado -> Billing (Conta a Receber)', () => {
    it('deve criar conta a receber quando evento e publicado', async () => {
      const receivables: Map<string, Receivable> = new Map();
      const tariff: Money = { amount: 15000, currency: 'BRL' };

      const mockRepository: ReceivableRepository = {
        findById: async (id) => receivables.get(id) ?? null,
        findByAppointmentId: async (aptId) => {
          for (const r of receivables.values()) {
            if (r.appointmentId === aptId) return r;
          }
          return null;
        },
        save: async (receivable) => { receivables.set(receivable.id, receivable); },
      };

      const mockTariffResolver: TariffResolver = {
        getTariffForPatient: async () => tariff,
      };

      const useCase: CreateReceivableUseCase = {
        execute: async (input) => {
          const receivable: Receivable = {
            id: crypto.randomUUID(),
            ...input,
            status: 'pending',
            createdAt: new Date(),
          };
          await mockRepository.save(receivable);
          return receivable;
        },
      };

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        createReceivableHandler(useCase, mockTariffResolver),
        'billing'
      );

      const event = createAppointmentCompletedEvent({
        tenantId: 'tenant-123',
        aggregateId: 'attendance-001',
        appointmentId: 'apt-001',
        patientId: 'pat-001',
        professionalId: 'prof-001',
        scheduledAt: new Date('2026-02-17T10:00:00Z'),
        completedAt: new Date('2026-02-17T11:00:00Z'),
        appointmentType: 'psychology',
      });

      await publishEvent(event);

      const savedReceivable = await mockRepository.findByAppointmentId('apt-001');
      expect(savedReceivable).not.toBeNull();
      expect(savedReceivable?.amount.amount).toBe(15000);
      expect(savedReceivable?.status).toBe('pending');
    });
  });

  describe('US-ARQ-06: Retry e transacoes independentes', () => {
    it('deve fazer retry com sucesso apos falhas intermediarias', async () => {
      let attempts = 0;

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        () => {
          attempts++;
          if (attempts < 3) {
            throw new Error('Temporary failure');
          }
        },
        'retry-module'
      );

      const event = createAppointmentCompletedEvent({
        tenantId: 'tenant-123',
        aggregateId: 'agg-1',
        appointmentId: 'apt-1',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        scheduledAt: new Date(),
        completedAt: new Date(),
        appointmentType: 'consultation',
      });

      await publishEvent(event);

      expect(attempts).toBe(3);
      const dlq = eventBus.getDeadLetterQueue();
      expect(dlq.length).toBe(0);
    });

    it('deve registrar numero de tentativas na dead letter queue', async () => {
      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        () => { throw new Error('Persistent failure'); },
        'failing-module'
      );

      const event = createAppointmentCompletedEvent({
        tenantId: 'tenant-123',
        aggregateId: 'agg-1',
        appointmentId: 'apt-1',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        scheduledAt: new Date(),
        completedAt: new Date(),
        appointmentType: 'consultation',
      });

      await publishEvent(event);

      const dlq = eventBus.getDeadLetterQueue();
      expect(dlq.length).toBe(1);
      expect(dlq[0].attempts).toBe(3);
      expect(dlq[0].moduleName).toBe('failing-module');
      expect(dlq[0].error.message).toBe('Persistent failure');
    });

    it('deve executar handlers em transacoes independentes - um falha nao afeta outro', async () => {
      const clinicalCalls: string[] = [];
      const billingCalls: string[] = [];

      const clinicalUseCase: CreateAttendanceUseCase = {
        execute: async () => {
          clinicalCalls.push('executed');
          return {
            id: 'att-1',
            tenantId: 'tenant-1',
            appointmentId: 'apt-1',
            patientId: 'pat-1',
            professionalId: 'prof-1',
            scheduledAt: new Date(),
            completedAt: new Date(),
            appointmentType: 'consultation',
            status: 'completed',
            createdAt: new Date(),
          };
        },
      };

      const tariffResolver: TariffResolver = {
        getTariffForPatient: async () => ({ amount: 10000, currency: 'BRL' }),
      };

      const billingUseCase: CreateReceivableUseCase = {
        execute: async () => {
          billingCalls.push('executed');
          throw new Error('Billing failed');
        },
      };

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        createAttendanceHandler(clinicalUseCase),
        'clinical'
      );

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        createReceivableHandler(billingUseCase, tariffResolver),
        'billing'
      );

      const event = createAppointmentCompletedEvent({
        tenantId: 'tenant-123',
        aggregateId: 'agg-1',
        appointmentId: 'apt-1',
        patientId: 'pat-1',
        professionalId: 'prof-1',
        scheduledAt: new Date(),
        completedAt: new Date(),
        appointmentType: 'consultation',
      });

      await publishEvent(event);

      expect(clinicalCalls).toContain('executed');
      expect(billingCalls).toContain('executed');

      const dlq = eventBus.getDeadLetterQueue();
      expect(dlq.length).toBe(1);
      expect(dlq[0].moduleName).toBe('billing');
    });
  });

  describe('Integracao completa: Scheduling -> Clinical + Billing', () => {
    it('deve criar atendimento e conta a receber sem chamada HTTP', async () => {
      const attendances: Map<string, Attendance> = new Map();
      const receivables: Map<string, Receivable> = new Map();
      const tariff: Money = { amount: 20000, currency: 'BRL' };

      const attendanceRepository: AttendanceRepository = {
        findById: async (id) => attendances.get(id) ?? null,
        findByAppointmentId: async (aptId) => {
          for (const a of attendances.values()) {
            if (a.appointmentId === aptId) return a;
          }
          return null;
        },
        save: async (attendance) => { attendances.set(attendance.id, attendance); },
      };

      const receivableRepository: ReceivableRepository = {
        findById: async (id) => receivables.get(id) ?? null,
        findByAppointmentId: async (aptId) => {
          for (const r of receivables.values()) {
            if (r.appointmentId === aptId) return r;
          }
          return null;
        },
        save: async (receivable) => { receivables.set(receivable.id, receivable); },
      };

      const attendanceUseCase: CreateAttendanceUseCase = {
        execute: async (input) => {
          const attendance: Attendance = {
            id: crypto.randomUUID(),
            ...input,
            status: 'completed',
            createdAt: new Date(),
          };
          await attendanceRepository.save(attendance);
          return attendance;
        },
      };

      const tariffResolver: TariffResolver = {
        getTariffForPatient: async () => tariff,
      };

      const receivableUseCase: CreateReceivableUseCase = {
        execute: async (input) => {
          const receivable: Receivable = {
            id: crypto.randomUUID(),
            ...input,
            status: 'pending',
            createdAt: new Date(),
          };
          await receivableRepository.save(receivable);
          return receivable;
        },
      };

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        createAttendanceHandler(attendanceUseCase),
        'clinical'
      );

      subscribeToEvent(
        APPOINTMENT_COMPLETED_EVENT,
        createReceivableHandler(receivableUseCase, tariffResolver),
        'billing'
      );

      const event = createAppointmentCompletedEvent({
        tenantId: 'tenant-integration',
        aggregateId: 'attendance-int',
        appointmentId: 'apt-int',
        patientId: 'pat-int',
        professionalId: 'prof-int',
        scheduledAt: new Date('2026-02-17T14:00:00Z'),
        completedAt: new Date('2026-02-17T15:00:00Z'),
        appointmentType: 'physiotherapy',
      });

      await publishEvent(event);

      const attendance = await attendanceRepository.findByAppointmentId('apt-int');
      const receivable = await receivableRepository.findByAppointmentId('apt-int');

      expect(attendance).not.toBeNull();
      expect(receivable).not.toBeNull();
      expect(attendance?.tenantId).toBe('tenant-integration');
      expect(receivable?.tenantId).toBe('tenant-integration');
      expect(receivable?.amount.amount).toBe(20000);
    });
  });
});
