/**
 * clinical/adapters — Implementacoes de portas (persistence, HTTP).
 * @see US-ARQ-04, US-BE-F02-01, US-BE-F02-02, US-BE-F04-01
 */

export { InMemoryAttendanceRepository } from './persistence/attendance.repository.js';
export { patientRoutes, type PatientRoutesConfig } from './http/patient.routes.js';
export { evolutionRoutes, type EvolutionRoutesConfig } from './http/evolution.routes.js';
