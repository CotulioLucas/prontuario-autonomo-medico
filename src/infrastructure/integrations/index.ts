/**
 * infrastructure/integrations — Calendário, WhatsApp; clientes HTTP; retry/circuit breaker.
 * @see ADR 0005, docs/architecture/failure-modes.md, US-ARQ-07
 */

export {
  HttpClient,
  HttpClientError,
  type HttpClientConfig,
  type CircuitState,
  type CircuitBreaker,
  DEFAULT_HTTP_CONFIG,
} from './http-client.js';

export {
  createWhatsAppAdapter,
  type WhatsAppAdapter,
  type WhatsAppMessage,
  type WhatsAppConfig,
} from './whatsapp.adapter.js';

export {
  createCalendarAdapter,
  type CalendarAdapter,
  type CalendarEvent,
  type CalendarConfig,
} from './calendar.adapter.js';
