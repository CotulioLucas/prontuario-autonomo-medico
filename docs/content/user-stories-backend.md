# User Stories — Backend (API)

**Fonte**: docs/content/user-stories-mvp.md, docs/ui/screens.md, docs/ui/screens-p2-p3.md, docs/adr/0010-api-rest-design.md, docs/domain/domain-rules.md, docs/domain/domain-events.md
**Status**: Backlog
**Ultima atualizacao**: 2026-02-09
**Executor**: Agente de IA (uma US por tarefa). Cada US inclui Entradas (docs), Saidas (artefatos) e criterios de aceite verificaveis.

**Subagents**: Cada US indica **Agente(s) recomendado(s)** — arquivo em `subagents/<nome>.agent.md`. F01 (Auth): backend + security; demais: backend; testes opcionais: qa.

=================================================================

## Personas

| Persona | Descricao |
|---------|-----------|
| **Desenvolvedor** | Implementa endpoints e regras de dominio. |
| **Consumidor da API (frontend)** | Usa os endpoints para as telas. |

## Convencoes gerais (ADR 0010)

- **Prefixo**: `/api/v1/`. Content-Type: `application/json`; UTF-8.
- **Auth**: Rotas protegidas exigem sessao (cookie) ou Bearer JWT; 401 se nao autenticado; 403 se sem permissao. tenantId e userId **da sessao**, nunca do body.
- **Erro**: `{ "error": { "code": "string", "message": "string", "details": optional } }`. Status: 400 (validacao/negocio), 401, 403, 404, 409, 422, 500. Codigos estaveis (ex.: APPOINTMENT_CONFLICT, PATIENT_NOT_FOUND).
- **Paginacao**: Cursor-based `?cursor=&limit=` com resposta `{ data, nextCursor, hasMore }` ou offset `?page=&pageSize=` documentado.

=================================================================

## Inventario (US-BE por Feature)

| ID | Titulo | Feature | Prioridade | Agente(s) recomendado(s) |
|----|--------|---------|------------|---------------------------|
| US-BE-F01-01 | Login | F01 | P0 | backend; security |
| US-BE-F01-02 | Cadastro autonomo | F01 | P0 | backend; security |
| US-BE-F01-03 | Cadastro clinica | F01 | P0 | backend; security |
| US-BE-F01-04 | Confirmar e-mail, reenviar confirmacao | F01 | P0 | backend; security |
| US-BE-F01-05 | Esqueci senha / Redefinir senha | F01 | P0 | backend; security |
| US-BE-F01-06 | Aceitar convite | F01 | P0 | backend; security |
| US-BE-F01-07 | Equipe: membros, convites, profissionais | F01 | P0 | backend; security |
| US-BE-F02-01 | Pacientes: listagem e CRUD | F02 | P0 | backend |
| US-BE-F02-02 | Paciente: vinculos (links) | F02 | P0 | backend |
| US-BE-F02-03 | Paciente: dados, prontuario, receivables, appointments | F02 | P1 | backend |
| US-BE-F03-01 | Agendamentos: listagem, check-overlap, CRUD, cancelar | F03 | P0 | backend |
| US-BE-F03-02 | Agendamento: marcar como realizado | F03 | P0 | backend |
| US-BE-F04-01 | Evolucao: pendentes e registrar | F04 | P0 | backend |
| US-BE-F05-01 | Contas a receber: listagem e baixa (payment) | F05/F06 | P0 | backend |
| US-BE-F06-01 | Recibos (P2/P3) | F06 | P2 | backend |

=================================================================

## F01 — Autenticacao e Acesso

---

### US-BE-F01-01: Login

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`; `subagents/security.agent.md`

**Como** frontend, **quero** um endpoint POST /api/v1/auth/login (body: email, password, rememberMe?) que valide credenciais, retorne sessao (cookie) e 401 com codigo INVALID_CREDENTIALS ou ACCOUNT_LOCKED ou EMAIL_NOT_CONFIRMED, **para** atender Tela 01 e US-04.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-04)
- docs/ui/screens.md (Tela 01 — Login)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-IA-*)

**Saidas (artefatos)**:
- Rota POST /api/v1/auth/login em src/identity/ ou src/adapters/http/
- Handler que valida email/senha, verifica bloqueio e email confirmado; define sessao (cookie); retorna 200 ou 401 com codigo estavel

**Criterios de aceite**:
- [x] POST /api/v1/auth/login aceita body { email, password, rememberMe? }
- [x] Sucesso: sessao criada (cookie), resposta 200 (ou redirect conforme stack)
- [x] 401 com codigo INVALID_CREDENTIALS quando senha incorreta
- [x] 401 com codigo ACCOUNT_LOCKED apos 5 tentativas consecutivas com senha errada
- [x] 401 com codigo EMAIL_NOT_CONFIRMED quando e-mail nao confirmado
- [x] Content-Type application/json; formato de erro conforme ADR 0010

---

### US-BE-F01-02: Cadastro autonomo

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`; `subagents/security.agent.md`

**Como** frontend, **quero** POST /api/v1/auth/register/autonomo com body (nome, email, telefone, cpf, senha, dados profissionais, aceite termo LGPD) que crie Tenant (tipo autonomo) + User, envie e-mail de confirmacao e retorne 201 ou 400 (EMAIL_ALREADY_EXISTS, CPF_ALREADY_EXISTS), **para** US-01 e Tela 02.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-01)
- docs/ui/screens.md (Tela 02 — Cadastro autonomo)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-IA-1, DR-IA-2, DR-CO-3)

**Saidas (artefatos)**:
- Rota POST /api/v1/auth/register/autonomo
- Caso de uso que cria Tenant (autonomo), User, registra consentimento LGPD, dispara envio de e-mail de confirmacao
- Resposta 201 ou 400 com codigos EMAIL_ALREADY_EXISTS, CPF_ALREADY_EXISTS; validacao de CPF (formato e digitos)

**Criterios de aceite**:
- [x] Body: nome, email, telefone, cpf, senha, dados profissionais (especialidade etc.), aceite termo LGPD (boolean ou versao)
- [x] Cria Tenant tipo autonomo e um unico User; registro ConsentimentoLGPD
- [x] E-mail de confirmacao enviado apos cadastro
- [x] 201 em sucesso; 400 com codigo EMAIL_ALREADY_EXISTS ou CPF_ALREADY_EXISTS quando aplicavel
- [x] CPF validado (formato e digitos verificadores); termo LGPD obrigatorio (DR-CO-3)

---

### US-BE-F01-03: Cadastro clinica

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`; `subagents/security.agent.md`

**Como** frontend, **quero** POST /api/v1/auth/register/clinica com body (razao social, CNPJ, endereco, telefone, dados do administrador, aceite termo LGPD) que crie Tenant (tipo clinica), User admin e envie e-mail de confirmacao, retornando 201 ou 400 (CNPJ_ALREADY_EXISTS), **para** US-02 e Tela 03.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-02)
- docs/ui/screens.md (Cadastro clinica)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-IA-1, DR-CO-3)

**Saidas (artefatos)**:
- Rota POST /api/v1/auth/register/clinica
- Caso de uso que cria Tenant (clinica), User com papel admin, ConsentimentoLGPD, envia e-mail de confirmacao
- Resposta 201 ou 400 com codigo CNPJ_ALREADY_EXISTS; validacao CNPJ

**Criterios de aceite**:
- [x] Body: razaoSocial, cnpj, endereco, telefone, dados admin (nome, email, etc.), aceite termo LGPD
- [x] Cria Tenant tipo clinica; User que cadastra recebe papel admin; ConsentimentoLGPD
- [x] E-mail de confirmacao enviado; 201 em sucesso; 400 CNPJ_ALREADY_EXISTS se CNPJ ja existente
- [x] CNPJ validado (formato e digitos verificadores)

---

### US-BE-F01-04: Confirmar e-mail e reenviar confirmacao

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`; `subagents/security.agent.md`

**Como** frontend, **quero** GET /api/v1/auth/confirm-email?token=xxx que confirme o e-mail e exiba estado (sucesso/erro/expirado) e POST /api/v1/auth/resend-confirmation que reenvie o e-mail de confirmacao, **para** US-01/US-02 e Telas de confirmacao.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-01, US-02)
- docs/ui/screens.md (Confirmar e-mail, Reenviar)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-events.md (E-mailConfirmado)

**Saidas (artefatos)**:
- GET /api/v1/auth/confirm-email?token= — valida token, marca e-mail confirmado, retorna estado (success | error | expired)
- POST /api/v1/auth/resend-confirmation — reenvia e-mail de confirmacao (body ou sessao); retorna 200 ou 400 (ex.: TOKEN_EXPIRED, ALREADY_CONFIRMED)

**Criterios de aceite**:
- [x] GET confirm-email valida token e atualiza usuario (email confirmado); resposta indica sucesso, erro ou expirado
- [x] POST resend-confirmation reenvia e-mail; Toast/200 em sucesso; codigos de erro estaveis se aplicavel
- [x] Evento E-mailConfirmado ou equivalente considerado para auditoria/liberacao de acesso

---

### US-BE-F01-05: Esqueci senha / Redefinir senha

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`; `subagents/security.agent.md`

**Como** frontend, **quero** POST /api/v1/auth/forgot-password (email) que envie link de redefinicao e PUT /api/v1/auth/reset-password (token, newPassword, confirmPassword) que redefina a senha, **para** US-04 e fluxo "esqueci minha senha".

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-04)
- docs/ui/screens.md (Esqueci senha, Redefinir senha)
- docs/adr/0010-api-rest-design.md

**Saidas (artefatos)**:
- POST /api/v1/auth/forgot-password — body { email }; envia link por e-mail; retorna 200 (sempre, por seguranca) ou mensagem generica
- PUT /api/v1/auth/reset-password — body { token, newPassword, confirmPassword }; valida token e redefine senha; redireciona para login ou 200

**Criterios de aceite**:
- [x] POST forgot-password aceita email; envia link de redefinicao; resposta nao revela se e-mail existe ou nao
- [x] PUT reset-password aceita token + nova senha; valida token (expirado/invalido retorna 400 com codigo); sucesso 200 ou redirect para login
- [x] Formato de erro conforme ADR 0010

---

### US-BE-F01-06: Aceitar convite

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`; `subagents/security.agent.md`

**Como** frontend, **quero** POST /api/v1/auth/accept-invite (token no body ou query; usuario novo: formulario + LGPD; usuario existente: sessao) que associe o usuario ao tenant e atribua o papel do convite, retornando 200 e redirecionando para dashboard ou login, **para** US-03 e Tela de aceite de convite.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-03)
- docs/ui/screens.md (Aceitar convite)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-IA-3), domain-events.md (PapelAtribuído)

**Saidas (artefatos)**:
- POST /api/v1/auth/accept-invite — token obrigatorio; body para usuario novo: senha, dados, aceite LGPD; usuario existente pode ter sessao
- Caso de uso: valida convite (expirado 7 dias), cria usuario ou associa existente, atribui papel, invalida convite

**Criterios de aceite**:
- [x] Aceita token (query ou body); usuario novo preenche formulario e aceite LGPD; usuario existente com sessao pode aceitar
- [x] Convite expirado (ex.: 7 dias) retorna 400 com codigo INVITE_EXPIRED
- [x] Papel do convite registrado; redireciona para dashboard ou login com Toast de sucesso
- [x] Apenas um aceite por convite (convite consumido)

---

### US-BE-F01-07: Equipe — membros, convites, profissionais

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`; `subagents/security.agent.md` (autorizacao por papel)

**Como** frontend, **quero** endpoints para listar membros e convites, enviar/reenviar/revogar convites, alterar papel e desativar membro, e listar profissionais ativos, **para** Telas de Equipe e selecao de profissional em agendamento/vinculos.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-03)
- docs/ui/screens.md (Equipe: membros, convites; listagem profissionais)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-IA-3, DR-IA-4)

**Saidas (artefatos)**:
- GET /api/v1/team/members — retorna nome, email, papel, status, data convite; filtrado por tenant da sessao
- POST /api/v1/team/invites — body { email, role }; envia convite por e-mail; 201 ou 400
- POST /api/v1/team/invites/[id]/resend — reenviar convite; 200
- DELETE /api/v1/team/invites/[id] — revogar convite; 200
- PUT /api/v1/team/members/[id]/role — body { role }; alterar papel; 200 ou 403
- PUT /api/v1/team/members/[id]/deactivate — desativar membro; 200 ou 403
- GET /api/v1/team/professionals — lista profissionais ativos do tenant (para clinica); tenant autonomo usa usuario logado

**Criterios de aceite**:
- [x] Todas as rotas protegidas; tenantId e userId da sessao (DR-IA-4)
- [x] Apenas admin pode criar/revogar convites e alterar papeis/desativar
- [x] GET members retorna dados conforme tela (nome, e-mail, papel, status, data convite)
- [x] GET professionals retorna apenas profissionais ativos; usado em agendamento e vinculos
- [x] Formato de erro padrao; 403 quando sem permissao

=================================================================

## F02 — Gestao de Pacientes

---

### US-BE-F02-01: Pacientes — listagem e CRUD

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** frontend, **quero** GET /api/v1/patients?search=&page=&limit= (lista filtrada por tenant), GET /api/v1/patients/[id], POST /api/v1/patients e PUT /api/v1/patients/[id], **para** US-05, US-07 e Telas de lista e cadastro de paciente.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-05, US-07)
- docs/ui/screens.md (Lista pacientes, Cadastro/edicao paciente)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-IA-4, DR-CO-1, DR-CO-3)

**Saidas (artefatos)**:
- GET /api/v1/patients?search=&page=&limit= — listagem filtrada por tenantId da sessao; busca por nome, CPF, telefone; paginacao
- GET /api/v1/patients/[id] — detalhe do paciente; 404 se nao encontrado ou outro tenant
- POST /api/v1/patients — body com dados cadastrais; cria paciente no tenant; 201 ou 400 (CPF_DUPLICATE, etc.)
- PUT /api/v1/patients/[id] — atualiza paciente; 200 ou 400 ou 404

**Criterios de aceite**:
- [x] Listagem sempre filtrada por tenantId da sessao (DR-IA-4)
- [x] Busca por nome (parcial), CPF, telefone; resultados com nome, CPF mascarado, telefone, profissional vinculado conforme US-07
- [x] POST/PUT validam CPF (formato e digitos); CPF unico no tenant; consentimento LGPD ativo no tenant para cadastro (DR-CO-3)
- [x] Auditoria de acesso/alteracao em dados sensíveis (DR-CO-1) conforme politica
- [x] Codigos de erro: PATIENT_NOT_FOUND, CPF_ALREADY_EXISTS, VALIDATION_ERROR

---

### US-BE-F02-02: Paciente — vinculos (links)

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** frontend, **quero** GET /api/v1/patients/[id]/links, POST /api/v1/patients/[id]/links e PUT /api/v1/patients/[id]/links/[linkId] para listar, criar e editar vinculos profissional–paciente com tarifa, **para** US-06 e aba Vinculos na tela do paciente.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-06)
- docs/ui/screens.md (Vinculos: lista, criar/editar)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-FI-4)

**Saidas (artefatos)**:
- GET /api/v1/patients/[id]/links — retorna profissional, tarifa (valor + tipo); filtrado por tenant
- POST /api/v1/patients/[id]/links — body { professionalId, valor, tipo (sessao|hora) }; cria vinculo; 201 ou 400 (DUPLICATE_LINK, TARIFF_REQUIRED)
- PUT /api/v1/patients/[id]/links/[linkId] — body { valor, tipo }; atualiza tarifa; 200 ou 404

**Criterios de aceite**:
- [x] Vinculo com profissional, paciente e tarifa (valor + tipo); tarifa obrigatoria (DR-FI-4)
- [x] Nao permite vinculo duplicado (mesmo profissional + paciente no tenant); codigo DUPLICATE_LINK
- [x] Tenant autonomo: vinculo com profissional logado; clinica: professionalId no body
- [x] Respostas 200/201/400/404; formato de erro padrao

---

### US-BE-F02-03: Paciente — dados, prontuario, receivables, appointments

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** frontend, **quero** GET /api/v1/patients/[id]/records (evolucoes), GET /api/v1/patients/[id]/receivables, GET /api/v1/patients/[id]/appointments para abas Prontuario, Financeiro e Agendamentos na tela do paciente, **para** US-07 e navegacao no cadastro do paciente.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md
- docs/ui/screens.md (Aba prontuario, financeiro, agendamentos do paciente)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-IA-4)

**Saidas (artefatos)**:
- GET /api/v1/patients/[id]/records — evolucoes ordenadas por data; filtrado por tenant
- GET /api/v1/patients/[id]/receivables — contas a receber do paciente
- GET /api/v1/patients/[id]/appointments — historico de agendamentos do paciente

**Criterios de aceite**:
- [x] Todos filtrados por tenantId da sessao e patientId pertencente ao tenant
- [x] GET records retorna evolucoes com data, profissional, texto, tipo conforme tela
- [x] 404 se paciente nao existir ou pertencer a outro tenant

=================================================================

## F03 — Agendamento

---

### US-BE-F03-01: Agendamentos — listagem, check-overlap, CRUD, cancelar

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** frontend, **quero** GET /api/v1/appointments (filtros startDate, endDate, date, professionalId), GET /api/v1/appointments/check-overlap, GET /api/v1/appointments/[id], POST /api/v1/appointments, PUT /api/v1/appointments/[id], PUT /api/v1/appointments/[id]/cancel, **para** US-08, US-09, US-10 e Telas de agenda.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-08, US-09, US-10)
- docs/ui/screens.md (Agenda semana/dia, formulario agendamento, conflito)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-AG-1, DR-AG-2, DR-AG-3)

**Saidas (artefatos)**:
- GET /api/v1/appointments?startDate=&endDate=&professionalId= ou ?date=&professionalId= — lista agendamentos com paciente, profissional, data, hora, tipo, status
- GET /api/v1/appointments/check-overlap?professionalId=&date=&startTime=&duration= — retorna se ha sobreposicao (boolean ou detalhe); usado em tempo real no form
- GET /api/v1/appointments/[id] — detalhe do agendamento
- POST /api/v1/appointments — body { professionalId, patientId, date, startTime, duration, tipo }; cria agendamento; 201 ou 400 (APPOINTMENT_CONFLICT, PATIENT_NOT_FOUND, NO_LINK)
- PUT /api/v1/appointments/[id] — altera agendamento; 200 ou 400 (APPOINTMENT_CONFLICT) ou 404
- PUT /api/v1/appointments/[id]/cancel — cancela agendamento; 200 ou 404

**Criterios de aceite**:
- [x] DR-AG-1: rejeitar criacao/alteracao se sobreposicao de slot do mesmo profissional; codigo APPOINTMENT_CONFLICT
- [x] DR-AG-2: paciente e profissional do mesmo tenant
- [x] DR-AG-3: paciente com vinculo ao profissional (ou regra do tenant); rejeitar com codigo NO_LINK se aplicavel
- [x] Listagens filtradas por tenantId da sessao; professionalId opcional para filtrar
- [x] Eventos AgendamentoCriado, AgendamentoAlterado, AgendamentoCancelado publicados conforme domain-events

---

### US-BE-F03-02: Agendamento — marcar como realizado

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** frontend, **quero** PUT /api/v1/appointments/[id]/complete que marque o agendamento como realizado, dispare evento AgendamentoRealizado (criando Atendimento e Conta a receber), **para** US-11 e Tela de detalhe do agendamento.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-11)
- docs/ui/screens.md (Marcar como realizado)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-CL-1), docs/domain/domain-events.md (AgendamentoRealizado)

**Saidas (artefatos)**:
- PUT /api/v1/appointments/[id]/complete — marca status como realizado; publica evento AgendamentoRealizado
- Handlers (clinical, billing) criam Atendimento e Conta a receber (valor da tarifa do vinculo — DR-FI-4)

**Criterios de aceite**:
- [x] Apenas agendamento em status realizavel (ex.: confirmado) pode ser marcado como realizado (DR-CL-1); senao 400 com codigo apropriado
- [x] Ao completar: evento AgendamentoRealizado publicado; Atendimento criado (clinical); Conta a receber criada (billing) com valor da TarifaDeAtendimento do vinculo (DR-FI-4)
- [x] Resposta 200 com mensagem tipo "Atendimento registrado e conta a receber criada"; 404 se agendamento nao existir ou outro tenant

=================================================================

## F04 — Prontuario / Evolucao

---

### US-BE-F04-01: Evolucao — pendentes e registrar

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** frontend, **quero** GET /api/v1/patients/[id]/pending-records (atendimentos sem evolucao), GET /api/v1/patients/[id]/records (evolucoes) e POST /api/v1/appointments/[id]/record (registrar evolucao do atendimento), **para** US-12 e Telas de prontuario e registro de evolucao.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-12)
- docs/ui/screens.md (Prontuario, Atendimentos sem evolucao, Form registrar evolucao)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-CL-2, DR-CL-3, DR-CO-1)

**Saidas (artefatos)**:
- GET /api/v1/patients/[id]/pending-records — atendimentos que ainda nao tem evolucao (para botao "Registrar evolucao")
- GET /api/v1/patients/[id]/records — ja coberto em US-BE-F02-03
- POST /api/v1/appointments/[id]/record — body { content } ou equivalente; cria evolucao para o atendimento vinculado ao agendamento [id]; 201 ou 400 (DR-CL-2: uma evolucao por atendimento) ou 403 (DR-CL-3: apenas profissional vinculado)

**Criterios de aceite**:
- [x] DR-CL-2: no maximo uma evolucao por atendimento; rejeitar segunda com codigo EVOLUTION_ALREADY_EXISTS
- [x] DR-CL-3: apenas profissional vinculado ao paciente (ou perfil autorizado) pode criar/alterar evolucao; 403 senao
- [x] Auditoria de escrita em evolucao (DR-CO-1)
- [x] Evento EvoluçãoRegistrada considerado em domain-events

=================================================================

## F05 / F06 — Financeiro

---

### US-BE-F05-01: Contas a receber — listagem e baixa (payment)

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** frontend, **quero** GET /api/v1/receivables?startDate=&endDate=&patientId=&professionalId=&status=&page=&limit= e POST /api/v1/receivables/[id]/payment (data pagamento, forma de pagamento) para listar e registrar baixa, **para** US-13, US-14 e Telas de contas a receber.

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-13, US-14)
- docs/ui/screens.md (Lista contas a receber, Dialog baixa)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-FI-1, DR-FI-2, DR-FI-4), domain-events.md (ContaAReceberBaixada)

**Saidas (artefatos)**:
- GET /api/v1/receivables — filtros startDate, endDate, patientId, professionalId, status; paginacao; filtrado por tenant
- POST /api/v1/receivables/[id]/payment — body { paidAt, paymentMethod }; registra baixa; 200 ou 400/404

**Criterios de aceite**:
- [x] Listagem filtrada por tenantId da sessao; filtros opcionais conforme tela
- [x] Conta a receber vinculada a atendimento (DR-FI-1); valor e moeda imutaveis apos criacao (DR-FI-2)
- [x] POST payment atualiza status para pago (ou parcial); evento ContaAReceberBaixada ou equivalente
- [x] Resposta com dados atualizados (status "Pago", etc.); formato de erro padrao

---

### US-BE-F06-01: Recibos (P2/P3)

**Agente(s) recomendado(s)**: `subagents/backend.agent.md`

**Como** frontend, **quero** endpoint POST /api/v1/recibos para emissao de recibo (e eventualmente GET para listar/baixar), **para** telas P2/P3 de recibos.

**Entradas (docs)**:
- docs/ui/screens-p2-p3.md (Recibos)
- docs/adr/0010-api-rest-design.md
- docs/domain/domain-rules.md (DR-FI-3), domain-events.md (ReciboEmitido)

**Saidas (artefatos)**:
- POST /api/v1/recibos — body com dados do recibo (atendimentos, contas a receber, valor, emitente, paciente); emite recibo; 201 ou 400
- GET /api/v1/recibos (opcional) — listagem por tenant; GET /api/v1/recibos/[id] (opcional) — download/visualizacao

**Criterios de aceite**:
- [ ] Recibo referencia atendimento(s) e/ou conta(s) a receber do mesmo tenant
- [ ] DR-FI-3: apos emitido, dados do recibo imutaveis; reemissao apenas como copia se permitido
- [ ] Evento ReciboEmitido considerado; formato de erro padrao

=================================================================

## Rastreabilidade

| US-BE | US produto | Tela(s) | ADR / Regras |
|-------|------------|---------|--------------|
| US-BE-F01-01 | US-04 | Tela 01 | ADR 0010, DR-IA-4 |
| US-BE-F01-02 | US-01 | Tela 02 | ADR 0010, DR-IA-1, DR-IA-2, DR-CO-3 |
| US-BE-F01-03 | US-02 | Tela 03 | ADR 0010, DR-IA-1, DR-CO-3 |
| US-BE-F01-04 | US-01, US-02 | Confirmar e-mail | ADR 0010, domain-events |
| US-BE-F01-05 | US-04 | Esqueci/Redefinir senha | ADR 0010 |
| US-BE-F01-06 | US-03 | Aceitar convite | ADR 0010, DR-IA-3 |
| US-BE-F01-07 | US-03 | Equipe, profissionais | ADR 0010, DR-IA-3, DR-IA-4 |
| US-BE-F02-01 | US-05, US-07 | Lista/cadastro paciente | ADR 0010, DR-IA-4, DR-CO-1, DR-CO-3 |
| US-BE-F02-02 | US-06 | Vinculos | ADR 0010, DR-FI-4 |
| US-BE-F02-03 | US-07 | Abas paciente | ADR 0010, DR-IA-4 |
| US-BE-F03-01 | US-08, US-09, US-10 | Agenda, CRUD agendamento | ADR 0010, DR-AG-1, DR-AG-2, DR-AG-3 |
| US-BE-F03-02 | US-11 | Marcar realizado | ADR 0010, DR-CL-1, DR-FI-4, AgendamentoRealizado |
| US-BE-F04-01 | US-12 | Prontuario, registrar evolucao | ADR 0010, DR-CL-2, DR-CL-3, DR-CO-1 |
| US-BE-F05-01 | US-13, US-14 | Contas a receber, baixa | ADR 0010, DR-FI-1, DR-FI-2, DR-FI-4 |
| US-BE-F06-01 | P2/P3 | Recibos | ADR 0010, DR-FI-3 |
