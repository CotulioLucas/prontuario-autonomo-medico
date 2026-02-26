/**
 * Testes de isolamento multi-tenant.
 * Valida US-ARQ-02 criterios de aceite.
 * @see ADR 0002, DR-IA-4
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { rejectTenantIdInBody } from '../../src/infrastructure/http/middleware/tenant-guard.js';
import { runWithContext, getRequestContext, type AuthenticatedContext } from '../../src/infrastructure/http/context.js';

describe('US-ARQ-02: Isolamento tenant', () => {
  describe('rejectTenantIdInBody middleware', () => {
    const mockReply = {
      code: (status: number) => ({
        send: (body: unknown) => ({ status, body }),
      }),
    } as unknown as any;

    it('deve rejeitar tenantId no body em POST', () => {
      let called = false;
      const request = {
        method: 'POST',
        body: { name: 'Test', tenantId: 'tenant-123' },
      } as any;

      rejectTenantIdInBody(request, mockReply, () => {
        called = true;
      });

      expect(called).toBe(false);
    });

    it('deve rejeitar tenant_id (snake_case) no body', () => {
      let called = false;
      const request = {
        method: 'POST',
        body: { name: 'Test', tenant_id: 'tenant-123' },
      } as any;

      rejectTenantIdInBody(request, mockReply, () => {
        called = true;
      });

      expect(called).toBe(false);
    });

    it('deve aceitar body sem tenantId em POST', () => {
      let called = false;
      const request = {
        method: 'POST',
        body: { name: 'Test', email: 'test@example.com' },
      } as any;

      rejectTenantIdInBody(request, mockReply, () => {
        called = true;
      });

      expect(called).toBe(true);
    });

    it('deve ignorar GET requests', () => {
      let called = false;
      const request = {
        method: 'GET',
        body: { tenantId: 'tenant-123' },
      } as any;

      rejectTenantIdInBody(request, mockReply, () => {
        called = true;
      });

      expect(called).toBe(true);
    });

    it('deve rejeitar tenantId em objetos aninhados', () => {
      let called = false;
      const request = {
        method: 'PUT',
        body: {
          name: 'Test',
          address: {
            city: 'Sao Paulo',
            tenantId: 'tenant-123',
          },
        },
      } as any;

      rejectTenantIdInBody(request, mockReply, () => {
        called = true;
      });

      expect(called).toBe(false);
    });
  });

  describe('RequestContext', () => {
    const testContext: AuthenticatedContext = {
      tenantId: 'tenant-test-123',
      userId: 'user-test-456',
      roles: ['admin'],
      email: 'test@example.com',
      tenantType: 'clinic',
    };

    it('deve resolver tenantId do contexto', () => {
      runWithContext(testContext, () => {
        const ctx = getRequestContext();
        expect(ctx.tenantId).toBe('tenant-test-123');
        expect(ctx.userId).toBe('user-test-456');
        expect(ctx.roles).toContain('admin');
      });
    });

    it('deve lancar erro quando contexto nao esta definido', () => {
      expect(() => getRequestContext()).toThrow('Request context not set');
    });

    it('deve isolar contexto entre execucoes', () => {
      const context1: AuthenticatedContext = {
        tenantId: 'tenant-1',
        userId: 'user-1',
        roles: [],
        email: 'user1@test.com',
        tenantType: 'autonomous',
      };

      const context2: AuthenticatedContext = {
        tenantId: 'tenant-2',
        userId: 'user-2',
        roles: [],
        email: 'user2@test.com',
        tenantType: 'clinic',
      };

      runWithContext(context1, () => {
        expect(getRequestContext().tenantId).toBe('tenant-1');

        runWithContext(context2, () => {
          expect(getRequestContext().tenantId).toBe('tenant-2');
        });

        expect(getRequestContext().tenantId).toBe('tenant-1');
      });
    });
  });
});
