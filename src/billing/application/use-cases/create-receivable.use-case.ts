/**
 * Caso de uso: Criar Conta a Receber.
 * @see US-ARQ-03, US-ARQ-04
 */

import type { Receivable, CreateReceivableInput } from '../../domain/receivable.js';
import type { ReceivableRepositoryPort } from '../ports.js';
import { generateId } from '../../../shared/types.js';

export class CreateReceivableUseCaseImpl {
  constructor(private readonly repository: ReceivableRepositoryPort) {}

  async execute(input: CreateReceivableInput): Promise<Receivable> {
    const existing = await this.repository.findByAppointmentId(input.appointmentId);
    if (existing) {
      throw new Error(`Receivable already exists for appointment ${input.appointmentId}`);
    }

    const receivable: Receivable = {
      id: generateId(),
      ...input,
      dueDate: input.dueDate ?? new Date(),
      status: 'pending',
      createdAt: new Date(),
    };

    await this.repository.save(receivable);
    return receivable;
  }
}

export type { CreateReceivableUseCase } from '../handlers/appointment-completed.handler.js';
