# Skill: Frontend Development

=================================================================

## Purpose

Padrões de frontend para React, Next.js (App Router), shadcn/ui e Tailwind. Implementar telas, componentes, formulários, data fetching e UI acessível e responsiva alinhada a docs/ui/screens e design-system.

=================================================================

## When to Use This Skill

- Implementar telas ou fluxos descritos em docs/ui/screens.md ou screens-p2-p3.md
- Criar ou alterar componentes React (composition, compound components)
- Gerenciar estado (useState, useReducer, Context, Zustand se adotado)
- Implementar data fetching (TanStack Query, SWR, Server Components)
- Trabalhar com formulários (validação, controlled inputs, Zod)
- Implementar rotas e navegação (Next.js App Router)
- Garantir UI acessível e responsiva conforme design-system
- Otimizar performance (memoization, code splitting, virtualização de listas)

=================================================================

## Contexto do projeto

- **Stack:** Next.js 14+ (App Router), shadcn/ui, Tailwind CSS, Lucide Icons
- **Referências obrigatórias:** docs/ui/design-system.md, docs/ui/screens.md
- **API:** Prefixo /api/v1/; erros no formato ADR 0010; auth via sessão; tenantId/userId da sessão

=================================================================

## Core Responsibilities

1. **Telas e rotas** — Implementar páginas e fluxos conforme screens.md; chamadas à API documentadas
2. **Componentes** — Composição sobre herança; compound components; seguir design-system (shadcn + tokens)
3. **Formulários** — Controlled inputs; validação (Zod ou react-hook-form); feedback de erro da API
4. **Data fetching** — TanStack Query ou SWR; loading/error states; não bloquear UI
5. **Acessibilidade** — Navegação por teclado, foco em modais, ARIA; design-system
6. **Performance** — useMemo/useCallback; lazy loading; virtualização para listas longas

=================================================================

## Component Patterns

- **Composition** — Preferir children e subcomponentes (Card, CardHeader, CardBody); variantes via props
- **Compound components** — Context + componentes compostos (Tabs, TabList, Tab); context check
- **Custom hooks** — useToggle, useQuery/useMutation, useDebounce
- **State** — useState/useReducer; Context + reducer para fluxo; server state (TanStack Query) para API
- **Forms** — Controlled inputs; Zod; erros da API (error.code, error.message); toast para feedback
- **Performance** — useMemo, useCallback, React.memo; lazy() + Suspense; virtualização (@tanstack/react-virtual)
- **Accessibility** — Teclado (ArrowDown/Up, Enter, Escape); focus em modais; role e aria-*

=================================================================

## Prohibited

- Implementar regras de negócio ou validações que devem ficar no backend
- Chamar APIs fora do prefixo /api/v1/ ou ignorar contrato de erro (ADR 0010)
- Ignorar design-system (cores, componentes base, tokens)
- Criar componentes que dupliquem os do shadcn/ui sem justificativa
- Expor tenantId ou dados sensíveis na URL ou em logs do cliente

=================================================================

## Outputs

- Componentes e páginas em app/ ou src/
- Uso consistente de design-system e docs/ui/screens para contratos de tela e API
