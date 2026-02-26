import type { User, UserRole, UserStatus, ProfessionalInfo } from '../../../identity/domain/entities.js'
import type { UserRepository } from '../../../identity/domain/ports.js'
import { prisma } from './client.js'

export class PrismaUserRepository implements UserRepository {
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { professionalInfo: true },
    })

    if (!user) return null

    return this.toDomain(user)
  }

  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { email },
      include: { professionalInfo: true },
    })

    if (!user) return null

    return this.toDomain(user)
  }

  async findByTenantId(tenantId: string): Promise<User[]> {
    const users = await prisma.user.findMany({
      where: { tenantId },
      include: { professionalInfo: true },
    })

    return users.map((u) => this.toDomain(u))
  }

  async findByDocument(document: string): Promise<User | null> {
    const user = await prisma.user.findFirst({
      where: { document },
      include: { professionalInfo: true },
    })

    if (!user) return null

    return this.toDomain(user)
  }

  async countByTenantId(tenantId: string): Promise<number> {
    return prisma.user.count({ where: { tenantId } })
  }

  async save(user: User): Promise<void> {
    await prisma.user.create({
      data: {
        id: user.id,
        tenantId: user.tenantId,
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        document: user.document,
        phone: user.phone,
        roles: user.roles.map((r) => r.toUpperCase() as any),
        status: user.status.toUpperCase() as any,
        emailConfirmed: user.emailConfirmed,
        failedLoginAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        professionalInfo: user.professionalInfo
          ? {
              create: {
                specialty: user.professionalInfo.specialty,
                registerNumber: user.professionalInfo.registerNumber,
                registerType: user.professionalInfo.registerType,
              },
            }
          : undefined,
      },
    })
  }

  async update(user: User): Promise<void> {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        email: user.email,
        passwordHash: user.passwordHash,
        name: user.name,
        document: user.document,
        phone: user.phone,
        roles: user.roles.map((r) => r.toUpperCase() as any),
        status: user.status.toUpperCase() as any,
        emailConfirmed: user.emailConfirmed,
        failedLoginAttempts: user.failedLoginAttempts,
        lockedUntil: user.lockedUntil,
        updatedAt: user.updatedAt,
        professionalInfo: user.professionalInfo
          ? {
              upsert: {
                create: {
                  specialty: user.professionalInfo.specialty,
                  registerNumber: user.professionalInfo.registerNumber,
                  registerType: user.professionalInfo.registerType,
                },
                update: {
                  specialty: user.professionalInfo.specialty,
                  registerNumber: user.professionalInfo.registerNumber,
                  registerType: user.professionalInfo.registerType,
                },
              },
            }
          : undefined,
      },
    })
  }

  private toDomain(user: any): User {
    return {
      id: user.id,
      tenantId: user.tenantId,
      email: user.email,
      passwordHash: user.passwordHash,
      name: user.name,
      document: user.document ?? undefined,
      phone: user.phone ?? undefined,
      roles: user.roles.map((r: string) => r.toLowerCase() as UserRole),
      status: user.status.toLowerCase() as UserStatus,
      emailConfirmed: user.emailConfirmed,
      failedLoginAttempts: user.failedLoginAttempts,
      lockedUntil: user.lockedUntil ?? undefined,
      professionalInfo: user.professionalInfo
        ? {
            specialty: user.professionalInfo.specialty,
            registerNumber: user.professionalInfo.registerNumber ?? undefined,
            registerType: user.professionalInfo.registerType as ProfessionalInfo['registerType'],
          }
        : undefined,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    }
  }
}
