/**
 * scheduling/application — casos de uso de agendamento.
 * @see US-BE-F03-01, US-BE-F03-02
 */

export {
  ListAppointmentsUseCase,
  GetAppointmentUseCase,
  CheckOverlapUseCase,
  CreateAppointmentUseCase,
  UpdateAppointmentUseCase,
  CancelAppointmentUseCase,
  ConfirmAppointmentUseCase,
  type ListAppointmentsInput,
  type GetAppointmentInput,
  type CheckOverlapInput,
} from './use-cases/appointment.use-cases.js';

export { CompleteAppointmentUseCase } from './use-cases/complete-appointment.use-case.js';
