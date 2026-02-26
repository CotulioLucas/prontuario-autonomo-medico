import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'
import { randomUUID } from 'crypto'

const prisma = new PrismaClient()

async function main() {
  console.log('Iniciando seed...')

  const tenant = await prisma.tenant.upsert({
    where: { document: '12345678901' },
    update: {},
    create: {
      id: randomUUID(),
      type: 'AUTONOMOUS',
      name: 'Dr. Joao Silva',
      document: '12345678901',
      email: 'joao@email.com',
      phone: '11999999999',
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log('Tenant pronto:', tenant.name)

  const passwordHash = await bcrypt.hash('Password123', 12)
  const user = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: tenant.id, email: 'joao@email.com' } },
    update: {},
    create: {
      id: randomUUID(),
      tenantId: tenant.id,
      email: 'joao@email.com',
      passwordHash,
      name: 'Dr. Joao Silva',
      document: '12345678901',
      phone: '11999999999',
      roles: ['ADMIN', 'PROFESSIONAL'],
      status: 'ACTIVE',
      emailConfirmed: true,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
      professionalInfo: {
        create: {
          specialty: 'Cardiologia',
          registerNumber: 'CRM-12345',
          registerType: 'CRM',
        },
      },
    },
  })
  console.log('Usuario pronto:', user.email)

  const existingConsent = await prisma.consent.findFirst({
    where: { tenantId: tenant.id, userId: user.id, type: 'LGPD' },
  })
  if (!existingConsent) {
    await prisma.consent.create({
      data: {
        id: randomUUID(),
        tenantId: tenant.id,
        userId: user.id,
        type: 'LGPD',
        version: '1.0',
        acceptedAt: new Date(),
      },
    })
    console.log('Consentimento LGPD registrado')
  } else {
    console.log('Consentimento LGPD ja existe')
  }

  const clinicTenant = await prisma.tenant.upsert({
    where: { document: '12345678000190' },
    update: {},
    create: {
      id: randomUUID(),
      type: 'CLINIC',
      name: 'Clinica Saude Total',
      document: '12345678000190',
      email: 'contato@saudetotal.com',
      phone: '1133333333',
      address: {
        create: {
          street: 'Rua das Flores',
          number: '100',
          neighborhood: 'Centro',
          city: 'Sao Paulo',
          state: 'SP',
          zipCode: '01234567',
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log('Clinica pronta:', clinicTenant.name)

  const clinicAdmin = await prisma.user.upsert({
    where: { tenantId_email: { tenantId: clinicTenant.id, email: 'admin@saudetotal.com' } },
    update: {},
    create: {
      id: randomUUID(),
      tenantId: clinicTenant.id,
      email: 'admin@saudetotal.com',
      passwordHash,
      name: 'Maria Santos',
      roles: ['ADMIN'],
      status: 'ACTIVE',
      emailConfirmed: true,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  })
  console.log('Admin da clinica pronto:', clinicAdmin.email)

  console.log('\nSeed concluido com sucesso!\n')
  console.log('USUARIOS DE TESTE:')
  console.log('PROFISSIONAL AUTONOMO: joao@email.com / Password123')
  console.log('CLINICA: admin@saudetotal.com / Password123')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
