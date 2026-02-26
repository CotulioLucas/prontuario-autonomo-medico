# Glossário (linguagem ubíqua)

**Fonte**: docs/content/*, docs/context/project-brief.md  
**Uso**: Toda documentação e código devem usar estes termos de forma canônica.

=================================================================

## Identidade e acesso

| Termo | Definição |
|-------|-----------|
| **Tenant** | Organização que usa a plataforma: um profissional autônomo (uma pessoa) ou uma clínica (vários usuários). Isolamento de dados é por tenant. |
| **Usuário** | Pessoa que acessa o sistema; pertence a um único tenant. Autônomo: um usuário por tenant; clínica: vários usuários com papéis. |
| **Papel** | Função do usuário no tenant: médico, psicólogo, secretária, admin. Apenas em tenants do tipo clínica. Paciente não é usuário do sistema e não possui papel. |
| **Autônomo** | Tenant com um único usuário; sem papéis de clínica. |
| **Clínica** | Tenant com múltiplos usuários e papéis (médico, psicólogo, secretária, admin). |
| **Validação de identidade** | Processo que confirma que o usuário é quem diz ser (ex.: documento, e-mail verificado). |
| **Confirmação de e-mail** | Fluxo em que o usuário valida o endereço de e-mail antes do uso pleno. |
| **ConsentimentoLGPD** | Registro formal de consentimento para tratamento de dados sensíveis de saúde, conforme LGPD. Contém quem consentiu, quando, finalidade, versão do termo e status (ativo/revogado). |

## Assinatura

| Termo | Definição |
|-------|-----------|
| **Assinatura** | Contrato SaaS de um tenant com a plataforma: plano contratado, status (trial, ativa, suspensa, cancelada), período de vigência. |
| **Plano** | Definição de capacidades e preço do serviço SaaS: nome, limites (usuários, pacientes), preço mensal. |
| **Trial** | Período de avaliação gratuita (1-2 dias) em que o tenant usa a plataforma com dados de demonstração (fake) para conhecer as funcionalidades antes de contratar um plano. |

## Agendamento

| Termo | Definição |
|-------|-----------|
| **Agenda** | Conjunto de slots e regras de disponibilidade de um profissional (ou recurso) em um tenant. |
| **Agendamento** | Compromisso reservado: data/hora, profissional, paciente, status (agendado, realizado, cancelado, etc.). |
| **Slot** | Intervalo de tempo disponível ou reservado na agenda. |
| **Calendário externo** | Integração com Google Calendar, Apple, Outlook etc. para leitura/escrita de eventos. |
| **Streaming** | Atendimento por vídeo dentro da plataforma, acessível a partir do agendamento. |

## Clínico

| Termo | Definição |
|-------|-----------|
| **Paciente** | Pessoa cadastrada no tenant que recebe atendimentos; vinculada a um ou mais profissionais. Não é usuário do sistema (não faz login). |
| **TarifaDeAtendimento** | Valor cobrado por atendimento, configurado no vínculo profissional–paciente. Pode ser por sessão ou por hora. Usado para derivar automaticamente o valor da Conta a receber. |
| **Vínculo profissional–paciente** | Relação entre um profissional e um paciente no tenant, que permite agendamentos e prontuário. |
| **Atendimento** | Ocorrência realizada de um agendamento: data/hora efetiva, profissional, paciente, evolução. |
| **Prontuário** | Conjunto de registros clínicos (evoluções) de um paciente no tenant. |
| **Evolução** | Registro clínico de um atendimento: texto/notas da sessão, vinculado ao atendimento. |

## Financeiro

| Termo | Definição |
|-------|-----------|
| **Conta a receber** | Valor devido vinculado a um atendimento (ou serviço): data do atendimento, paciente, profissional, status do atendimento e do pagamento. |
| **Baixa** | Registro de pagamento ou quitação de uma conta a receber. |
| **Aging** | Idade da dívida (ex.: 0–30, 31–60, 61–90 dias) para contas a receber. |
| **Recibo** | Documento emitido para o paciente para reembolso (ex.: plano de saúde), vinculado a atendimento(s) ou conta(s) a receber. |
| **Dashboard financeiro** | Visão de entradas, saídas, contas a receber e aging. |

## Notificações e integrações

| Termo | Definição |
|-------|-----------|
| **Aviso (WhatsApp)** | Mensagem enviada ao paciente ou profissional (lembrete, confirmação de agendamento etc.). |
| **Lembrete** | Aviso programado antes do horário do agendamento. |
| **Confirmação de agendamento** | Aviso que informa que o agendamento foi criado ou alterado. |

=================================================================

**Convenções**: Verbos no infinitivo em regras (ex.: "só pode agendar"); eventos no passado (ex.: AgendamentoRealizado). Evitar sinônimos técnicos (ex.: preferir "agendamento" a "booking" em PT-BR).
