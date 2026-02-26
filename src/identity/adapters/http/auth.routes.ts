/**
 * Rotas HTTP de autenticacao.
 * @see US-BE-F01-01 a US-BE-F01-05, ADR 0010
 */

import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import {
  LoginUseCase,
  RegisterAutonomousUseCase,
  RegisterClinicUseCase,
  ConfirmEmailUseCase,
  ResendConfirmationUseCase,
  ForgotPasswordUseCase,
  ResetPasswordUseCase,
  type PasswordHasher,
  type EmailService,
  type SessionTokenGenerator,
} from '../../application/index.js';
import type { UserRepository, TenantRepository, SessionRepository, ConsentRepository, EmailConfirmationRepository, PasswordResetRepository } from '../../domain/index.js';
import { IdentityError } from '../../domain/errors.js';

export interface AuthRoutesConfig {
  userRepository: UserRepository;
  tenantRepository: TenantRepository;
  sessionRepository: SessionRepository;
  consentRepository: ConsentRepository;
  emailConfirmationRepository: EmailConfirmationRepository;
  passwordResetRepository: PasswordResetRepository;
  passwordHasher: PasswordHasher;
  emailService: EmailService;
  tokenGenerator: SessionTokenGenerator;
}

function handleError(reply: FastifyReply, error: unknown): void {
  if (error instanceof IdentityError) {
    reply.code(401).send({
      error: {
        code: error.code,
        message: error.message,
      },
    });
    return;
  }

  if (error instanceof Error) {
    if (error.message.includes('Invalid') || error.message.includes('required')) {
      reply.code(400).send({
        error: {
          code: 'VALIDATION_ERROR',
          message: error.message,
        },
      });
      return;
    }
  }

  reply.code(500).send({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

export async function authRoutes(fastify: FastifyInstance, config: AuthRoutesConfig): Promise<void> {
  const loginUseCase = new LoginUseCase(
    config.userRepository,
    config.tenantRepository,
    config.sessionRepository,
    config.passwordHasher,
    config.tokenGenerator
  );

  const registerAutonomousUseCase = new RegisterAutonomousUseCase(
    config.tenantRepository,
    config.userRepository,
    config.consentRepository,
    config.emailConfirmationRepository,
    config.passwordHasher,
    config.emailService
  );

  const registerClinicUseCase = new RegisterClinicUseCase(
    config.tenantRepository,
    config.userRepository,
    config.consentRepository,
    config.emailConfirmationRepository,
    config.passwordHasher,
    config.emailService
  );

  const confirmEmailUseCase = new ConfirmEmailUseCase(
    config.emailConfirmationRepository,
    config.userRepository
  );

  const resendConfirmationUseCase = new ResendConfirmationUseCase(
    config.userRepository,
    config.emailConfirmationRepository,
    config.emailService
  );

  const forgotPasswordUseCase = new ForgotPasswordUseCase(
    config.userRepository,
    config.passwordResetRepository,
    config.emailService
  );

  const resetPasswordUseCase = new ResetPasswordUseCase(
    config.userRepository,
    config.passwordResetRepository,
    config.passwordHasher
  );

  fastify.post('/api/v1/auth/login', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as {
        email: string;
        password: string;
        rememberMe?: boolean;
      };

      if (!body.email || !body.password) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email and password are required',
          },
        });
      }

      const result = await loginUseCase.execute({
        email: body.email,
        password: body.password,
        rememberMe: body.rememberMe,
      });

      reply.header('Set-Cookie', `session=${result.sessionToken}; HttpOnly; ${process.env.NODE_ENV === 'production' ? 'Secure; ' : ''}Max-Age=${body.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60}; Path=/; SameSite=Strict`);

      return reply.code(200).send({
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          roles: result.user.roles,
        },
        tenant: {
          id: result.tenant.id,
          type: result.tenant.type,
          name: result.tenant.name,
        },
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.post('/api/v1/auth/register/autonomo', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as {
        name: string;
        email: string;
        phone: string;
        cpf: string;
        password: string;
        professionalInfo: { specialty: string; registerNumber?: string; registerType?: string };
        lgpdConsentVersion: string;
      };

      if (!body.name || !body.email || !body.cpf || !body.password || !body.lgpdConsentVersion) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Required fields missing',
          },
        });
      }

      const result = await registerAutonomousUseCase.execute({
        name: body.name,
        email: body.email,
        phone: body.phone,
        cpf: body.cpf,
        password: body.password,
        professionalInfo: {
          specialty: body.professionalInfo.specialty,
          registerNumber: body.professionalInfo.registerNumber,
          registerType: body.professionalInfo.registerType as 'CRM' | 'CRP' | 'CREFITO' | 'OUTRO' | undefined,
        },
        lgpdConsentVersion: body.lgpdConsentVersion,
      });

      return reply.code(201).send({
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
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

  fastify.post('/api/v1/auth/register/clinica', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as {
        companyName: string;
        cnpj: string;
        address: { street: string; number: string; city: string; state: string; zipCode: string };
        phone: string;
        adminName: string;
        adminEmail: string;
        adminPassword: string;
        lgpdConsentVersion: string;
      };

      if (!body.companyName || !body.cnpj || !body.adminName || !body.adminEmail || !body.adminPassword) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Required fields missing',
          },
        });
      }

      const result = await registerClinicUseCase.execute({
        companyName: body.companyName,
        cnpj: body.cnpj,
        address: body.address,
        phone: body.phone,
        adminName: body.adminName,
        adminEmail: body.adminEmail,
        adminPassword: body.adminPassword,
        lgpdConsentVersion: body.lgpdConsentVersion,
      });

      return reply.code(201).send({
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
        },
        tenant: {
          id: result.tenant.id,
          name: result.tenant.name,
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

  fastify.get('/api/v1/auth/confirm-email', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const query = request.query as { token: string };

      if (!query.token) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Token is required',
          },
        });
      }

      await confirmEmailUseCase.execute({ token: query.token });

      return reply.code(200).send({
        status: 'success',
        message: 'Email confirmed successfully',
      });
    } catch (error) {
      if (error instanceof IdentityError) {
        const status = error.code === 'TOKEN_EXPIRED' ? 'expired' : 'error';
        return reply.code(400).send({
          status,
          error: {
            code: error.code,
            message: error.message,
          },
        });
      }
      handleError(reply, error);
    }
  });

  fastify.post('/api/v1/auth/resend-confirmation', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as { email: string };

      if (!body.email) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required',
          },
        });
      }

      await resendConfirmationUseCase.execute({ email: body.email });

      return reply.code(200).send({
        message: 'Confirmation email sent',
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

  fastify.post('/api/v1/auth/forgot-password', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as { email: string };

      if (!body.email) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Email is required',
          },
        });
      }

      await forgotPasswordUseCase.execute({ email: body.email });

      return reply.code(200).send({
        message: 'If the email exists, a password reset link has been sent',
      });
    } catch (error) {
      handleError(reply, error);
    }
  });

  fastify.put('/api/v1/auth/reset-password', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = request.body as {
        token: string;
        newPassword: string;
        confirmPassword: string;
      };

      if (!body.token || !body.newPassword || !body.confirmPassword) {
        return reply.code(400).send({
          error: {
            code: 'VALIDATION_ERROR',
            message: 'All fields are required',
          },
        });
      }

      await resetPasswordUseCase.execute({
        token: body.token,
        newPassword: body.newPassword,
        confirmPassword: body.confirmPassword,
      });

      return reply.code(200).send({
        message: 'Password reset successfully',
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
}
