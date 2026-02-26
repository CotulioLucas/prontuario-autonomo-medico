# Componentes e mapeamento para bounded contexts

**Fonte**: docs/domain/bounded-contexts.md, docs/domain/aggregates.md

=================================================================

## 1. Mapeamento contexto → módulo (backend/src/)

| Bounded context      | Módulo / pasta (proposta) | Responsabilidade |
|----------------------|---------------------------|------------------|
| Identidade e Acesso  | `identity/` ou `auth/`    | Tenant, User, Role, auth flows, tenantId em sessão |
| Agendamento          | `scheduling/`             | Agenda, Appointment, slots, conflitos, eventos Agendamento* |
| Clínico              | `clinical/`              | Patient, ProfessionalPatientLink, Attendance, Evolution |
| Financeiro           | `billing/`                | Receivable, Receipt, baixa, aging |
| Notificações         | `notifications/`         | Handlers de eventos; envio WhatsApp/e-mail; sem regras de outros contextos |

**Compartilhados** (não são um contexto sozinho):

- `shared/` ou `kernel/`: tipos comuns, eventos base, tenantId, erros de domínio.
- `infrastructure/`: persistência (Prisma), filas, clientes HTTP (calendário, WhatsApp).

## 2. Componentes por camada

### Domínio (por módulo)

- **identity**: Tenant, User, RoleAssignment; VOs (Email, Role); eventos UsuárioRegistrado, E-mailConfirmado, etc.
- **scheduling**: Agenda (raiz), Appointment; VOs (Slot, AppointmentStatus); eventos AgendamentoCriado, AgendamentoRealizado, etc.
- **clinical**: Patient, ProfessionalPatientLink, Attendance (raiz), Evolution; eventos AtendimentoRegistrado, EvoluçãoRegistrada.
- **billing**: Receivable (raiz), Receipt (raiz); VOs (Money, PaymentStatus); eventos ContaAReceberCriada, ReciboEmitido, etc.
- **notifications**: sem entidades de domínio próprio; consome eventos e dispara envios.

### Aplicação (casos de uso)

- **identity**: RegisterUser, ConfirmEmail, ValidateIdentity, AssignRole.
- **scheduling**: CreateAppointment, UpdateAppointment, CancelAppointment, MarkAppointmentAsRealized (publica AgendamentoRealizado).
- **clinical**: RegisterPatient, CreateProfessionalPatientLink, RegisterAttendance (consumidor de AgendamentoRealizado), RegisterEvolution.
- **billing**: CreateReceivable (consumidor), RecordPayment, IssueReceipt.
- **notifications**: SendAppointmentConfirmation, SendReminder (consumidores de eventos).

### Adaptadores

- **HTTP**: Next.js API Routes ou Fastify (REST); middleware de auth e tenant resolution.
- **Persistência**: Prisma; repositórios por agregado; filtro por tenantId em toda query.
- **Integrações**: CalendarAdapter (Google/Apple/Outlook), WhatsAppAdapter; retry e circuit breaker (ver failure-modes.md).
- **Workers**: processar fila de eventos (AgendamentoCriado → notificação, AgendamentoRealizado → Atendimento + Receivable).

## 3. Interfaces entre componentes

- **Identidade → outros**: toda requisição carrega tenantId e userId (e papéis); passado por contexto/app.
- **Agendamento → Clínico/Financeiro**: evento AgendamentoRealizado; handlers em clinical e billing criam Atendimento e Conta a receber (sem chamada HTTP entre módulos no mesmo processo).
- **Agendamento/outros → Notificações**: evento publicado; Notificações assina e chama adaptador WhatsApp/e-mail.

## 4. Regras de dependência

- Módulos de domínio não importam outros módulos de domínio (exceto shared/kernel se existir).
- Aplicação pode orquestrar vários módulos de domínio e publicar eventos.
- Adaptadores dependem da aplicação (portas) e de infraestrutura; nunca do domínio direto além de tipos/eventos.

=================================================================

## 5. Estrutura de pastas (definitiva — ADR 0007)

**Decisão**: Monorepo com `backend/` e `frontend/` na raiz. Backend organizado por módulo (bounded context) em `backend/src/`; frontend em `frontend/` (Next.js App Router). Implementado em conformidade com ADR 0007.

```
<repo>/
  backend/                   # API, domínio, serviços
    src/
      shared/                # Tipos comuns, eventos base, erros, tenantId; sem regras de um contexto
      identity/
        domain/
        application/
        adapters/
      scheduling/
        domain/
        application/
        adapters/
      clinical/
        domain/
        application/
        adapters/
      billing/
        domain/
        application/
        adapters/
      notifications/         # Sem domain próprio; apenas application + adapters
        application/
        adapters/
      infrastructure/       # Único por aplicação: Prisma, filas, clientes HTTP
        persistence/
        integrations/
      adapters/             # ex.: http (Fastify ou Next.js API routes)
    package.json
    tsconfig.json
  frontend/                 # Next.js — UI, telas, componentes
    app/                    # App Router (rotas, layouts)
    components/
    lib/
    package.json
    tsconfig.json
  docs/
  package.json              # opcional: workspaces na raiz
```

- **backend/src/shared**: tipos, eventos base, erros, tenantId. Domínio de um módulo não importa domain de outro; pode importar shared.
- **backend/src**: identity, scheduling, clinical, billing — cada um com domain, application, adapters; notifications apenas application e adapters; infrastructure para persistência e integrações.
- **frontend**: consome apenas `/api/v1/*`; estrutura conforme docs/ui (screens, design-system); sem regras de domínio do backend.

A escolha está registrada em **ADR 0007** e implementada no código-fonte.
