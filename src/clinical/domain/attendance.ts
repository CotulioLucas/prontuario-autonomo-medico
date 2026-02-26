/**
 * Atendimento — entidade de domínio do contexto Clínico.
 * Criado quando um agendamento é marcado como realizado.
 * @see docs/domain/aggregates.md, US-ARQ-03
 */

import type { TenantId, UserId } from '../../shared/types.js';

export interface Attendance {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly appointmentId: string;
  readonly patientId: string;
  readonly professionalId: UserId;
  readonly scheduledAt: Date;
  readonly completedAt: Date;
  readonly appointmentType: string;
  readonly status: 'completed' | 'cancelled';
  readonly createdAt: Date;
}

export interface CreateAttendanceInput {
  tenantId: TenantId;
  appointmentId: string;
  patientId: string;
  professionalId: UserId;
  scheduledAt: Date;
  completedAt: Date;
  appointmentType: string;
}

export interface AttendanceRepository {
  findById(id: string): Promise<Attendance | null>;
  findByAppointmentId(appointmentId: string): Promise<Attendance | null>;
  findByPatientId(patientId: string): Promise<Attendance[]>;
  save(attendance: Attendance): Promise<void>;
}
