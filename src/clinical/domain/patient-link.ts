/**
 * Vinculo Profissional-Paciente — entidade de dominio.
 * Define a relacao e tarifa entre um profissional e um paciente.
 * @see US-BE-F02-02, DR-FI-4
 */

import type { TenantId, UserId } from '../../shared/types.js';

export type TariffType = 'session' | 'hour';

export interface Tariff {
  amount: number;
  currency: string;
  type: TariffType;
}

export interface PatientLink {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly patientId: string;
  readonly professionalId: UserId;
  readonly tariff: Tariff;
  readonly active: boolean;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreatePatientLinkInput {
  tenantId: TenantId;
  patientId: string;
  professionalId: UserId;
  tariff: Tariff;
}

export interface UpdatePatientLinkInput {
  tariff?: Tariff;
  active?: boolean;
}

export interface PatientLinkRepository {
  findById(id: string): Promise<PatientLink | null>;
  findByPatientId(patientId: string): Promise<PatientLink[]>;
  findByPatientAndProfessional(patientId: string, professionalId: string): Promise<PatientLink | null>;
  save(link: PatientLink): Promise<void>;
  update(link: PatientLink): Promise<void>;
  delete(id: string): Promise<void>;
}
