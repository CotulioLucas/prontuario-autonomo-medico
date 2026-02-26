/**
 * Contexto de requisicao com isolamento multi-tenant.
 * Resolve tenantId e userId da sessao - NUNCA do body.
 * Usa AsyncLocalStorage para contexto por requisicao (thread-safe).
 * @see ADR 0002, DR-IA-4, US-ARQ-02
 */

import { AsyncLocalStorage } from 'node:async_hooks';
import type { TenantId, UserId } from '../../shared/types.js';

export interface AuthenticatedContext {
  tenantId: TenantId;
  userId: UserId;
  roles: string[];
  email: string;
  tenantType: 'autonomous' | 'clinic';
}

const asyncLocalStorage = new AsyncLocalStorage<AuthenticatedContext>();

export function runWithContext<T>(ctx: AuthenticatedContext, fn: () => T): T {
  return asyncLocalStorage.run(ctx, fn);
}

export function setContext(ctx: AuthenticatedContext): void {
  asyncLocalStorage.enterWith(ctx);
}

export function clearContext(): void {
  asyncLocalStorage.disable();
}

export function getRequestContext(): AuthenticatedContext {
  const store = asyncLocalStorage.getStore();
  if (!store) {
    throw new Error('Request context not set. Ensure auth middleware is applied.');
  }
  return store;
}

export function hasContext(): boolean {
  return asyncLocalStorage.getStore() !== undefined;
}

export function requireTenantId(): TenantId {
  return getRequestContext().tenantId;
}

export function requireUserId(): UserId {
  return getRequestContext().userId;
}

export function requireRoles(): string[] {
  return getRequestContext().roles;
}

export function hasRole(role: string): boolean {
  return getRequestContext().roles.includes(role);
}

export function isTenantType(type: 'autonomous' | 'clinic'): boolean {
  return getRequestContext().tenantType === type;
}
