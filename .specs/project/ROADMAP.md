# Roadmap

**Milestone atual:** M1 — Fundação
**Status:** In Progress

---

## M1 — Fundação (P0)

**Goal:** Usuário consegue se cadastrar, fazer login e cadastrar pacientes. Base funcional do produto.
**Target:** F01 + F02 implementados e testados end-to-end

### Features

**F01 — Autenticação e Acesso** - IN PROGRESS

- Cadastro como profissional autônomo (tenant tipo "autonomous")
- Cadastro como admin de clínica (tenant tipo "clinic")
- Confirmação de e-mail obrigatória antes de acessar
- Login com e-mail/senha + sessão via cookie httpOnly
- Recuperação de senha via e-mail
- Bloqueio após 5 tentativas falhas (30 min)
- Convite de membros da equipe com papel (admin, professional, receptionist, financial)
- Aceite de termos LGPD no cadastro
- Middleware de autenticação + isolamento de contexto por tenantId

**F02 — Gestão de Pacientes** - IN PROGRESS

- Cadastro de paciente vinculado ao tenant (CPF único por tenant)
- Vínculo profissional–paciente com tarifa (valor + tipo)
- Pesquisa de paciente por nome, CPF ou telefone

---

## M2 — Core Clínico e Financeiro (P1)

**Goal:** Profissional consegue agendar, atender, registrar evolução e acompanhar cobranças. Proposta de valor principal entregue.
**Target:** F03 + F04 + F05 implementados

### Features

**F03 — Agenda e Agendamentos** - PLANNED

- Criar agendamento (valida vínculo, impede sobreposição)
- Alterar agendamento (respeitando regras de conflito)
- Cancelar agendamento (libera slot)
- Marcar como realizado → dispara evento → cria Atendimento + Conta a Receber
- Visualização diária e semanal da agenda
- Filtro por profissional (clínicas)

**F04 — Atendimento e Prontuário** - PLANNED

- Registrar evolução clínica (texto livre + diagnóstico + prescrição)
- Evolução imutável após salva
- Visualizar prontuário completo por paciente (histórico ordenado)
- Controle de acesso: somente profissional vinculado (ou admin)
- Auditoria de acessos ao prontuário (LGPD)

**F05 — Contas a Receber e Baixa** - PLANNED

- Conta a receber gerada automaticamente ao realizar consulta
- Listar contas com filtros (período, paciente, profissional, status)
- Totalizadores: pendente, pago, total do período
- Registrar baixa (data + forma de pagamento)
- Conta paga não pode ser reaberta; valor imutável após criação

---

## M3 — Completar MVP (P2)

**Goal:** Produto completo para comercialização — recibos, dashboard e monetização funcionando.
**Target:** F06 + F07 + F08 implementados

### Features

**F06 — Emissão de Recibos** - PLANNED

- Gerar recibo PDF com número sequencial
- Dados imutáveis após emissão
- Vinculado a conta a receber paga
- Download PDF + reemissão de cópia

**F07 — Dashboard Financeiro** - PLANNED

- Resumo: entradas, pendentes, vencidos
- Gráfico de aging (0-30, 31-60, 61-90, +90 dias)
- Filtros por período e profissional
- Admin de clínica vê consolidado; profissional vê apenas os próprios dados

**F08 — Trial e Assinatura** - PLANNED

- Trial automático ao confirmar e-mail (dados fake pré-carregados, 1-2 dias)
- Banner de tempo restante de trial
- Contratação de plano com limpeza dos dados fake
- Bloqueio de escrita ao expirar trial (somente leitura por 30 dias)
- Notificação por e-mail 24h antes da expiração
- Upgrade de plano (pro rata na próxima cobrança)

---

## M4 — Notificações e Integrações (P3)

**Goal:** Reduzir faltas e integrar com ferramentas externas dos profissionais.
**Target:** F09 + integrações de calendário

### Features

**F09 — Notificações via WhatsApp** - PLANNED

- Lembrete automático 24h antes do agendamento
- Notificação ao criar/alterar/cancelar agendamento
- Configurável por tenant (ativar/desativar)
- Log de envio (sucesso/falha)

**Integração com Calendários Externos** - PLANNED

- Sincronização com Google Calendar (adapter já existe)
- Suporte a Apple Calendar e Outlook (futuro)
- Agenda interna como fonte da verdade em caso de falha

---

## Future Considerations

- PWA (Progressive Web App) para experiência offline e instalação mobile
- Teleconsulta com streaming de vídeo na plataforma (ADR 0009 documentado)
- App nativo (iOS/Android) — somente se web responsivo não atender
- Relatórios avançados e exportação (CSV, Excel)
- Integração com planos de saúde para faturamento
- Multi-idioma (pt-BR → en)
