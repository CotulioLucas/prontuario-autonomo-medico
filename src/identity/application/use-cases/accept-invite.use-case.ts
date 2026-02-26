/**
 * Use case de aceite de convite.
 * @see US-BE-F01-06, DR-IA-3
 */

import type { User, Invite } from '../../domain/entities.js';
import type { UserRepository, InviteRepository, ConsentRepository } from '../../domain/ports.js';
import {
  InviteExpiredError,
  InviteAlreadyAcceptedError,
  EmailAlreadyExistsError,
  ConsentRequiredError,
} from '../../domain/errors.js';

export interface AcceptInviteInput {
  token: string;
  isNewUser: boolean;
  name?: string;
  password?: string;
  phone?: string;
  document?: string;
  lgpdConsentVersion?: string;
}

export interface AcceptInviteOutput {
  user: User;
  isNewUser: boolean;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export class AcceptInviteUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly inviteRepository: InviteRepository,
    private readonly consentRepository: ConsentRepository,
    private readonly passwordHasher: PasswordHasher
  ) {}

  async execute(input: AcceptInviteInput): Promise<AcceptInviteOutput> {
    const invite = await this.inviteRepository.findByToken(input.token);

    if (!invite) {
      throw new Error('Invalid invite token');
    }

    if (invite.acceptedAt) {
      throw new InviteAlreadyAcceptedError();
    }

    if (new Date() > invite.expiresAt) {
      throw new InviteExpiredError();
    }

    let user = await this.userRepository.findByEmail(invite.email);
    let isNewUser = false;

    if (!user) {
      if (!input.name || !input.password) {
        throw new Error('Name and password required for new user');
      }

      if (!input.lgpdConsentVersion) {
        throw new ConsentRequiredError();
      }

      const existingUser = await this.userRepository.findByEmail(invite.email);
      if (existingUser) {
        throw new EmailAlreadyExistsError();
      }

      const passwordHash = await this.passwordHasher.hash(input.password);

      user = {
        id: crypto.randomUUID(),
        tenantId: invite.tenantId,
        email: invite.email,
        passwordHash,
        name: input.name,
        phone: input.phone,
        document: input.document,
        roles: [invite.role],
        status: 'active',
        emailConfirmed: true,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await this.userRepository.save(user);
      isNewUser = true;

      await this.consentRepository.save({
        id: crypto.randomUUID(),
        tenantId: invite.tenantId,
        userId: user.id,
        type: 'LGPD',
        version: input.lgpdConsentVersion,
        acceptedAt: new Date(),
      });
    } else {
      if (!user.roles.includes(invite.role)) {
        user.roles.push(invite.role);
        user.updatedAt = new Date();
        await this.userRepository.update(user);
      }
    }

    invite.acceptedAt = new Date();
    invite.acceptedBy = user.id;
    await this.inviteRepository.update(invite);

    return { user, isNewUser };
  }
}
