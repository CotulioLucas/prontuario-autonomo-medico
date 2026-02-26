# User Stories — MVP (por Feature e Prioridade)

**Fonte**: docs/domain/*, docs/context/project-brief.md, docs/content/stakeholders.md
**Status**: Priorizado
**Ultima atualizacao**: 2026-02-10

**Subagents**: Cada US indica **Agente(s) recomendado(s)** — arquivo em `subagents/<nome>.agent.md`. Product = dono da historia; domain = validar regras/entidades; security = auth/LGPD/tenant.

=================================================================

## Personas

| Persona | Descricao |
|---------|-----------|
| **Profissional autonomo** | Psicologo, fisioterapeuta ou massoterapeuta que atende sozinho. Tenant com um unico usuario. |
| **Admin de clinica** | Gestor da clinica. Cria o tenant, convida usuarios, define papeis e configuracoes. |
| **Secretaria** | Responsavel por agendamentos, cadastro de pacientes, controle financeiro diario. |
| **Profissional de clinica** | Profissional de saude vinculado a uma clinica. Atende pacientes, registra evolucoes. |

## Niveis de prioridade

| Nivel | Significado | Criterio |
|-------|-------------|----------|
| **P0** | Fundacao | Sem isso o produto nao funciona. Implementar primeiro. |
| **P1** | Core MVP | Proposta de valor principal. Implementar logo apos P0. |
| **P2** | Complementar | Completa a experiencia do MVP. Pode ser entregue em iteracao seguinte. |
| **P3** | Desejavel | Agrega valor mas pode lancar sem. Integracao com terceiros. |

=================================================================

## Inventario (US-01 a US-24) — Agentes recomendados

| US | Titulo resumido | Feature | Prioridade | Agente(s) recomendado(s) |
|----|-----------------|---------|------------|---------------------------|
| US-01 | Cadastro autonomo | F01 | P0 | product; security |
| US-02 | Cadastro clinica | F01 | P0 | product; security |
| US-03 | Convite usuario | F01 | P0 | product; security |
| US-04 | Login e-mail/senha | F01 | P0 | product; security |
| US-05 | Cadastrar paciente | F02 | P0 | product; domain |
| US-06 | Vincular paciente e tarifa | F02 | P0 | product; domain |
| US-07 | Pesquisar paciente | F02 | P0 | product; domain |
| US-08 | Criar agendamento | F03 | P1 | product; domain |
| US-09 | Alterar agendamento | F03 | P1 | product; domain |
| US-10 | Cancelar agendamento | F03 | P1 | product; domain |
| US-11 | Marcar como realizado | F03 | P1 | product; domain |
| US-12 | Visualizar agenda | F03 | P1 | product |
| US-13 | Registrar evolucao | F04 | P1 | product; domain |
| US-14 | Visualizar prontuario | F04 | P1 | product; domain |
| US-15 | Visualizar contas a receber | F05 | P1 | product; domain |
| US-16 | Registrar baixa | F05 | P1 | product; domain |
| US-17 | Emitir recibo | F06 | P2 | product; domain |
| US-18 | Dashboard financeiro | F07 | P2 | product |
| US-19 | Trial com dados fake | F08 | P2 | product; domain |
| US-20 | Contratar plano | F08 | P2 | product; domain |
| US-21 | Bloqueio por expiracao trial | F08 | P2 | product; domain |
| US-22 | Upgrade de plano | F08 | P2 | product; domain |
| US-23 | Lembrete WhatsApp | F09 | P3 | product |
| US-24 | Notificar criacao/alteracao agendamento | F09 | P3 | product |

=================================================================

## P0 — Fundacao

---

### Feature F01: Autenticacao e Acesso

**Objetivo**: Permitir que usuarios se cadastrem, facam login e acessem a plataforma com seguranca.
**Bounded contexts**: Identidade e Acesso
**Dependencias**: Nenhuma (base de tudo)

#### US-01: Cadastro como profissional autonomo
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/security.agent.md`

**Como** profissional autonomo, **quero** me cadastrar informando nome, e-mail, telefone, CPF e especialidade, **para** criar minha conta e comecar a usar a plataforma.

**Criterios de aceite**:
- [ ] O sistema cria um tenant do tipo "autonomo" com um unico usuario
- [ ] E-mail de confirmacao e enviado apos o cadastro
- [ ] O usuario so acessa funcionalidades apos confirmar o e-mail
- [ ] CPF e validado (formato e digitos verificadores)
- [ ] Nao e possivel cadastrar com e-mail ou CPF ja existente
- [ ] O termo de consentimento LGPD e apresentado e deve ser aceito antes de prosseguir

#### US-02: Cadastro como administrador de clinica
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/security.agent.md`

**Como** admin de clinica, **quero** cadastrar minha clinica informando razao social, CNPJ, endereco, telefone e dados do administrador, **para** criar o tenant da clinica e convidar minha equipe.

**Criterios de aceite**:
- [ ] O sistema cria um tenant do tipo "clinica"
- [ ] O usuario que cadastra recebe automaticamente o papel de admin
- [ ] CNPJ e validado (formato e digitos verificadores)
- [ ] E-mail de confirmacao e enviado ao administrador
- [ ] Nao e possivel cadastrar com CNPJ ja existente
- [ ] O termo de consentimento LGPD e apresentado e deve ser aceito antes de prosseguir

#### US-03: Convite de usuario para a clinica
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/security.agent.md`

**Como** admin de clinica, **quero** convidar profissionais e secretarias por e-mail atribuindo um papel (medico, psicologo, secretaria), **para** que eles acessem o sistema com as permissoes corretas.

**Criterios de aceite**:
- [ ] O convite e enviado por e-mail com link de aceite
- [ ] O convidado cria senha e confirma o e-mail ao aceitar
- [ ] O papel atribuido no convite e registrado automaticamente
- [ ] Um usuario pode ter mais de um papel na clinica
- [ ] Apenas admin pode enviar convites
- [ ] O convite expira apos 7 dias sem aceite

#### US-04: Login com e-mail e senha
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/security.agent.md`

**Como** usuario da plataforma, **quero** fazer login com e-mail e senha, **para** acessar o sistema com seguranca.

**Criterios de aceite**:
- [ ] Autenticacao com e-mail e senha validada
- [ ] Apos login, o sistema identifica o tenant e os papeis do usuario
- [ ] Bloqueio temporario apos 5 tentativas consecutivas com senha errada
- [ ] Opcao de "esqueci minha senha" com fluxo de redefinicao por e-mail
- [ ] Sessao expira apos periodo de inatividade configuravel

---

### Feature F02: Gestao de Pacientes

**Objetivo**: Cadastrar pacientes, criar vinculos com profissionais e definir tarifas.
**Bounded contexts**: Clinico
**Dependencias**: F01 (usuario autenticado)

#### US-05: Cadastrar paciente
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou secretaria, **quero** cadastrar um paciente informando nome completo, CPF, data de nascimento, telefone, e-mail e endereco, **para** manter o registro do paciente no sistema.

**Criterios de aceite**:
- [ ] O paciente e criado vinculado ao tenant
- [ ] CPF e validado e nao pode ser duplicado dentro do mesmo tenant
- [ ] Telefone e obrigatorio (necessario para notificacoes via WhatsApp)
- [ ] Paciente NAO e usuario do sistema e NAO possui login
- [ ] Consentimento LGPD deve estar ativo no tenant para permitir cadastro (DR-CO-3)
- [ ] Evento de auditoria e registrado (DR-CO-1)

#### US-06: Vincular paciente a profissional e definir tarifa
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou admin de clinica, **quero** criar o vinculo entre um profissional e um paciente definindo a tarifa de atendimento (valor e tipo: por sessao ou por hora), **para** permitir agendamentos e definir o valor cobrado.

**Criterios de aceite**:
- [ ] O vinculo e criado com profissional, paciente e tarifa (valor + tipo)
- [ ] Nao e possivel criar vinculo duplicado (mesmo profissional + mesmo paciente no tenant)
- [ ] A tarifa e obrigatoria para criacao do vinculo (usada para gerar Conta a receber — DR-FI-4)
- [ ] Para profissional autonomo, o vinculo e criado automaticamente com ele mesmo
- [ ] Em clinicas, o admin pode vincular qualquer profissional a qualquer paciente
- [ ] A tarifa pode ser alterada posteriormente (afeta apenas novos atendimentos)

#### US-07: Pesquisar paciente
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou secretaria, **quero** pesquisar pacientes por nome, CPF ou telefone, **para** encontrar rapidamente o cadastro de um paciente.

**Criterios de aceite**:
- [ ] A busca funciona por nome (parcial), CPF (exato ou parcial) ou telefone
- [ ] Os resultados sao filtrados pelo tenant do usuario logado (DR-IA-4)
- [ ] A lista de resultados exibe: nome, CPF (parcialmente mascarado), telefone e profissional vinculado
- [ ] E possivel acessar o cadastro completo do paciente a partir do resultado

=================================================================

## P1 — Core MVP

---

### Feature F03: Agenda e Agendamentos

**Objetivo**: Gerenciar a agenda do profissional — criar, alterar, cancelar e realizar agendamentos.
**Bounded contexts**: Agendamento
**Dependencias**: F01, F02 (paciente cadastrado e vinculado)

#### US-08: Criar agendamento para paciente
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou secretaria, **quero** criar um agendamento selecionando paciente, data, horario e tipo de atendimento, **para** organizar minha agenda de atendimentos.

**Criterios de aceite**:
- [ ] O agendamento e criado com status "agendado"
- [ ] O sistema impede agendamentos sobrepostos para o mesmo profissional (DR-AG-1)
- [ ] Somente pacientes com vinculo ativo ao profissional podem ser agendados (DR-AG-3)
- [ ] Paciente e profissional pertencem ao mesmo tenant (DR-AG-2)
- [ ] O agendamento registra: data, hora inicio, hora fim (ou duracao), profissional, paciente, tipo de atendimento
- [ ] Evento AgendamentoCriado e disparado para notificacoes

#### US-09: Alterar agendamento existente
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou secretaria, **quero** alterar a data, horario ou profissional de um agendamento existente, **para** acomodar mudancas na disponibilidade.

**Criterios de aceite**:
- [ ] A alteracao respeita a regra de nao sobreposicao (DR-AG-1)
- [ ] Somente agendamentos com status "agendado" podem ser alterados
- [ ] O historico de alteracoes e mantido (data original e nova data)
- [ ] Evento AgendamentoAlterado e disparado para notificacoes

#### US-10: Cancelar agendamento
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou secretaria, **quero** cancelar um agendamento, **para** liberar o horario na agenda.

**Criterios de aceite**:
- [ ] O status do agendamento muda para "cancelado"
- [ ] O slot e liberado para novos agendamentos
- [ ] Motivo do cancelamento pode ser registrado (opcional)
- [ ] Somente agendamentos com status "agendado" podem ser cancelados
- [ ] Evento AgendamentoCancelado e disparado para notificacoes

#### US-11: Marcar agendamento como realizado
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou secretaria, **quero** marcar um agendamento como realizado apos o atendimento, **para** registrar que o paciente compareceu e o atendimento ocorreu.

**Criterios de aceite**:
- [ ] O status do agendamento muda para "realizado"
- [ ] Evento AgendamentoRealizado e disparado
- [ ] Um Atendimento e criado automaticamente no contexto Clinico vinculado ao agendamento
- [ ] Uma Conta a receber e criada automaticamente no contexto Financeiro com base na tarifa do vinculo profissional-paciente (DR-FI-4)
- [ ] Somente agendamentos com status "agendado" ou "confirmado" podem ser marcados como realizados (DR-CL-1)

#### US-12: Visualizar agenda do dia e da semana
**Agente(s) recomendado(s)**: `subagents/product.agent.md`

**Como** profissional autonomo, secretaria ou admin de clinica, **quero** visualizar a agenda em formato diario e semanal, **para** ter visao clara dos atendimentos programados.

**Criterios de aceite**:
- [ ] Visao diaria exibe todos os agendamentos do dia ordenados por horario
- [ ] Visao semanal exibe agendamentos dos 7 dias
- [ ] Cada agendamento mostra: horario, paciente, tipo de atendimento e status
- [ ] Em clinicas, a secretaria e o admin podem filtrar por profissional
- [ ] Horarios livres sao visualmente distinguiveis dos ocupados
- [ ] E possivel clicar em um horario vazio para criar um novo agendamento

---

### Feature F04: Atendimento e Prontuario

**Objetivo**: Registrar evolucoes clinicas e consultar o prontuario do paciente.
**Bounded contexts**: Clinico
**Dependencias**: F03 (agendamento marcado como realizado)

#### US-13: Registrar evolucao clinica
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional (autonomo ou de clinica), **quero** registrar a evolucao clinica apos um atendimento realizado, **para** manter o prontuario do paciente atualizado.

**Criterios de aceite**:
- [ ] A evolucao e vinculada a um atendimento existente
- [ ] Cada atendimento pode ter no maximo uma evolucao (DR-CL-2)
- [ ] Somente o profissional vinculado ao paciente pode registrar a evolucao (DR-CL-3)
- [ ] A evolucao contem: texto livre (notas da sessao) e data/hora de registro
- [ ] Apos salva, a evolucao se torna imutavel (nao pode ser editada ou excluida)
- [ ] Evento EvolucaoRegistrada e disparado
- [ ] Evento de auditoria e registrado (DR-CO-1)

#### US-14: Visualizar prontuario do paciente
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional (autonomo ou de clinica), **quero** visualizar o prontuario completo de um paciente, **para** consultar o historico de evolucoes antes de um atendimento.

**Criterios de aceite**:
- [ ] O prontuario exibe todas as evolucoes do paciente ordenadas por data (mais recente primeiro)
- [ ] Cada entrada mostra: data do atendimento, profissional responsavel e texto da evolucao
- [ ] Somente profissionais vinculados ao paciente (ou admin) podem visualizar o prontuario
- [ ] Em clinicas, um profissional nao ve evolucoes registradas por outro profissional (salvo configuracao do tenant)
- [ ] Acesso ao prontuario gera evento de auditoria (DR-CO-1)
- [ ] Dados de prontuario tem retencao minima de 20 anos (DR-CO-4)

---

### Feature F05: Contas a Receber e Baixa

**Objetivo**: Acompanhar valores devidos e registrar pagamentos.
**Bounded contexts**: Financeiro
**Dependencias**: F03 (conta a receber gerada ao marcar agendamento como realizado)

#### US-15: Visualizar contas a receber
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo, secretaria ou admin de clinica, **quero** visualizar a lista de contas a receber com filtros por periodo, paciente, profissional e status de pagamento, **para** acompanhar os valores pendentes.

**Criterios de aceite**:
- [ ] A lista exibe: data do atendimento, paciente, profissional, valor, status do pagamento (pendente, pago, parcial)
- [ ] Filtros disponiveis: periodo (data inicio e fim), paciente, profissional, status do pagamento
- [ ] Ordenacao por data do atendimento (mais recente primeiro por padrao)
- [ ] Totalizadores visiveis: total pendente, total pago, total geral do periodo
- [ ] Dados filtrados pelo tenant do usuario logado (DR-IA-4)

#### US-16: Registrar baixa de conta a receber
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou secretaria, **quero** registrar a baixa de uma conta a receber informando a data e forma de pagamento, **para** controlar os recebimentos.

**Criterios de aceite**:
- [ ] A baixa altera o status da conta a receber para "pago"
- [ ] E obrigatorio informar: data do pagamento e forma de pagamento (dinheiro, PIX, cartao, transferencia)
- [ ] O valor da baixa e igual ao valor da conta (valor e moeda sao imutaveis apos criacao — DR-FI-2)
- [ ] Evento ContaAReceberBaixada e disparado
- [ ] Nao e possivel dar baixa em conta ja paga
- [ ] A baixa fica vinculada ao atendimento de origem

=================================================================

## P2 — Complementar

---

### Feature F06: Emissao de Recibos

**Objetivo**: Gerar recibos para reembolso de plano de saude.
**Bounded contexts**: Financeiro
**Dependencias**: F05 (conta a receber com baixa)

#### US-17: Emitir recibo para paciente
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou secretaria, **quero** emitir um recibo para o paciente contendo dados do atendimento, valor e dados do profissional, **para** que o paciente possa solicitar reembolso ao plano de saude.

**Criterios de aceite**:
- [ ] O recibo e gerado com: numero sequencial, data de emissao, dados do profissional (nome, CPF/CNPJ, registro profissional), dados do paciente (nome, CPF), descricao do atendimento, valor
- [ ] O recibo pode ser vinculado a um ou mais atendimentos/contas a receber
- [ ] Apos emitido, os dados do recibo sao imutaveis (DR-FI-3)
- [ ] O recibo e disponibilizado em formato PDF para download
- [ ] Evento ReciboEmitido e disparado
- [ ] E possivel reemitir (copia) um recibo ja emitido sem alterar os dados originais

**Spec complementar**: [receipt-legal-spec.md](receipt-legal-spec.md)

---

### Feature F07: Dashboard Financeiro

**Objetivo**: Visao consolidada da saude financeira do tenant.
**Bounded contexts**: Financeiro
**Dependencias**: F05 (dados de contas a receber e baixas)

#### US-18: Visualizar dashboard financeiro
**Agente(s) recomendado(s)**: `subagents/product.agent.md`

**Como** profissional autonomo ou admin de clinica, **quero** visualizar um dashboard com resumo financeiro (entradas, contas a receber, aging), **para** ter visao geral da saude financeira.

**Criterios de aceite**:
- [ ] O dashboard exibe: total de entradas no periodo, total de contas pendentes, total de contas vencidas
- [ ] Grafico de aging: contas a receber agrupadas por faixa (0-30 dias, 31-60 dias, 61-90 dias, +90 dias)
- [ ] Filtros por periodo e por profissional (em clinicas)
- [ ] Dados atualizados em tempo real ou com atraso maximo aceitavel
- [ ] Em clinicas, o admin ve o consolidado; profissionais veem apenas seus proprios dados

---

### Feature F08: Assinatura e Trial

**Objetivo**: Monetizacao SaaS — trial com dados fake, contratacao e gestao de planos.
**Bounded contexts**: Assinatura
**Dependencias**: F01 (tenant criado)

#### US-19: Iniciar trial com dados de demonstracao
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou admin de clinica, **quero** que ao me cadastrar a plataforma inicie automaticamente um periodo de trial com dados fake pre-carregados, **para** conhecer as funcionalidades antes de contratar.

**Criterios de aceite**:
- [ ] O trial inicia automaticamente apos a confirmacao de e-mail
- [ ] Dados de demonstracao sao populados no tenant (pacientes ficticios, agendamentos, evolucoes, contas a receber)
- [ ] O periodo de trial e de 1 a 2 dias (configuravel pela plataforma)
- [ ] O usuario visualiza um banner com o tempo restante de trial
- [ ] Os dados fake sao claramente identificados como "dados de demonstracao"
- [ ] Todas as funcionalidades ficam disponiveis durante o trial

#### US-20: Contratar plano apos trial
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** profissional autonomo ou admin de clinica, **quero** contratar um plano SaaS ao final do trial (ou a qualquer momento), **para** continuar usando a plataforma com meus dados reais.

**Criterios de aceite**:
- [ ] O sistema exibe os planos disponiveis com precos, limites e funcionalidades
- [ ] Ao contratar, os dados fake do trial sao removidos e o tenant fica limpo para uso real
- [ ] O status da assinatura muda para "ativa"
- [ ] A cobranca mensal e ativada a partir da data de contratacao
- [ ] E possivel contratar durante o trial sem esperar o vencimento

#### US-21: Bloqueio por expiracao de trial
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** plataforma, **quero** bloquear o acesso operacional do tenant quando o trial expirar sem contratacao, **para** incentivar a conversao e proteger o modelo de negocio.

**Criterios de aceite**:
- [ ] Apos expiracao do trial, operacoes de escrita sao bloqueadas
- [ ] O usuario e redirecionado para a tela de contratacao de plano
- [ ] Dados do trial sao mantidos por 30 dias para caso o usuario decida contratar
- [ ] Notificacao e enviada por e-mail 24 horas antes da expiracao do trial
- [ ] O usuario ainda pode visualizar dados (somente leitura) durante o periodo de graca

#### US-22: Fazer upgrade de plano
**Agente(s) recomendado(s)**: `subagents/product.agent.md`; `subagents/domain.agent.md`

**Como** admin de clinica, **quero** fazer upgrade do meu plano para aumentar o limite de usuarios e pacientes, **para** acompanhar o crescimento da clinica.

**Criterios de aceite**:
- [ ] O sistema exibe os planos superiores ao atual com comparacao de limites e precos
- [ ] O upgrade entra em vigor imediatamente
- [ ] O valor proporcional e ajustado na proxima cobranca (pro rata)
- [ ] Os novos limites sao aplicados instantaneamente
- [ ] Historico de mudancas de plano fica registrado

=================================================================

## P3 — Desejavel

---

### Feature F09: Notificacoes via WhatsApp

**Objetivo**: Reduzir faltas e manter o paciente informado sobre agendamentos.
**Bounded contexts**: Notificacoes
**Dependencias**: F03 (agendamentos criados), integracao com WhatsApp Business API

#### US-23: Enviar lembrete de agendamento via WhatsApp
**Agente(s) recomendado(s)**: `subagents/product.agent.md`

**Como** profissional autonomo ou admin de clinica, **quero** que o sistema envie automaticamente um lembrete via WhatsApp ao paciente antes do agendamento, **para** reduzir faltas.

**Criterios de aceite**:
- [ ] O lembrete e enviado automaticamente 24 horas antes do agendamento (configuravel)
- [ ] A mensagem contem: nome do paciente, data, horario, nome do profissional e endereco/link
- [ ] O envio depende de o paciente ter telefone cadastrado
- [ ] O sistema registra log de envio (sucesso ou falha)
- [ ] O profissional ou admin pode configurar se lembretes estao ativos ou nao

#### US-24: Notificar paciente sobre criacao ou alteracao de agendamento
**Agente(s) recomendado(s)**: `subagents/product.agent.md`

**Como** profissional autonomo ou secretaria, **quero** que ao criar ou alterar um agendamento o paciente receba notificacao via WhatsApp, **para** que o paciente esteja informado sobre seus compromissos.

**Criterios de aceite**:
- [ ] Notificacao enviada automaticamente ao criar agendamento (evento AgendamentoCriado)
- [ ] Notificacao enviada automaticamente ao alterar agendamento (evento AgendamentoAlterado)
- [ ] Notificacao enviada automaticamente ao cancelar agendamento (evento AgendamentoCancelado)
- [ ] A mensagem contem: tipo de acao (novo, alterado, cancelado), data, horario e profissional
- [ ] O envio e assincrono (nao bloqueia a operacao de agendamento)

=================================================================

## Roadmap visual

```
Sprint 1-2 (P0)          Sprint 3-4 (P1)           Sprint 5-6 (P2)         Sprint 7+ (P3)
─────────────────         ─────────────────         ─────────────────       ─────────────────
F01: Autenticacao    ──→  F03: Agenda          ──→  F06: Recibos       ──→  F09: WhatsApp
F02: Pacientes       ──→  F04: Prontuario      ──→  F07: Dashboard
                          F05: Contas/Baixa     ──→  F08: Assinatura
```

## Dependencias entre features

```
F01 Autenticacao
 ├──→ F02 Pacientes
 │     └──→ F03 Agenda
 │           ├──→ F04 Prontuario
 │           ├──→ F05 Contas/Baixa
 │           │     ├──→ F06 Recibos
 │           │     └──→ F07 Dashboard
 │           └──→ F09 WhatsApp (notificacoes)
 └──→ F08 Assinatura (independente das demais)
```

## Rastreabilidade

| Feature | User Stories | Bounded Context | Regras de dominio |
|---------|-------------|-----------------|-------------------|
| F01 | US-01, US-02, US-03, US-04 | Identidade e Acesso | DR-IA-1, DR-IA-2, DR-IA-3, DR-IA-4, DR-CO-3 |
| F02 | US-05, US-06, US-07 | Clinico | DR-CO-1, DR-CO-3, DR-FI-4, DR-IA-4 |
| F03 | US-08, US-09, US-10, US-11, US-12 | Agendamento, Clinico, Financeiro | DR-AG-1, DR-AG-2, DR-AG-3, DR-CL-1, DR-FI-4 |
| F04 | US-13, US-14 | Clinico | DR-CL-2, DR-CL-3, DR-CO-1, DR-CO-4 |
| F05 | US-15, US-16 | Financeiro | DR-FI-1, DR-FI-2, DR-IA-4 |
| F06 | US-17 | Financeiro | DR-FI-3 |
| F07 | US-18 | Financeiro | DR-IA-4 |
| F08 | US-19, US-20, US-21, US-22 | Assinatura | DR-AS-1, DR-AS-2 |
| F09 | US-23, US-24 | Notificacoes | — |

=================================================================

**Proximo passo**: Definir UI/UX por feature (telas, componentes e fluxos visuais) antes da implementacao.
