/**
 * Rotas HTTP de gestao de pacientes.
 * @see US-BE-F02-01, US-BE-F02-02, ADR 0010
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  ListPatientsUseCase,
  GetPatientUseCase,
  CreatePatientUseCase,
  UpdatePatientUseCase,
} from '../../application/use-cases/patient.use-cases.js';
import {
  ListPatientLinksUseCase,
  CreatePatientLinkUseCase,
  UpdatePatientLinkUseCase,
  DeletePatientLinkUseCase,
} from '../../application/use-cases/patient-link.use-cases.js';
import type { PatientRepository, PatientLinkRepository } from '../../domain/index.js';
import { ClinicalError } from '../../domain/errors.js';
import { requireAuth } from '../../../infrastructure/http/middleware/index.js';

export interface PatientRoutesConfig {
  patientRepository: PatientRepository;
  patientLinkRepository: PatientLinkRepository;
}

function handleError(reply: FastifyReply, error: unknown): void {
  if (error instanceof ClinicalError) {
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

export async function patientRoutes(fastify: FastifyInstance, config: PatientRoutesConfig): Promise<void> {
  const listPatientsUseCase = new ListPatientsUseCase(config.patientRepository);
  const getPatientUseCase = new GetPatientUseCase(config.patientRepository);
  const createPatientUseCase = new CreatePatientUseCase(config.patientRepository);
  const updatePatientUseCase = new UpdatePatientUseCase(config.patientRepository);

  const listPatientLinksUseCase = new ListPatientLinksUseCase(
    config.patientLinkRepository,
    config.patientRepository
  );
  const createPatientLinkUseCase = new CreatePatientLinkUseCase(
    config.patientLinkRepository,
    config.patientRepository
  );
  const updatePatientLinkUseCase = new UpdatePatientLinkUseCase(config.patientLinkRepository);
  const deletePatientLinkUseCase = new DeletePatientLinkUseCase(config.patientLinkRepository);

  fastify.get('/api/v1/patients', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const query = request.query as {
        search?: string;
        page?: string;
        limit?: string;
      };

      const result = await listPatientsUseCase.execute({
        tenantId: user.tenantId,
        search: query.search,
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
      });

      return reply.code(200).send(result);
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.get('/api/v1/patients/:id', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const patient = await getPatientUseCase.execute(params.id, user.tenantId);

      return reply.code(200).send({ data: patient });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.post('/api/v1/patients', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const body = request.body as {
        name: string;
        email?: string;
        phone: string;
        document?: string;
        birthDate?: string;
        gender?: 'male' | 'female' | 'other';
        address?: {
          street: string;
          number: string;
          complement?: string;
          neighborhood?: string;
          city: string;
          state: string;
          zipCode: string;
        };
        notes?: string;
      };

      if (!body.name || !body.phone) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Name and phone are required',
          },
        });
      }

      const patient = await createPatientUseCase.execute({
        tenantId: user.tenantId,
        name: body.name,
        email: body.email,
        phone: body.phone,
        document: body.document,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        gender: body.gender,
        address: body.address,
        notes: body.notes,
      });

      return reply.code(201).send({ data: patient });
    } catch (error) {
      if (error instanceof ClinicalError) {
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

  fastify.put('/api/v1/patients/:id', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };
      const body = request.body as {
        name?: string;
        email?: string;
        phone?: string;
        document?: string;
        birthDate?: string;
        gender?: 'male' | 'female' | 'other';
        address?: {
          street: string;
          number: string;
          complement?: string;
          neighborhood?: string;
          city: string;
          state: string;
          zipCode: string;
        };
        notes?: string;
        status?: 'active' | 'inactive';
      };

      const patient = await updatePatientUseCase.execute(params.id, user.tenantId, {
        name: body.name,
        email: body.email,
        phone: body.phone,
        document: body.document,
        birthDate: body.birthDate ? new Date(body.birthDate) : undefined,
        gender: body.gender,
        address: body.address,
        notes: body.notes,
        status: body.status,
      });

      return reply.code(200).send({ data: patient });
    } catch (error) {
      if (error instanceof ClinicalError) {
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

  fastify.get('/api/v1/patients/:id/links', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const links = await listPatientLinksUseCase.execute(params.id, user.tenantId);

      return reply.code(200).send({ data: links });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.post('/api/v1/patients/:id/links', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };
      const body = request.body as {
        professionalId?: string;
        tariff: {
          amount: number;
          currency: string;
          type: 'session' | 'hour';
        };
      };

      if (!body.tariff || body.tariff.amount <= 0) {
        return reply.code(400).send({
          error: {
            code: 'TARIFF_REQUIRED',
            message: 'Tariff is required',
          },
        });
      }

      const professionalId = body.professionalId ?? user.id;

      const link = await createPatientLinkUseCase.execute({
        tenantId: user.tenantId,
        patientId: params.id,
        professionalId,
        tariff: body.tariff,
      });

      return reply.code(201).send({ data: link });
    } catch (error) {
      if (error instanceof ClinicalError) {
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

  fastify.put('/api/v1/patients/:patientId/links/:linkId', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { patientId: string; linkId: string };
      const body = request.body as {
        tariff?: {
          amount: number;
          currency: string;
          type: 'session' | 'hour';
        };
        active?: boolean;
      };

      const link = await updatePatientLinkUseCase.execute({
        linkId: params.linkId,
        tenantId: user.tenantId,
        data: {
          tariff: body.tariff,
          active: body.active,
        },
      });

      return reply.code(200).send({ data: link });
    } catch (error) {
      if (error instanceof ClinicalError) {
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

  fastify.delete('/api/v1/patients/:patientId/links/:linkId', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { patientId: string; linkId: string };

      await deletePatientLinkUseCase.execute(params.linkId, user.tenantId);

      return reply.code(200).send({ message: 'Link deleted' });
    } catch (error) {
      if (error instanceof ClinicalError) {
        return reply.code(404).send({
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
