# Entidades

**Critério**: identidade persistente, ciclo de vida, distinguível no tempo.

=================================================================

## Contexto: Identidade e Acesso

| Entidade | Descrição | Identificador |
|----------|-----------|----------------|
| **Tenant** | Organização (autônomo ou clínica). Determina isolamento de dados e tipo (um usuário vs múltiplos com papéis). | id |
| **Usuário** | Pessoa que acessa o sistema; pertence a um tenant. | id |
| **Atribuição de papel** | Associação usuário–papel no tenant (apenas em clínicas). Um usuário pode ter um ou mais papéis. | (tenantId, userId, role) ou id |
| **ConsentimentoLGPD** | Registro de consentimento: quem consentiu (userId/tenantId), quando, finalidade (ex.: tratamento de dados de saúde), versão do termo, status (ativo/revogado), data de revogação. | id |

## Contexto: Agendamento

| Entidade | Descrição | Identificador |
|----------|-----------|----------------|
| **Agenda** | Disponibilidade e regras de um profissional em um tenant (ex.: horários de trabalho, bloqueios). | id (ou tenantId + professionalId) |
| **Agendamento** | Compromisso reservado: slot, profissional, paciente, status. Pertence a uma agenda. | id |

## Contexto: Clínico

| Entidade | Descrição | Identificador |
|----------|-----------|----------------|
| **Paciente** | Pessoa cadastrada no tenant que recebe atendimentos. | id |
| **Vínculo profissional–paciente** | Relação entre profissional (usuário) e paciente no tenant; permite agendar e registrar evolução. Contém a TarifaDeAtendimento configurada para este par profissional–paciente. | id (ou tenantId + professionalId + patientId) |
| **Atendimento** | Ocorrência realizada de um agendamento: referência ao agendamento, data/hora efetiva, profissional, paciente. | id |
| **Evolução** | Registro clínico de um atendimento (notas da sessão). Uma evolução por atendimento. | id (ou atendimentoId) |

## Contexto: Assinatura

| Entidade | Descrição | Identificador |
|----------|-----------|----------------|
| **Assinatura** | Assinatura SaaS de um tenant: plano contratado, status (trial, ativa, suspensa, cancelada), data de início, data de fim, período trial. | id |

## Contexto: Financeiro

| Entidade | Descrição | Identificador |
|----------|-----------|----------------|
| **Conta a receber** | Valor devido vinculado a um atendimento; status de pagamento e baixa. | id |
| **Recibo** | Documento emitido para o paciente (reembolso); pode referenciar um ou mais atendimentos/contas a receber. | id |

=================================================================

**Nota**: Prontuário é tratado como visão/consulta sobre evoluções de um paciente (não entidade com id próprio). Agenda e Agendamento podem ser modelados com Agenda como raiz e Agendamentos como entidades filhas no mesmo agregado para garantir consistência de slots.
