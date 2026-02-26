# Prontuário Autônomo Médico

**Visão:** Plataforma SaaS para profissionais de saúde (psicólogos, fisioterapeutas, massoterapeutas) e pequenas clínicas gerenciarem agenda, pacientes, prontuário clínico e financeiro em um único sistema.
**Para:** Profissionais autônomos de saúde e administradores de pequenas clínicas.
**Resolve:** Gestão fragmentada de agenda, pacientes, prontuários e cobranças — hoje feita em planilhas, papel ou múltiplos sistemas desconectados.

## Goals

- **O1:** Reduzir tempo em tarefas administrativas — baseline coletado com primeiros 5 usuários do trial, meta de redução em 6 meses pós-MVP
- **O2:** 100% de contas a receber com status correto desde o MVP (vs. 0% antes do sistema)
- **O3:** 100% de atendimentos com recibo disponível quando solicitado (reembolso de plano de saúde)
- **O4:** Prontuário com evolução registrada em todos os atendimentos obrigatórios — meta medida no MVP
- **O5:** Conversão trial → plano pago como métrica principal de validação do produto

## Tech Stack

**Core:**
- Linguagem: TypeScript 5.7
- Backend: Node.js 20 + Fastify 5 + Prisma 6 + PostgreSQL 16
- Frontend: Next.js 14 (App Router) + React 18 + Tailwind CSS

**Dependências-chave:** react-hook-form + zod (formulários), Radix UI (componentes), Vitest (testes), Docker Compose (infraestrutura)

## Scope

**MVP inclui:**
- F01 — Autenticação e acesso (cadastro autônomo/clínica, login, convites, LGPD)
- F02 — Gestão de pacientes (cadastro, vínculo profissional-paciente, tarifa)
- F03 — Agenda e agendamentos (criação, alteração, cancelamento, realização, visualização)
- F04 — Atendimento e prontuário (evolução clínica, histórico por paciente)
- F05 — Contas a receber e baixa (geração automática ao realizar consulta, registro de pagamento)
- F06 — Emissão de recibos PDF (para reembolso de plano de saúde)
- F07 — Dashboard financeiro (aging, totalizadores por período)
- F08 — Trial e assinatura (trial com dados fake, contratação de plano, bloqueio por expiração)

**Explicitamente fora do escopo (v1):**
- App nativo (iOS/Android) — MVP é web responsivo; PWA avaliado futuramente
- F09 — Notificações via WhatsApp (P3 — infra existe mas feature não implementada)
- Integração com calendários externos (Google Calendar, Outlook) — adapter existe, não ativado no MVP
- Pagamento online integrado (cobrança via plano é manual no MVP)
- Teleconsulta / streaming de vídeo na plataforma

## Constraints

- **Legal/Compliance:** LGPD obrigatório — consentimento, finalidade, retenção de dados (prontuário: mínimo 20 anos), auditoria de acessos clínicos
- **Multi-tenancy:** Isolamento total de dados por tenant via row-level filtering (tenantId em todas as queries)
- **Arquitetura:** Monólito modular com Hexagonal Architecture + DDD Bounded Contexts — sem microserviços no MVP
- **Mobile:** Web responsivo apenas; sem app nativo
- **Infraestrutura:** Docker Compose para dev/prod; stack definida por ADRs (0001–0013)
- **Prazo/Orçamento:** A definir com stakeholders — baseline a coletar com primeiros 5 usuários
