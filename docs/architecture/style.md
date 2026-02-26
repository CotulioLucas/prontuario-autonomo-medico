# Estilo arquitetural

**Decisão principal**: ADR 0002 (docs/adr/0002-architectural-style-and-multi-tenant.md).

=================================================================

## Escolha: Modular Monolith + Clean/Hexagonal

- **Monolito**: uma base de código e um deployável (MVP); banco de dados único com isolamento lógico por tenant.
- **Modular**: bounded contexts como módulos (pastas/namespaces); dependências entre módulos explícitas e mínimas.
- **Clean/Hexagonal**: domínio no centro; aplicação orquestra; infraestrutura (HTTP, DB, integrações) em adaptadores.

## Camadas (dependência sempre para dentro)

```
  [Adaptadores]     HTTP (Next.js API / Fastify), Prisma, Calendar API, WhatsApp, Workers
         ↓
  [Aplicação]      Casos de uso, orquestração, publicar/consumir eventos
         ↓
  [Domínio]        Agregados, entidades, value objects, regras, eventos
```

- **Domínio**: sem dependência de framework ou IO; apenas tipos e regras de negócio.
- **Aplicação**: usa domínio; não conhece detalhes de HTTP ou BD; pode usar portas (interfaces) para persistência e mensagens.
- **Adaptadores**: implementam portas; chamam aplicação; acessam APIs externas e BD.

## Alternativas consideradas (resumo)

| Estilo | Por que não (no MVP) |
|--------|-----------------------|
| Microserviços | Equipe pequena; domínio ainda em consolidação; custo operacional alto. |
| Serverless puro | Fluxos longos (agendamento → atendimento → financeiro) e estado; monolith mais simples para MVP. |
| Layered sem modular | Risco de acoplamento entre contextos; modular explicita fronteiras. |

## Event-driven entre contextos

- Dentro do mesmo processo: eventos de domínio (objetos) + handlers; pode ser síncrono no MVP (invocação direta) ou fila in-memory.
- AgendamentoRealizado → handler cria Atendimento (Clínico) e Conta a receber (Financeiro); evita transação distribuída e mantém agregados separados.
- Notificações consome AgendamentoCriado/Alterado/Cancelado de forma assíncrona (worker ou background job) para não bloquear resposta ao usuário.

## Trade-offs aceitos

- **Consistência**: eventual entre contextos (Atendimento e Conta a receber após AgendamentoRealizado); compensação (saga ou retry) se falhar um dos lados.
- **Acoplamento**: Notificações acoplado ao contrato do evento (schema estável); versionamento de eventos se evoluir.
- **Escalabilidade**: vertical no MVP; horizontal depois com réplicas stateless e workers.

=================================================================

**Validação**: Nenhuma dependência do domínio para fora; módulos de contexto sem ciclos; decisões registradas em ADR.
