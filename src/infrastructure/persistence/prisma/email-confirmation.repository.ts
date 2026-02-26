import type { EmailConfirmationToken } from '../../../identity/domain/entities.js'
import type { EmailConfirmationRepository } from '../../../identity/domain/ports.js'
import { prisma } from './client.js'

export class PrismaEmailConfirmationRepository implements EmailConfirmationRepository {
  async findByToken(token: string): Promise<EmailConfirmationToken | null> {
    const emailToken = await prisma.emailConfirmationToken.findUnique({
      where: { token },
    })

    if (!emailToken) return null

    return this.toDomain(emailToken)
  }

  async findByUserId(userId: string): Promise<EmailConfirmationToken | null> {
    const emailToken = await prisma.emailConfirmationToken.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!emailToken) return null

    return this.toDomain(emailToken)
  }

  async save(token: EmailConfirmationToken): Promise<void> {
    await prisma.emailConfirmationToken.create({
      data: {
        id: token.id,
        userId: token.userId,
        token: token.token,
        expiresAt: token.expiresAt,
        confirmedAt: token.confirmedAt,
        createdAt: token.createdAt,
      },
    })
  }

  async update(token: EmailConfirmationToken): Promise<void> {
    await prisma.emailConfirmationToken.update({
      where: { id: token.id },
      data: {
        confirmedAt: token.confirmedAt,
      },
    })
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.emailConfirmationToken.deleteMany({
      where: { userId },
    })
  }

  private toDomain(token: any): EmailConfirmationToken {
    return {
      id: token.id,
      userId: token.userId,
      token: token.token,
      expiresAt: token.expiresAt,
      confirmedAt: token.confirmedAt ?? undefined,
      createdAt: token.createdAt,
    }
  }
}
