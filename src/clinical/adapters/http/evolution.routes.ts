/**
 * Rotas HTTP de evolucao (prontuario).
 * @see US-BE-F04-01, ADR 0010
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  ListPendingRecordsUseCase,
  ListEvolutionsUseCase,
  CreateEvolutionUseCase,
  UpdateEvolutionUseCase,
} from '../../application/use-cases/evolution.use-cases.js';
import type { EvolutionRepository } from '../../domain/evolution.js';
import type { AttendanceRepository } from '../../domain/attendance.js';
import type { PatientLinkRepository, PatientRepository } from '../../domain/index.js';
import { ClinicalError } from '../../domain/errors.js';
import { requireAuth } from '../../../infrastructure/http/middleware/index.js';

export interface EvolutionRoutesConfig {
  evolutionRepository: EvolutionRepository;
  attendanceRepository: AttendanceRepository;
  patientLinkRepository: PatientLinkRepository;
  patientRepository: PatientRepository;
}

function handleError(reply: FastifyReply, error: unknown): void {
  if (error instanceof ClinicalError) {
    const status = error.code.includes('NOT_FOUND') ? 404 : 
                   error.code.includes('NOT_AUTHORIZED') ? 403 : 400;
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

export async function evolutionRoutes(fastify: FastifyInstance, config: EvolutionRoutesConfig): Promise<void> {
  const listPendingRecordsUseCase = new ListPendingRecordsUseCase(
    config.attendanceRepository,
    config.evolutionRepository,
    config.patientRepository
  );

  const listEvolutionsUseCase = new ListEvolutionsUseCase(
    config.evolutionRepository,
    config.patientRepository
  );

  const createEvolutionUseCase = new CreateEvolutionUseCase(
    config.evolutionRepository,
    config.attendanceRepository,
    config.patientLinkRepository
  );

  const updateEvolutionUseCase = new UpdateEvolutionUseCase(
    config.evolutionRepository,
    config.patientLinkRepository
  );

  fastify.get('/api/v1/patients/:id/pending-records', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const pendingRecords = await listPendingRecordsUseCase.execute({
        patientId: params.id,
        tenantId: user.tenantId,
      });

      return reply.code(200).send({ data: pendingRecords });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.get('/api/v1/patients/:id/records', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const evolutions = await listEvolutionsUseCase.execute(params.id, user.tenantId);

      return reply.code(200).send({ data: evolutions });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.post('/api/v1/appointments/:id/record', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };
      const body = request.body as {
        content: string;
      };

      if (!body.content || body.content.trim().length === 0) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Content is required',
          },
        });
      }

      const attendance = await config.attendanceRepository.findByAppointmentId(params.id);
      if (!attendance || attendance.tenantId !== user.tenantId) {
        return reply.code(404).send({
          error: {
            code: 'ATTENDANCE_NOT_FOUND',
            message: 'Attendance not found for this appointment',
          },
        });
      }

      const evolution = await createEvolutionUseCase.execute({
        tenantId: user.tenantId,
        attendanceId: attendance.id,
        patientId: attendance.patientId,
        professionalId: user.id,
        content: body.content,
      });

      return reply.code(201).send({ data: evolution });
    } catch (error) {
      if (error instanceof ClinicalError) {
        const status = error.code.includes('NOT_FOUND') ? 404 : 
                       error.code.includes('NOT_AUTHORIZED') ? 403 : 400;
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

  fastify.put('/api/v1/evolutions/:id', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };
      const body = request.body as {
        content: string;
      };

      if (!body.content || body.content.trim().length === 0) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Content is required',
          },
        });
      }

      const evolution = await updateEvolutionUseCase.execute(
        params.id,
        user.tenantId,
        user.id,
        body.content
      );

      return reply.code(200).send({ data: evolution });
    } catch (error) {
      if (error instanceof ClinicalError) {
        const status = error.code.includes('NOT_FOUND') ? 404 : 
                       error.code.includes('NOT_AUTHORIZED') ? 403 : 400;
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
