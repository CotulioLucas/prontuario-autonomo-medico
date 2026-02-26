/**
 * billing/application — casos de uso, handlers e ports.
 * @see US-ARQ-03, US-ARQ-04, US-BE-F05-01
 */

export {
  createReceivableHandler,
  type CreateReceivableUseCase,
} from './handlers/appointment-completed.handler.js';
export { CreateReceivableUseCaseImpl } from './use-cases/create-receivable.use-case.js';
export {
  type ReceivableRepositoryPort,
  type TariffResolverPort,
} from './ports.js';

export {
  ListReceivablesUseCase,
  GetReceivableUseCase,
  RecordPaymentUseCase,
  ListPatientReceivablesUseCase,
  type ListReceivablesInput,
  type ListReceivablesOutput,
  type PaymentInput,
  type PaymentMethod,
} from './use-cases/receivable.use-cases.js';
