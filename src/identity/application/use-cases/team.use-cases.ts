/**
 * Use cases de gestao de equipe.
 * @see US-BE-F01-07, DR-IA-3, DR-IA-4
 */

import type { User, Invite, UserRole } from '../../domain/entities.js';
import type { UserRepository, InviteRepository, TenantRepository } from '../../domain/ports.js';
import { EmailAlreadyExistsError, RoleNotAllowedError, TenantUserLimitError } from '../../domain/errors.js';

export interface CreateInviteInput {
  tenantId: string;
  email: string;
  role: UserRole;
  invitedBy: string;
}

export interface CreateInviteOutput {
  invite: Invite;
}

export interface EmailService {
  sendInviteEmail(email: string, token: string, inviterName: string, tenantName: string): Promise<void>;
}

export class CreateInviteUseCase {
  constructor(
    private readonly inviteRepository: InviteRepository,
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(input: CreateInviteInput): Promise<CreateInviteOutput> {
    const tenant = await this.tenantRepository.findById(input.tenantId);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (tenant.type === 'autonomous') {
      throw new RoleNotAllowedError();
    }

    const existingInvite = await this.inviteRepository.findByEmail(input.email);
    if (existingInvite && !existingInvite.acceptedAt) {
      throw new EmailAlreadyExistsError();
    }

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser && existingUser.tenantId === input.tenantId) {
      throw new EmailAlreadyExistsError();
    }

    const inviter = await this.userRepository.findById(input.invitedBy);
    if (!inviter) {
      throw new Error('Inviter not found');
    }

    const token = crypto.randomUUID();
    const invite: Invite = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      email: input.email,
      role: input.role,
      invitedBy: input.invitedBy,
      token,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    };

    await this.inviteRepository.save(invite);

    await this.emailService.sendInviteEmail(input.email, token, inviter.name, tenant.name);

    return { invite };
  }
}

export interface ListMembersInput {
  tenantId: string;
}

export interface ListMembersOutput {
  members: Array<{
    id: string;
    name: string;
    email: string;
    roles: UserRole[];
    status: string;
    createdAt: Date;
  }>;
  invites: Array<{
    id: string;
    email: string;
    role: UserRole;
    createdAt: Date;
    expiresAt: Date;
  }>;
}

export class ListMembersUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly inviteRepository: InviteRepository
  ) {}

  async execute(input: ListMembersInput): Promise<ListMembersOutput> {
    const users = await this.userRepository.findByTenantId(input.tenantId);
    const invites = await this.inviteRepository.findByTenantId(input.tenantId);

    const pendingInvites = invites.filter((i) => !i.acceptedAt);

    return {
      members: users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        roles: u.roles,
        status: u.status,
        createdAt: u.createdAt,
      })),
      invites: pendingInvites.map((i) => ({
        id: i.id,
        email: i.email,
        role: i.role,
        createdAt: i.createdAt,
        expiresAt: i.expiresAt,
      })),
    };
  }
}

export interface ResendInviteInput {
  inviteId: string;
  tenantId: string;
}

export class ResendInviteUseCase {
  constructor(
    private readonly inviteRepository: InviteRepository,
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository,
    private readonly emailService: EmailService
  ) {}

  async execute(input: ResendInviteInput): Promise<void> {
    const invite = await this.inviteRepository.findById(input.inviteId);

    if (!invite || invite.tenantId !== input.tenantId) {
      throw new Error('Invite not found');
    }

    if (invite.acceptedAt) {
      throw new Error('Invite already accepted');
    }

    const inviter = await this.userRepository.findById(invite.invitedBy);
    const tenant = await this.tenantRepository.findById(invite.tenantId);

    if (!inviter || !tenant) {
      throw new Error('Invalid invite');
    }

    await this.emailService.sendInviteEmail(invite.email, invite.token, inviter.name, tenant.name);
  }
}

export interface RevokeInviteInput {
  inviteId: string;
  tenantId: string;
}

export class RevokeInviteUseCase {
  constructor(private readonly inviteRepository: InviteRepository) {}

  async execute(input: RevokeInviteInput): Promise<void> {
    const invite = await this.inviteRepository.findById(input.inviteId);

    if (!invite || invite.tenantId !== input.tenantId) {
      throw new Error('Invite not found');
    }

    if (invite.acceptedAt) {
      throw new Error('Cannot revoke accepted invite');
    }

    await this.inviteRepository.delete(input.inviteId);
  }
}

export interface UpdateMemberRoleInput {
  memberId: string;
  tenantId: string;
  role: UserRole;
}

export class UpdateMemberRoleUseCase {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly tenantRepository: TenantRepository
  ) {}

  async execute(input: UpdateMemberRoleInput): Promise<void> {
    const tenant = await this.tenantRepository.findById(input.tenantId);

    if (!tenant) {
      throw new Error('Tenant not found');
    }

    if (tenant.type === 'autonomous') {
      throw new RoleNotAllowedError();
    }

    const user = await this.userRepository.findById(input.memberId);

    if (!user || user.tenantId !== input.tenantId) {
      throw new Error('Member not found');
    }

    if (!user.roles.includes(input.role)) {
      user.roles.push(input.role);
    }

    user.updatedAt = new Date();
    await this.userRepository.update(user);
  }
}

export interface DeactivateMemberInput {
  memberId: string;
  tenantId: string;
}

export class DeactivateMemberUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: DeactivateMemberInput): Promise<void> {
    const user = await this.userRepository.findById(input.memberId);

    if (!user || user.tenantId !== input.tenantId) {
      throw new Error('Member not found');
    }

    user.status = 'inactive';
    user.updatedAt = new Date();
    await this.userRepository.update(user);
  }
}

export interface ListProfessionalsInput {
  tenantId: string;
}

export interface ListProfessionalsOutput {
  professionals: Array<{
    id: string;
    name: string;
    email: string;
    specialty?: string;
  }>;
}

export class ListProfessionalsUseCase {
  constructor(private readonly userRepository: UserRepository) {}

  async execute(input: ListProfessionalsInput): Promise<ListProfessionalsOutput> {
    const users = await this.userRepository.findByTenantId(input.tenantId);

    const professionals = users.filter(
      (u) => u.roles.includes('professional') && u.status === 'active'
    );

    return {
      professionals: professionals.map((p) => ({
        id: p.id,
        name: p.name,
        email: p.email,
        specialty: p.professionalInfo?.specialty,
      })),
    };
  }
}
