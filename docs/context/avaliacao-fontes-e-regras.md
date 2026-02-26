# Avaliação: fontes de informação, uso ao codar e ausência de duplicação

**Objetivo**: Garantir uma única fonte de verdade por tipo de informação, alinhada aos commands e rules, para não duplicar conteúdo nos lugares errados.

=================================================================

## 1. Onde cada informação vive (fonte única)

| Tipo de informação | Onde fica (fonte única) | Quem lê | Quem escreve |
|--------------------|-------------------------|--------|--------------|
| **Stack permitido** | `.cursor/knowledge/stack-profile.md` | Harvest, Review, Sync, todos os agents que validam tech | Humano / governança |
| **Padrões de código (Fastify, Next.js, Prisma, etc.)** | `.cursor/knowledge/*.md` (ex.: fastify-patterns, nextjs-app-router-patterns) | Subagents ao implementar; Sync gera resumos em docs | Harvest → Review → Knowledge |
| **Regras obrigatórias (API, auth, backend)** | `.cursor/rules/*.md` | Subagents (backend, security) | Extraídas/geradas no Sync a partir de knowledge |
| **Contexto do projeto (objetivos, usuários, MVP)** | `docs/context/project-brief.md` | analyze-business, model-domain, design-architecture | discover-project |
| **Análise de negócio formalizada (problema, KPIs, stakeholders)** | `docs/content/*` (business-problem, strategic-objectives, assumptions, requirements) | model-domain (domain-modeling.skill), design-architecture | analyze-business |
| **Modelo de domínio** | `docs/domain/*` | design-architecture, implement-usecases, persistence/backend skills | model-domain |
| **Arquitetura e decisões** | `docs/architecture/*`, `docs/decisions/adr/*` (ou equivalente) | implement-usecases, backend, security, database agents | design-architecture |
| **Padrões de API/erro (resumo)** | `docs/api/*` | backend.agent | Sync (a partir de knowledge) ou documentação manual |
| **Segurança e autenticação (resumo)** | `docs/security/*` | security.agent | Sync ou documentação manual |
| **Código de aplicação** | `src/**/application/*` | — | implement-usecases (backend.agent) |

**Princípio**: Knowledge = padrões e stack (como fazer). Docs = contexto do projeto, domínio e arquitetura (o quê e por quê). Código = implementação que segue knowledge + docs. Nada de copiar trechos de knowledge para dentro de docs como se fosse documentação do projeto; Sync gera **resumos** em docs quando configurado.

=================================================================

## 2. Fluxo ao começar a codar (implement-usecases)

1. **Backend.agent** é ativado; lê **Mandatory Rules**: `.cursor/rules/backend.rules.md`, `.cursor/rules/api.rules.md`.
2. **Knowledge Base** do backend.agent: `.cursor/knowledge/api-patterns.md`, `docs/api/patterns.md`, `docs/api/error-handling.md`.
3. **Domain/arquitetura**: usa `docs/domain/*` e `docs/architecture/*` (e ADRs) para não vazar lógica para controllers e respeitar portas/adapters.
4. **Stack**: qualquer dúvida de lib/ferramenta deve ser resolvida contra `.cursor/knowledge/stack-profile.md` e os `*-patterns.md` correspondentes.

Assim, ao codar: **regras** vêm de `.cursor/rules/`, **padrões de implementação** de `.cursor/knowledge/`, **contexto de negócio e domínio** de `docs/content/` e `docs/domain/`, **decisões e limites** de `docs/architecture/` e `docs/decisions/` (ADRs). Não se duplica definição de stack nem padrões dentro de docs do projeto; docs do projeto referenciam ou resumem quando necessário.

=================================================================

## 3. Inconsistências e riscos de duplicação (ajustes recomendados)

### 3.1 Referências a arquivos de knowledge que não existem

- **api.rules.md** e **backend.agent.md** referenciam `.cursor/knowledge/api-patterns.md`. No projeto existe **fastify-patterns.md**, não `api-patterns.md`.
- **auth.rules.md** e **security.agent.md** referenciam `.cursor/knowledge/auth-patterns.md`. No projeto existe **nextauth-patterns.md**, não `auth-patterns.md`.

**Recomendação**:  
- Tratar **fastify-patterns.md** como fonte de verdade para API (backend/controllers): atualizar `api.rules.md` e `backend.agent.md` para apontar para `fastify-patterns.md` (e, se existir, `docs/api/patterns.md` como resumo).  
- Tratar **nextauth-patterns.md** como fonte para auth: atualizar `auth.rules.md` e `security.agent.md` para apontar para `nextauth-patterns.md` (e, se existir, `docs/security/authentication-patterns.md` como resumo).  
Assim evita-se “arquivo fantasma” e duplicação de regras em outro lugar.

### 3.2 Estrutura de docs vs. commands/rules

- **docs-structure-validation.rules.md** exige em `docs/` exatamente: content, domain, database, api, architecture, security, devops, decisions, onboarding, runbooks. **Não** menciona `context`.
- **discover-project** grava em `docs/context/project-brief.md`.
- **design-architecture** e **architect.agent** indicam saída em `docs/architecture/*` e `docs/04-decisions/adr/*`.
- O projeto hoje tem `docs/context/` e `docs/adr/` (não `docs/decisions/` nem `docs/04-decisions/adr/`).

**Recomendação**:  
- **Manter** `docs/context/` como exceção explícita para contexto de descoberta (project-brief, cursor-agent-setup, esta avaliação), e documentar isso na rule ou em um README em `docs/` (ex.: “context é usado por discover-project e configuração de agentes; não é parte da taxonomy de conteúdo/domain/architecture”).  
- **Unificar ADRs**: adotar **um** caminho — por exemplo `docs/decisions/adr/` (ou `docs/04-decisions/adr/` se quiser prefixo numérico) — e ajustar design-architecture + architect.agent para esse path. Migrar `docs/adr/*` para o path escolhido e deixar de criar novos ADRs em `docs/adr/`. Assim ADR tem uma única localização e não se duplica “decisões” em dois lugares.

### 3.3 Ordem dos comandos e inputs obrigatórios

- **domain-modeling.skill** exige: `docs/content/business-problem.md`, `docs/content/strategic-objectives.md`, `docs/content/assumptions.md`, `docs/03-requirements/*`.
- Hoje só existe **docs/context/project-brief.md** (saída do discover-project). analyze-business é que deve produzir `docs/content/*`.

**Recomendação**:  
- Não usar project-brief como substituto direto de business-problem/strategic-objectives; rodar **analyze-business** após discover-project para gerar `docs/content/*` a partir do brief (e possivelmente do mesmo conteúdo já preenchido no brief). Assim: **uma** fonte rica de negócio = project-brief; **formalização** = docs/content/*; modelo de domínio lê docs/content/*, não duplica o brief em vários arquivos.

### 3.4 Sync e deduplicação

- **knowledge-deduplication.rules.md** e **knowledge-compression**: conteúdo em docs/rules deve ser **distilado** a partir de knowledge, não cópia literal.
- **document-root.rules.md**: se `docs/` existe, merge na estrutura existente; não recriar nem sobrescrever sem aprovação.

**Recomendação**:  
- Ao rodar **sync-knowledge**, gerar apenas resumos/regras extraídas em `docs/*` e `.cursor/rules/*`, sem colar blocos inteiros de knowledge em docs. Isso mantém knowledge como fonte única de “como fazer” e evita duplicação.

=================================================================

## 4. Checklist rápido (evitar duplicação)

- [ ] **Stack e tecnologias**: só em `stack-profile.md`; padrões em `knowledge/*-patterns.md`. Não repetir lista de stack em docs do projeto.
- [ ] **Regras de implementação**: só em `.cursor/rules/*`; origem indicada no cabeçalho (ex.: “Origem: .cursor/knowledge/xyz.md”). Não duplicar as mesmas regras em vários .md.
- [ ] **Contexto do produto**: discover → `docs/context/project-brief.md`; analyze-business → `docs/content/*`. Brief não substitui content; content formaliza o brief.
- [ ] **Domínio**: só em `docs/domain/*`; produzido por model-domain; lido por design e implement.
- [ ] **Decisões arquiteturais**: só em um path (ex.: `docs/decisions/adr/` ou `docs/04-decisions/adr/`); design-architecture e architect.agent apontam para esse path.
- [ ] **Agents**: referenciar knowledge e docs por path canônico; não criar “cópias” de trechos de knowledge dentro de arquivos de agent.

=================================================================

## 5. Resumo

- **De onde vêm as informações**: stack e padrões em `.cursor/knowledge/` (e stack-profile); contexto de negócio em `docs/context/` e depois `docs/content/`; domínio em `docs/domain/`; decisões em `docs/decisions/` (ou 04-decisions). Regras em `.cursor/rules/` com origem apontando para knowledge.
- **Como será usado ao codar**: backend/security/database agents leem rules + knowledge + docs/domain e docs/architecture; implementação fica em `src/` sem repetir definições que já estão em knowledge ou docs.
- **Para não ter informação duplicada**: (1) corrigir referências de api-patterns/auth-patterns para fastify-patterns/nextauth-patterns; (2) definir um único path para ADRs e alinhar commands/agents; (3) manter `docs/context/` como exceção documentada; (4) fazer analyze-business gerar docs/content/* a partir do brief; (5) usar Sync apenas para gerar resumos/regras, não cópia literal de knowledge.

=================================================================
