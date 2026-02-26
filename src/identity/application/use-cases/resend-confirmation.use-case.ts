/**
 * Use case de reenvio de confirmacao de email.
 * @see US-BE-F01-04
 */

import type { UserRepository, EmailConfirmationRepository } from '../../domain/ports.js';
import { AlreadyConfirmedError } from '../../domain/errors.js';

export interface ResendConfirmationInput {
  email: string;
}

export interface ResendConfirmationOutput {
  success: boolean;
}

export interface EmailService {
  sendConfirmationEmail(email: string, token: string, userName: string): Promise<void>;
}

export class ResendConfirmationUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly emailConfirmationRepository: EmailConfirmationRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(input: ResendConfirmationInput): Promise<ResendConfirmationOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      return { success: true };
    }

    if (user.emailConfirmed) {
      throw new AlreadyConfirmedError();
    }

    const newToken = crypto.randomUUID();

    await this.emailConfirmationRepository.deleteByUserId(user.id);
    await this.emailConfirmationRepository.save({
      id: crypto.randomUUID(),
      userId: user.id,
      token: newToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await this.emailService.sendConfirmationEmail(user.email, newToken, user.name);

    return { success: true };
  }
}
