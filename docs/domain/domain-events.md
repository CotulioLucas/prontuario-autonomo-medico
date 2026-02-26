# Eventos de domínio

**Critério**: ocorrência relevante para o negócio; imutáveis; nome no passado. Produtores e consumidores mapeados.

=================================================================

## Identidade e Acesso

| Evento | Descrição | Produtor | Consumidores potenciais |
|--------|-----------|----------|--------------------------|
| UsuárioRegistrado | Novo usuário criado no tenant (após confirmação de e-mail ou fluxo definido) | Agregado Tenant | Notificações, auditoria, onboarding |
| E-mailConfirmado | Usuário confirmou o e-mail | Fluxo de autenticação | Liberar acesso, auditoria |
| IdentidadeValidada | Validação de identidade concluída para o usuário | Fluxo de identidade | Liberar funções restritas, auditoria |
| PapelAtribuído | Papel atribuído a usuário em tenant clínica | Agregado Tenant | Permissões, auditoria |
| ConsentimentoRegistrado | Consentimento LGPD registrado (aceite do termo) | Agregado Tenant | Auditoria, liberação de operações com dados sensíveis |
| ConsentimentoRevogado | Consentimento LGPD revogado pelo responsável | Agregado Tenant | Auditoria, bloqueio de operações com dados sensíveis, notificação |

## Assinatura

| Evento | Descrição | Produtor | Consumidores potenciais |
|--------|-----------|----------|--------------------------|
| AssinaturaContratada | Tenant contratou um plano SaaS | Agregado Assinatura | Liberação de acesso, notificações, auditoria |
| TrialIniciado | Tenant iniciou período de avaliação com dados fake | Agregado Assinatura | Seed de dados de demonstração, notificações |
| TrialExpirado | Período trial expirou sem contratação | Agregado Assinatura / job | Bloqueio de acesso, notificação para contratar |
| AssinaturaSuspensa | Assinatura suspensa (falta de pagamento ou ação admin) | Agregado Assinatura | Bloqueio de acesso, notificações |
| AssinaturaCancelada | Assinatura cancelada pelo tenant ou admin | Agregado Assinatura | Bloqueio de acesso, política de retenção, notificações |

## Agendamento

| Evento | Descrição | Produtor | Consumidores potenciais |
|--------|-----------|----------|--------------------------|
| AgendamentoCriado | Novo agendamento registrado na agenda | Agregado Agenda | Calendário externo, avisos (lembrete/confirmação), integração WhatsApp |
| AgendamentoAlterado | Data/hora ou dados do agendamento alterados | Agregado Agenda | Calendário externo, avisos |
| AgendamentoCancelado | Agendamento cancelado | Agregado Agenda | Calendário externo, avisos, eventual estorno |
| AgendamentoRealizado | Agendamento marcado como realizado (presença/realização) | Agregado Agenda / orquestração | Atendimento (criação), Conta a receber (criação), métricas |

## Clínico

| Evento | Descrição | Produtor | Consumidores potenciais |
|--------|-----------|----------|--------------------------|
| AtendimentoRegistrado | Atendimento criado (vinculado ao agendamento realizado) | Agregado Atendimento | Conta a receber, dashboard, KPIs |
| EvoluçãoRegistrada | Evolução criada ou alterada para um atendimento | Agregado Atendimento | Prontuário (visão), auditoria |

## Financeiro

| Evento | Descrição | Produtor | Consumidores potenciais |
|--------|-----------|----------|--------------------------|
| ContaAReceberCriada | Nova conta a receber vinculada a atendimento | Agregado Conta a receber | Dashboard, aging, notificações |
| ContaAReceberBaixada | Pagamento/baixa registrada na conta a receber | Agregado Conta a receber | Dashboard, relatórios, KPIs |
| ReciboEmitido | Recibo emitido para o paciente | Agregado Recibo | Notificação ao paciente, auditoria, armazenamento do documento |

=================================================================

**Orquestração**: Ao marcar agendamento como realizado, a aplicação pode publicar AgendamentoRealizado e os consumidores criam Atendimento e Conta a receber (saga ou handlers), mantendo agregados separados.
