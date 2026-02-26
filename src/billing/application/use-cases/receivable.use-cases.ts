/**
 * Use cases de gestao de contas a receber.
 * @see US-BE-F05-01, DR-FI-1, DR-FI-2
 */

import type { Receivable, ReceivableRepository, PaymentStatus } from '../../domain/receivable.js';
import { ReceivableNotFoundError, AlreadyPaidError, CancelledReceivableError } from '../../domain/errors.js';

export interface ListReceivablesInput {
  tenantId: string;
  startDate?: Date;
  endDate?: Date;
  patientId?: string;
  professionalId?: string;
  status?: PaymentStatus;
  page?: number;
  limit?: number;
}

export interface ListReceivablesOutput {
  data: Receivable[];
  total: number;
  page: number;
  pageSize: number;
}

export class ListReceivablesUseCase {
  constructor(private readonly receivableRepository: ReceivableRepository) {}

  async execute(input: ListReceivablesInput): Promise<ListReceivablesOutput> {
    const page = input.page ?? 1;
    const limit = input.limit ?? 20;

    const { receivables, total } = await this.receivableRepository.findByTenantId(
      input.tenantId,
      {
        startDate: input.startDate,
        endDate: input.endDate,
        patientId: input.patientId,
        professionalId: input.professionalId,
        status: input.status,
        page,
        limit,
      }
    );

    return {
      data: receivables,
      total,
      page,
      pageSize: limit,
    };
  }
}

export class GetReceivableUseCase {
  constructor(private readonly receivableRepository: ReceivableRepository) {}

  async execute(id: string, tenantId: string): Promise<Receivable> {
    const receivable = await this.receivableRepository.findById(id);

    if (!receivable || receivable.tenantId !== tenantId) {
      throw new ReceivableNotFoundError();
    }

    return receivable;
  }
}

export interface PaymentInput {
  receivableId: string;
  tenantId: string;
  paidAt: Date;
  paymentMethod: string;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'pix' | 'bank_transfer' | 'check';

export class RecordPaymentUseCase {
  constructor(private readonly receivableRepository: ReceivableRepository) {}

  async execute(input: PaymentInput): Promise<Receivable> {
    const receivable = await this.receivableRepository.findById(input.receivableId);

    if (!receivable || receivable.tenantId !== input.tenantId) {
      throw new ReceivableNotFoundError();
    }

    if (receivable.status === 'paid') {
      throw new AlreadyPaidError();
    }

    if (receivable.status === 'cancelled') {
      throw new CancelledReceivableError();
    }

    const paidReceivable: Receivable = {
      ...receivable,
      status: 'paid',
      paidAt: input.paidAt,
      paymentMethod: input.paymentMethod,
    };

    await this.receivableRepository.update(paidReceivable);

    return paidReceivable;
  }
}

export class ListPatientReceivablesUseCase {
  constructor(private readonly receivableRepository: ReceivableRepository) {}

  async execute(patientId: string, tenantId: string): Promise<Receivable[]> {
    const receivables = await this.receivableRepository.findByPatientId(patientId);
    return receivables.filter((r) => r.tenantId === tenantId);
  }
}
