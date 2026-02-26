/**
 * Entidades do contexto Identity.
 * @see DR-IA-1, DR-IA-2, DR-IA-3, DR-IA-4
 */

export type TenantType = 'autonomous' | 'clinic';

export interface Tenant {
  id: string;
  type: TenantType;
  name: string;
  document: string;
  email: string;
  phone?: string;
  address?: Address;
  logoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood?: string;
  city: string;
  state: string;
  zipCode: string;
}

export type UserRole = 'admin' | 'professional' | 'receptionist' | 'financial';

export type UserStatus = 'active' | 'inactive' | 'pending_confirmation';

export interface User {
  id: string;
  tenantId: string;
  email: string;
  passwordHash: string;
  name: string;
  document?: string;
  phone?: string;
  roles: UserRole[];
  status: UserStatus;
  emailConfirmed: boolean;
  failedLoginAttempts: number;
  lockedUntil?: Date;
  professionalInfo?: ProfessionalInfo;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProfessionalInfo {
  specialty: string;
  registerNumber?: string;
  registerType?: 'CRM' | 'CRP' | 'CREFITO' | 'OUTRO';
  registerUf?: string;
}

export interface Invite {
  id: string;
  tenantId: string;
  email: string;
  role: UserRole;
  invitedBy: string;
  token: string;
  expiresAt: Date;
  acceptedAt?: Date;
  acceptedBy?: string;
  createdAt: Date;
}

export interface Consent {
  id: string;
  tenantId: string;
  userId?: string;
  type: 'LGPD' | 'TERMS' | 'PRIVACY';
  version: string;
  acceptedAt: Date;
  ipAddress?: string;
}

export interface PasswordResetToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  usedAt?: Date;
  createdAt: Date;
}

export interface EmailConfirmationToken {
  id: string;
  userId: string;
  token: string;
  expiresAt: Date;
  confirmedAt?: Date;
  createdAt: Date;
}

export interface Session {
  id: string;
  userId: string;
  tenantId: string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface UserWithTenant extends User {
  tenant: Tenant;
}
