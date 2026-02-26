/**
 * Middlewares HTTP para Fastify.
 * @see US-ARQ-02, US-ARQ-05
 */

export {
  authMiddleware,
  requireAuth,
  requireRole,
  requireRoles,
  requireAdmin,
  setSessionResolver,
  getSessionResolver,
  configureAuth,
  PUBLIC_ROUTES,
  type SessionUser,
  type SessionResolver,
  type AuthConfig,
} from './auth.js';
export { rejectTenantIdInBody } from './tenant-guard.js';
