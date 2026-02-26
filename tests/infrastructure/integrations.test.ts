/**
 * Testes de integracoes externas com timeout, retry e circuit breaker.
 * Valida US-ARQ-07 criterios de aceite.
 * @see ADR 0005, docs/architecture/failure-modes.md
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  HttpClient,
  HttpClientError,
  createWhatsAppAdapter,
  createCalendarAdapter,
} from '../../src/infrastructure/integrations/index.js';

describe('US-ARQ-07: Integracoes externas - timeout, retry, nao bloquear', () => {
  describe('HttpClient', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('deve ter timeout configurado para requisicoes', async () => {
      const client = new HttpClient({
        baseUrl: 'https://httpbin.org',
        timeoutMs: 100,
        maxRetries: 1,
      });

      const requestPromise = client.get('/delay/10');

      vi.advanceTimersByTime(150);

      await expect(requestPromise).rejects.toThrow(HttpClientError);
      await expect(requestPromise).rejects.toMatchObject({ isTimeout: true });
    });

    it('deve fazer retry com backoff em falhas transientes', async () => {
      vi.useRealTimers();

      const client = new HttpClient({
        baseUrl: 'https://httpbin.org',
        timeoutMs: 5000,
        maxRetries: 3,
        initialDelayMs: 10,
      });

      let callCount = 0;
      const originalFetch = global.fetch;
      global.fetch = vi.fn(async () => {
        callCount++;
        if (callCount < 3) {
          return new Response(null, { status: 500, statusText: 'Internal Server Error' });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      });

      const result = await client.get('/test');
      expect(result.status).toBe(200);
      expect(callCount).toBe(3);

      global.fetch = originalFetch;
    });

    it('deve abrir circuit breaker apos falhas consecutivas', async () => {
      const client = new HttpClient({
        baseUrl: 'https://httpbin.org',
        timeoutMs: 100,
        maxRetries: 1,
      });

      const originalFetch = global.fetch;
      global.fetch = vi.fn(async () => {
        return new Response(null, { status: 500, statusText: 'Internal Server Error' });
      });

      for (let i = 0; i < 5; i++) {
        try {
          await client.get('/test');
        } catch {
          // expected
        }
      }

      const circuitState = client.getCircuitBreakerState();
      expect(circuitState.state).toBe('open');

      await expect(client.get('/test')).rejects.toMatchObject({ isCircuitOpen: true });

      global.fetch = originalFetch;
    });
  });

  describe('WhatsAppAdapter', () => {
    it('deve enviar mensagem em background sem bloquear', async () => {
      const mockFetch = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100));
        return new Response(JSON.stringify({ messageId: '123' }), { status: 200 });
      });

      const originalFetch = global.fetch;
      global.fetch = mockFetch;

      const adapter = createWhatsAppAdapter({
        apiKey: 'test-key',
        phoneNumberId: '123456789',
        timeoutMs: 5000,
        maxRetries: 1,
      });

      const start = Date.now();
      adapter.sendInBackground({
        to: '5511999999999',
        body: 'Test message',
      });
      const elapsed = Date.now() - start;

      expect(elapsed).toBeLessThan(50);

      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(mockFetch).toHaveBeenCalled();

      global.fetch = originalFetch;
    });

    it('deve lidar com falha de envio sem lancar erro em background', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn(async () => {
        return new Response(null, { status: 500, statusText: 'Internal Server Error' });
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const adapter = createWhatsAppAdapter({
        apiKey: 'test-key',
        phoneNumberId: '123456789',
        timeoutMs: 100,
        maxRetries: 1,
      });

      adapter.sendInBackground({
        to: '5511999999999',
        body: 'Test message',
      });

      await new Promise((resolve) => setTimeout(resolve, 50));

      expect(consoleSpy).toHaveBeenCalled();

      global.fetch = originalFetch;
      consoleSpy.mockRestore();
    });
  });

  describe('CalendarAdapter', () => {
    it('deve criar evento com timeout e retry', async () => {
      const originalFetch = global.fetch;
      let attempts = 0;
      global.fetch = vi.fn(async () => {
        attempts++;
        if (attempts < 2) {
          return new Response(null, { status: 503, statusText: 'Service Unavailable' });
        }
        return new Response(JSON.stringify({ id: 'event-123' }), { status: 200 });
      });

      const adapter = createCalendarAdapter({
        apiKey: 'test-key',
        calendarId: 'primary',
        timeoutMs: 5000,
        maxRetries: 3,
        initialDelayMs: 10,
      });

      const result = await adapter.createEvent({
        title: 'Consulta',
        start: new Date('2026-02-17T10:00:00Z'),
        end: new Date('2026-02-17T11:00:00Z'),
        tenantId: 'tenant-1',
      });

      expect(result.externalId).toBe('event-123');
      expect(attempts).toBe(2);

      global.fetch = originalFetch;
    });

    it('deve retornar array vazio em caso de falha no sync', async () => {
      const originalFetch = global.fetch;
      global.fetch = vi.fn(async () => {
        return new Response(null, { status: 500, statusText: 'Internal Server Error' });
      });

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const adapter = createCalendarAdapter({
        apiKey: 'test-key',
        calendarId: 'primary',
        timeoutMs: 100,
        maxRetries: 1,
      });

      const events = await adapter.syncEvents('tenant-1');

      expect(events).toEqual([]);
      expect(consoleSpy).toHaveBeenCalled();

      global.fetch = originalFetch;
      consoleSpy.mockRestore();
    });
  });
});
