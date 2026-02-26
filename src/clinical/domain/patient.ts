/**
 * Paciente — entidade de dominio do contexto Clinico.
 * @see US-BE-F02-01, DR-IA-4, DR-CO-1, DR-CO-3
 */

import type { TenantId } from '../../shared/types.js';

export type PatientStatus = 'active' | 'inactive';

export interface Patient {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly email?: string;
  readonly phone: string;
  readonly document?: string;
  readonly birthDate?: Date;
  readonly gender?: 'male' | 'female' | 'other';
  readonly address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  readonly notes?: string;
  readonly status: PatientStatus;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreatePatientInput {
  tenantId: TenantId;
  name: string;
  email?: string;
  phone: string;
  document?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
}

export interface UpdatePatientInput {
  name?: string;
  email?: string;
  phone?: string;
  document?: string;
  birthDate?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood?: string;
    city: string;
    state: string;
    zipCode: string;
  };
  notes?: string;
  status?: PatientStatus;
}

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByTenantId(tenantId: string, options?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ patients: Patient[]; total: number }>;
  findByDocument(tenantId: string, document: string): Promise<Patient | null>;
  save(patient: Patient): Promise<void>;
  update(patient: Patient): Promise<void>;
}
