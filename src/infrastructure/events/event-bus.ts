/**
 * Event Bus in-memory para comunicacao entre contextos.
 * No MVP: sincrono, em sequencia. Futuro: pode evoluir para message broker.
 * @see ADR 0004, US-ARQ-03, US-ARQ-06
 */

import type { DomainEventBase, EventHandler } from '../../shared/events.js';

type HandlerRecord = {
  handler: EventHandler<DomainEventBase>;
  moduleName: string;
};

export type RetryConfig = {
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
};

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

export type DeadLetterEntry = {
  event: DomainEventBase;
  error: Error;
  moduleName: string;
  attempts: number;
  timestamp: Date;
};

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, config: RetryConfig): number {
  const backoff = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(backoff, config.maxDelayMs);
}

class EventBus {
  private handlers: Map<string, HandlerRecord[]> = new Map();
  private deadLetterQueue: DeadLetterEntry[] = [];
  private retryConfig: RetryConfig;

  constructor(retryConfig: Partial<RetryConfig> = {}) {
    this.retryConfig = { ...DEFAULT_RETRY_CONFIG, ...retryConfig };
  }

  subscribe<T extends DomainEventBase>(
    eventName: string,
    handler: EventHandler<T>,
    moduleName: string
  ): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push({
      handler: handler as EventHandler<DomainEventBase>,
      moduleName,
    });
  }

  async publish<T extends DomainEventBase>(event: T): Promise<void> {
    const handlers = this.handlers.get(event.eventName);

    if (!handlers || handlers.length === 0) {
      return;
    }

    for (const { handler, moduleName } of handlers) {
      await this.executeWithRetry(handler, event, moduleName);
    }
  }

  private async executeWithRetry(
    handler: EventHandler<DomainEventBase>,
    event: DomainEventBase,
    moduleName: string
  ): Promise<void> {
    let lastError: Error | null = null;
    let attempts = 0;

    for (let attempt = 1; attempt <= this.retryConfig.maxRetries; attempt++) {
      attempts = attempt;
      try {
        await handler(event);
        return;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        
        if (attempt < this.retryConfig.maxRetries) {
          const backoffMs = calculateBackoff(attempt, this.retryConfig);
          console.warn(
            `[EventBus] Handler failed for event "${event.eventName}" in module "${moduleName}" (attempt ${attempt}/${this.retryConfig.maxRetries}), retrying in ${backoffMs}ms:`,
            error
          );
          await delay(backoffMs);
        }
      }
    }

    this.deadLetterQueue.push({
      event,
      error: lastError!,
      moduleName,
      attempts,
      timestamp: new Date(),
    });
    console.error(
      `[EventBus] Handler failed for event "${event.eventName}" in module "${moduleName}" after ${attempts} attempts:`,
      lastError
    );
  }

  getDeadLetterQueue(): DeadLetterEntry[] {
    return [...this.deadLetterQueue];
  }

  clearDeadLetterQueue(): void {
    this.deadLetterQueue = [];
  }

  unsubscribe(eventName: string, moduleName?: string): void {
    if (!this.handlers.has(eventName)) return;

    if (moduleName) {
      const filtered = this.handlers.get(eventName)!.filter((h) => h.moduleName !== moduleName);
      this.handlers.set(eventName, filtered);
    } else {
      this.handlers.delete(eventName);
    }
  }

  clearAll(): void {
    this.handlers.clear();
    this.deadLetterQueue = [];
  }
}

export const eventBus = new EventBus();

export function subscribeToEvent<T extends DomainEventBase>(
  eventName: string,
  handler: EventHandler<T>,
  moduleName: string
): void {
  eventBus.subscribe(eventName, handler, moduleName);
}

export async function publishEvent<T extends DomainEventBase>(event: T): Promise<void> {
  return eventBus.publish(event);
}
