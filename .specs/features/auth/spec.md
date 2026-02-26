# F01 — Autenticação e Acesso: Specification

## Problem Statement

Profissionais de saúde e clínicas precisam de acesso seguro e isolado à plataforma. Sem autenticação robusta, dados clínicos e financeiros de tenants diferentes podem vazar. Sem fluxo de convite, clínicas não conseguem onboarding de equipe.

## Goals

- [ ] Qualquer profissional ou clínica consegue se cadastrar e acessar a plataforma em < 5 minutos
- [ ] Dados de um tenant nunca são acessíveis por outro tenant (isolamento garantido)
- [ ] Admin de clínica consegue montar equipe completa via convites sem suporte manual

## Out of Scope

- OAuth / login social (Google, Apple) — não planejado para v1
- 2FA / MFA — não planejado para v1
- SSO empresarial — fora do MVP
- Validação de registro profissional (CRM, CRP) em órgão externo — apenas formato

---

## Status de Implementação (brownfield)

### Backend — IMPLEMENTADO ✅
- `POST /api/v1/auth/register/autonomo` → RegisterAutonomousUseCase
- `POST /api/v1/auth/register/clinica` → RegisterClinicUseCase
- `POST /api/v1/auth/login` → LoginUseCase (cookie httpOnly, bloqueio 5 tentativas, rememberMe)
- `GET /api/v1/auth/confirm-email?token=` → ConfirmEmailUseCase
- `POST /api/v1/auth/resend-confirmation` → ResendConfirmationUseCase
- `POST /api/v1/auth/forgot-password` → ForgotPasswordUseCase
- `PUT /api/v1/auth/reset-password` → ResetPasswordUseCase
- `GET /api/v1/auth/invite-info?token=` → inline em main.ts
- `POST /api/v1/auth/accept-invite` → AcceptInviteUseCase
- `GET /api/v1/team/members` → ListMembersUseCase
- `GET /api/v1/team/professionals` → ListProfessionalsUseCase
- `POST /api/v1/team/invites` → CreateInviteUseCase (admin only)
- `POST /api/v1/team/invites/:id/resend` → ResendInviteUseCase
- `DELETE /api/v1/team/invites/:id` → RevokeInviteUseCase
- `PUT /api/v1/team/members/:id/role` → UpdateMemberRoleUseCase
- `PUT /api/v1/team/members/:id/deactivate` → DeactivateMemberUseCase

### Backend — FALTANDO ❌
- `POST /api/v1/auth/logout` — endpoint de logout não existe
- Validação de CPF (dígitos verificadores) nos use cases de registro
- Validação de CNPJ (dígitos verificadores) nos use cases de registro
- Email service real (ConsoleEmailService é stub — emails não são enviados)

### Frontend — IMPLEMENTADO ✅
- `/login` — página de login
- `/cadastro/autonomo` — cadastro de profissional autônomo
- `/cadastro/clinica` — cadastro de clínica
- `/confirmar-email` — confirmação de e-mail via token
- `/convite` — aceite de convite
- `/esqueci-senha` — solicitação de reset
- `/redefinir-senha` — redefinição de senha via token
- `/configuracoes/equipe` — gestão de equipe (admin)

### Frontend — FALTANDO ❌
- Botão/ação de logout no header/sidebar
- Feedback de "e-mail enviado" nas telas que dependem de ConsoleEmailService

---

## User Stories

### P1: Cadastro como profissional autônomo ⭐ MVP

**User Story**: Como profissional autônomo, quero me cadastrar informando meus dados e especialidade, para criar minha conta e começar a usar a plataforma.

**Why P1**: Sem cadastro, ninguém acessa o produto. Fluxo autônomo é o caso mais simples e o primeiro a ser testado.

**Acceptance Criteria**:

1. WHEN profissional preenche nome, e-mail, telefone, CPF, senha e especialidade e aceita o termo LGPD THEN sistema SHALL criar tenant tipo "autonomous" + usuário com status `pending_confirmation`
2. WHEN CPF inválido (formato ou dígitos verificadores) é enviado THEN sistema SHALL retornar erro `VALIDATION_ERROR` com mensagem específica
3. WHEN e-mail ou CPF já cadastrado no sistema THEN sistema SHALL retornar erro `ALREADY_EXISTS`
4. WHEN cadastro bem-sucedido THEN sistema SHALL enviar e-mail de confirmação (token com 24h de validade)
5. WHEN usuário tenta fazer login sem confirmar e-mail THEN sistema SHALL retornar erro `EMAIL_NOT_CONFIRMED`
6. WHEN termo LGPD não é aceito THEN sistema SHALL bloquear o cadastro

**Independent Test**: Cadastrar autônomo via formulário → verificar que usuário existe no banco com status `pending_confirmation` → confirmar e-mail via token → fazer login com sucesso.

---

### P1: Cadastro como admin de clínica ⭐ MVP

**User Story**: Como admin de clínica, quero cadastrar minha clínica com CNPJ e dados da empresa, para criar o tenant e convidar minha equipe.

**Why P1**: Base do modelo multi-tenant para clínicas. Sem isso, apenas autônomos conseguem usar.

**Acceptance Criteria**:

1. WHEN admin preenche razão social, CNPJ, endereço, telefone, nome/e-mail/senha do admin e aceita LGPD THEN sistema SHALL criar tenant tipo "clinic" + usuário com role `admin` e status `pending_confirmation`
2. WHEN CNPJ inválido (formato ou dígitos verificadores) THEN sistema SHALL retornar erro `VALIDATION_ERROR`
3. WHEN CNPJ já cadastrado THEN sistema SHALL retornar erro `ALREADY_EXISTS`
4. WHEN cadastro bem-sucedido THEN sistema SHALL enviar e-mail de confirmação ao admin

**Independent Test**: Cadastrar clínica → confirmar e-mail → fazer login → verificar que `tenantType = 'clinic'` e `roles = ['admin']` na sessão.

---

### P1: Login com e-mail e senha ⭐ MVP

**User Story**: Como usuário da plataforma, quero fazer login com e-mail e senha, para acessar o sistema com segurança.

**Why P1**: Sem login, nada funciona. Fundação de tudo.

**Acceptance Criteria**:

1. WHEN credenciais válidas enviadas THEN sistema SHALL criar sessão via cookie `session` httpOnly e retornar `{user, tenant}`
2. WHEN e-mail não confirmado THEN sistema SHALL retornar 401 com código `EMAIL_NOT_CONFIRMED`
3. WHEN senha incorreta (< 5 tentativas) THEN sistema SHALL retornar 401 `INVALID_CREDENTIALS`
4. WHEN 5ª tentativa incorreta consecutiva THEN sistema SHALL bloquear conta por 30 minutos
5. WHEN conta bloqueada THEN sistema SHALL retornar 401 `ACCOUNT_LOCKED` com timestamp de desbloqueio
6. WHEN `rememberMe: true` THEN cookie SHALL expirar em 30 dias; sem rememberMe SHALL expirar em 1 dia
7. WHEN logout solicitado THEN sistema SHALL invalidar sessão no banco e limpar cookie ❌ **FALTANDO**

**Independent Test**: Login → verificar cookie `session` setado → fazer requisição autenticada com cookie → verificar resposta 200.

---

### P1: Confirmação de e-mail ⭐ MVP

**User Story**: Como usuário recém-cadastrado, quero confirmar meu e-mail via link, para ativar minha conta e fazer login.

**Why P1**: Garante que e-mail é válido e bloqueia acesso antes da confirmação.

**Acceptance Criteria**:

1. WHEN token válido enviado via `GET /api/v1/auth/confirm-email?token=X` THEN sistema SHALL marcar usuário como `emailConfirmed = true` e status `active`
2. WHEN token expirado (> 24h) THEN sistema SHALL retornar erro `TOKEN_EXPIRED`
3. WHEN token já usado THEN sistema SHALL retornar erro `TOKEN_ALREADY_USED`
4. WHEN usuário solicita reenvio via `POST /resend-confirmation` THEN sistema SHALL invalidar token anterior e gerar novo
5. WHEN e-mail já confirmado solicitar reenvio THEN sistema SHALL retornar erro apropriado

**Independent Test**: Cadastrar → capturar token do ConsoleEmailService (log) → chamar endpoint com token → verificar `emailConfirmed = true` no banco → login funciona.

---

### P1: Recuperação de senha ⭐ MVP

**User Story**: Como usuário que esqueceu a senha, quero receber link de redefinição por e-mail, para recuperar acesso à minha conta.

**Why P1**: Sem recuperação, usuários ficam presos. Impede churn imediato.

**Acceptance Criteria**:

1. WHEN e-mail válido enviado a `POST /forgot-password` THEN sistema SHALL gerar token de reset (1h validade) e "enviar" e-mail — resposta sempre 200 (não revela se e-mail existe)
2. WHEN token válido + nova senha enviados a `PUT /reset-password` THEN sistema SHALL atualizar hash da senha e invalidar token
3. WHEN token expirado ou já usado THEN sistema SHALL retornar erro `TOKEN_EXPIRED` / `TOKEN_ALREADY_USED`
4. WHEN nova senha e confirmação não coincidem THEN sistema SHALL retornar erro `PASSWORD_MISMATCH`

**Independent Test**: Solicitar reset → capturar token → redefinir senha → login com nova senha funciona; login com senha antiga falha.

---

### P1: Convite e aceite de membro da equipe ⭐ MVP

**User Story**: Como admin de clínica, quero convidar profissionais e secretárias por e-mail atribuindo um papel, para que eles acessem o sistema com as permissões corretas.

**Why P1**: Sem convites, clínicas não conseguem onboarding de equipe — produto não funciona para esse segmento.

**Acceptance Criteria**:

1. WHEN admin envia `POST /team/invites` com e-mail e role THEN sistema SHALL criar convite com token único (7 dias de validade) e "enviar" e-mail
2. WHEN não-admin tenta criar convite THEN sistema SHALL retornar 403 `FORBIDDEN`
3. WHEN convidado acessa link e já tem conta THEN sistema SHALL adicionar role ao usuário existente sem criar novo
4. WHEN convidado acessa link e não tem conta THEN sistema SHALL criar usuário com nome/senha informados no aceite
5. WHEN convite expirado THEN sistema SHALL retornar erro `INVITE_EXPIRED`
6. WHEN admin revoga convite THEN sistema SHALL marcar convite como revogado; link não funciona mais
7. WHEN convidado aceita THEN sistema SHALL gravar consentimento LGPD se for novo usuário

**Independent Test**: Admin cria convite → `GET /invite-info?token=X` retorna dados da clínica → `POST /accept-invite` → novo usuário consegue fazer login com role correto.

---

### P2: Gestão de membros da equipe

**User Story**: Como admin de clínica, quero visualizar, alterar papéis e desativar membros, para manter controle de acesso da equipe.

**Why P2**: Importante mas não bloqueia uso inicial — equipe pode ser gerenciada depois do lançamento.

**Acceptance Criteria**:

1. WHEN admin acessa `GET /team/members` THEN sistema SHALL retornar lista de membros ativos e convites pendentes do tenant
2. WHEN admin altera role de membro via `PUT /team/members/:id/role` THEN sistema SHALL atualizar role; não pode rebaixar o último admin
3. WHEN admin desativa membro via `PUT /team/members/:id/deactivate` THEN sistema SHALL marcar como inativo; sessões existentes continuam até expirar
4. WHEN admin tenta desativar a si mesmo THEN sistema SHALL retornar erro

**Independent Test**: Admin lista membros → altera role de um membro → membro com role novo consegue acessar endpoints correspondentes; com role antigo não consegue.

---

## Edge Cases

- WHEN sessão expirada e usuário faz requisição autenticada THEN sistema SHALL retornar 401 e limpar cookie
- WHEN mesmo e-mail cadastrado em dois tenants diferentes THEN sistema SHALL retornar erro — e-mail é único globalmente na tabela `users` (restrição `@@unique([tenantId, email])`)
- WHEN token de confirmação gerado e usuário solicita reenvio imediatamente THEN sistema SHALL gerar novo token e o anterior deve ser inativado
- WHEN usuário bloqueado e período de 30min expira THEN próximo login bem-sucedido SHALL limpar `lockedUntil` e `failedLoginAttempts`

---

## Success Criteria

- [ ] Fluxo completo autônomo (cadastro → confirmação → login) funciona end-to-end
- [ ] Fluxo completo clínica (cadastro → confirmação → login → convite → aceite → login convidado) funciona end-to-end
- [ ] Dados de tenant A nunca aparecem em requisições autenticadas de tenant B
- [ ] Logout invalida sessão — token não funciona após logout ❌ **(requer implementação)**
- [ ] CPF e CNPJ validados com dígitos verificadores ❌ **(requer implementação)**
- [ ] Email service real integrado para envio de e-mails transacionais ❌ **(requer implementação)**
