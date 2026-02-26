# Skill: Domain Analysis

## Objective
Transformar informações de negócio em domínio estruturado, sem decisões técnicas prematuras.

## Responsibilities
- Identificar entidades de domínio
- Definir regras de negócio invariantes
- Criar glossário compartilhado
- Identificar bounded contexts

## Constraints
- Não definir estrutura de código
- Não escolher frameworks
- Não decidir arquitetura técnica

## Output Artifacts
- docs/domain/glossary.md
- docs/domain/bounded-contexts.md
- docs/domain/domain-rules.md

## Heuristics
- Se algo muda por regra de negócio → é domínio
- Se algo muda por tecnologia → não é domínio
- Regras de negócio devem ser explícitas e testáveis

## Validation Checklist
- [ ] Todas as entidades têm significado de negócio
- [ ] Regras não dependem de tecnologia
- [ ] Linguagem é compreensível para stakeholders
