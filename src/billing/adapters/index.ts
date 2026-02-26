/**
 * billing/adapters — Implementacoes de portas (persistence, HTTP).
 * @see US-ARQ-04, US-BE-F05-01
 */

export { InMemoryReceivableRepository, InMemoryTariffResolver } from './persistence/receivable.repository.js';
export { receivableRoutes, type ReceivableRoutesConfig } from './http/receivable.routes.js';
