/**
 * Erros de dominio do contexto Billing.
 */

export class BillingError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'BillingError';
  }
}

export class ReceivableNotFoundError extends BillingError {
  constructor() {
    super('Receivable not found', 'RECEIVABLE_NOT_FOUND');
  }
}

export class AlreadyPaidError extends BillingError {
  constructor() {
    super('Receivable is already paid', 'ALREADY_PAID');
  }
}

export class CancelledReceivableError extends BillingError {
  constructor() {
    super('Cannot pay a cancelled receivable', 'RECEIVABLE_CANCELLED');
  }
}
