# Code Conventions

## Naming Conventions

**Arquivos:**
- kebab-case com sufixo descritivo de papel
- Exemplos reais: `login.use-case.ts`, `patient.routes.ts`, `receivable.repository.ts`, `appointment-completed.handler.ts`, `event-bus.ts`, `bcrypt-hasher.ts`

**Sufixos de arquivo obrigatórios:**
- Use cases: `.use-case.ts` ou `.use-cases.ts` (se múltiplos no mesmo arquivo)
- Routes (adapters HTTP): `.routes.ts`
- Repositories: `.repository.ts`
- Event handlers: `.handler.ts`
- Domain entities/types: sem sufixo especial (ex: `patient.ts`, `entities.ts`)
- Ports: `ports.ts` por módulo

**Classes:**
- PascalCase com sufixo do papel
- Exemplos: `LoginUseCase`, `PrismaPatientRepository`, `BcryptPasswordHasher`, `UuidSessionTokenGenerator`, `InMemoryAttendanceRepository`

**Interfaces:**
- PascalCase sem prefixo "I"
- Exemplos: `PatientRepository`, `PasswordHasher`, `SessionTokenGenerator`, `WhatsAppAdapter`, `CalendarAdapter`

**Funções:**
- camelCase, verbos de ação
- Exemplos: `requireTenantId()`, `setContext()`, `configureAuth()`, `createWhatsAppAdapter()`, `createReceivableHandler()`

**Variáveis/Constantes:**
- camelCase para variáveis: `sessionToken`, `expiresAt`, `tenantId`
- SCREAMING_SNAKE_CASE para constantes de módulo: `MAX_FAILED_ATTEMPTS`, `LOCK_DURATION_MS`, `DEFAULT_RETRY_CONFIG`

**Tipos customizados (branded types):**
- PascalCase simples: `TenantId`, `UserId`, `TenantType`, `UserRole`, `PatientStatus`

## Code Organization

**Import ordering (observado):**
1. Node built-ins (`node:async_hooks`, `node:fs`)
2. Third-party (`fastify`, `@prisma/client`)
3. Internal (`../../domain/...`, `../../../shared/...`)
4. Sempre com extensão `.js` (obrigatório para NodeNext module resolution)

**Exemplo real de `src/main.ts`:**
```typescript
import Fastify from 'fastify';
import type { FastifyRequest } from 'fastify';
import cookie from '@fastify/cookie';
import cors from '@fastify/cors';
import { configureAuth, PUBLIC_ROUTES } from './infrastructure/http/middleware/index.js';
import { authRoutes } from './identity/adapters/http/auth.routes.js';
```

**Estrutura interna de arquivo (use case):**
1. JSDoc com referência a User Story (`@see US-BE-F01-01`)
2. Imports
3. Interfaces de Input/Output
4. Constantes de configuração
5. Classe com constructor via injeção de dependência
6. Método `execute(input)` como ponto de entrada principal
7. Métodos privados auxiliares

## Type Safety

**Abordagem:** TypeScript strict mode (`"strict": true` em tsconfig)
- Interfaces para domain entities e ports
- Classes para use cases e adapters de infraestrutura
- Tipos de branded: `TenantId = string`, `UserId = string` (semântica, não enforcement em runtime)
- `readonly` em entidades de domínio: `readonly id: string`, `readonly tenantId: TenantId`
- `type` para unions simples: `TenantType = 'autonomous' | 'clinic'`
- `interface` para objetos estruturados

**Exemplo de domínio:**
```typescript
export interface Patient {
  readonly id: string;
  readonly tenantId: TenantId;
  readonly name: string;
  readonly status: PatientStatus;
}
```

## Error Handling

**Padrão:** Erros de domínio customizados que estendem `DomainError`
- `DomainError` em `src/shared/errors.ts` com `code` opcional
- Cada contexto define seus próprios erros: `InvalidCredentialsError`, `AccountLockedError`, `AppointmentConflictError`, etc.
- HTTP routes capturam erros e mapeiam para status codes específicos
- Event bus captura falhas de handler e coloca em dead letter queue (não propaga para a requisição)

**Exemplo:**
```typescript
export class DomainError extends Error {
  constructor(message: string, public readonly code?: string) {
    super(message);
    this.name = 'DomainError';
  }
}
```

## Comments / Documentation

- JSDoc no topo de cada arquivo referenciando User Stories e ADRs: `@see US-BE-F01-01, ADR 0002`
- Comentários inline apenas quando a lógica não é evidente (ex: `// CPF para autonomo, CNPJ para clinica`)
- Sem comentários redundantes em código autoexplicativo

## Injeção de Dependência

- Manual (sem container IoC)
- Use cases recebem ports/repositories via constructor
- Dependências instanciadas em `src/main.ts` e injetadas via plugin options do Fastify
- Routes recebem dependências como `FastifyPluginOptions` tipadas
