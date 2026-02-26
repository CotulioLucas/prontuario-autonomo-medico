# Prontuário Autônomo Médico - Guia de Execução

## Pré-requisitos

- Node.js 20+
- PostgreSQL 16+ (ou Docker)
- npm ou yarn

## Opção 1: Com Docker (Recomendado)

```bash
# Na raiz do projeto
docker-compose up --build
```

Acesse:
- Frontend: http://localhost:3001
- Backend: http://localhost:3000/api/v1/health

## Opção 2: Sem Docker

### 1. Configurar Banco de Dados

```bash
# Instalar dependências do backend
npm install

# Configurar .env
cp .env.docker .env

# Executar migrations (quando PostgreSQL estiver rodando)
npx prisma migrate dev --name init
```

### 2. Iniciar Backend

```bash
# Terminal 1 - Backend
npm run dev
```

### 3. Iniciar Frontend

```bash
# Terminal 2 - Frontend
cd frontend
npm install
npm run dev
```

Acesse: http://localhost:3001

## Rotas Disponíveis

### Públicas
- `/login` - Login
- `/cadastro/autonomo` - Cadastro autônomo
- `/cadastro/clinica` - Cadastro clínica
- `/confirmar-email` - Confirmar e-mail
- `/esqueci-senha` - Esqueci senha
- `/redefinir-senha` - Redefinir senha
- `/convite` - Aceitar convite

### Protegidas (requer autenticação)
- `/dashboard` - Dashboard principal
- `/configuracoes/equipe` - Gestão de equipe

## API Endpoints

### Auth
- `POST /api/v1/auth/login` - Login
- `POST /api/v1/auth/register/autonomo` - Cadastro autônomo
- `POST /api/v1/auth/register/clinica` - Cadastro clínica
- `GET /api/v1/auth/confirm-email` - Confirmar e-mail
- `POST /api/v1/auth/resend-confirmation` - Reenviar confirmação
- `POST /api/v1/auth/forgot-password` - Esqueci senha
- `PUT /api/v1/auth/reset-password` - Redefinir senha
- `GET /api/v1/auth/invite-info` - Info do convite
- `POST /api/v1/auth/accept-invite` - Aceitar convite

### Team
- `GET /api/v1/team/members` - Listar membros
- `POST /api/v1/team/invites` - Criar convite
- `POST /api/v1/team/invites/:id/resend` - Reenviar convite
- `DELETE /api/v1/team/invites/:id` - Revogar convite
- `PUT /api/v1/team/members/:id/role` - Alterar papel
- `PUT /api/v1/team/members/:id/deactivate` - Desativar membro
- `GET /api/v1/team/professionals` - Listar profissionais

## Testes

```bash
# Backend
npm test

# Frontend
cd frontend
npm test
```

## Status do Projeto

| Componente | Status | Testes |
|------------|--------|--------|
| Backend | ✅ Funcional | 219/219 |
| Frontend | ✅ Funcional | 60/71 |
| Docker | ✅ Configurado | - |
| Prisma | ✅ Schema completo | - |
