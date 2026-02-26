/**
 * scheduling/domain — Agenda, Appointment; VOs; eventos Agendamento*.
 * @see ADR 0004, docs/domain/domain-events.md
 */

export {
  APPOINTMENT_COMPLETED_EVENT,
  createAppointmentCompletedEvent,
  type AppointmentCompletedEvent,
} from './events.js';

export {
  type Appointment,
  type AppointmentStatus,
  type AppointmentType,
  type CreateAppointmentInput,
  type UpdateAppointmentInput,
  type AppointmentRepository,
} from './appointment.js';

export * from './errors.js';
