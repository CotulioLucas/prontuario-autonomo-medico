# ADR 0004 — Comunicação entre bounded contexts

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: Marcar agendamento como realizado deve criar Atendimento (Clínico) e Conta a receber (Financeiro). Notificações deve reagir a eventos de Agendamento.

## Decisão

- **Entre contextos (mesmo processo)**: usar **eventos de domínio** (objetos imutáveis, nome no passado). A aplicação publica o evento; handlers nos outros contextos executam (no MVP em sequência, síncrono). Exemplo: evento de agendamento realizado dispara handler Clínico (cria Atendimento) e handler Financeiro (cria Conta a receber). Sem HTTP entre módulos.
- **Notificações**: consumo **assíncrono** (worker ou job) dos eventos de agendamento (criado, alterado, cancelado) para envio WhatsApp/e-mail. Resposta ao usuário não espera o envio.
- **Transações**: cada agregado em sua própria transação. Se um handler falhar, retry; se persistir, dead-letter ou reconciliação manual.

## Alternativas consideradas

- Chamada direta entre módulos: rejeitada (acoplamento).
- Message broker externo no MVP: opcional; fila in-memory ou job runner suficiente.

## Consequências

- Contratos de eventos estáveis; mudança exige versionamento. Documentação em docs/architecture/integration-patterns.md e docs/domain/domain-events.md.
