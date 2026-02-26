import { describe, it, expect, beforeAll } from 'vitest'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'

describe('Prisma Schema', () => {
  let schemaContent: string

  beforeAll(() => {
    const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')
    if (existsSync(schemaPath)) {
      schemaContent = readFileSync(schemaPath, 'utf-8')
    }
  })

  describe('File Structure', () => {
    it('should have schema.prisma file', () => {
      const schemaPath = join(process.cwd(), 'prisma', 'schema.prisma')
      expect(existsSync(schemaPath)).toBe(true)
    })

    it('should have correct datasource configuration', () => {
      expect(schemaContent).toContain('provider = "postgresql"')
      expect(schemaContent).toContain('url      = env("DATABASE_URL")')
    })

    it('should have prisma client generator', () => {
      expect(schemaContent).toContain('generator client')
      expect(schemaContent).toContain('provider = "prisma-client-js"')
    })
  })

  describe('Identity Context (F01)', () => {
    it('should have Tenant model', () => {
      expect(schemaContent).toContain('model Tenant')
      expect(schemaContent).toContain('id        String      @id @default(cuid())')
      expect(schemaContent).toContain('type      TenantType')
      expect(schemaContent).toContain('document  String      @unique')
    })

    it('should have User model with tenantId', () => {
      expect(schemaContent).toContain('model User')
      expect(schemaContent).toContain('tenantId             String')
      expect(schemaContent).toContain('email                String')
      expect(schemaContent).toContain('passwordHash         String')
      expect(schemaContent).toContain('@@index([tenantId, id])')
    })

    it('should have Session model for authentication', () => {
      expect(schemaContent).toContain('model Session')
      expect(schemaContent).toContain('token     String   @unique')
      expect(schemaContent).toContain('expiresAt DateTime')
    })

    it('should have Invite model for team management', () => {
      expect(schemaContent).toContain('model Invite')
      expect(schemaContent).toContain('token      String    @unique')
      expect(schemaContent).toContain('expiresAt  DateTime')
    })

    it('should have Consent model for LGPD', () => {
      expect(schemaContent).toContain('model Consent')
      expect(schemaContent).toContain('type       String')
      expect(schemaContent).toContain('version    String')
    })

    it('should have EmailConfirmationToken model', () => {
      expect(schemaContent).toContain('model EmailConfirmationToken')
      expect(schemaContent).toContain('token       String    @unique')
    })

    it('should have PasswordResetToken model', () => {
      expect(schemaContent).toContain('model PasswordResetToken')
      expect(schemaContent).toContain('token     String    @unique')
    })
  })

  describe('Clinical Context (F02, F04)', () => {
    it('should have Patient model with tenantId', () => {
      expect(schemaContent).toContain('model Patient')
      expect(schemaContent).toContain('tenantId      String')
      expect(schemaContent).toContain('deletedAt     DateTime?')
      expect(schemaContent).toContain('@@index([tenantId, id])')
    })

    it('should have ProfessionalPatientLink model', () => {
      expect(schemaContent).toContain('model ProfessionalPatientLink')
      expect(schemaContent).toContain('tenantId        String')
      expect(schemaContent).toContain('patientId       String')
      expect(schemaContent).toContain('professionalId  String')
    })

    it('should have Attendance model', () => {
      expect(schemaContent).toContain('model Attendance')
      expect(schemaContent).toContain('tenantId        String')
      expect(schemaContent).toContain('patientId       String')
      expect(schemaContent).toContain('professionalId  String')
    })

    it('should have Evolution model', () => {
      expect(schemaContent).toContain('model Evolution')
      expect(schemaContent).toContain('attendanceId  String    @unique')
      expect(schemaContent).toContain('content       String')
    })
  })

  describe('Scheduling Context (F03)', () => {
    it('should have Agenda model', () => {
      expect(schemaContent).toContain('model Agenda')
      expect(schemaContent).toContain('tenantId       String')
      expect(schemaContent).toContain('professionalId String')
    })

    it('should have Appointment model with tenantId', () => {
      expect(schemaContent).toContain('model Appointment')
      expect(schemaContent).toContain('tenantId       String')
      expect(schemaContent).toContain('deletedAt      DateTime?')
      expect(schemaContent).toContain('@@index([tenantId, professionalId, startAt])')
    })
  })

  describe('Billing Context (F05, F06)', () => {
    it('should have Receivable model', () => {
      expect(schemaContent).toContain('model Receivable')
      expect(schemaContent).toContain('tenantId      String')
      expect(schemaContent).toContain('amount        Float')
      expect(schemaContent).toContain('@@index([tenantId, dueDate])')
    })

    it('should have Receipt model', () => {
      expect(schemaContent).toContain('model Receipt')
      expect(schemaContent).toContain('tenantId     String')
      expect(schemaContent).toContain('number       String   @unique')
    })
  })

  describe('Multi-tenant Isolation (US-DB-01)', () => {
    it('should have tenantId in User model', () => {
      expect(schemaContent).toMatch(/model User[\s\S]*?tenantId[\s\S]*?@@map\("users"\)/)
    })

    it('should have tenantId in Patient model', () => {
      expect(schemaContent).toMatch(/model Patient[\s\S]*?tenantId[\s\S]*?@@map\("patients"\)/)
    })

    it('should have tenantId in Appointment model', () => {
      expect(schemaContent).toMatch(/model Appointment[\s\S]*?tenantId[\s\S]*?@@map\("appointments"\)/)
    })

    it('should have tenantId in Attendance model', () => {
      expect(schemaContent).toMatch(/model Attendance[\s\S]*?tenantId[\s\S]*?@@map\("attendances"\)/)
    })

    it('should have tenantId in Receivable model', () => {
      expect(schemaContent).toMatch(/model Receivable[\s\S]*?tenantId[\s\S]*?@@map\("receivables"\)/)
    })

    it('should have tenantId in Invite model', () => {
      expect(schemaContent).toMatch(/model Invite[\s\S]*?tenantId[\s\S]*?@@map\("invites"\)/)
    })

    it('should have tenantId in Consent model', () => {
      expect(schemaContent).toMatch(/model Consent[\s\S]*?tenantId[\s\S]*?@@map\("consents"\)/)
    })
  })

  describe('Indices (US-DB-02)', () => {
    it('should have composite index (tenantId, id) in User', () => {
      expect(schemaContent).toMatch(/model User[\s\S]*?@@index\(\[tenantId, id\]\)[\s\S]*?@@map\("users"\)/)
    })

    it('should have composite index (tenantId, id) in Patient', () => {
      expect(schemaContent).toMatch(/model Patient[\s\S]*?@@index\(\[tenantId, id\]\)[\s\S]*?@@map\("patients"\)/)
    })

    it('should have composite index (tenantId, id) in Appointment', () => {
      expect(schemaContent).toMatch(/model Appointment[\s\S]*?@@index\(\[tenantId, id\]\)[\s\S]*?@@map\("appointments"\)/)
    })

    it('should have index for appointments by professional and date', () => {
      expect(schemaContent).toContain('@@index([tenantId, professionalId, startAt])')
    })

    it('should have index for receivables by due date', () => {
      expect(schemaContent).toContain('@@index([tenantId, dueDate])')
    })
  })

  describe('Soft Delete (US-DB-07)', () => {
    it('should have deletedAt in Patient model', () => {
      expect(schemaContent).toMatch(/model Patient[\s\S]*?deletedAt[\s\S]*?@@map\("patients"\)/)
    })

    it('should have deletedAt in Appointment model', () => {
      expect(schemaContent).toMatch(/model Appointment[\s\S]*?deletedAt[\s\S]*?@@map\("appointments"\)/)
    })

    it('should NOT have deletedAt in User model (hard delete)', () => {
      const userModelMatch = schemaContent.match(/model User[\s\S]*?@@map\("users"\)/)
      expect(userModelMatch).toBeDefined()
      expect(userModelMatch![0]).not.toContain('deletedAt')
    })
  })

  describe('Enums', () => {
    it('should have TenantType enum', () => {
      expect(schemaContent).toContain('enum TenantType')
      expect(schemaContent).toContain('AUTONOMOUS')
      expect(schemaContent).toContain('CLINIC')
    })

    it('should have UserRole enum', () => {
      expect(schemaContent).toContain('enum UserRole')
      expect(schemaContent).toContain('ADMIN')
      expect(schemaContent).toContain('PROFESSIONAL')
    })

    it('should have UserStatus enum', () => {
      expect(schemaContent).toContain('enum UserStatus')
      expect(schemaContent).toContain('ACTIVE')
      expect(schemaContent).toContain('INACTIVE')
      expect(schemaContent).toContain('PENDING_CONFIRMATION')
    })

    it('should have AppointmentStatus enum', () => {
      expect(schemaContent).toContain('enum AppointmentStatus')
      expect(schemaContent).toContain('SCHEDULED')
      expect(schemaContent).toContain('COMPLETED')
      expect(schemaContent).toContain('CANCELLED')
    })

    it('should have ReceivableStatus enum', () => {
      expect(schemaContent).toContain('enum ReceivableStatus')
      expect(schemaContent).toContain('PENDING')
      expect(schemaContent).toContain('PAID')
    })
  })
})
