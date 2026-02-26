/**
 * clinical/domain — Patient, Attendance, Evolution, PatientLink; eventos.
 * @see docs/domain/aggregates.md
 */

export {
  type Attendance,
  type CreateAttendanceInput,
  type AttendanceRepository,
} from './attendance.js';

export {
  type Patient,
  type CreatePatientInput,
  type UpdatePatientInput,
  type PatientStatus,
  type PatientRepository,
} from './patient.js';

export {
  type PatientLink,
  type CreatePatientLinkInput,
  type UpdatePatientLinkInput,
  type Tariff,
  type TariffType,
  type PatientLinkRepository,
} from './patient-link.js';

export {
  type Evolution,
  type CreateEvolutionInput,
  type EvolutionRepository,
} from './evolution.js';

export * from './errors.js';
