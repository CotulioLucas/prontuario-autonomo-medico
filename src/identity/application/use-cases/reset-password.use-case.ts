/**
 * Use case de redefinicao de senha.
 * @see US-BE-F01-05
 */

import type { UserRepository, PasswordResetRepository } from '../../domain/ports.js';
import { InvalidTokenError, TokenExpiredError } from '../../domain/errors.js';

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ResetPasswordOutput {
  success: boolean;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export class ResetPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: ResetPasswordInput): Promise<ResetPasswordOutput> {
    if (input.newPassword !== input.confirmPassword) {
      throw new Error('Passwords do not match');
    }

    const resetToken = await this.passwordResetRepository.findByToken(input.token);

    if (!resetToken) {
      throw new InvalidTokenError();
    }

    if (resetToken.usedAt) {
      throw new InvalidTokenError();
    }

    if (new Date() > resetToken.expiresAt) {
      throw new TokenExpiredError();
    }

    const user = await this.userRepository.findById(resetToken.userId);

    if (!user) {
      throw new InvalidTokenError();
    }

    user.passwordHash = await this.passwordHasher.hash(input.newPassword);
    user.failedLoginAttempts = 0;
    user.lockedUntil = undefined;
    user.updatedAt = new Date();
    await this.userRepository.update(user);

    resetToken.usedAt = new Date();
    await this.passwordResetRepository.update(resetToken);

    return { success: true };
  }
}
