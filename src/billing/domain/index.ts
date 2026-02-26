/**
 * billing/domain — Receivable, Receipt; VOs; eventos ContaAReceber*, Recibo*.
 * @see docs/domain/aggregates.md
 */

export {
  type Receivable,
  type CreateReceivableInput,
  type ReceivableRepository,
  type Money,
  type PaymentStatus,
} from './receivable.js';

export * from './errors.js';
