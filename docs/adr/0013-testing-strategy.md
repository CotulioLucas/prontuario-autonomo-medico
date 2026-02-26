# ADR 0013 — Estratégia de testes

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: ADR 0002 e 0006 dependem de isolamento por tenant e comportamento correto do domínio; é necessário definir níveis de teste, foco em tenant e uso de mocks para integrações.

## Decisão

- **Níveis de teste**:
  - **Unitários (domínio)**: Regras de negócio, invariantes e value objects em cada módulo (identity, scheduling, clinical, billing). Sem IO; sem Prisma. Objetivo: garantir que agregados e regras se comportam corretamente para qualquer entrada. Cobertura prioritária em regras críticas (ex.: conflito de agendamento, imutabilidade de valor em conta a receber).
  - **Integração (adapters + BD)**: Repositórios com Prisma contra banco real (PostgreSQL em CI) ou SQLite para velocidade; fluxos que envolvem persistência e resolução de tenantId. Objetivo: garantir que queries incluem tenantId e que transações respeitam agregados.
  - **E2E (fluxos críticos)**: Poucos cenários de ponta a ponta (ex.: login → criar agendamento → marcar realizado → ver conta a receber). API ou UI; ambiente próximo do real. Objetivo: validar integração entre contextos e auth/tenant de ponta a ponta.
- **Isolamento por tenant**: Testes obrigatórios que garantam: (1) operação com tenant A não retorna/altera dados do tenant B; (2) tentativa de acessar recurso de outro tenant (ex.: ID de agendamento de outro tenant) retorna 404 ou 403. Incluir em testes de integração e, se possível, em E2E com dois tenants.
- **Integrações externas (calendário, WhatsApp, validação de identidade, vídeo)**: Sempre **mockadas** em testes automatizados. Não depender de APIs externas em CI. Adapters devem implementar interface (porta); testes usam implementação fake que retorna respostas controladas. Testes de integração contra API real apenas em ambiente dedicado ou manual se necessário.
- **Ferramentas**: Alinhar ao stack do projeto (ex.: Vitest ou Jest para unitários; mesmo runner para integração; Playwright ou Cypress para E2E se houver UI). Configuração de BD de teste (schema igual ao prod, dados isolados por suite ou transação rollback).
- **Fitness (opcional)**: Automatizar checagens de dependência (ex.: domínio não importa adapters) e cobertura mínima em módulos de domínio; pode ser via script ou ferramenta de arquitetura.

## Alternativas consideradas

- **Só testes manuais**: rejeitado; isolamento e regras de domínio exigem testes automatizados.
- **Integração real com calendário/WhatsApp em CI**: rejeitado; instável e dependente de credenciais e rede.
- **SQLite sempre em testes**: aceitável para velocidade; preferência por PostgreSQL em CI para alinhar ao prod (ADR 0008).

## Consequências

- Pipelines de CI devem executar unitários e testes de integração; E2E pode ser em etapa separada ou noturno.
- Novos repositórios e casos de uso devem ter testes de integração que incluam cenário multi-tenant quando houver dados por tenant.
- Documentação de como rodar testes locais e requisitos de ambiente (Node, PostgreSQL) no README ou em docs do projeto.
