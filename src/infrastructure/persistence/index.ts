/**
 * infrastructure/persistence — Prisma, repositórios; único por aplicação.
 * Módulos usam portas (interfaces); implementação aqui.
 * @see ADR 0008, US-ARQ-02, US-ARQ-04
 */

export {
  BaseTenantRepository,
  type Repository,
  type TenantScopedEntity,
} from './base-repository.js';
