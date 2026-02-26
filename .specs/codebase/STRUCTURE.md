# Project Structure

**Root:** `prontuario-autonomo-medico/`

## Directory Tree

```
prontuario-autonomo-medico/
├── src/                          # Backend — fonte TypeScript
│   ├── main.ts                   # Entry point: Fastify app, DI manual, routes
│   ├── shared/                   # Tipos e contratos cross-context
│   │   ├── types.ts              # TenantId, UserId, generateId()
│   │   ├── errors.ts             # DomainError base
│   │   └── events.ts             # DomainEventBase, EventHandler
│   ├── identity/                 # Bounded context: Auth, Users, Tenants
│   │   ├── domain/               # entities.ts, errors.ts, ports.ts
│   │   ├── application/          # use-cases/ (login, register, team, etc.)
│   │   └── adapters/             # http/ (auth.routes.ts, team.routes.ts)
│   ├── clinical/                 # Bounded context: Pacientes, Evolução
│   │   ├── domain/               # patient.ts, attendance.ts, evolution.ts, patient-link.ts
│   │   ├── application/          # use-cases/ + handlers/ + ports.ts
│   │   └── adapters/             # http/ + persistence/ (attendance.repository.ts)
│   ├── scheduling/               # Bounded context: Agendamentos
│   │   ├── domain/               # appointment.ts, errors.ts
│   │   ├── application/          # use-cases/appointment.use-cases.ts
│   │   └── adapters/             # http/appointment.routes.ts
│   ├── billing/                  # Bounded context: Contas a Receber, Recibos
│   │   ├── domain/               # receivable.ts, errors.ts
│   │   ├── application/          # use-cases/ + handlers/ + ports.ts
│   │   └── adapters/             # http/ + persistence/ (receivable.repository.ts)
│   ├── notifications/            # Bounded context: Notificações (estrutura criada, impl pendente)
│   │   ├── application/
│   │   └── adapters/
│   └── infrastructure/           # Implementações técnicas compartilhadas
│       ├── auth/                 # bcrypt-hasher.ts, uuid-token-generator.ts, console-email-service.ts
│       ├── events/               # event-bus.ts, setup-handlers.ts
│       ├── http/                 # context.ts (AsyncLocalStorage), middleware/ (auth.ts, tenant-guard.ts)
│       ├── integrations/         # whatsapp.adapter.ts, calendar.adapter.ts, http-client.ts
│       └── persistence/
│           ├── base-repository.ts  # (obsoleto — mantido para referência)
│           └── prisma/           # client.ts + repositories individuais
│               ├── user.repository.ts
│               ├── tenant.repository.ts
│               ├── session.repository.ts
│               ├── patient.repository.ts
│               ├── invite.repository.ts
│               ├── consent.repository.ts
│               ├── email-confirmation.repository.ts
│               └── password-reset.repository.ts
├── frontend/                     # Next.js 14 App Router
│   └── src/
│       ├── app/
│       │   ├── (auth)/           # Rotas de autenticação (login, register, etc.)
│       │   ├── (dashboard)/      # Rotas do dashboard (protegidas)
│       │   ├── layout.tsx        # Root layout
│       │   └── page.tsx          # Home page (redirect)
│       ├── components/
│       │   ├── ui/               # Componentes Radix UI estilizados com Tailwind
│       │   └── layout/           # Header, Sidebar, Shell
│       ├── hooks/                # React hooks customizados
│       ├── lib/
│       │   ├── api.ts            # Cliente HTTP para backend
│       │   └── utils.ts          # cn() e helpers
│       ├── middleware.ts         # Next.js middleware (proteção de rotas)
│       └── __tests__/            # Testes frontend
├── prisma/
│   ├── schema.prisma             # Schema completo com todos os contextos
│   └── seed.ts                   # Dados de seed
├── tests/                        # Testes backend
│   ├── architecture/             # layer-validation.test.ts
│   ├── database/                 # schema.test.ts
│   ├── infrastructure/           # auth-middleware, event-bus, integrations, tenant-isolation
│   └── unit/persistence/         # session, tenant, user repositories
├── docs/
│   ├── adr/                      # 13 ADRs (Architecture Decision Records)
│   ├── architecture/             # overview, style, components, deployment, etc.
│   └── content/                  # user stories, business problem, constraints, etc.
├── .specs/                       # Spec-driven docs (este mapeamento)
├── docker-compose.yml            # Stack completa (postgres + backend + frontend)
├── docker-compose.db.yml         # Apenas PostgreSQL (dev)
├── Dockerfile.backend
├── package.json                  # Backend deps
├── tsconfig.json
└── vitest.config.ts
```

## Module Organization

### identity
**Propósito:** Autenticação, registro de tenants (autônomo/clínica), gestão de equipe, convites
**Localização:** `src/identity/`
**Arquivos chave:** `domain/entities.ts`, `application/use-cases/login.use-case.ts`, `adapters/http/auth.routes.ts`

### clinical
**Propósito:** Cadastro de pacientes, vínculos profissional-paciente, atendimentos, evoluções clínicas (prontuário)
**Localização:** `src/clinical/`
**Arquivos chave:** `domain/patient.ts`, `domain/attendance.ts`, `domain/evolution.ts`, `adapters/http/patient.routes.ts`

### scheduling
**Propósito:** Criação e gestão de agendamentos, verificação de conflitos, agenda por profissional
**Localização:** `src/scheduling/`
**Arquivos chave:** `application/use-cases/appointment.use-cases.ts`, `adapters/http/appointment.routes.ts`

### billing
**Propósito:** Contas a receber geradas automaticamente ao completar consulta, emissão de recibos
**Localização:** `src/billing/`
**Arquivos chave:** `application/handlers/appointment-completed.handler.ts`, `domain/receivable.ts`

### infrastructure
**Propósito:** Implementações técnicas reutilizadas entre contextos
**Localização:** `src/infrastructure/`
**Subáreas:**
- `auth/`: hashing, tokens, email stub
- `events/`: event bus in-memory com retry + DLQ
- `http/`: middleware de auth, AsyncLocalStorage de contexto
- `integrations/`: WhatsApp, Google Calendar, HTTP client com circuit breaker
- `persistence/prisma/`: todos os repositórios Prisma

## Where Things Live

**Autenticação:**
- Domain: `src/identity/domain/`
- Use Cases: `src/identity/application/use-cases/`
- HTTP: `src/identity/adapters/http/auth.routes.ts`
- Infraestrutura: `src/infrastructure/auth/`, `src/infrastructure/persistence/prisma/session.repository.ts`

**Prontuário / Evolução:**
- Domain: `src/clinical/domain/attendance.ts`, `evolution.ts`
- Use Cases: `src/clinical/application/use-cases/`
- HTTP: `src/clinical/adapters/http/evolution.routes.ts`
- Persistence: `src/clinical/adapters/persistence/attendance.repository.ts`

**Agendamento:**
- Domain: `src/scheduling/domain/`
- Use Cases: `src/scheduling/application/use-cases/appointment.use-cases.ts`
- HTTP: `src/scheduling/adapters/http/appointment.routes.ts`

**Cobrança:**
- Domain: `src/billing/domain/receivable.ts`
- Criação automática: `src/billing/application/handlers/appointment-completed.handler.ts`
- HTTP: `src/billing/adapters/http/receivable.routes.ts`
