# ADR 0002 — Estilo arquitetural e estratégia multi-tenant

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: Definir arquitetura após model-domain; necessidade de isolamento por tenant e LGPD.

## Decisão

- **Estilo**: Modular Monolith com camadas Clean/Hexagonal. Domínio no centro; aplicação orquestra; adaptadores (HTTP, BD, integrações) nas bordas. Bounded contexts como módulos (pastas).
- **Multi-tenant**: Banco de dados único com **tenant_id** em todas as tabelas que contenham dados de negócio. Toda query e toda escrita filtram por tenant_id resolvido a partir da sessão. Nenhum dado é compartilhado entre tenants; sem tabelas globais de dados sensíveis por tenant.
- **Deploy**: Um único deployável (monolito) no MVP.

## Alternativas consideradas

- **Microserviços**: rejeitado para MVP (equipe pequena, domínio em consolidação, custo operacional).
- **Database per tenant**: rejeitado no MVP (complexidade operacional; evolução futura possível se necessário).
- **Schema por tenant no mesmo BD**: possível evolução; no MVP row-level com tenant_id é suficiente.

## Consequências

- Desenvolvedores devem sempre passar e validar tenant_id em persistência e queries.
- Testes devem cobrir cenários de isolamento (tentativa de acesso cross-tenant rejeitada).
- Documentação em docs/architecture/ (overview, style, components) e quality-attributes (segurança).
