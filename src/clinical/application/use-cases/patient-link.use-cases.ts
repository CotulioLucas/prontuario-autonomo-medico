/**
 * Use cases de vinculos paciente-profissional.
 * @see US-BE-F02-02, DR-FI-4
 */

import type { PatientLink, CreatePatientLinkInput, UpdatePatientLinkInput, PatientLinkRepository } from '../../domain/patient-link.js';
import type { PatientRepository } from '../../domain/patient.js';
import { LinkNotFoundError, DuplicateLinkError, TariffRequiredError, PatientNotFoundError } from '../../domain/errors.js';

export interface CreateLinkInput extends CreatePatientLinkInput {}

export interface UpdateLinkInput {
  linkId: string;
  tenantId: string;
  data: UpdatePatientLinkInput;
}

export class ListPatientLinksUseCase {
  constructor(
    private readonly linkRepository: PatientLinkRepository,
    private readonly patientRepository: PatientRepository
  ) {}

  async execute(patientId: string, tenantId: string): Promise<PatientLink[]> {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient || patient.tenantId !== tenantId) {
      throw new PatientNotFoundError();
    }

    return this.linkRepository.findByPatientId(patientId);
  }
}

export class CreatePatientLinkUseCase {
  constructor(
    private readonly linkRepository: PatientLinkRepository,
    private readonly patientRepository: PatientRepository
  ) {}

  async execute(input: CreateLinkInput): Promise<PatientLink> {
    const patient = await this.patientRepository.findById(input.patientId);
    if (!patient || patient.tenantId !== input.tenantId) {
      throw new PatientNotFoundError();
    }

    if (!input.tariff || input.tariff.amount <= 0) {
      throw new TariffRequiredError();
    }

    const existingLink = await this.linkRepository.findByPatientAndProfessional(
      input.patientId,
      input.professionalId
    );
    if (existingLink) {
      throw new DuplicateLinkError();
    }

    const link: PatientLink = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      tariff: input.tariff,
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.linkRepository.save(link);

    return link;
  }
}

export class UpdatePatientLinkUseCase {
  constructor(private readonly linkRepository: PatientLinkRepository) {}

  async execute(input: UpdateLinkInput): Promise<PatientLink> {
    const link = await this.linkRepository.findById(input.linkId);

    if (!link || link.tenantId !== input.tenantId) {
      throw new LinkNotFoundError();
    }

    const updatedLink: PatientLink = {
      ...link,
      tariff: input.data.tariff ?? link.tariff,
      active: input.data.active ?? link.active,
      updatedAt: new Date(),
    };

    await this.linkRepository.update(updatedLink);

    return updatedLink;
  }
}

export class DeletePatientLinkUseCase {
  constructor(private readonly linkRepository: PatientLinkRepository) {}

  async execute(linkId: string, tenantId: string): Promise<void> {
    const link = await this.linkRepository.findById(linkId);

    if (!link || link.tenantId !== tenantId) {
      throw new LinkNotFoundError();
    }

    await this.linkRepository.delete(linkId);
  }
}
