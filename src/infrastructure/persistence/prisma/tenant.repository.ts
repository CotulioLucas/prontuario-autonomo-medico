import type { Tenant, TenantType } from '../../../identity/domain/entities.js'
import type { TenantRepository } from '../../../identity/domain/ports.js'
import { prisma } from './client.js'

export class PrismaTenantRepository implements TenantRepository {
  async findById(id: string): Promise<Tenant | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { id },
      include: { address: true },
    })

    if (!tenant) return null

    return this.toDomain(tenant)
  }

  async findByDocument(document: string): Promise<Tenant | null> {
    const tenant = await prisma.tenant.findUnique({
      where: { document },
      include: { address: true },
    })

    if (!tenant) return null

    return this.toDomain(tenant)
  }

  async save(tenant: Tenant): Promise<void> {
    await prisma.tenant.create({
      data: {
        id: tenant.id,
        type: tenant.type.toUpperCase() as 'AUTONOMOUS' | 'CLINIC',
        name: tenant.name,
        document: tenant.document,
        email: tenant.email,
        phone: tenant.phone,
        logoUrl: tenant.logoUrl,
        createdAt: tenant.createdAt,
        updatedAt: tenant.updatedAt,
        address: tenant.address
          ? {
              create: {
                street: tenant.address.street,
                number: tenant.address.number,
                complement: tenant.address.complement,
                neighborhood: tenant.address.neighborhood,
                city: tenant.address.city,
                state: tenant.address.state,
                zipCode: tenant.address.zipCode,
              },
            }
          : undefined,
      },
    })
  }

  private toDomain(tenant: any): Tenant {
    return {
      id: tenant.id,
      type: tenant.type.toLowerCase() as TenantType,
      name: tenant.name,
      document: tenant.document,
      email: tenant.email,
      phone: tenant.phone ?? undefined,
      address: tenant.address
        ? {
            street: tenant.address.street,
            number: tenant.address.number,
            complement: tenant.address.complement ?? undefined,
            neighborhood: tenant.address.neighborhood ?? undefined,
            city: tenant.address.city,
            state: tenant.address.state,
            zipCode: tenant.address.zipCode,
          }
        : undefined,
      logoUrl: tenant.logoUrl ?? undefined,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    }
  }
}
