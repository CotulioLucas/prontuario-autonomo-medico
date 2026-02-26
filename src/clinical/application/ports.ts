/**
 * Ports (interfaces) do contexto Clinical.
 * Application define ports; Adapters implementam.
 * @see docs/architecture/style.md, US-ARQ-04
 */

import type { Attendance, CreateAttendanceInput } from '../domain/attendance.js';

export interface AttendanceRepositoryPort {
  findById(id: string): Promise<Attendance | null>;
  findByAppointmentId(appointmentId: string): Promise<Attendance | null>;
  save(attendance: Attendance): Promise<void>;
}

export interface CreateAttendanceOutput {
  attendance: Attendance;
}
