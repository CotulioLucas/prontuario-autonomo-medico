/**
 * Evento de domínio: AgendamentoRealizado.
 * Publicado quando um agendamento é marcado como realizado.
 * Consumidores: clinical (cria Atendimento), billing (cria Conta a receber).
 * @see ADR 0004, docs/domain/domain-events.md, US-ARQ-03
 */

import type { DomainEventBase } from '../../shared/events.js';
import type { TenantId, UserId } from '../../shared/types.js';

export const APPOINTMENT_COMPLETED_EVENT = 'AgendamentoRealizado' as const;

export interface AppointmentCompletedEvent extends DomainEventBase {
  readonly eventName: typeof APPOINTMENT_COMPLETED_EVENT;
  readonly appointmentId: string;
  readonly patientId: string;
  readonly professionalId: UserId;
  readonly scheduledAt: Date;
  readonly completedAt: Date;
  readonly appointmentType: string;
  readonly triggeredBy?: UserId;
}

export function createAppointmentCompletedEvent(payload: {
  tenantId: TenantId;
  aggregateId: string;
  appointmentId: string;
  patientId: string;
  professionalId: UserId;
  scheduledAt: Date;
  completedAt: Date;
  appointmentType: string;
  triggeredBy?: UserId;
}): AppointmentCompletedEvent {
  return {
    eventName: APPOINTMENT_COMPLETED_EVENT,
    occurredAt: new Date(),
    ...payload,
  };
}
