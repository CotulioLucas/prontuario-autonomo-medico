/**
 * clinical/application — casos de uso, handlers e ports.
 * @see US-ARQ-03, US-ARQ-04, US-BE-F02-01, US-BE-F02-02
 */

export {
  createAttendanceHandler,
  type CreateAttendanceUseCase,
} from './handlers/appointment-completed.handler.js';

export { CreateAttendanceUseCaseImpl } from './use-cases/create-attendance.use-case.js';
export { type AttendanceRepositoryPort, type CreateAttendanceOutput } from './ports.js';

export {
  ListPatientsUseCase,
  GetPatientUseCase,
  CreatePatientUseCase,
  UpdatePatientUseCase,
  type ListPatientsInput,
  type ListPatientsOutput,
} from './use-cases/patient.use-cases.js';

export {
  ListPatientLinksUseCase,
  CreatePatientLinkUseCase,
  UpdatePatientLinkUseCase,
  DeletePatientLinkUseCase,
  type CreateLinkInput,
  type UpdateLinkInput,
} from './use-cases/patient-link.use-cases.js';

export {
  ListPendingRecordsUseCase,
  ListEvolutionsUseCase,
  CreateEvolutionUseCase,
  UpdateEvolutionUseCase,
  type ListPendingRecordsInput,
  type PendingRecord,
  type CreateEvolutionUseCaseInput,
} from './use-cases/evolution.use-cases.js';
