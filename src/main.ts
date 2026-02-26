/**
 * Ponto de entrada da aplicacao.
 * @see US-ARQ-00, ADR 0010
 */

import Fastify from 'fastify';
import type { FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { configureAuth, PUBLIC_ROUTES, type SessionResolver, type SessionUser } from './infrastructure/http/middleware/index.js';
import { authRoutes } from './identity/adapters/http/auth.routes.js';
import { teamRoutes } from './identity/adapters/http/team.routes.js';
import {
  PrismaTenantRepository,
  PrismaUserRepository,
  PrismaSessionRepository,
  PrismaInviteRepository,
  PrismaConsentRepository,
  PrismaEmailConfirmationRepository,
  PrismaPasswordResetRepository,
} from './infrastructure/persistence/prisma/index.js';
import { BcryptPasswordHasher, UuidSessionTokenGenerator, ConsoleEmailService } from './infrastructure/auth/index.js';

const fastify = Fastify({
  logger: true,
});

await fastify.register(cors, {
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

await fastify.register(cookie, {
  secret: process.env.SESSION_SECRET || 'your-secret-key-change-in-production',
});

PUBLIC_ROUTES.push(
  '/api/v1/health',
  '/api/v1/auth/login',
  '/api/v1/auth/register/autonomo',
  '/api/v1/auth/register/clinica',
  '/api/v1/auth/confirm-email',
  '/api/v1/auth/resend-confirmation',
  '/api/v1/auth/forgot-password',
  '/api/v1/auth/reset-password',
  '/api/v1/auth/invite-info',
  '/api/v1/auth/accept-invite'
);

const sessionResolver: SessionResolver = async (request: FastifyRequest): Promise<SessionUser | undefined> => {
  const sessionToken = request.cookies.session;
  if (!sessionToken) return undefined;
  
  const sessionRepo = new PrismaSessionRepository();
  const userRepo = new PrismaUserRepository();
  const tenantRepo = new PrismaTenantRepository();
  
  const session = await sessionRepo.findByToken(sessionToken);
  if (!session) return undefined;
  
  if (session.expiresAt < new Date()) {
    await sessionRepo.delete(session.id);
    return undefined;
  }
  
  const user = await userRepo.findById(session.userId);
  if (!user) return undefined;
  
  const tenant = await tenantRepo.findById(user.tenantId);
  if (!tenant) return undefined;
  
  return {
    id: user.id,
    email: user.email,
    tenantId: user.tenantId,
    roles: user.roles,
    tenantType: tenant.type,
  };
};

configureAuth(fastify, {
  sessionResolver,
});

const tenantRepo = new PrismaTenantRepository();
const userRepo = new PrismaUserRepository();
const sessionRepo = new PrismaSessionRepository();
const inviteRepo = new PrismaInviteRepository();
const consentRepo = new PrismaConsentRepository();
const emailConfirmationRepo = new PrismaEmailConfirmationRepository();
const passwordResetRepo = new PrismaPasswordResetRepository();
const passwordHasher = new BcryptPasswordHasher();
const tokenGenerator = new UuidSessionTokenGenerator();
const emailService = new ConsoleEmailService();

await fastify.register(authRoutes, {
  userRepository: userRepo,
  tenantRepository: tenantRepo,
  sessionRepository: sessionRepo,
  consentRepository: consentRepo,
  emailConfirmationRepository: emailConfirmationRepo,
  passwordResetRepository: passwordResetRepo,
  passwordHasher,
  emailService,
  tokenGenerator,
});

await fastify.register(teamRoutes, {
  userRepository: userRepo,
  inviteRepository: inviteRepo,
  tenantRepository: tenantRepo,
  consentRepository: consentRepo,
  emailService,
  passwordHasher,
});

fastify.get('/api/v1/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

fastify.get('/api/v1/auth/invite-info', async (request, reply) => {
  const query = request.query as { token: string };
  
  if (!query.token) {
    return reply.code(400).send({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Token is required',
      },
    });
  }
  
  const invite = await inviteRepo.findByToken(query.token);
  if (!invite) {
    return reply.code(404).send({
      error: {
        code: 'INVITE_NOT_FOUND',
        message: 'Invite not found',
      },
    });
  }
  
  if (invite.expiresAt < new Date()) {
    return reply.code(400).send({
      error: {
        code: 'INVITE_EXPIRED',
        message: 'Invite has expired',
      },
    });
  }
  
  const tenant = await tenantRepo.findById(invite.tenantId);
  const existingUser = await userRepo.findByEmail(invite.email);
  
  return {
    clinica: tenant?.name || '',
    logoUrl: tenant?.logoUrl,
    papel: invite.role,
    email: invite.email,
    usuarioExistente: !!existingUser,
  };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`Server listening on port ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
