/**
 * Rotas HTTP de gestao de equipe.
 * @see US-BE-F01-06, US-BE-F01-07, ADR 0010
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  CreateInviteUseCase,
  ListMembersUseCase,
  ResendInviteUseCase,
  RevokeInviteUseCase,
  UpdateMemberRoleUseCase,
  DeactivateMemberUseCase,
  ListProfessionalsUseCase,
  AcceptInviteUseCase,
  type EmailService,
  type PasswordHasher,
} from '../../application/index.js';
import type { UserRepository, InviteRepository, TenantRepository, ConsentRepository } from '../../domain/index.js';
import { IdentityError } from '../../domain/errors.js';
import { requireAuth, requireRole } from '../../../infrastructure/http/middleware/index.js';

export interface TeamRoutesConfig {
  userRepository: UserRepository;
  inviteRepository: InviteRepository;
  tenantRepository: TenantRepository;
  consentRepository: ConsentRepository;
  emailService: EmailService;
  passwordHasher: PasswordHasher;
}

function handleError(reply: FastifyReply, error: unknown): void {
  if (error instanceof IdentityError) {
    const code = error.code.includes('NOT_ALLOWED') || error.code.includes('PERMISSION') ? 403 : 400;
    reply.code(code).send({
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

export async function teamRoutes(fastify: FastifyInstance, config: TeamRoutesConfig): Promise<void> {
  const createInviteUseCase = new CreateInviteUseCase(
    config.inviteRepository,
    config.userRepository,
    config.tenantRepository,
    config.emailService
  );

  const listMembersUseCase = new ListMembersUseCase(
    config.userRepository,
    config.inviteRepository
  );

  const resendInviteUseCase = new ResendInviteUseCase(
    config.inviteRepository,
    config.userRepository,
    config.tenantRepository,
    config.emailService
  );

  const revokeInviteUseCase = new RevokeInviteUseCase(config.inviteRepository);

  const updateMemberRoleUseCase = new UpdateMemberRoleUseCase(
    config.userRepository,
    config.tenantRepository
  );

  const deactivateMemberUseCase = new DeactivateMemberUseCase(config.userRepository);

  const listProfessionalsUseCase = new ListProfessionalsUseCase(config.userRepository);

  const acceptInviteUseCase = new AcceptInviteUseCase(
    config.userRepository,
    config.inviteRepository,
    config.consentRepository,
    config.passwordHasher
  );

  fastify.post('/api/v1/auth/accept-invite', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as {
        token: string;
        name?: string;
        password?: string;
        phone?: string;
        document?: string;
        lgpdConsentVersion?: string;
      };

      if (!body.token) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token is required',
          },
        });
      }

      const isNewUser = !!(body.name && body.password);

      const result = await acceptInviteUseCase.execute({
        token: body.token,
        isNewUser,
        name: body.name,
        password: body.password,
        phone: body.phone,
        document: body.document,
        lgpdConsentVersion: body.lgpdConsentVersion,
      });

      return reply.code(200).send({
        message: 'Invite accepted successfully',
        isNewUser: result.isNewUser,
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          roles: result.user.roles,
        },
      });
    } catch (error) {
      if (error instanceof IdentityError) {
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

  fastify.get('/api/v1/team/members', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const result = await listMembersUseCase.execute({ tenantId: user.tenantId });

      return reply.code(200).send(result);
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.post('/api/v1/team/invites', {
    preHandler: [requireAuth, requireRole('admin')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const body = request.body as {
        email: string;
        role: string;
      };

      if (!body.email || !body.role) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and role are required',
          },
        });
      }

      const result = await createInviteUseCase.execute({
        tenantId: user.tenantId,
        email: body.email,
        role: body.role as 'admin' | 'professional' | 'receptionist' | 'financial',
        invitedBy: user.id,
      });

      return reply.code(201).send({
        invite: {
          id: result.invite.id,
          email: result.invite.email,
          role: result.invite.role,
          expiresAt: result.invite.expiresAt,
        },
      });
    } catch (error) {
      if (error instanceof IdentityError) {
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

  fastify.post('/api/v1/team/invites/:id/resend', {
    preHandler: [requireAuth, requireRole('admin')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      await resendInviteUseCase.execute({
        inviteId: params.id,
        tenantId: user.tenantId,
      });

      return reply.code(200).send({ message: 'Invite resent' });
    } catch (error) {
      if (error instanceof IdentityError) {
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

  fastify.delete('/api/v1/team/invites/:id', {
    preHandler: [requireAuth, requireRole('admin')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      await revokeInviteUseCase.execute({
        inviteId: params.id,
        tenantId: user.tenantId,
      });

      return reply.code(200).send({ message: 'Invite revoked' });
    } catch (error) {
      if (error instanceof IdentityError) {
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

  fastify.put('/api/v1/team/members/:id/role', {
    preHandler: [requireAuth, requireRole('admin')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };
      const body = request.body as { role: string };

      if (!body.role) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Role is required',
          },
        });
      }

      await updateMemberRoleUseCase.execute({
        memberId: params.id,
        tenantId: user.tenantId,
        role: body.role as 'admin' | 'professional' | 'receptionist' | 'financial',
      });

      return reply.code(200).send({ message: 'Role updated' });
    } catch (error) {
      if (error instanceof IdentityError) {
        const code = error.code.includes('NOT_ALLOWED') ? 403 : 400;
        return reply.code(code).send({
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      handleError(reply, error);
    }
  });

  fastify.put('/api/v1/team/members/:id/deactivate', {
    preHandler: [requireAuth, requireRole('admin')],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const params = request.params as { id: string };

      await deactivateMemberUseCase.execute({
        memberId: params.id,
        tenantId: user.tenantId,
      });

      return reply.code(200).send({ message: 'Member deactivated' });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.get('/api/v1/team/professionals', {
    preHandler: [requireAuth],
  }, async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const user = request.user!;
      const result = await listProfessionalsUseCase.execute({ tenantId: user.tenantId });

      return reply.code(200).send(result);
    } catch (error) {
      handleError(reply, error);
    }
  });
}
