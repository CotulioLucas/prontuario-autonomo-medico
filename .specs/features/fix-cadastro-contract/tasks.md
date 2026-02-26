# Tasks: Fix Contrato de Cadastro Frontend ↔ Backend

**Versão:** 1.0
**Data:** 2026-02-25
**Total de Tasks:** 17
**Estimativa de Cobertura de Testes:** 20+ testes (11 frontend + 9 backend)

---

## Estrutura de Dependências

```
┌─────────────────────────────────────────────────────────┐
│ T1: Criar arquivo mapper                                │
└────────────────┬────────────────────────────────────────┘
                 │
         ┌───────┴─────────┐
         ▼                 ▼
┌──────────────────┐ ┌──────────────────┐
│ T2: Implementar  │ │ T3: Implementar  │
│ mapper autônomo  │ │ mapper clínica   │
└──────┬───────────┘ └────────┬─────────┘
       │                      │
       └──────────┬───────────┘
                  ▼
         ┌──────────────────────┐
         │ T4: Atualizar API    │
         │ auth.ts com mappers  │
         └──┬───────────────────┘
            │
      ┌─────┴──────────┐
      ▼                ▼
   ┌──────────────┐ ┌──────────────┐
   │ T5: Form     │ │ T6: Form     │
   │ autônomo     │ │ clínica      │
   └──┬───────────┘ └────┬─────────┘
      │                  │
      └──────┬───────────┘
             ▼
    ┌──────────────────────┐
    │ T7-T8: Testes        │
    │ Mappers (2 tasks)    │
    └──────┬───────────────┘
           │
      ┌────┴────────────┐
      ▼                 ▼
   ┌─────────────┐ ┌──────────────┐
   │ T9: Testes  │ │ T10: Testes  │
   │ API calls   │ │ componentes  │
   └─────┬───────┘ └──────┬───────┘
         │                │
         └────┬───────────┘
              ▼
    ┌──────────────────────┐
    │ T11-T12: E2E Tests   │
    │ (autônomo + clínica) │
    └──────┬───────────────┘
           │
           ▼
    ┌──────────────────────┐
    │ T13-T17: Validação   │
    │ final (TS, review)   │
    └──────────────────────┘
```

---

## Tasks

### T1: Criar arquivo mapper `src/lib/mappers/registration.ts`

**Descrição:**
Criar arquivo vazio estruturado que será o container para as funções de transformação. Deve incluir as interfaces TypeScript que definem a entrada e saída.

**Critérios de Aceitação:**
1. Arquivo `src/lib/mappers/registration.ts` existe
2. Interfaces `AutonomousFormData` e `AutonomousRegistrationPayload` definidas
3. Interfaces `ClinicFormData` e `ClinicRegistrationPayload` definidas
4. Arquivo é importável sem erros TypeScript
5. Comentários explicam cada interface

**Arquivos afetados:**
- ✏️ `src/lib/mappers/registration.ts` (criar)

**Testes:**
- Unit: 1 teste verificando imports e tipos

---

### T2: Implementar mapper `transformAutonomousForm()`

**Descrição:**
Implementar função que transforma dados do formulário autônomo (português) para o contrato esperado pelo backend (inglês + estrutura nested).

**Transformações:**
- `nome` → `name`
- `telefone` → `phone`
- `senha` → `password`
- `tipoProfissional` → `professionalInfo.specialty`
- `conselho` → `professionalInfo.registerType` (uppercase)
- `numeroRegistro` → `professionalInfo.registerNumber`
- `ufRegistro` → `professionalInfo.registerUf` (obrigatório!)
- `endereco.*` → `address.*` (renomear chaves)
- `aceitouTermoLGPD` (boolean) → `lgpdConsentVersion: "1.0"` (string)
- Omitir `address.complement` se vazio

**Critérios de Aceitação:**
1. Função exportada e sem erros TypeScript
2. Nenhum campo obrigatório fica `undefined`
3. `complement` é omitido se vazio (não undefined)
4. `conselho` é convertido para uppercase
5. `lgpdConsentVersion` é sempre string "1.0"
6. `professionalInfo.registerUf` sempre presente
7. Função retorna payload no formato exato esperado pelo backend

**Arquivos afetados:**
- ✏️ `src/lib/mappers/registration.ts` (implementar função)

**Testes:**
- Unit: 5 testes cobrindo transformações principais e edge cases

---

### T3: Implementar mapper `transformClinicForm()`

**Descrição:**
Implementar função que transforma dados do formulário de clínica (português) para o contrato esperado pelo backend.

**Transformações:**
- `razaoSocial` → `companyName`
- `cnpj` → `cnpj` (sem alteração)
- `admin.nome` → `adminName` (desaninhar)
- `admin.email` → `adminEmail`
- `admin.senha` → `adminPassword`
- `endereco.*` → `address.*` (renomear chaves)
- `personalizacao.*` → `customization.*` (renomear + omitir se vazio)
- `aceitouTermoLGPD` (boolean) → `lgpdConsentVersion: "1.0"`
- Remover `admin.telefone` e `admin.cpf` (não enviados)

**Critérios de Aceitação:**
1. Função exportada e sem erros TypeScript
2. Admin fields desaninhados corretamente
3. Customization omitido se não informado
4. `lgpdConsentVersion` é sempre string "1.0"
5. Telefone e CPF do admin NÃO são inclusos no payload
6. Função retorna payload no formato exato esperado pelo backend

**Arquivos afetados:**
- ✏️ `src/lib/mappers/registration.ts` (implementar função)

**Testes:**
- Unit: 6 testes cobrindo transformações, desaninhamento e omissões

---

### T4: Atualizar `src/lib/api/auth.ts` com chamadas mapeadas

**Descrição:**
Atualizar funções `registerAutonomous()` e `registerClinic()` para:
1. Aplicar mappers antes de enviar
2. Mapear respostas de erro do backend para mensagens amigáveis
3. Tratamento consistente de diferentes códigos de erro

**Tratamento de Erros:**
| Código Backend | Toast Frontend |
|---|---|
| `DUPLICATE_EMAIL` | "Este e-mail já está cadastrado" |
| `DUPLICATE_CPF` (autônomo) | "Este CPF já está cadastrado" |
| `DUPLICATE_CNPJ` (clínica) | "Este CNPJ já está cadastrado" |
| `VALIDATION_ERROR` | Usar `error.message` do backend |
| Qualquer outro | "Erro ao registrar. Tente novamente." |

**Critérios de Aceitação:**
1. Função `registerAutonomous()` usa `transformAutonomousForm()`
2. Função `registerClinic()` usa `transformClinicForm()`
3. POST é enviado para endpoint correto (`/auth/register/autonomo` ou `//auth/register/clinica`)
4. Credentials: 'include' (para cookies)
5. Erros mapeados conforme tabela acima
6. Sucesso retorna `{ success: true }`
7. Erro retorna `{ success: false, message: string }`

**Arquivos afetados:**
- ✏️ `src/lib/api/auth.ts` (atualizar funções)

**Testes:**
- Unit: 3 testes para cada função (sucesso + 2 cenários de erro)

---

### T5: Atualizar componente `RegisterAutonomousForm`

**Descrição:**
Atualizar componente para:
1. Usar `react-hook-form` com schema Zod
2. Incluir validação local (confirmação de senha, campo obrigatório `ufRegistro`)
3. Chamar `registerAutonomous()` do `api/auth.ts`
4. Exibir feedback via `toast` (sucesso ou erro)
5. Redirecionar para tela de confirmação de e-mail após sucesso

**Validações Zod:**
```typescript
{
  nome: string.min(3),
  email: string.email(),
  telefone: string.regex(/^\+?[\d\s-]{10,}$/),
  senha: string.min(8),
  confirmaSenha: string, // verificar se === senha
  tipoProfissional: string.min(1),
  conselho: enum(['CRM', 'CRP', 'CREFITO', 'OUTRO']),
  numeroRegistro: string.min(1),
  ufRegistro: string.length(2), // CRÍTICO: obrigatório!
  endereco: {
    rua: string.min(1),
    numero: string.min(1),
    complemento: string.optional(),
    bairro: string.min(1),
    cidade: string.min(1),
    uf: string.length(2),
    cep: string.regex(/^\d{5}-?\d{3}$/),
  },
  aceitouTermoLGPD: boolean.refine(val => val === true),
}
```

**Critérios de Aceitação:**
1. Formulário usa `useForm` com resolver Zod
2. Campo `ufRegistro` é obrigatório
3. Validação de confirmação de senha
4. Validação de CEP (5 dígitos + 3 dígitos)
5. Checkbox LGPD obrigatório
6. Ao submeter, chama `registerAutonomous()`
7. Sucesso: toast green + redireciona para `/auth/email-confirmation`
8. Erro: toast red com mensagem do backend
9. Botão fica desabilitado enquanto carrega (`loading` state)

**Arquivos afetados:**
- ✏️ `src/components/forms/register-autonomous.tsx` (atualizar)

**Testes:**
- Unit: 3 testes (validação, submit, erro handling)

---

### T6: Atualizar componente `RegisterClinicForm`

**Descrição:**
Atualizar componente para:
1. Usar `react-hook-form` com schema Zod
2. Incluir validação local
3. Chamar `registerClinic()` do `api/auth.ts`
4. Exibir feedback via `toast`
5. Redirecionar para tela de confirmação de e-mail após sucesso

**Validações Zod:**
```typescript
{
  razaoSocial: string.min(3),
  cnpj: string.regex(/^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/),
  endereco: {
    rua: string.min(1),
    numero: string.min(1),
    complemento: string.optional(),
    bairro: string.min(1),
    cidade: string.min(1),
    uf: string.length(2),
    cep: string.regex(/^\d{5}-?\d{3}$/),
  },
  admin: {
    nome: string.min(3),
    email: string.email(),
    cpf: string.optional(), // coletado, não enviado
    telefone: string.optional(), // coletado, não enviado
    senha: string.min(8),
  },
  personalizacao: z.object({
    logoUrl: string.url().optional(),
    corPrimaria: string.regex(/^#[0-9A-F]{6}$/i).optional(),
    corSecundaria: string.regex(/^#[0-9A-F]{6}$/i).optional(),
  }).optional(),
  aceitouTermoLGPD: boolean.refine(val => val === true),
}
```

**Critérios de Aceitação:**
1. Formulário usa `useForm` com resolver Zod
2. Validação de CNPJ (formato completo)
3. Validação de email do admin
4. Validação de senha do admin (mínimo 8)
5. Campos de customização opcionais
6. Checkbox LGPD obrigatório
7. Ao submeter, chama `registerClinic()`
8. Sucesso: toast green + redireciona para `/auth/email-confirmation`
9. Erro: toast red com mensagem do backend
10. Botão fica desabilitado enquanto carrega

**Arquivos afetados:**
- ✏️ `src/components/forms/register-clinic.tsx` (atualizar)

**Testes:**
- Unit: 3 testes (validação, submit, erro handling)

---

### T7: Testes Unitários para `transformAutonomousForm()`

**Descrição:**
Criar suite de testes para a função mapper de autônomo.

**Casos de Teste:**

1. **Test 7.1:** Transforma campos básicos corretamente
   - Input: nome, email, telefone, senha
   - Expected: name, email (adicionado), phone, password no output
   - Type: Unitário

2. **Test 7.2:** Converte boolean LGPD para string "1.0"
   - Input: `aceitouTermoLGPD: true`
   - Expected: `lgpdConsentVersion: "1.0"`
   - Type: Unitário

3. **Test 7.3:** Converte conselho para uppercase
   - Input: `conselho: "crp"`
   - Expected: `registerType: "CRP"`
   - Type: Unitário

4. **Test 7.4:** Omite complement se vazio
   - Input: `endereco.complemento: ""`
   - Expected: `complement` não está no output
   - Type: Unitário

5. **Test 7.5:** Inclui complement se preenchido
   - Input: `endereco.complemento: "Apto 101"`
   - Expected: `address.complement: "Apto 101"`
   - Type: Unitário

**Critérios de Aceitação:**
1. 5 testes executam sem erro
2. Cobertura 100% da função `transformAutonomousForm()`
3. Todos os testes passam

**Arquivos afetados:**
- ✏️ `src/lib/mappers/registration.test.ts` (criar)

---

### T8: Testes Unitários para `transformClinicForm()`

**Descrição:**
Criar suite de testes para a função mapper de clínica.

**Casos de Teste:**

1. **Test 8.1:** Desaninha admin fields corretamente
   - Input: `admin.nome`, `admin.email`, `admin.senha`
   - Expected: `adminName`, `adminEmail`, `adminPassword` no output
   - Type: Unitário

2. **Test 8.2:** Remove campos admin não utilizados
   - Input: `admin.telefone: "123456"`, `admin.cpf: "12345678901"`
   - Expected: Esses campos não estão no output
   - Type: Unitário

3. **Test 8.3:** Converte boolean LGPD para string "1.0"
   - Input: `aceitouTermoLGPD: true`
   - Expected: `lgpdConsentVersion: "1.0"`
   - Type: Unitário

4. **Test 8.4:** Omite customization se não informado
   - Input: `personalizacao: undefined`
   - Expected: `customization` não está no output
   - Type: Unitário

5. **Test 8.5:** Inclui customization se informado
   - Input: `personalizacao.logoUrl: "https://..."`
   - Expected: `customization.logoUrl` presente no output
   - Type: Unitário

6. **Test 8.6:** Renomeia campos customization
   - Input: `personalizacao.corPrimaria`, `personalizacao.corSecundaria`
   - Expected: `customization.primaryColor`, `customization.secondaryColor`
   - Type: Unitário

**Critérios de Aceitação:**
1. 6 testes executam sem erro
2. Cobertura 100% da função `transformClinicForm()`
3. Todos os testes passam

**Arquivos afetados:**
- ✏️ `src/lib/mappers/registration.test.ts` (atualizar)

---

### T9: Testes de Integração para Chamadas API

**Descrição:**
Testes que mockam o fetch e verificam que as chamadas API estão corretas.

**Casos de Teste:**

1. **Test 9.1:** `registerAutonomous()` envia POST correto para `/auth/register/autonomo`
   - Mock: fetch
   - Input: AutonomousFormData completo
   - Expected: POST contém payload mapeado
   - Type: Integração

2. **Test 9.2:** `registerAutonomous()` retorna sucesso quando backend retorna 201
   - Mock: fetch com status 201
   - Expected: `{ success: true }`
   - Type: Integração

3. **Test 9.3:** `registerAutonomous()` mapeia erro DUPLICATE_EMAIL
   - Mock: fetch com status 409 + `{ code: 'DUPLICATE_EMAIL' }`
   - Expected: `{ success: false, message: 'Este e-mail já está cadastrado' }`
   - Type: Integração

4. **Test 9.4:** `registerAutonomous()` mapeia erro DUPLICATE_CPF
   - Mock: fetch com status 409 + `{ code: 'DUPLICATE_CPF' }`
   - Expected: `{ success: false, message: 'Este CPF já está cadastrado' }`
   - Type: Integração

5. **Test 9.5:** `registerClinic()` envia POST correto para `/auth/register/clinica`
   - Mock: fetch
   - Input: ClinicFormData completo
   - Expected: POST contém payload mapeado
   - Type: Integração

6. **Test 9.6:** `registerClinic()` retorna sucesso quando backend retorna 201
   - Mock: fetch com status 201
   - Expected: `{ success: true }`
   - Type: Integração

**Critérios de Aceitação:**
1. 6 testes executam sem erro
2. Fetch é mockado corretamente
3. Todos os testes passam
4. Erros são mapeados conforme design

**Arquivos afetados:**
- ✏️ `src/lib/api/auth.test.ts` (criar ou atualizar)

---

### T10: Testes para Componentes de Formulário

**Descrição:**
Testes que verificam validação Zod e comportamento dos formulários.

**Casos de Teste:**

1. **Test 10.1:** `RegisterAutonomousForm` valida campo obrigatório `ufRegistro`
   - Action: Submeter sem preencher `ufRegistro`
   - Expected: Erro de validação exibido
   - Type: Componente

2. **Test 10.2:** `RegisterAutonomousForm` valida confirmação de senha
   - Action: Preencher `senha` e `confirmaSenha` diferentes
   - Expected: Erro "Senhas não conferem"
   - Type: Componente

3. **Test 10.3:** `RegisterClinicForm` valida formato CNPJ
   - Action: Preencher CNPJ inválido
   - Expected: Erro de validação
   - Type: Componente

4. **Test 10.4:** `RegisterAutonomousForm` chama `registerAutonomous()` ao submeter com dados válidos
   - Action: Preencher todos os campos + submeter
   - Expected: `registerAutonomous()` é chamado
   - Type: Componente

5. **Test 10.5:** `RegisterAutonomousForm` exibe toast de sucesso
   - Mock: `registerAutonomous()` retorna `{ success: true }`
   - Expected: Toast com "Cadastro realizado! Verifique seu e-mail."
   - Type: Componente

6. **Test 10.6:** `RegisterAutonomousForm` exibe toast de erro
   - Mock: `registerAutonomous()` retorna `{ success: false, message: 'E-mail já cadastrado' }`
   - Expected: Toast com a mensagem do erro
   - Type: Componente

**Critérios de Aceitação:**
1. 6 testes executam sem erro
2. `useForm` e schema Zod funcionam corretamente
3. Toasts são exibidos (mocked)
4. Todos os testes passam

**Arquivos afetados:**
- ✏️ `src/components/forms/register-autonomous.test.tsx` (criar)
- ✏️ `src/components/forms/register-clinic.test.tsx` (criar)

---

### T11: Testes E2E - Cadastro de Profissional Autônomo

**Descrição:**
Teste end-to-end que simula o fluxo completo de cadastro de autônomo.

**Cenário:**
1. Usuário acessa formulário de cadastro autônomo
2. Preenche todos os campos (nome, email, telefone, senha, conselho, ufRegistro, endereco, LGPD)
3. Clica em "Criar conta"
4. Backend retorna 201 Created
5. Sistema exibe tela de confirmação de e-mail

**Critérios de Aceitação:**
1. Teste acessa página `/auth/cadastro/autonomo`
2. Teste preenche todos os campos com dados válidos
3. Teste clica no botão de submit
4. Teste verifica se POST foi enviado ao backend
5. Teste verifica se resposta foi 201
6. Teste verifica se navegou para `/auth/email-confirmation`

**Arquivos afetados:**
- ✏️ `e2e/registration-autonomous.e2e.ts` (criar)

---

### T12: Testes E2E - Cadastro de Clínica

**Descrição:**
Teste end-to-end que simula o fluxo completo de cadastro de clínica.

**Cenário:**
1. Usuário acessa formulário de cadastro de clínica
2. Preenche todos os campos (razaoSocial, cnpj, admin, endereco, LGPD)
3. Clica em "Criar conta"
4. Backend retorna 201 Created
5. Sistema exibe tela de confirmação de e-mail

**Critérios de Aceitação:**
1. Teste acessa página `/auth/cadastro/clinica`
2. Teste preenche todos os campos com dados válidos
3. Teste clica no botão de submit
4. Teste verifica se POST foi enviado ao backend
5. Teste verifica se resposta foi 201
6. Teste verifica se navegou para `/auth/email-confirmation`

**Arquivos afetados:**
- ✏️ `e2e/registration-clinic.e2e.ts` (criar)

---

### T13: Validação TypeScript Zero Errors

**Descrição:**
Executar `tsc --noEmit` ou equivalente para validar que não há erros de tipo em nenhum arquivo alterado.

**Critérios de Aceitação:**
1. Command `npm run type-check` executa sem erros
2. Nenhum arquivo mostra erro de tipo
3. Interfaces são corretamente tipadas

**Arquivos afetados:**
- (todos os arquivos afetados pelas tasks anteriores)

---

### T14: Validação de Cobertura de Testes

**Descrição:**
Executar suite de testes e verificar cobertura mínima de 80% para os arquivos alterados.

**Critérios de Aceitação:**
1. Command `npm test -- --coverage` executa
2. Cobertura mínima 80% para:
   - `src/lib/mappers/registration.ts`
   - `src/lib/api/auth.ts`
   - `src/components/forms/register-autonomous.tsx`
   - `src/components/forms/register-clinic.tsx`
3. Todos os testes passam

---

### T15: Testes Backend - Validar Endpoints Continuam Funcionando

**Descrição:**
Executar testes backend existentes para garantir que não houve regressão. Backend não foi alterado, mas certificar que continua aceitando os novos payloads.

**Critérios de Aceitação:**
1. POST `/auth/register/autonomo` retorna 201 com payload completo
2. POST `/auth/register/autonomo` retorna 400 se `registerUf` falta
3. POST `/auth/register/autonomo` retorna 400 se `address` incompleto
4. POST `/auth/register/clinica` retorna 201 com payload completo
5. POST `/auth/register/clinica` retorna 400 se `address` incompleto
6. POST `/auth/register/autonomo` retorna 409 se email duplicado
7. POST `/auth/register/autonomo` retorna 409 se CPF duplicado
8. POST `/auth/register/clinica` retorna 409 se CNPJ duplicado
9. POST `/auth/register/clinica` retorna 409 se email duplicado

**Arquivos afetados:**
- Testes backend (já existem, apenas executar)

---

### T16: Code Review Interno

**Descrição:**
Revisar todo o código alterado para:
1. Conformidade com convenções do projeto
2. Ausência de bugs lógicos
3. Tratamento de edge cases
4. Performance e segurança

**Critérios de Aceitação:**
1. Todos os mappers seguem padrão `transform*()` (PascalCase)
2. Erros de rede são tratados corretamente
3. Nenhuma chamada direta ao backend sem mapper
4. Validações frontend não duplicam backend
5. Código segue padrão hexagonal (adapters vs domain)

**Checklist:**
- [ ] Mappers testados isoladamente
- [ ] API calls mockadas nos testes
- [ ] Componentes usam hooks corretamente
- [ ] Sem `console.log` de debug
- [ ] Sem `any` types não justificados

---

### T17: Documentação e Commit

**Descrição:**
Finalizar com documentação de mudanças e criar commit atômico.

**Critérios de Aceitação:**
1. Arquivo `CHANGELOG.md` ou equivalente atualizado
2. `design.md` atualizado com implementação realizada
3. Git commit criado com mensagem descritiva
4. Todos os arquivos estão em formato consistente

**Commit message sugerida:**
```
feat(auth): implement registration form contract mapping

- Add transformer functions for autonomous and clinic registration
- Map form fields (português) to API contract (inglês)
- Add comprehensive error handling and toast notifications
- Implement Zod validation schemas for both registration forms
- Add 20+ unit and integration tests
- Zero TypeScript errors
```

---

## Resumo de Testes

| Tipo | Função | Qtd |
|---|---|---|
| Unitário | Mappers | 11 |
| Integração | API calls | 6 |
| Componente | Formulários | 6 |
| E2E | Fluxos completos | 2 |
| **Total** | | **25** |

**Cobertura esperada:** 80%+ para arquivos alterados

---

## Checklist de Implementação

- [ ] T1: Arquivo mapper criado
- [ ] T2: Mapper autônomo implementado
- [ ] T3: Mapper clínica implementado
- [ ] T4: API auth.ts atualizado
- [ ] T5: Componente autônomo atualizado
- [ ] T6: Componente clínica atualizado
- [ ] T7: Testes mapper autônomo
- [ ] T8: Testes mapper clínica
- [ ] T9: Testes API calls
- [ ] T10: Testes componentes
- [ ] T11: E2E autônomo
- [ ] T12: E2E clínica
- [ ] T13: TypeScript validation
- [ ] T14: Cobertura de testes
- [ ] T15: Testes backend
- [ ] T16: Code review
- [ ] T17: Documentação e commit

---

## Referências

- Design: `.specs/features/fix-cadastro-contract/design.md`
- Spec: `.specs/features/fix-cadastro-contract/spec.md`
- Stack: `.specs/codebase/STACK.md`
- Arquivo de recursos: `.specs/project/STATE.md`
