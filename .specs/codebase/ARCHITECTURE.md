# Architecture

**Padrão:** Monólito Modular com Arquitetura Hexagonal (Ports & Adapters) + DDD Bounded Contexts

## High-Level Structure

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (Next.js 14 App Router)                           │
│  Port 3001 → chama Backend via REST API                     │
└────────────────────────┬────────────────────────────────────┘
                         │ HTTP/REST  (cookies de sessão)
┌────────────────────────▼────────────────────────────────────┐
│  Backend (Fastify)  — src/main.ts                           │
│  ┌──────────┐ ┌──────────┐ ┌─────────────┐ ┌──────────┐   │
│  │ identity │ │ clinical │ │ scheduling  │ │ billing  │   │
│  │ context  │ │ context  │ │ context     │ │ context  │   │
│  └──────────┘ └──────────┘ └─────────────┘ └──────────┘   │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  infrastructure  (prisma, auth, events, http, integ) │   │
│  └──────────────────────────────────────────────────────┘   │
│  ┌──────────────────┐                                        │
│  │  shared          │  (types, errors, events)               │
│  └──────────────────┘                                        │
└────────────────────────┬────────────────────────────────────┘
                         │ Prisma ORM
              ┌──────────▼──────────┐
              │  PostgreSQL 16      │
              └─────────────────────┘
```

## Identified Patterns

### Hexagonal Architecture (Ports & Adapters)

**Localização:** Cada bounded context em `src/<context>/`
**Propósito:** Isolar domínio de frameworks e infraestrutura
**Implementação:** 3 camadas por contexto:
- `domain/` — entidades, interfaces de repositório, erros (sem dependências externas)
- `application/` — use cases, ports (interfaces), handlers de evento
- `adapters/` — implementações HTTP (routes) e persistence (repositories)

**Exemplo:** `src/clinical/domain/patient.ts` define `PatientRepository` interface; `src/infrastructure/persistence/prisma/patient.repository.ts` implementa-a.

### Multi-Tenancy por Row-Level Isolation

**Localização:** `src/infrastructure/http/context.ts`, todos os repositories
**Propósito:** Isolamento de dados entre clínicas/autônomos (tenant = clínica ou profissional autônomo)
**Implementação:** `AsyncLocalStorage` armazena `tenantId` por requisição; toda query filtra por `tenantId`. `tenantId` NUNCA vem do body — apenas da sessão autenticada.
**Exemplo:** `requireTenantId()` em `context.ts` lança exceção se contexto não estiver setado.

### In-Memory Event Bus com Dead Letter Queue

**Localização:** `src/infrastructure/events/event-bus.ts`
**Propósito:** Comunicação assíncrona entre bounded contexts sem acoplamento direto
**Implementação:** EventBus singleton com Map de handlers por nome de evento; retry exponencial (3 tentativas, backoff 2x, max 5s); falhas persistem em `deadLetterQueue`.
**Exemplo:** Scheduling publica `AppointmentCompleted` → Billing e Clinical subscrevem para criar Receivable e Attendance.

### Session-Based Authentication

**Localização:** `src/infrastructure/http/middleware/auth.ts`, `src/infrastructure/persistence/prisma/session.repository.ts`
**Propósito:** Autenticação stateful via cookie httpOnly
**Implementação:** Login gera UUID como session token, armazenado em PostgreSQL. Middleware `authMiddleware` resolve sessão a cada request. Suporte a `rememberMe` (1 dia vs 30 dias). Bloqueio após 5 tentativas falhas (30 min).

### Repository Pattern com Prisma

**Localização:** `src/infrastructure/persistence/prisma/`
**Propósito:** Abstrair acesso a banco, manter domínio limpo
**Implementação:** Cada entidade tem seu PrismaXxxRepository que implementa a interface definida no domain. Base obsoleta (`BaseTenantRepository`) — use adapters específicos.

## Data Flow

### Autenticação

```
POST /api/v1/auth/login
  → authMiddleware (rota pública, skip)
  → LoginUseCase
    → UserRepository.findByEmail
    → BcryptPasswordHasher.compare
    → SessionRepository.save (UUID token)
  → Set-Cookie: session=<token>; HttpOnly
```

### Fluxo Consulta → Cobrança (Event-Driven)

```
POST /api/v1/appointments/:id/complete
  → authMiddleware (resolve tenantId da sessão)
  → CompleteAppointmentUseCase
    → AppointmentRepository.update(status=COMPLETED)
    → eventBus.publish(AppointmentCompletedEvent)
      → [clinical] createAttendanceHandler → Attendance criada
      → [billing]  createReceivableHandler → Receivable criada
```

### Isolamento Multi-Tenant

```
Request chega
  → authMiddleware: resolve sessão, extrai tenantId
  → setContext({ tenantId, userId, roles })
  → qualquer use case chama requireTenantId()
  → todas as queries Prisma incluem WHERE tenantId = ?
```

## Code Organization

**Abordagem:** Feature/Domain-based (por bounded context)

**Estrutura dentro de cada contexto:**
```
src/<context>/
  domain/          ← entidades, interfaces, erros (zero deps externas)
  application/
    use-cases/     ← lógica de negócio
    handlers/      ← event handlers
    ports.ts       ← interfaces de ports (repositórios, serviços)
    index.ts       ← re-exports
  adapters/
    http/          ← Fastify route handlers
    persistence/   ← implementações de repositório (in-memory ou Prisma)
    index.ts
```

**Fronteiras de módulo:** Contextos comunicam APENAS via eventos de domínio (event bus) ou via shared/. Importação direta de domain de outro contexto é proibida (validado em `tests/architecture/layer-validation.test.ts`).
