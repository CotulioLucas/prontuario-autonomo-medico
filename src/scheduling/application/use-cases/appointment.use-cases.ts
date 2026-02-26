/**
 * Use cases de gestao de agendamentos.
 * @see US-BE-F03-01, DR-AG-1, DR-AG-2, DR-AG-3
 */

import type { Appointment, AppointmentStatus, AppointmentType, AppointmentRepository, CreateAppointmentInput, UpdateAppointmentInput } from '../../domain/appointment.js';
import { AppointmentNotFoundError, AppointmentConflictError, NoLinkError, InvalidStatusError } from '../../domain/errors.js';
import type { PatientLinkRepository } from '../../../clinical/domain/patient-link.js';

function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function checkOverlap(
  existingAppointments: Appointment[],
  newDate: Date,
  newStartTime: string,
  newDuration: number,
  excludeId?: string
): boolean {
  const newStart = timeToMinutes(newStartTime);
  const newEnd = newStart + newDuration;

  for (const apt of existingAppointments) {
    if (excludeId && apt.id === excludeId) continue;
    if (apt.status === 'cancelled') continue;

    const aptDate = new Date(apt.date);
    if (aptDate.toDateString() !== newDate.toDateString()) continue;

    const aptStart = timeToMinutes(apt.startTime);
    const aptEnd = aptStart + apt.duration;

    if (newStart < aptEnd && newEnd > aptStart) {
      return true;
    }
  }

  return false;
}

export interface ListAppointmentsInput {
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  date?: Date;
  professionalId?: string;
  patientId?: string;
  status?: AppointmentStatus;
}

export class ListAppointmentsUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: ListAppointmentsInput): Promise<Appointment[]> {
    return this.appointmentRepository.findByTenantId(input.tenantId, {
      startDate: input.startDate,
      endDate: input.endDate,
      date: input.date,
      professionalId: input.professionalId,
      patientId: input.patientId,
      status: input.status,
    });
  }
}

export interface GetAppointmentInput {
  id: string;
  tenantId: string;
}

export class GetAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: GetAppointmentInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(input.id);

    if (!appointment || appointment.tenantId !== input.tenantId) {
      throw new AppointmentNotFoundError();
    }

    return appointment;
  }
}

export interface CheckOverlapInput {
  tenantId: string;
  professionalId: string;
  date: Date;
  startTime: string;
  duration: number;
  excludeId?: string;
}

export class CheckOverlapUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(input: CheckOverlapInput): Promise<{ hasOverlap: boolean; conflictingAppointment?: Appointment }> {
    const existingAppointments = await this.appointmentRepository.findByProfessionalAndDate(
      input.professionalId,
      input.date
    );

    const tenantAppointments = existingAppointments.filter(
      (apt) => apt.tenantId === input.tenantId
    );

    const hasOverlap = checkOverlap(
      tenantAppointments,
      input.date,
      input.startTime,
      input.duration,
      input.excludeId
    );

    let conflictingAppointment: Appointment | undefined;
    if (hasOverlap) {
      conflictingAppointment = tenantAppointments.find((apt) => {
        if (apt.status === 'cancelled') return false;
        if (input.excludeId && apt.id === input.excludeId) return false;
        const aptStart = timeToMinutes(apt.startTime);
        const aptEnd = aptStart + apt.duration;
        const newStart = timeToMinutes(input.startTime);
        const newEnd = newStart + input.duration;
        return newStart < aptEnd && newEnd > aptStart;
      });
    }

    return { hasOverlap, conflictingAppointment };
  }
}

export class CreateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientLinkRepository: PatientLinkRepository
  ) {}

  async execute(input: CreateAppointmentInput): Promise<Appointment> {
    const links = await this.patientLinkRepository.findByPatientId(input.patientId);
    const hasLink = links.some(
      (link) => link.professionalId === input.professionalId && link.active
    );

    if (!hasLink) {
      throw new NoLinkError();
    }

    const existingAppointments = await this.appointmentRepository.findByProfessionalAndDate(
      input.professionalId,
      input.date
    );

    const tenantAppointments = existingAppointments.filter(
      (apt) => apt.tenantId === input.tenantId
    );

    if (checkOverlap(tenantAppointments, input.date, input.startTime, input.duration)) {
      throw new AppointmentConflictError();
    }

    const appointment: Appointment = {
      id: crypto.randomUUID(),
      tenantId: input.tenantId,
      patientId: input.patientId,
      professionalId: input.professionalId,
      date: input.date,
      startTime: input.startTime,
      duration: input.duration,
      type: input.type,
      status: 'scheduled',
      notes: input.notes,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.appointmentRepository.save(appointment);

    return appointment;
  }
}

export class UpdateAppointmentUseCase {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly patientLinkRepository?: PatientLinkRepository
  ) {}

  async execute(id: string, tenantId: string, input: UpdateAppointmentInput): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment || appointment.tenantId !== tenantId) {
      throw new AppointmentNotFoundError();
    }

    if (appointment.status === 'completed') {
      throw new InvalidStatusError('Cannot update completed appointment');
    }

    const newDate = input.date ?? appointment.date;
    const newStartTime = input.startTime ?? appointment.startTime;
    const newDuration = input.duration ?? appointment.duration;
    const newProfessionalId = input.professionalId ?? appointment.professionalId;
    const newPatientId = input.patientId ?? appointment.patientId;

    if (input.patientId && this.patientLinkRepository) {
      const links = await this.patientLinkRepository.findByPatientId(input.patientId);
      const hasLink = links.some(
        (link) => link.professionalId === newProfessionalId && link.active
      );
      if (!hasLink) {
        throw new NoLinkError();
      }
    }

    const existingAppointments = await this.appointmentRepository.findByProfessionalAndDate(
      newProfessionalId,
      newDate
    );

    const tenantAppointments = existingAppointments.filter(
      (apt) => apt.tenantId === tenantId
    );

    if (checkOverlap(tenantAppointments, newDate, newStartTime, newDuration, id)) {
      throw new AppointmentConflictError();
    }

    const updatedAppointment: Appointment = {
      ...appointment,
      patientId: newPatientId,
      professionalId: newProfessionalId,
      date: newDate,
      startTime: newStartTime,
      duration: newDuration,
      type: input.type ?? appointment.type,
      notes: input.notes ?? appointment.notes,
      updatedAt: new Date(),
    };

    await this.appointmentRepository.update(updatedAppointment);

    return updatedAppointment;
  }
}

export class CancelAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(id: string, tenantId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment || appointment.tenantId !== tenantId) {
      throw new AppointmentNotFoundError();
    }

    if (appointment.status === 'completed') {
      throw new InvalidStatusError('Cannot cancel completed appointment');
    }

    const cancelledAppointment: Appointment = {
      ...appointment,
      status: 'cancelled',
      updatedAt: new Date(),
    };

    await this.appointmentRepository.update(cancelledAppointment);

    return cancelledAppointment;
  }
}

export class ConfirmAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(id: string, tenantId: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment || appointment.tenantId !== tenantId) {
      throw new AppointmentNotFoundError();
    }

    if (appointment.status !== 'scheduled') {
      throw new InvalidStatusError('Only scheduled appointments can be confirmed');
    }

    const confirmedAppointment: Appointment = {
      ...appointment,
      status: 'confirmed',
      updatedAt: new Date(),
    };

    await this.appointmentRepository.update(confirmedAppointment);

    return confirmedAppointment;
  }
}
