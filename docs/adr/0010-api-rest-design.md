# ADR 0010 — Design da API REST

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: Backend exposto via Next.js API Routes ou Fastify; é necessário padronizar versionamento, erros, paginação e autenticação para evitar retrabalho e inconsistência.

## Decisão

- **Versionamento**: Prefixo `/api/v1/` desde o primeiro deploy. Recursos sob esse prefixo (ex.: `/api/v1/appointments`, `/api/v1/patients`). Alterações incompatíveis (breaking) geram nova versão (v2); dentro da mesma versão, mudanças devem ser compatíveis (campos opcionais, não remover campos).
- **Autenticação na API**: Sessão via cookie (NextAuth) para uso pelo frontend na mesma origem. Para clientes externos (futuro): Bearer JWT em header `Authorization`. Rejeitar requisições sem sessão válida ou JWT em rotas protegidas; retorno 401.
- **Contexto do tenant**: tenantId e userId obtidos da sessão (ou do JWT); nunca aceitos no body/query para rotas que alteram dados; uso apenas para leitura em filtros explícitos (ex.: admin) quando autorizado.
- **Formato de erro**: Resposta JSON com estrutura: `{ "error": { "code": "string", "message": "string", "details": optional } }`. Códigos estáveis para erros de negócio (ex.: `APPOINTMENT_CONFLICT`, `PATIENT_NOT_FOUND`). HTTP status: 400 (validação/negócio), 401 (não autenticado), 403 (não autorizado), 404 (recurso não encontrado), 409 (conflito), 422 (entidade não processável), 500 (erro interno).
- **Paginação**: Cursor-based quando a lista for grande (ex.: `?cursor=xxx&limit=20`). Resposta: `{ "data": [...], "nextCursor": "optional", "hasMore": boolean }`. Para listas pequenas e previsíveis, offset/limit aceitável (ex.: `?page=1&pageSize=20`) com documentação clara. Preferir cursor para feeds e listas que crescem no tempo.
- **Content-Type**: Request e response JSON com `Content-Type: application/json`. Encoding UTF-8.

## Alternativas consideradas

- **Sem versionamento no MVP**: rejeitado; incluir v1 desde o início evita migração posterior.
- **Só offset pagination**: aceitável para listas pequenas; cursor recomendado para listas longas (ex.: atendimentos, contas a receber).
- **GraphQL**: rejeitado para MVP; REST alinha ao stack e à documentação existente (OpenAPI futuro).

## Consequências

- Middleware ou wrapper de API deve padronizar tratamento de exceções e formato de erro.
- Documentação da API (OpenAPI/Swagger) recomendada; pode ser gerada a partir de rotas ou mantida manualmente.
- Frontend e quaisquer consumidores devem usar o mesmo contrato de erro e paginação.
