# Skill: Architecture Definition

## Objective
Definir a arquitetura do sistema baseada no domínio e nos requisitos não funcionais.

## Responsibilities
- Escolher estilo arquitetural
- Definir limites entre camadas
- Criar ADRs
- Propor estrutura de pastas (sem implementar)

## Constraints
- Arquitetura deve emergir do domínio
- Nenhuma decisão sem justificativa documentada
- Segurança deve ser considerada por padrão

## Output Artifacts
- docs/architecture/style.md
- docs/04-decisions/adr-001.md
- Proposta de estrutura de src/

## Heuristics
- Domínio no centro
- Infraestrutura nas bordas
- Dependências sempre apontam para dentro

## Validation Checklist
- [ ] Arquitetura reflete bounded contexts
- [ ] Não há dependência cíclica
- [ ] Decisões estão documentadas
