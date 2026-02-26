/**
 * Infraestrutura de eventos - Event Bus.
 * @see ADR 0004, US-ARQ-03, US-ARQ-06
 */

export {
  eventBus,
  subscribeToEvent,
  publishEvent,
  type RetryConfig,
  type DeadLetterEntry,
} from './event-bus.js';

export { setupEventHandlers, type EventHandlersConfig } from './setup-handlers.js';
