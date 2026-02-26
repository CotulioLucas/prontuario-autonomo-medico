/**
 * Handler para criar Conta a Receber quando AgendamentoRealizado é publicado.
 * @see ADR 0004, US-ARQ-03, US-ARQ-04
 */

import type { AppointmentCompletedEvent } from '../../../scheduling/domain/index.js';
import type { CreateReceivableInput, Receivable } from '../../domain/receivable.js';
import type { TariffResolverPort } from '../ports.js';

export interface CreateReceivableUseCase {
  execute(input: CreateReceivableInput): Promise<Receivable>;
}

export function createReceivableHandler(
  createReceivableUseCase: CreateReceivableUseCase,
  tariffResolver: TariffResolverPort
) {
  return async (event: AppointmentCompletedEvent): Promise<void> => {
    const tariff = await tariffResolver.getTariffForPatient(
      event.professionalId,
      event.patientId
    );

    if (!tariff) {
      throw new Error(
        `Tariff not found for professional ${event.professionalId} and patient ${event.patientId}`
      );
    }

    const input: CreateReceivableInput = {
      tenantId: event.tenantId,
      attendanceId: event.aggregateId,
      appointmentId: event.appointmentId,
      patientId: event.patientId,
      professionalId: event.professionalId,
      amount: tariff,
      dueDate: event.completedAt,
    };

    await createReceivableUseCase.execute(input);
  };
}
