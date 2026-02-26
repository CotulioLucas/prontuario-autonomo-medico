import { describe, it, expect, vi, beforeEach } from 'vitest'
import type { Session } from '../../../src/identity/domain/entities.js'

vi.mock('../../../src/infrastructure/persistence/prisma/client.js', () => ({
  prisma: {
    session: {
      findUnique: vi.fn(),
      findMany: vi.fn(),
      create: vi.fn(),
      delete: vi.fn(),
      deleteMany: vi.fn(),
    },
  },
}))

import { PrismaSessionRepository } from '../../../src/infrastructure/persistence/prisma/session.repository.js'
import { prisma } from '../../../src/infrastructure/persistence/prisma/client.js'

const mockPrisma = prisma as unknown as {
  session: {
    findUnique: ReturnType<typeof vi.fn>
    findMany: ReturnType<typeof vi.fn>
    create: ReturnType<typeof vi.fn>
    delete: ReturnType<typeof vi.fn>
    deleteMany: ReturnType<typeof vi.fn>
  }
}

describe('PrismaSessionRepository', () => {
  let repository: PrismaSessionRepository

  beforeEach(() => {
    vi.clearAllMocks()
    repository = new PrismaSessionRepository()
  })

  const mockSession = {
    id: 'session-1',
    userId: 'user-1',
    tenantId: 'tenant-1',
    token: 'token-abc123',
    expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    createdAt: new Date(),
  }

  describe('findById', () => {
    it('should return null when session not found', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null)

      const result = await repository.findById('non-existent')

      expect(result).toBeNull()
    })

    it('should return session when found', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession)

      const result = await repository.findById('session-1')

      expect(result).not.toBeNull()
      expect(result?.id).toBe('session-1')
      expect(result?.token).toBe('token-abc123')
    })
  })

  describe('findByToken', () => {
    it('should return null when token not found', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(null)

      const result = await repository.findByToken('invalid-token')

      expect(result).toBeNull()
    })

    it('should return session when token found', async () => {
      mockPrisma.session.findUnique.mockResolvedValue(mockSession)

      const result = await repository.findByToken('token-abc123')

      expect(result).not.toBeNull()
      expect(result?.token).toBe('token-abc123')
    })
  })

  describe('findByUserId', () => {
    it('should return empty array when no sessions found', async () => {
      mockPrisma.session.findMany.mockResolvedValue([])

      const result = await repository.findByUserId('user-1')

      expect(result).toEqual([])
    })

    it('should return sessions when found', async () => {
      mockPrisma.session.findMany.mockResolvedValue([mockSession])

      const result = await repository.findByUserId('user-1')

      expect(result).toHaveLength(1)
      expect(result[0].userId).toBe('user-1')
    })
  })

  describe('save', () => {
    it('should create session', async () => {
      const session: Session = {
        id: 'session-1',
        userId: 'user-1',
        tenantId: 'tenant-1',
        token: 'token-abc123',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      }

      mockPrisma.session.create.mockResolvedValue({})

      await repository.save(session)

      expect(mockPrisma.session.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            id: 'session-1',
            userId: 'user-1',
            token: 'token-abc123',
          }),
        })
      )
    })
  })

  describe('delete', () => {
    it('should delete session by id', async () => {
      mockPrisma.session.delete.mockResolvedValue({})

      await repository.delete('session-1')

      expect(mockPrisma.session.delete).toHaveBeenCalledWith({
        where: { id: 'session-1' },
      })
    })
  })

  describe('deleteByUserId', () => {
    it('should delete all sessions for user', async () => {
      mockPrisma.session.deleteMany.mockResolvedValue({ count: 3 })

      await repository.deleteByUserId('user-1')

      expect(mockPrisma.session.deleteMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
      })
    })
  })
})
