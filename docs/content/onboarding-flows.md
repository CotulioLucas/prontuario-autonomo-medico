# Fluxos de Onboarding

**Fonte**: docs/context/project-brief.md, docs/domain/bounded-contexts.md, ADRs 0003/0006/0011
**Status**: Documentado — pendente validação com stakeholders
**Última atualização**: 2026-02-10

=================================================================

## Visão geral

Este documento descreve os dois fluxos de onboarding da plataforma:

1. **Profissional Autônomo** — usuário único; tenant com um profissional.
2. **Clínica** — tenant com múltiplos usuários e papéis (médico, psicólogo, secretária, admin).

Ambos os fluxos compartilham o modelo de monetização SaaS mensal com trial de 1-2 dias e dados de demonstração (pacientes fake, agendamentos, evoluções). Pacientes **não** fazem login na plataforma.

### Bounded Contexts envolvidos

| Etapa | Contexto(s) |
|-------|-------------|
| Cadastro, confirmação de e-mail, validação de identidade, consentimento LGPD | Identidade e Acesso |
| Criação do tenant em modo trial, seed de dados fake, contratação de plano | Assinatura |
| Tour guiado, exploração | Aplicação (front-end / orquestração) |
| Convite de profissionais e atribuição de papéis (clínica) | Identidade e Acesso |

### Eventos de domínio gerados durante o onboarding

| Evento | Quando |
|--------|--------|
| UsuárioRegistrado | Cadastro concluído |
| E-mailConfirmado | Usuário clicou no link de confirmação |
| IdentidadeValidada | Registro profissional aceito (declaratório no MVP) |
| ConsentimentoRegistrado | Aceite do termo LGPD |
| TrialIniciado | Tenant criado em modo trial |
| AssinaturaContratada | Plano contratado após trial |
| PapelAtribuído | Profissional aceita convite da clínica |

=================================================================

## Fluxo 1: Profissional Autônomo

### Diagrama geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    FLUXO: PROFISSIONAL AUTÔNOMO                        │
└─────────────────────────────────────────────────────────────────────────┘

  [1. Cadastro]
       │
       ▼
  ┌──────────┐    ┌─────────────────┐
  │ Dados OK?│─NO─▶ Exibir erros    │──▶ [voltar ao formulário]
  └────┬─────┘    └─────────────────┘
       │ SIM
       ▼
  [2. Envio de e-mail de confirmação]
       │
       ▼
  ┌─────────────────┐    ┌───────────────────────────┐
  │ E-mail recebido?│─NO─▶ Tela: reenviar e-mail     │
  └────┬────────────┘    │ (máx. 3 tentativas)       │
       │ SIM             │ Após 3: suporte            │
       ▼                 └───────────────────────────┘
  [3. Validação de identidade (registro profissional)]
       │
       ▼
  ┌──────────────────┐    ┌──────────────────────────────────┐
  │ Registro válido? │─NO─▶ Exibir erro / orientar correção  │
  └────┬─────────────┘    └──────────────────────────────────┘
       │ SIM
       ▼
  [4. Aceite do termo de consentimento LGPD]
       │
       ▼
  ┌────────────┐    ┌──────────────────────────┐
  │ Aceitou?   │─NO─▶ Bloquear avanço          │
  └────┬───────┘    │ Exibir motivo obrigatório │
       │ SIM        └──────────────────────────┘
       ▼
  [5. Criação do tenant em modo trial (1-2 dias)]
       │
       ▼
  [6. Seed automático de dados de demonstração]
       │
       ▼
  [7. Exploração guiada (tour / onboarding wizard)]
       │
       ▼
  ┌──────────────────┐
  │ Trial expirou?   │─NÃO─▶ [continuar explorando]
  └────┬─────────────┘
       │ SIM
       ▼
  [8. Tela de contratação de plano]
       │
       ▼
  ┌──────────────────┐    ┌───────────────────────────┐
  │ Contratou plano? │─NO─▶ Acesso bloqueado           │
  └────┬─────────────┘    │ Apenas tela de contratação │
       │ SIM              └───────────────────────────┘
       ▼
  [9. Acesso completo + opção de limpar dados fake]
       │
       ▼
  ┌────────────────┐    ┌─────────────────────────┐
  │ Limpar dados?  │─NO─▶ Manter dados fake        │
  └────┬───────────┘    │ (pode limpar depois)     │
       │ SIM            └─────────────────────────┘
       ▼
  [Dados de demonstração removidos]
       │
       ▼
  ════════════════════════════════
  ║  ONBOARDING CONCLUÍDO       ║
  ║  Plataforma pronta para uso ║
  ════════════════════════════════
```

### Detalhamento por etapa

---

#### Etapa 1 — Cadastro

**Campos obrigatórios:**

| Campo | Validação | Erro |
|-------|-----------|------|
| Nome completo | Mínimo 3 caracteres, sem números | "Nome inválido" |
| E-mail | Formato válido; unicidade no sistema | "E-mail já cadastrado" / "E-mail inválido" |
| Senha | Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial | "Senha fraca — requisitos: ..." |
| Confirmação de senha | Igual à senha | "As senhas não conferem" |
| Tipo de profissional | Seleção obrigatória (psicólogo, fisioterapeuta, massoterapeuta, outro) | "Selecione o tipo de profissional" |

**Ponto de decisão — E-mail já existe?**

```
  [Submeter formulário]
         │
         ▼
  ┌──────────────────────┐
  │ E-mail já cadastrado │
  │ no sistema?          │
  └────┬────────┬────────┘
       │ SIM    │ NÃO
       ▼        ▼
  [Erro:       [Criar registro
   "E-mail      com status
   já            PENDENTE_
   cadastrado"] CONFIRMAÇÃO]
```

**Evento gerado**: `UsuárioRegistrado` (status: pendente_confirmação).

---

#### Etapa 2 — Confirmação de e-mail

O sistema envia e-mail com link de confirmação (token com expiração de 24h).

**Cenários de erro:**

| Cenário | Comportamento |
|---------|---------------|
| Usuário não recebeu o e-mail | Tela com botão "Reenviar e-mail" (máximo 3 reenvios em 1 hora) |
| Link expirado (>24h) | Redirecionar para tela de reenvio com mensagem "Link expirado" |
| Token inválido ou adulterado | Erro genérico "Link inválido" (não revelar detalhes por segurança) |
| Excedeu tentativas de reenvio | Exibir mensagem com contato de suporte |

**Evento gerado**: `E-mailConfirmado`.

```
  [Clique no link do e-mail]
         │
         ▼
  ┌──────────────────┐
  │ Token válido?    │
  └───┬─────────┬────┘
      │ SIM     │ NÃO
      ▼         ▼
  [Confirmar  ┌──────────────────┐
   e-mail]    │ Token expirado?  │
      │       └──┬───────────┬───┘
      │          │ SIM       │ NÃO
      │          ▼           ▼
      │       [Reenviar]  [Erro: link
      │                    inválido]
      ▼
  [Redirecionar para etapa 3]
```

---

#### Etapa 3 — Validação de identidade (registro profissional)

No MVP, a validação é **declaratória**: o profissional informa o número do registro (CRP, CRM, CREFITO, etc.) e o tipo de conselho. Não há verificação externa automatizada na primeira versão.

**Campos:**

| Campo | Validação | Erro |
|-------|-----------|------|
| Conselho profissional | Seleção obrigatória (CRP, CRM, CREFITO, CREFONO, outro) | "Selecione o conselho" |
| Número do registro | Formato compatível com o conselho selecionado; não vazio | "Número de registro inválido" |
| UF do registro | Estado brasileiro válido | "Selecione a UF" |

**Evolução futura (pós-MVP)**: Integração com provedor externo de verificação de identidade (conforme ADR 0011) — validação de documento (CPF), eventual comparação com selfie. O campo de registro profissional poderá ser validado via consulta a APIs dos conselhos (quando disponíveis).

**Ponto de decisão — Formato do registro:**

```
  [Informar registro profissional]
         │
         ▼
  ┌───────────────────────────┐
  │ Formato válido para       │
  │ o conselho selecionado?   │
  └────┬──────────────┬───────┘
       │ SIM           │ NÃO
       ▼               ▼
  [Salvar registro   [Exibir erro com
   no perfil]         formato esperado]
       │
       ▼
  [Evento: IdentidadeValidada]
```

**Nota**: No MVP, o status do usuário é alterado para `identidade_validada` imediatamente após preenchimento. Em versões futuras, o status poderá ser `pendente_validação` até retorno do provedor externo (aprovado/rejeitado).

---

#### Etapa 4 — Aceite do termo de consentimento LGPD

O usuário deve ler e aceitar o Termo de Consentimento para Tratamento de Dados Pessoais, conforme LGPD e ADR 0006.

**Requisitos:**

- Exibir texto completo do termo (com scroll obrigatório ou indicador de leitura).
- Checkbox: "Li e aceito o Termo de Consentimento para Tratamento de Dados Pessoais".
- **Obrigatório**: não é possível avançar sem aceite.
- Registrar data/hora, versão do termo e IP do aceite para fins de auditoria.

**Ponto de decisão:**

```
  [Exibir termo LGPD]
         │
         ▼
  ┌──────────────┐
  │ Usuário      │
  │ aceitou?     │
  └──┬───────┬───┘
     │ SIM   │ NÃO
     ▼       ▼
  [Evento:  [Bloquear avanço.
   Consen-   Exibir: "O aceite do
   timento   termo é obrigatório
   Regis-    para uso da plataforma."]
   trado]
     │
     ▼
  [Avançar para etapa 5]
```

**Evento gerado**: `ConsentimentoRegistrado` (userId, tenantId, versão do termo, timestamp, IP).

---

#### Etapa 5 — Criação do tenant em modo trial

Após o aceite do LGPD, o sistema cria automaticamente o tenant vinculado ao profissional.

**Configuração do tenant (autônomo):**

| Atributo | Valor |
|----------|-------|
| Tipo | `autonomo` |
| Status da assinatura | `trial` |
| Duração do trial | 1-2 dias (configurável) |
| Data de expiração | `now() + duração do trial` |
| Proprietário | userId do profissional |
| Papéis | Nenhum (profissional autônomo tem papel implícito) |

**Evento gerado**: `TrialIniciado` (tenantId, userId, dataExpiracao).

---

#### Etapa 6 — Seed automático de dados de demonstração

Imediatamente após a criação do tenant em modo trial, o sistema popula dados de demonstração (fake) para que o profissional explore a plataforma.

**Dados gerados:**

| Entidade | Quantidade | Exemplos |
|----------|-----------|----------|
| Pacientes fake | 5-8 | Nomes fictícios, dados inventados, marcados como `demo: true` |
| Agendamentos | 10-15 | Distribuídos nos próximos 7 dias + alguns no passado |
| Atendimentos realizados | 3-5 | Vinculados a agendamentos passados |
| Evoluções | 3-5 | Texto de exemplo em cada atendimento |
| Contas a receber | 3-5 | Vinculadas a atendimentos; status variados (pago, pendente, vencido) |

**Regras:**

- Todos os dados fake são marcados com flag `demo: true` para facilitar remoção posterior.
- Dados de demonstração **não** geram eventos de domínio de negócio (são dados de seed, não operações reais).
- O profissional vê um banner permanente durante o trial: "Modo de avaliação — dados de demonstração".

---

#### Etapa 7 — Exploração guiada (tour / onboarding wizard)

Após o seed, o profissional é redirecionado ao dashboard com um tour interativo.

**Passos do tour:**

| Ordem | Tela / Área | O que mostrar |
|-------|-------------|---------------|
| 1 | Dashboard | Visão geral: agenda do dia, resumo financeiro, pacientes recentes |
| 2 | Agenda | Como visualizar, criar e editar agendamentos |
| 3 | Pacientes | Lista de pacientes (fake); como cadastrar novo paciente |
| 4 | Prontuário / Evolução | Como registrar evolução de um atendimento |
| 5 | Financeiro | Contas a receber, baixa de pagamento, aging |
| 6 | Recibos | Como emitir recibo para reembolso |
| 7 | Configurações | Dados do profissional, integração com calendário externo |

**Comportamento:**

- O tour pode ser ignorado (botão "Pular tour").
- O tour pode ser reiniciado a qualquer momento em Configurações > Ajuda.
- Progresso do tour salvo por usuário.

---

#### Etapa 8 — Expiração do trial e tela de contratação

Quando o trial expira, o acesso é restrito.

```
  ┌──────────────────────┐
  │ Job verifica trials  │ (execução periódica ou lazy check no login)
  │ expirados            │
  └────────┬─────────────┘
           │
           ▼
  ┌────────────────────┐
  │ Trial expirado?    │
  └──┬─────────────┬───┘
     │ SIM          │ NÃO
     ▼              ▼
  [Evento:        [Acesso
   TrialExpirado]  normal]
     │
     ▼
  ┌────────────────────────────────────────────────────┐
  │ TELA DE CONTRATAÇÃO                                │
  │                                                    │
  │  "Seu período de avaliação expirou."               │
  │                                                    │
  │  ┌──────────────┐    ┌──────────────────────┐     │
  │  │ Plano Mensal  │    │ Plano Anual (desc.)  │     │
  │  │ R$ XX/mês     │    │ R$ XX/mês            │     │
  │  └──────────────┘    └──────────────────────┘     │
  │                                                    │
  │  [Contratar agora]                                 │
  │                                                    │
  │  Precisa de ajuda? Fale com o suporte.             │
  └────────────────────────────────────────────────────┘
```

**Regras de bloqueio durante trial expirado:**

| Ação | Permitida? |
|------|-----------|
| Login | Sim (redireciona para tela de contratação) |
| Visualizar dados | Não |
| Criar/editar registros | Não |
| Contratar plano | Sim |
| Contatar suporte | Sim |

**Evento gerado**: `TrialExpirado`.

---

#### Etapa 9 — Contratação de plano e limpeza de dados fake

Após contratar o plano, o profissional ganha acesso completo.

```
  [Contratação do plano]
         │
         ▼
  [Evento: AssinaturaContratada]
         │
         ▼
  ┌──────────────────────────────────────────┐
  │ "Parabéns! Seu plano foi ativado."       │
  │                                          │
  │ Deseja remover os dados de demonstração? │
  │                                          │
  │ [Sim, limpar dados fake]                 │
  │ [Não, manter por enquanto]               │
  │                                          │
  │ (Você pode limpar depois em              │
  │  Configurações > Dados de demonstração)  │
  └──────────────────────────────────────────┘
         │
         ├── SIM ──▶ [Remover registros com flag demo: true]
         │                │
         │                ▼
         │          [Confirmação: "Dados de demonstração removidos"]
         │
         └── NÃO ──▶ [Manter dados; banner informativo permanece]
```

**Evento gerado**: `AssinaturaContratada` (tenantId, planoId, dataInicio, dataRenovacao).

**Regras de limpeza:**

- A limpeza remove **todos** os registros com `demo: true` (pacientes, agendamentos, atendimentos, evoluções, contas a receber).
- A limpeza é **irreversível** — exibir confirmação antes de executar.
- A opção de limpar dados fake fica disponível em Configurações > Dados de demonstração enquanto houver registros demo.

=================================================================

## Fluxo 2: Clínica

### Diagrama geral

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         FLUXO: CLÍNICA                                 │
└─────────────────────────────────────────────────────────────────────────┘

  [1. Cadastro do admin]
       │
       ▼
  [2. Dados da clínica (nome, CNPJ, endereço, logo, cores)]
       │
       ▼
  ┌──────────┐    ┌─────────────────┐
  │ Dados OK?│─NO─▶ Exibir erros    │──▶ [voltar ao formulário]
  └────┬─────┘    └─────────────────┘
       │ SIM
       ▼
  [3. Envio de e-mail de confirmação]
       │
       ▼
  ┌─────────────────┐    ┌───────────────────────────┐
  │ E-mail recebido?│─NO─▶ Tela: reenviar e-mail     │
  └────┬────────────┘    │ (máx. 3 tentativas)       │
       │ SIM             └───────────────────────────┘
       ▼
  [4. Validação de identidade do admin]
       │
       ▼
  ┌──────────────────┐    ┌──────────────────────────────────┐
  │ Registro válido? │─NO─▶ Exibir erro / orientar correção  │
  └────┬─────────────┘    └──────────────────────────────────┘
       │ SIM
       ▼
  [5. Aceite do termo de consentimento LGPD]
       │
       ▼
  ┌────────────┐    ┌──────────────────────────┐
  │ Aceitou?   │─NO─▶ Bloquear avanço          │
  └────┬───────┘    └──────────────────────────┘
       │ SIM
       ▼
  [6. Criação do tenant (clínica) em modo trial]
       │
       ▼
  [7. Seed automático de dados de demonstração]
       │
       ▼
  [8. Convidar profissionais e atribuir papéis]
       │
       ├──▶ Para cada convite:
       │       │
       │       ▼
       │    [9. Profissional recebe e-mail de convite]
       │       │
       │       ▼
       │    ┌─────────────────┐    ┌─────────────────────┐
       │    │ Aceitou convite?│─NO─▶ Lembrete após 48h    │
       │    └────┬────────────┘    │ Expirar após 7 dias  │
       │         │ SIM             └─────────────────────┘
       │         ▼
       │    [Profissional faz cadastro próprio]
       │         │
       │         ▼
       │    [Evento: PapelAtribuído]
       │
       ▼
  [10. Exploração guiada (tour / onboarding wizard)]
       │
       ▼
  ┌──────────────────┐
  │ Trial expirou?   │─NÃO─▶ [continuar explorando]
  └────┬─────────────┘
       │ SIM
       ▼
  [11. Tela de contratação de plano]
       │
       ▼
  ┌──────────────────┐    ┌───────────────────────────┐
  │ Contratou plano? │─NO─▶ Acesso bloqueado           │
  └────┬─────────────┘    │ Apenas admin pode contratar│
       │ SIM              └───────────────────────────┘
       ▼
  [Acesso completo + opção de limpar dados fake]
       │
       ▼
  ════════════════════════════════
  ║  ONBOARDING CONCLUÍDO       ║
  ║  Clínica pronta para uso    ║
  ════════════════════════════════
```

### Detalhamento por etapa

---

#### Etapa 1 — Cadastro do admin da clínica

O admin é o primeiro usuário da clínica e quem configura o tenant.

**Campos obrigatórios:**

| Campo | Validação | Erro |
|-------|-----------|------|
| Nome completo | Mínimo 3 caracteres, sem números | "Nome inválido" |
| E-mail | Formato válido; unicidade no sistema | "E-mail já cadastrado" / "E-mail inválido" |
| Senha | Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial | "Senha fraca — requisitos: ..." |
| Confirmação de senha | Igual à senha | "As senhas não conferem" |

**Diferença do fluxo autônomo**: O admin da clínica **não** precisa informar tipo de profissional nesta etapa. O campo "tipo de profissional" é preenchido pelos profissionais convidados posteriormente. O admin pode ou não ser profissional de saúde.

**Evento gerado**: `UsuárioRegistrado` (status: pendente_confirmação, papel: admin).

---

#### Etapa 2 — Dados da clínica

Após o cadastro pessoal, o admin informa os dados da clínica para configurar o tenant.

**Campos:**

| Campo | Obrigatório | Validação | Erro |
|-------|-------------|-----------|------|
| Nome da clínica | Sim | Mínimo 3 caracteres | "Nome da clínica inválido" |
| CNPJ | Sim | Formato válido (XX.XXX.XXX/XXXX-XX); dígitos verificadores | "CNPJ inválido" |
| Endereço (logradouro, número, complemento, bairro, cidade, UF, CEP) | Sim (exceto complemento) | CEP válido; UF válida | "Endereço incompleto" / "CEP inválido" |
| Telefone da clínica | Não | Formato (XX) XXXXX-XXXX ou (XX) XXXX-XXXX | "Telefone inválido" |
| Logo da clínica | Não | Imagem PNG/JPG/SVG; máximo 2 MB | "Arquivo inválido — use PNG, JPG ou SVG até 2 MB" |
| Cores da marca (primária e secundária) | Não | Código hexadecimal válido (#RRGGBB) | "Cor inválida" |

**Ponto de decisão — CNPJ duplicado:**

```
  [Submeter dados da clínica]
         │
         ▼
  ┌──────────────────────┐
  │ CNPJ já cadastrado   │
  │ no sistema?          │
  └────┬────────┬────────┘
       │ SIM    │ NÃO
       ▼        ▼
  [Erro:       [Salvar dados
   "CNPJ já     da clínica]
   cadastrado.
   Contacte o
   suporte."]
```

**Nota**: Logo e cores podem ser preenchidos depois em Configurações > Personalização. O onboarding permite pular esses campos para não bloquear o fluxo.

---

#### Etapa 3 — Confirmação de e-mail

Idêntica à Etapa 2 do fluxo autônomo. O sistema envia e-mail com link de confirmação (token com expiração de 24h).

**Cenários de erro**: mesmos do fluxo autônomo (ver Etapa 2 do Fluxo 1).

**Evento gerado**: `E-mailConfirmado`.

---

#### Etapa 4 — Validação de identidade do admin

No MVP, a validação é **declaratória**, assim como no fluxo autônomo. Porém, para o admin da clínica, o foco é na identidade pessoal (CPF / documento) e, opcionalmente, no registro profissional caso seja profissional de saúde.

**Campos:**

| Campo | Obrigatório | Validação | Erro |
|-------|-------------|-----------|------|
| CPF | Sim | Formato válido; dígitos verificadores | "CPF inválido" |
| É profissional de saúde? | Sim | Seleção (sim/não) | — |
| Conselho profissional | Condicional (se sim acima) | Seleção (CRP, CRM, CREFITO, etc.) | "Selecione o conselho" |
| Número do registro | Condicional (se sim acima) | Formato compatível | "Número de registro inválido" |
| UF do registro | Condicional (se sim acima) | Estado brasileiro válido | "Selecione a UF" |

**Fluxo condicional:**

```
  [Informar CPF]
         │
         ▼
  ┌──────────────────────────┐
  │ Admin é profissional     │
  │ de saúde?                │
  └──┬───────────────┬───────┘
     │ SIM            │ NÃO
     ▼                ▼
  [Solicitar        [Pular registro
   conselho,         profissional]
   número de              │
   registro, UF]          │
     │                     │
     ▼                     │
  [Validar formato]        │
     │                     │
     ├─────────────────────┘
     ▼
  [Evento: IdentidadeValidada]
```

**Evolução futura**: Integração com provedor externo (ADR 0011) para validação de CPF, documento e eventual selfie.

---

#### Etapa 5 — Aceite do termo de consentimento LGPD

Idêntico à Etapa 4 do fluxo autônomo. O admin aceita o termo em nome pessoal **e** como representante legal da clínica.

**Requisitos adicionais para clínica:**

- O termo inclui cláusula de responsabilidade do admin como controlador/operador dos dados dos pacientes da clínica.
- Registrar que o aceite é feito pelo admin na qualidade de representante legal (vinculado ao CNPJ).

**Evento gerado**: `ConsentimentoRegistrado` (userId, tenantId, versão do termo, qualidade: representante_legal, timestamp, IP).

---

#### Etapa 6 — Criação do tenant (clínica) em modo trial

Após o aceite do LGPD, o sistema cria o tenant da clínica.

**Configuração do tenant (clínica):**

| Atributo | Valor |
|----------|-------|
| Tipo | `clinica` |
| Status da assinatura | `trial` |
| Duração do trial | 1-2 dias (configurável) |
| Data de expiração | `now() + duração do trial` |
| Admin | userId do admin |
| Nome da clínica | Informado na etapa 2 |
| CNPJ | Informado na etapa 2 |
| Logo / Cores | Se informados na etapa 2 |
| Papéis disponíveis | admin, médico, psicólogo, secretária |

**Evento gerado**: `TrialIniciado` (tenantId, userId, tipo: clinica, dataExpiracao).

---

#### Etapa 7 — Seed automático de dados de demonstração

Idêntico ao fluxo autônomo (ver Etapa 6 do Fluxo 1), com adições para o contexto de clínica:

**Dados adicionais gerados para clínica:**

| Entidade | Quantidade | Observação |
|----------|-----------|------------|
| Profissionais fake | 2-3 | Nomes fictícios, papéis variados (médico, psicólogo), marcados como `demo: true` |
| Pacientes fake | 8-12 | Distribuídos entre os profissionais fake |
| Agendamentos | 15-20 | Distribuídos entre profissionais fake |
| Atendimentos realizados | 5-8 | Vinculados a agendamentos passados |
| Evoluções | 5-8 | Texto de exemplo |
| Contas a receber | 5-8 | Status variados |

**Nota**: Os profissionais fake servem para demonstrar a visão multi-profissional da clínica. Quando profissionais reais forem convidados (etapa 8), eles coexistem com os dados demo até a limpeza.

---

#### Etapa 8 — Convidar profissionais e atribuir papéis

O admin pode convidar profissionais para a clínica. Esta etapa é **opcional durante o trial** — o admin pode explorar sozinho e convidar depois.

**Tela de convite:**

```
  ┌────────────────────────────────────────────────────────────────┐
  │ CONVIDAR PROFISSIONAIS                                        │
  │                                                               │
  │  E-mail do profissional: [________________________]           │
  │                                                               │
  │  Papel:  ○ Médico                                             │
  │          ○ Psicólogo                                          │
  │          ○ Secretária                                         │
  │          ○ Admin                                              │
  │                                                               │
  │  [Enviar convite]   [Pular — convidar depois]                 │
  │                                                               │
  │  ─────────────────────────────────────────────────            │
  │  Convites enviados:                                           │
  │  ┌──────────────────────┬───────────┬───────────┐             │
  │  │ E-mail               │ Papel     │ Status    │             │
  │  ├──────────────────────┼───────────┼───────────┤             │
  │  │ joao@email.com       │ Médico    │ Pendente  │             │
  │  │ maria@email.com      │ Psicólogo │ Aceito    │             │
  │  └──────────────────────┴───────────┴───────────┘             │
  └────────────────────────────────────────────────────────────────┘
```

**Validações do convite:**

| Cenário | Comportamento |
|---------|---------------|
| E-mail já é membro da clínica | Erro: "Este profissional já faz parte da clínica" |
| E-mail já tem convite pendente | Erro: "Já existe um convite pendente para este e-mail" |
| E-mail pertence a outro tenant | Permitido — um profissional pode atuar em múltiplas clínicas |
| Papel admin atribuído | Alerta: "Admins têm acesso total à clínica. Confirma?" |

**Ciclo de vida do convite:**

```
  [Admin envia convite]
         │
         ▼
  [E-mail enviado ao profissional]
  [Status: PENDENTE]
         │
         ▼
  ┌──────────────────────┐
  │ Profissional clicou  │
  │ no link?             │
  └──┬───────────────┬───┘
     │ SIM            │ NÃO
     │                ▼
     │          ┌────────────────┐
     │          │ Passaram 48h?  │
     │          └──┬─────────┬───┘
     │             │ SIM     │ NÃO
     │             ▼         ▼
     │          [Enviar    [Aguardar]
     │           lembrete]
     │             │
     │             ▼
     │          ┌────────────────┐
     │          │ Passaram 7     │
     │          │ dias (total)?  │
     │          └──┬─────────┬───┘
     │             │ SIM     │ NÃO
     │             ▼         ▼
     │          [Convite   [Aguardar
     │           EXPIRADO]  próximo
     │                      lembrete]
     ▼
  [Redirecionar para cadastro do profissional]
         │
         ▼
  [Ver Etapa 9]
```

---

#### Etapa 9 — Profissionais confirmam convite e fazem cadastro

O profissional convidado clica no link do e-mail e é direcionado ao cadastro.

**Fluxo do profissional convidado:**

```
  [Clique no link do convite]
         │
         ▼
  ┌────────────────────────┐
  │ Convite válido?        │
  └──┬─────────────┬───────┘
     │ SIM          │ NÃO (expirado ou inválido)
     │              ▼
     │         [Erro: "Convite inválido
     │          ou expirado. Solicite
     │          novo convite ao admin."]
     ▼
  ┌────────────────────────┐
  │ Profissional já tem    │
  │ conta na plataforma?   │
  └──┬─────────────┬───────┘
     │ SIM          │ NÃO
     ▼              ▼
  [Login e         [Cadastro:
   vinculação       nome, senha,
   automática       tipo de
   ao tenant]       profissional,
     │              registro
     │              (CRP/CRM/etc.)]
     │              │
     │              ▼
     │         [Confirmação de e-mail]
     │         (pré-preenchido do convite)
     │              │
     │              ▼
     │         [Validação de identidade]
     │              │
     │              ▼
     │         [Aceite LGPD]
     │              │
     ├──────────────┘
     ▼
  [Papel atribuído conforme convite]
  [Evento: PapelAtribuído]
     │
     ▼
  [Acesso ao tenant da clínica com papel definido]
```

**Campos do cadastro do profissional convidado:**

| Campo | Validação |
|-------|-----------|
| Nome completo | Mínimo 3 caracteres |
| Senha | Mínimo 8 caracteres, 1 maiúscula, 1 número, 1 especial |
| Tipo de profissional | Seleção obrigatória |
| Conselho profissional + número + UF | Formato compatível (declaratório no MVP) |

**Nota**: O e-mail já vem preenchido do convite e não pode ser alterado.

---

#### Etapa 10 — Exploração guiada (tour / onboarding wizard)

Semelhante ao fluxo autônomo (ver Etapa 7 do Fluxo 1), com passos adicionais para funcionalidades de clínica.

**Passos adicionais do tour (clínica):**

| Ordem | Tela / Área | O que mostrar |
|-------|-------------|---------------|
| 1 | Dashboard | Visão geral da clínica: agenda de todos os profissionais, resumo financeiro |
| 2 | Agenda | Visão por profissional; filtros |
| 3 | Equipe | Lista de profissionais; como convidar novos; papéis |
| 4 | Pacientes | Lista unificada; filtro por profissional |
| 5 | Prontuário / Evolução | Acesso restrito ao profissional responsável |
| 6 | Financeiro | Visão consolidada da clínica; filtro por profissional |
| 7 | Recibos | Emissão vinculada ao atendimento |
| 8 | Personalização | Logo, cores, dados da clínica |
| 9 | Permissões | Quem pode ver o quê (secretária vs médico vs admin) |

**Diferenças por papel:**

| Papel | Tour adaptado |
|-------|--------------|
| Admin | Tour completo (todas as telas, incluindo equipe e permissões) |
| Médico / Psicólogo | Tour focado em agenda, pacientes, prontuário, recibos |
| Secretária | Tour focado em agenda, pacientes, financeiro (sem prontuário) |

---

#### Etapa 11 — Contratação de plano

Idêntica à Etapa 8-9 do fluxo autônomo, com uma diferença importante:

**Somente o admin pode contratar o plano.**

```
  ┌──────────────────────────────────────────────────────┐
  │ Trial expirou                                        │
  │                                                      │
  │  ┌─────────────────────────┐                         │
  │  │ Usuário é admin?        │                         │
  │  └──┬────────────────┬─────┘                         │
  │     │ SIM             │ NÃO                          │
  │     ▼                 ▼                              │
  │  [Tela de           [Mensagem:                       │
  │   contratação        "Período de avaliação           │
  │   com planos]        expirado. Solicite ao           │
  │     │                administrador da clínica        │
  │     │                a contratação do plano."]       │
  │     ▼                                                │
  │  [Contratar]                                         │
  │     │                                                │
  │     ▼                                                │
  │  [Evento: AssinaturaContratada]                      │
  │     │                                                │
  │     ▼                                                │
  │  [Opção de limpar dados fake]                        │
  └──────────────────────────────────────────────────────┘
```

**Planos para clínica podem variar por número de profissionais:**

| Plano | Profissionais | Preço (exemplo) |
|-------|--------------|-----------------|
| Clínica Básico | Até 3 profissionais | R$ XX/mês |
| Clínica Profissional | Até 10 profissionais | R$ XX/mês |
| Clínica Enterprise | Ilimitado | R$ XX/mês |

**Nota**: Valores e tiers a definir com stakeholders. A estrutura de planos deve suportar variação por quantidade de profissionais ativos no tenant.

**Evento gerado**: `AssinaturaContratada` (tenantId, planoId, tipo: clinica, maxProfissionais, dataInicio, dataRenovacao).

=================================================================

## Comparativo dos fluxos

| Etapa | Profissional Autônomo | Clínica |
|-------|----------------------|---------|
| Cadastro | Nome, e-mail, senha, tipo de profissional | Nome, e-mail, senha (admin) + dados da clínica (CNPJ, endereço, logo, cores) |
| Confirmação de e-mail | Sim | Sim |
| Validação de identidade | Registro profissional (CRP/CRM/CREFITO) | CPF + registro profissional (se aplicável) |
| Consentimento LGPD | Pessoal | Pessoal + representante legal |
| Tipo do tenant | `autonomo` | `clinica` |
| Seed de dados | 5-8 pacientes fake | 8-12 pacientes + 2-3 profissionais fake |
| Convite de profissionais | N/A | Sim (e-mail, papel) |
| Tour | Individual | Adaptado por papel (admin, médico, secretária) |
| Quem contrata | O profissional | Somente o admin |
| Planos | Plano individual | Plano por quantidade de profissionais |

=================================================================

## Casos de erro e exceções

### Erros transversais (ambos os fluxos)

| Cenário | Comportamento | Recuperação |
|---------|---------------|-------------|
| Falha no envio de e-mail (confirmação ou convite) | Registrar falha; exibir "Não foi possível enviar o e-mail" | Botão "Tentar novamente"; fallback: suporte |
| Timeout na criação do tenant | Retry automático (até 3 tentativas); se falhar, exibir erro | Botão "Tentar novamente"; suporte |
| Falha no seed de dados de demonstração | Criar tenant sem dados demo; exibir aviso | Botão "Carregar dados de demonstração" em Configurações |
| Sessão expirada durante onboarding | Salvar progresso do onboarding; retomar após novo login | Redirecionar para etapa onde parou |
| Navegador fecha durante onboarding | Progresso salvo por etapa concluída | Retomar na próxima etapa pendente |
| Erro de pagamento na contratação | Exibir erro do gateway; não ativar plano | Tentar outro cartão; suporte |

### Erros específicos do fluxo de clínica

| Cenário | Comportamento | Recuperação |
|---------|---------------|-------------|
| CNPJ já cadastrado em outro tenant | Bloquear cadastro; exibir erro | Contatar suporte para verificar |
| Profissional convidado já é membro | Exibir erro: "Já faz parte da clínica" | Nenhuma ação necessária |
| Convite expirado (>7 dias) | Link inválido; profissional vê erro | Admin reenvia convite |
| Admin removido antes de contratar | Bloquear contratação (nenhum admin restante) | Suporte deve intervir |
| Excedeu limite de profissionais do plano | Bloquear novo convite; exibir limite | Fazer upgrade do plano |

=================================================================

## Persistência do progresso do onboarding

O sistema deve salvar o progresso do onboarding para permitir retomada em caso de interrupção.

```
  ┌──────────────────────────────────────────────────────────┐
  │ Tabela: onboarding_progress                              │
  │                                                          │
  │  tenant_id        UUID    FK → tenant                    │
  │  user_id          UUID    FK → user                      │
  │  tipo_fluxo       ENUM    (autonomo | clinica)           │
  │  etapa_atual      INT     (1-9 autônomo | 1-11 clínica)  │
  │  etapas_completas JSONB   {1: true, 2: true, ...}        │
  │  tour_concluido   BOOL    default false                  │
  │  tour_progresso   JSONB   {passo: 3, total: 7}           │
  │  dados_demo_ativos BOOL   default true                   │
  │  created_at       TIMESTAMP                              │
  │  updated_at       TIMESTAMP                              │
  └──────────────────────────────────────────────────────────┘
```

**Regras de retomada:**

- Ao fazer login, verificar se `onboarding_progress.etapa_atual` < etapa final.
- Se sim, redirecionar para a etapa pendente.
- Se o tour foi pulado, marcar `tour_concluido = false` e oferecer reinício.

=================================================================

## Notificações durante o onboarding

| Gatilho | Canal | Destinatário | Mensagem (resumo) |
|---------|-------|-------------|-------------------|
| Cadastro concluído | E-mail | Usuário | "Confirme seu e-mail para continuar" |
| E-mail confirmado | E-mail | Usuário | "E-mail confirmado! Continue seu cadastro" |
| Trial iniciado | E-mail | Usuário/Admin | "Seu período de avaliação começou. Você tem X dias" |
| Trial expirando (faltam 6h) | E-mail | Usuário/Admin | "Seu período de avaliação expira em breve" |
| Trial expirado | E-mail | Usuário/Admin | "Seu período de avaliação expirou. Contrate agora" |
| Convite enviado | E-mail | Profissional convidado | "Você foi convidado para a clínica X" |
| Lembrete de convite (48h) | E-mail | Profissional convidado | "Lembrete: você tem um convite pendente" |
| Convite aceito | E-mail | Admin | "Profissional X aceitou o convite" |
| Plano contratado | E-mail | Usuário/Admin | "Plano ativado! Bem-vindo à plataforma" |

=================================================================

## Segurança e auditoria no onboarding

Conforme ADR 0006, as seguintes ações do onboarding geram registros de auditoria:

| Ação | Dados registrados |
|------|-------------------|
| Cadastro de usuário | userId, tenantId, timestamp, IP |
| Confirmação de e-mail | userId, timestamp, IP |
| Validação de identidade | userId, tipo de validação, resultado, timestamp |
| Aceite do termo LGPD | userId, tenantId, versão do termo, qualidade (pessoal/representante), timestamp, IP |
| Criação do tenant | tenantId, tipo (autônomo/clínica), userId admin, timestamp |
| Envio de convite | tenantId, adminId, emailConvidado, papel, timestamp |
| Aceite de convite | tenantId, userId, papel, timestamp |
| Contratação de plano | tenantId, userId, planoId, timestamp |
| Limpeza de dados demo | tenantId, userId, quantidade de registros removidos, timestamp |

=================================================================

**Próximo passo**: Validar fluxos com stakeholders; definir valores dos planos; implementar casos de uso de onboarding nos bounded contexts Identidade e Acesso e Assinatura.
