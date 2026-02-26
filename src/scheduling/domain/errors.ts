/**
 * Erros de dominio do contexto Scheduling.
 */

export class SchedulingError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'SchedulingError';
  }
}

export class AppointmentNotFoundError extends SchedulingError {
  constructor() {
    super('Appointment not found', 'APPOINTMENT_NOT_FOUND');
  }
}

export class AppointmentConflictError extends SchedulingError {
  constructor() {
    super('Appointment conflicts with existing slot', 'APPOINTMENT_CONFLICT');
  }
}

export class NoLinkError extends SchedulingError {
  constructor() {
    super('Patient has no link to this professional', 'NO_LINK');
  }
}

export class InvalidStatusError extends SchedulingError {
  constructor(message: string = 'Invalid status for this operation') {
    super(message, 'INVALID_STATUS');
  }
}
