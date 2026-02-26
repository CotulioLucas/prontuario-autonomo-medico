/**
 * Conta a Receber — entidade de domínio do contexto Financeiro.
 * Criada quando um agendamento é marcado como realizado.
 * @see docs/domain/aggregates.md, US-ARQ-03
 */

import type { TenantId, UserId } from '../../shared/types.js';

export interface Money {
  readonly amount: number;
  readonly currency: string;
}

export type PaymentStatus = 'pending' | 'paid' | 'partial' | 'cancelled';

export interface Receivable {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly attendanceId: string;
  readonly appointmentId: string;
  readonly patientId: string;
  readonly professionalId: UserId;
  readonly amount: Money;
  readonly status: PaymentStatus;
  readonly dueDate: Date;
  readonly createdAt: Date;
  readonly paidAt?: Date;
  readonly paymentMethod?: string;
}

export interface CreateReceivableInput {
  tenantId: TenantId;
  attendanceId: string;
  appointmentId: string;
  patientId: string;
  professionalId: UserId;
  amount: Money;
  dueDate?: Date;
}

export interface ReceivableRepository {
  findById(id: string): Promise<Receivable | null>;
  findByAppointmentId(appointmentId: string): Promise<Receivable | null>;
  findByTenantId(tenantId: string, filters?: {
    startDate?: Date;
    endDate?: Date;
    patientId?: string;
    professionalId?: string;
    status?: PaymentStatus;
    page?: number;
    limit?: number;
  }): Promise<{ receivables: Receivable[]; total: number }>;
  findByPatientId(patientId: string): Promise<Receivable[]>;
  save(receivable: Receivable): Promise<void>;
  update(receivable: Receivable): Promise<void>;
}
