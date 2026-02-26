/**
 * Use case para marcar agendamento como realizado.
 * @see US-BE-F03-02, DR-CL-1
 */

import type { Appointment, AppointmentRepository } from '../../domain/appointment.js';
import { AppointmentNotFoundError, InvalidStatusError } from '../../domain/errors.js';
import { publishEvent } from '../../../infrastructure/events/index.js';
import { createAppointmentCompletedEvent } from '../../domain/index.js';

export class CompleteAppointmentUseCase {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  async execute(id: string, tenantId: string, completedBy: string): Promise<Appointment> {
    const appointment = await this.appointmentRepository.findById(id);

    if (!appointment || appointment.tenantId !== tenantId) {
      throw new AppointmentNotFoundError();
    }

    if (appointment.status !== 'scheduled' && appointment.status !== 'confirmed') {
      throw new InvalidStatusError('Only scheduled or confirmed appointments can be completed');
    }

    const completedAt = new Date();
    const completedAppointment: Appointment = {
      ...appointment,
      status: 'completed',
      updatedAt: completedAt,
    };

    await this.appointmentRepository.update(completedAppointment);

    const event = createAppointmentCompletedEvent({
      tenantId: appointment.tenantId,
      aggregateId: appointment.id,
      appointmentId: appointment.id,
      patientId: appointment.patientId,
      professionalId: appointment.professionalId,
      scheduledAt: appointment.date,
      completedAt,
      appointmentType: appointment.type,
      triggeredBy: completedBy,
    });

    await publishEvent(event);

    return completedAppointment;
  }
}
