/**
 * Utilitários e tipos relacionados a tenantId (isolamento multi-tenant).
 * Uso: contexto de requisição, sessão; nunca aceito no body em rotas que alteram dados.
 * @see ADR 0002, DR-IA-4
 */

import type { TenantId, UserId } from './types.js';

export interface RequestContext {
  tenantId: TenantId;
  userId: UserId;
  roles?: string[];
}
