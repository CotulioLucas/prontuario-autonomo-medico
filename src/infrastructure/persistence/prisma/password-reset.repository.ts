import type { PasswordResetToken } from '../../../identity/domain/entities.js'
import type { PasswordResetRepository } from '../../../identity/domain/ports.js'
import { prisma } from './client.js'

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  async findByToken(token: string): Promise<PasswordResetToken | null> {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    })

    if (!resetToken) return null

    return this.toDomain(resetToken)
  }

  async findByUserId(userId: string): Promise<PasswordResetToken | null> {
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    })

    if (!resetToken) return null

    return this.toDomain(resetToken)
  }

  async save(token: PasswordResetToken): Promise<void> {
    await prisma.passwordResetToken.create({
      data: {
        id: token.id,
        userId: token.userId,
        token: token.token,
        expiresAt: token.expiresAt,
        usedAt: token.usedAt,
        createdAt: token.createdAt,
      },
    })
  }

  async update(token: PasswordResetToken): Promise<void> {
    await prisma.passwordResetToken.update({
      where: { id: token.id },
      data: {
        usedAt: token.usedAt,
      },
    })
  }

  async deleteByUserId(userId: string): Promise<void> {
    await prisma.passwordResetToken.deleteMany({
      where: { userId },
    })
  }

  private toDomain(token: any): PasswordResetToken {
    return {
      id: token.id,
      userId: token.userId,
      token: token.token,
      expiresAt: token.expiresAt,
      usedAt: token.usedAt ?? undefined,
      createdAt: token.createdAt,
    }
  }
}
