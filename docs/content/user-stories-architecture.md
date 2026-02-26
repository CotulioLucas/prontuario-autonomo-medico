# User Stories — Arquitetura

**Fonte**: docs/architecture/*, docs/adr/0002, 0004, 0005, 0007
**Status**: Backlog
**Ultima atualizacao**: 2026-02-09
**Executor**: Agente de IA (uma US por tarefa). Cada US inclui Entradas (docs), Saidas (artefatos) e criterios de aceite verificaveis.

**Subagents**: Cada US indica **Agente(s) recomendado(s)** — arquivo em `subagents/<nome>.agent.md` que melhor se enquadra para executar a US. Usar esse agente ao distribuir a tarefa.

=================================================================

## Licao aprendida: pre-requisito do projeto

**Onde erramos**: Ao executar US-ARQ-01 (estrutura de pastas), assumimos que o projeto ja tinha `package.json`, `tsconfig.json` e um servidor HTTP. So na US-ARQ-02 (middleware, tenantId da sessao) percebemos que nao havia stack para subir a API. Ou seja: **nao existia uma US de "bootstrap" ou pre-requisito** que garantisse "projeto buildavel e executavel" antes de qualquer outra US de arquitetura.

**O que deixamos passar**:
- Nenhuma US exigia **projeto com package.json, tsconfig, runtime (Node) e framework HTTP (Fastify ou Next.js)** como saida.
- Nenhum criterio de aceite da US-ARQ-01 dizia "o projeto possui `npm install` e `npm run dev` funcionando".
- O plano nao tinha um **passo 0** ou **pre-requisito explicito**: "antes de implementar US-ARQ-01, o repositorio deve ter esqueleto executavel do backend (ou a primeira US de arquitetura deve ser o bootstrap)."

**Correcao**: Incluir **US-ARQ-00 (Bootstrap do projeto)** como **primeira** US a ser executada, antes da US-ARQ-01. Ordem correta: **US-ARQ-00 -> US-ARQ-01 -> US-ARQ-02 -> ...**

=================================================================

## Personas

| Persona | Descricao |
|---------|-----------|
| **Desenvolvedor** | Quem implementa o codigo; segue a estrutura e regras da arquitetura. |
| **Arquiteto** | Define e valida fronteiras, camadas e padroes. |
| **Sistema** | Restricoes estruturais (ex.: isolamento tenant, resolucao de tenantId). |

## Niveis de prioridade

| Nivel | Significado |
|-------|-------------|
| **P0** | Fundacao — estrutura de pastas, isolamento tenant, camadas. |
| **P1** | Eventos entre contextos, middleware auth/tenant. |
| **P2** | Resiliencia de integracoes, failure-modes. |

=================================================================

## Inventario (US-ARQ-xx)

| ID | Titulo | Prioridade | Ordem | Agente(s) recomendado(s) |
|----|--------|------------|-------|---------------------------|
| **US-ARQ-00** | **Bootstrap do projeto (package, tsconfig, servidor HTTP)** | P0 | **1** | backend |
| US-ARQ-01 | Estrutura de pastas por modulo (ADR 0007) | P0 | 2 | backend; architect (validar) |
| US-ARQ-02 | Isolamento tenant: tenantId da sessao, nunca do body | P0 | 3 | backend; security |
| US-ARQ-04 | Camadas domain/application/adapters e dependencias | P0 | 4 | backend; architect (convencoes) |
| US-ARQ-05 | Middleware de auth e resolucao de tenantId | P0 | 5 | backend; security |
| US-ARQ-03 | Comunicacao entre contextos via eventos (ADR 0004) | P1 | 6 | backend; architect (contratos) |
| US-ARQ-06 | Publicacao e consumo de eventos (AgendamentoRealizado) | P1 | 7 | backend |
| US-ARQ-07 | Integracoes externas: timeout, retry, nao bloquear fluxo (ADR 0005) | P2 | 8 | backend; devops (opcional) |

=================================================================

## Pre-requisito — executar antes de US-ARQ-01

---

### US-ARQ-00: Bootstrap do projeto (monorepo: backend e frontend)

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** desenvolvedor, **quero** que o repositorio seja um monorepo com pastas `backend/` e `frontend/`, cada uma com seu package.json e stack executavel (backend: servidor HTTP; frontend: Next.js), **para** que todas as demais US de arquitetura, backend e frontend possam ser implementadas.

**Entradas (docs)**:
- docs/adr/0010-api-rest-design.md (Fastify ou Next.js; prefixo /api/v1/)
- docs/adr/0007-source-folder-structure.md (monorepo backend/ e frontend/)
- docs/architecture/overview.md

**Saidas (artefatos)**:
- **Raiz**: package.json (opcional com workspaces) ou apenas documentacao; pasta `backend/` e pasta `frontend/`
- **backend/**:
  - package.json com scripts build, start, dev; dependencias (fastify ou next para API); devDependencies (typescript, tsx ou equivalente)
  - tsconfig.json com rootDir src, outDir dist
  - Ponto de entrada (ex.: backend/src/main.ts ou backend/src/index.ts) que inicia servidor HTTP e escuta em porta (ex.: 3000)
  - Rota minimo de health (ex.: GET /api/v1/health) que retorna 200
- **frontend/**:
  - package.json com Next.js 14+ (App Router); scripts build, start, dev
  - tsconfig.json; pasta app/ (ou src/app/) conforme Next.js
  - Estrutura minima para rodar `npm run dev` (ex.: app/layout.tsx, app/page.tsx)
- README ou doc com comando para rodar backend e frontend (ex.: cd backend && npm run dev; cd frontend && npm run dev)

**Criterios de aceite**:
- [ ] Existem as pastas `backend/` e `frontend/` na raiz do repositorio
- [ ] backend/ tem package.json com scripts build, start, dev e dependencia de servidor HTTP (Fastify ou Next.js API)
- [ ] backend/ tem tsconfig.json com rootDir src (ou equivalente) e configuracao TypeScript valida
- [ ] frontend/ tem package.json com Next.js 14+ e scripts build, start, dev
- [ ] frontend/ tem estrutura Next.js App Router (app/ ou src/app/) executavel
- [ ] npm install em backend/ e em frontend/ executa sem erro
- [ ] npm run dev no backend sobe o servidor e responde (ex.: GET /api/v1/health retorna 200)
- [ ] npm run dev no frontend sobe a aplicacao Next.js
- [ ] Nenhuma US de arquitetura ou backend deve ser executada antes desta (esta US e pre-requisito)

=================================================================

## P0 — Fundacao

---

### US-ARQ-01: Estrutura de pastas por modulo (monorepo: backend + frontend)

**Agente(s) recomendado(s)**: `subagents/backend.agent.md` (executar); `subagents/architect.agent.md` (validar alinhamento)

**Como** desenvolvedor, **quero** que o codigo siga a estrutura de pastas em monorepo definida no ADR 0007: `backend/src/` com modulos (identity, scheduling, clinical, billing, notifications, shared, infrastructure) e `frontend/` com Next.js (app/, components/), **para** manter fronteiras claras entre contextos e entre backend e frontend.

**Entradas (docs)**:
- docs/adr/0007-source-folder-structure.md
- docs/architecture/components.md
- docs/architecture/overview.md

**Saidas (artefatos)**:
- **Backend**: pastas em `backend/src/`: `shared/`, `identity/`, `scheduling/`, `clinical/`, `billing/`, `notifications/`, `infrastructure/` (e `adapters/` se aplicavel)
- Dentro de cada modulo em backend (exceto shared, notifications): subpastas `domain/`, `application/`, `adapters/` conforme ADR 0007
- **Frontend**: pasta `frontend/` com estrutura Next.js (app/, components/, lib/ conforme projeto)
- docs/architecture/components.md atualizado com estrutura como definitiva (se ainda nao estiver)

**Criterios de aceite**:
- [ ] Existe `backend/src/shared/` com tipos comuns, eventos base, erros, tenantId
- [ ] Existem `backend/src/identity/`, `backend/src/scheduling/`, `backend/src/clinical/`, `backend/src/billing/` com subpastas domain, application, adapters
- [ ] Existe `backend/src/notifications/` (application e adapters; sem domain proprio)
- [ ] Existe `backend/src/infrastructure/` (persistence, integrations)
- [ ] Nenhum modulo de dominio no backend importa domain de outro modulo (apenas shared)
- [ ] Existe `frontend/` com estrutura Next.js (app/ ou src/app/; components/; package.json e tsconfig.json)
- [ ] Estrutura esta documentada ou alinhada a ADR 0007 (monorepo backend + frontend)

---

### US-ARQ-02: Isolamento tenant — tenantId da sessao

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`; `subagents/security.agent.md` (auth/tenant/isolation)

**Como** sistema, **quero** que toda leitura/escrita de dados de negocio use o tenantId resolvido da sessao e nunca aceite tenantId no body em rotas que alteram dados, **para** garantir isolamento multi-tenant (ADR 0002, DR-IA-4).

**Entradas (docs)**:
- docs/adr/0002-architectural-style-and-multi-tenant.md
- docs/architecture/overview.md
- docs/domain/domain-rules.md (regra DR-IA-4 se existir)

**Saidas (artefatos)**:
- Middleware ou contexto de requisicao que expoe `tenantId` e `userId` a partir da sessao
- Convencao documentada ou codigo que rejeita `tenantId` em body de POST/PUT/PATCH em rotas de dados de negocio
- Queries e repositorios que sempre filtram por `tenantId` do contexto

**Criterios de aceite**:
- [x] Toda rota protegida que acessa dados de negocio resolve tenantId (e userId) da sessao, nao do body
- [x] Nenhuma rota de criacao/alteracao aceita tenantId no body para dados de negocio
- [x] Toda query de leitura/escrita em tabelas com tenantId inclui filtro por tenantId do contexto
- [x] Teste ou checklist que valida tentativa de acesso cross-tenant e rejeitada

---

### US-ARQ-04: Camadas domain / application / adapters

**Agente(s) recomendado(s)**: `subagents/backend.agent.md` (codigo); `subagents/architect.agent.md` (convencoes/dependencias)

**Como** desenvolvedor, **quero** que cada modulo siga as camadas Clean/Hexagonal (dominio no centro, aplicacao orquestra, adaptadores nas bordas) com dependencias sempre para dentro, **para** manter dominio independente de framework e IO.

**Entradas (docs)**:
- docs/architecture/style.md
- docs/architecture/components.md
- docs/architecture/overview.md

**Saidas (artefatos)**:
- Em cada modulo: codigo em `domain/` (agregados, entidades, VOs, eventos) sem import de HTTP/BD
- Camada `application/` que usa dominio e orquestra casos de uso; nao conhece detalhes de HTTP ou BD
- Camada `adapters/` que implementa portas e chama aplicacao
- Nenhum import de domain de um modulo em domain de outro (exceto shared)

**Criterios de aceite**:
- [x] Domain de cada modulo nao importa framework, Prisma, HTTP ou outro modulo de domain
- [x] Application usa apenas dominio e portas (interfaces); nao acessa BD ou HTTP diretamente
- [x] Adaptadores dependem da aplicacao (portas) e infraestrutura; nao do dominio direto alem de tipos/eventos
- [x] Nenhum import de domain de modulo A em domain de modulo B (validavel por analise estatica ou checklist)

---

### US-ARQ-05: Middleware de auth e resolucao de tenantId

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`; `subagents/security.agent.md` (auth, 401/403)

**Como** desenvolvedor, **quero** que todas as rotas protegidas passem por middleware de autenticacao e que o middleware disponibilize tenantId e userId (e papeis) no contexto da requisicao, **para** que handlers e repositorios usem esses valores de forma consistente.

**Entradas (docs)**:
- docs/architecture/integration-patterns.md (cliente-servidor, auth)
- docs/adr/0002-architectural-style-and-multi-tenant.md
- docs/adr/0010-api-rest-design.md (se existir; 401/403)

**Saidas (artefatos)**:
- Middleware de autenticacao (sessao/JWT) aplicado nas rotas /api/v1/* exceto rotas publicas (ex.: login, registro)
- Contexto de requisicao (ou app.locals) com tenantId, userId e papeis apos middleware
- Rotas nao autenticadas retornam 401; rotas sem permissao retornam 403

**Criterios de aceite**:
- [x] Rotas protegidas exigem sessao valida; caso contrario retornam 401
- [x] Apos auth, contexto da requisicao contem tenantId, userId e papeis
- [x] Rotas publicas documentadas (ex.: POST /api/v1/auth/login, registro) nao exigem auth
- [x] Acesso a recurso sem permissao (ex.: papel insuficiente) retorna 403

=================================================================

## P1 — Eventos e comunicacao entre contextos

---

### US-ARQ-03: Comunicacao entre contextos via eventos

**Agente(s) recomendado(s)**: `subagents/backend.agent.md` (handlers, publicacao); `subagents/architect.agent.md` (contratos de eventos)

**Como** desenvolvedor, **quero** que a comunicacao entre contextos (Agendamento -> Clinico, Agendamento -> Financeiro) seja feita via eventos de dominio (ex.: AgendamentoRealizado) e handlers, sem chamada HTTP entre modulos, **para** respeitar ADR 0004.

**Entradas (docs)**:
- docs/adr/0004-inter-context-communication.md
- docs/architecture/style.md (event-driven)
- docs/architecture/integration-patterns.md
- docs/domain/domain-events.md

**Saidas (artefatos)**:
- Definicao (ou codigo) do evento AgendamentoRealizado com payload (aggregateId, tenantId, dados minimos)
- Handler(s) no modulo clinical que criam Atendimento ao receber AgendamentoRealizado
- Handler(s) no modulo billing que criam Conta a receber ao receber AgendamentoRealizado
- Publicacao do evento ao marcar agendamento como realizado (sem chamada HTTP entre modulos)

**Criterios de aceite**:
- [x] Nao ha chamada HTTP de scheduling para clinical ou billing
- [x] Ao marcar agendamento como realizado, e publicado evento AgendamentoRealizado
- [x] Handler(s) de AgendamentoRealizado criam Atendimento (clinical) e Conta a receber (billing)
- [x] Contrato do evento (payload) documentado ou tipado de forma estavel

---

### US-ARQ-06: Publicacao e consumo de eventos (AgendamentoRealizado)

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** desenvolvedor, **quero** que a aplicacao de agendamento publique eventos de dominio e que os handlers em clinical e billing sejam invocados (no MVP em sequencia, sincrono), **para** manter consistencia entre agregados sem transacao distribuida.

**Entradas (docs)**:
- docs/adr/0004-inter-context-communication.md
- docs/domain/domain-events.md
- docs/architecture/integration-patterns.md

**Saidas (artefatos)**:
- Mecanismo de publicacao de eventos (bus in-memory ou invocacao direta de handlers no MVP)
- Registro de handlers: AgendamentoRealizado -> criar Atendimento; AgendamentoRealizado -> criar Conta a receber
- Cada handler executa em sua propria transacao; retry em caso de falha

**Criterios de aceite**:
- [x] Ao publicar AgendamentoRealizado, handler Clinical cria Atendimento
- [x] Ao publicar AgendamentoRealizado, handler Billing cria Conta a receber
- [x] Transacao de cada handler e independente (sem transacao distribuida unica)
- [x] Em falha de um handler, ha retry ou registro para reprocesso (conforme ADR 0004)

=================================================================

## P2 — Resiliencia

---

### US-ARQ-07: Integracoes externas — timeout, retry, nao bloquear

**Agente(s) recomendado(s)**: `subagents/backend.agent.md` (adapters); `subagents/devops.agent.md` (opcional: monitoramento)

**Como** desenvolvedor, **quero** que integracoes externas (calendario, WhatsApp) tenham timeout, retry com backoff e nao bloqueiem o fluxo principal, **para** respeitar failure-modes e ADR 0005.

**Entradas (docs)**:
- docs/architecture/failure-modes.md
- docs/architecture/integration-patterns.md
- docs/adr/0005-external-integrations.md (se existir)

**Saidas (artefatos)**:
- Adapters de calendario e WhatsApp com timeout configurado (ex.: 5s)
- Retry com backoff (ex.: 3 tentativas) em chamadas a APIs externas
- Fluxo de agendamento/notificacao nao bloqueia resposta ao usuario (notificacoes em background)
- Documentacao ou codigo que implementa circuit breaker opcional conforme failure-modes

**Criterios de aceite**:
- [x] Chamadas a APIs externas (calendario, WhatsApp) possuem timeout definido
- [x] Ha retry com backoff em caso de falha transiente
- [x] Envio de notificacao (WhatsApp/e-mail) nao bloqueia o fluxo principal (background job ou worker)
- [x] Agenda interna permanece como fonte da verdade em falha de calendario externo

=================================================================

## Rastreabilidade

| US | ADR / Doc arquitetura |
|----|------------------------|
| US-ARQ-01 | ADR 0007, components.md |
| US-ARQ-02 | ADR 0002, overview.md |
| US-ARQ-03 | ADR 0004, integration-patterns.md |
| US-ARQ-04 | style.md, components.md, overview.md |
| US-ARQ-05 | integration-patterns.md, ADR 0002, ADR 0010 |
| US-ARQ-06 | ADR 0004, domain-events.md, integration-patterns.md |
| US-ARQ-07 | failure-modes.md, integration-patterns.md, ADR 0005 |
