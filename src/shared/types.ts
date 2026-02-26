/**
 * Tipos comuns compartilhados entre módulos.
 * Nenhuma regra de domínio de um contexto específico.
 * @see ADR 0007, docs/architecture/components.md
 */

export type TenantId = string;
export type UserId = string;

export function generateId(): string {
  return crypto.randomUUID();
}
