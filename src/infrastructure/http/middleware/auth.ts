/**
 * Middleware de autenticacao e resolucao de tenant para Fastify.
 * Resolve tenantId e userId da sessao - NUNCA do body.
 * @see ADR 0002, DR-IA-4, ADR 0010, US-ARQ-02, US-ARQ-05
 */

import type { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify';
import { setContext, type AuthenticatedContext } from '../context.js';

export interface SessionUser {
  id: string;
  email: string;
  tenantId: string;
  roles: string[];
  tenantType: 'autonomous' | 'clinic';
}

export type SessionResolver = (request: FastifyRequest) => SessionUser | undefined | Promise<SessionUser | undefined>;

declare module 'fastify' {
  interface FastifyRequest {
    user?: SessionUser;
  }
}

export const PUBLIC_ROUTES = [
  '/api/v1/auth/login',
  '/api/v1/auth/register',
  '/api/v1/auth/register/autonomo',
  '/api/v1/auth/register/clinica',
  '/api/v1/auth/confirm-email',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/resend-confirmation',
  '/health',
  '/',
];

function isPublicRoute(path: string): boolean {
  const pathname = path.split('?')[0];
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(route + '/'));
}

let sessionResolver: SessionResolver | null = null;

export function setSessionResolver(resolver: SessionResolver): void {
  sessionResolver = resolver;
}

export function getSessionResolver(): SessionResolver | null {
  return sessionResolver;
}

export async function authMiddleware(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  if (isPublicRoute(request.url)) {
    return;
  }

  if (!sessionResolver) {
    return reply.code(500).send({
      error: {
        code: 'SESSION_RESOLVER_NOT_CONFIGURED',
        message: 'Session resolver not configured. Call setSessionResolver() before using auth middleware.',
      },
    });
  }

  const session = await sessionResolver(request);

  if (!session) {
    return reply.code(401).send({
      error: {
        code: 'UNAUTHORIZED',
        message: 'Authentication required',
      },
    });
  }

  request.user = session;

  const ctx: AuthenticatedContext = {
    tenantId: session.tenantId,
    userId: session.id,
    roles: session.roles,
    email: session.email,
    tenantType: session.tenantType,
  };

  setContext(ctx);
}

export function requireAuth(request: FastifyRequest): SessionUser {
  if (!request.user) {
    const error = new Error('Unauthorized: user not authenticated') as Error & { statusCode?: number };
    error.statusCode = 401;
    throw error;
  }
  return request.user;
}

export function requireRole(role: string) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    if (!request.user?.roles.includes(role)) {
      return reply.code(403).send({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions',
        },
      });
    }
  };
}

export function requireRoles(...roles: string[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const hasRole = roles.some((role) => request.user?.roles.includes(role));
    if (!hasRole) {
      return reply.code(403).send({
        error: {
          code: 'FORBIDDEN',
          message: 'Insufficient permissions. Required roles: ' + roles.join(', '),
        },
      });
    }
  };
}

export function requireAdmin() {
  return requireRole('admin');
}

export interface AuthConfig {
  sessionResolver: SessionResolver;
  publicRoutes?: string[];
}

export function configureAuth(fastify: FastifyInstance, config: AuthConfig): void {
  setSessionResolver(config.sessionResolver);

  if (config.publicRoutes) {
    PUBLIC_ROUTES.push(...config.publicRoutes);
  }

  fastify.addHook('preHandler', authMiddleware);
}
