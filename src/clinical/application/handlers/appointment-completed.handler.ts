/**
 * Handler para criar Atendimento quando AgendamentoRealizado é publicado.
 * @see ADR 0004, US-ARQ-03
 */

import type { AppointmentCompletedEvent } from '../../../scheduling/domain/index.js';
import type { CreateAttendanceInput, Attendance } from '../../domain/attendance.js';

export interface CreateAttendanceUseCase {
  execute(input: CreateAttendanceInput): Promise<Attendance>;
}

export function createAttendanceHandler(
  createAttendanceUseCase: CreateAttendanceUseCase
) {
  return async (event: AppointmentCompletedEvent): Promise<void> => {
    const input: CreateAttendanceInput = {
      tenantId: event.tenantId,
      appointmentId: event.appointmentId,
      patientId: event.patientId,
      professionalId: event.professionalId,
      scheduledAt: event.scheduledAt,
      completedAt: event.completedAt,
      appointmentType: event.appointmentType,
    };

    await createAttendanceUseCase.execute(input);
  };
}
