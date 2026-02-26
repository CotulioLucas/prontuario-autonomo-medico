# Setup do padrão de agentes (Cursor)

**Referência**: workspace raiz (cursor-ia)  
**Objetivo**: Deixar o projeto **prontuario-autonomo-medico** com o mesmo padrão de agentes, comandos, regras e conhecimento.

=================================================================

## O que já existe no projeto

| Item | Status |
|------|--------|
| `.cursor/knowledge/` | OK — stack-profile, patterns (Next.js, Fastify, Prisma, etc.), index.json |
| `.cursor/rules/` | OK — regras de api, auth, backend, database, security, etc. |
| `.cursor/mcp.json` | OK — template (configurar API keys) |
| `docs/context/project-brief.md` | OK — descoberta concluída |
| `docs/adr/` | OK — 0001-initial-stack.md |

=================================================================

## O que faltava para o padrão completo (adicionado)

| Item | Descrição |
|------|------------|
| `.cursor/commands/` | Definições dos comandos (/analyze-business, /model-domain, /design-architecture, /harvest-knowledge, /implement-usecases, etc.) |
| `.cursor/subagents/` ou `subagents/` | Definições dos subagentes (product, domain, architect, backend, database, security, qa, **frontend**, etc.) |
| `.cursor/config/` | sync.config.json para sync-knowledge |
| `skills/` (raiz do projeto) | Skills especializadas (domain, backend, security, testing, frontend, etc.); subagents referenciam `skills/<categoria>/<nome>.skill` |

=================================================================

## Estrutura completa esperada (.cursor)

```
.cursor/
├── commands/       # Comandos disponíveis (analyze-business, model-domain, …)
├── config/         # sync.config.json
├── knowledge/      # stack-profile, patterns, index
├── rules/          # Regras por domínio (api, auth, backend, …)
├── subagents/      # Definições dos agentes (product, backend, …); Primary Skills → skills/<cat>/<nome>.skill
├── skills/         # Skills na raiz do projeto (backend, frontend, domain, …)
├── docs/           # (opcional) Contexto do framework
└── mcp.json        # Configuração MCP (não versionado)
```

=================================================================

## Uso

- **Comandos**: Executar no Cursor, ex.: `/analyze-business`, `/model-domain`, `/design-architecture`, `/implement-usecases`.
- **Knowledge**: Fonte de verdade para o stack; usar `/harvest-knowledge` e `/review-knowledge` para atualizar.
- **Rules**: Lidas automaticamente pelo Cursor; subagentes referenciam as regras obrigatórias.

=================================================================
