# Arquitetura do sistema

Saídas do comando **design-architecture**, alinhadas à skill **architecture/system-architecture**.

## Artefatos nesta pasta

| Documento | Conteúdo |
|-----------|----------|
| [overview.md](overview.md) | Visão geral, estilo, fronteiras, segurança baseline, escalabilidade |
| [style.md](style.md) | Estilo (modular monolith, Clean/Hexagonal), trade-offs |
| [components.md](components.md) | Mapeamento bounded contexts para módulos, camadas, dependências |
| [deployment-view.md](deployment-view.md) | MVP (nó único), evolução, persistência, integrações |
| [integration-patterns.md](integration-patterns.md) | Eventos entre contextos, integrações externas, REST |
| [quality-attributes.md](quality-attributes.md) | Segurança, LGPD, disponibilidade, desempenho |
| [failure-modes.md](failure-modes.md) | Falhas esperadas, mitigação, resiliência |

## ADRs (decisões)

As decisões arquiteturais estão em **docs/adr/**:

| ADR | Tema |
|-----|------|
| 0001 | Stack e bootstrap inicial |
| 0002 | Estilo arquitetural e multi-tenant |
| 0003 | Autenticação e autorização |
| 0004 | Comunicação entre contextos (eventos) |
| 0005 | Integrações externas (calendário, WhatsApp) |
| 0006 | Segurança, auditoria e LGPD |
| 0007 | Estrutura de pastas do código-fonte |
| 0008 | Persistência e banco de dados |
| 0009 | Streaming de vídeo na plataforma |
| 0010 | Design da API REST |
| 0011 | Validação de identidade (build vs buy) |
| 0012 | Emissão e armazenamento de recibos |
| 0013 | Estratégia de testes |

## Insumos

- docs/domain/* (bounded-contexts, aggregates, domain-events, interaction-maps)
- docs/content/* (constraints, risks)
- ADR 0001 (stack)

## Checklist de validação (skill)

- [ ] Fronteiras explícitas
- [ ] Dependências direcionais (para dentro)
- [ ] ADRs completos
- [ ] Segurança integrada
- [ ] Escalabilidade considerada
- [ ] Modos de falha documentados

Nenhuma implementação deve prosseguir antes da aprovação dos artefatos e ADRs.
