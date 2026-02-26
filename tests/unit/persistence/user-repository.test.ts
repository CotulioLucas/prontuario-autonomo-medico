import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { User } from '../../../src/identity/domain/entities.js'

vi.mock('../../../src/infrastructure/persistence/prisma/client.js', () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
      findFirst: vi.fn(),
      findMany: vi.fn(),
      count: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
    },
  },
}))

import { PrismaUserRepository } from '../../../src/infrastructure/persistence/prisma/user.repository.js'
import { prisma } from '../../../src/infrastructure/persistence/prisma/client.js'

const mockPrisma = prisma as unknown as {
  user: {
    findUnique: ReturnType<typeof vi.fn>
    findFirst: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    count: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    update: ReturnType<typeof vi.fn>
  }
}

describe('PrismaUserRepository', () => {
  let repository: PrismaUserRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new PrismaUserRepository()
  })

  const mockUser = {
    id: 'user-1',
    tenantId: 'tenant-1',
    email: 'user@email.com',
    passwordHash: 'hashed-password',
    name: 'Joao Silva',
    document: '12345678901',
    phone: '11999999999',
    roles: ['PROFESSIONAL'],
    status: 'ACTIVE',
    emailConfirmed: true,
    failedLoginAttempts: 0,
    lockedUntil: null,
    professionalInfo: {
      specialty: 'Cardiologia',
      registerNumber: '12345',
      registerType: 'CRM',
    },
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  describe('findById', () => {
    it('should return null when user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })

    it('should return user when found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser)

      const result = await repository.findById('user-1')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('user-1')
      expect(result?.roles).toEqual(['professional'])
      expect(result?.status).toBe('active')
    })
  })

  describe('findByEmail', () => {
    it('should return null when email not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null)

      const result = await repository.findByEmail('nonexistent@email.com')

      expect(result).toBeNull()
    })

    it('should return user when email found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser)

      const result = await repository.findByEmail('user@email.com')

      expect(result).not.toBeNull()
      expect(result?.email).toBe('user@email.com')
    })
  })

  describe('findByTenantId', () => {
    it('should return empty array when no users found', async () => {
      mockPrisma.user.findMany.mockResolvedValue([])

      const result = await repository.findByTenantId('tenant-1')

      expect(result).toEqual([])
    })

    it('should return users when found', async () => {
      mockPrisma.user.findMany.mockResolvedValue([mockUser])

      const result = await repository.findByTenantId('tenant-1')

      expect(result).toHaveLength(1)
      expect(result[0].tenantId).toBe('tenant-1')
    })
  })

  describe('findByDocument', () => {
    it('should return null when document not found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(null)

      const result = await repository.findByDocument('non-existent')

      expect(result).toBeNull()
    })

    it('should return user when document found', async () => {
      mockPrisma.user.findFirst.mockResolvedValue(mockUser)

      const result = await repository.findByDocument('12345678901')

      expect(result).not.toBeNull()
      expect(result?.document).toBe('12345678901')
    })
  })

  describe('countByTenantId', () => {
    it('should return count of users', async () => {
      mockPrisma.user.count.mockResolvedValue(5)

      const result = await repository.countByTenantId('tenant-1')

      expect(result).toBe(5)
    })
  })

  describe('save', () => {
    it('should create user without professional info', async () => {
      const user: User = {
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'user@email.com',
        passwordHash: 'hashed-password',
        name: 'Joao Silva',
        roles: ['admin'],
        status: 'pending_confirmation',
        emailConfirmed: false,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.create.mockResolvedValue({})

      await repository.save(user)

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'user-1',
            tenantId: 'tenant-1',
            email: 'user@email.com',
            roles: ['ADMIN'],
            status: 'PENDING_CONFIRMATION',
          }),
        })
      )
    })

    it('should create user with professional info', async () => {
      const user: User = {
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'user@email.com',
        passwordHash: 'hashed-password',
        name: 'Dr. Joao',
        roles: ['professional'],
        status: 'active',
        emailConfirmed: true,
        failedLoginAttempts: 0,
        professionalInfo: {
          specialty: 'Cardiologia',
          registerNumber: '12345',
          registerType: 'CRM',
        },
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.create.mockResolvedValue({})

      await repository.save(user)

      expect(mockPrisma.user.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            professionalInfo: {
              create: {
                specialty: 'Cardiologia',
                registerNumber: '12345',
                registerType: 'CRM',
              },
            },
          }),
        })
      )
    })
  })

  describe('update', () => {
    it('should update user', async () => {
      const user: User = {
        id: 'user-1',
        tenantId: 'tenant-1',
        email: 'updated@email.com',
        passwordHash: 'new-hash',
        name: 'Joao Updated',
        roles: ['admin'],
        status: 'active',
        emailConfirmed: true,
        failedLoginAttempts: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.user.update.mockResolvedValue({})

      await repository.update(user)

      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'user-1' },
          data: expect.objectContaining({
            email: 'updated@email.com',
            name: 'Joao Updated',
          }),
        })
      )
    })
  })
})
