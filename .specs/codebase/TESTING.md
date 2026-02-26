# Testing Infrastructure

## Test Frameworks

**Backend — Unit/Integration:** Vitest 3.0 (globals: true, environment: node)
**Frontend — Componentes:** Vitest 4.0 + @testing-library/react + happy-dom / jsdom
**Architecture:** Testes de validação de camadas usando fs (sem framework extra)
**Coverage:** v8 provider (backend)

## Test Organization

### Backend

**Localização:** `tests/` (separado de `src/`)
**Configuração:** `vitest.config.ts` na raiz — `include: ['tests/**/*.test.ts']`

```
tests/
├── architecture/
│   └── layer-validation.test.ts    # Valida que domain não importa HTTP/Prisma/infra
├── database/
│   └── schema.test.ts              # Valida estrutura do schema Prisma
├── infrastructure/
│   ├── auth-middleware.test.ts     # Middleware de autenticação
│   ├── event-bus.test.ts           # EventBus retry, DLQ
│   ├── integrations.test.ts        # WhatsApp e Calendar adapters
│   └── tenant-isolation.test.ts    # Isolamento multi-tenant
└── unit/persistence/
    ├── session-repository.test.ts
    ├── tenant-repository.test.ts
    └── user-repository.test.ts
```

### Frontend

**Localização:** `frontend/src/__tests__/`
**Configuração:** `frontend/vitest.config.ts`

```
src/__tests__/
├── auth/            # Testes de páginas/componentes de auth
├── components/      # Testes de componentes UI
├── dashboard/       # Testes de páginas do dashboard
└── lib/             # Testes de helpers (api.ts, utils.ts)
```

## Testing Patterns

### Architecture Tests

**Abordagem:** Validação estática de imports — lê arquivos TS e verifica que camadas não importam o que não deveriam
**Localização:** `tests/architecture/layer-validation.test.ts`

Regras validadas:
- `domain/` NÃO importa `http/`, `fastify`, `express` ou `@prisma/client`
- `domain/` de um contexto NÃO importa `domain/` de outro contexto
- `application/` NÃO importa `@prisma/client` diretamente

### Infrastructure Tests

**Event Bus:** Testa retry exponencial com backoff, dead letter queue, subscribe/unsubscribe por módulo
**Auth Middleware:** Testa resolução de sessão, rotas públicas, 401 sem sessão, contexto setado
**Tenant Isolation:** Valida que queries sempre filtram por tenantId

### Unit Tests (Persistence)

**Abordagem:** Testa repositórios Prisma com banco real ou mocks
**In-Memory Adapters:** Módulos clinical e billing têm `InMemoryAttendanceRepository`, `InMemoryReceivableRepository`, `InMemoryTariffResolver` para testes de use case sem banco

## Test Execution

**Backend:**
```bash
npm test              # vitest run (uma vez)
npm run test:watch    # vitest (modo watch)
npm run test:coverage # vitest run --coverage (relatório v8)
```

**Frontend:**
```bash
npm test              # vitest
npm run test:watch    # vitest watch
npm run test:coverage # vitest run --coverage
```

## Coverage Targets

**Configuração:** `vitest.config.ts`
- `include: ['src/**/*.ts']`
- `exclude: ['src/**/index.ts']` (re-exports ignorados)
- Reporter: text, json, html

**Metas:** Não documentadas explicitamente — enforçadas via CI não configurado ainda.
