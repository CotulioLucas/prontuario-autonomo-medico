/**
 * Infraestrutura HTTP - Fastify.
 * @see US-ARQ-02, US-ARQ-05
 */

export {
  runWithContext,
  setContext,
  clearContext,
  getRequestContext,
  hasContext,
  requireTenantId,
  requireUserId,
  requireRoles,
  hasRole,
  isTenantType,
  type AuthenticatedContext,
} from './context.js';

export * from './middleware/index.js';
