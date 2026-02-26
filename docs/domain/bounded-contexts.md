# Bounded Contexts

**Critério**: fronteiras onde a linguagem e as regras são consistentes; separar quando a linguagem diverge, as regras conflitam ou a taxa de mudança difere.

=================================================================

## 1. Identidade e Acesso (Identity & Access)

| Aspecto | Descrição |
|---------|-----------|
| **Responsabilidade** | Tenant, usuário, papéis, autenticação (login, cadastro, confirmação de e-mail, validação de identidade). Isolamento por tenant. |
| **Linguagem** | Tenant, Usuário, Papel, Autônomo, Clínica, confirmação de e-mail, validação de identidade. |
| **Saídas** | Usuário autenticado, tenantId e papéis para autorização; eventos UsuárioRegistrado, E-mailConfirmado, IdentidadeValidada, PapelAtribuído. |
| **Dependências** | Nenhum outro contexto de negócio; integrações externas (e-mail, provedor de identidade) na borda. |

## 2. Assinatura (Subscription)

| Aspecto | Descrição |
|---------|-----------|
| **Responsabilidade** | Gestão de planos SaaS, assinaturas, trial com dados fake, controle de acesso por status de assinatura. |
| **Linguagem** | Assinatura, Plano, Trial, PeríodoTrial, contratar, suspender, cancelar, dados de demonstração. |
| **Saídas** | Status de assinatura do tenant (ativo, trial, suspenso, cancelado); eventos AssinaturaContratada, TrialIniciado, TrialExpirado, AssinaturaSuspensa, AssinaturaCancelada. |
| **Dependências** | Identidade e Acesso (tenant). Não depende de outros contextos de negócio. |

## 3. Agendamento (Scheduling)

| Aspecto | Descrição |
|---------|-----------|
| **Responsabilidade** | Agenda, slots, agendamentos; evitar sobreposição; integração com calendários externos; streaming (link/sala). |
| **Linguagem** | Agenda, Agendamento, Slot, status do agendamento, calendário externo, streaming. |
| **Saídas** | Agendamentos consistentes; eventos AgendamentoCriado, AgendamentoAlterado, AgendamentoCancelado, AgendamentoRealizado. |
| **Dependências** | Identidade e Acesso (quem é o profissional/paciente; tenant). Clínico (paciente e vínculo para permitir agendar). |

## 4. Clínico (Clinical)

| Aspecto | Descrição |
|---------|-----------|
| **Responsabilidade** | Paciente, vínculo profissional–paciente, atendimento, prontuário (evoluções). Dados sensíveis; LGPD e auditoria. |
| **Linguagem** | Paciente, Vínculo profissional–paciente, Atendimento, Evolução, Prontuário. |
| **Saídas** | Cadastro de pacientes, vínculos, atendimentos e evoluções; eventos AtendimentoRegistrado, EvoluçãoRegistrada. |
| **Dependências** | Identidade e Acesso (tenant, usuário, papéis). Agendamento (agendamento realizado para criar atendimento). |

## 5. Financeiro (Billing)

| Aspecto | Descrição |
|---------|-----------|
| **Responsabilidade** | Contas a receber, baixa, aging, dashboard financeiro, emissão de recibos. |
| **Linguagem** | Conta a receber, Baixa, Aging, Recibo, valor monetário, status de pagamento. |
| **Saídas** | Contas a receber e baixas; recibos emitidos; eventos ContaAReceberCriada, ContaAReceberBaixada, ReciboEmitido. |
| **Dependências** | Clínico (atendimento para vincular conta a receber). Identidade e Acesso (tenant). |

## 6. Notificações (Notifications)

| Aspecto | Descrição |
|---------|-----------|
| **Responsabilidade** | Envio de avisos (lembrete, confirmação de agendamento) via WhatsApp ou outros canais. |
| **Linguagem** | Aviso, Lembrete, Confirmação de agendamento, canal (WhatsApp). |
| **Saídas** | Mensagens enviadas; logs de envio. |
| **Dependências** | Consumidor de eventos de Agendamento (AgendamentoCriado, AgendamentoAlterado, AgendamentoCancelado). Não define regras de negócio de outros contextos. |

=================================================================

**Mapa de relacionamento**: Identidade e Acesso é o contexto central (tenant sempre presente). Assinatura depende de Identidade e Acesso (tenant) e controla acesso do tenant ao sistema. Agendamento e Clínico dependem de Identidade e Acesso. Financeiro depende de Clínico (atendimento). Notificações é subsistema reativo a eventos de Agendamento, Assinatura e eventualmente outros.
