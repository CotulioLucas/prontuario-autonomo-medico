/**
 * Erros de domínio e aplicação compartilhados.
 * @see ADR 0007, docs/architecture/components.md
 */

export class DomainError extends Error {
  constructor(
    message: string,
    public readonly code?: string
  ) {
    super(message);
    this.name = 'DomainError';
  }
}
