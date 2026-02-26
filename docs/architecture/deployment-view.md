# Vista de implantação

**Escopo**: MVP (single node) e evolução possível.

=================================================================

## 1. MVP — Nó único

- **Cliente** comunica com **App Node** (HTTPS).
- **App Node** persiste em **Banco de dados** (PostgreSQL/MySQL via Prisma); todas as tabelas com tenant_id.
- **Filas/Jobs** (opcional no MVP): in-process ou Redis; processam eventos (notificações, sync calendário).
- **APIs externas**: Calendário (Google etc.) e WhatsApp; chamadas a partir do App ou worker.

## 2. Containers e ambiente

- Runtime: Node.js em container (Docker) ou PaaS (Vercel, Railway, Render).
- Variáveis: DATABASE_URL, NEXTAUTH_SECRET, tokens de calendário/WhatsApp; sem segredos em código.
- Build: um artefato (monolito); migrations via Prisma.

## 3. Escalabilidade

- **MVP**: escala vertical (mais CPU/RAM no único nó).
- **Crescimento**: réplicas do App atrás de load balancer; sessão stateless (JWT); workers em processo ou nós dedicados.
- **Grande escala**: particionamento por tenant se necessário; cache (Redis); fila externa para eventos.

## 4. Dados e persistência

- Um único esquema; isolamento por tenant_id em toda query.
- Migrations versionadas (Prisma); backup e retenção alinhados a LGPD (ADR 0006).

## 5. Integrações externas

- **Calendário**: OAuth + API do provedor; falha não bloqueia agenda interna.
- **WhatsApp**: API oficial ou intermediário; envio assíncrono; sem armazenar conteúdo sensível além do necessário.

=================================================================

**Resumo**: MVP = um nó + um BD + jobs in-process ou fila simples; evolução = réplicas + workers + cache/fila externa.
