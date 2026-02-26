/**
 * Eventos base / contrato de eventos de domínio compartilhados.
 * Módulos publicam e consomem eventos; definições base ficam em shared.
 * @see ADR 0004, docs/architecture/integration-patterns.md
 */

import type { TenantId, UserId } from './types.js';

export interface DomainEventBase {
  readonly eventName: string;
  readonly occurredAt: Date;
  readonly tenantId: TenantId;
  readonly aggregateId: string;
  readonly triggeredBy?: UserId;
}

export type EventHandler<T extends DomainEventBase> = (event: T) => Promise<void> | void;

export interface DomainEventConstructor<T extends DomainEventBase> {
  new (payload: Omit<T, 'eventName' | 'occurredAt'>): T;
  readonly eventName: string;
}
