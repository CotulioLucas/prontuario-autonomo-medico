import type { Invite, UserRole } from '../../../identity/domain/entities.js'
import type { InviteRepository } from '../../../identity/domain/ports.js'
import { prisma } from './client.js'

export class PrismaInviteRepository implements InviteRepository {
  async findById(id: string): Promise<Invite | null> {
    const invite = await prisma.invite.findUnique({
      where: { id },
    })

    if (!invite) return null

    return this.toDomain(invite)
  }

  async findByToken(token: string): Promise<Invite | null> {
    const invite = await prisma.invite.findUnique({
      where: { token },
    })

    if (!invite) return null

    return this.toDomain(invite)
  }

  async findByTenantId(tenantId: string): Promise<Invite[]> {
    const invites = await prisma.invite.findMany({
      where: { tenantId },
    })

    return invites.map((i) => this.toDomain(i))
  }

  async findByEmail(email: string): Promise<Invite | null> {
    const invite = await prisma.invite.findFirst({
      where: { email },
    })

    if (!invite) return null

    return this.toDomain(invite)
  }

  async save(invite: Invite): Promise<void> {
    await prisma.invite.create({
      data: {
        id: invite.id,
        tenantId: invite.tenantId,
        email: invite.email,
        role: invite.role.toUpperCase() as any,
        invitedBy: invite.invitedBy,
        token: invite.token,
        expiresAt: invite.expiresAt,
        acceptedAt: invite.acceptedAt,
        acceptedBy: invite.acceptedBy,
        createdAt: invite.createdAt,
      },
    })
  }

  async update(invite: Invite): Promise<void> {
    await prisma.invite.update({
      where: { id: invite.id },
      data: {
        acceptedAt: invite.acceptedAt,
        acceptedBy: invite.acceptedBy,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.invite.delete({
      where: { id },
    })
  }

  private toDomain(invite: any): Invite {
    return {
      id: invite.id,
      tenantId: invite.tenantId,
      email: invite.email,
      role: invite.role.toLowerCase() as UserRole,
      invitedBy: invite.invitedBy,
      token: invite.token,
      expiresAt: invite.expiresAt,
      acceptedAt: invite.acceptedAt ?? undefined,
      acceptedBy: invite.acceptedBy ?? undefined,
      createdAt: invite.createdAt,
    }
  }
}
