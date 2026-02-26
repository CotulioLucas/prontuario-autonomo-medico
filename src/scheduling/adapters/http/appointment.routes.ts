/**
 * Rotas HTTP de agendamentos.
 * @see US-BE-F03-01, US-BE-F03-02, ADR 0010
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  ListAppointmentsUseCase,
  GetAppointmentUseCase,
  CheckOverlapUseCase,
  CreateAppointmentUseCase,
  UpdateAppointmentUseCase,
  CancelAppointmentUseCase,
  ConfirmAppointmentUseCase,
} from '../../application/use-cases/appointment.use-cases.js';
import { CompleteAppointmentUseCase } from '../../application/use-cases/complete-appointment.use-case.js';
import type { AppointmentRepository } from '../../domain/appointment.js';
import type { PatientLinkRepository } from '../../../clinical/domain/patient-link.js';
import { SchedulingError } from '../../domain/errors.js';
import { requireAuth } from '../../../infrastructure/http/middleware/index.js';

export interface AppointmentRoutesConfig {
  appointmentRepository: AppointmentRepository;
  patientLinkRepository: PatientLinkRepository;
}

function handleError(reply: FastifyReply, error: unknown): void {
  if (error instanceof SchedulingError) {
    const status = error.code.includes('NOT_FOUND') ? 404 : 400;
    reply.code(status).send({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  reply.code(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

export async function appointmentRoutes(fastify: FastifyInstance, config: AppointmentRoutesConfig): Promise<void> {
  const listAppointmentsUseCase = new ListAppointmentsUseCase(config.appointmentRepository);
  const getAppointmentUseCase = new GetAppointmentUseCase(config.appointmentRepository);
  const checkOverlapUseCase = new CheckOverlapUseCase(config.appointmentRepository);
  const createAppointmentUseCase = new CreateAppointmentUseCase(
    config.appointmentRepository,
    config.patientLinkRepository
  );
  const updateAppointmentUseCase = new UpdateAppointmentUseCase(
    config.appointmentRepository,
    config.patientLinkRepository
  );
  const cancelAppointmentUseCase = new CancelAppointmentUseCase(config.appointmentRepository);
  const confirmAppointmentUseCase = new ConfirmAppointmentUseCase(config.appointmentRepository);
  const completeAppointmentUseCase = new CompleteAppointmentUseCase(config.appointmentRepository);

  fastify.get('/api/v1/appointments', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const query = request.query as {
        startDate?: string;
        endDate?: string;
        date?: string;
        professionalId?: string;
        patientId?: string;
        status?: string;
      };

      const appointments = await listAppointmentsUseCase.execute({
        tenantId: user.tenantId,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        date: query.date ? new Date(query.date) : undefined,
        professionalId: query.professionalId,
        patientId: query.patientId,
        status: query.status as 'scheduled' | 'confirmed' | 'completed' | 'cancelled',
      });

      return reply.code(200).send({ data: appointments });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.get('/api/v1/appointments/check-overlap', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const query = request.query as {
        professionalId: string;
        date: string;
        startTime: string;
        duration: string;
        excludeId?: string;
      };

      if (!query.professionalId || !query.date || !query.startTime || !query.duration) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'professionalId, date, startTime and duration are required',
          },
        });
      }

      const result = await checkOverlapUseCase.execute({
        tenantId: user.tenantId,
        professionalId: query.professionalId,
        date: new Date(query.date),
        startTime: query.startTime,
        duration: parseInt(query.duration, 10),
        excludeId: query.excludeId,
      });

      return reply.code(200).send({
        hasOverlap: result.hasOverlap,
        conflictingAppointment: result.conflictingAppointment,
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.get('/api/v1/appointments/:id', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const appointment = await getAppointmentUseCase.execute({
        id: params.id,
        tenantId: user.tenantId,
      });

      return reply.code(200).send({ data: appointment });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.post('/api/v1/appointments', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const body = request.body as {
        patientId: string;
        professionalId?: string;
        date: string;
        startTime: string;
        duration: number;
        type: string;
        notes?: string;
      };

      if (!body.patientId || !body.date || !body.startTime || !body.duration || !body.type) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'patientId, date, startTime, duration and type are required',
          },
        });
      }

      const professionalId = body.professionalId ?? user.id;

      const appointment = await createAppointmentUseCase.execute({
        tenantId: user.tenantId,
        patientId: body.patientId,
        professionalId,
        date: new Date(body.date),
        startTime: body.startTime,
        duration: body.duration,
        type: body.type as 'consultation' | 'psychology' | 'physiotherapy' | 'return' | 'other',
        notes: body.notes,
      });

      return reply.code(201).send({ data: appointment });
    } catch (error) {
      if (error instanceof SchedulingError) {
        return reply.code(400).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      handleError(reply, error);
    }
  });

  fastify.put('/api/v1/appointments/:id', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };
      const body = request.body as {
        patientId?: string;
        professionalId?: string;
        date?: string;
        startTime?: string;
        duration?: number;
        type?: string;
        notes?: string;
      };

      const appointment = await updateAppointmentUseCase.execute(params.id, user.tenantId, {
        patientId: body.patientId,
        professionalId: body.professionalId,
        date: body.date ? new Date(body.date) : undefined,
        startTime: body.startTime,
        duration: body.duration,
        type: body.type as 'consultation' | 'psychology' | 'physiotherapy' | 'return' | 'other',
        notes: body.notes,
      });

      return reply.code(200).send({ data: appointment });
    } catch (error) {
      if (error instanceof SchedulingError) {
        const status = error.code.includes('NOT_FOUND') ? 404 : 400;
        return reply.code(status).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      handleError(reply, error);
    }
  });

  fastify.put('/api/v1/appointments/:id/confirm', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const appointment = await confirmAppointmentUseCase.execute(params.id, user.tenantId);

      return reply.code(200).send({ data: appointment });
    } catch (error) {
      if (error instanceof SchedulingError) {
        const status = error.code.includes('NOT_FOUND') ? 404 : 400;
        return reply.code(status).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      handleError(reply, error);
    }
  });

  fastify.put('/api/v1/appointments/:id/cancel', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const appointment = await cancelAppointmentUseCase.execute(params.id, user.tenantId);

      return reply.code(200).send({ data: appointment });
    } catch (error) {
      if (error instanceof SchedulingError) {
        const status = error.code.includes('NOT_FOUND') ? 404 : 400;
        return reply.code(status).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      handleError(reply, error);
    }
  });

  fastify.put('/api/v1/appointments/:id/complete', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const appointment = await completeAppointmentUseCase.execute(params.id, user.tenantId, user.id);

      return reply.code(200).send({
        data: appointment,
        message: 'Appointment completed. Attendance and receivable created.',
      });
    } catch (error) {
      if (error instanceof SchedulingError) {
        const status = error.code.includes('NOT_FOUND') ? 404 : 400;
        return reply.code(status).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      handleError(reply, error);
    }
  });
}
