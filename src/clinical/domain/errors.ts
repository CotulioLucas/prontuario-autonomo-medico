/**
 * Erros de dominio do contexto Clinico (Pacientes).
 */

export class ClinicalError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'ClinicalError';
  }
}

export class PatientNotFoundError extends ClinicalError {
  constructor() {
    super('Patient not found', 'PATIENT_NOT_FOUND');
  }
}

export class DocumentAlreadyExistsError extends ClinicalError {
  constructor() {
    super('Document already exists for this tenant', 'CPF_ALREADY_EXISTS');
  }
}

export class DuplicateLinkError extends ClinicalError {
  constructor() {
    super('Link between patient and professional already exists', 'DUPLICATE_LINK');
  }
}

export class LinkNotFoundError extends ClinicalError {
  constructor() {
    super('Patient link not found', 'LINK_NOT_FOUND');
  }
}

export class TariffRequiredError extends ClinicalError {
  constructor() {
    super('Tariff is required for patient link', 'TARIFF_REQUIRED');
  }
}

export class ConsentRequiredError extends ClinicalError {
  constructor() {
    super('LGPD consent is required', 'CONSENT_REQUIRED');
  }
}

export class EvolutionAlreadyExistsError extends ClinicalError {
  constructor() {
    super('Evolution already exists for this attendance', 'EVOLUTION_ALREADY_EXISTS');
  }
}

export class EvolutionNotFoundError extends ClinicalError {
  constructor() {
    super('Evolution not found', 'EVOLUTION_NOT_FOUND');
  }
}

export class AttendanceNotFoundError extends ClinicalError {
  constructor() {
    super('Attendance not found', 'ATTENDANCE_NOT_FOUND');
  }
}

export class NotAuthorizedError extends ClinicalError {
  constructor() {
    super('Only linked professional can create or modify evolution', 'NOT_AUTHORIZED');
  }
}
