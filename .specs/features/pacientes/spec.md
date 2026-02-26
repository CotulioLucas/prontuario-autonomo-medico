# F02 — Gestão de Pacientes: Specification

## Problem Statement

Profissionais precisam cadastrar pacientes, definir vínculos com tarifa (para geração automática de cobranças) e encontrar rapidamente um paciente pelo nome ou CPF. Sem essa base, agendamentos, prontuário e financeiro não funcionam.

## Goals

- [ ] Qualquer profissional consegue cadastrar um paciente em < 2 minutos
- [ ] Vínculo profissional–paciente com tarifa criado na mesma sessão do cadastro
- [ ] Busca retorna resultados corretos em < 1 segundo para tenants com até 1000 pacientes

## Out of Scope

- Portal do paciente (paciente NÃO tem login na plataforma)
- Importação em massa de pacientes (CSV/planilha) — não planejado para v1
- Histórico de alterações do cadastro (audit trail) — LGPD de prontuário cobre evolução, não edição de dados cadastrais
- Fusão de cadastros duplicados — fora do MVP

---

## Status de Implementação (brownfield)

### Backend — IMPLEMENTADO ✅
- `GET /api/v1/patients?search=&page=&limit=` → ListPatientsUseCase (busca por nome/CPF, paginação)
- `GET /api/v1/patients/:id` → GetPatientUseCase (isolamento por tenantId)
- `POST /api/v1/patients` → CreatePatientUseCase (valida CPF duplicado por tenant)
- `PUT /api/v1/patients/:id` → UpdatePatientUseCase
- `GET /api/v1/patients/:id/links` → ListPatientLinksUseCase
- `POST /api/v1/patients/:id/links` → CreatePatientLinkUseCase (tarifa obrigatória)
- `PUT /api/v1/patients/:patientId/links/:linkId` → UpdatePatientLinkUseCase
- `DELETE /api/v1/patients/:patientId/links/:linkId` → DeletePatientLinkUseCase

### Backend — FALTANDO ❌
- **`patientRoutes` NÃO está registrado em `src/main.ts`** — rotas existem mas não são servidas
- Validação de formato de CPF do paciente (apenas unicidade é verificada, não formato/dígitos)
- Busca por telefone (endpoint aceita `search` mas implementação pode não cobrir telefone)
- Soft delete de paciente (`deletedAt` existe no schema mas não há endpoint de exclusão)
- Validação de consentimento LGPD ativo no tenant antes de permitir cadastro de paciente (DR-CO-3)
- Auditoria de acesso/criação de paciente (DR-CO-1)

### Frontend — IMPLEMENTADO ✅
- `/pacientes` — listagem com busca e paginação
- `/pacientes/novo` — formulário de criação
- `/pacientes/[id]` — detalhes do paciente
- `/pacientes/[id]/editar` — edição de cadastro
- `/pacientes/[id]/prontuario` — visualização do prontuário (lista de evoluções)
- `_components/patient-form.tsx` — componente de formulário reutilizado

### Frontend — FALTANDO ❌
- Tela/modal de vínculo profissional–paciente + tarifa (UI não implementada ou não confirmada)
- Mascaramento de CPF na listagem (DR exige CPF parcialmente mascarado)
- Feedback de erro quando backend retorna 404 ou 400

---

## User Stories

### P1: Cadastrar paciente ⭐ MVP

**User Story**: Como profissional autônomo ou secretária, quero cadastrar um paciente informando nome, CPF, telefone e e-mail, para manter o registro do paciente no sistema.

**Why P1**: Sem paciente cadastrado, não existe agendamento, prontuário ou cobrança. Base de tudo no contexto clínico.

**Acceptance Criteria**:

1. WHEN profissional envia `POST /api/v1/patients` com nome e telefone (mínimo obrigatório) THEN sistema SHALL criar paciente vinculado ao `tenantId` da sessão com status `active`
2. WHEN CPF informado tem formato inválido THEN sistema SHALL retornar erro `VALIDATION_ERROR`
3. WHEN CPF já existe para outro paciente do mesmo tenant THEN sistema SHALL retornar erro `DOCUMENT_ALREADY_EXISTS`
4. WHEN `tenantId` do corpo da requisição difere do `tenantId` da sessão THEN sistema SHALL ignorar o valor do corpo e usar sempre o da sessão (DR-IA-4)
5. WHEN paciente criado com sucesso THEN sistema SHALL retornar `201` com dados completos do paciente
6. WHEN consentimento LGPD não está ativo no tenant THEN sistema SHALL bloquear criação (DR-CO-3) ❌ **FALTANDO**

**Independent Test**: Autenticar → `POST /api/v1/patients` com nome e telefone → verificar `201` com `id` gerado → `GET /api/v1/patients/:id` retorna o mesmo paciente.

---

### P1: Vincular paciente a profissional com tarifa ⭐ MVP

**User Story**: Como profissional autônomo ou admin de clínica, quero criar o vínculo entre profissional e paciente com a tarifa de atendimento, para permitir agendamentos e definir o valor cobrado.

**Why P1**: Sem vínculo, não é possível criar agendamento (regra DR-AG-3). Sem tarifa, conta a receber não pode ser gerada (DR-FI-4).

**Acceptance Criteria**:

1. WHEN `POST /api/v1/patients/:id/links` com `tariff.amount > 0` e `tariff.type` válido THEN sistema SHALL criar vínculo profissional–paciente com tarifa
2. WHEN `professionalId` não informado THEN sistema SHALL usar o `userId` da sessão (profissional autônomo cria vínculo consigo mesmo)
3. WHEN vínculo duplicado tentado (mesmo profissional + mesmo paciente no tenant) THEN sistema SHALL retornar erro `LINK_ALREADY_EXISTS`
4. WHEN `tariff.amount <= 0` ou tarifa ausente THEN sistema SHALL retornar erro `TARIFF_REQUIRED`
5. WHEN vínculo criado THEN sistema SHALL retornar `201` com dados do vínculo incluindo tarifa
6. WHEN tarifa atualizada via `PUT /links/:linkId` THEN sistema SHALL alterar somente novos atendimentos — atendimentos passados não são afetados
7. WHEN vínculo desativado via `active: false` THEN paciente não poderá ser agendado com esse profissional até reativação

**Independent Test**: Criar paciente → criar vínculo com tarifa R$150/sessão → listar vínculos do paciente → verificar que tarifa consta → tentar criar agendamento (F03 test) confirma que vínculo é consultado.

---

### P1: Pesquisar paciente ⭐ MVP

**User Story**: Como profissional ou secretária, quero pesquisar pacientes por nome, CPF ou telefone, para encontrar rapidamente o cadastro.

**Why P1**: Lista de pacientes cresce rápido. Sem busca eficiente, a UX degrada imediatamente.

**Acceptance Criteria**:

1. WHEN `GET /api/v1/patients?search=joao` THEN sistema SHALL retornar pacientes cujo nome contenha "joao" (case-insensitive), filtrados pelo `tenantId` da sessão
2. WHEN `search` contém CPF (completo ou parcial) THEN sistema SHALL incluir pacientes com esse CPF no resultado
3. WHEN busca por telefone THEN sistema SHALL incluir pacientes com esse telefone ❌ **(verificar implementação)**
4. WHEN `search` vazio THEN sistema SHALL retornar todos os pacientes do tenant (paginado)
5. WHEN `page=2&limit=20` THEN sistema SHALL retornar a segunda página com no máximo 20 registros
6. WHEN resultado retornado THEN CPF SHALL ser exibido parcialmente mascarado na listagem (ex: `***.456.789-**`) ❌ **(FALTANDO — definir se backend ou frontend mascareia)**
7. WHEN paciente de outro tenant coincide com a busca THEN sistema SHALL NÃO retorná-lo

**Independent Test**: Criar 3 pacientes (2 com "Silva" no nome, 1 sem) → `GET /patients?search=silva` → verificar que retorna 2 resultados, ambos do tenant correto.

---

### P1: Visualizar e editar cadastro do paciente ⭐ MVP

**User Story**: Como profissional ou secretária, quero visualizar e editar o cadastro completo de um paciente, para manter os dados atualizados.

**Why P1**: Dados mudam (telefone, endereço). Sem edição, sistema vira read-only após cadastro.

**Acceptance Criteria**:

1. WHEN `GET /api/v1/patients/:id` autenticado THEN sistema SHALL retornar dados completos do paciente se pertencer ao tenant do usuário
2. WHEN paciente não pertence ao tenant do usuário THEN sistema SHALL retornar 404 (não revelar existência)
3. WHEN `PUT /api/v1/patients/:id` com campos parciais THEN sistema SHALL atualizar apenas os campos informados
4. WHEN novo CPF no update já pertence a outro paciente do mesmo tenant THEN sistema SHALL retornar erro `DOCUMENT_ALREADY_EXISTS`
5. WHEN paciente desativado via `status: 'inactive'` THEN paciente NÃO deve aparecer em buscas padrão ❌ **(verificar se ListPatients filtra por status)**

**Independent Test**: Criar paciente → `PUT` alterando telefone → `GET` confirma novo telefone → `PUT` com `status: 'inactive'` → busca não retorna paciente inativo.

---

### P2: Soft delete / inativar paciente

**User Story**: Como profissional, quero inativar um paciente sem perder o histórico clínico, para manter o prontuário íntegro conforme LGPD.

**Why P2**: Exclusão física de dados clínicos viola LGPD (retenção mínima 20 anos). Inativação lógica é o caminho correto. Pode ser iteração após MVP básico.

**Acceptance Criteria**:

1. WHEN `PUT /api/v1/patients/:id` com `status: 'inactive'` THEN sistema SHALL marcar como inativo sem excluir registros
2. WHEN paciente inativo THEN não deve aparecer na listagem padrão de pacientes
3. WHEN paciente inativo THEN seu prontuário e histórico financeiro permanecem acessíveis para auditoria (admin)
4. WHEN tentativa de criar agendamento para paciente inativo THEN sistema SHALL retornar erro

**Independent Test**: Criar paciente com atendimentos e evoluções → inativar → busca não retorna → prontuário ainda acessível pelo admin.

---

## Edge Cases

- WHEN paciente tem CPF nulo e outro paciente é cadastrado também sem CPF THEN sistema SHALL permitir (CPF é opcional; unicidade só se informado)
- WHEN requisição `POST /patients` inclui `tenantId` diferente no body THEN sistema SHALL usar o `tenantId` da sessão e ignorar o body (prevenção de privilege escalation)
- WHEN `limit` > 100 na listagem THEN sistema SHALL limitar a 100 registros por página para evitar sobrecarga
- WHEN busca com caracteres especiais (acentos, cedilha) THEN sistema SHALL normalizar antes de comparar
- WHEN profissional de uma clínica tenta ver paciente de outro tenant com id adivinhado THEN sistema SHALL retornar 404

---

## Success Criteria

- [ ] `patientRoutes` registrado em `main.ts` e servindo requisições ❌ **(CRÍTICO — FALTANDO)**
- [ ] Criar paciente → criar vínculo → buscar → editar funciona end-to-end
- [ ] CPF duplicado dentro do mesmo tenant é rejeitado
- [ ] Pacientes de tenants diferentes nunca aparecem cruzados
- [ ] Validação de formato de CPF implementada no backend
- [ ] LGPD: consentimento ativo no tenant verificado antes de criação de paciente
