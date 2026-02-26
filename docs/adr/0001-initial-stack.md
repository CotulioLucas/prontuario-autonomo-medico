# ADR 0001 — Stack e bootstrap inicial

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: Projeto prontuario-autonomo-medico criado a partir do template oficial.

## Decisão

- **Stack**: Alinhar ao stack do workspace (TypeScript, Node.js, Next.js, React, Fastify, Prisma, Zod, etc.) conforme `.cursor/knowledge/stack-profile.md` quando existir no repositório.
- **Estrutura**: Manter `src/`, `docs/`, `.cursor/`, `tests/` e `infra/` conforme template.
- **MCP**: Configuração em `.cursor/mcp.json` (template local; configurar API keys via ambiente ou Cursor).
- **Governança**: Usar comandos do framework (harvest-knowledge, review-knowledge, sync-knowledge, discover-project) quando aplicável.

## Consequências

- Projeto genérico até execução de `/discover-project` para alinhar objetivos, usuários e escopo.
- Próximo passo recomendado: **/discover-project** para entrevista e sugestão de comandos (analyze-business, model-domain, design-architecture).
