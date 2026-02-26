/**
 * Repositorio base com isolamento multi-tenant.
 * Toda query/escrita filtra por tenantId do contexto.
 * @see ADR 0002, DR-IA-4, US-ARQ-02, US-ARQ-04
 * 
 * Nota: Esta classe está obsoleta. Use adapters específicos em cada módulo.
 */

import { requireTenantId } from '../http/context.js';
import type { TenantId } from '../../shared/types.js';

export interface TenantScopedEntity {
  tenantId: TenantId;
  id: string;
}

export interface Repository<T extends TenantScopedEntity> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  save(entity: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export abstract class BaseTenantRepository<T extends TenantScopedEntity> implements Repository<T> {
  protected abstract get collection(): Map<string, T>;

  protected getTenantId(): TenantId {
    return requireTenantId();
  }

  protected tenantFilter(entity: T): boolean {
    return entity.tenantId === this.getTenantId();
  }

  async findById(id: string): Promise<T | null> {
    const entity = this.collection.get(id);
    if (!entity || !this.tenantFilter(entity)) {
      return null;
    }
    return entity;
  }

  async findAll(): Promise<T[]> {
    const tenantId = this.getTenantId();
    const result: T[] = [];
    for (const entity of this.collection.values()) {
      if (entity.tenantId === tenantId) {
        result.push(entity);
      }
    }
    return result;
  }

  async save(entity: T): Promise<void> {
    const tenantId = this.getTenantId();
    if (entity.tenantId !== tenantId) {
      throw new Error(
        `Tenant mismatch: entity belongs to tenant ${entity.tenantId}, but request context is tenant ${tenantId}`
      );
    }
    this.collection.set(entity.id, entity);
  }

  async delete(id: string): Promise<void> {
    const entity = await this.findById(id);
    if (entity) {
      this.collection.delete(id);
    }
  }
}
