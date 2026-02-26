/**
 * Erros de dominio do contexto Identity.
 */

export class IdentityError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = 'IdentityError';
  }
}

export class InvalidCredentialsError extends IdentityError {
  constructor() {
    super('Invalid email or password', 'INVALID_CREDENTIALS');
  }
}

export class AccountLockedError extends IdentityError {
  constructor(lockedUntil: Date) {
    super(`Account locked until ${lockedUntil.toISOString()}`, 'ACCOUNT_LOCKED');
  }
}

export class EmailNotConfirmedError extends IdentityError {
  constructor() {
    super('Email not confirmed', 'EMAIL_NOT_CONFIRMED');
  }
}

export class EmailAlreadyExistsError extends IdentityError {
  constructor() {
    super('Email already exists', 'EMAIL_ALREADY_EXISTS');
  }
}

export class DocumentAlreadyExistsError extends IdentityError {
  constructor(documentType: 'CPF' | 'CNPJ') {
    super(`${documentType} already exists`, `${documentType}_ALREADY_EXISTS`);
  }
}

export class InviteExpiredError extends IdentityError {
  constructor() {
    super('Invite has expired', 'INVITE_EXPIRED');
  }
}

export class InviteAlreadyAcceptedError extends IdentityError {
  constructor() {
    super('Invite already accepted', 'INVITE_ALREADY_ACCEPTED');
  }
}

export class TenantUserLimitError extends IdentityError {
  constructor() {
    super('Autonomous tenant can only have one user', 'TENANT_USER_LIMIT');
  }
}

export class RoleNotAllowedError extends IdentityError {
  constructor() {
    super('Roles are only allowed in clinic tenants', 'ROLE_NOT_ALLOWED');
  }
}

export class ConsentRequiredError extends IdentityError {
  constructor() {
    super('LGPD consent is required', 'CONSENT_REQUIRED');
  }
}

export class TokenExpiredError extends IdentityError {
  constructor() {
    super('Token has expired', 'TOKEN_EXPIRED');
  }
}

export class InvalidTokenError extends IdentityError {
  constructor() {
    super('Invalid token', 'INVALID_TOKEN');
  }
}

export class AlreadyConfirmedError extends IdentityError {
  constructor() {
    super('Email already confirmed', 'ALREADY_CONFIRMED');
  }
}
