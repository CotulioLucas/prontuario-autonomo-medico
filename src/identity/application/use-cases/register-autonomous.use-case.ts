/**
 * Use case de cadastro autonomo.
 * @see US-BE-F01-02, DR-IA-1, DR-IA-2, DR-CO-3
 */

import type { Tenant, User, ProfessionalInfo, Address } from '../../domain/entities.js';
import type { TenantRepository, UserRepository, ConsentRepository, EmailConfirmationRepository } from '../../domain/ports.js';
import {
  EmailAlreadyExistsError,
  DocumentAlreadyExistsError,
  ConsentRequiredError,
} from '../../domain/errors.js';

export interface RegisterAutonomousInput {
  name: string;
  email: string;
  phone: string;
  cpf: string;
  password: string;
  professionalInfo: ProfessionalInfo;
  address: Address;
  lgpdConsentVersion: string;
}

export interface RegisterAutonomousOutput {
  user: User;
  tenant: Tenant;
}

export interface PasswordHasher {
  hash(password: string): Promise<string>;
}

export interface EmailService {
  sendConfirmationEmail(email: string, token: string, userName: string): Promise<void>;
}

export class RegisterAutonomousUseCase {
  constructor(
    private readonly tenantRepository: TenantRepository,
    private readonly userRepository: UserRepository,
    private readonly consentRepository: ConsentRepository,
    private readonly emailConfirmationRepository: EmailConfirmationRepository,
    private readonly passwordHasher: PasswordHasher,
    private readonly emailService: EmailService
  ) {}

  async execute(input: RegisterAutonomousInput): Promise<RegisterAutonomousOutput> {
    if (!input.lgpdConsentVersion) {
      throw new ConsentRequiredError();
    }

    const existingUser = await this.userRepository.findByEmail(input.email);
    if (existingUser) {
      throw new EmailAlreadyExistsError();
    }

    const existingCpf = await this.userRepository.findByDocument(input.cpf);
    if (existingCpf) {
      throw new DocumentAlreadyExistsError('CPF');
    }

    if (!this.validateCpf(input.cpf)) {
      throw new Error('Invalid CPF');
    }

    const tenantId = crypto.randomUUID();
    const userId = crypto.randomUUID();

    const tenant: Tenant = {
      id: tenantId,
      type: 'autonomous',
      name: input.name,
      document: input.cpf,
      email: input.email,
      phone: input.phone,
      address: input.address,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const passwordHash = await this.passwordHasher.hash(input.password);

    const user: User = {
      id: userId,
      tenantId,
      email: input.email,
      passwordHash,
      name: input.name,
      document: input.cpf,
      phone: input.phone,
      roles: ['admin', 'professional'],
      status: 'pending_confirmation',
      emailConfirmed: false,
      failedLoginAttempts: 0,
      professionalInfo: input.professionalInfo,
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

    await this.emailService.sendConfirmationEmail(input.email, confirmationToken, input.name);

    return { user, tenant };
  }

  private validateCpf(cpf: string): boolean {
    const cleanCpf = cpf.replace(/\D/g, '');
    
    if (cleanCpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cleanCpf)) return false;

    let sum = 0;
    for (let i = 0; i < 9; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (10 - i);
    }
    let remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(9))) return false;

    sum = 0;
    for (let i = 0; i < 10; i++) {
      sum += parseInt(cleanCpf.charAt(i)) * (11 - i);
    }
    remainder = (sum * 10) % 11;
    if (remainder === 10 || remainder === 11) remainder = 0;
    if (remainder !== parseInt(cleanCpf.charAt(10))) return false;

    return true;
  }
}
