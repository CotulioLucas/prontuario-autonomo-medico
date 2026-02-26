# Tech Stack

**Analisado:** 2026-02-23

## Core

- Linguagem: TypeScript 5.7
- Runtime: Node.js >=20
- Gerenciador de pacotes: npm
- Build: tsc (target ES2022, module NodeNext)
- Dev runner: tsx (watch mode)

## Backend

- Framework HTTP: Fastify 5.1
- ORM: Prisma 6.3
- Banco de dados: PostgreSQL 16
- Auth: sessões via cookie + bcrypt 5.1 (hash de senha) + UUID como token
- CORS: @fastify/cors 10.1
- Cookie: @fastify/cookie 11.0

## Frontend

- Framework: Next.js 14.2 (App Router)
- UI: React 18.3
- Styling: Tailwind CSS 3.4 + tailwind-merge + tailwindcss-animate
- Componentes UI: Radix UI (dialog, dropdown, select, tabs, avatar, checkbox, popover, tooltip, alert-dialog, separator, scroll-area)
- Ícones: lucide-react
- Formulários: react-hook-form 7.71 + @hookform/resolvers + zod 4.3
- Temas: next-themes
- Notificações toast: sonner

## Testing

- Backend (unit/integration): Vitest 3.0
- Frontend (componentes): Vitest 4.0 + @testing-library/react + happy-dom / jsdom
- Coverage: v8 (backend)

## Infraestrutura

- Containerização: Docker + Docker Compose
- Banco dev: docker-compose.db.yml (PostgreSQL standalone)
- Stack completa: docker-compose.yml (postgres + backend + frontend)
- Migrations: prisma migrate
- Seed: tsx prisma/seed.ts

## External Services

- Mensageria: WhatsApp Business API (Meta Graph API v18.0)
- Calendário: Google Calendar API v3
- Email: ConsoleEmailService (implementação stub — prod não definida)
