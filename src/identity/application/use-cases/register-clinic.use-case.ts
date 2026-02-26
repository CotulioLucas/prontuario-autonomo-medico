/**
 * Use case de cadastro clinica.
 * @see US-BE-F01-03, DR-IA-1, DR-CO-3
 */

import type { Tenant, User, Address } from '../../domain/entities.js';
import type { TenantRepository, UserRepository, ConsentRepository, EmailConfirmationRepository } from '../../domain/ports.js';
import {
  EmailAlreadyExistsError,
  DocumentAlreadyExistsError,
  ConsentRequiredError,
} from '../../domain/errors.js';

export interface RegisterClinicInput {
  companyName: string;
  cnpj: string;
  address: Address;
  phone: string;
  adminName: string;
  adminEmail: string;
  adminPhone?: string;
  adminPassword: string;
  lgpdConsentVersion: string;
}

export interface RegisterClinicOutput {
  user: User;
  tenant: Tenant;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export interface EmailService {
  sendConfirmationEmail(email: string, token: string, userName: string): Promise<void>;
}

export class RegisterClinicUseCase {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly userRepository: UserRepository,
    private readonly consentRepository: ConsentRepository,
    private readonly emailConfirmationRepository: EmailConfirmationRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly emailService: EmailService
  ) {}

  async execute(input: RegisterClinicInput): Promise<RegisterClinicOutput> {
    if (!input.lgpdConsentVersion) {
      throw new ConsentRequiredError();
    }

    const existingUser = await this.userRepository.findByEmail(input.adminEmail);
    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    const existingTenant = await this.tenantRepository.findByDocument(input.cnpj);
    if (existingTenant) {
      throw new DocumentAlreadyExistsError('CNPJ');
    }

    if (!this.validateCnpj(input.cnpj)) {
      throw new Error('Invalid CNPJ');
    }

    const tenantId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const tenant: Tenant = {
      id: tenantId,
      type: 'clinic',
      name: input.companyName,
      document: input.cnpj,
      email: input.adminEmail,
      phone: input.phone,
      address: input.address,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const passwordHash = await this.passwordHasher.hash(input.adminPassword);

    const user: User = {
      id: userId,
      tenantId,
      email: input.adminEmail,
      passwordHash,
      name: input.adminName,
      phone: input.adminPhone,
      roles: ['admin'],
      status: 'pending_confirmation',
      emailConfirmed: false,
      failedLoginAttempts: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.tenantRepository.save(tenant);
    await this.userRepository.save(user);

    await this.consentRepository.save({
      id: crypto.randomUUID(),
      tenantId,
      userId,
      type: 'LGPD',
      version: input.lgpdConsentVersion,
      acceptedAt: new Date(),
    });

    const confirmationToken = crypto.randomUUID();
    await this.emailConfirmationRepository.save({
      id: crypto.randomUUID(),
      userId,
      token: confirmationToken,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      createdAt: new Date(),
    });

    await this.emailService.sendConfirmationEmail(input.adminEmail, confirmationToken, input.adminName);

    return { user, tenant };
  }

  private validateCnpj(cnpj: string): boolean {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    
    if (cleanCnpj.length !== 14) return false;
    if (/^(\d)\1{14}$/.test(cleanCnpj)) return false;

    const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];

    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * weights1[i];
    }
    let remainder = sum % 11;
    const digit1 = remainder < 2 ? 0 : 11 - remainder;
    if (digit1 !== parseInt(cleanCnpj.charAt(12))) return false;

    sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(cleanCnpj.charAt(i)) * weights2[i];
    }
    remainder = sum % 11;
    const digit2 = remainder < 2 ? 0 : 11 - remainder;
    if (digit2 !== parseInt(cleanCnpj.charAt(13))) return false;

    return true;
  }
}
