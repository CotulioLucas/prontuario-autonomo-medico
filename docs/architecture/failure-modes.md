# Modos de falha e mitigação

**Fonte**: docs/content/risks.md, integrações e domínio

=================================================================

## 1. Falhas esperadas e resposta

| Falha | Probabilidade | Impacto | Mitigação |
|-------|----------------|--------|-----------|
| **API de calendário indisponível ou lenta** | Média | Médio | Timeout (ex.: 5s); retry com backoff; agenda interna como fonte da verdade; sync posterior quando API voltar. |
| **API WhatsApp indisponível** | Média | Baixo | Envio de notificação em background; retry; usuário não fica bloqueado; log de falha. |
| **Falha ao criar Atendimento ou Conta a receber após AgendamentoRealizado** | Baixa | Alto | Handler com retry; se persistir, evento em dead-letter ou fila de reprocesso; alerta; compensação manual se necessário. |
| **Vazamento de dados entre tenants** | Baixa (crítico se ocorrer) | Crítico | tenant_id em toda query; testes automatizados; revisão de código e ADR 0002/0006. |
| **Perda de sessão ou token expirado** | Média | Baixo | Renovação de token; redirect para login; mensagem clara. |
| **Banco de dados indisponível** | Baixa | Alto | Reconexão; pool configurado; backup e plano de recuperação. |
| **Disco ou memória insuficiente** | Baixa | Alto | Monitoramento; escala vertical no MVP; limites de recursos em container. |

## 2. Padrões de resiliência aplicados

- **Timeout**: todas as chamadas a serviços externos com limite (ex.: 5–10s).
- **Retry**: integrações externas com retry limitado (ex.: 3x) e backoff exponencial.
- **Circuit breaker**: opcional para calendário/WhatsApp se muitas falhas consecutivas; evita sobrecarga ao provedor.
- **Bulkhead**: workers de notificação separados (ou fila dedicada) para não bloquear requests HTTP.
- **Graceful degradation**: funcionalidade core (agenda, prontuário, financeiro) independente de calendário e WhatsApp.

## 3. Compensação entre contextos

- Ao publicar **AgendamentoRealizado**, dois handlers criam Atendimento e Conta a receber. Se um falhar:
  - Retry automático no handler que falhou.
  - Se persistir: registrar falha; processo manual ou job de reconciliação para criar Atendimento/Conta a receber a partir do agendamento realizado.
- Não usar transação distribuída entre agregados; preferir saga (retry + compensação manual se necessário).

## 4. Monitoramento e alertas (recomendado)

- Health check do app e do BD.
- Taxa de falha em integrações (calendário, WhatsApp).
- Latência de operações críticas.
- Alertas para falhas consecutivas de criação de Atendimento/Conta a receber após evento.
- Logs de auditoria para alterações sensíveis (ver ADR 0006).

=================================================================

**ADR relacionado**: 0005 (integrações externas — timeout, retry, fallback).
