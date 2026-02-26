/**
 * Use case de confirmacao de email.
 * @see US-BE-F01-04
 */

import type { EmailConfirmationRepository, UserRepository } from '../../domain/ports.js';
import {
  InvalidTokenError,
  TokenExpiredError,
  AlreadyConfirmedError,
} from '../../domain/errors.js';

export interface ConfirmEmailInput {
  token: string;
}

export interface ConfirmEmailOutput {
  success: boolean;
  userId: string;
}

export class ConfirmEmailUseCase {
  constructor(
    private readonly emailConfirmationRepository: EmailConfirmationRepository,
    private readonly userRepository: UserRepository
  ) {}

  async execute(input: ConfirmEmailInput): Promise<ConfirmEmailOutput> {
    const confirmation = await this.emailConfirmationRepository.findByToken(input.token);

    if (!confirmation) {
      throw new InvalidTokenError();
    }

    if (confirmation.confirmedAt) {
      throw new AlreadyConfirmedError();
    }

    if (new Date() > confirmation.expiresAt) {
      throw new TokenExpiredError();
    }

    const user = await this.userRepository.findById(confirmation.userId);

    if (!user) {
      throw new InvalidTokenError();
    }

    if (user.emailConfirmed) {
      throw new AlreadyConfirmedError();
    }

    user.emailConfirmed = true;
    user.status = 'active';
    user.updatedAt = new Date();
    await this.userRepository.update(user);

    confirmation.confirmedAt = new Date();
    await this.emailConfirmationRepository.update(confirmation);

    return {
      success: true,
      userId: user.id,
    };
  }
}
