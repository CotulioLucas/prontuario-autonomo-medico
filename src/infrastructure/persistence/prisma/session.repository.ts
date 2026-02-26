import type { Session } from '../../../identity/domain/entities.js'
import type { SessionRepository } from '../../../identity/domain/ports.js'
import { prisma } from './client.js'

export class PrismaSessionRepository implements SessionRepository {
  async findById(id: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: { id },
    })

    if (!session) return null

    return this.toDomain(session)
  }

  async findByToken(token: string): Promise<Session | null> {
    const session = await prisma.session.findUnique({
      where: { token },
    })

    if (!session) return null

    return this.toDomain(session)
  }

  async findByUserId(userId: string): Promise<Session[]> {
    const sessions = await prisma.session.findMany({
      where: { userId },
    })

    return sessions.map((s) => this.toDomain(s))
  }

  async save(session: Session): Promise<void> {
    await prisma.session.create({
      data: {
        id: session.id,
        userId: session.userId,
        tenantId: session.tenantId,
        token: session.token,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
      },
    })
  }

  async delete(id: string): Promise<void> {
    await prisma.session.delete({
      where: { id },
    })
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    })
  }

  private toDomain(session: any): Session {
    return {
      id: session.id,
      userId: session.userId,
      tenantId: session.tenantId,
      token: session.token,
      expiresAt: session.expiresAt,
      createdAt: session.createdAt,
    }
  }
}
