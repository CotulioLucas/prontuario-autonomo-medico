# User Stories — Frontend (UI/UX)

**Fonte**: docs/content/user-stories-mvp.md, docs/ui/screens.md, docs/ui/screens-p2-p3.md, docs/ui/design-system.md, docs/content/user-stories-backend.md, docs/adr/0010-api-rest-design.md
**Status**: Backlog
**Ultima atualizacao**: 2026-02-09
**Executor**: Agente de IA (uma US por tarefa). Cada US inclui Entradas (docs), Saidas (artefatos), UX/UI detalhista e criterios de aceite verificaveis.

**Subagents**: Cada US indica **Agente(s) recomendado(s)** — arquivo em `subagents/<nome>.agent.md`. **Frontend** em todas; **security** em F01 (auth); **product** opcional em fluxos criticos (cadastro multi-etapa, agenda).

=================================================================

## Personas

| Persona | Descricao |
|---------|-----------|
| **Usuario da plataforma** | Profissional autonomo, admin de clinica, secretaria ou profissional de clinica que usa as telas. |
| **Desenvolvedor frontend** | Implementa telas e componentes conforme design-system e contratos da API. |

## Convencoes gerais

- **Stack**: Next.js 14+ App Router, shadcn/ui, Tailwind CSS; design-system obrigatorio ([docs/ui/design-system.md](../ui/design-system.md)).
- **Rotas**: Conforme [docs/ui/screens.md](../ui/screens.md) (ex.: `/login`, `/pacientes`, `/agenda`, `/financeiro`).
- **API**: Apenas `/api/v1/*`; erros no formato ADR 0010 `{ "error": { "code": "string", "message": "string", "details": optional } }`; exibir codigos estaveis ao usuario (toast/alert).
- **Acessibilidade**: Navegacao por teclado, foco em modais/dialogs, ARIA quando necessario; design-system define contraste e estados.
- **Plataforma MVP**: desktop only; app shell sidebar (280px, collapsivel) + header + content area.

=================================================================

## Mapeamento Tela → Backend → Funcionalidades → US-FE

| Tela | Rota | US-BE | Funcionalidades | US-FE |
|------|------|-------|-----------------|-------|
| 01 | /login | US-BE-F01-01 | Login (POST auth/login) | US-FE-F01-01 |
| 02 | /cadastro/autonomo | US-BE-F01-02 | Cadastro autonomo (POST register/autonomo) | US-FE-F01-02 |
| 03 | /cadastro/clinica | US-BE-F01-03 | Cadastro clinica (POST register/clinica) | US-FE-F01-03 |
| 04 | /confirmar-email | US-BE-F01-04 | Confirmar e-mail (GET confirm-email); Reenviar confirmacao (POST resend-confirmation) | US-FE-F01-04a, US-FE-F01-04b |
| 05 | /esqueci-senha | US-BE-F01-05 | Esqueci senha (POST forgot-password) | US-FE-F01-05a |
| 06 | /redefinir-senha | US-BE-F01-05 | Redefinir senha (PUT reset-password) | US-FE-F01-05b |
| 07 | /convite | US-BE-F01-06 | Aceitar convite (POST accept-invite) | US-FE-F01-06 |
| 08 | /configuracoes/equipe | US-BE-F01-07 | Listar membros e convites (GET members, GET invites); Enviar convite (POST invites); Reenviar/revogar convite (POST resend, DELETE); Alterar papel (PUT role); Desativar membro (PUT deactivate); GET professionals | US-FE-F01-07a a US-FE-F01-07e |
| 09 | /pacientes | US-BE-F02-01 | Listagem e busca pacientes (GET patients) | US-FE-F02-01 |
| 10 | /pacientes/novo, /pacientes/[id]/editar | US-BE-F02-01 | Criar paciente (POST); Editar paciente (PUT) | US-FE-F02-02 |
| 11 | /pacientes/[id] | US-BE-F02-01, F02-02, F02-03 | Detalhe paciente (GET patient); Abas dados, prontuario, receivables, appointments (GET records, receivables, appointments) | US-FE-F02-03 |
| 12 | Dialog (Tela 11) | US-BE-F02-02 | Vinculos: listar (GET links), criar (POST links), editar (PUT links/[id]) | US-FE-F02-04 |
| 13, 14 | /agenda, /agenda?view=day | US-BE-F03-01 | Listar agendamentos + filtros (GET appointments) | US-FE-F03-01 |
| 15 | Dialog (Tela 13/14) | US-BE-F03-01 | Criar/editar agendamento (check-overlap, POST, PUT appointments) | US-FE-F03-02 |
| 16 | Dialog (Tela 13/14) | US-BE-F03-01, F03-02 | Detalhe agendamento; Cancelar (PUT cancel); Marcar realizado (PUT complete) | US-FE-F03-03, US-FE-F03-04 |
| 17 | /pacientes/[id]/prontuario | US-BE-F02-03, F04-01 | Listar prontuario (GET records) | US-FE-F04-01 |
| 18 | /atendimentos/[id]/evolucao | US-BE-F04-01 | Pendentes (GET pending-records); Registrar evolucao (POST record) | US-FE-F04-02 |
| 19 | /financeiro | US-BE-F05-01 | Listar contas a receber (GET receivables) | US-FE-F05-01 |
| 20 | Dialog (Tela 19) | US-BE-F05-01 | Registrar baixa (POST receivables/[id]/payment) | US-FE-F05-02 |

=================================================================

## Inventario (US-FE por Feature)

| ID | Titulo (funcionalidade) | Feature | Prioridade | Tela(s) | US-BE | Agente(s) |
|----|-------------------------|---------|------------|---------|-------|-----------|
| US-FE-F01-01 | Login | F01 | P0 | 01 (/login) | US-BE-F01-01 | frontend; security |
| US-FE-F01-02 | Cadastro profissional autonomo | F01 | P0 | 02 | US-BE-F01-02 | frontend; security |
| US-FE-F01-03 | Cadastro clinica | F01 | P0 | 03 | US-BE-F01-03 | frontend; security |
| US-FE-F01-04a | Confirmar e-mail (abrir link) | F01 | P0 | 04 | US-BE-F01-04 | frontend; security |
| US-FE-F01-04b | Reenviar confirmacao de e-mail | F01 | P0 | 04 | US-BE-F01-04 | frontend; security |
| US-FE-F01-05a | Esqueci minha senha | F01 | P0 | 05 | US-BE-F01-05 | frontend; security |
| US-FE-F01-05b | Redefinir senha | F01 | P0 | 06 | US-BE-F01-05 | frontend; security |
| US-FE-F01-06 | Aceitar convite para clinica | F01 | P0 | 07 | US-BE-F01-06 | frontend; security |
| US-FE-F01-07a | Listar membros e convites (equipe) | F01 | P0 | 08 | US-BE-F01-07 | frontend; security |
| US-FE-F01-07b | Enviar convite (equipe) | F01 | P0 | 08 | US-BE-F01-07 | frontend; security |
| US-FE-F01-07c | Reenviar e revogar convite | F01 | P0 | 08 | US-BE-F01-07 | frontend; security |
| US-FE-F01-07d | Alterar papel do membro | F01 | P0 | 08 | US-BE-F01-07 | frontend; security |
| US-FE-F01-07e | Desativar membro (equipe) | F01 | P0 | 08 | US-BE-F01-07 | frontend; security |
| US-FE-F02-01 | Listagem e busca de pacientes | F02 | P0 | 09 | US-BE-F02-01 | frontend |
| US-FE-F02-02 | Criar e editar paciente | F02 | P0 | 10 | US-BE-F02-01 | frontend; product |
| US-FE-F02-03 | Detalhe do paciente e abas (dados, prontuario, financeiro, agendamentos) | F02 | P1 | 11 | US-BE-F02-01, F02-03 | frontend |
| US-FE-F02-04 | Vinculos paciente: listar, criar, editar | F02 | P0 | 11, 12 | US-BE-F02-02 | frontend |
| US-FE-F03-01 | Listar agendamentos (visao semana/dia) e filtros | F03 | P1 | 13, 14 | US-BE-F03-01 | frontend; product |
| US-FE-F03-02 | Criar e editar agendamento | F03 | P1 | 15 | US-BE-F03-01 | frontend; product |
| US-FE-F03-03 | Cancelar agendamento | F03 | P1 | 16 | US-BE-F03-01 | frontend |
| US-FE-F03-04 | Marcar agendamento como realizado | F03 | P1 | 16 | US-BE-F03-02 | frontend |
| US-FE-F04-01 | Listar prontuario do paciente | F04 | P1 | 17 | US-BE-F02-03, F04-01 | frontend |
| US-FE-F04-02 | Pendentes e registrar evolucao clinica | F04 | P1 | 18 | US-BE-F04-01 | frontend; product |
| US-FE-F05-01 | Listar contas a receber | F05 | P1 | 19 | US-BE-F05-01 | frontend |
| US-FE-F05-02 | Registrar baixa (pagamento) | F05 | P1 | 20 | US-BE-F05-01 | frontend |

=================================================================

## F01 — Autenticacao e Acesso

---

### US-FE-F01-01: Login (Tela 01)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** usuario da plataforma, **quero** uma tela de login com e-mail e senha, lembrar de mim e links para cadastro e "esqueci minha senha", **para** acessar o sistema com seguranca (US-04).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-04)
- docs/ui/screens.md (Tela 01 — Landing/Login)
- docs/ui/design-system.md
- docs/content/user-stories-backend.md (US-BE-F01-01 — POST /api/v1/auth/login)

**Saidas (artefatos)**:
- Pagina app/(auth)/login/page.tsx ou equivalente
- Componentes: formulario de login (Input email/senha, Checkbox, Button, Links)
- Hook ou acao que chama POST /api/v1/auth/login; tratamento de 401 e codigos INVALID_CREDENTIALS, ACCOUNT_LOCKED, EMAIL_NOT_CONFIRMED

**UX/UI**:
- **Layout**: Conforme screens.md Tela 01 (50% branding / 50% formulario).
- **Componentes**: Input (email, password com toggle visibilidade), Checkbox, Button (primary), Separator, Link (design-system).
- **Estados**: Vazio (placeholders); Loading (botao com Spinner, desabilitado); Erro credenciais → Toast destructive; Erro bloqueado → Alert destructive inline; Erro e-mail nao confirmado → Alert + link Reenviar; Validacao inline (e-mail formato, senha obrigatoria).
- **Acoes**: Submit chama POST /api/v1/auth/login; links para /esqueci-senha, /cadastro/autonomo, /cadastro/clinica.
- **Acessibilidade**: Foco no campo e-mail ao montar; navegacao por Tab; Escape nao fecha tela (publica).

**Criterios de aceite**:
- [ ] Rota /login exibe layout e componentes conforme docs/ui/screens.md Tela 01
- [ ] POST /api/v1/auth/login chamado ao submeter; loading e desabilitacao durante request
- [ ] 401 com INVALID_CREDENTIALS exibe Toast destructive com mensagem adequada
- [ ] 401 com ACCOUNT_LOCKED e EMAIL_NOT_CONFIRMED exibem Alert inline conforme spec
- [ ] Links para esqueci senha e cadastros navegam para rotas corretas
- [ ] Design-system (cores, componentes shadcn) respeitado
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-02: Cadastro profissional autonomo (Tela 02)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** profissional autonomo, **quero** um formulario de cadastro em etapas (dados pessoais, dados profissionais, termos LGPD) que envie meus dados e crie minha conta, **para** comecar a usar a plataforma (US-01).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-01)
- docs/ui/screens.md (Tela 02 — Cadastro autonomo)
- docs/ui/design-system.md
- docs/content/user-stories-backend.md (US-BE-F01-02 — POST /api/v1/auth/register/autonomo)

**Saidas (artefatos)**:
- Pagina app/(auth)/cadastro/autonomo/page.tsx
- Componentes: stepper, formularios por etapa (Input, Select, Checkbox), Card
- Chamada POST /api/v1/auth/register/autonomo; tratamento 201, 400 (EMAIL_ALREADY_EXISTS, CPF_ALREADY_EXISTS)

**UX/UI**:
- **Layout**: Conforme screens.md Tela 02 (header + Card max-w-2xl, stepper horizontal 3 etapas).
- **Componentes**: Input (nome, email, telefone, CPF com mascara, senha com indicador forca), Select (tipo profissional, conselho, UF), Checkbox (termo LGPD), Button (primary/ghost).
- **Estados**: Vazio; Loading no submit; Erro 400 com codigo → Alert ou Toast; Validacao inline (CPF, email, senha forte).
- **Acessibilidade**: Foco na primeira etapa; Tab entre campos; rotulos associados.

**Criterios de aceite**:
- [ ] Stepper e etapas conforme screens.md Tela 02
- [ ] POST register/autonomo com body completo; 201 redireciona ou exibe sucesso; 400 exibe codigo EMAIL_ALREADY_EXISTS ou CPF_ALREADY_EXISTS
- [ ] CPF e termo LGPD validados no cliente; design-system respeitado
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-03: Cadastro clinica (Tela 03)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** admin de clinica, **quero** um formulario de cadastro da clinica e do administrador que crie o tenant e envie confirmacao por e-mail, **para** criar minha clinica na plataforma (US-02).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-02)
- docs/ui/screens.md (Tela 03 — Cadastro clinica)
- docs/ui/design-system.md
- docs/content/user-stories-backend.md (US-BE-F01-03 — POST /api/v1/auth/register/clinica)

**Saidas (artefatos)**:
- Pagina app/(auth)/cadastro/clinica/page.tsx
- Formulario (razao social, CNPJ, endereco, telefone, dados admin, termo LGPD); POST register/clinica
- Tratamento 201, 400 (CNPJ_ALREADY_EXISTS)

**UX/UI**:
- **Layout**: Conforme screens.md Tela 03 (header + Card, etapas se aplicavel).
- **Componentes**: Input com mascara CNPJ, endereco, dados admin, Checkbox LGPD, Button.
- **Estados**: Vazio; Loading; Erro 400 CNPJ_ALREADY_EXISTS; validacao CNPJ e campos obrigatorios.

**Criterios de aceite**:
- [ ] POST register/clinica com body correto; 201 ou 400 com codigo; design-system e validacao CNPJ
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-04a: Confirmar e-mail — exibir resultado (Tela 04)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** usuario, **quero** ao abrir o link de confirmacao de e-mail ver o resultado (sucesso, erro ou expirado), **para** saber se minha conta foi ativada (US-01, US-02).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-01, US-02)
- docs/ui/screens.md (Tela 04 — Confirmacao de e-mail)
- docs/content/user-stories-backend.md (US-BE-F01-04 — GET /api/v1/auth/confirm-email?token=)

**Saidas (artefatos)**:
- Pagina app/(auth)/confirmar-email/page.tsx (le query token)
- Chamada GET /api/v1/auth/confirm-email?token=xxx ao montar; exibicao de estado (sucesso | erro | expirado)

**UX/UI**:
- **Layout**: Conforme screens.md Tela 04; mensagem centralizada (Alert ou Card) com icone e texto conforme estado.
- **Estados**: Loading durante GET; Sucesso (mensagem + link para login); Erro/Expirado (mensagem + botao Reenviar ou link para reenviar).

**Criterios de aceite**:
- [ ] GET confirm-email chamado com token da URL; estado exibido conforme resposta; link para login em sucesso
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-04b: Reenviar confirmacao de e-mail (Tela 04)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** usuario, **quero** um botao ou link para reenviar o e-mail de confirmacao, **para** receber novamente o link caso nao tenha chegado (US-01, US-02).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-01, US-02)
- docs/ui/screens.md (Tela 04)
- docs/content/user-stories-backend.md (US-BE-F01-04 — POST /api/v1/auth/resend-confirmation)

**Saidas (artefatos)**:
- Botao/link "Reenviar e-mail" que chama POST /api/v1/auth/resend-confirmation
- Toast de sucesso ou tratamento de erro (TOKEN_EXPIRED, ALREADY_CONFIRMED)

**UX/UI**:
- **Componentes**: Button (variant outline ou link); Toast (sucesso/destructive).
- **Estados**: Loading apos clicar; sucesso (Toast); erro (Alert ou Toast com codigo).

**Criterios de aceite**:
- [ ] POST resend-confirmation chamado; feedback visual (Toast) em sucesso e erro; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-05a: Esqueci minha senha (Tela 05)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** usuario, **quero** informar meu e-mail para receber um link de redefinicao de senha, **para** recuperar o acesso (US-04).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-04)
- docs/ui/screens.md (Tela 05 — Esqueci senha)
- docs/content/user-stories-backend.md (US-BE-F01-05 — POST /api/v1/auth/forgot-password)

**Saidas (artefatos)**:
- Pagina app/(auth)/esqueci-senha/page.tsx; Input email, Button "Enviar"
- POST /api/v1/auth/forgot-password (body: email); mensagem generica de sucesso (seguranca)

**UX/UI**:
- **Layout**: Conforme screens.md Tela 05; formulario simples (e-mail + botao).
- **Estados**: Vazio; Loading; Sucesso (mensagem "Se o e-mail existir, voce recebera o link"); validacao formato e-mail.

**Criterios de aceite**:
- [ ] POST forgot-password com email; mensagem de sucesso generica; link de volta para login; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-05b: Redefinir senha (Tela 06)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** usuario, **quero** informar minha nova senha (e confirmacao) na tela aberta pelo link de redefinicao, **para** alterar minha senha e acessar novamente (US-04).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-04)
- docs/ui/screens.md (Tela 06 — Redefinir senha)
- docs/content/user-stories-backend.md (US-BE-F01-05 — PUT /api/v1/auth/reset-password)

**Saidas (artefatos)**:
- Pagina app/(auth)/redefinir-senha/page.tsx (token na URL); Input senha, confirmar senha, Button
- PUT /api/v1/auth/reset-password (token, newPassword, confirmPassword); redirecionar para login em sucesso; tratar token invalido/expirado

**UX/UI**:
- **Layout**: Conforme screens.md Tela 06; formulario nova senha + confirmar.
- **Estados**: Loading; Erro token invalido/expirado (Alert); Sucesso (redirect ou mensagem + link login); validacao senha forte e match.

**Criterios de aceite**:
- [ ] PUT reset-password com token da URL e senhas; sucesso redireciona para /login; erro de token exibido; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-06: Aceitar convite para clinica (Tela 07)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** convidado, **quero** uma tela que exiba os dados do convite e permita aceitar (preenchendo dados e LGPD se novo, ou confirmando se ja tenho conta), **para** entrar na clinica com o papel atribuido (US-03).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-03)
- docs/ui/screens.md (Tela 07 — Aceitar convite)
- docs/content/user-stories-backend.md (US-BE-F01-06 — POST /api/v1/auth/accept-invite)

**Saidas (artefatos)**:
- Pagina app/(auth)/convite/page.tsx (token query); formulario (usuario novo: senha, LGPD) ou confirmacao (usuario existente)
- POST /api/v1/auth/accept-invite; redirecionar para dashboard ou login; tratar INVITE_EXPIRED

**UX/UI**:
- **Layout**: Conforme screens.md Tela 07; Card com dados do convite (clinica, papel); formulario ou botao "Aceitar".
- **Estados**: Loading; Convite expirado (Alert + codigo); Sucesso (redirect + Toast); validacao LGPD e senha se novo.

**Criterios de aceite**:
- [ ] Token da URL enviado no POST accept-invite; 200 redireciona; 400 INVITE_EXPIRED exibido; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-07a: Listar membros e convites (Tela 08)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** admin de clinica, **quero** ver a lista de membros da equipe e de convites pendentes, **para** gerir acessos e papeis (US-03).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-03)
- docs/ui/screens.md (Tela 08 — Gestao de convites)
- docs/content/user-stories-backend.md (US-BE-F01-07 — GET /api/v1/team/members, GET /api/v1/team/invites, GET /api/v1/team/professionals)

**Saidas (artefatos)**:
- Secao da pagina /configuracoes/equipe que exibe tabela/cards de membros e convites
- Chamadas GET members, GET invites (e GET professionals se usado na mesma tela para dropdowns); Skeleton durante loading

**UX/UI**:
- **Layout**: Conforme screens.md Tela 08; tabela ou lista (nome, e-mail, papel, status, data convite).
- **Estados**: Vazio (mensagem "Nenhum membro" / "Nenhum convite"); Loading (Skeleton); Erro (Alert + retry).

**Criterios de aceite**:
- [ ] GET members e GET invites consumidos; dados exibidos conforme spec; design-system e estados vazio/loading/erro
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-07b: Enviar convite (Tela 08)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** admin de clinica, **quero** um formulario ou botao que permita enviar convite por e-mail com papel (medico, psicologo, secretaria), **para** convidar pessoas para a clinica (US-03).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-03)
- docs/ui/screens.md (Tela 08)
- docs/content/user-stories-backend.md (US-BE-F01-07 — POST /api/v1/team/invites)

**Saidas (artefatos)**:
- Dialog ou secao com Input email, Select papel, Button "Enviar convite"
- POST /api/v1/team/invites (body: email, role); 201 ou 400; Toast sucesso; tratamento de erro

**UX/UI**:
- **Componentes**: Dialog, Input, Select (role), Button primary.
- **Estados**: Loading; Sucesso (Toast + fechar dialog + atualizar lista); Erro (mensagem inline ou Toast).

**Criterios de aceite**:
- [ ] POST invites com email e role; feedback e atualizacao da lista; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-07c: Reenviar e revogar convite (Tela 08)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** admin de clinica, **quero** botoes para reenviar ou revogar um convite pendente, **para** controlar os convites enviados (US-03).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-03)
- docs/ui/screens.md (Tela 08)
- docs/content/user-stories-backend.md (US-BE-F01-07 — POST invites/[id]/resend, DELETE invites/[id])

**Saidas (artefatos)**:
- Botoes "Reenviar" e "Revogar" por convite; POST resend e DELETE; confirmacao antes de revogar (opcional); Toast/feedback

**UX/UI**:
- **Componentes**: Button (ghost ou outline), Dialog confirm para revogar.
- **Estados**: Loading por acao; Sucesso (Toast); Erro (Toast com codigo).

**Criterios de aceite**:
- [ ] POST resend e DELETE chamados com id do convite; lista atualizada apos acao; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-07d: Alterar papel do membro (Tela 08)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** admin de clinica, **quero** alterar o papel de um membro (medico, secretaria, etc.), **para** ajustar permissoes (US-03).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-03)
- docs/ui/screens.md (Tela 08)
- docs/content/user-stories-backend.md (US-BE-F01-07 — PUT /api/v1/team/members/[id]/role)

**Saidas (artefatos)**:
- Select ou Dropdown de papel por membro; PUT members/[id]/role (body: role); 200 ou 403; Toast/feedback

**UX/UI**:
- **Componentes**: Select (role), Button ou salvar ao mudar.
- **Estados**: Loading; Sucesso; Erro 403 (sem permissao).

**Criterios de aceite**:
- [ ] PUT role com id do membro e novo role; feedback e atualizacao; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F01-07e: Desativar membro (Tela 08)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/security.agent.md`

**Como** admin de clinica, **quero** desativar um membro da equipe (impedir acesso), **para** remover pessoas que nao fazem mais parte da clinica (US-03).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-03)
- docs/ui/screens.md (Tela 08)
- docs/content/user-stories-backend.md (US-BE-F01-07 — PUT /api/v1/team/members/[id]/deactivate)

**Saidas (artefatos)**:
- Botao "Desativar" por membro; confirmacao (Dialog); PUT members/[id]/deactivate; 200 ou 403; lista atualizada

**UX/UI**:
- **Componentes**: Button (variant destructive ou outline), Dialog de confirmacao.
- **Estados**: Loading; Sucesso (Toast + atualizar lista); Erro 403.

**Criterios de aceite**:
- [ ] PUT deactivate chamado; confirmacao antes de desativar; feedback e atualizacao; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

=================================================================

## F02 — Gestao de Pacientes

---

### US-FE-F02-01: Listagem e busca de pacientes (Tela 09)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`

**Como** usuario, **quero** ver uma lista de pacientes com busca por nome, CPF ou telefone e paginacao, **para** encontrar e acessar cadastros (US-05, US-07).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-05, US-07)
- docs/ui/screens.md (Tela 09 — Lista de pacientes)
- docs/content/user-stories-backend.md (US-BE-F02-01 — GET /api/v1/patients?search=&page=&limit=)

**Saidas (artefatos)**:
- Pagina app/pacientes/page.tsx; Input busca (debounce), tabela/lista, paginacao
- GET /api/v1/patients com search e paginacao; Skeleton; estados vazio e erro

**UX/UI**:
- **Layout**: App shell + header "Pacientes" + barra de busca + tabela/cards; conforme screens.md Tela 09.
- **Componentes**: Input (busca), Table ou Card list, Pagination, Button "Novo paciente".
- **Estados**: Vazio ("Nenhum paciente"); Loading (Skeleton); Erro (Alert + retry).

**Criterios de aceite**:
- [ ] GET patients com search e page/limit; listagem e busca funcionais; link para /pacientes/novo e /pacientes/[id]; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F02-02: Criar e editar paciente (Tela 10)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/product.agent.md`

**Como** usuario, **quero** um formulario para cadastrar um novo paciente ou editar um existente, **para** manter dados atualizados (US-05).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-05)
- docs/ui/screens.md (Tela 10 — Cadastro/edicao paciente)
- docs/content/user-stories-backend.md (US-BE-F02-01 — POST /api/v1/patients, PUT /api/v1/patients/[id])

**Saidas (artefatos)**:
- Paginas app/pacientes/novo/page.tsx e app/pacientes/[id]/editar/page.tsx; formulario (nome, CPF, telefone, etc.)
- POST patients (novo) e PUT patients/[id] (editar); validacao CPF; tratamento 201/200, 400 (CPF_ALREADY_EXISTS, PATIENT_NOT_FOUND)

**UX/UI**:
- **Layout**: Conforme screens.md Tela 10; Card com campos do paciente; botoes Salvar e Cancelar.
- **Componentes**: Input (com mascara CPF quando aplicavel), Button; validacao Zod; erros da API exibidos (codigo estavel).
- **Estados**: Loading; Erro 400 com codigo; validacao inline.

**Criterios de aceite**:
- [ ] POST e PUT com body correto; CPF validado; codigos CPF_ALREADY_EXISTS e PATIENT_NOT_FOUND tratados; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F02-03: Detalhe do paciente e abas (Tela 11)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`

**Como** usuario, **quero** ver o detalhe do paciente e abas com dados, prontuario, contas a receber e agendamentos, **para** ter visao completa do cadastro (US-05, US-06, US-07).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-05, US-06, US-07)
- docs/ui/screens.md (Tela 11 — Detalhe do paciente)
- docs/content/user-stories-backend.md (US-BE-F02-01 GET patient, US-BE-F02-03 GET records, receivables, appointments)

**Saidas (artefatos)**:
- Pagina app/pacientes/[id]/page.tsx; Tabs (Dados, Vinculos, Prontuario, Financeiro, Agendamentos)
- GET /api/v1/patients/[id]; GET patients/[id]/records, receivables, appointments por aba; 404 tratado

**UX/UI**:
- **Layout**: Conforme screens.md Tela 11; cabecalho com nome do paciente; Tabs; conteudo por aba.
- **Componentes**: Tabs (shadcn), Card, tabelas/listas por aba; Skeleton por aba ao carregar.
- **Estados**: Loading; 404 (paciente nao encontrado); vazio por aba quando nao houver dados.

**Criterios de aceite**:
- [ ] GET patient e GET records/receivables/appointments por aba; navegacao entre abas; 404 exibido; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F02-04: Vinculos paciente — listar, criar, editar (Telas 11, 12)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`

**Como** usuario, **quero** na aba Vinculos listar vinculos do paciente, criar novo (profissional + tarifa) e editar tarifa existente, **para** vincular pacientes a profissionais e definir valores (US-06).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-06)
- docs/ui/screens.md (Tela 11 aba Vinculos, Tela 12 Dialog vinculo)
- docs/content/user-stories-backend.md (US-BE-F02-02 — GET/POST/PUT links)

**Saidas (artefatos)**:
- Lista de vinculos na aba; Dialog (Tela 12) com Select profissional, Input valor, Select tipo (sessao/hora); GET links, POST links, PUT links/[id]
- Tratamento DUPLICATE_LINK, TARIFF_REQUIRED; GET /api/v1/team/professionals para Select

**UX/UI**:
- **Layout**: Conforme screens.md Tela 12 (dialog); lista na aba com botoes "Novo vinculo" e "Editar".
- **Componentes**: Dialog, Select (profissional, tipo), Input (valor), Button; Toast/Alert para erros.
- **Estados**: Loading; Erro 400 DUPLICATE_LINK, TARIFF_REQUIRED; sucesso (fechar dialog, atualizar lista).

**Criterios de aceite**:
- [ ] GET links exibe lista; POST e PUT com body correto; codigos de erro exibidos; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

=================================================================

## F03 — Agendamento

---

### US-FE-F03-01: Listar agendamentos (visao semana/dia) e filtros (Telas 13, 14)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/product.agent.md`

**Como** usuario, **quero** ver a agenda em visao semanal ou diaria com filtro por profissional (clinica), navegacao de periodo e slots com agendamentos, **para** visualizar e gerenciar a agenda (US-08, US-12).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-08, US-12)
- docs/ui/screens.md (Telas 13, 14 — Agenda)
- docs/content/user-stories-backend.md (US-BE-F03-01 — GET /api/v1/appointments?startDate=&endDate=&professionalId=)

**Saidas (artefatos)**:
- Pagina app/agenda/page.tsx; grid semana/dia; navegacao (setas, "Hoje"); Select profissional; GET appointments com startDate, endDate, professionalId
- Clique em slot vazio abre dialog criar (Tela 15); clique em agendamento abre dialog detalhe (Tela 16); cores por status conforme screens.md

**UX/UI**:
- **Layout**: Conforme screens.md Telas 13 e 14; grid (eixo X dias, eixo Y horarios); cards por agendamento com nome paciente, horario, tipo, status.
- **Componentes**: ToggleGroup (Dia/Semana), Select profissional, botoes navegacao, grid, Card por agendamento; Skeleton do grid.
- **Estados**: Vazio ("Nenhum agendamento nesta semana"); Loading; Erro (Alert + retry).

**Criterios de aceite**:
- [ ] GET appointments com filtros; grid e cores por status conforme spec; navegacao e toggle; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F03-02: Criar e editar agendamento (Tela 15)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/product.agent.md`

**Como** usuario, **quero** um dialog para criar ou editar agendamento (paciente, profissional, data, hora, duracao, tipo) com validacao de sobreposicao, **para** agendar atendimentos (US-08, US-09).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-08, US-09)
- docs/ui/screens.md (Tela 15 — Dialog criar/editar agendamento)
- docs/content/user-stories-backend.md (US-BE-F03-01 — check-overlap, POST, PUT appointments)

**Saidas (artefatos)**:
- Dialog com formulario (Select paciente, profissional, DatePicker, hora, duracao, tipo); GET check-overlap em tempo real ou ao submeter; POST/PUT appointments
- Tratamento APPOINTMENT_CONFLICT, PATIENT_NOT_FOUND, NO_LINK; pre-preenchimento de dia/hora ao abrir do grid

**UX/UI**:
- **Layout**: Conforme screens.md Tela 15; Dialog com campos; botao Salvar e Cancelar.
- **Componentes**: Dialog, Select, Input (time, duration), Button; Alert para conflito.
- **Estados**: Loading; Erro APPOINTMENT_CONFLICT (mensagem clara); validacao campos e vinculo paciente-profissional.

**Criterios de aceite**:
- [ ] check-overlap usado; POST/PUT com body correto; APPOINTMENT_CONFLICT e outros codigos exibidos; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F03-03: Cancelar agendamento (Tela 16)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`

**Como** usuario, **quero** no detalhe do agendamento poder cancelar, **para** desmarcar atendimentos (US-10).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-10)
- docs/ui/screens.md (Tela 16 — Dialog detalhe agendamento)
- docs/content/user-stories-backend.md (US-BE-F03-01 — PUT /api/v1/appointments/[id]/cancel)

**Saidas (artefatos)**:
- Dialog Tela 16 com botao "Cancelar agendamento"; confirmacao; PUT appointments/[id]/cancel; 200 ou 404; atualizar grid e fechar dialog

**UX/UI**:
- **Componentes**: Dialog, Button (variant destructive ou outline), confirmacao opcional.
- **Estados**: Loading; Sucesso (Toast + fechar); Erro.

**Criterios de aceite**:
- [ ] PUT cancel chamado; confirmacao se aplicavel; feedback e atualizacao da agenda; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F03-04: Marcar agendamento como realizado (Tela 16)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`

**Como** usuario, **quero** no detalhe do agendamento marcar como realizado, **para** registrar que o atendimento ocorreu e gerar conta a receber (US-11).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-11)
- docs/ui/screens.md (Tela 16)
- docs/content/user-stories-backend.md (US-BE-F03-02 — PUT /api/v1/appointments/[id]/complete)

**Saidas (artefatos)**:
- Botao "Marcar como realizado" no dialog Tela 16; PUT appointments/[id]/complete; 200 ou 400 (se nao realizavel); Toast sucesso; atualizar grid

**UX/UI**:
- **Componentes**: Button (primary); Toast.
- **Estados**: Loading; Sucesso (mensagem "Atendimento registrado e conta a receber criada"); Erro (ex.: agendamento ja realizado ou invalido).

**Criterios de aceite**:
- [ ] PUT complete chamado; feedback e atualizacao; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

=================================================================

## F04 — Prontuario / Evolucao

---

### US-FE-F04-01: Listar prontuario do paciente (Tela 17)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`

**Como** usuario, **quero** ver a lista de evolucoes (prontuario) do paciente ordenadas por data, **para** acompanhar o historico clinico (US-13, US-14).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-13, US-14)
- docs/ui/screens.md (Tela 17 — Prontuario do paciente)
- docs/content/user-stories-backend.md (US-BE-F02-03 — GET /api/v1/patients/[id]/records)

**Saidas (artefatos)**:
- Pagina app/pacientes/[id]/prontuario/page.tsx; lista de evolucoes (data, profissional, texto, tipo); GET patients/[id]/records; Skeleton; link para registrar evolucao (atendimentos pendentes)

**UX/UI**:
- **Layout**: Conforme screens.md Tela 17; cabecalho com nome paciente; lista cronologica de evolucoes; botao "Registrar evolucao" para atendimentos pendentes.
- **Estados**: Vazio; Loading; Erro.

**Criterios de aceite**:
- [ ] GET records exibe evolucoes; navegacao para /atendimentos/[id]/evolucao quando aplicavel; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F04-02: Pendentes e registrar evolucao clinica (Tela 18)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`; `subagents/product.agent.md`

**Como** usuario, **quero** ver atendimentos sem evolucao e um formulario para registrar a evolucao (texto), **para** preencher o prontuario apos o atendimento (US-13).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-13)
- docs/ui/screens.md (Tela 18 — Formulario de evolucao)
- docs/content/user-stories-backend.md (US-BE-F04-01 — GET pending-records, POST /api/v1/appointments/[id]/record)

**Saidas (artefatos)**:
- Pagina app/atendimentos/[id]/evolucao/page.tsx; GET patients/[id]/pending-records para listar pendentes; formulario (textarea conteudo); POST appointments/[id]/record
- Tratamento EVOLUTION_ALREADY_EXISTS, 403 (profissional nao vinculado)

**UX/UI**:
- **Layout**: Conforme screens.md Tela 18; formulario com campo de texto (evolucao); botao Salvar.
- **Componentes**: Textarea, Button; validacao conteudo obrigatorio; erros da API exibidos.
- **Estados**: Loading; Erro 403 ou EVOLUTION_ALREADY_EXISTS; Sucesso (redirect ou mensagem).

**Criterios de aceite**:
- [ ] GET pending-records e POST record; codigos de erro tratados; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

=================================================================

## F05 — Financeiro (Contas a receber)

---

### US-FE-F05-01: Listar contas a receber (Tela 19)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`

**Como** usuario, **quero** ver a lista de contas a receber com filtros (periodo, paciente, profissional, status) e paginacao, **para** acompanhar e registrar baixas (US-15).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-15)
- docs/ui/screens.md (Tela 19 — Lista de contas a receber)
- docs/content/user-stories-backend.md (US-BE-F05-01 — GET /api/v1/receivables)

**Saidas (artefatos)**:
- Pagina app/financeiro/page.tsx; filtros (startDate, endDate, patientId, professionalId, status); tabela/lista; GET receivables com filtros e paginacao; botao "Registrar baixa" por item
- Skeleton; estados vazio e erro

**UX/UI**:
- **Layout**: Conforme screens.md Tela 19; filtros no topo; tabela com colunas (paciente, profissional, valor, vencimento, status, acoes).
- **Componentes**: Input/DatePicker (filtros), Select, Table, Button; Dialog baixa (Tela 20) ao clicar em registrar.
- **Estados**: Vazio; Loading; Erro.

**Criterios de aceite**:
- [ ] GET receivables com filtros; listagem e acao "Registrar baixa" abrindo dialog; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

---

### US-FE-F05-02: Registrar baixa (pagamento) (Tela 20)

**Agente(s) recomendado(s)**: `subagents/frontend.agent.md`

**Como** usuario, **quero** um dialog para registrar a baixa da conta a receber (data pagamento, forma de pagamento), **para** dar baixa nos recebimentos (US-16).

**Entradas (docs)**:
- docs/content/user-stories-mvp.md (US-16)
- docs/ui/screens.md (Tela 20 — Dialog de baixa)
- docs/content/user-stories-backend.md (US-BE-F05-01 — POST /api/v1/receivables/[id]/payment)

**Saidas (artefatos)**:
- Dialog com campos data pagamento, forma de pagamento; POST receivables/[id]/payment (body: paidAt, paymentMethod); 200 ou 400/404; Toast sucesso; lista atualizada

**UX/UI**:
- **Layout**: Conforme screens.md Tela 20; Dialog com formulario; botao Confirmar.
- **Componentes**: Dialog, Input (date), Select (paymentMethod), Button.
- **Estados**: Loading; Sucesso (Toast + fechar + atualizar lista); Erro.

**Criterios de aceite**:
- [ ] POST payment com body correto; feedback e atualizacao da lista; design-system
- [ ] Testes unitarios dos componentes/hooks desta funcionalidade passando

=================================================================

## Rastreabilidade

| US-FE | Funcionalidade | Tela(s) | US produto | US-BE |
|-------|----------------|---------|------------|-------|
| US-FE-F01-01 | Login | 01 | US-04 | US-BE-F01-01 |
| US-FE-F01-02 | Cadastro autonomo | 02 | US-01 | US-BE-F01-02 |
| US-FE-F01-03 | Cadastro clinica | 03 | US-02 | US-BE-F01-03 |
| US-FE-F01-04a | Confirmar e-mail | 04 | US-01, US-02 | US-BE-F01-04 |
| US-FE-F01-04b | Reenviar confirmacao | 04 | US-01, US-02 | US-BE-F01-04 |
| US-FE-F01-05a | Esqueci senha | 05 | US-04 | US-BE-F01-05 |
| US-FE-F01-05b | Redefinir senha | 06 | US-04 | US-BE-F01-05 |
| US-FE-F01-06 | Aceitar convite | 07 | US-03 | US-BE-F01-06 |
| US-FE-F01-07a | Listar membros e convites | 08 | US-03 | US-BE-F01-07 |
| US-FE-F01-07b | Enviar convite | 08 | US-03 | US-BE-F01-07 |
| US-FE-F01-07c | Reenviar/revogar convite | 08 | US-03 | US-BE-F01-07 |
| US-FE-F01-07d | Alterar papel | 08 | US-03 | US-BE-F01-07 |
| US-FE-F01-07e | Desativar membro | 08 | US-03 | US-BE-F01-07 |
| US-FE-F02-01 | Listagem e busca pacientes | 09 | US-05, US-07 | US-BE-F02-01 |
| US-FE-F02-02 | Criar e editar paciente | 10 | US-05 | US-BE-F02-01 |
| US-FE-F02-03 | Detalhe paciente e abas | 11 | US-05, US-06, US-07 | US-BE-F02-01, F02-03 |
| US-FE-F02-04 | Vinculos listar/criar/editar | 11, 12 | US-06 | US-BE-F02-02 |
| US-FE-F03-01 | Listar agendamentos | 13, 14 | US-08, US-12 | US-BE-F03-01 |
| US-FE-F03-02 | Criar e editar agendamento | 15 | US-08, US-09 | US-BE-F03-01 |
| US-FE-F03-03 | Cancelar agendamento | 16 | US-10 | US-BE-F03-01 |
| US-FE-F03-04 | Marcar como realizado | 16 | US-11 | US-BE-F03-02 |
| US-FE-F04-01 | Listar prontuario | 17 | US-13, US-14 | US-BE-F02-03, F04-01 |
| US-FE-F04-02 | Registrar evolucao | 18 | US-13 | US-BE-F04-01 |
| US-FE-F05-01 | Listar contas a receber | 19 | US-15 | US-BE-F05-01 |
| US-FE-F05-02 | Registrar baixa | 20 | US-16 | US-BE-F05-01 |
