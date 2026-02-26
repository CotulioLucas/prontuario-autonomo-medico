# External Integrations

## Banco de Dados

**Serviço:** PostgreSQL 16
**Propósito:** Persistência de todos os dados da aplicação
**Implementação:** Prisma ORM 6.3 como query builder e migration tool
**Configuração:** `DATABASE_URL` via variável de ambiente
**Autenticação:** User/password no connection string
**Schema:** `prisma/schema.prisma` — single schema, todos os contextos no mesmo banco
**Repositories:** `src/infrastructure/persistence/prisma/` — um arquivo por entidade

## Mensageria

**Serviço:** WhatsApp Business API (Meta)
**Propósito:** Envio de notificações aos pacientes (confirmações de consulta, lembretes)
**Implementação:** `src/infrastructure/integrations/whatsapp.adapter.ts`
**Endpoint base:** `https://graph.facebook.com/v18.0`
**Autenticação:** Bearer token via header `Authorization`
**Configuração:** `WHATSAPP_API_KEY`, `WHATSAPP_PHONE_NUMBER_ID` (env vars presumidas)
**Padrão:** `sendInBackground()` via `setImmediate` — não bloqueia request principal; falhas logadas mas não propagadas

**Capacidades:**
- Envio de template messages (pt_BR)
- Envio de mensagens de texto livre
- Suporte a variáveis nos templates

## Calendário

**Serviço:** Google Calendar API v3
**Propósito:** Sincronização de agendamentos com calendário externo do profissional
**Implementação:** `src/infrastructure/integrations/calendar.adapter.ts`
**Endpoint base:** `https://www.googleapis.com/calendar/v3`
**Autenticação:** Bearer token via header `Authorization`
**Configuração:** `CALENDAR_API_KEY`, `CALENDAR_ID` (env vars presumidas)
**Padrão:** Agenda interna é fonte da verdade — falha na API do Google não cancela o agendamento. Circuit breaker detectado e logado.

**Capacidades:**
- `createEvent` — cria evento no Google Calendar
- `updateEvent` — atualiza evento existente
- `deleteEvent` — remove evento
- `syncEvents` — lista eventos do calendário (falha silenciosa, retorna `[]`)

## HTTP Client Interno

**Serviço:** Utilitário interno
**Propósito:** Cliente HTTP com retry e circuit breaker para integrações externas
**Implementação:** `src/infrastructure/integrations/http-client.ts`
**Configuração:** `timeoutMs` (padrão 5000ms), `maxRetries` (padrão 3)
**Padrão:** Circuit breaker abre após falhas consecutivas; `HttpClientError.isCircuitOpen` sinaliza estado

## Email

**Serviço:** ConsoleEmailService (stub de desenvolvimento)
**Propósito:** Envio de emails transacionais (confirmação de conta, reset de senha, convites)
**Implementação:** `src/infrastructure/auth/console-email-service.ts`
**Status:** Implementação de produção não definida — emails são apenas logados no console
**Observação:** Interface `EmailService` está definida — trocar por provedor real (SendGrid, SES, Resend) sem mudar use cases

## Containerização

**Serviço:** Docker + Docker Compose
**Propósito:** Ambiente de desenvolvimento e produção consistente

**docker-compose.db.yml** (dev — banco apenas):
- PostgreSQL 16 Alpine na porta 5432
- Volume persistente `postgres_data`
- Health check com `pg_isready`

**docker-compose.yml** (stack completa):
- `postgres`: PostgreSQL 16 Alpine
- `backend`: Node.js (porta 3002) — roda `prisma db push + seed + node dist/main.js`
- `frontend`: Next.js (porta 3001 → container 3000) — build com `NEXT_PUBLIC_API_URL`
- Rede bridge interna `prontuario-network`

## Event Bus Interno

**Tipo:** In-memory (não é serviço externo, mas é a infraestrutura de integração entre contextos)
**Implementação:** `src/infrastructure/events/event-bus.ts`
**Padrão:** Pub/sub síncrono dentro do mesmo processo
**Retry:** 3 tentativas, backoff exponencial (2x, máx 5s)
**Dead Letter Queue:** Eventos que falham após todas as tentativas são enfileirados em memória (perdidos ao reiniciar)
**Evolução documentada:** ADR 0004 prevê migração para message broker externo (RabbitMQ/Redis Streams) quando necessário

**Eventos conhecidos:**
- `AppointmentCompleted` — publicado por scheduling; consumido por clinical (cria Attendance) e billing (cria Receivable)
