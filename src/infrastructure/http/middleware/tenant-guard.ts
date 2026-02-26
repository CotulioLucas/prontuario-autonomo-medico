/**
 * Middleware que rejeita tenantId no body de requisicoes que alteram dados.
 * Garante isolamento multi-tenant - tenantId SEMPRE da sessao.
 * @see ADR 0002, DR-IA-4, US-ARQ-02
 */

import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';

const TENANT_ID_FIELDS = ['tenantId', 'tenant_id', 'TenantId', 'tenantID'];
const WRITE_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

function hasTenantIdInObject(obj: unknown, depth = 0): boolean {
  if (depth > 5) return false;
  if (!obj || typeof obj !== 'object') return false;

  const record = obj as Record<string, unknown>;

  for (const field of TENANT_ID_FIELDS) {
    if (field in record) {
      return true;
    }
  }

  for (const value of Object.values(record)) {
    if (typeof value === 'object' && value !== null) {
      if (hasTenantIdInObject(value, depth + 1)) {
        return true;
      }
    }
  }

  return false;
}

export function rejectTenantIdInBody(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction
): void {
  if (!WRITE_METHODS.includes(request.method)) {
    return done();
  }

  if (request.body && hasTenantIdInObject(request.body)) {
    void reply.code(400).send({
      error: {
        code: 'TENANT_ID_NOT_ALLOWED',
        message: 'tenantId must not be provided in request body. It is resolved from session.',
      },
    });
    return;
  }

  done();
}
