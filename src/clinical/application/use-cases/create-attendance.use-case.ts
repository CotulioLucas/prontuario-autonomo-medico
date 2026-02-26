/**
 * Caso de uso: Criar Atendimento.
 * @see US-ARQ-03, US-ARQ-04
 */

import type { Attendance, CreateAttendanceInput } from '../../domain/attendance.js';
import type { AttendanceRepositoryPort } from '../ports.js';
import { generateId } from '../../../shared/types.js';

export class CreateAttendanceUseCaseImpl {
  constructor(private readonly repository: AttendanceRepositoryPort) {}

  async execute(input: CreateAttendanceInput): Promise<Attendance> {
    const existing = await this.repository.findByAppointmentId(input.appointmentId);
    if (existing) {
      throw new Error(`Attendance already exists for appointment ${input.appointmentId}`);
    }

    const attendance: Attendance = {
      id: generateId(),
      ...input,
      status: 'completed',
      createdAt: new Date(),
    };

    await this.repository.save(attendance);
    return attendance;
  }
}

export type { CreateAttendanceUseCase } from '../handlers/appointment-completed.handler.js';
