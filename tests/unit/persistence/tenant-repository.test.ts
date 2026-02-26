import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Tenant } from '../../../src/identity/domain/entities.js'

vi.mock('../../../src/infrastructure/persistence/prisma/client.js', () => ({
  prisma: {
    tenant: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}))

import { PrismaTenantRepository } from '../../../src/infrastructure/persistence/prisma/tenant.repository.js'
import { prisma } from '../../../src/infrastructure/persistence/prisma/client.js'

const mockPrisma = prisma as unknown as {
  tenant: {
    findUnique: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
  }
}

describe('PrismaTenantRepository', () => {
  let repository: PrismaTenantRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new PrismaTenantRepository()
  })

  describe('findById', () => {
    it('should return null when tenant not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })

    it('should return tenant when found', async () => {
      const mockTenant = {
        id: 'tenant-1',
        type: 'AUTONOMOUS',
        name: 'Dr. Joao',
        document: '12345678901',
        email: 'joao@email.com',
        phone: '11999999999',
        logoUrl: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        address: null,
      }
      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant)

      const result = await repository.findById('tenant-1')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('tenant-1')
      expect(result?.type).toBe('autonomous')
    })
  })

  describe('findByDocument', () => {
    it('should return null when document not found', async () => {
      mockPrisma.tenant.findUnique.mockResolvedValue(null)

      const result = await repository.findByDocument('non-existent')

      expect(result).toBeNull()
    })

    it('should return tenant when document found', async () => {
      const mockTenant = {
        id: 'tenant-1',
        type: 'CLINIC',
        name: 'Clinica ABC',
        document: '12345678000190',
        email: 'contato@clinica.com',
        phone: '1133333333',
        logoUrl: 'https://example.com/logo.png',
        createdAt: new Date(),
        updatedAt: new Date(),
        address: {
          street: 'Rua A',
          number: '100',
          complement: null,
          neighborhood: 'Centro',
          city: 'Sao Paulo',
          state: 'SP',
          zipCode: '01234567',
        },
      }
      mockPrisma.tenant.findUnique.mockResolvedValue(mockTenant)

      const result = await repository.findByDocument('12345678000190')

      expect(result).not.toBeNull()
      expect(result?.document).toBe('12345678000190')
      expect(result?.type).toBe('clinic')
      expect(result?.address?.street).toBe('Rua A')
    })
  })

  describe('save', () => {
    it('should create tenant without address', async () => {
      const tenant: Tenant = {
        id: 'tenant-1',
        type: 'autonomous',
        name: 'Dr. Joao',
        document: '12345678901',
        email: 'joao@email.com',
        phone: '11999999999',
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.tenant.create.mockResolvedValue({})

      await repository.save(tenant)

      expect(mockPrisma.tenant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'tenant-1',
            type: 'AUTONOMOUS',
            name: 'Dr. Joao',
          }),
        })
      )
    })

    it('should create tenant with address', async () => {
      const tenant: Tenant = {
        id: 'tenant-1',
        type: 'clinic',
        name: 'Clinica ABC',
        document: '12345678000190',
        email: 'contato@clinica.com',
        phone: '1133333333',
        address: {
          street: 'Rua A',
          number: '100',
          city: 'Sao Paulo',
          state: 'SP',
          zipCode: '01234567',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.tenant.create.mockResolvedValue({})

      await repository.save(tenant)

      expect(mockPrisma.tenant.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'tenant-1',
            type: 'CLINIC',
            address: {
              create: expect.objectContaining({
                street: 'Rua A',
                number: '100',
              }),
            },
          }),
        })
      )
    })
  })
})
