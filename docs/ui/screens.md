# Especificacao de Telas — UI Screens

**Fonte**: docs/content/user-stories-mvp.md, docs/content/onboarding-flows.md, docs/domain/domain-rules.md
**Design System**: docs/ui/design-system.md
**Status**: Especificado — P0 e P1 completos; P2/P3 pendentes
**Ultima atualizacao**: 2026-02-17

**Stack de frontend**: Next.js + shadcn/ui + Tailwind CSS
**Paleta**: tons de emerald (verde/wellness)
**Plataforma**: desktop only
**App shell**: sidebar (280px, collapsivel) + header + content area

=================================================================

## Inventario de telas

| # | Tela | Rota | Feature | User Stories | Prioridade |
|---|------|------|---------|-------------|------------|
| 01 | Landing / Login | `/login` | F01 | US-04 | P0 |
| 02 | Cadastro profissional autonomo | `/cadastro/autonomo` | F01 | US-01 | P0 |
| 03 | Cadastro clinica | `/cadastro/clinica` | F01 | US-02 | P0 |
| 04 | Confirmacao de e-mail | `/confirmar-email?token=xxx` | F01 | US-01, US-02 | P0 |
| 05 | Esqueci minha senha | `/esqueci-senha` | F01 | US-04 | P0 |
| 06 | Redefinir senha | `/redefinir-senha?token=xxx` | F01 | US-04 | P0 |
| 07 | Convite para clinica (aceite) | `/convite?token=xxx` | F01 | US-03 | P0 |
| 08 | Gestao de convites (admin) | `/configuracoes/equipe` | F01 | US-03 | P0 |
| 09 | Lista de pacientes | `/pacientes` | F02 | US-05, US-07 | P0 |
| 10 | Cadastro/edicao de paciente | `/pacientes/novo`, `/pacientes/[id]/editar` | F02 | US-05 | P0 |
| 11 | Detalhe do paciente | `/pacientes/[id]` | F02 | US-05, US-06, US-07 | P0 |
| 12 | Dialog de vinculo + tarifa | Dialog (dentro de Tela 11) | F02 | US-06 | P0 |
| 13 | Agenda — Visao semanal | `/agenda` | F03 | US-08, US-12 | P1 |
| 14 | Agenda — Visao diaria | `/agenda?view=day` | F03 | US-12 | P1 |
| 15 | Dialog de criar/editar agendamento | Dialog (dentro de Tela 13/14) | F03 | US-08, US-09 | P1 |
| 16 | Dialog de detalhe do agendamento | Dialog (dentro de Tela 13/14) | F03 | US-10, US-11 | P1 |
| 17 | Prontuario do paciente | `/pacientes/[id]/prontuario` | F04 | US-13, US-14 | P1 |
| 18 | Formulario de evolucao | `/atendimentos/[id]/evolucao` | F04 | US-13 | P1 |
| 19 | Lista de contas a receber | `/financeiro` | F05 | US-15 | P1 |
| 20 | Dialog de baixa (pagamento) | Dialog (dentro de Tela 19) | F05 | US-16 | P1 |

=================================================================

## P0 — Feature F01: Autenticacao e Acesso

---

### Tela 01: Landing / Login
**Feature**: F01 | **User Stories**: US-04
**Rota**: `/login`
**Acesso**: publico (usuario nao autenticado)

**Layout**:

```
+------------------------------------------------------------------+
|                                                                  |
|  +---------------------------+  +------------------------------+ |
|  |                           |  |                              | |
|  |       BRANDING            |  |    FORMULARIO DE LOGIN       | |
|  |                           |  |                              | |
|  |   [Logo da plataforma]    |  |  E-mail                     | |
|  |                           |  |  +------------------------+  | |
|  |   "Prontuario Autonomo"   |  |  | Input: email           |  | |
|  |   Tagline: "Gestao         |  |  +------------------------+  | |
|  |   inteligente para         |  |                              | |
|  |   profissionais de saude"  |  |  Senha                      | |
|  |                           |  |  +------------------------+  | |
|  |   [Ilustracao de saude/   |  |  | Input: password        |  | |
|  |    wellness em tons de    |  |  +------------------------+  | |
|  |    emerald]               |  |                              | |
|  |                           |  |  [ ] Lembrar de mim          | |
|  |                           |  |                              | |
|  |                           |  |  [Esqueci minha senha ->]    | |
|  |                           |  |                              | |
|  |                           |  |  +------------------------+  | |
|  |                           |  |  | BTN: Entrar (primary)  |  | |
|  |                           |  |  +------------------------+  | |
|  |                           |  |                              | |
|  |                           |  |  ---------- ou ----------    | |
|  |                           |  |                              | |
|  |                           |  |  Cadastrar como profissional | |
|  |                           |  |  Cadastrar clinica           | |
|  |                           |  |                              | |
|  +---------------------------+  +------------------------------+ |
|          50% width                       50% width               |
+------------------------------------------------------------------+
```

**Componentes**:
- `Input` (type email) — campo de e-mail do usuario
- `Input` (type password) — campo de senha com icone toggle de visibilidade
- `Checkbox` — "Lembrar de mim" para persistir sessao
- `Button` (variant primary, full width) — "Entrar", dispara autenticacao
- `Separator` — divide login de links de cadastro
- `Link` — "Esqueci minha senha" navega para `/esqueci-senha`
- `Link` — "Cadastrar como profissional" navega para `/cadastro/autonomo`
- `Link` — "Cadastrar clinica" navega para `/cadastro/clinica`

**Dados exibidos**:
- Logo da plataforma: imagem estatica
- Tagline: texto estatico
- Ilustracao: imagem estatica (tema saude/wellness)

**Acoes do usuario**:
- Preencher e-mail e senha + clicar "Entrar" -> POST /auth/login -> redireciona para `/dashboard`
- Marcar "Lembrar de mim" -> sessao persistida por 30 dias (cookie httpOnly)
- Clicar "Esqueci minha senha" -> navega para `/esqueci-senha`
- Clicar "Cadastrar como profissional" -> navega para `/cadastro/autonomo`
- Clicar "Cadastrar clinica" -> navega para `/cadastro/clinica`

**Estados**:
- **Vazio**: formulario limpo com placeholders nos inputs ("seu@email.com", "Sua senha")
- **Loading**: botao "Entrar" exibe Spinner interno + desabilitado; inputs desabilitados
- **Erro (credenciais invalidas)**: Toast (variant destructive) no canto superior direito: "E-mail ou senha invalidos"
- **Erro (conta bloqueada)**: mensagem inline abaixo do formulario (Alert variant destructive): "Conta bloqueada temporariamente apos 5 tentativas. Tente novamente em 15 minutos ou redefina sua senha."
- **Erro (e-mail nao confirmado)**: Alert inline: "Confirme seu e-mail antes de acessar. [Reenviar e-mail]"
- **Validacao**: inline — e-mail (formato invalido), senha (campo obrigatorio)

---

### Tela 02: Cadastro profissional autonomo
**Feature**: F01 | **User Stories**: US-01
**Rota**: `/cadastro/autonomo`
**Acesso**: publico (usuario nao autenticado)

**Layout**:

```
+------------------------------------------------------------------+
|                          HEADER (logo + link "Ja tenho conta")   |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------------------------------------------------+ |
|  |                        CARD (max-w-2xl, mx-auto)            | |
|  |                                                             | |
|  |  Titulo: "Criar conta como profissional"                    | |
|  |                                                             | |
|  |  +--------+  +--------+  +--------+                        | |
|  |  | ETAPA 1|  | ETAPA 2|  | ETAPA 3|   (Stepper horizontal) | |
|  |  | Dados  |  | Dados  |  | Termos |                        | |
|  |  |pessoais|  | profis.|  |        |                        | |
|  |  +--------+  +--------+  +--------+                        | |
|  |    (ativa)    (inativa)   (inativa)                         | |
|  |                                                             | |
|  |  +----- CONTEUDO DA ETAPA ATIVA -----------------------+   | |
|  |  |                                                      |   | |
|  |  | ETAPA 1: Dados pessoais                              |   | |
|  |  |                                                      |   | |
|  |  | Nome completo          [Input obrigatorio         ]  |   | |
|  |  | E-mail                 [Input type email           ]  |   | |
|  |  | Telefone               [Input com mascara (XX)XXXXX]  |   | |
|  |  | CPF                    [Input com mascara XXX.XXX.XX]  |   | |
|  |  | Senha                  [Input type password        ]  |   | |
|  |  |                        (indicador de forca abaixo)    |   | |
|  |  | Confirmar senha        [Input type password        ]  |   | |
|  |  |                                                      |   | |
|  |  +------------------------------------------------------+   | |
|  |                                                             | |
|  |  ETAPA 2: Dados profissionais                               | |
|  |  +------------------------------------------------------+   | |
|  |  | Tipo de profissional   [Select: psicologo, fisio...  ]  | |
|  |  | Conselho profissional  [Select: CRP, CRM, CREFITO...]  | |
|  |  | Numero do registro     [Input                        ]  | |
|  |  | UF do registro         [Select: UFs brasileiras      ]  | |
|  |  | Endereco de atendimento                                | |
|  |  |   CEP                  [Input com mascara + busca    ]  | |
|  |  |   Rua                  [Input (auto-preenchido)      ]  | |
|  |  |   Numero               [Input                        ]  | |
|  |  |   Complemento          [Input (opcional)             ]  | |
|  |  |   Bairro               [Input (auto-preenchido)      ]  | |
|  |  |   Cidade               [Input (auto-preenchido)      ]  | |
|  |  |   UF                   [Select (auto-preenchido)     ]  | |
|  |  +------------------------------------------------------+   | |
|  |                                                             | |
|  |  ETAPA 3: Termos                                            | |
|  |  +------------------------------------------------------+   | |
|  |  | +--------------------------------------------------+  |   | |
|  |  | | ScrollArea (h-64)                                 |  |   | |
|  |  | | Texto completo do Termo de Consentimento LGPD     |  |   | |
|  |  | | ...                                               |  |   | |
|  |  | +--------------------------------------------------+  |   | |
|  |  |                                                      |   | |
|  |  | [ ] Li e aceito o Termo de Consentimento (obrig.)    |   | |
|  |  +------------------------------------------------------+   | |
|  |                                                             | |
|  |         [BTN: Voltar (outline)]  [BTN: Proximo (primary)]   | |
|  |                        ou na etapa 3:                       | |
|  |         [BTN: Voltar (outline)]  [BTN: Criar conta (prim)] | |
|  |                                                             | |
|  +------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

**Componentes**:
- `Card` — container principal centralizado (max-w-2xl)
- Stepper customizado (3 etapas) — indicador visual de progresso horizontal com numeros, labels e estado (ativa, completa, inativa)
- `Input` — nome completo (obrigatorio, min 3 chars)
- `Input` (type email) — e-mail com validacao async de unicidade
- `Input` (com mascara) — telefone, formato (XX) XXXXX-XXXX
- `Input` (com mascara) — CPF, formato XXX.XXX.XXX-XX, validacao de digitos
- `Input` (type password) — senha com indicador de forca (barra colorida: fraca/media/forte)
- `Input` (type password) — confirmar senha
- `Select` — tipo de profissional (psicologo, fisioterapeuta, massoterapeuta, medico)
- `Select` — conselho profissional (CRP, CRM, CREFITO, CREFONO, outro)
- `Input` — numero do registro profissional
- `Select` — UF do registro (27 estados brasileiros)
- `Input` (com mascara) — CEP com auto-preenchimento via API (ViaCEP)
- Inputs de endereco — rua, numero, complemento, bairro, cidade, UF
- `ScrollArea` (h-64) — texto do termo de consentimento LGPD
- `Checkbox` — aceite obrigatorio do termo LGPD
- `Button` (variant outline) — "Voltar" (volta para etapa anterior)
- `Button` (variant primary) — "Proximo" (avanca etapa) ou "Criar conta" (submit final)

**Dados exibidos**:
- Texto do termo de consentimento LGPD: carregado da API (versionado)
- Lista de UFs: dados estaticos
- Tipos de profissional: dados estaticos
- Conselhos profissionais: dados estaticos

**Acoes do usuario**:
- Preencher etapa 1 + clicar "Proximo" -> valida campos, avanca para etapa 2
- Preencher etapa 2 + clicar "Proximo" -> valida campos, avanca para etapa 3
- Ler termo + marcar checkbox + clicar "Criar conta" -> POST /auth/register/autonomo -> redireciona para tela de confirmacao ("E-mail enviado")
- Clicar "Voltar" em qualquer etapa -> volta para etapa anterior preservando dados
- Clicar "Ja tenho conta" no header -> navega para `/login`

**Estados**:
- **Vazio**: etapa 1 ativa, campos vazios com placeholders
- **Loading**: botao "Criar conta" com Spinner + desabilitado; formulario desabilitado
- **Erro (submit)**: Toast (variant destructive) para erros de servidor
- **Validacao**:
  - CPF: inline — "CPF invalido" (formato ou digitos) ou "CPF ja cadastrado" (async)
  - E-mail: inline — "E-mail invalido" ou "E-mail ja cadastrado" (async, debounce 500ms)
  - Senha: inline — "Minimo 8 caracteres, 1 maiuscula e 1 numero" + barra de forca visual
  - Confirmar senha: inline — "As senhas nao conferem"
  - Telefone: inline — "Telefone invalido"
  - Checkbox LGPD: inline — "O aceite do termo e obrigatorio"
- **Sucesso (apos submit)**: Card centralizado com icone de e-mail (Mail icon) + "Verifique seu e-mail" + "Enviamos um link de confirmacao para [email]. Verifique sua caixa de entrada e clique no link para ativar sua conta." + botao "Reenviar e-mail" (outline, aparece apos 30s)

---

### Tela 03: Cadastro clinica
**Feature**: F01 | **User Stories**: US-02
**Rota**: `/cadastro/clinica`
**Acesso**: publico (usuario nao autenticado)

**Layout**:

```
+------------------------------------------------------------------+
|                          HEADER (logo + link "Ja tenho conta")   |
+------------------------------------------------------------------+
|                                                                  |
|  +------------------------------------------------------------+ |
|  |                        CARD (max-w-2xl, mx-auto)            | |
|  |                                                             | |
|  |  Titulo: "Criar conta para clinica"                         | |
|  |                                                             | |
|  |  +------+  +------+  +------+  +------+                    | |
|  |  |ETAPA1|  |ETAPA2|  |ETAPA3|  |ETAPA4|  (Stepper, 4 etap) | |
|  |  |Dados |  |Dados |  |Perso-|  |Termos|                    | |
|  |  |admin |  |clinic|  |naliz.|  |      |                    | |
|  |  +------+  +------+  +------+  +------+                    | |
|  |                                                             | |
|  |  +----- CONTEUDO DA ETAPA ATIVA -----------------------+   | |
|  |  |                                                      |   | |
|  |  | ETAPA 1: Dados do administrador                      |   | |
|  |  |                                                      |   | |
|  |  | Nome completo          [Input obrigatorio         ]  |   | |
|  |  | E-mail                 [Input type email           ]  |   | |
|  |  | Telefone               [Input com mascara          ]  |   | |
|  |  | CPF                    [Input com mascara + valid.  ]  |   | |
|  |  | Senha                  [Input type password        ]  |   | |
|  |  | Confirmar senha        [Input type password        ]  |   | |
|  |  |                                                      |   | |
|  |  | ETAPA 2: Dados da clinica                             |   | |
|  |  |                                                      |   | |
|  |  | Razao social           [Input obrigatorio          ]  |   | |
|  |  | CNPJ                   [Input mascara XX.XXX.XXX/.. ]  |   | |
|  |  | Telefone da clinica    [Input com mascara           ]  |   | |
|  |  | Endereco                                              |   | |
|  |  |   CEP                  [Input mascara + auto-fill   ]  |   | |
|  |  |   Rua                  [Input (auto-preenchido)     ]  |   | |
|  |  |   Numero               [Input                       ]  |   | |
|  |  |   Complemento          [Input (opcional)            ]  |   | |
|  |  |   Bairro               [Input (auto-preenchido)     ]  |   | |
|  |  |   Cidade               [Input (auto-preenchido)     ]  |   | |
|  |  |   UF                   [Select (auto-preenchido)    ]  |   | |
|  |  |                                                      |   | |
|  |  | ETAPA 3: Personalizacao (opcional)                    |   | |
|  |  |                                                      |   | |
|  |  | Logo da clinica        [Dropzone: PNG/JPG/SVG, 2MB ] |   | |
|  |  |                        (preview da imagem apos up.)  |   | |
|  |  | Cor primaria           [ColorPicker ou predefinidas ] |   | |
|  |  | Cor secundaria         [ColorPicker ou predefinidas ] |   | |
|  |  |                                                      |   | |
|  |  | (Badge info: "Voce pode personalizar depois em       |   | |
|  |  |  Configuracoes")                                     |   | |
|  |  |                                                      |   | |
|  |  | ETAPA 4: Termos                                       |   | |
|  |  | (identica a etapa 3 do cadastro autonomo)             |   | |
|  |  |                                                      |   | |
|  |  +------------------------------------------------------+   | |
|  |                                                             | |
|  |       [BTN: Voltar (outline)]  [BTN: Proximo (primary)]     | |
|  |               ou na etapa 3: [BTN: Pular] [BTN: Proximo]   | |
|  |               ou na etapa 4: [BTN: Voltar] [BTN: Criar]    | |
|  |                                                             | |
|  +------------------------------------------------------------+ |
+------------------------------------------------------------------+
```

**Componentes**:
- `Card` — container principal centralizado (max-w-2xl)
- Stepper customizado (4 etapas) — indicador visual de progresso
- Etapa 1 — mesmos componentes da etapa 1 do cadastro autonomo (Input nome, e-mail, telefone, CPF, senha, confirmar senha)
- Etapa 2:
  - `Input` — razao social (obrigatorio)
  - `Input` (com mascara) — CNPJ, formato XX.XXX.XXX/XXXX-XX, validacao de digitos
  - `Input` (com mascara) — telefone da clinica
  - Inputs de endereco — CEP (mascara + auto-fill), rua, numero, complemento, bairro, cidade, UF (Select)
- Etapa 3:
  - Dropzone (componente customizado ou `Input` type file estilizado) — upload de logo (PNG/JPG/SVG, max 2MB), com preview da imagem
  - Color picker (6 cores predefinidas em tons harmonicos ou input hex) — cor primaria
  - Color picker — cor secundaria
  - `Badge` (variant info) — "Voce pode personalizar depois em Configuracoes"
- Etapa 4 — identica a etapa 3 do cadastro autonomo (ScrollArea + Checkbox + botao Criar conta)
- `Button` (variant outline) — "Voltar"
- `Button` (variant ghost) — "Pular" (apenas na etapa 3)
- `Button` (variant primary) — "Proximo" ou "Criar conta"

**Dados exibidos**:
- Texto do termo LGPD: carregado da API (versionado, inclui clausula de representante legal)
- Cores predefinidas: 6 opcoes em tons de emerald, blue, purple, amber, rose, slate

**Acoes do usuario**:
- Preencher etapa 1 + "Proximo" -> valida, avanca para etapa 2
- Preencher etapa 2 + "Proximo" -> valida CNPJ (formato + unicidade async), avanca para etapa 3
- Etapa 3: fazer upload de logo e/ou escolher cores, ou "Pular" -> avanca para etapa 4
- Etapa 4: ler termo + marcar checkbox + "Criar conta" -> POST /auth/register/clinica -> tela de confirmacao
- "Voltar" em qualquer etapa -> volta preservando dados
- "Ja tenho conta" -> navega para `/login`

**Estados**:
- **Vazio**: etapa 1 ativa, campos vazios com placeholders
- **Loading**: botao "Criar conta" com Spinner + desabilitado
- **Erro (submit)**: Toast (variant destructive)
- **Validacao**:
  - CNPJ: inline — "CNPJ invalido" (formato ou digitos) ou "CNPJ ja cadastrado" (async)
  - CPF, e-mail, senha, confirmar senha, telefone: mesmas validacoes do cadastro autonomo
  - Logo upload: inline — "Formato invalido. Use PNG, JPG ou SVG ate 2MB"
- **Sucesso (apos submit)**: Card centralizado com icone Mail + "Verifique seu e-mail" + instrucoes (igual ao cadastro autonomo)

---

### Tela 04: Confirmacao de e-mail
**Feature**: F01 | **User Stories**: US-01, US-02
**Rota**: `/confirmar-email?token=xxx`
**Acesso**: publico (link recebido por e-mail)

**Layout**:

```
+------------------------------------------------------------------+
|                                                                  |
|              +--------------------------------------+            |
|              |           CARD (max-w-md)            |            |
|              |                                      |            |
|              |         [ICONE DE STATUS]            |            |
|              |                                      |            |
|              |         Titulo do estado             |            |
|              |         Descricao do estado          |            |
|              |                                      |            |
|              |     [BTN: Acao principal (primary)]  |            |
|              |                                      |            |
|              +--------------------------------------+            |
|                            mx-auto, mt-24                        |
+------------------------------------------------------------------+
```

**Componentes**:
- `Card` — container centralizado (max-w-md, mt-24)
- Icone de status — varia conforme estado (Loader2 animate-spin, CheckCircle2, XCircle, Info)
- Texto de titulo — `h2` com descricao do estado
- Texto de descricao — `p` com detalhes
- `Button` (variant primary) — acao contextual

**Dados exibidos**:
- Token de confirmacao: parametro da URL (processado no servidor)
- Status da verificacao: retornado pela API

**Acoes do usuario**:
- Ao carregar a pagina -> GET /auth/confirm-email?token=xxx -> exibe estado resultante
- Estado sucesso: clicar "Ir para o sistema" -> navega para `/login`
- Estado erro/expirado: clicar "Reenviar e-mail" -> POST /auth/resend-confirmation -> Toast de confirmacao
- Estado ja confirmado: clicar "Ir para o login" -> navega para `/login`

**Estados**:
- **Verificando (loading)**: icone Loader2 com animate-spin (emerald-600) + "Verificando seu e-mail..." + sem botao
- **Sucesso**: icone CheckCircle2 (emerald-500) + "E-mail confirmado com sucesso!" + "Sua conta foi ativada. Voce ja pode acessar a plataforma." + botao "Ir para o sistema" (primary)
- **Erro (link invalido ou expirado)**: icone XCircle (red-500) + "Link invalido ou expirado" + "O link de confirmacao pode ter expirado ou e invalido. Solicite um novo e-mail de confirmacao." + botao "Reenviar e-mail" (primary)
- **Ja confirmado**: icone Info (blue-500) + "E-mail ja confirmado" + "Sua conta ja esta ativa. Faca login para acessar." + botao "Ir para o login" (outline)

---

### Tela 05: Esqueci minha senha
**Feature**: F01 | **User Stories**: US-04
**Rota**: `/esqueci-senha`
**Acesso**: publico (usuario nao autenticado)

**Layout**:

```
+------------------------------------------------------------------+
|                                                                  |
|              +--------------------------------------+            |
|              |           CARD (max-w-md)            |            |
|              |                                      |            |
|              |  Titulo: "Esqueci minha senha"       |            |
|              |  Subtitulo: "Informe seu e-mail       |            |
|              |  para receber o link de redefinicao"  |            |
|              |                                      |            |
|              |  E-mail                              |            |
|              |  +--------------------------------+  |            |
|              |  | Input: email                   |  |            |
|              |  +--------------------------------+  |            |
|              |                                      |            |
|              |  +--------------------------------+  |            |
|              |  | BTN: Enviar link (primary)     |  |            |
|              |  +--------------------------------+  |            |
|              |                                      |            |
|              |  [<- Voltar para o login]            |            |
|              |                                      |            |
|              +--------------------------------------+            |
|                            mx-auto, mt-24                        |
+------------------------------------------------------------------+
```

**Componentes**:
- `Card` — container centralizado (max-w-md)
- `Input` (type email) — campo de e-mail
- `Button` (variant primary, full width) — "Enviar link"
- `Link` — "Voltar para o login" com icone ArrowLeft

**Dados exibidos**:
- Nenhum dado dinamico

**Acoes do usuario**:
- Preencher e-mail + clicar "Enviar link" -> POST /auth/forgot-password -> exibe mensagem de confirmacao
- Clicar "Voltar para o login" -> navega para `/login`

**Estados**:
- **Vazio**: campo de e-mail vazio com placeholder "seu@email.com"
- **Loading**: botao com Spinner + desabilitado
- **Sucesso (apos submit)**: substitui formulario por mensagem: icone Mail (emerald-500) + "E-mail enviado" + "Se o e-mail estiver cadastrado, voce recebera um link para redefinir sua senha. Verifique sua caixa de entrada." + botao "Voltar para o login" (outline). **Nota**: mensagem generica por seguranca (nao confirma se e-mail existe).
- **Validacao**: inline — "E-mail invalido" (formato)
- **Erro**: Toast (variant destructive) para erros de servidor

---

### Tela 06: Redefinir senha
**Feature**: F01 | **User Stories**: US-04
**Rota**: `/redefinir-senha?token=xxx`
**Acesso**: publico (link recebido por e-mail)

**Layout**:

```
+------------------------------------------------------------------+
|                                                                  |
|              +--------------------------------------+            |
|              |           CARD (max-w-md)            |            |
|              |                                      |            |
|              |  Titulo: "Redefinir senha"           |            |
|              |                                      |            |
|              |  Nova senha                          |            |
|              |  +--------------------------------+  |            |
|              |  | Input: password                |  |            |
|              |  +--------------------------------+  |            |
|              |  (indicador de forca)                |            |
|              |                                      |            |
|              |  Confirmar nova senha                |            |
|              |  +--------------------------------+  |            |
|              |  | Input: password                |  |            |
|              |  +--------------------------------+  |            |
|              |                                      |            |
|              |  +--------------------------------+  |            |
|              |  | BTN: Redefinir (primary)       |  |            |
|              |  +--------------------------------+  |            |
|              |                                      |            |
|              +--------------------------------------+            |
|                            mx-auto, mt-24                        |
+------------------------------------------------------------------+
```

**Componentes**:
- `Card` — container centralizado (max-w-md)
- `Input` (type password) — nova senha com icone toggle de visibilidade + indicador de forca
- `Input` (type password) — confirmar nova senha
- `Button` (variant primary, full width) — "Redefinir"

**Dados exibidos**:
- Token de redefinicao: parametro da URL (processado no servidor)

**Acoes do usuario**:
- Preencher nova senha + confirmar + clicar "Redefinir" -> PUT /auth/reset-password -> redireciona para `/login` com Toast de sucesso
- Ao carregar: validar token no servidor; se invalido, exibir estado de erro

**Estados**:
- **Vazio**: campos vazios com placeholders
- **Loading**: botao com Spinner + desabilitado
- **Sucesso**: redireciona para `/login` + Toast (variant success): "Senha redefinida com sucesso! Faca login com sua nova senha."
- **Erro (token invalido/expirado)**: Card exibe icone XCircle (red-500) + "Link invalido ou expirado" + "Solicite um novo link de redefinicao de senha." + botao "Solicitar novo link" (primary) que navega para `/esqueci-senha`
- **Validacao**:
  - Senha: inline — "Minimo 8 caracteres, 1 maiuscula e 1 numero" + barra de forca
  - Confirmar senha: inline — "As senhas nao conferem"

---

### Tela 07: Convite para clinica (aceite)
**Feature**: F01 | **User Stories**: US-03
**Rota**: `/convite?token=xxx`
**Acesso**: publico (link recebido por e-mail de convite)

**Layout**:

```
+------------------------------------------------------------------+
|                                                                  |
|              +--------------------------------------+            |
|              |           CARD (max-w-lg)            |            |
|              |                                      |            |
|              |  [Logo da clinica ou logo padrao]    |            |
|              |                                      |            |
|              |  "Voce foi convidado para"           |            |
|              |  [Nome da clinica] (h2, bold)        |            |
|              |                                      |            |
|              |  Papel atribuido:                    |            |
|              |  [Badge: Medico/Psicologo/Sec/Admin] |            |
|              |                                      |            |
|              |  --- SE USUARIO NOVO ---              |            |
|              |                                      |            |
|              |  Nome completo     [Input          ] |            |
|              |  Senha             [Input password  ] |            |
|              |  Confirmar senha   [Input password  ] |            |
|              |  Tipo de profis.   [Select          ] |            |
|              |  Conselho          [Select          ] |            |
|              |  Numero registro   [Input           ] |            |
|              |  UF registro       [Select          ] |            |
|              |                                      |            |
|              |  [ ] Li e aceito o Termo LGPD        |            |
|              |       [ver termo completo ->]        |            |
|              |                                      |            |
|              |  [BTN: Criar conta e aceitar (prim)] |            |
|              |                                      |            |
|              |  --- SE USUARIO EXISTENTE ---         |            |
|              |                                      |            |
|              |  "Voce ja possui conta na plataforma"|            |
|              |  E-mail: joao@email.com              |            |
|              |                                      |            |
|              |  [BTN: Aceitar convite (primary)]    |            |
|              |                                      |            |
|              +--------------------------------------+            |
|                                                                  |
+------------------------------------------------------------------+
```

**Componentes**:
- `Card` — container centralizado (max-w-lg)
- Imagem — logo da clinica (se configurado) ou logo padrao da plataforma
- `Badge` — papel atribuido (variant de cor por papel: admin=purple, medico=emerald, psicologo=blue, secretaria=amber)
- Para usuario novo:
  - `Input` — nome completo (obrigatorio)
  - `Input` (type password) — senha com indicador de forca
  - `Input` (type password) — confirmar senha
  - `Select` — tipo de profissional
  - `Select` — conselho profissional
  - `Input` — numero do registro
  - `Select` — UF do registro
  - `Checkbox` — aceite do termo LGPD
  - `Link` — "ver termo completo" abre Sheet lateral com ScrollArea do termo
  - `Button` (variant primary) — "Criar conta e aceitar convite"
- Para usuario existente:
  - Texto informativo com e-mail do usuario
  - `Button` (variant primary) — "Aceitar convite"

**Dados exibidos**:
- Nome da clinica: retornado pela API ao validar token
- Logo da clinica: retornado pela API (URL da imagem)
- Papel atribuido: retornado pela API (definido pelo admin no convite)
- E-mail do convidado: retornado pela API (pre-preenchido, read-only)
- Se usuario ja existe na plataforma: flag retornado pela API

**Acoes do usuario**:
- Usuario novo: preencher formulario + aceitar LGPD + "Criar conta e aceitar convite" -> POST /auth/accept-invite -> redireciona para `/login` com Toast de sucesso
- Usuario existente: clicar "Aceitar convite" -> POST /auth/accept-invite (com sessao ativa ou solicitar login) -> redireciona para `/dashboard`

**Estados**:
- **Verificando**: Skeleton do Card + Spinner centralizado
- **Vazio (usuario novo)**: formulario limpo com e-mail pre-preenchido e read-only
- **Loading**: botao com Spinner + desabilitado
- **Erro (convite invalido/expirado)**: Card com icone XCircle (red-500) + "Convite invalido ou expirado" + "Solicite um novo convite ao administrador da clinica." + sem acoes
- **Validacao**: mesmas regras de senha, nome e registro do cadastro autonomo
- **Sucesso**: Toast (variant success) + redirecionamento

---

### Tela 08: Gestao de convites (admin)
**Feature**: F01 | **User Stories**: US-03
**Rota**: `/configuracoes/equipe`
**Acesso**: admin de clinica

**Layout**:

```
+------------------------------------------------------------------+
| SIDEBAR |  HEADER: Configuracoes > Equipe                        |
| (280px) |--------------------------------------------------------|
|         |                                                        |
|  Nav    |  +----------------------------------------------------+|
|  items  |  |  Titulo: "Equipe"    [BTN: Convidar membro (prim)] ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  |  TABELA (DataTable)                                ||
|         |  |                                                    ||
|         |  | Nome    | E-mail        | Papel    | Status | Acao ||
|         |  |---------|---------------|----------|--------|------||
|         |  | Joao S. | joao@mail.com | Medico   |[Ativo ]| ...  ||
|         |  | Maria L.| maria@mail.co | Psicol.  |[Pend. ]| ...  ||
|         |  | Ana R.  | ana@mail.com  | Secret.  |[Expir.]| ...  ||
|         |  | Pedro M.| pedro@mail.co | Admin    |[Ativo ]| ...  ||
|         |  |                                                    ||
|         |  +----------------------------------------------------+|
|         |                                                        |
+------------------------------------------------------------------+
```

**Componentes**:
- App shell (sidebar + header + content area)
- `Breadcrumb` — "Configuracoes > Equipe"
- Cabecalho da pagina: titulo "Equipe" + `Button` (variant primary) "Convidar membro" com icone UserPlus
- `DataTable` — tabela de membros da equipe com as colunas:
  - Nome (string)
  - E-mail (string)
  - Papel (`Badge` colorido: admin=purple, medico=emerald, psicologo=blue, secretaria=amber)
  - Status (`Badge`: ativo=green, pendente=yellow, expirado=red)
  - Acoes (`DropdownMenu` com trigger `Button` icone MoreHorizontal):
    - Se pendente: "Reenviar convite", "Revogar convite"
    - Se expirado: "Reenviar convite"
    - Se ativo: "Alterar papel", "Desativar"
- `Dialog` (md) de convite — acionado pelo botao "Convidar membro":
  - `Input` (type email) — e-mail do convidado
  - `Select` — papel (medico, psicologo, secretaria, admin)
  - `Alert` (variant warning, condicional) — "Admins tem acesso total a clinica. Confirma?" (aparece quando papel selecionado = admin)
  - `Button` (variant outline) — "Cancelar"
  - `Button` (variant primary) — "Enviar convite"

**Dados exibidos**:
- Lista de membros/convites: GET /team/members — retorna nome, e-mail, papel, status, data do convite
- Contagem de membros ativos vs limite do plano (exibido como texto sutil abaixo do titulo, ex: "4 de 10 membros")

**Acoes do usuario**:
- Clicar "Convidar membro" -> abre Dialog de convite
- Preencher e-mail + selecionar papel + "Enviar convite" -> POST /team/invites -> Toast sucesso "Convite enviado para [email]" + linha adicionada na tabela com status "pendente"
- Clicar "Reenviar convite" no dropdown -> POST /team/invites/[id]/resend -> Toast sucesso "Convite reenviado"
- Clicar "Revogar convite" no dropdown -> AlertDialog de confirmacao "Tem certeza que deseja revogar o convite?" -> DELETE /team/invites/[id] -> Toast sucesso + linha removida
- Clicar "Alterar papel" -> abre Dialog com Select de papel preenchido -> PUT /team/members/[id]/role -> Toast sucesso
- Clicar "Desativar" -> AlertDialog de confirmacao -> PUT /team/members/[id]/deactivate -> Toast sucesso + status muda para "inativo"

**Estados**:
- **Vazio**: icone Users + "Nenhum membro na equipe alem de voce" + "Convide profissionais e secretarias para comecar" + botao "Convidar primeiro membro" (primary)
- **Loading**: Skeleton de tabela (5 linhas, 5 colunas)
- **Erro**: Alert (variant destructive) no topo: "Erro ao carregar equipe. Tente novamente." + botao "Tentar novamente"
- **Validacao (dialog de convite)**:
  - E-mail: inline — "E-mail invalido" ou "Ja existe um convite pendente para este e-mail" (async) ou "Este profissional ja faz parte da clinica" (async)
  - Papel: inline — "Selecione um papel"

=================================================================

## P0 — Feature F02: Gestao de Pacientes

---

### Tela 09: Lista de pacientes
**Feature**: F02 | **User Stories**: US-05, US-07
**Rota**: `/pacientes`
**Acesso**: profissional autonomo, secretaria, admin de clinica, profissional de clinica

**Layout**:

```
+------------------------------------------------------------------+
| SIDEBAR |  HEADER: Pacientes                                     |
| (280px) |--------------------------------------------------------|
|         |                                                        |
|  Nav    |  +----------------------------------------------------+|
|  items  |  | Titulo: "Pacientes"   [BTN: Novo paciente (prim)]  ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | [Input busca: "Buscar por nome, CPF ou telefone"] ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | TABELA (DataTable)                                  ||
|         |  |                                                    ||
|         |  | Nome      | CPF            | Telefone   | Profis. ||
|         |  |           |                |            | vinc.   ||
|         |  | Ult.cons. | Acoes                                  ||
|         |  |-----------|----------------|------------|----------||
|         |  | Maria S.  | ***.456.789-00 | (11)99999  | Dr.Joao ||
|         |  | 10/02/26  | [Ver] [Editar]                        ||
|         |  |-----------|----------------|------------|----------||
|         |  | Pedro L.  | ***.123.456-78 | (21)98888  | Dra.Ana ||
|         |  | 05/02/26  | [Ver] [Editar]                        ||
|         |  |                                                    ||
|         |  | < 1 2 3 ... 10 >  (Pagination)                     ||
|         |  +----------------------------------------------------+|
|         |                                                        |
+------------------------------------------------------------------+
```

**Componentes**:
- App shell (sidebar + header + content area)
- Cabecalho da pagina: titulo "Pacientes" + `Button` (variant primary) "Novo paciente" com icone UserPlus
- `Input` (com icone Search a esquerda) — busca por nome, CPF ou telefone com debounce de 300ms
- `DataTable` — tabela paginada e ordenavel com as colunas:
  - Nome (string, ordenavel, clicavel — navega para detalhe)
  - CPF (string, mascarado: `***.XXX.XXX-XX` — exibe apenas ultimos 6 digitos por LGPD)
  - Telefone (string, formato (XX) XXXXX-XXXX)
  - Profissional vinculado (string — nome do profissional; em autonomo: oculto ou fixo)
  - Ultima consulta (date, formato DD/MM/AAAA, ordenavel)
  - Acoes: `Button` (variant ghost, icone Eye) "Ver" + `Button` (variant ghost, icone Pencil) "Editar"
- `Pagination` — paginacao da tabela (itens por pagina: 10, 20, 50)

**Dados exibidos**:
- Lista de pacientes: GET /patients?search=&page=&limit= — filtrado pelo tenant do usuario logado (DR-IA-4)
- Contagem total: retornado pela API para paginacao

**Acoes do usuario**:
- Digitar na busca -> filtra tabela em tempo real (debounce 300ms) — busca por nome (parcial), CPF (parcial) ou telefone
- Clicar "Novo paciente" -> navega para `/pacientes/novo`
- Clicar na linha ou botao "Ver" -> navega para `/pacientes/[id]`
- Clicar "Editar" -> navega para `/pacientes/[id]/editar`
- Alterar paginacao -> recarrega tabela
- Clicar no cabecalho da coluna -> ordena ascendente/descendente

**Estados**:
- **Vazio**: icone Users (muted) + "Nenhum paciente cadastrado" + "Cadastre seu primeiro paciente para comecar a gerenciar prontuarios e agendamentos." + `Button` "Cadastrar primeiro paciente" (primary)
- **Loading**: Skeleton de tabela (8 linhas, 6 colunas) + Skeleton do input de busca
- **Busca sem resultados**: icone SearchX (muted) + "Nenhum paciente encontrado" + "Tente buscar por outro nome, CPF ou telefone."
- **Erro**: Alert (variant destructive): "Erro ao carregar pacientes. Tente novamente." + botao "Tentar novamente"

---

### Tela 10: Cadastro/edicao de paciente
**Feature**: F02 | **User Stories**: US-05
**Rota**: `/pacientes/novo` ou `/pacientes/[id]/editar`
**Acesso**: profissional autonomo, secretaria, admin de clinica

**Layout**:

```
+------------------------------------------------------------------+
| SIDEBAR |  HEADER: Pacientes > Novo paciente (ou Editar: Nome)   |
| (280px) |--------------------------------------------------------|
|         |                                                        |
|  Nav    |  +----------------------------------------------------+|
|  items  |  | CARD (max-w-3xl)                                    ||
|         |  |                                                    ||
|         |  | Secao: "Dados pessoais"                             ||
|         |  | +------------------------------------------------+ ||
|         |  | | Nome completo*    [Input                      ] | ||
|         |  | | CPF*              [Input mascara XXX.XXX.XXX-X] | ||
|         |  | | Data nascimento   [DatePicker DD/MM/AAAA      ] | ||
|         |  | | Sexo              [Select: Masc/Fem/Outro/NI  ] | ||
|         |  | +------------------------------------------------+ ||
|         |  |                                                    ||
|         |  | Secao: "Contato"                                    ||
|         |  | +------------------------------------------------+ ||
|         |  | | Telefone*         [Input mascara (XX) XXXXX-XX] | ||
|         |  | | E-mail            [Input type email            ] | ||
|         |  | | CEP               [Input mascara + auto-fill   ] | ||
|         |  | | Rua               [Input (auto-preenchido)     ] | ||
|         |  | | Numero            [Input                       ] | ||
|         |  | | Complemento       [Input (opcional)            ] | ||
|         |  | | Bairro            [Input (auto-preenchido)     ] | ||
|         |  | | Cidade            [Input (auto-preenchido)     ] | ||
|         |  | | UF                [Select (auto-preenchido)    ] | ||
|         |  | +------------------------------------------------+ ||
|         |  |                                                    ||
|         |  | Secao: "Observacoes"                                ||
|         |  | +------------------------------------------------+ ||
|         |  | | [Textarea (h-24, placeholder: "Obs. gerais")] | ||
|         |  | +------------------------------------------------+ ||
|         |  |                                                    ||
|         |  | +----------+  +----------+                         ||
|         |  | |Cancelar  |  | Salvar   |                         ||
|         |  | |(outline) |  |(primary) |                         ||
|         |  | +----------+  +----------+                         ||
|         |  |                                                    ||
|         |  +----------------------------------------------------+|
|         |                                                        |
+------------------------------------------------------------------+
```

**Componentes**:
- App shell (sidebar + header + content area)
- `Breadcrumb` — "Pacientes > Novo paciente" ou "Pacientes > [Nome] > Editar"
- `Card` — container do formulario (max-w-3xl)
- Secao "Dados pessoais":
  - `Input` — nome completo (obrigatorio)
  - `Input` (com mascara) — CPF, formato XXX.XXX.XXX-XX (obrigatorio, validacao de digitos + unicidade no tenant)
  - `DatePicker` (componente shadcn Popover + Calendar) — data de nascimento, formato DD/MM/AAAA
  - `Select` — sexo (Masculino, Feminino, Outro, Nao informado)
- Secao "Contato":
  - `Input` (com mascara) — telefone (obrigatorio, pre-requisito WhatsApp)
  - `Input` (type email) — e-mail (opcional)
  - `Input` (com mascara) — CEP com auto-preenchimento via API
  - `Input` — rua (auto-preenchido apos CEP)
  - `Input` — numero
  - `Input` — complemento (opcional)
  - `Input` — bairro (auto-preenchido)
  - `Input` — cidade (auto-preenchido)
  - `Select` — UF (auto-preenchido)
- Secao "Observacoes":
  - `Textarea` — texto livre, h-24, placeholder "Observacoes gerais sobre o paciente..."
- `Button` (variant outline) — "Cancelar" volta para `/pacientes`
- `Button` (variant primary) — "Salvar"

**Dados exibidos**:
- Modo edicao: GET /patients/[id] — preenche formulario com dados existentes
- Modo criacao: formulario vazio

**Acoes do usuario**:
- Preencher dados + clicar "Salvar" -> POST /patients (criacao) ou PUT /patients/[id] (edicao) -> Toast sucesso "Paciente cadastrado/atualizado com sucesso" + navega para `/pacientes/[id]`
- Clicar "Cancelar" -> navega para `/pacientes` (se criacao) ou `/pacientes/[id]` (se edicao)
- Digitar CEP valido -> auto-preenche endereco via ViaCEP

**Estados**:
- **Vazio (criacao)**: formulario limpo com placeholders
- **Preenchido (edicao)**: formulario preenchido com dados existentes do paciente
- **Loading**: botao "Salvar" com Spinner + desabilitado
- **Erro (submit)**: Toast (variant destructive) para erros de servidor
- **Validacao**:
  - Nome: inline — "Nome e obrigatorio" (min 3 chars)
  - CPF: inline — "CPF invalido" (formato ou digitos) ou "CPF ja cadastrado nesta clinica" (async, unicidade no tenant)
  - Telefone: inline — "Telefone e obrigatorio" ou "Formato invalido"
  - E-mail: inline — "E-mail invalido" (formato)
  - CEP: inline — "CEP nao encontrado" (se API ViaCEP nao retornar resultado)

---

### Tela 11: Detalhe do paciente
**Feature**: F02 | **User Stories**: US-05, US-06, US-07
**Rota**: `/pacientes/[id]`
**Acesso**: profissional autonomo, secretaria, admin de clinica, profissional de clinica (respeitando vinculo)

**Layout**:

```
+------------------------------------------------------------------+
| SIDEBAR |  HEADER: Pacientes > Maria Silva                       |
| (280px) |--------------------------------------------------------|
|         |                                                        |
|  Nav    |  +----------------------------------------------------+|
|  items  |  | Nome: Maria Silva [Badge: Ativo]                    ||
|         |  |                                                    ||
|         |  | [BTN: Editar (outline)]  [BTN: Novo agend. (prim)] ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | TABS                                                ||
|         |  | [Dados] [Vinculos e tarifa] [Prontuario]            ||
|         |  | [Financeiro] [Agendamentos]                         ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | CONTEUDO DA TAB ATIVA                               ||
|         |  |                                                    ||
|         |  | --- TAB "Dados" ---                                 ||
|         |  | +------------------------------------------------+ ||
|         |  | | CARD: Dados cadastrais                          | ||
|         |  | |                                                | ||
|         |  | | Nome: Maria Silva                              | ||
|         |  | | CPF: ***.456.789-00                             | ||
|         |  | | Data nasc.: 15/03/1990                          | ||
|         |  | | Sexo: Feminino                                 | ||
|         |  | | Telefone: (11) 99999-8888                       | ||
|         |  | | E-mail: maria@email.com                        | ||
|         |  | | Endereco: Rua X, 123 - Bairro Y - SP/SP        | ||
|         |  | | Observacoes: Alergia a latex                    | ||
|         |  | +------------------------------------------------+ ||
|         |  |                                                    ||
|         |  | --- TAB "Vinculos e tarifa" ---                     ||
|         |  | +------------------------------------------------+ ||
|         |  | | LISTA DE VINCULOS                               | ||
|         |  | |                                                | ||
|         |  | | Dr. Joao Silva - R$ 200,00 / sessao            | ||
|         |  | |               [BTN: Editar tarifa (ghost)]     | ||
|         |  | |                                                | ||
|         |  | | Dra. Ana Lima - R$ 150,00 / hora               | ||
|         |  | |               [BTN: Editar tarifa (ghost)]     | ||
|         |  | |                                                | ||
|         |  | | [BTN: Adicionar vinculo (outline, icone Plus)] | ||
|         |  | +------------------------------------------------+ ||
|         |  |                                                    ||
|         |  | --- TAB "Prontuario" ---                            ||
|         |  | (integra com F04 — ver Tela 17)                     ||
|         |  |                                                    ||
|         |  | --- TAB "Financeiro" ---                             ||
|         |  | (integra com F05 — lista de contas do paciente)     ||
|         |  |                                                    ||
|         |  | --- TAB "Agendamentos" ---                           ||
|         |  | (integra com F03 — historico de agendamentos)        ||
|         |  |                                                    ||
|         |  +----------------------------------------------------+|
|         |                                                        |
+------------------------------------------------------------------+
```

**Componentes**:
- App shell (sidebar + header + content area)
- `Breadcrumb` — "Pacientes > [Nome do paciente]"
- Cabecalho do paciente:
  - Nome (h2, bold) + `Badge` (variant success) "Ativo"
  - `Button` (variant outline) "Editar" com icone Pencil
  - `Button` (variant primary) "Novo agendamento" com icone CalendarPlus
- `Tabs` (shadcn Tabs) — 5 abas:
  - **Dados**: `Card` com dados cadastrais em layout de pares label/valor (grid de 2 colunas)
  - **Vinculos e tarifa**: lista de cards ou itens de lista com profissional, valor formatado (R$ XXX,XX), tipo (sessao/hora), botao "Editar tarifa" (ghost) + botao "Adicionar vinculo" (outline) no final
  - **Prontuario**: integra com F04, exibe timeline de evolucoes (ver Tela 17)
  - **Financeiro**: integra com F05, exibe lista de contas do paciente (tabela simplificada)
  - **Agendamentos**: integra com F03, exibe historico de agendamentos (tabela simplificada)

**Dados exibidos**:
- Dados do paciente: GET /patients/[id]
- Vinculos: GET /patients/[id]/links — retorna profissional, tarifa (valor + tipo)
- Prontuario: GET /patients/[id]/records — evolucoes ordenadas por data
- Financeiro: GET /patients/[id]/receivables — contas a receber do paciente
- Agendamentos: GET /patients/[id]/appointments — historico de agendamentos

**Acoes do usuario**:
- Clicar "Editar" -> navega para `/pacientes/[id]/editar`
- Clicar "Novo agendamento" -> abre Dialog de criar agendamento (Tela 15) com paciente pre-selecionado
- Trocar de aba -> carrega dados da aba selecionada (lazy loading)
- Clicar "Editar tarifa" em vinculo -> abre Dialog de vinculo + tarifa (Tela 12) em modo edicao
- Clicar "Adicionar vinculo" -> abre Dialog de vinculo + tarifa (Tela 12) em modo criacao

**Estados**:
- **Loading**: Skeleton do cabecalho (nome + badges) + Skeleton do conteudo da aba
- **Erro**: Alert (variant destructive) no conteudo: "Erro ao carregar dados do paciente."
- **Tab Prontuario vazio**: icone FileText (muted) + "Nenhuma evolucao registrada para este paciente."
- **Tab Financeiro vazio**: icone Receipt (muted) + "Nenhuma conta a receber registrada."
- **Tab Agendamentos vazio**: icone Calendar (muted) + "Nenhum agendamento registrado."
- **Tab Vinculos vazio**: icone Link (muted) + "Nenhum vinculo profissional configurado" + botao "Adicionar vinculo"

---

### Tela 12: Dialog de vinculo + tarifa
**Feature**: F02 | **User Stories**: US-06
**Rota**: Dialog (aberta a partir da Tela 11, tab "Vinculos e tarifa")
**Acesso**: profissional autonomo, admin de clinica

**Layout**:

```
+------------------------------------------+
|  DIALOG (md)                             |
|                                          |
|  Titulo: "Adicionar vinculo" ou          |
|          "Editar tarifa"                 |
|                                          |
|  Profissional*                           |
|  +------------------------------------+  |
|  | Select: lista de profissionais     |  |
|  | (oculto para autonomo — pre-sel.)  |  |
|  +------------------------------------+  |
|                                          |
|  Valor da sessao*                        |
|  +------------------------------------+  |
|  | Input: R$ [0,00] (mascara moeda)   |  |
|  +------------------------------------+  |
|                                          |
|  Tipo de cobranca*                       |
|  +------------------------------------+  |
|  | Select: Por sessao / Por hora      |  |
|  +------------------------------------+  |
|                                          |
|  +----------+  +---------------------+   |
|  | Cancelar |  | Salvar (primary)    |   |
|  | (outline)|  |                     |   |
|  +----------+  +---------------------+   |
|                                          |
+------------------------------------------+
```

**Componentes**:
- `Dialog` (size md) — modal
- `DialogHeader` — titulo: "Adicionar vinculo" (criacao) ou "Editar tarifa" (edicao)
- `Select` — profissional da clinica (GET /team/professionals — apenas profissionais ativos). Em tenant autonomo: campo oculto, pre-selecionado com o profissional logado.
- `Input` (com mascara de moeda) — valor da tarifa, formato R$ X.XXX,XX
- `Select` — tipo de cobranca: "Por sessao", "Por hora"
- `Button` (variant outline) — "Cancelar" fecha dialog
- `Button` (variant primary) — "Salvar"

**Dados exibidos**:
- Lista de profissionais: GET /team/professionals (apenas em clinica)
- Modo edicao: dados do vinculo existente (profissional pre-selecionado e read-only, valor e tipo preenchidos)

**Acoes do usuario**:
- Selecionar profissional + preencher valor + selecionar tipo + "Salvar" -> POST /patients/[id]/links (criacao) ou PUT /patients/[id]/links/[linkId] (edicao) -> Toast sucesso "Vinculo criado/atualizado com sucesso" + atualiza lista na tab
- Clicar "Cancelar" -> fecha dialog sem salvar

**Estados**:
- **Loading**: botao "Salvar" com Spinner + desabilitado
- **Erro**: Toast (variant destructive) para erros de servidor ou "Vinculo duplicado: este profissional ja esta vinculado a este paciente"
- **Validacao**:
  - Profissional: inline — "Selecione um profissional" (obrigatorio em clinica)
  - Valor: inline — "Informe o valor da tarifa" (obrigatorio, > 0)
  - Tipo: inline — "Selecione o tipo de cobranca" (obrigatorio)

=================================================================

## P1 — Feature F03: Agenda e Agendamentos

---

### Tela 13: Agenda — Visao semanal
**Feature**: F03 | **User Stories**: US-08, US-12
**Rota**: `/agenda`
**Acesso**: profissional autonomo, secretaria, admin de clinica, profissional de clinica

**Layout**:

```
+------------------------------------------------------------------+
| SIDEBAR |  HEADER: Agenda                                        |
| (280px) |--------------------------------------------------------|
|         |                                                        |
|  Nav    |  +----------------------------------------------------+|
|  items  |  | "Agenda"                                            ||
|         |  |                                                    ||
|         |  | [<- sem.ant] [Hoje] [sem.prox ->]                  ||
|         |  | [Toggle: Dia | Semana]                              ||
|         |  | [Select: Profissional] (so em clinica)              ||
|         |  | [BTN: Novo agendamento (primary)]                  ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | GRID DE AGENDA SEMANAL                              ||
|         |  |                                                    ||
|         |  |        | Seg 10 | Ter 11 | Qua 12 | Qui 13 | Sex ||
|         |  | 07:00  |        |        |        |        |      ||
|         |  | 07:30  |        |        |        |        |      ||
|         |  | 08:00  |+------+|        |        |        |      ||
|         |  | 08:30  || Maria ||        |+------+|        |      ||
|         |  | 09:00  || Silva ||        || Pedro ||        |      ||
|         |  | 09:30  ||08:00- ||        || Lima  ||        |      ||
|         |  |        ||09:00  ||        ||08:30- ||        |      ||
|         |  |        ||Presenc||        ||09:30  ||        |      ||
|         |  |        |+------+|        |+------+|        |      ||
|         |  | 10:00  |        |+------+|        |        |      ||
|         |  | 10:30  |        || Ana   ||        |+------+|      ||
|         |  | 11:00  |        || Rocha ||        || Joao  ||      ||
|         |  |        |        ||10:00- ||        || Souza ||      ||
|         |  |        |        ||11:00  ||        ||10:30- ||      ||
|         |  |        |        |+------+|        ||11:30  ||      ||
|         |  |        |        |        |        |+------+|      ||
|         |  | ...    |        |        |        |        |      ||
|         |  | 21:00  |        |        |        |        |      ||
|         |  |                                                    ||
|         |  +----------------------------------------------------+|
|         |                                                        |
+------------------------------------------------------------------+
```

**Componentes**:
- App shell (sidebar + header + content area) — conteudo ocupa toda a largura disponivel
- Cabecalho da agenda:
  - Titulo "Agenda"
  - Navegacao de semana: `Button` (variant ghost, icone ChevronLeft) + `Button` (variant outline) "Hoje" + `Button` (variant ghost, icone ChevronRight)
  - `ToggleGroup` (shadcn) — toggle entre "Dia" e "Semana"
  - `Select` — filtro por profissional (apenas em clinicas, lista profissionais do tenant; default: todos ou o profissional logado)
  - `Button` (variant primary) — "Novo agendamento" com icone CalendarPlus
- Grid de agenda:
  - Eixo X: colunas para cada dia da semana (seg a sex por padrao; sab/dom configuravel)
  - Eixo Y: linhas de 30 em 30 minutos (07:00 as 21:00)
  - Cabecalho de cada coluna: dia da semana abreviado + numero do dia (ex: "Seg 10")
  - Cada agendamento: `Card` posicionado no grid (posicao e altura calculados pelo horario/duracao)
    - Conteudo: nome do paciente (bold, truncado), horario (8:00-9:00), tipo (Presencial/Online)
    - Cor por status:
      - Agendado: `bg-blue-100 border-l-4 border-blue-500 text-blue-900`
      - Confirmado: `bg-emerald-100 border-l-4 border-emerald-500 text-emerald-900`
      - Realizado: `bg-gray-100 border-l-4 border-gray-400 text-gray-600`
      - Cancelado: `bg-red-50 border-l-4 border-red-300 text-red-400 line-through`

**Dados exibidos**:
- Agendamentos da semana: GET /appointments?startDate=&endDate=&professionalId= — retorna lista de agendamentos com paciente, profissional, data, hora inicio, hora fim, tipo, status
- Label da semana exibido no cabecalho: "10-14 Fev 2026"

**Acoes do usuario**:
- Clicar em slot vazio do grid -> abre Dialog de criar agendamento (Tela 15) com dia e hora pre-preenchidos
- Clicar em agendamento existente -> abre Dialog de detalhe do agendamento (Tela 16)
- Navegar semanas (setas ou "Hoje") -> recarrega agendamentos do novo periodo
- Trocar toggle para "Dia" -> navega para `/agenda?view=day`
- Selecionar profissional -> filtra grid para exibir apenas agendamentos daquele profissional
- Clicar "Novo agendamento" -> abre Dialog de criar agendamento (Tela 15) sem pre-preenchimento de horario

**Estados**:
- **Vazio (semana sem agendamentos)**: grid visivel com slots vazios + mensagem centralizada sobre o grid: icone CalendarX2 (muted) + "Nenhum agendamento nesta semana" + `Button` "Criar agendamento" (primary)
- **Loading**: Skeleton do grid (grade com placeholders animados nos horarios) + Skeleton do cabecalho
- **Erro**: Alert (variant destructive) sobre o grid: "Erro ao carregar agenda. Tente novamente." + botao "Tentar novamente"

---

### Tela 14: Agenda — Visao diaria
**Feature**: F03 | **User Stories**: US-12
**Rota**: `/agenda?view=day`
**Acesso**: profissional autonomo, secretaria, admin de clinica, profissional de clinica

**Layout**:

```
+------------------------------------------------------------------+
| SIDEBAR |  HEADER: Agenda                                        |
| (280px) |--------------------------------------------------------|
|         |                                                        |
|  Nav    |  +----------------------------------------------------+|
|  items  |  | "Agenda"                                            ||
|         |  |                                                    ||
|         |  | [<- dia ant.] [Hoje] [dia prox. ->]                ||
|         |  | Quarta-feira, 12 de Fevereiro de 2026              ||
|         |  | [Toggle: Dia | Semana]                              ||
|         |  | [Select: Profissional] (so em clinica)              ||
|         |  | [BTN: Novo agendamento (primary)]                  ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | COLUNA UNICA EXPANDIDA                              ||
|         |  |                                                    ||
|         |  | 07:00 |                                             ||
|         |  | 07:30 |                                             ||
|         |  | 08:00 |+------------------------------------------+ ||
|         |  |       || Maria Silva                               | ||
|         |  | 08:30 || 08:00 - 09:00 | Presencial               | ||
|         |  |       || Tel: (11) 99999-8888                      | ||
|         |  | 09:00 || [Badge: Agendado]                         | ||
|         |  |       |+------------------------------------------+ ||
|         |  | 09:30 |                                             ||
|         |  | 10:00 |+------------------------------------------+ ||
|         |  |       || Pedro Lima                                | ||
|         |  | 10:30 || 10:00 - 11:00 | Online                   | ||
|         |  |       || Tel: (21) 98888-7777                      | ||
|         |  | 11:00 || [Badge: Confirmado]                       | ||
|         |  |       |+------------------------------------------+ ||
|         |  |       |                                             ||
|         |  | ..... |                                             ||
|         |  |-------|--------- LINHA VERMELHA (horario atual) --- ||
|         |  | 14:30 |                                             ||
|         |  | ..... |                                             ||
|         |  | 21:00 |                                             ||
|         |  |                                                    ||
|         |  +----------------------------------------------------+|
|         |                                                        |
+------------------------------------------------------------------+
```

**Componentes**:
- App shell (sidebar + header + content area)
- Cabecalho da agenda:
  - Titulo "Agenda"
  - Navegacao de dia: `Button` (variant ghost, icone ChevronLeft) + `Button` (variant outline) "Hoje" + `Button` (variant ghost, icone ChevronRight)
  - Label do dia: data por extenso "Quarta-feira, 12 de Fevereiro de 2026"
  - `ToggleGroup` — toggle "Dia" (ativo) / "Semana"
  - `Select` — filtro por profissional (apenas clinica)
  - `Button` (variant primary) — "Novo agendamento"
- Coluna unica expandida:
  - Eixo Y: linhas de 30min (07:00 as 21:00)
  - Cada agendamento: `Card` expandido mostrando:
    - Nome do paciente (bold)
    - Horario (inicio - fim) + tipo de atendimento
    - Telefone do paciente
    - `Badge` de status (mesmas cores da visao semanal)
  - Linha horizontal vermelha (`border-red-500`, 2px) indicando o horario atual — se move em tempo real (atualiza a cada minuto)
  - Slots vazios: clicaveis

**Dados exibidos**:
- Agendamentos do dia: GET /appointments?date=YYYY-MM-DD&professionalId=
- Cada agendamento retorna: paciente (nome, telefone), profissional, data, hora inicio, hora fim, tipo, status

**Acoes do usuario**:
- Clicar em slot vazio -> abre Dialog de criar agendamento (Tela 15) com data e hora pre-preenchidos
- Clicar em agendamento existente -> abre Dialog de detalhe (Tela 16)
- Navegar dias -> recarrega agendamentos
- Trocar toggle para "Semana" -> navega para `/agenda`
- Demais acoes iguais a visao semanal

**Estados**:
- **Vazio (dia sem agendamentos)**: coluna vazia com slots + mensagem: icone CalendarX2 (muted) + "Nenhum agendamento para hoje" + `Button` "Criar agendamento" (primary)
- **Loading**: Skeleton da coluna (linhas de placeholder nos slots)
- **Erro**: Alert (variant destructive): "Erro ao carregar agenda."

---

### Tela 15: Dialog de criar/editar agendamento
**Feature**: F03 | **User Stories**: US-08, US-09
**Rota**: Dialog (aberta a partir da Tela 13 ou 14)
**Acesso**: profissional autonomo, secretaria, admin de clinica

**Layout**:

```
+--------------------------------------------------+
|  DIALOG (lg)                                     |
|                                                  |
|  Titulo: "Novo agendamento" ou                   |
|          "Editar agendamento"                    |
|                                                  |
|  Paciente*                                       |
|  +----------------------------------------------+|
|  | Combobox: busca por nome (pacientes          ||
|  | vinculados ao profissional selecionado)      ||
|  +----------------------------------------------+|
|                                                  |
|  Profissional*                                   |
|  +----------------------------------------------+|
|  | Select: profissionais da clinica             ||
|  | (oculto/pre-selecionado para autonomo)       ||
|  +----------------------------------------------+|
|                                                  |
|  +--------------------+  +---------------------+ |
|  | Data*              |  | Hora inicio*        | |
|  | [DatePicker]       |  | [Select: 07:00,     | |
|  |                    |  |  07:15, 07:30...]   | |
|  +--------------------+  +---------------------+ |
|                                                  |
|  +--------------------+  +---------------------+ |
|  | Duracao*           |  | Tipo de atendimento | |
|  | [Select: 30min,    |  | [Select: Presencial,| |
|  |  45min, 1h, 1h30,  |  |  Online]            | |
|  |  2h]               |  |                     | |
|  +--------------------+  +---------------------+ |
|                                                  |
|  [Alert warning: "Conflito de horario detectado! |
|   Ja existe agendamento para Dr. Joao            |
|   das 10:00 as 11:00 neste dia."]               |
|  (condicional — aparece se detectar sobreposicao)|
|                                                  |
|  Observacao                                      |
|  +----------------------------------------------+|
|  | Textarea (h-20, opcional)                     ||
|  +----------------------------------------------+|
|                                                  |
|  +-------------------------------------------+   |
|  | No modo edicao:                            |   |
|  | [BTN: Cancelar agendamento (destructive)]  |   |
|  +-------------------------------------------+   |
|                                                  |
|  +----------+  +----------------------------+    |
|  | Cancelar |  | Salvar agendamento (prim.) |    |
|  | (outline)|  |                            |    |
|  +----------+  +----------------------------+    |
|                                                  |
+--------------------------------------------------+
```

**Componentes**:
- `Dialog` (size lg) — modal
- `DialogHeader` — titulo: "Novo agendamento" ou "Editar agendamento"
- `Combobox` (shadcn Command + Popover) — busca de paciente com autocomplete. Busca por nome entre pacientes vinculados ao profissional selecionado. Exibe nome + telefone na lista de sugestoes.
- `Select` — profissional (apenas em clinicas; em autonomo: oculto, pre-selecionado). Ao trocar profissional, recarrega lista de pacientes do Combobox.
- `DatePicker` (Popover + Calendar) — data do agendamento. Nao permite selecionar datas passadas (exceto hoje).
- `Select` — hora de inicio (intervalos de 15 minutos: 07:00, 07:15, 07:30, ..., 20:45)
- `Select` — duracao (30min, 45min, 1h, 1h30, 2h)
- `Select` — tipo de atendimento (Presencial, Online). Alternativa: `Input` de texto livre.
- `Alert` (variant warning, condicional) — aviso de conflito de horario. Aparece se ao selecionar data + hora + duracao houver sobreposicao com agendamento existente do mesmo profissional. Verificacao em tempo real (GET /appointments/check-overlap).
- `Textarea` — observacao (opcional, h-20)
- `Button` (variant destructive, outline) — "Cancelar agendamento" (apenas no modo edicao). Ao clicar: abre `AlertDialog` de confirmacao.
- `Button` (variant outline) — "Cancelar" (fecha dialog)
- `Button` (variant primary) — "Salvar agendamento"
- `AlertDialog` (confirmacao de cancelamento) — "Tem certeza que deseja cancelar este agendamento? O horario sera liberado na agenda." + botoes "Nao, manter" / "Sim, cancelar agendamento"

**Dados exibidos**:
- Lista de pacientes: GET /patients?professionalId= (filtrado por vinculo)
- Lista de profissionais: GET /team/professionals (apenas clinica)
- Verificacao de sobreposicao: GET /appointments/check-overlap?professionalId=&date=&startTime=&duration=
- Modo edicao: dados do agendamento existente preenchidos

**Acoes do usuario**:
- Selecionar paciente + profissional + data + hora + duracao + tipo + "Salvar agendamento" -> POST /appointments (criacao) ou PUT /appointments/[id] (edicao) -> Toast sucesso "Agendamento criado/atualizado" + fecha dialog + atualiza grid da agenda
- Clicar "Cancelar" (outline) -> fecha dialog sem salvar
- Clicar "Cancelar agendamento" (destructive, modo edicao) -> AlertDialog -> confirma -> PUT /appointments/[id]/cancel -> Toast sucesso "Agendamento cancelado" + fecha dialog + atualiza grid
- Alterar data/hora/duracao -> dispara verificacao de sobreposicao em tempo real

**Estados**:
- **Vazio (criacao)**: campos vazios; se aberto a partir de slot do grid, data e hora pre-preenchidos
- **Preenchido (edicao)**: campos preenchidos com dados existentes; paciente e profissional read-only
- **Loading**: botao "Salvar" com Spinner + desabilitado
- **Erro**: Toast (variant destructive) para erros de servidor
- **Conflito detectado**: Alert (variant warning) inline exibindo detalhes do conflito; botao "Salvar" fica desabilitado enquanto houver conflito
- **Validacao**:
  - Paciente: inline — "Selecione um paciente"
  - Data: inline — "Selecione uma data"
  - Hora: inline — "Selecione o horario"
  - Duracao: inline — "Selecione a duracao"

---

### Tela 16: Dialog de detalhe do agendamento
**Feature**: F03 | **User Stories**: US-10, US-11
**Rota**: Dialog (aberta a partir da Tela 13 ou 14)
**Acesso**: profissional autonomo, secretaria, admin de clinica, profissional de clinica

**Layout**:

```
+------------------------------------------+
|  DIALOG (md)                             |
|                                          |
|  Titulo: "Detalhes do agendamento"       |
|                                          |
|  +------------------------------------+  |
|  | Paciente:  Maria Silva              |  |
|  | Profissional: Dr. Joao Silva       |  |
|  | Data: 12/02/2026                    |  |
|  | Horario: 08:00 - 09:00             |  |
|  | Tipo: Presencial                    |  |
|  | Status: [Badge: Agendado]           |  |
|  | Observacao: "Retorno mensal"        |  |
|  +------------------------------------+  |
|                                          |
|  --- ACOES (variam por status) ---       |
|                                          |
|  Se "agendado":                          |
|  [BTN: Editar (outline)]                |
|  [BTN: Marcar realizado (success)]      |
|  [BTN: Cancelar agend. (destructive)]   |
|                                          |
|  Se "realizado":                         |
|  [BTN: Ver evolucao (outline)]          |
|  [BTN: Ver conta a receber (outline)]   |
|                                          |
|  Se "cancelado":                         |
|  [Badge: Cancelado] (apenas visual.)    |
|                                          |
+------------------------------------------+
```

**Componentes**:
- `Dialog` (size md) — modal
- `DialogHeader` — "Detalhes do agendamento"
- Secao de dados (layout de pares label/valor):
  - Paciente: nome (string, bold)
  - Profissional: nome (string)
  - Data: formato DD/MM/AAAA
  - Horario: formato HH:MM - HH:MM
  - Tipo: Presencial ou Online
  - Status: `Badge` colorido (mesmas cores do grid)
  - Observacao: texto (ou "Sem observacao" em muted)
- Botoes de acao (condicionais por status):
  - **Status "agendado"**:
    - `Button` (variant outline) "Editar" com icone Pencil -> fecha este Dialog e abre Dialog de edicao (Tela 15) com dados preenchidos
    - `Button` (variant default, class `bg-emerald-600 hover:bg-emerald-700 text-white`) "Marcar como realizado" com icone CheckCircle
    - `Button` (variant destructive, outline) "Cancelar agendamento" com icone XCircle -> abre `AlertDialog` de confirmacao
  - **Status "realizado"**:
    - `Button` (variant outline) "Ver evolucao" com icone FileText -> navega para `/atendimentos/[atendimentoId]/evolucao` ou `/pacientes/[pacienteId]/prontuario`
    - `Button` (variant outline) "Ver conta a receber" com icone Receipt -> navega para `/financeiro` com filtro aplicado
  - **Status "cancelado"**:
    - Apenas exibicao. `Badge` (variant destructive) "Cancelado" exibido de forma proeminente. Sem botoes de acao.
  - **Status "confirmado"**: mesmas acoes de "agendado" (editar, marcar realizado, cancelar)

**Dados exibidos**:
- Dados do agendamento: ja carregados ao clicar no card do grid, ou GET /appointments/[id]
- ID do atendimento vinculado (se realizado): retornado pela API

**Acoes do usuario**:
- Clicar "Editar" -> fecha dialog, abre Dialog de edicao (Tela 15)
- Clicar "Marcar como realizado" -> PUT /appointments/[id]/complete -> Toast sucesso "Atendimento registrado e conta a receber criada" (variant success) + fecha dialog + atualiza grid (cor muda para cinza)
- Clicar "Cancelar agendamento" -> AlertDialog "Tem certeza que deseja cancelar este agendamento?" + botoes "Nao" / "Sim, cancelar" -> PUT /appointments/[id]/cancel -> Toast sucesso "Agendamento cancelado" + fecha dialog + atualiza grid
- Clicar "Ver evolucao" -> navega para tela de prontuario/evolucao
- Clicar "Ver conta a receber" -> navega para `/financeiro` com filtro pelo atendimento

**Estados**:
- **Loading**: Skeleton dos dados dentro do Dialog
- **Erro**: Toast (variant destructive) para erros ao executar acoes
- **Confirmacao (AlertDialog)**: titulo "Cancelar agendamento?", descricao "O horario sera liberado na agenda. Esta acao nao pode ser desfeita.", botoes "Nao, manter" (outline) + "Sim, cancelar" (destructive)

=================================================================

## P1 — Feature F04: Atendimento e Prontuario

---

### Tela 17: Prontuario do paciente
**Feature**: F04 | **User Stories**: US-13, US-14
**Rota**: `/pacientes/[id]/prontuario` (ou tab "Prontuario" dentro de `/pacientes/[id]`)
**Acesso**: profissional autonomo, profissional de clinica (somente vinculados ao paciente, ou admin conforme configuracao)

**Layout**:

```
+------------------------------------------------------------------+
| SIDEBAR |  HEADER: Pacientes > Maria Silva > Prontuario          |
| (280px) |--------------------------------------------------------|
|         |                                                        |
|  Nav    |  +----------------------------------------------------+|
|  items  |  | "Prontuario de Maria Silva"                         ||
|         |  |                                                    ||
|         |  | [Badge info: "Dados retidos por no minimo 20 anos  ||
|         |  |  conforme legislacao (CFP/CFM)"]                   ||
|         |  |                                                    ||
|         |  |           [BTN: Registrar evolucao (primary)]      ||
|         |  |           (so aparece se ha atendimento sem evol.) ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | TIMELINE DE EVOLUCOES                               ||
|         |  |                                                    ||
|         |  |  o  12/02/2026 - 09:15                              ||
|         |  |  |  +------------------------------------------+   ||
|         |  |  |  | CARD                                      |   ||
|         |  |  |  | Profissional: Dr. Joao Silva              |   ||
|         |  |  |  | [Badge: Presencial]                       |   ||
|         |  |  |  |                                           |   ||
|         |  |  |  | "Paciente relata melhora significativa    |   ||
|         |  |  |  |  nos sintomas de ansiedade apos inicio    |   ||
|         |  |  |  |  da terapia cognitivo-comportamental..."  |   ||
|         |  |  |  |                                           |   ||
|         |  |  |  | [Link: "Ver mais" (se texto truncado)]   |   ||
|         |  |  |  +------------------------------------------+   ||
|         |  |  |                                                  ||
|         |  |  o  05/02/2026 - 10:30                              ||
|         |  |  |  +------------------------------------------+   ||
|         |  |  |  | CARD                                      |   ||
|         |  |  |  | Profissional: Dr. Joao Silva              |   ||
|         |  |  |  | [Badge: Presencial]                       |   ||
|         |  |  |  |                                           |   ||
|         |  |  |  | "Primeira sessao. Paciente apresenta     |   ||
|         |  |  |  |  queixas de ansiedade generalizada..."    |   ||
|         |  |  |  |                                           |   ||
|         |  |  |  | [Link: "Ver mais"]                       |   ||
|         |  |  |  +------------------------------------------+   ||
|         |  |  |                                                  ||
|         |  |  (fim da timeline)                                  ||
|         |  |                                                    ||
|         |  +----------------------------------------------------+|
|         |                                                        |
+------------------------------------------------------------------+
```

**Componentes**:
- App shell (sidebar + header + content area)
- `Breadcrumb` — "Pacientes > [Nome] > Prontuario"
- Cabecalho:
  - Titulo "Prontuario de [nome do paciente]" (h2)
  - `Alert` (variant info, com icone Info) — "Dados retidos por no minimo 20 anos conforme legislacao (CFP/CFM)" (referencia DR-CO-4)
  - `Button` (variant primary) "Registrar evolucao" com icone FilePlus — visivel apenas se houver atendimento sem evolucao vinculada. Ao clicar: navega para Tela 18 ou abre dialog com Select do atendimento se houver mais de um pendente.
- Timeline visual:
  - Linha vertical conectando os marcadores
  - Cada item da timeline:
    - Marcador circular (bullet) + data/hora (`Badge` ou texto muted)
    - `Card` com:
      - Nome do profissional responsavel
      - `Badge` de tipo de atendimento (Presencial/Online)
      - Texto da evolucao (truncado em 3 linhas com `line-clamp-3`)
      - `Button` (variant link) "Ver mais" — expande o card para exibir texto completo (Collapsible ou expandir inline)
  - Ordenacao: mais recente primeiro (descendente por data)

**Dados exibidos**:
- Lista de evolucoes: GET /patients/[id]/records — retorna evolucoes com data, profissional, texto, tipo de atendimento
- Atendimentos sem evolucao: GET /patients/[id]/pending-records — lista de atendimentos que ainda nao tem evolucao registrada (para controlar visibilidade do botao)

**Acoes do usuario**:
- Clicar "Registrar evolucao" -> navega para `/atendimentos/[id]/evolucao` (Tela 18). Se houver mais de um atendimento pendente, abre `Dialog` (sm) com `Select` do atendimento (exibe data + horario para identificacao) + botao "Continuar".
- Clicar "Ver mais" em um card -> expande texto completo inline (toggle)
- Scroll na timeline para ver evolucoes anteriores

**Estados**:
- **Vazio**: icone FileText (muted, grande) + "Nenhuma evolucao registrada" + "As evolucoes clinicas aparecerao aqui apos serem registradas pelos profissionais responsaveis." + sem botao (o botao "Registrar evolucao" no cabecalho ja esta disponivel se houver atendimento pendente)
- **Loading**: Skeleton da timeline (3 cards placeholder com linhas animadas)
- **Erro**: Alert (variant destructive): "Erro ao carregar prontuario."
- **Apenas visualizacao (profissional sem permissao de escrita)**: botao "Registrar evolucao" oculto; timeline em modo somente leitura

---

### Tela 18: Formulario de evolucao
**Feature**: F04 | **User Stories**: US-13
**Rota**: `/atendimentos/[id]/evolucao`
**Acesso**: profissional autonomo, profissional de clinica (somente o profissional vinculado ao atendimento — DR-CL-3)

**Layout**:

```
+------------------------------------------------------------------+
| SIDEBAR |  HEADER: Atendimentos > Evolucao                       |
| (280px) |--------------------------------------------------------|
|         |                                                        |
|  Nav    |  +----------------------------------------------------+|
|  items  |  | CARD (max-w-3xl)                                    ||
|         |  |                                                    ||
|         |  | Titulo: "Registrar evolucao clinica"                ||
|         |  |                                                    ||
|         |  | +------------------------------------------------+ ||
|         |  | | CONTEXTO (read-only, bg-muted, rounded)        | ||
|         |  | |                                                | ||
|         |  | | Data do atendimento: 12/02/2026 - 08:00-09:00 | ||
|         |  | | Paciente: Maria Silva                          | ||
|         |  | | Profissional: Dr. Joao Silva                   | ||
|         |  | | Tipo: Presencial                               | ||
|         |  | +------------------------------------------------+ ||
|         |  |                                                    ||
|         |  | +------------------------------------------------+ ||
|         |  | | [Alert warning]:                                | ||
|         |  | | "Apos salvar, a evolucao nao podera ser        | ||
|         |  | |  editada ou excluida. Revise o texto antes     | ||
|         |  | |  de salvar."                                   | ||
|         |  | +------------------------------------------------+ ||
|         |  |                                                    ||
|         |  | Evolucao clinica*                                   ||
|         |  | +------------------------------------------------+ ||
|         |  | | Textarea (min-h-[200px])                       | ||
|         |  | | ou editor rich text simples (bold, italic,    | ||
|         |  | | listas nao-ordenadas)                         | ||
|         |  | |                                                | ||
|         |  | | Placeholder: "Descreva a evolucao clinica     | ||
|         |  | | do paciente nesta sessao..."                  | ||
|         |  | |                                                | ||
|         |  | +------------------------------------------------+ ||
|         |  |                                                    ||
|         |  | +----------+  +----------------------------+       ||
|         |  | | Cancelar |  | Salvar evolucao (primary)  |       ||
|         |  | | (outline)|  |                            |       ||
|         |  | +----------+  +----------------------------+       ||
|         |  |                                                    ||
|         |  +----------------------------------------------------+|
|         |                                                        |
+------------------------------------------------------------------+
```

**Componentes**:
- App shell (sidebar + header + content area)
- `Breadcrumb` — "Atendimentos > Evolucao"
- `Card` — container principal (max-w-3xl)
- Secao de contexto (read-only):
  - Container com `bg-muted rounded-lg p-4`
  - Dados do atendimento: data/hora, nome do paciente, nome do profissional, tipo
  - Todos os campos sao somente leitura (texto estatico)
- `Alert` (variant warning, com icone AlertTriangle) — "Apos salvar, a evolucao nao podera ser editada ou excluida. Revise o texto antes de salvar."
- `Textarea` (min-h-[200px]) — campo principal para texto livre da evolucao. Alternativa: editor rich text simples com toolbar minima (bold, italic, lista nao-ordenada) usando TipTap ou similar.
- `Button` (variant outline) — "Cancelar" volta para `/pacientes/[pacienteId]/prontuario`
- `Button` (variant primary) — "Salvar evolucao" -> ao clicar, abre `AlertDialog` de confirmacao antes de salvar

**Dados exibidos**:
- Dados do atendimento: GET /appointments/[id] — retorna data, hora, paciente, profissional, tipo
- Verificacao de permissao: servidor valida que o profissional logado e o vinculado ao atendimento (DR-CL-3)

**Acoes do usuario**:
- Escrever texto da evolucao no campo principal
- Clicar "Salvar evolucao" -> abre `AlertDialog` de confirmacao: "Tem certeza que deseja salvar esta evolucao? Esta acao e irreversivel. A evolucao nao podera ser editada ou excluida apos salva." + botoes "Cancelar" (outline) / "Sim, salvar" (primary)
- Confirmar no AlertDialog -> POST /appointments/[id]/record -> Toast sucesso "Evolucao registrada com sucesso" + navega para `/pacientes/[pacienteId]/prontuario`
- Clicar "Cancelar" -> navega para `/pacientes/[pacienteId]/prontuario`

**Estados**:
- **Vazio**: campo de texto vazio com placeholder
- **Loading**: botao "Salvar" com Spinner + desabilitado; campo de texto desabilitado
- **Erro**: Toast (variant destructive) para erros de servidor
- **Erro (evolucao ja existe)**: Alert (variant destructive) no topo: "Ja existe uma evolucao registrada para este atendimento." (DR-CL-2) + botao "Ver evolucao existente"
- **Erro (sem permissao)**: redireciona para pagina de acesso negado (403) ou Alert: "Voce nao tem permissao para registrar evolucao neste atendimento."
- **Validacao**: inline — "A evolucao clinica e obrigatoria" (campo nao pode ser vazio; min 10 caracteres)

=================================================================

## P1 — Feature F05: Contas a Receber e Baixa

---

### Tela 19: Lista de contas a receber
**Feature**: F05 | **User Stories**: US-15
**Rota**: `/financeiro`
**Acesso**: profissional autonomo, secretaria, admin de clinica

**Layout**:

```
+------------------------------------------------------------------+
| SIDEBAR |  HEADER: Financeiro                                    |
| (280px) |--------------------------------------------------------|
|         |                                                        |
|  Nav    |  +----------------------------------------------------+|
|  items  |  | Titulo: "Contas a receber"                          ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | TOTALIZADORES (3 cards em row, gap-4)               ||
|         |  |                                                    ||
|         |  | +------------+  +-----------+  +--------------+    ||
|         |  | | Total      |  | Total     |  | Total do     |    ||
|         |  | | pendente   |  | pago      |  | periodo      |    ||
|         |  | |            |  |           |  |              |    ||
|         |  | | R$3.450,00 |  | R$8.200,0 |  | R$11.650,00 |    ||
|         |  | | (amber/    |  | (emerald/ |  | (slate/     |    ||
|         |  | |  yellow)   |  |  green)   |  |  neutral)   |    ||
|         |  | +------------+  +-----------+  +--------------+    ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | FILTROS (row, gap-4, flex-wrap)                     ||
|         |  |                                                    ||
|         |  | [DateRangePicker: periodo]                         ||
|         |  | [Combobox: paciente]                                ||
|         |  | [Select: profissional] (so em clinica)             ||
|         |  | [Select: status (Todos, Pendente, Pago)]           ||
|         |  +----------------------------------------------------+|
|         |                                                        |
|         |  +----------------------------------------------------+|
|         |  | TABELA (DataTable)                                  ||
|         |  |                                                    ||
|         |  | Data atend. | Paciente | Profis. | Valor  | Status ||
|         |  | Acoes                                               ||
|         |  |-------------|----------|---------|--------|--------||
|         |  | 12/02/2026  | Maria S. | Dr.Joao | R$200  |[Pend.] ||
|         |  | [Dar baixa] [Recibo] [Detalhes]                    ||
|         |  |-------------|----------|---------|--------|--------||
|         |  | 10/02/2026  | Pedro L. | Dr.Joao | R$200  |[Pago ] ||
|         |  | [-] [Recibo] [Detalhes]                            ||
|         |  |-------------|----------|---------|--------|--------||
|         |  | 05/02/2026  | Ana R.   | Dra.Ana | R$150  |[Pend.] ||
|         |  | [Dar baixa] [Recibo] [Detalhes]                    ||
|         |  |                                                    ||
|         |  | < 1 2 3 >  (Pagination)                            ||
|         |  +----------------------------------------------------+|
|         |                                                        |
+------------------------------------------------------------------+
```

**Componentes**:
- App shell (sidebar + header + content area)
- Cabecalho: titulo "Contas a receber"
- Totalizadores (3 `Card` em row, `grid grid-cols-3 gap-4`):
  - Card "Total pendente": icone Clock (amber-500) + valor formatado (R$ X.XXX,XX) + `text-amber-600` + label muted "Pendente"
  - Card "Total pago": icone CheckCircle (emerald-500) + valor formatado + `text-emerald-600` + label muted "Pago"
  - Card "Total do periodo": icone DollarSign (slate-500) + valor formatado + `text-slate-600` + label muted "Total"
- Barra de filtros (`flex flex-wrap gap-4`):
  - `DateRangePicker` (shadcn Popover + Calendar range) — periodo (default: mes atual)
  - `Combobox` (Command + Popover) — filtro por paciente (busca por nome)
  - `Select` — filtro por profissional (apenas clinica)
  - `Select` — filtro por status: "Todos", "Pendente", "Pago"
- `DataTable` — tabela paginada e ordenavel:
  - Data do atendimento (date, formato DD/MM/AAAA, ordenavel — default: mais recente)
  - Paciente (string)
  - Profissional (string, oculto em autonomo)
  - Valor (currency, formato R$ XXX,XX)
  - Status: `Badge` (pendente = `bg-amber-100 text-amber-800`; pago = `bg-emerald-100 text-emerald-800`)
  - Acoes (`DropdownMenu` ou botoes inline):
    - "Dar baixa" (apenas se pendente) — abre Dialog de baixa (Tela 20)
    - "Emitir recibo" (P2 — desabilitado com tooltip "Disponivel em breve")
    - "Ver detalhes" — abre Dialog com dados completos da conta
- `Pagination` — paginacao (10, 20, 50 itens)

**Dados exibidos**:
- Lista de contas a receber: GET /receivables?startDate=&endDate=&patientId=&professionalId=&status=&page=&limit=
- Totalizadores: calculados pela API ou no frontend a partir dos dados filtrados
- Filtrado pelo tenant do usuario logado (DR-IA-4)

**Acoes do usuario**:
- Aplicar filtros (periodo, paciente, profissional, status) -> recarrega tabela e totalizadores
- Clicar "Dar baixa" -> abre Dialog de baixa (Tela 20)
- Clicar "Emitir recibo" -> P2, desabilitado nesta versao (tooltip "Disponivel em breve")
- Clicar "Ver detalhes" -> abre Dialog (sm) com dados completos: data do atendimento, paciente, profissional, valor, status, data da baixa (se pago), forma de pagamento (se pago)
- Alterar ordenacao da tabela (clicar cabecalho da coluna)
- Alterar paginacao

**Estados**:
- **Vazio**: icone Receipt (muted) + "Nenhuma conta a receber no periodo" + "As contas a receber sao criadas automaticamente ao marcar agendamentos como realizados."
- **Loading**: Skeleton dos totalizadores (3 cards) + Skeleton da tabela (8 linhas)
- **Erro**: Alert (variant destructive): "Erro ao carregar contas a receber."
- **Filtros sem resultado**: icone SearchX (muted) + "Nenhuma conta encontrada com os filtros aplicados" + botao "Limpar filtros"

---

### Tela 20: Dialog de baixa (pagamento)
**Feature**: F05 | **User Stories**: US-16
**Rota**: Dialog (aberta a partir da Tela 19)
**Acesso**: profissional autonomo, secretaria

**Layout**:

```
+------------------------------------------+
|  DIALOG (sm)                             |
|                                          |
|  Titulo: "Registrar pagamento"           |
|                                          |
|  +------------------------------------+  |
|  | INFORMACOES (read-only, bg-muted)  |  |
|  |                                    |  |
|  | Paciente: Maria Silva              |  |
|  | Data atend.: 12/02/2026            |  |
|  | Valor: R$ 200,00                   |  |
|  +------------------------------------+  |
|                                          |
|  Data do pagamento*                      |
|  +------------------------------------+  |
|  | DatePicker (default: hoje)         |  |
|  +------------------------------------+  |
|                                          |
|  Forma de pagamento*                     |
|  +------------------------------------+  |
|  | Select:                            |  |
|  |  - Dinheiro                        |  |
|  |  - PIX                             |  |
|  |  - Cartao de credito               |  |
|  |  - Cartao de debito                |  |
|  |  - Transferencia bancaria          |  |
|  +------------------------------------+  |
|                                          |
|  +----------+  +---------------------+   |
|  | Cancelar |  | Confirmar baixa     |   |
|  | (outline)|  | (primary)           |   |
|  +----------+  +---------------------+   |
|                                          |
+------------------------------------------+
```

**Componentes**:
- `Dialog` (size sm) — modal
- `DialogHeader` — "Registrar pagamento"
- Secao de informacoes (read-only):
  - Container com `bg-muted rounded-lg p-4`
  - Paciente: nome
  - Data do atendimento: DD/MM/AAAA
  - Valor: R$ XXX,XX (bold, text-lg)
- `DatePicker` (Popover + Calendar) — data do pagamento (default: data atual; nao permite data futura)
- `Select` — forma de pagamento:
  - Dinheiro
  - PIX
  - Cartao de credito
  - Cartao de debito
  - Transferencia bancaria
- `Button` (variant outline) — "Cancelar" fecha dialog
- `Button` (variant primary) — "Confirmar baixa"

**Dados exibidos**:
- Dados da conta a receber: ja carregados ao abrir o dialog (paciente, data atendimento, valor)

**Acoes do usuario**:
- Selecionar data do pagamento + forma de pagamento + "Confirmar baixa" -> POST /receivables/[id]/payment -> Toast sucesso (variant success) "Pagamento registrado com sucesso" + fecha dialog + atualiza linha na tabela (status muda para "Pago", Badge verde) + atualiza totalizadores
- Clicar "Cancelar" -> fecha dialog sem salvar

**Estados**:
- **Vazio**: data pre-preenchida com hoje; forma de pagamento vazia
- **Loading**: botao "Confirmar baixa" com Spinner + desabilitado
- **Erro**: Toast (variant destructive) para erros de servidor ou "Conta ja possui baixa registrada"
- **Validacao**:
  - Data do pagamento: inline — "Selecione a data do pagamento"
  - Forma de pagamento: inline — "Selecione a forma de pagamento"

=================================================================

## P2 e P3 — Telas futuras (placeholder)

As telas das features P2 e P3 serao especificadas quando essas prioridades forem alcancadas no roadmap. Abaixo o inventario planejado:

### P2 — Feature F06: Emissao de Recibos (US-17)

| # | Tela | Rota (prevista) | Descricao |
|---|------|-----------------|-----------|
| 21 | Lista de recibos emitidos | `/financeiro/recibos` | Listagem com filtros por periodo, paciente, profissional. Tabela com numero do recibo, data, paciente, valor, acoes (download PDF, reemitir). |
| 22 | Dialog de emissao de recibo | Dialog | Formulario para selecionar atendimentos/contas, revisar dados do recibo (profissional, paciente, valor, descricao), botao "Emitir recibo". |
| 23 | Visualizacao/download do recibo (PDF) | `/financeiro/recibos/[id]` | Preview do recibo em formato PDF com opcao de download. Dados imutaveis apos emissao (DR-FI-3). |

### P2 — Feature F07: Dashboard Financeiro (US-18)

| # | Tela | Rota (prevista) | Descricao |
|---|------|-----------------|-----------|
| 24 | Dashboard financeiro | `/dashboard` ou `/financeiro/dashboard` | Cards de metricas (entradas, pendencias, vencidos), grafico de aging (0-30d, 31-60d, 61-90d, +90d), filtros por periodo e profissional. |

### P2 — Feature F08: Assinatura e Trial (US-19, US-20, US-21, US-22)

| # | Tela | Rota (prevista) | Descricao |
|---|------|-----------------|-----------|
| 25 | Banner de trial | Componente global | Banner no topo do app shell: "Modo de avaliacao — X dias restantes" + botao "Contratar agora". |
| 26 | Tela de contratacao de plano | `/assinatura` | Cards de planos com precos, limites e funcionalidades. Botao "Contratar" por plano. Integracao com gateway de pagamento. |
| 27 | Tela de bloqueio (trial expirado) | `/assinatura/expirado` | Mensagem "Periodo de avaliacao expirado" + opcoes de contratacao (admin) ou mensagem de contato (nao-admin). |
| 28 | Gestao de assinatura | `/configuracoes/assinatura` | Dados do plano atual, data de renovacao, historico de pagamentos, botao "Fazer upgrade". |
| 29 | Dialog de limpeza de dados demo | Dialog | Confirmacao para remover dados de demonstracao apos contratacao. |

### P3 — Feature F09: Notificacoes via WhatsApp (US-23, US-24)

| # | Tela | Rota (prevista) | Descricao |
|---|------|-----------------|-----------|
| 30 | Configuracoes de notificacao | `/configuracoes/notificacoes` | Toggles para ativar/desativar lembretes automaticos, antecedencia do lembrete (24h, 48h), preview do template da mensagem. |
| 31 | Log de notificacoes | `/configuracoes/notificacoes/log` | Tabela com historico de notificacoes enviadas: data, paciente, tipo (lembrete/criacao/alteracao/cancelamento), status (enviado/falha), mensagem. |

**Nota**: As especificacoes detalhadas (layout ASCII, componentes, dados, acoes, estados) serao criadas para cada tela acima quando a respectiva feature entrar em desenvolvimento. O formato seguira o mesmo padrao utilizado nas telas P0 e P1 deste documento.

=================================================================

**Proximo passo**: Implementar as telas P0 (F01 + F02), seguidas das telas P1 (F03 + F04 + F05), utilizando Next.js + shadcn/ui + Tailwind CSS conforme design system definido em `docs/ui/design-system.md`.
