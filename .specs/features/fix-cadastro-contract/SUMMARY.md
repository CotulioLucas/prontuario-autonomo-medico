# Fix: Contrato de Cadastro — Sumário Executivo

## O que foi criado

✅ **spec.md** — Especificação completa com 2 user stories P1 (MVP)  
✅ **tasks.md** — 17 tasks granulares com dependências e plano de execução

---

## Mudanças de Escopo (vs. primeira versão)

| Item | Antes | Agora |
|---|---|---|
| `ufRegistro` | Removido (out of scope) | ✅ Backend + Frontend |
| `endereco` (autônomo) | Removido (out of scope) | ✅ Backend + Frontend |
| `personalizacao` (clínica) | Removido (out of scope) | ✅ Backend + Frontend |
| Testes unitários | Separado (escopo diferente) | ✅ Obrigatório (17 tasks) |

---

## 17 Tasks Estruturadas em 7 Fases

```
Phase 1 (Sequencial — Foundation)
├── T1: Confirmar contrato backend
├── T2: Confirmar lgpdConsentVersion
└── T3: Update ProfessionalInfo interface ← registerUf

Phase 2 (Paralelo — Backend Interfaces)
├── T4: RegisterAutonomousInput + address
├── T5: RegisterAutonomousInput + registerUf
└── T6: RegisterClinicInput + customization

Phase 3 (Paralelo — Backend Routes)
├── T7: /auth/register/autonomo validação
└── T8: /auth/register/clinica validação

Phase 4 (Paralelo — Backend Unit Tests)
├── T9:  register-autonomous.use-case.ts (7+ testes)
├── T10: register-clinic.use-case.ts (6+ testes)
└── T11: auth.routes.ts (6+ testes)

Phase 5 (Paralelo — Frontend Fix)
├── T12: autonomo/page.tsx payload fix
└── T13: clinica/page.tsx payload fix

Phase 6 (Paralelo — Frontend Unit Tests)
├── T14: autonomo/page.tsx tests (6+ testes)
└── T15: clinica/page.tsx tests (5+ testes)

Phase 7 (Sequencial — E2E Validation)
├── T16: Validação autônomo com address
└── T17: Validação clínica com customization
```

---

## Backend Changes Necessários

### 1. Domain (`src/identity/domain/entities.ts`)
- [ ] Adicionar `registerUf?: string` em `ProfessionalInfo`

### 2. Use Cases
- [ ] `register-autonomous.use-case.ts`: aceitar `address: Address` e persistir em `Tenant`
- [ ] `register-clinic.use-case.ts`: aceitar `customization` e persistir em `Tenant`

### 3. HTTP Routes (`src/identity/adapters/http/auth.routes.ts`)
- [ ] `/auth/register/autonomo`: validar `address` completo (street, city, state, zipCode obrigatórios)
- [ ] `/auth/register/autonomo`: validar `professionalInfo.registerUf` obrigatório
- [ ] `/auth/register/clinica`: aceitar `customization` opcional

---

## Frontend Changes Necessários

### 1. Cadastro Autônomo (`frontend/src/app/(auth)/cadastro/autonomo/page.tsx`)
- [ ] Mapear payload com `address` (street, number, complement, neighborhood, city, state, zipCode)
- [ ] Mapear `professionalInfo.registerUf` ← `ufRegistro`
- [ ] Enviar `lgpdConsentVersion: "1.0"` (string)

### 2. Cadastro Clínica (`frontend/src/app/(auth)/cadastro/clinica/page.tsx`)
- [ ] Mapear payload com `customization` (logoUrl, primaryColor, secondaryColor)
- [ ] Flatten admin fields (adminName, adminEmail, adminPassword)
- [ ] Enviar `lgpdConsentVersion: "1.0"` (string)

---

## Cobertura de Testes

| Camada | Arquivo | Quantidade | Status |
|---|---|---|---|
| Backend | register-autonomous.use-case.test.ts | 7+ testes | ✅ T9 |
| Backend | register-clinic.use-case.test.ts | 6+ testes | ✅ T10 |
| Backend | auth.routes.test.ts | 6+ testes | ✅ T11 |
| Frontend | autonomo/page.test.tsx | 6+ testes | ✅ T14 |
| Frontend | clinica/page.test.tsx | 5+ testes | ✅ T15 |
| **Total** | | **30+ testes** | ✅ Obrigatório |

---

## Dependências Críticas

```
T1 ──→ T2 ──→ T3
       ↓
   ┌───┴─────┬────────┐
   T4 ←──T2  T5 ←──T2  T6 ←──T2
   ↓        ↓        ↓
   T7       T8       (T7, T8 em paralelo)
   ↓         ↓
   T9, T10, T11 (em paralelo)

T3 ──┬─→ T12 ──→ T14
     └─→ T13 ──→ T15

(T9+T10+T11) + (T14+T15) ──→ T16 ──→ T17
```

---

## Próximos Passos

1. ✅ Spec e Tasks criados
2. 🔄 Próximo: Executar T1 (confirmar contrato backend)
3. 🔄 Depois: Executar T2 (confirmar lgpdConsentVersion)
4. 🔄 Depois: Paralelizar T3-T6 (domain + interfaces)
5. 🔄 Depois: Paralelizar T7-T8 (routes)
6. 🔄 Depois: Paralelizar T9-T11 (backend tests)
7. 🔄 Depois: Paralelizar T12-T13 (frontend fix)
8. 🔄 Depois: Paralelizar T14-T15 (frontend tests)
9. 🔄 Depois: Sequencial T16-T17 (e2e validation)

---

## Comandos de Validação

```bash
# TypeScript check
npm run typecheck

# Rodar testes backend
npm run test tests/unit/identity/

# Rodar testes frontend
npm run test frontend/src/__tests__/auth/cadastro-*

# Rodar tudo
npm run test
```

---

**Feature Status**: ✅ Aprovado para implementação  
**Última atualização**: 2025-02-25
