/**
 * Adapter: Repositório de Contas a Receber.
 * Implementa ReceivableRepositoryPort usando in-memory storage.
 * @see US-ARQ-04
 */

import type { Receivable, Money } from '../../domain/index.js';
import type { ReceivableRepositoryPort, TariffResolverPort } from '../../application/ports.js';
import { requireTenantId } from '../../../infrastructure/http/context.js';

export class InMemoryReceivableRepository implements ReceivableRepositoryPort {
  private storage: Map<string, Receivable> = new Map();

  async findById(id: string): Promise<Receivable | null> {
    const tenantId = requireTenantId();
    const receivable = this.storage.get(id);
    if (!receivable || receivable.tenantId !== tenantId) {
      return null;
    }
    return receivable;
  }

  async findByAppointmentId(appointmentId: string): Promise<Receivable | null> {
    const tenantId = requireTenantId();
    for (const receivable of this.storage.values()) {
      if (receivable.appointmentId === appointmentId && receivable.tenantId === tenantId) {
        return receivable;
      }
    }
    return null;
  }

  async save(receivable: Receivable): Promise<void> {
    const tenantId = requireTenantId();
    if (receivable.tenantId !== tenantId) {
      throw new Error(
        `Tenant mismatch: entity belongs to tenant ${receivable.tenantId}, but context is tenant ${tenantId}`
      );
    }
    this.storage.set(receivable.id, receivable);
  }

  async delete(id: string): Promise<void> {
    const tenantId = requireTenantId();
    const receivable = await this.findById(id);
    if (receivable && receivable.tenantId === tenantId) {
      this.storage.delete(id);
    }
  }
}

export class InMemoryTariffResolver implements TariffResolverPort {
  private tariffs: Map<string, Money> = new Map();

  setTariff(professionalId: string, patientId: string, tariff: Money): void {
    const key = `${professionalId}:${patientId}`;
    this.tariffs.set(key, tariff);
  }

  async getTariffForPatient(professionalId: string, patientId: string): Promise<Money | null> {
    const key = `${professionalId}:${patientId}`;
    return this.tariffs.get(key) ?? null;
  }
}
