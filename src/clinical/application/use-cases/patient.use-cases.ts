/**
 * Use cases de gestao de pacientes.
 * @see US-BE-F02-01, DR-IA-4, DR-CO-1, DR-CO-3
 */

import type { Patient, CreatePatientInput, UpdatePatientInput, PatientRepository } from '../../domain/patient.js';
import { PatientNotFoundError, DocumentAlreadyExistsError } from '../../domain/errors.js';

export interface ListPatientsInput {
  tenantId: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface ListPatientsOutput {
  data: Patient[];
  total: number;
  page: number;
  pageSize: number;
}

export class ListPatientsUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: ListPatientsInput): Promise<ListPatientsOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const { patients, total } = await this.patientRepository.findByTenantId(
      input.tenantId,
      {
        search: input.search,
        page,
        limit,
      }
    );

    return {
      data: patients,
      total,
      page,
      pageSize: limit,
    };
  }
}

export class GetPatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(id: string, tenantId: string): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);

    if (!patient || patient.tenantId !== tenantId) {
      throw new PatientNotFoundError();
    }

    return patient;
  }
}

export class CreatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(input: CreatePatientInput): Promise<Patient> {
    if (input.document) {
      const existingPatient = await this.patientRepository.findByDocument(
        input.tenantId,
        input.document
      );
      if (existingPatient) {
        throw new DocumentAlreadyExistsError();
      }
    }

    const patient: Patient = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      name: input.name,
      email: input.email,
      phone: input.phone,
      document: input.document,
      birthDate: input.birthDate,
      gender: input.gender,
      address: input.address,
      notes: input.notes,
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.patientRepository.save(patient);

    return patient;
  }
}

export class UpdatePatientUseCase {
  constructor(private readonly patientRepository: PatientRepository) {}

  async execute(id: string, tenantId: string, input: UpdatePatientInput): Promise<Patient> {
    const patient = await this.patientRepository.findById(id);

    if (!patient || patient.tenantId !== tenantId) {
      throw new PatientNotFoundError();
    }

    if (input.document && input.document !== patient.document) {
      const existingPatient = await this.patientRepository.findByDocument(
        tenantId,
        input.document
      );
      if (existingPatient && existingPatient.id !== id) {
        throw new DocumentAlreadyExistsError();
      }
    }

    const updatedPatient: Patient = {
      ...patient,
      name: input.name ?? patient.name,
      email: input.email ?? patient.email,
      phone: input.phone ?? patient.phone,
      document: input.document ?? patient.document,
      birthDate: input.birthDate ?? patient.birthDate,
      gender: input.gender ?? patient.gender,
      address: input.address ?? patient.address,
      notes: input.notes ?? patient.notes,
      status: input.status ?? patient.status,
      updatedAt: new Date(),
    };

    await this.patientRepository.update(updatedPatient);

    return updatedPatient;
  }
}
