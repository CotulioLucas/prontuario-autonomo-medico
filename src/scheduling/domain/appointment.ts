/**
 * Agendamento — entidade de dominio do contexto Scheduling.
 * @see US-BE-F03-01, DR-AG-1, DR-AG-2, DR-AG-3
 */

import type { TenantId, UserId } from '../../shared/types.js';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
export type AppointmentType = 'consultation' | 'psychology' | 'physiotherapy' | 'return' | 'other';

export interface Appointment {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly patientId: string;
  readonly professionalId: UserId;
  readonly date: Date;
  readonly startTime: string;
  readonly duration: number;
  readonly type: AppointmentType;
  readonly status: AppointmentStatus;
  readonly notes?: string;
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface CreateAppointmentInput {
  tenantId: TenantId;
  patientId: string;
  professionalId: UserId;
  date: Date;
  startTime: string;
  duration: number;
  type: AppointmentType;
  notes?: string;
}

export interface UpdateAppointmentInput {
  patientId?: string;
  professionalId?: UserId;
  date?: Date;
  startTime?: string;
  duration?: number;
  type?: AppointmentType;
  notes?: string;
}

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByTenantId(tenantId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    date?: Date;
    professionalId?: string;
    patientId?: string;
    status?: AppointmentStatus;
  }): Promise<Appointment[]>;
  findByProfessionalAndDate(professionalId: string, date: Date): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<void>;
  update(appointment: Appointment): Promise<void>;
}
