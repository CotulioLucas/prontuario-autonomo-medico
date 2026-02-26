/**
 * Use cases de gestao de evolucao.
 * @see US-BE-F04-01, DR-CL-2, DR-CL-3, DR-CO-1
 */

import type { Evolution, EvolutionRepository, CreateEvolutionInput } from '../../domain/evolution.js';
import type { AttendanceRepository } from '../../domain/attendance.js';
import type { PatientLinkRepository } from '../../domain/patient-link.js';
import {
  EvolutionAlreadyExistsError,
  EvolutionNotFoundError,
  AttendanceNotFoundError,
  NotAuthorizedError,
  PatientNotFoundError,
} from '../../domain/errors.js';
import type { PatientRepository } from '../../domain/patient.js';

export interface ListPendingRecordsInput {
  patientId: string;
  tenantId: string;
}

export interface PendingRecord {
  attendanceId: string;
  patientId: string;
  professionalId: string;
  completedAt: Date;
  appointmentType: string;
}

export class ListPendingRecordsUseCase {
  constructor(
    private readonly attendanceRepository: AttendanceRepository,
    private readonly evolutionRepository: EvolutionRepository,
    private readonly patientRepository: PatientRepository
  ) {}

  async execute(input: ListPendingRecordsInput): Promise<PendingRecord[]> {
    const patient = await this.patientRepository.findById(input.patientId);
    if (!patient || patient.tenantId !== input.tenantId) {
      throw new PatientNotFoundError();
    }

    const attendances = await this.attendanceRepository.findByPatientId?.(input.patientId);
    if (!attendances || attendances.length === 0) {
      return [];
    }

    const pendingRecords: PendingRecord[] = [];

    for (const attendance of attendances) {
      const evolution = await this.evolutionRepository.findByAttendanceId(attendance.id);
      if (!evolution) {
        pendingRecords.push({
          attendanceId: attendance.id,
          patientId: attendance.patientId,
          professionalId: attendance.professionalId,
          completedAt: attendance.completedAt,
          appointmentType: attendance.appointmentType,
        });
      }
    }

    return pendingRecords;
  }
}

export class ListEvolutionsUseCase {
  constructor(
    private readonly evolutionRepository: EvolutionRepository,
    private readonly patientRepository: PatientRepository
  ) {}

  async execute(patientId: string, tenantId: string): Promise<Evolution[]> {
    const patient = await this.patientRepository.findById(patientId);
    if (!patient || patient.tenantId !== tenantId) {
      throw new PatientNotFoundError();
    }

    return this.evolutionRepository.findByPatientId(patientId);
  }
}

export interface CreateEvolutionUseCaseInput extends CreateEvolutionInput {
  professionalId: string;
}

export class CreateEvolutionUseCase {
  constructor(
    private readonly evolutionRepository: EvolutionRepository,
    private readonly attendanceRepository: AttendanceRepository,
    private readonly patientLinkRepository: PatientLinkRepository
  ) {}

  async execute(input: CreateEvolutionUseCaseInput): Promise<Evolution> {
    const attendance = await this.attendanceRepository.findById(input.attendanceId);
    if (!attendance || attendance.tenantId !== input.tenantId) {
      throw new AttendanceNotFoundError();
    }

    const existingEvolution = await this.evolutionRepository.findByAttendanceId(input.attendanceId);
    if (existingEvolution) {
      throw new EvolutionAlreadyExistsError();
    }

    const links = await this.patientLinkRepository.findByPatientId(input.patientId);
    const hasLink = links.some(
      (link) => link.professionalId === input.professionalId && link.active
    );
    if (!hasLink) {
      throw new NotAuthorizedError();
    }

    const evolution: Evolution = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      attendanceId: input.attendanceId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      content: input.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.evolutionRepository.save(evolution);

    return evolution;
  }
}

export class UpdateEvolutionUseCase {
  constructor(
    private readonly evolutionRepository: EvolutionRepository,
    private readonly patientLinkRepository: PatientLinkRepository
  ) {}

  async execute(
    evolutionId: string,
    tenantId: string,
    professionalId: string,
    content: string
  ): Promise<Evolution> {
    const evolution = await this.evolutionRepository.findById(evolutionId);
    if (!evolution || evolution.tenantId !== tenantId) {
      throw new EvolutionNotFoundError();
    }

    const links = await this.patientLinkRepository.findByPatientId(evolution.patientId);
    const hasLink = links.some(
      (link) => link.professionalId === professionalId && link.active
    );
    if (!hasLink) {
      throw new NotAuthorizedError();
    }

    const updatedEvolution: Evolution = {
      ...evolution,
      content,
      updatedAt: new Date(),
    };

    await this.evolutionRepository.update(updatedEvolution);

    return updatedEvolution;
  }
}
