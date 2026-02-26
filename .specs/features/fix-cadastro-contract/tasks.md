# Fix: Contrato de Cadastro — Tasks

**Spec**: `.specs/features/fix-cadastro-contract/spec.md`
**Status**: Approved

---

## Execution Plan

```
Phase 1 (Sequencial — Foundation):
  T1 ──→ T2 ──→ T3

Phase 2 (Paralelo — Backend Implementation):
  T3 complete, then:
    ├── T4 [P]  ← update ProfessionalInfo interface
    ├── T5 [P]  ← update RegisterAutonomousInput interface
    └── T6 [P]  ← update RegisterClinicInput interface

Phase 3 (Paralelo — Backend Routes):
  T4, T5, T6 complete, then:
    ├── T7 [P]  ← update auth.routes.ts autonomo
    └── T8 [P]  ← update auth.routes.ts clinica

Phase 4 (Paralelo — Backend Unit Tests):
  T7, T8 complete, then:
    ├── T9  [P]  ← unit tests register-autonomous.use-case.ts
    ├── T10 [P]  ← unit tests register-clinic.use-case.ts
    └── T11 [P]  ← unit tests auth.routes.ts

Phase 5 (Paralelo — Frontend Fix):
  T3 complete, then:
    ├── T12 [P]  ← fix payload autônomo
    └── T13 [P]  ← fix payload clínica

Phase 6 (Paralelo — Frontend Unit Tests):
  T12, T13 complete, then:
    ├── T14 [P]  ← unit tests autonomo/page.tsx
    └── T15 [P]  ← unit tests clinica/page.tsx

Phase 7 (Sequencial — End-to-End):
  T9, T10, T11, T14, T15 complete, then:
    T16 ──→ T17
```

---

## Task Breakdown

### T1: Documentar contrato esperado pelo backend

**What**: Anotar e confirmar o contrato exato da rota `/auth/register/autonomo` e `/auth/register/clinica` lendo `auth.routes.ts`
**Where**: `src/identity/adapters/http/auth.routes.ts` (somente leitura)
**Depends on**: None

**Tools**: Read

**Done when**:
- [ ] Mapeamento de campos autônomo confirmado (ver spec.md tabela)
- [ ] Mapeamento de campos clínica confirmado (ver spec.md tabela)
- [ ] Valores do enum `registerType` confirmados: `CRM | CRP | CREFITO | OUTRO`

**Verify**: Comparar body esperado na rota com tabela da spec — devem ser idênticos.

---

### T2: Confirmar valor de `lgpdConsentVersion` e estruturas de dados

**What**: Verificar qual string usar para `lgpdConsentVersion`, estruturas Address e ProfessionalInfo
**Where**: `src/identity/application/use-cases/register-autonomous.use-case.ts`, `register-clinic.use-case.ts`, `src/identity/domain/entities.ts`
**Depends on**: T1

**Tools**: Read

**Done when**:
- [ ] Valor correto de `lgpdConsentVersion` identificado (ex: `"1.0"`)
- [ ] Estrutura Address confirmada com todos os campos
- [ ] Estrutura ProfessionalInfo confirmada — precisa adicionar `registerUf`

**Verify**: Estruturas usadas nos use cases batem com entities.ts.

---

### T3: Atualizar interface ProfessionalInfo para incluir `registerUf`

**What**: Adicionar campo `registerUf?: string` na interface ProfessionalInfo do domain
**Where**: `src/identity/domain/entities.ts` (linha 53)
**Depends on**: T2

**Tools**: Read, Edit

**Done when**:
- [ ] Interface `ProfessionalInfo` incluir `registerUf?: string`
- [ ] Nenhuma alteração em outro local sem antes atualizar referências
- [ ] Zero TypeScript errors

**Verify**:
```bash
npm run typecheck
# Esperado: sem erros
```

---

### T4: Adicionar suporte a `address` em `RegisterAutonomousInput` [P]

**What**: Estender interface `RegisterAutonomousInput` para aceitar campo `address` do tipo `Address`
**Where**: `src/identity/application/use-cases/register-autonomous.use-case.ts` (linha 14)
**Depends on**: T3
**Reuses**: `Address` interface de `entities.ts`

**Tools**: Read, Edit

**Done when**:
- [ ] `RegisterAutonomousInput` inclui `address: Address`
- [ ] Use case valida que `address` é fornecido
- [ ] Use case persiste `address` na entidade `Tenant`

**Verify**:
```bash
npm run typecheck
# Esperado: sem erros
```

---

### T5: Atualizar `RegisterAutonomousInput.professionalInfo` para incluir `registerUf` [P]

**What**: Garantir que `ProfessionalInfo` em `RegisterAutonomousInput` suporte `registerUf`
**Where**: `src/identity/application/use-cases/register-autonomous.use-case.ts` (linha 20)
**Depends on**: T3

**Tools**: Read, Edit

**Done when**:
- [ ] `professionalInfo` em `RegisterAutonomousInput` aceita `registerUf?: string`
- [ ] Use case persiste `registerUf` na entidade `User.professionalInfo`

**Verify**:
```bash
npm run typecheck
# Esperado: sem erros
```

---

### T6: Adicionar suporte a `customization` em `RegisterClinicInput` [P]

**What**: Estender interface `RegisterClinicInput` para aceitar campo `customization` com `logoUrl`, `primaryColor`, `secondaryColor`
**Where**: `src/identity/application/use-cases/register-clinic.use-case.ts` (linha 14)
**Depends on**: T2

**Tools**: Read, Edit

**Done when**:
- [ ] `RegisterClinicInput` inclui `customization?: { logoUrl?: string; primaryColor?: string; secondaryColor?: string }`
- [ ] Use case persiste `logoUrl` na entidade `Tenant`
- [ ] Cores são armazenadas (decisão de arquitetura: Tenant ou tabela separada — ver ADRs)

**Verify**:
```bash
npm run typecheck
# Esperado: sem erros
```

---

### T7: Atualizar `auth.routes.ts` — endpoint `/auth/register/autonomo` [P]

**What**: Alterar validação e chamada do use case para aceitar `address` e `professionalInfo.registerUf`
**Where**: `src/identity/adapters/http/auth.routes.ts` (linhas 158–215)
**Depends on**: T4, T5

**Tools**: Read, Edit

**Transformações**:
```ts
// ANTES (validação incompleta)
if (!body.name || !body.email || !body.cpf || !body.password || !body.lgpdConsentVersion) {
  return reply.code(400).send(...)
}

// DEPOIS (validação completa)
if (!body.name || !body.email || !body.cpf || !body.password || !body.lgpdConsentVersion) {
  return reply.code(400).send(...)
}
if (!body.address || !body.address.street || !body.address.city || !body.address.state || !body.address.zipCode) {
  return reply.code(400).send({
    error: { code: 'VALIDATION_ERROR', message: 'Address with street, city, state, zipCode is required' }
  })
}
if (!body.professionalInfo || !body.professionalInfo.specialty || !body.professionalInfo.registerType) {
  return reply.code(400).send({
    error: { code: 'VALIDATION_ERROR', message: 'Professional info incomplete' }
  })
}

// Chamada use case com address
const result = await registerAutonomousUseCase.execute({
  ...body,
  address: body.address,  // incluir novo campo
  professionalInfo: {
    ...body.professionalInfo,
    registerUf: body.professionalInfo.registerUf,  // incluir novo campo
  }
})
```

**Done when**:
- [ ] Route valida `address` completo (street, city, state, zipCode obrigatórios)
- [ ] Route valida `professionalInfo.registerUf` é passado
- [ ] Use case é chamado com `address` completo
- [ ] Response 201 Created mantém a mesma estrutura

**Verify**:
```bash
npm run typecheck
# Esperado: sem erros
```

---

### T8: Atualizar `auth.routes.ts` — endpoint `/auth/register/clinica` [P]

**What**: Alterar validação e chamada do use case para aceitar `customization`
**Where**: `src/identity/adapters/http/auth.routes.ts` (linhas 217–272)
**Depends on**: T6

**Tools**: Read, Edit

**Transformações**:
```ts
// ANTES (sem customization)
const result = await registerClinicUseCase.execute({
  companyName: body.companyName,
  cnpj: body.cnpj,
  address: body.address,
  phone: body.phone,
  adminName: body.adminName,
  adminEmail: body.adminEmail,
  adminPassword: body.adminPassword,
  lgpdConsentVersion: body.lgpdConsentVersion,
})

// DEPOIS (com customization)
const result = await registerClinicUseCase.execute({
  companyName: body.companyName,
  cnpj: body.cnpj,
  address: body.address,
  phone: body.phone,
  adminName: body.adminName,
  adminEmail: body.adminEmail,
  adminPassword: body.adminPassword,
  customization: body.customization,  // incluir novo campo (opcional)
  lgpdConsentVersion: body.lgpdConsentVersion,
})
```

**Done when**:
- [ ] Route aceita `customization` opcional
- [ ] Use case é chamado com `customization`
- [ ] Response 201 Created mantém a mesma estrutura

**Verify**:
```bash
npm run typecheck
# Esperado: sem erros
```

---

### T9: Unit tests — `register-autonomous.use-case.ts` [P]

**What**: Criar testes unitários para validar cadastro de autônomo com address e registerUf
**Where**: `tests/unit/identity/register-autonomous.use-case.test.ts` (novo arquivo)
**Depends on**: T4, T5, T7

**Tools**: Write

**Done when**:
- [ ] Teste: cadastro com address completo → sucesso
- [ ] Teste: cadastro sem address → falha com 400
- [ ] Teste: cadastro com registerUf → sucesso
- [ ] Teste: e-mail duplicado → EmailAlreadyExistsError
- [ ] Teste: CPF duplicado → DocumentAlreadyExistsError
- [ ] Teste: CPF inválido → erro
- [ ] Todos os testes passam

**Verify**:
```bash
npm run test tests/unit/identity/register-autonomous.use-case.test.ts
# Esperado: PASS (7+ testes)
```

---

### T10: Unit tests — `register-clinic.use-case.ts` [P]

**What**: Criar testes unitários para validar cadastro de clínica com customization
**Where**: `tests/unit/identity/register-clinic.use-case.test.ts` (novo arquivo)
**Depends on**: T6, T8

**Tools**: Write

**Done when**:
- [ ] Teste: cadastro com customization → sucesso e persiste logoUrl
- [ ] Teste: cadastro sem customization → sucesso (opcional)
- [ ] Teste: CNPJ duplicado → DocumentAlreadyExistsError
- [ ] Teste: e-mail duplicado → EmailAlreadyExistsError
- [ ] Teste: CNPJ inválido → erro
- [ ] Todos os testes passam

**Verify**:
```bash
npm run test tests/unit/identity/register-clinic.use-case.test.ts
# Esperado: PASS (6+ testes)
```

---

### T11: Unit tests — `auth.routes.ts` [P]

**What**: Criar testes unitários para validar rotas de cadastro (autonomo e clinica)
**Where**: `tests/unit/identity/auth.routes.test.ts` (novo arquivo ou expandir existente)
**Depends on**: T7, T8

**Tools**: Write

**Done when**:
- [ ] Teste: POST /auth/register/autonomo com payload correto → 201
- [ ] Teste: POST /auth/register/autonomo sem address → 400
- [ ] Teste: POST /auth/register/autonomo sem professionalInfo.registerUf → 400
- [ ] Teste: POST /auth/register/clinica com payload correto → 201
- [ ] Teste: POST /auth/register/clinica com customization → 201
- [ ] Todos os testes passam

**Verify**:
```bash
npm run test tests/unit/identity/auth.routes.test.ts
# Esperado: PASS (6+ testes)
```

---

### T12: Corrigir payload do cadastro de profissional autônomo [P]

**What**: Alterar a função `handleSubmit` em `autonomo/page.tsx` para enviar os campos no formato correto do backend (incluindo `address` e `professionalInfo.registerUf`)
**Where**: `frontend/src/app/(auth)/cadastro/autonomo/page.tsx` (linhas 159–207)
**Depends on**: T3, T4, T5

**Tools**: Read, Edit

**Transformações**:
```ts
// ANTES (incompleto)
await api.post("/auth/register/autonomo", {
  nome: personalData.nome,
  telefone: personalData.telefone,
  senha: personalData.senha,
  tipoProfissional: professionalData.tipoProfissional,
  conselho: professionalData.conselho,
  numeroRegistro: professionalData.numeroRegistro,
  ufRegistro: professionalData.ufRegistro,
  endereco: { ... },
  aceitouTermoLGPD: true,
})

// DEPOIS (completo)
await api.post("/auth/register/autonomo", {
  name: personalData.nome,
  email: personalData.email,
  phone: personalData.telefone,
  cpf: personalData.cpf,
  password: personalData.senha,
  address: {
    street: professionalData.rua,
    number: professionalData.numero,
    complement: professionalData.complemento || undefined,
    neighborhood: professionalData.bairro,
    city: professionalData.cidade,
    state: professionalData.uf,
    zipCode: professionalData.cep.replace('-', ''),
  },
  professionalInfo: {
    specialty: professionalData.tipoProfissional,
    registerType: professionalData.conselho.toUpperCase() as 'CRM' | 'CRP' | 'CREFITO' | 'OUTRO',
    registerNumber: professionalData.numeroRegistro,
    registerUf: professionalData.ufRegistro,
  },
  lgpdConsentVersion: "1.0",
})
```

**Done when**:
- [ ] Campo `address` completo incluindo `neighborhood` (bairro)
- [ ] Campo `address.zipCode` sem formatação (números só)
- [ ] Campo `professionalInfo.registerUf` incluído
- [ ] Campos `email` e `cpf` incluídos
- [ ] Campo `lgpdConsentVersion: "1.0"` (string, não boolean)

**Verify**: DevTools Network → submeter → request body bate com spec.

---

### T13: Corrigir payload do cadastro de clínica [P]

**What**: Alterar a função `handleSubmit` em `clinica/page.tsx` para enviar os campos no formato correto do backend (incluindo `customization`)
**Where**: `frontend/src/app/(auth)/cadastro/clinica/page.tsx` (linhas 161–212)
**Depends on**: T6

**Tools**: Read, Edit

**Transformações**:
```ts
// ANTES (sem customization)
await api.post("/auth/register/clinica", {
  razaoSocial: clinicData.razaoSocial,
  cnpj: clinicData.cnpj,
  telefone: clinicData.telefoneClinica,
  endereco: { ... },
  admin: { ... },
  personalizacao: customizationData,
  aceitouTermoLGPD: true,
})

// DEPOIS (com customization)
await api.post("/auth/register/clinica", {
  companyName: clinicData.razaoSocial,
  cnpj: clinicData.cnpj,
  phone: clinicData.telefoneClinica,
  address: {
    street: clinicData.rua,
    number: clinicData.numero,
    complement: clinicData.complemento || undefined,
    neighborhood: clinicData.bairro,
    city: clinicData.cidade,
    state: clinicData.uf,
    zipCode: clinicData.cep.replace('-', ''),
  },
  adminName: adminData.nome,
  adminEmail: adminData.email,
  adminPassword: adminData.senha,
  customization: {
    logoUrl: customizationData.logoUrl || undefined,
    primaryColor: customizationData.corPrimaria,
    secondaryColor: customizationData.corSecundaria,
  },
  lgpdConsentVersion: "1.0",
})
```

**Done when**:
- [ ] Campo `companyName` substitui `razaoSocial`
- [ ] Campo `address` com chaves corretas incluindo `neighborhood`
- [ ] Campo `address.zipCode` sem formatação (números só)
- [ ] Campos `adminName`, `adminEmail`, `adminPassword` flat (sem nesting)
- [ ] Campo `customization` renomeado e estruturado
- [ ] Campo `lgpdConsentVersion: "1.0"` (string)

**Verify**: DevTools Network → submeter → request body bate com spec.

---

### T14: Unit tests — `autonomo/page.tsx` [P]

**What**: Criar testes unitários para a página de cadastro autônomo
**Where**: `frontend/src/__tests__/auth/cadastro-autonomo/page.test.tsx` (expandir existente)
**Depends on**: T12

**Tools**: Write, Edit

**Done when**:
- [ ] Teste: submeter formulário com todos os campos → gera payload correto
- [ ] Teste: validar que `address` é incluído no payload
- [ ] Teste: validar que `professionalInfo.registerUf` é incluído
- [ ] Teste: validar transformação de `ufRegistro` → `professionalInfo.registerUf`
- [ ] Teste: validar que `lgpdConsentVersion: "1.0"` é string
- [ ] Todos os testes passam

**Verify**:
```bash
npm run test frontend/src/__tests__/auth/cadastro-autonomo/page.test.tsx
# Esperado: PASS (6+ testes)
```

---

### T15: Unit tests — `clinica/page.tsx` [P]

**What**: Criar testes unitários para a página de cadastro de clínica
**Where**: `frontend/src/__tests__/auth/cadastro-clinica/page.test.tsx` (expandir existente)
**Depends on**: T13

**Tools**: Write, Edit

**Done when**:
- [ ] Teste: submeter formulário com todos os campos → gera payload correto
- [ ] Teste: validar que `address` é incluído no payload
- [ ] Teste: validar que `customization` é incluído no payload
- [ ] Teste: validar transformação de nomes de campos
- [ ] Teste: validar que `lgpdConsentVersion: "1.0"` é string
- [ ] Todos os testes passam

**Verify**:
```bash
npm run test frontend/src/__tests__/auth/cadastro-clinica/page.test.tsx
# Esperado: PASS (5+ testes)
```

---

### T16: Validação end-to-end — cadastro autônomo com address

**What**: Testar o fluxo completo de cadastro de autônomo com backend rodando
**Where**: Browser — `http://localhost:3001/cadastro/autonomo`
**Depends on**: T9, T10, T11, T14

**Tools**: Nenhum (teste manual ou e2e)

**Done when**:
- [ ] POST retorna 201 Created
- [ ] Tela de "Verifique seu e-mail" é exibida
- [ ] Database registra address completo (sem bairro vazio)
- [ ] Database registra registerUf
- [ ] Teste com e-mail duplicado exibe toast correto

**Verify**:
```bash
curl -X POST http://localhost:3002/api/v1/auth/register/autonomo \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Teste",
    "email": "teste@email.com",
    "phone": "11999999999",
    "cpf": "12345678901",
    "password": "Senha123",
    "address": {
      "street": "Rua das Flores",
      "number": "100",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01001000"
    },
    "professionalInfo": {
      "specialty": "psicologo",
      "registerType": "CRP",
      "registerNumber": "12345",
      "registerUf": "SP"
    },
    "lgpdConsentVersion": "1.0"
  }'
# Esperado: 201 Created
```

---

### T17: Validação end-to-end — cadastro de clínica com customization

**What**: Testar o fluxo completo de cadastro de clínica com backend rodando
**Where**: Browser — `http://localhost:3001/cadastro/clinica`
**Depends on**: T9, T10, T11, T15

**Tools**: Nenhum (teste manual ou e2e)

**Done when**:
- [ ] POST retorna 201 Created
- [ ] Tela de "Verifique seu e-mail" é exibida
- [ ] Database registra address completo
- [ ] Database registra logoUrl e cores (conforme decisão de arquitetura)
- [ ] Teste com CNPJ duplicado exibe toast correto

**Verify**:
```bash
curl -X POST http://localhost:3002/api/v1/auth/register/clinica \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Clínica Teste",
    "cnpj": "12345678000195",
    "phone": "11999999999",
    "address": {
      "street": "Rua das Flores",
      "number": "100",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01001000"
    },
    "adminName": "Admin Teste",
    "adminEmail": "admin@clinica.com",
    "adminPassword": "Senha123",
    "customization": {
      "logoUrl": "https://example.com/logo.png",
      "primaryColor": "#059669",
      "secondaryColor": "#0d9488"
    },
    "lgpdConsentVersion": "1.0"
  }'
# Esperado: 201 Created
```

---

## Parallel Execution Map

```
Phase 1 (Sequencial):
  T1 ──→ T2 ──→ T3

Phase 2 (Paralelo):
  T3 ──┬── T4 ──┐
       ├── T5 ──┤
       └── T6 ──┤
               T7, T8

Phase 3 (Paralelo):
  T4, T5, T6 ──┬── T7 ──┐
               └── T8 ──┤
                       T9, T10, T11

Phase 4 (Paralelo):
  T3 ──┬── T12 ──┐
       └── T13 ──┤
               T14, T15

Phase 5 (Sequencial):
  T9, T10, T11, T14, T15 ──→ T16 ──→ T17
```

---

## Task Granularity Check

| Task | Escopo | Status |
|---|---|---|
| T1-T2 | Confirmação | ✅ Granular |
| T3 | 1 interface, 1 campo | ✅ Granular |
| T4-T6 | 1 interface cada | ✅ Granular |
| T7-T8 | 1 rota cada | ✅ Granular |
| T9-T11 | 1 arquivo teste cada | ✅ Granular |
| T12-T13 | 1 função cada | ✅ Granular |
| T14-T15 | 1 arquivo teste cada | ✅ Granular |
| T16-T17 | 1 fluxo cada | ✅ Granular |
