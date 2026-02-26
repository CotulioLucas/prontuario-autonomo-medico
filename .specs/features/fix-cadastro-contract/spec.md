# Fix: Contrato de Cadastro Frontend ↔ Backend

## Problem Statement

As telas de cadastro (autônomo e clínica) retornam 400 Bad Request ao submeter o formulário.
O frontend envia campos com nomes em português e estrutura diferente da que o backend espera.
O backend valida campos obrigatórios que chegam `undefined` porque os nomes não batem — causando falha imediata.

## Goals

- [ ] Cadastro de profissional autônomo funciona end-to-end sem erro 400
- [ ] Cadastro de clínica funciona end-to-end sem erro 400
- [ ] Nenhuma alteração no backend

## Out of Scope

- Validações adicionais de CPF/CNPJ além das já existentes
- Migração de dados existentes (para futuros registros só)
- Integração com sistema externo de validação de registro profissional

---

## User Stories

### P1: Cadastro de Profissional Autônomo ⭐ MVP

**User Story**: Como profissional autônomo, quero me cadastrar na plataforma para que minha conta seja criada com sucesso.

**Why P1**: Sem isso o fluxo de onboarding está completamente quebrado — nenhum profissional autônomo consegue se registrar.

**Acceptance Criteria**:

1. WHEN usuário preenche todos os campos e clica "Criar conta" THEN sistema SHALL enviar payload com campos `name`, `phone`, `password`, `professionalInfo`, `lgpdConsentVersion` ao backend
2. WHEN payload chega ao backend THEN backend SHALL retornar 201 Created
3. WHEN cadastro é bem-sucedido THEN sistema SHALL exibir tela de confirmação de e-mail
4. WHEN e-mail já cadastrado THEN sistema SHALL exibir toast "Este e-mail já está cadastrado"
5. WHEN CPF já cadastrado THEN sistema SHALL exibir toast "Este CPF já está cadastrado"

**Independent Test**: Preencher formulário completo → clicar "Criar conta" → ver tela de "Verifique seu e-mail"

---

### P1: Cadastro de Clínica ⭐ MVP

**User Story**: Como administrador de clínica, quero me cadastrar na plataforma para que minha clínica seja criada com sucesso.

**Why P1**: Sem isso o segundo fluxo principal de onboarding está quebrado.

**Acceptance Criteria**:

1. WHEN usuário preenche todos os campos e clica "Criar conta" THEN sistema SHALL enviar payload com campos `companyName`, `cnpj`, `address`, `adminName`, `adminEmail`, `adminPassword`, `lgpdConsentVersion` ao backend
2. WHEN payload chega ao backend THEN backend SHALL retornar 201 Created
3. WHEN cadastro é bem-sucedido THEN sistema SHALL exibir tela de confirmação de e-mail
4. WHEN CNPJ já cadastrado THEN sistema SHALL exibir toast "Este CNPJ já está cadastrado"
5. WHEN e-mail já cadastrado THEN sistema SHALL exibir toast "Este e-mail já está cadastrado"

**Independent Test**: Preencher formulário completo → clicar "Criar conta" → ver tela de "Verifique seu e-mail"

---

## Edge Cases

- WHEN `lgpdConsentVersion` é enviado como boolean `true` THEN sistema SHALL enviar como string `"1.0"` (contrato do backend)
- WHEN `professionalInfo.registerType` recebe valor `"outro"` THEN sistema SHALL mapear para `"OUTRO"` (enum do backend: CRM | CRP | CREFITO | OUTRO)
- WHEN endereço está incompleto (falta street, city, state ou zipCode) THEN backend SHALL retornar 400 VALIDATION_ERROR
- WHEN `personalizacao` é omitida THEN sistema SHALL enviar `customization` como undefined (campo opcional)
- WHEN `address.complement` é vazio THEN sistema SHALL enviar como `undefined` (campo opcional)
- WHEN `registerUf` é omitido THEN backend SHALL rejeitar com 400 (campo obrigatório)

---

## Mapeamento Completo dos Campos

### Autônomo

| Frontend (atual) | Backend (esperado) | Transformação |
|---|---|---|
| `nome` | `name` | renomear |
| `telefone` | `phone` | renomear |
| `senha` | `password` | renomear |
| `tipoProfissional` | `professionalInfo.specialty` | mover para objeto |
| `conselho` | `professionalInfo.registerType` | mover + uppercase |
| `numeroRegistro` | `professionalInfo.registerNumber` | mover para objeto |
| `ufRegistro` | `professionalInfo.registerUf` | mover para objeto |
| `endereco` | `address` | renomear chave |
| `endereco.rua` | `address.street` | renomear chave |
| `endereco.numero` | `address.number` | renomear chave |
| `endereco.complemento` | `address.complement` | renomear chave |
| `endereco.bairro` | `address.neighborhood` | renomear chave |
| `endereco.cidade` | `address.city` | renomear chave |
| `endereco.uf` | `address.state` | renomear chave |
| `endereco.cep` | `address.zipCode` | renomear chave |
| `aceitouTermoLGPD: true` | `lgpdConsentVersion: "1.0"` | renomear + tipo string |

### Clínica

| Frontend (atual) | Backend (esperado) | Transformação |
|---|---|---|
| `razaoSocial` | `companyName` | renomear |
| `endereco.rua` | `address.street` | renomear chave |
| `endereco.numero` | `address.number` | renomear chave |
| `endereco.cidade` | `address.city` | renomear chave |
| `endereco.uf` | `address.state` | renomear chave |
| `endereco.cep` | `address.zipCode` | renomear chave |
| `admin.nome` | `adminName` | desaninhar + renomear |
| `admin.email` | `adminEmail` | desaninhar + renomear |
| `admin.senha` | `adminPassword` | desaninhar + renomear |
| `admin.telefone` | *(remover)* | não existe no backend |
| `admin.cpf` | *(remover)* | não existe no backend |
| `personalizacao.logoUrl` | `customization.logoUrl` | renomear |
| `personalizacao.corPrimaria` | `customization.primaryColor` | renomear |
| `personalizacao.corSecundaria` | `customization.secondaryColor` | renomear |
| `aceitouTermoLGPD: true` | `lgpdConsentVersion: "1.0"` | renomear + tipo string |

---

## Success Criteria

- [ ] POST `/api/v1/auth/register/autonomo` retorna 201 ao preencher formulário completo com address e registerUf
- [ ] POST `/api/v1/auth/register/clinica` retorna 201 ao preencher formulário completo com customization
- [ ] Backend aceita e persiste `address` completo para autônomo
- [ ] Backend aceita e persiste `registerUf` para profissional autônomo
- [ ] Backend aceita e persiste `customization` (logoUrl e cores) para clínica
- [ ] 17 tasks implementadas com 100% de cobertura de testes unitários
- [ ] Testes: backend (9+ testes), frontend (11+ testes)
- [ ] Zero erros TypeScript
- [ ] Erros de duplicidade (e-mail/CPF/CNPJ) continuam sendo exibidos corretamente
- [ ] Validações de endereço incompleto retornam 400
