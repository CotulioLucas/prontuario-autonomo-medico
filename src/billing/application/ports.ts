/**
 * Ports (interfaces) do contexto Billing.
 * Application define ports; Adapters implementam.
 * @see docs/architecture/style.md, US-ARQ-04
 */

import type { Receivable, CreateReceivableInput, Money } from '../domain/receivable.js';

export interface ReceivableRepositoryPort {
  findById(id: string): Promise<Receivable | null>;
  findByAppointmentId(appointmentId: string): Promise<Receivable | null>;
  save(receivable: Receivable): Promise<void>;
}

export interface TariffResolverPort {
  getTariffForPatient(professionalId: string, patientId: string): Promise<Money | null>;
}
