# Padrões de integração

**Fonte**: docs/domain/domain-events.md, docs/domain/interaction-maps.md

=================================================================

## 1. Comunicação entre bounded contexts (interna)

### Síncrono (dentro do mesmo processo)

- **Casos de uso** chamam aplicação de outro contexto apenas via **eventos de domínio** e **handlers**.
- Exemplo: ao marcar Agendamento como realizado, a aplicação publica **AgendamentoRealizado**; handlers (no mesmo processo) criam Atendimento (Clínico) e Conta a receber (Financeiro).
- **Contrato**: payload do evento (aggregateId, tenantId, dados mínimos); sem chamada HTTP entre contextos no MVP.

### Assíncrono (background)

- **Notificações**: consumo de AgendamentoCriado, AgendamentoAlterado, AgendamentoCancelado em job/worker; envia WhatsApp ou e-mail sem bloquear a resposta ao usuário.
- **Implementação MVP**: fila in-memory ou job runner no mesmo processo; evolução: Redis/Bull ou fila gerenciada.
- **Retry**: política de retentativas para envio de notificação (ex.: 3x com backoff); dead-letter ou log se esgotar.

## 2. Integrações externas

### Calendário (Google, Apple, Outlook)

- **Padrão**: adapter que implementa interface (ex.: ICalendarSync); chamada HTTP à API do provedor.
- **Fluxo**: após AgendamentoCriado/Alterado/Cancelado, adapter sincroniza evento no calendário externo (se usuário tiver conectado).
- **Resiliência**: timeout (ex.: 5s); retry com backoff; em falha, agenda interna permanece como fonte da verdade; opção de re-sync posterior.
- **Autenticação**: OAuth por tenant/usuário; tokens armazenados criptografados; refresh automático.

### WhatsApp (avisos)

- **Padrão**: adapter (INotificationChannel); chamada à API do provedor (Meta ou intermediário).
- **Fluxo**: worker consome evento → monta mensagem → envia via adapter.
- **Resiliência**: retry; em falha persistente, log e eventual alerta; não bloquear fluxo de agendamento.
- **Compliance**: seguir políticas do provedor e LGPD (consentimento para envio, mínimo de dados na mensagem).

## 3. Cliente → servidor

- **REST** sobre HTTPS; Next.js API Routes ou Fastify.
- **Autenticação**: sessão (NextAuth) ou JWT; toda rota protegida resolve tenantId e userId (middleware).
- **Versionamento**: prefixo de API (ex.: /api/v1/) se houver evolução que quebre contrato.

## 4. Resumo de padrões

| Origem → Destino | Padrão | Observação |
|------------------|--------|------------|
| Agendamento → Clínico, Financeiro | Evento (AgendamentoRealizado) + handlers síncronos | Mesmo processo; transação por handler; compensação se falhar |
| Agendamento → Notificações | Evento + worker assíncrono | WhatsApp/e-mail em background |
| App → Calendário / WhatsApp | HTTP (adapter) com retry/timeout | Integrações nas bordas |
| Cliente → App | REST over HTTPS, sessão/JWT | tenantId em toda requisição |

=================================================================

**ADRs relacionados**: 0004 (comunicação entre contextos), 0005 (integrações externas).
