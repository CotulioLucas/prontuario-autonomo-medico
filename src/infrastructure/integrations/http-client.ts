/**
 * Cliente HTTP com timeout, retry e circuit breaker.
 * @see ADR 0005, docs/architecture/failure-modes.md, US-ARQ-07
 */

export interface HttpClientConfig {
  baseUrl: string;
  timeoutMs: number;
  maxRetries: number;
  initialDelayMs: number;
  maxDelayMs: number;
  backoffMultiplier: number;
}

export const DEFAULT_HTTP_CONFIG: Omit<HttpClientConfig, 'baseUrl'> = {
  timeoutMs: 5000,
  maxRetries: 3,
  initialDelayMs: 100,
  maxDelayMs: 5000,
  backoffMultiplier: 2,
};

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreaker {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number | null;
  successCount: number;
}

export interface HttpResponse<T> {
  status: number;
  data: T;
}

export class HttpClientError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly isTimeout: boolean = false,
    public readonly isCircuitOpen: boolean = false
  ) {
    super(message);
    this.name = 'HttpClientError';
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function calculateBackoff(attempt: number, config: HttpClientConfig): number {
  const backoff = config.initialDelayMs * Math.pow(config.backoffMultiplier, attempt - 1);
  return Math.min(backoff, config.maxDelayMs);
}

export class HttpClient {
  private config: HttpClientConfig;
  private circuitBreaker: CircuitBreaker = {
    state: 'closed',
    failureCount: 0,
    lastFailureTime: null,
    successCount: 0,
  };
  private readonly circuitOpenThreshold = 5;
  private readonly circuitResetTimeMs = 30000;

  constructor(config: Partial<HttpClientConfig> & { baseUrl: string }) {
    this.config = { ...DEFAULT_HTTP_CONFIG, ...config };
  }

  async get<T>(path: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>('GET', path, undefined, headers);
  }

  async post<T>(path: string, body: unknown, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>('POST', path, body, headers);
  }

  private async request<T>(
    method: string,
    path: string,
    body?: unknown,
    headers?: Record<string, string>
  ): Promise<HttpResponse<T>> {
    if (this.isCircuitOpen()) {
      throw new HttpClientError(
        `Circuit breaker is open for ${this.config.baseUrl}`,
        undefined,
        false,
        true
      );
    }

    let lastError: HttpClientError | null = null;

    for (let attempt = 1; attempt <= this.config.maxRetries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

        const url = `${this.config.baseUrl}${path}`;
        const response = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
            ...headers,
          },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new HttpClientError(
            `HTTP ${response.status}: ${response.statusText}`,
            response.status
          );
        }

        const data = await response.json() as T;
        this.onSuccess();
        return { status: response.status, data };
      } catch (error) {
        lastError = this.normalizeError(error);

        if (attempt < this.config.maxRetries && this.shouldRetry(lastError)) {
          const backoffMs = calculateBackoff(attempt, this.config);
          console.warn(
            `[HttpClient] Request failed to ${this.config.baseUrl}${path} (attempt ${attempt}/${this.config.maxRetries}), retrying in ${backoffMs}ms:`,
            error
          );
          await delay(backoffMs);
        }
      }
    }

    this.onFailure();
    throw lastError ?? new HttpClientError('Unknown error');
  }

  private normalizeError(error: unknown): HttpClientError {
    if (error instanceof HttpClientError) {
      return error;
    }
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        return new HttpClientError(
          `Request timeout after ${this.config.timeoutMs}ms`,
          undefined,
          true
        );
      }
      return new HttpClientError(error.message);
    }
    return new HttpClientError(String(error));
  }

  private shouldRetry(error: HttpClientError): boolean {
    if (error.isTimeout) return true;
    if (error.status === undefined) return true;
    if (error.status >= 500) return true;
    if (error.status === 429) return true;
    return false;
  }

  private isCircuitOpen(): boolean {
    if (this.circuitBreaker.state === 'open') {
      const timeSinceLastFailure = Date.now() - (this.circuitBreaker.lastFailureTime || 0);
      if (timeSinceLastFailure > this.circuitResetTimeMs) {
        this.circuitBreaker.state = 'half-open';
        return false;
      }
      return true;
    }
    return false;
  }

  private onSuccess(): void {
    this.circuitBreaker.successCount++;
    if (this.circuitBreaker.state === 'half-open') {
      this.circuitBreaker.state = 'closed';
      this.circuitBreaker.failureCount = 0;
    }
  }

  private onFailure(): void {
    this.circuitBreaker.failureCount++;
    this.circuitBreaker.lastFailureTime = Date.now();
    if (this.circuitBreaker.failureCount >= this.circuitOpenThreshold) {
      this.circuitBreaker.state = 'open';
    }
  }

  getCircuitBreakerState(): CircuitBreaker {
    return { ...this.circuitBreaker };
  }

  resetCircuitBreaker(): void {
    this.circuitBreaker = {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: null,
      successCount: 0,
    };
  }
}
