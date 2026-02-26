/**
 * Rotas HTTP de contas a receber.
 * @see US-BE-F05-01, ADR 0010
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  ListReceivablesUseCase,
  GetReceivableUseCase,
  RecordPaymentUseCase,
  ListPatientReceivablesUseCase,
} from '../../application/use-cases/receivable.use-cases.js';
import type { ReceivableRepository } from '../../domain/receivable.js';
import { BillingError } from '../../domain/errors.js';
import { requireAuth } from '../../../infrastructure/http/middleware/index.js';

export interface ReceivableRoutesConfig {
  receivableRepository: ReceivableRepository;
}

function handleError(reply: FastifyReply, error: unknown): void {
  if (error instanceof BillingError) {
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

export async function receivableRoutes(fastify: FastifyInstance, config: ReceivableRoutesConfig): Promise<void> {
  const listReceivablesUseCase = new ListReceivablesUseCase(config.receivableRepository);
  const getReceivableUseCase = new GetReceivableUseCase(config.receivableRepository);
  const recordPaymentUseCase = new RecordPaymentUseCase(config.receivableRepository);
  const listPatientReceivablesUseCase = new ListPatientReceivablesUseCase(config.receivableRepository);

  fastify.get('/api/v1/receivables', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const query = request.query as {
        startDate?: string;
        endDate?: string;
        patientId?: string;
        professionalId?: string;
        status?: string;
        page?: string;
        limit?: string;
      };

      const result = await listReceivablesUseCase.execute({
        tenantId: user.tenantId,
        startDate: query.startDate ? new Date(query.startDate) : undefined,
        endDate: query.endDate ? new Date(query.endDate) : undefined,
        patientId: query.patientId,
        professionalId: query.professionalId,
        status: query.status as 'pending' | 'paid' | 'partial' | 'cancelled',
        page: query.page ? parseInt(query.page, 10) : 1,
        limit: query.limit ? parseInt(query.limit, 10) : 20,
      });

      return reply.code(200).send(result);
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.get('/api/v1/receivables/:id', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const receivable = await getReceivableUseCase.execute(params.id, user.tenantId);

      return reply.code(200).send({ data: receivable });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.post('/api/v1/receivables/:id/payment', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };
      const body = request.body as {
        paidAt: string;
        paymentMethod: string;
      };

      if (!body.paidAt || !body.paymentMethod) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'paidAt and paymentMethod are required',
          },
        });
      }

      const validPaymentMethods = ['cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'check'];
      if (!validPaymentMethods.includes(body.paymentMethod)) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: `paymentMethod must be one of: ${validPaymentMethods.join(', ')}`,
          },
        });
      }

      const receivable = await recordPaymentUseCase.execute({
        receivableId: params.id,
        tenantId: user.tenantId,
        paidAt: new Date(body.paidAt),
        paymentMethod: body.paymentMethod,
      });

      return reply.code(200).send({
        data: receivable,
        message: 'Payment recorded successfully',
      });
    } catch (error) {
      if (error instanceof BillingError) {
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

  fastify.get('/api/v1/patients/:id/receivables', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      const receivables = await listPatientReceivablesUseCase.execute(params.id, user.tenantId);

      return reply.code(200).send({ data: receivables });
    } catch (error) {
      handleError(reply, error);
    }
  });
}
