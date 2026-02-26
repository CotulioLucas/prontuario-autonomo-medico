/**
 * Use case de login.
 * @see US-BE-F01-01, DR-IA-4
 */

import type { User, UserWithTenant, Tenant } from '../../domain/entities.js';
import type { UserRepository, SessionRepository, TenantRepository } from '../../domain/ports.js';
import {
  InvalidCredentialsError,
  AccountLockedError,
  EmailNotConfirmedError,
} from '../../domain/errors.js';

export interface LoginInput {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginOutput {
  user: User;
  tenant: Tenant;
  sessionToken: string;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
  compare(password: string, hash: string): Promise<boolean>;
}

export interface SessionTokenGenerator {
  generate(userId: string, tenantId: string): string;
}

const MAX_FAILED_ATTEMPTS = 5;
const LOCK_DURATION_MS = 30 * 60 * 1000; // 30 minutes

export class LoginUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly sessionRepository: SessionRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly tokenGenerator: SessionTokenGenerator
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      throw new InvalidCredentialsError();
    }

    if (user.lockedUntil && new Date() < user.lockedUntil) {
      throw new AccountLockedError(user.lockedUntil);
    }

    if (!user.emailConfirmed) {
      throw new EmailNotConfirmedError();
    }

    const isValidPassword = await this.passwordHasher.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      await this.handleFailedLogin(user);
      throw new InvalidCredentialsError();
    }

    if (user.lockedUntil) {
      user.lockedUntil = undefined;
      user.failedLoginAttempts = 0;
      await this.userRepository.update(user);
    }

    const tenant = await this.tenantRepository.findById(user.tenantId);

    if (!tenant) {
      throw new InvalidCredentialsError();
    }

    const sessionToken = this.tokenGenerator.generate(user.id, user.tenantId);
    const expiresAt = new Date(
      Date.now() + (input.rememberMe ? 30 : 1) * 24 * 60 * 60 * 1000
    );

    await this.sessionRepository.save({
      id: crypto.randomUUID(),
      userId: user.id,
      tenantId: user.tenantId,
      token: sessionToken,
      expiresAt,
      createdAt: new Date(),
    });

    return {
      user,
      tenant,
      sessionToken,
    };
  }

  private async handleFailedLogin(user: User): Promise<void> {
    user.failedLoginAttempts += 1;

    if (user.failedLoginAttempts >= MAX_FAILED_ATTEMPTS) {
      user.lockedUntil = new Date(Date.now() + LOCK_DURATION_MS);
    }

    await this.userRepository.update(user);
  }
}
