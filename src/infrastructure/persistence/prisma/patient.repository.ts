/**
 * Repositório Prisma para Pacientes.
 * @see US-BE-F02-01, DR-IA-4
 */

import type { Patient, PatientRepository } from '../../../clinical/domain/patient.js';
import { prisma } from './client.js';

export class PrismaPatientRepository implements PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: { address: true },
    });
    if (!patient) return null;
    return this.toDomain(patient);
  }

  async findByTenantId(
    tenantId: string,
    options?: { search?: string; page?: number; limit?: number }
  ): Promise<{ patients: Patient[]; total: number }> {
    const page = options?.page ?? 1;
    const limit = options?.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: any = {
      tenantId,
      deletedAt: null,
    };

    if (options?.search) {
      const q = options.search;
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { document: { contains: q.replace(/\D/g, '') } },
        { phone: { contains: q.replace(/\D/g, '') } },
      ];
    }

    const [patients, total] = await Promise.all([
      prisma.patient.findMany({
        where,
        include: { address: true },
        skip,
        take: limit,
        orderBy: { name: 'asc' },
      }),
      prisma.patient.count({ where }),
    ]);

    return { patients: patients.map((p) => this.toDomain(p)), total };
  }

  async findByDocument(tenantId: string, document: string): Promise<Patient | null> {
    const patient = await prisma.patient.findFirst({
      where: { tenantId, document, deletedAt: null },
      include: { address: true },
    });
    if (!patient) return null;
    return this.toDomain(patient);
  }

  async save(patient: Patient): Promise<void> {
    await prisma.patient.create({
      data: {
        id: patient.id,
        tenantId: patient.tenantId,
        name: patient.name,
        email: patient.email ?? null,
        phone: patient.phone,
        document: patient.document ?? null,
        birthDate: patient.birthDate ?? null,
        gender: patient.gender ?? null,
        notes: patient.notes ?? null,
        status: patient.status.toUpperCase() as any,
        createdAt: patient.createdAt,
        updatedAt: patient.updatedAt,
        address: patient.address
          ? {
              create: {
                street: patient.address.street ?? '',
                number: patient.address.number ?? '',
                complement: patient.address.complement ?? null,
                neighborhood: patient.address.neighborhood ?? null,
                city: patient.address.city ?? '',
                state: patient.address.state ?? '',
                zipCode: patient.address.zipCode ?? '',
              },
            }
          : undefined,
      },
    });
  }

  async update(patient: Patient): Promise<void> {
    await prisma.patient.update({
      where: { id: patient.id },
      data: {
        name: patient.name,
        email: patient.email ?? null,
        phone: patient.phone,
        document: patient.document ?? null,
        birthDate: patient.birthDate ?? null,
        gender: patient.gender ?? null,
        notes: patient.notes ?? null,
        status: patient.status.toUpperCase() as any,
        updatedAt: patient.updatedAt,
        address: patient.address
          ? {
              upsert: {
                create: {
                  street: patient.address.street ?? '',
                  number: patient.address.number ?? '',
                  complement: patient.address.complement ?? null,
                  neighborhood: patient.address.neighborhood ?? null,
                  city: patient.address.city ?? '',
                  state: patient.address.state ?? '',
                  zipCode: patient.address.zipCode ?? '',
                },
                update: {
                  street: patient.address.street ?? '',
                  number: patient.address.number ?? '',
                  complement: patient.address.complement ?? null,
                  neighborhood: patient.address.neighborhood ?? null,
                  city: patient.address.city ?? '',
                  state: patient.address.state ?? '',
                  zipCode: patient.address.zipCode ?? '',
                },
              },
            }
          : undefined,
      },
    });
  }

  private toDomain(raw: any): Patient {
    return {
      id: raw.id,
      tenantId: raw.tenantId,
      name: raw.name,
      email: raw.email ?? undefined,
      phone: raw.phone ?? '',
      document: raw.document ?? undefined,
      birthDate: raw.birthDate ?? undefined,
      gender: raw.gender as Patient['gender'] ?? undefined,
      address: raw.address
        ? {
            street: raw.address.street,
            number: raw.address.number,
            complement: raw.address.complement ?? undefined,
            neighborhood: raw.address.neighborhood ?? undefined,
            city: raw.address.city,
            state: raw.address.state,
            zipCode: raw.address.zipCode,
          }
        : undefined,
      notes: raw.notes ?? undefined,
      status: (raw.status?.toLowerCase() ?? 'active') as Patient['status'],
      createdAt: raw.createdAt,
      updatedAt: raw.updatedAt,
    };
  }
}
