# Design: Fix Contrato de Cadastro Frontend ↔ Backend

**Versão:** 1.0
**Data:** 2026-02-25
**Status:** ⚙️ Em Progresso

---

## 1. Análise de Impacto

### Arquivos Afetados

#### Frontend (src/app)
- `(auth)/cadastro/autonomo/page.tsx` — formulário de cadastro autônomo
- `(auth)/cadastro/clinica/page.tsx` — formulário de cadastro de clínica
- `src/components/forms/register-autonomous.tsx` — componente form autônomo
- `src/components/forms/register-clinic.tsx` — componente form clínica
- `src/lib/api/auth.ts` — chamadas API de registro
- `src/lib/schemas/` — validações Zod (se existirem)

#### Backend (src)
- `src/identity/adapters/http/routes/register.routes.ts` — endpoints POST `/register/autonomo` e `/register/clinica`
- `src/identity/application/use-cases/` — use cases de registro (sem alterações no contrato esperado)
- `src/infrastructure/persistence/prisma/` — repositories (sem alterações)

### Scope de Mudança
- **Frontend:** ✅ Alterações (mapeamento de campos)
- **Backend:** ❌ Zero alterações (contrato respeitado)
- **Banco de dados:** ❌ Zero alterações (schema existente)

---

## 2. Arquitetura da Solução

### 2.1 Transformação de Dados (Data Mapper)

A solução centraliza a transformação em **funções mapper** no frontend que convertem o payload do formulário (português) para o contrato esperado pelo backend (inglês + estrutura nested).

#### Pattern: Adapter Layer (Frontend)

```
┌─────────────────────────────────┐
│   React Form Components         │
│   (usando react-hook-form)      │
└────────────┬────────────────────┘
             │
             ▼ (FormData em português)
┌─────────────────────────────────┐
│   Mapper Functions              │
│   transformAutonomousForm()     │
│   transformClinicForm()         │
└────────────┬────────────────────┘
             │
             ▼ (JSON transformado)
┌─────────────────────────────────┐
│   API Client (fetch/axios)      │
│   POST /api/v1/auth/register/*  │
└─────────────────────────────────┘
```

**Localização das mappers:** `src/lib/mappers/registration.ts`

---

### 2.2 Contrato de Entrada (Frontend)

**Estrutura do Formulário (português):**

```typescript
// Autônomo
interface AutonomousFormData {
  nome: string;                    // required
  email: string;                   // required
  telefone: string;                // required
  senha: string;                   // required
  confirmaSenha: string;           // validação local apenas
  tipoProfissional: string;        // ex: "Psicólogo"
  conselho: string;                // ex: "CRP"
  numeroRegistro: string;          // ex: "123456"
  ufRegistro: string;              // ex: "SP"
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  aceitouTermoLGPD: boolean;       // required
}

// Clínica
interface ClinicFormData {
  razaoSocial: string;             // required
  cnpj: string;                    // required
  endereco: {
    rua: string;
    numero: string;
    complemento?: string;
    bairro: string;
    cidade: string;
    uf: string;
    cep: string;
  };
  admin: {
    nome: string;                  // required
    email: string;                 // required
    cpf?: string;                  // coletado, não enviado
    telefone?: string;             // coletado, não enviado
    senha: string;                 // required
  };
  personalizacao?: {
    logoUrl?: string;
    corPrimaria?: string;
    corSecundaria?: string;
  };
  aceitouTermoLGPD: boolean;       // required
}
```

---

### 2.3 Contrato de Saída (Backend)

**Estrutura do Payload esperado:**

```typescript
// POST /api/v1/auth/register/autonomo
interface AutonomousRegistrationPayload {
  name: string;
  phone: string;
  password: string;
  email: string;                         // adicionado por mapper
  professionalInfo: {
    specialty: string;                   // de: tipoProfissional
    registerType: string;                // de: conselho (em UPPERCASE)
    registerNumber: string;              // de: numeroRegistro
    registerUf: string;                  // de: ufRegistro (obrigatório!)
  };
  address: {
    street: string;                      // de: endereco.rua
    number: string;                      // de: endereco.numero
    complement?: string;                 // de: endereco.complemento (omitir se vazio)
    neighborhood: string;                // de: endereco.bairro
    city: string;                        // de: endereco.cidade
    state: string;                       // de: endereco.uf
    zipCode: string;                     // de: endereco.cep
  };
  lgpdConsentVersion: "1.0";             // de: aceitouTermoLGPD (transformar boolean → "1.0")
}

// POST /api/v1/auth/register/clinica
interface ClinicRegistrationPayload {
  companyName: string;                   // de: razaoSocial
  cnpj: string;
  address: {
    street: string;                      // de: endereco.rua
    number: string;                      // de: endereco.numero
    complement?: string;                 // omitir se vazio
    neighborhood: string;                // de: endereco.bairro
    city: string;                        // de: endereco.cidade
    state: string;                       // de: endereco.uf
    zipCode: string;                     // de: endereco.cep
  };
  adminName: string;                     // de: admin.nome
  adminEmail: string;                    // de: admin.email
  adminPassword: string;                 // de: admin.senha
  customization?: {                      // opcional
    logoUrl?: string;
    primaryColor?: string;               // de: personalizacao.corPrimaria
    secondaryColor?: string;             // de: personalizacao.corSecundaria
  };
  lgpdConsentVersion: "1.0";             // de: aceitouTermoLGPD (transformar)
}
```

---

## 3. Implementação por Camada

### 3.1 Frontend — Mappers (Transformer Pattern)

**Arquivo:** `src/lib/mappers/registration.ts`

```typescript
export function transformAutonomousForm(
  formData: AutonomousFormData
): AutonomousRegistrationPayload {
  return {
    name: formData.nome,
    phone: formData.telefone,
    password: formData.senha,
    email: formData.email,
    professionalInfo: {
      specialty: formData.tipoProfissional,
      registerType: formData.conselho.toUpperCase(),  // CRP → CRP
      registerNumber: formData.numeroRegistro,
      registerUf: formData.ufRegistro,  // CRÍTICO: obrigatório
    },
    address: {
      street: formData.endereco.rua,
      number: formData.endereco.numero,
      ...(formData.endereco.complemento ?
        { complement: formData.endereco.complemento } : {}),
      neighborhood: formData.endereco.bairro,
      city: formData.endereco.cidade,
      state: formData.endereco.uf,
      zipCode: formData.endereco.cep,
    },
    lgpdConsentVersion: "1.0",  // boolean → string
  };
}

export function transformClinicForm(
  formData: ClinicFormData
): ClinicRegistrationPayload {
  return {
    companyName: formData.razaoSocial,
    cnpj: formData.cnpj,
    address: {
      street: formData.endereco.rua,
      number: formData.endereco.numero,
      ...(formData.endereco.complemento ?
        { complement: formData.endereco.complemento } : {}),
      neighborhood: formData.endereco.bairro,
      city: formData.endereco.cidade,
      state: formData.endereco.uf,
      zipCode: formData.endereco.cep,
    },
    adminName: formData.admin.nome,
    adminEmail: formData.admin.email,
    adminPassword: formData.admin.senha,
    ...(formData.personalizacao ? {
      customization: {
        ...(formData.personalizacao.logoUrl &&
          { logoUrl: formData.personalizacao.logoUrl }),
        ...(formData.personalizacao.corPrimaria &&
          { primaryColor: formData.personalizacao.corPrimaria }),
        ...(formData.personalizacao.corSecundaria &&
          { secondaryColor: formData.personalizacao.corSecundaria }),
      }
    } : {}),
    lgpdConsentVersion: "1.0",  // boolean → string
  };
}
```

### 3.2 Frontend — Chamadas API

**Arquivo:** `src/lib/api/auth.ts`

```typescript
export async function registerAutonomous(
  formData: AutonomousFormData
): Promise<{ success: boolean; message?: string }> {
  const payload = transformAutonomousForm(formData);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register/autonomo`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',  // cookies
      }
    );

    if (!response.ok) {
      const error = await response.json();

      // Mapeamento de erros específicos do backend
      if (error.code === 'DUPLICATE_EMAIL') {
        return { success: false, message: 'Este e-mail já está cadastrado' };
      }
      if (error.code === 'DUPLICATE_CPF') {
        return { success: false, message: 'Este CPF já está cadastrado' };
      }

      return { success: false, message: error.message || 'Erro ao registrar' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: 'Erro de conexão' };
  }
}

export async function registerClinic(
  formData: ClinicFormData
): Promise<{ success: boolean; message?: string }> {
  const payload = transformClinicForm(formData);

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/register/clinica`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      }
    );

    if (!response.ok) {
      const error = await response.json();

      if (error.code === 'DUPLICATE_CNPJ') {
        return { success: false, message: 'Este CNPJ já está cadastrado' };
      }
      if (error.code === 'DUPLICATE_EMAIL') {
        return { success: false, message: 'Este e-mail já está cadastrado' };
      }

      return { success: false, message: error.message || 'Erro ao registrar' };
    }

    return { success: true };
  } catch (err) {
    return { success: false, message: 'Erro de conexão' };
  }
}
```

### 3.3 Frontend — Componentes de Formulário

**Arquivo:** `src/components/forms/register-autonomous.tsx`

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { registerAutonomous } from '@/lib/api/auth';
import { useState } from 'react';
import { toast } from 'sonner';

// Validação Zod (local, antes do mapper)
const autonomousSchema = z.object({
  nome: z.string().min(3, 'Nome mínimo 3 caracteres'),
  email: z.string().email('E-mail inválido'),
  telefone: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Telefone inválido'),
  senha: z.string().min(8, 'Senha mínimo 8 caracteres'),
  confirmaSenha: z.string(),
  tipoProfissional: z.string().min(1, 'Selecione a profissão'),
  conselho: z.enum(['CRM', 'CRP', 'CREFITO', 'OUTRO']),
  numeroRegistro: z.string().min(1, 'Número de registro obrigatório'),
  ufRegistro: z.string().length(2, 'UF obrigatória'),
  endereco: z.object({
    rua: z.string().min(1, 'Rua obrigatória'),
    numero: z.string().min(1, 'Número obrigatório'),
    complemento: z.string().optional(),
    bairro: z.string().min(1, 'Bairro obrigatório'),
    cidade: z.string().min(1, 'Cidade obrigatória'),
    uf: z.string().length(2, 'UF obrigatória'),
    cep: z.string().regex(/^\d{5}-?\d{3}$/, 'CEP inválido'),
  }),
  aceitouTermoLGPD: z.boolean().refine(val => val === true, 'LGPD obrigatória'),
}).refine(data => data.senha === data.confirmaSenha, {
  message: 'Senhas não conferem',
  path: ['confirmaSenha'],
});

type AutonomousFormData = z.infer<typeof autonomousSchema>;

export function RegisterAutonomousForm() {
  const form = useForm<AutonomousFormData>({
    resolver: zodResolver(autonomousSchema),
  });
  const [loading, setLoading] = useState(false);

  async function onSubmit(data: AutonomousFormData) {
    setLoading(true);
    try {
      const result = await registerAutonomous(data);

      if (result.success) {
        toast.success('Cadastro realizado! Verifique seu e-mail.');
        // Redirecionar para tela de confirmação de e-mail
      } else {
        toast.error(result.message || 'Erro ao registrar');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Campos do formulário aqui */}
      {/* Deve mapear para os nomes do AutonomousFormData interface acima */}
    </form>
  );
}
```

---

## 4. Fluxo de Validação

### 4.1 Validação no Frontend (react-hook-form + Zod)

- ✅ Comprimento mínimo de campos
- ✅ Formato de email
- ✅ Formato de telefone
- ✅ Confirmação de senha
- ✅ CEP válido
- ✅ UF obrigatória
- ✅ Checkbox LGPD obrigatório

### 4.2 Validação no Backend

O backend CONTINUA validando:
- ✅ CPF/CNPJ duplicado
- ✅ Email duplicado
- ✅ Campos obrigatórios presentes
- ✅ Formato de campos
- ✅ Address completo (street, city, state, zipCode)
- ✅ registerUf presente (autônomo)

**Diferença:** Agora o backend receberá o contrato CORRETO, então não falhará por desajuste de nomes de campos.

---

## 5. Mapeamento de Erros

| Código Backend | Tratamento Frontend |
|---|---|
| `DUPLICATE_EMAIL` | Toast: "Este e-mail já está cadastrado" |
| `DUPLICATE_CPF` | Toast: "Este CPF já está cadastrado" |
| `DUPLICATE_CNPJ` | Toast: "Este CNPJ já está cadastrado" |
| `VALIDATION_ERROR` | Toast com mensagem específica do backend |
| Qualquer outro erro | Toast genérico: "Erro ao registrar" |

---

## 6. Testes Esperados

### 6.1 Testes Frontend (11+)

1. **Mapper autônomo** — transforma nome → name, conselho → registerType em uppercase
2. **Mapper autônomo** — omite complement se vazio
3. **Mapper autônomo** — lança erro se ufRegistro vazio
4. **Mapper clínica** — desaninha admin.* para adminName, adminEmail, adminPassword
5. **Mapper clínica** — transforma boolean LGPD → "1.0"
6. **Mapper clínica** — omite customization se não informado
7. **API call autônomo** — envia POST correto ao backend
8. **API call autônomo** — mapeia erro DUPLICATE_EMAIL
9. **API call clínica** — envia POST correto ao backend
10. **Componente form autônomo** — valida campo obrigatório ufRegistro
11. **Componente form clínica** — valida checkbox LGPD

### 6.2 Testes Backend (9+)

1. **POST /register/autonomo** — retorna 201 com payload válido
2. **POST /register/autonomo** — retorna 400 se address incompleto
3. **POST /register/autonomo** — retorna 400 se registerUf vazio
4. **POST /register/autonomo** — retorna 409 se CPF duplicado
5. **POST /register/autonomo** — retorna 409 se email duplicado
6. **POST /register/clinica** — retorna 201 com payload válido
7. **POST /register/clinica** — retorna 400 se address incompleto
8. **POST /register/clinica** — retorna 409 se CNPJ duplicado
9. **POST /register/clinica** — retorna 409 se email duplicado

---

## 7. Casos Extremos (Edge Cases)

| Caso | Tratamento |
|---|---|
| `address.complement` vazio | Omitir do payload (não enviar como string vazia) |
| `personalizacao` não informado | Omitir `customization` do payload |
| `conselho: "crp"` (minúsculo) | Converter para `"CRP"` em uppercase |
| `aceitouTermoLGPD: true` | Enviar `lgpdConsentVersion: "1.0"` (string) |
| `endereco.uf` diferente de `ufRegistro` | Permitir — são campos diferentes |
| `registerUf` omitido | ❌ Validação falha no frontend (required) + 400 no backend |

---

## 8. Checklist de Implementação

- [ ] Criar arquivo `src/lib/mappers/registration.ts`
- [ ] Implementar `transformAutonomousForm()`
- [ ] Implementar `transformClinicForm()`
- [ ] Atualizar `src/lib/api/auth.ts` com mappers
- [ ] Adicionar tratamento de erros (DUPLICATE_*, VALIDATION_ERROR)
- [ ] Atualizar componente `RegisterAutonomousForm`
- [ ] Atualizar componente `RegisterClinicForm`
- [ ] Adicionar validação Zod com ufRegistro obrigatório
- [ ] Testes: 11+ frontend (mappers, API, componentes)
- [ ] Testes: 9+ backend (já existem — validar funcionamento)
- [ ] E2E: preencher formulário autônomo → 201 Created
- [ ] E2E: preencher formulário clínica → 201 Created
- [ ] Verificar zero erros TypeScript

---

## 9. Dependências e Pré-requisitos

- ✅ Backend já expõe endpoints corretos (não precisa alterar)
- ✅ Prisma já define schemas corretos (não precisa alterar)
- ✅ Frontend tem react-hook-form + zod instalados
- ✅ Frontend tem sonner para toasts

---

## 10. Riscos e Mitigações

| Risco | Mitigação |
|---|---|
| Campo `registerUf` não ser incluído | ✅ Validação Zod `required`, testes cobrem |
| `complement` enviado como string vazia | ✅ Usar spread operator condicional |
| Erros de backend não mapeados | ✅ Fallback para toast genérico + log console |
| Regressão em endpoints de login | ✅ Testes backend já existem, não alterar |

---

## Referências

- Spec: `.specs/features/fix-cadastro-contract/spec.md`
- Stack: `.specs/codebase/STACK.md` (react-hook-form, zod, sonner)
- Arquitetura: `.specs/codebase/ARCHITECTURE.md` (Hexagonal, adapters)
