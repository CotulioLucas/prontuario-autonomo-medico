/**
 * Evolucao — entidade de dominio do contexto Clinico.
 * Uma evolucao por atendimento (DR-CL-2).
 * @see US-BE-F04-01, DR-CL-2, DR-CL-3, DR-CO-1
 */

import type { TenantId, UserId } from '../../shared/types.js';

export interface Evolution {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly attendanceId: string;
  readonly patientId: string;
  readonly professionalId: UserId;
  readonly content: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateEvolutionInput {
  tenantId: TenantId;
  attendanceId: string;
  patientId: string;
  professionalId: UserId;
  content: string;
}

export interface EvolutionRepository {
  findById(id: string): Promise<Evolution | null>;
  findByAttendanceId(attendanceId: string): Promise<Evolution | null>;
  findByPatientId(patientId: string): Promise<Evolution[]>;
  save(evolution: Evolution): Promise<void>;
  update(evolution: Evolution): Promise<void>;
}
