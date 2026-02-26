/**
 * Ports (interfaces) para repositorios do contexto Identity.
 */

import type {
  Tenant,
  User,
  Invite,
  Consent,
  PasswordResetToken,
  EmailConfirmationToken,
  Session,
} from './entities.js';

export interface TenantRepository {
  findById(id: string): Promise<Tenant | null>;
  findByDocument(document: string): Promise<Tenant | null>;
  save(tenant: Tenant): Promise<void>;
}

export interface UserRepository {
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findByTenantId(tenantId: string): Promise<User[]>;
  findByDocument(document: string): Promise<User | null>;
  countByTenantId(tenantId: string): Promise<number>;
  save(user: User): Promise<void>;
  update(user: User): Promise<void>;
}

export interface InviteRepository {
  findById(id: string): Promise<Invite | null>;
  findByToken(token: string): Promise<Invite | null>;
  findByTenantId(tenantId: string): Promise<Invite[]>;
  findByEmail(email: string): Promise<Invite | null>;
  save(invite: Invite): Promise<void>;
  update(invite: Invite): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface ConsentRepository {
  findById(id: string): Promise<Consent | null>;
  findByTenantAndType(tenantId: string, type: string): Promise<Consent | null>;
  save(consent: Consent): Promise<void>;
}

export interface PasswordResetRepository {
  findByToken(token: string): Promise<PasswordResetToken | null>;
  findByUserId(userId: string): Promise<PasswordResetToken | null>;
  save(token: PasswordResetToken): Promise<void>;
  update(token: PasswordResetToken): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export interface EmailConfirmationRepository {
  findByToken(token: string): Promise<EmailConfirmationToken | null>;
  findByUserId(userId: string): Promise<EmailConfirmationToken | null>;
  save(token: EmailConfirmationToken): Promise<void>;
  update(token: EmailConfirmationToken): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}

export interface SessionRepository {
  findById(id: string): Promise<Session | null>;
  findByToken(token: string): Promise<Session | null>;
  findByUserId(userId: string): Promise<Session[]>;
  save(session: Session): Promise<void>;
  delete(id: string): Promise<void>;
  deleteByUserId(userId: string): Promise<void>;
}
