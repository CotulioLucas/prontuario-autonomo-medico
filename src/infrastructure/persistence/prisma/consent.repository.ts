import type { Consent } from '../../../identity/domain/entities.js'
import type { ConsentRepository } from '../../../identity/domain/ports.js'
import { prisma } from './client.js'

export class PrismaConsentRepository implements ConsentRepository {
  async findById(id: string): Promise<Consent | null> {
    const consent = await prisma.consent.findUnique({
      where: { id },
    })

    if (!consent) return null

    return this.toDomain(consent)
  }

  async findByTenantAndType(tenantId: string, type: string): Promise<Consent | null> {
    const consent = await prisma.consent.findFirst({
      where: { tenantId, type },
    })

    if (!consent) return null

    return this.toDomain(consent)
  }

  async save(consent: Consent): Promise<void> {
    await prisma.consent.create({
      data: {
        id: consent.id,
        tenantId: consent.tenantId,
        userId: consent.userId,
        type: consent.type,
        version: consent.version,
        acceptedAt: consent.acceptedAt,
        ipAddress: consent.ipAddress,
      },
    })
  }

  private toDomain(consent: any): Consent {
    return {
      id: consent.id,
      tenantId: consent.tenantId,
      userId: consent.userId ?? undefined,
      type: consent.type as 'LGPD' | 'TERMS' | 'PRIVACY',
      version: consent.version,
      acceptedAt: consent.acceptedAt,
      ipAddress: consent.ipAddress ?? undefined,
    }
  }
}
