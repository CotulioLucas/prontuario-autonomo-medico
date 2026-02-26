/**
 * Testes de middleware de autenticacao e resolucao de tenant.
 * Valida US-ARQ-05 criterios de aceite.
 * @see ADR 0002, ADR 0010
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import Fastify from 'fastify';
import {
  authMiddleware,
  requireAuth,
  requireRole,
  requireRoles,
  requireAdmin,
  setSessionResolver,
  getSessionResolver,
  configureAuth,
  PUBLIC_ROUTES,
  type SessionUser,
} from '../../src/infrastructure/http/middleware/index.js';

const mockSessionUser: SessionUser = {
  id: 'user-123',
  email: 'test@example.com',
  tenantId: 'tenant-456',
  roles: ['professional'],
  tenantType: 'autonomous',
};

const mockAdminUser: SessionUser = {
  id: 'admin-123',
  email: 'admin@example.com',
  tenantId: 'tenant-456',
  roles: ['admin', 'professional'],
  tenantType: 'clinic',
};

describe('US-ARQ-05: Middleware de auth e resolucao de tenantId', () => {
  let fastify: ReturnType<typeof Fastify>;

  beforeEach(async () => {
    fastify = Fastify();
    setSessionResolver(null);
  });

  afterEach(async () => {
    await fastify.close();
    setSessionResolver(null);
  });

  describe('Rotas publicas', () => {
    it('deve permitir acesso a rotas publicas sem autenticacao', async () => {
      const resolver = () => undefined;
      setSessionResolver(resolver);
      fastify.addHook('preHandler', authMiddleware);

      fastify.get('/api/v1/auth/login', async () => ({ ok: true }));
      fastify.get('/health', async () => ({ status: 'ok' }));

      const loginResponse = await fastify.inject({
        method: 'GET',
        url: '/api/v1/auth/login',
      });
      expect(loginResponse.statusCode).toBe(200);

      const healthResponse = await fastify.inject({
        method: 'GET',
        url: '/health',
      });
      expect(healthResponse.statusCode).toBe(200);
    });

    it('deve listar todas as rotas publicas documentadas', () => {
      expect(PUBLIC_ROUTES).toContain('/api/v1/auth/login');
      expect(PUBLIC_ROUTES).toContain('/api/v1/auth/register');
      expect(PUBLIC_ROUTES).toContain('/api/v1/auth/register/autonomo');
      expect(PUBLIC_ROUTES).toContain('/api/v1/auth/register/clinica');
      expect(PUBLIC_ROUTES).toContain('/api/v1/auth/confirm-email');
      expect(PUBLIC_ROUTES).toContain('/api/v1/auth/forgot-password');
      expect(PUBLIC_ROUTES).toContain('/api/v1/auth/reset-password');
      expect(PUBLIC_ROUTES).toContain('/health');
    });

    it('deve permitir acesso a sub-rotas publicas', async () => {
      setSessionResolver(() => undefined);
      fastify.addHook('preHandler', authMiddleware);

      fastify.post('/api/v1/auth/login/callback', async () => ({ ok: true }));

      const response = await fastify.inject({
        method: 'POST',
        url: '/api/v1/auth/login/callback',
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe('Rotas protegidas - 401 Unauthorized', () => {
    it('deve retornar 401 para rota protegida sem sessao', async () => {
      setSessionResolver(() => undefined);
      fastify.addHook('preHandler', authMiddleware);

      fastify.get('/api/v1/patients', async () => ({ patients: [] }));

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/patients',
      });

      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('UNAUTHORIZED');
    });

    it('deve retornar 401 quando sessionResolver retorna null', async () => {
      setSessionResolver(() => null);
      fastify.addHook('preHandler', authMiddleware);

      fastify.get('/api/v1/appointments', async () => ({ appointments: [] }));

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/appointments',
      });

      expect(response.statusCode).toBe(401);
    });

    it('deve retornar 500 quando sessionResolver nao esta configurado', async () => {
      fastify.addHook('preHandler', authMiddleware);

      fastify.get('/api/v1/patients', async () => ({ patients: [] }));

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/patients',
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('SESSION_RESOLVER_NOT_CONFIGURED');
    });
  });

  describe('Contexto de requisicao - tenantId, userId, roles', () => {
    it('deve definir request.user com tenantId e userId apos auth', async () => {
      setSessionResolver(() => mockSessionUser);
      fastify.addHook('preHandler', authMiddleware);

      let capturedUser: SessionUser | null = null;
      fastify.get('/api/v1/patients', async (request) => {
        capturedUser = request.user ?? null;
        return { ok: true };
      });

      await fastify.inject({
        method: 'GET',
        url: '/api/v1/patients',
      });

      expect(capturedUser).not.toBeNull();
      expect(capturedUser!.tenantId).toBe('tenant-456');
      expect(capturedUser!.id).toBe('user-123');
    });

    it('deve disponibilizar roles em request.user', async () => {
      setSessionResolver(() => mockAdminUser);
      fastify.addHook('preHandler', authMiddleware);

      let capturedRoles: string[] = [];
      fastify.get('/api/v1/admin', async (request) => {
        capturedRoles = request.user?.roles ?? [];
        return { ok: true };
      });

      await fastify.inject({
        method: 'GET',
        url: '/api/v1/admin',
      });

      expect(capturedRoles).toContain('admin');
      expect(capturedRoles).toContain('professional');
    });

    it('deve definir tenantType em request.user', async () => {
      setSessionResolver(() => mockSessionUser);
      fastify.addHook('preHandler', authMiddleware);

      let capturedTenantType: string | null = null;
      fastify.get('/api/v1/test', async (request) => {
        capturedTenantType = request.user?.tenantType ?? null;
        return { ok: true };
      });

      await fastify.inject({
        method: 'GET',
        url: '/api/v1/test',
      });

      expect(capturedTenantType).toBe('autonomous');
    });

    it('deve definir email em request.user', async () => {
      setSessionResolver(() => mockSessionUser);
      fastify.addHook('preHandler', authMiddleware);

      let capturedEmail: string | null = null;
      fastify.get('/api/v1/test', async (request) => {
        capturedEmail = request.user?.email ?? null;
        return { ok: true };
      });

      await fastify.inject({
        method: 'GET',
        url: '/api/v1/test',
      });

      expect(capturedEmail).toBe('test@example.com');
    });
  });

  describe('Autorizacao - 403 Forbidden', () => {
    it('deve retornar 403 quando usuario nao tem papel requerido', async () => {
      setSessionResolver(() => mockSessionUser);
      fastify.addHook('preHandler', authMiddleware);

      fastify.get(
        '/api/v1/admin/settings',
        { preHandler: requireRole('admin') },
        async () => ({ settings: {} })
      );

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/admin/settings',
      });

      expect(response.statusCode).toBe(403);
      const body = JSON.parse(response.body);
      expect(body.error.code).toBe('FORBIDDEN');
    });

    it('deve permitir acesso quando usuario tem papel requerido', async () => {
      setSessionResolver(() => mockAdminUser);
      fastify.addHook('preHandler', authMiddleware);

      fastify.get(
        '/api/v1/admin/settings',
        { preHandler: requireRole('admin') },
        async () => ({ settings: {} })
      );

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/admin/settings',
      });

      expect(response.statusCode).toBe(200);
    });

    it('requireRoles deve permitir acesso com qualquer um dos papeis', async () => {
      setSessionResolver(() => mockSessionUser);
      fastify.addHook('preHandler', authMiddleware);

      fastify.get(
        '/api/v1/staff',
        { preHandler: requireRoles('admin', 'professional', 'secretary') },
        async () => ({ ok: true })
      );

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/staff',
      });

      expect(response.statusCode).toBe(200);
    });

    it('requireAdmin deve requerer papel admin', async () => {
      setSessionResolver(() => mockSessionUser);
      fastify.addHook('preHandler', authMiddleware);

      fastify.delete(
        '/api/v1/admin/users/:id',
        { preHandler: requireAdmin() },
        async () => ({ deleted: true })
      );

      const response = await fastify.inject({
        method: 'DELETE',
        url: '/api/v1/admin/users/123',
      });

      expect(response.statusCode).toBe(403);
    });
  });

  describe('requireAuth helper', () => {
    it('deve retornar usuario quando autenticado', async () => {
      setSessionResolver(() => mockSessionUser);
      fastify.addHook('preHandler', authMiddleware);

      let capturedUser: SessionUser | null = null;
      fastify.get('/api/v1/me', async (request) => {
        capturedUser = requireAuth(request);
        return { userId: capturedUser.id };
      });

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/me',
      });

      expect(response.statusCode).toBe(200);
      expect(capturedUser).not.toBeNull();
      expect(capturedUser!.id).toBe('user-123');
    });

    it('deve lancar erro quando nao autenticado', () => {
      const request = {};
      expect(() => requireAuth(request as any)).toThrow('Unauthorized');
    });
  });

  describe('configureAuth factory', () => {
    it('deve configurar auth middleware globalmente', async () => {
      configureAuth(fastify, {
        sessionResolver: () => mockSessionUser,
      });

      fastify.get('/api/v1/test', async () => ({ ok: true }));

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/test',
      });

      expect(response.statusCode).toBe(200);
    });

    it('deve adicionar rotas publicas customizadas', async () => {
      configureAuth(fastify, {
        sessionResolver: () => undefined,
        publicRoutes: ['/api/v1/public/custom'],
      });

      fastify.get('/api/v1/public/custom', async () => ({ ok: true }));

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/public/custom',
      });

      expect(response.statusCode).toBe(200);
    });
  });

  describe('SessionResolver', () => {
    it('deve suportar resolver assincrono', async () => {
      setSessionResolver(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10));
        return mockSessionUser;
      });
      fastify.addHook('preHandler', authMiddleware);

      fastify.get('/api/v1/async', async () => ({ ok: true }));

      const response = await fastify.inject({
        method: 'GET',
        url: '/api/v1/async',
      });

      expect(response.statusCode).toBe(200);
    });

    it('deve permitir trocar resolver em runtime', () => {
      setSessionResolver(() => mockSessionUser);
      expect(getSessionResolver()).not.toBeNull();

      setSessionResolver(null);
      expect(getSessionResolver()).toBeNull();
    });
  });
});
