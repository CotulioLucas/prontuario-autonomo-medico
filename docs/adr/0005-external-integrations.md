# ADR 0005 — Integrações externas (calendário e WhatsApp)

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: MVP integra com calendários (Google, Apple, Outlook) e WhatsApp para avisos; risco de indisponibilidade ou limite de API.

## Decisão

- **Calendário**: Adapter por provedor (ou adapter unificado com estratégia por provedor). OAuth por usuário/tenant para autorização. Sincronização após AgendamentoCriado/Alterado/Cancelado; em falha (timeout, 5xx), **não bloquear** o fluxo; agenda interna é fonte da verdade; permitir nova tentativa de sync posterior.
- **WhatsApp**: Adapter que chama API oficial ou intermediário. Envio de notificações (lembrete, confirmação) em **background** (worker). Timeout e **retry com backoff** (ex.: 3x). Em falha persistente, log e alerta; usuário não é bloqueado.
- **Resiliência**: timeout em todas as chamadas externas (ex.: 5–10s); retry limitado; opcionalmente circuit breaker se falhas consecutivas. Ver docs/architecture/failure-modes.md.

## Alternativas consideradas

- Síncrono para WhatsApp: rejeitado (atrasa resposta ao usuário).
- Sem retry: rejeitado (aumenta perda de notificações).

## Consequências

- Testes de integração com mocks para calendário e WhatsApp.
- Monitoramento de taxa de sucesso e latência das integrações.
- Compliance com políticas do provedor e LGPD (consentimento para envio).
