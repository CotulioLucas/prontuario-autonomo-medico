# Session State

**Last updated:** 2026-02-23

## Completed

- [x] Brownfield mapping — 6 docs criados em `.specs/codebase/`
- [x] Initialize project — PROJECT.md e ROADMAP.md criados
- [x] Specify feature auth — `.specs/features/auth/spec.md`
- [x] Specify feature pacientes — `.specs/features/pacientes/spec.md`
- [x] Design feature auth — `.specs/features/auth/design.md`

## Current Context

Design de F01 (auth) concluído. Escopo real menor que estimado:
- CPF/CNPJ já validados com dígitos verificadores — só faltava lançar erro tipado (InvalidDocumentError)
- 3 componentes novos: InvalidDocumentError, LogoutUseCase, ResendEmailService
- 3 mudanças cirúrgicas: fix erro CPF/CNPJ (2 use cases), wiring condicional em main.ts
- 1 adição frontend: botão logout no header/sidebar

Próximos passos: `tasks feature auth` ou `design feature pacientes`.

## Decisions

- Codebase usa Arquitetura Hexagonal + DDD Bounded Contexts
- Multi-tenancy por row-level isolation com AsyncLocalStorage
- Event bus in-memory (síncrono) no MVP — ADR 0004 prevê evolução para broker externo
- Frontend Next.js 14 App Router separado do backend Fastify
- Email service: ResendEmailService para prod, ConsoleEmailService para dev (wiring condicional por RESEND_API_KEY)
- Logout: LogoutUseCase com idempotência — silencioso se sessão já expirada

## Blockers

Nenhum.

## Preferences

- Tip sobre modelos para tarefas leves: já dado (não repetir)
