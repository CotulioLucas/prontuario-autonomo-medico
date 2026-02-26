# ADR 0007 — Estrutura de pastas do código-fonte

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: components.md propunha duas opções (por camada vs por módulo); travar a organização antes da implementação. Monorepo adotado para separar backend e frontend na raiz.

## Decisão

- **Monorepo na raiz**: o repositório possui duas aplicações principais em pastas de primeiro nível — `backend/` (API, domínio, serviços) e `frontend/` (UI Next.js). Cada uma com seu próprio `package.json` e estrutura interna; a raiz pode ter `package.json` com workspaces (npm/pnpm/yarn) para orquestrar builds e dependências.
- **Backend** (`backend/`): organização por módulo (bounded context) dentro de `backend/src/`, com camadas dentro de cada módulo.
  - Estrutura: `backend/src/shared/`, `backend/src/identity/` (domain, application, adapters), `backend/src/scheduling/`, `backend/src/clinical/`, `backend/src/billing/`, `backend/src/notifications/` (application, adapters), `backend/src/infrastructure/` (persistence, integrations), `backend/src/adapters/` (ex.: http).
  - **shared**: tipos comuns, eventos base, erros, tenantId; sem regras de um contexto. Domínio de um módulo não importa domínio de outro; pode importar shared.
  - **infrastructure** e **adapters**: únicos por aplicação; módulos usam portas (interfaces), implementação em infrastructure/adapters.
- **Frontend** (`frontend/`): aplicação Next.js (App Router). Estrutura típica: `frontend/app/` (rotas e layouts), `frontend/components/`, `frontend/lib/`, etc., conforme docs/ui (screens, design-system). Consome apenas a API em `/api/v1/*`; não contém regras de domínio do backend.

## Alternativas consideradas

- **Single package com src/ único**: rejeitado; mistura backend e frontend na mesma árvore e dificulta deploy e ownership claros.
- Por camada (domain/, application/ na raiz): rejeitado; dificulta localizar por contexto.
- Flat por módulo: rejeitado para identity, scheduling, clinical, billing; notifications só application + adapters.

## Consequências

- Novos casos de uso e entidades do backend na pasta do contexto em `backend/src/`. Imports: application orquestra; domain não importa domain de outro contexto.
- Frontend permanece em `frontend/`; referências de documentação (user-stories-frontend, screens) apontam para rotas e componentes em `frontend/`.
- Atualizar docs/architecture/components.md com esta estrutura (backend/ e frontend/) como definitiva.
- Scripts na raiz (ex.: `npm run dev`) podem subir backend e frontend em paralelo ou em portas distintas, conforme configuração do monorepo.
