# Mapas de interação

**Objetivo**: Fluxos principais entre bounded contexts e agregados (quem inicia, quem consome eventos).

=================================================================

## 1. Cadastro e primeiro acesso

```
[Identidade e Acesso]
  Usuário registra → Confirmação de e-mail → (opcional) Validação de identidade
  → UsuárioRegistrado / E-mailConfirmado / IdentidadeValidada
  → (consumidores: auditoria, onboarding)
```

Sem dependência de outros contextos; Notificações pode enviar e-mail de confirmação (integração técnica).

## 1b. Assinatura e trial

```
[Identidade e Acesso]
  Tenant criado (após cadastro e confirmação de e-mail)
         ↓
[Assinatura]
  Criar Assinatura em modo trial → popular dados de demonstração (seed)
  → TrialIniciado
       ↓
  (1-2 dias depois)
  Trial expira → TrialExpirado
  → Bloquear acesso; exibir tela de contratação
       ↓
  Usuário contrata plano → AssinaturaContratada
  → Liberar acesso completo; remover dados fake (opcional)
```

## 1c. Consentimento LGPD

```
[Identidade e Acesso]
  Antes de tratar dados sensíveis de saúde:
  → Verificar ConsentimentoLGPD ativo (versão vigente)
  → Se ausente: solicitar aceite do termo
  → ConsentimentoRegistrado
       ↓
  (Se revogado pelo usuário)
  → ConsentimentoRevogado
  → Bloquear operações com dados sensíveis; notificar
```

## 2. Cadastro de paciente e vínculo

```
[Identidade e Acesso]  fornece tenant + usuário (profissional)
         ↓
[Clínico]
  Profissional (ou secretária) cadastra Paciente no tenant
  → Cria Vínculo profissional–paciente
  → (sem evento de domínio obrigatório para vínculo; pode PacienteCadastrado se necessário)
```

## 3. Agendamento completo (criar → realizar → financeiro)

```
[Agendamento]
  Usuário cria Agendamento na Agenda (profissional + paciente + slot)
  → DR-AG-1, DR-AG-2, DR-AG-3 (vínculo)
  → AgendamentoCriado
       ↓
[Notificações]  consome AgendamentoCriado → envia confirmação (ex.: WhatsApp)
[Integração calendário]  consome AgendamentoCriado → sincroniza evento externo

---

[Agendamento]
  Usuário marca Agendamento como realizado
  → AgendamentoRealizado
       ↓
[Clínico]  consome → cria Atendimento (raiz)
[Financeiro]  consome → cria Conta a receber vinculada ao Atendimento
[Métricas]  consome → produtividade, evolução
```

## 4. Evolução e prontuário

```
[Clínico]
  Profissional registra Evolução no Atendimento
  → EvoluçãoRegistrada
  → (Prontuário = consulta/visão sobre evoluções do paciente)
```

Sem chamada direta de outros contextos; Financeiro e Agendamento não dependem de evolução.

## 5. Baixa e recibo

```
[Financeiro]
  Usuário registra Baixa na Conta a receber
  → ContaAReceberBaixada

  Usuário emite Recibo para paciente (referência atendimento(s) / conta(s))
  → ReciboEmitido
  → (Notificações pode enviar recibo ao paciente se canal disponível)
```

## 6. Resumo de dependências entre contextos

| Contexto          | Depende de                    | Consumido por                    |
|-------------------|------------------------------|----------------------------------|
| Identidade e Acesso | —                            | Assinatura, Agendamento, Clínico, Financeiro |
| Assinatura        | Identidade (tenant)          | Todos (controle de acesso por status de assinatura) |
| Agendamento       | Identidade, Clínico (vínculo) | Notificações, Clínico, Financeiro |
| Clínico           | Identidade, Agendamento (realizado) | Financeiro, métricas         |
| Financeiro        | Clínico (atendimento, tarifa do vínculo), Identidade | —              |
| Notificações      | Agendamento, Assinatura (eventos) | — (subsistema reativo)      |

=================================================================

**Uso**: Guiar design de aplicação (quem publica eventos, quem assina) e evitar acoplamento direto entre agregados de contextos diferentes; preferir eventos para AgendamentoRealizado → Atendimento e Conta a receber.
