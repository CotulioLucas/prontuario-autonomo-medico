/**
 * Use case de esqueci senha.
 * @see US-BE-F01-05
 */

import type { UserRepository, PasswordResetRepository } from '../../domain/ports.js';

export interface ForgotPasswordInput {
  email: string;
}

export interface ForgotPasswordOutput {
  success: boolean;
}

export interface EmailService {
  sendPasswordResetEmail(email: string, token: string, userName: string): Promise<void>;
}

export class ForgotPasswordUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly passwordResetRepository: PasswordResetRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(input: ForgotPasswordInput): Promise<ForgotPasswordOutput> {
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      return { success: true };
    }

    const token = crypto.randomUUID();

    await this.passwordResetRepository.deleteByUserId(user.id);
    await this.passwordResetRepository.save({
      id: crypto.randomUUID(),
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await this.emailService.sendPasswordResetEmail(user.email, token, user.name);

    return { success: true };
  }
}
