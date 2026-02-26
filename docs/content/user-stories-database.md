# User Stories — Banco de Dados

**Fonte**: docs/domain/entities.md, aggregates.md, value-objects.md; docs/adr/0008-persistence-and-database.md
**Status**: Backlog
**Ultima atualizacao**: 2026-02-09
**Executor**: Agente de IA (uma US por tarefa). Cada US inclui Entradas (docs), Saidas (artefatos) e criterios de aceite verificaveis.

**Subagents**: Cada US indica **Agente(s) recomendado(s)** — arquivo em `subagents/<nome>.agent.md` que melhor se enquadra para executar a US.

=================================================================

## Personas

| Persona | Descricao |
|---------|-----------|
| **Desenvolvedor** | Implementa schema Prisma e migrations. |
| **Sistema** | Restricoes de schema (tenantId, indices, migrations). |

## Niveis de prioridade

| Nivel | Significado |
|-------|-------------|
| **P0** | Schema base: tenantId em todas as tabelas, indices (tenantId, id), contexto Identidade. |
| **P1** | Entidades Clínico, Agendamento, Financeiro. |
| **P2** | Migrations, soft delete, indices adicionais. |

=================================================================

## Inventario (US-DB-xx)

| ID | Titulo | Prioridade | Agente(s) recomendado(s) |
|----|--------|------------|---------------------------|
| US-DB-01 | tenantId em todas as tabelas de negocio | P0 | database |
| US-DB-02 | Indice composto (tenantId, id) em tabelas com tenantId | P0 | database |
| US-DB-03 | Schema Identidade: Tenant, User, RoleAssignment, ConsentimentoLGPD | P0 | database; domain (validar entidades) |
| US-DB-04 | Schema Clínico: Patient, ProfessionalPatientLink, Attendance, Evolution | P1 | database; domain (validar) |
| US-DB-05 | Schema Agendamento e Financeiro: Agenda, Appointment, Receivable, Receipt | P1 | database; domain (validar) |
| US-DB-06 | Migrations via prisma migrate, nomes descritivos, nao editar aplicadas | P2 | database |
| US-DB-07 | Soft delete apenas onde documentado (Patient, Appointment); demais hard delete | P2 | database |

=================================================================

## P0 — Schema base e Identidade

---

### US-DB-01: tenantId em todas as tabelas de negocio

**Agente(s) recomendado(s)**: `subagents/database.agent.md`

**Como** desenvolvedor, **quero** que o schema Prisma tenha todas as tabelas de negocio com coluna `tenantId` (UUID), **para** garantir isolamento multi-tenant (ADR 0008).

**Entradas (docs)**:
- docs/adr/0008-persistence-and-database.md
- docs/adr/0002-architectural-style-and-multi-tenant.md
- docs/domain/entities.md

**Saidas (artefatos)**:
- prisma/schema.prisma com coluna `tenantId` (String ou Bytes/UUID) em todas as tabelas que representam dados de negocio por tenant

**Criterios de aceite**:
- [ ] Toda tabela de dados de negocio (Tenant nao tem tenantId; User, Patient, Appointment, Receivable, etc. sim) possui coluna tenantId
- [ ] Tipo de tenantId e consistente (UUID em string ou tipo nativo)
- [ ] Relacao com Tenant definida onde aplicavel (ex.: User.tenantId -> Tenant.id)

---

### US-DB-02: Indice composto (tenantId, id)

**Agente(s) recomendado(s)**: `subagents/database.agent.md`

**Como** sistema, **quero** que exista indice composto `(tenantId, id)` em todas as tabelas com tenantId, **para** performance de listagens filtradas por tenant.

**Entradas (docs)**:
- docs/adr/0008-persistence-and-database.md
- prisma/schema.prisma (apos US-DB-01)

**Saidas (artefatos)**:
- prisma/schema.prisma com @@index([tenantId, id]) (ou equivalente) em cada modelo que tem tenantId

**Criterios de aceite**:
- [ ] Cada tabela com coluna tenantId possui indice composto incluindo tenantId e id (ou chave primaria)
- [ ] Indice documentado ou padrao aplicado de forma consistente

---

### US-DB-03: Schema Identidade — Tenant, User, RoleAssignment, ConsentimentoLGPD

**Agente(s) recomendado(s)**: `subagents/database.agent.md`; `subagents/domain.agent.md` (validar entidades/aggregates)

**Como** desenvolvedor, **quero** que as entidades Tenant, User, RoleAssignment e ConsentimentoLGPD (e demais do contexto Identidade) existam no schema com relacoes e constraints conforme domain/entities e aggregates, **para** suportar F01 (Autenticacao e Acesso).

**Entradas (docs)**:
- docs/domain/entities.md (contexto Identidade e Acesso)
- docs/domain/aggregates.md (Tenant como raiz)
- docs/domain/value-objects.md (Email, Papel, etc.)
- docs/adr/0008-persistence-and-database.md

**Saidas (artefatos)**:
- prisma/schema.prisma: modelos Tenant, User, RoleAssignment, ConsentimentoLGPD (ou equivalente)
- Relacoes: User pertence a Tenant; RoleAssignment associa User a Role no Tenant; ConsentimentoLGPD vinculado a tenant/user
- Campos minimos: Tenant (id, tipo, razaoSocial/CNPJ ou nome para autonomo, etc.), User (id, tenantId, email, nome, etc.), RoleAssignment (tenantId, userId, role)

**Criterios de aceite**:
- [ ] Modelo Tenant existe com id e atributos conforme domain
- [ ] Modelo User existe com tenantId e relacao com Tenant
- [ ] Modelo RoleAssignment (ou equivalente) existe com tenantId, userId, role
- [ ] ConsentimentoLGPD ou equivalente existe para registro de consentimento (quem, quando, finalidade, versao termo)
- [ ] Relacoes e constraints refletem aggregates (todo usuario pertence a um tenant; em clinica, usuarios com papel)

=================================================================

## P1 — Schema Clínico, Agendamento e Financeiro

---

### US-DB-04: Schema Clínico — Patient, ProfessionalPatientLink, Attendance, Evolution

**Agente(s) recomendado(s)**: `subagents/database.agent.md`; `subagents/domain.agent.md` (validar)

**Como** desenvolvedor, **quero** que Patient, ProfessionalPatientLink, Attendance e Evolution existam no schema com tenantId e relacoes conforme domain, **para** suportar F02 (Pacientes) e F04 (Prontuario/Evolucao).

**Entradas (docs)**:
- docs/domain/entities.md (contexto Clínico)
- docs/domain/aggregates.md (Paciente, Atendimento)
- docs/domain/value-objects.md (TarifaDeAtendimento, etc.)
- docs/adr/0008-persistence-and-database.md

**Saidas (artefatos)**:
- prisma/schema.prisma: modelos Patient, ProfessionalPatientLink, Attendance, Evolution
- Patient com tenantId; ProfessionalPatientLink com tenantId, professionalId, patientId (e tarifa se aplicavel); Attendance com tenantId, appointmentId (ou referencia), patientId, professionalId; Evolution com atendimentoId (uma por atendimento)

**Criterios de aceite**:
- [ ] Modelo Patient existe com tenantId
- [ ] Modelo ProfessionalPatientLink existe com tenantId e relacoes a User e Patient
- [ ] Modelo Attendance existe com tenantId e referencia a agendamento (ou dados minimos), patientId, professionalId
- [ ] Modelo Evolution existe com referencia a Attendance (uma evolucao por atendimento)
- [ ] Indices (tenantId, id) e indices adicionais conforme ADR 0008 (ex.: tenantId, patientId para Attendance)

---

### US-DB-05: Schema Agendamento e Financeiro — Agenda, Appointment, Receivable, Receipt

**Agente(s) recomendado(s)**: `subagents/database.agent.md`; `subagents/domain.agent.md` (validar)

**Como** desenvolvedor, **quero** que Agenda, Appointment (scheduling), Receivable e Receipt (billing) existam no schema com tenantId e indices adicionais (ex.: tenantId + professionalId + startAt para agendamentos), **para** suportar F03 (Agendamento) e F05/F06 (Financeiro).

**Entradas (docs)**:
- docs/domain/entities.md (Agendamento, Financeiro)
- docs/domain/aggregates.md (Agenda, Conta a receber, Recibo)
- docs/adr/0008-persistence-and-database.md

**Saidas (artefatos)**:
- prisma/schema.prisma: modelos Agenda (ou Schedule), Appointment, Receivable, Receipt
- Appointment com tenantId, professionalId, patientId, startAt, endAt, status; indice (tenantId, professionalId, startAt) ou equivalente
- Receivable com tenantId, attendanceId, valor, status, dueDate; indice (tenantId, dueDate) ou equivalente
- Receipt com tenantId e relacao a atendimentos/contas a receber

**Criterios de aceite**:
- [ ] Modelos Agenda e Appointment existem com tenantId e relacoes conforme domain
- [ ] Indice em Appointment para listagens por profissional e data (ex.: tenantId, professionalId, startAt)
- [ ] Modelo Receivable existe com tenantId, vinculo a Attendance, valor, status, datas
- [ ] Modelo Receipt existe com tenantId e referencia a atendimentos e/ou contas a receber
- [ ] Indice em Receivable para aging/listagens (ex.: tenantId, dueDate)

=================================================================

## P2 — Migrations e soft delete

---

### US-DB-06: Migrations via prisma migrate

**Agente(s) recomendado(s)**: `subagents/database.agent.md`

**Como** sistema, **quero** que migrations sejam geradas apenas via `prisma migrate` com nomes descritivos e que migrations ja aplicadas nao sejam editadas, **para** rastreabilidade e rollback seguro (ADR 0008).

**Entradas (docs)**:
- docs/adr/0008-persistence-and-database.md

**Saidas (artefatos)**:
- Migrations em prisma/migrations/ geradas com `prisma migrate dev --name <nome_descritivo>`
- Documentacao ou README que orienta: nao editar migrations ja aplicadas; rollback via nova migration se necessario

**Criterios de aceite**:
- [ ] Todas as alteracoes de schema sao versionadas em prisma/migrations/
- [ ] Nomes de migration sao descritivos (ex.: add_tenant_id_to_tables, create_identity_tables)
- [ ] Nenhuma migration ja aplicada em ambiente e editada (apenas novas migrations)
- [ ] Comando usado para gerar e aplicar e `prisma migrate` (dev ou deploy)

---

### US-DB-07: Soft delete apenas onde documentado

**Agente(s) recomendado(s)**: `subagents/database.agent.md`

**Como** desenvolvedor, **quero** que soft delete seja aplicado apenas onde documentado (ex.: Patient, Appointment); demais entidades com hard delete por padrao (ADR 0008), **para** manter historico onde o negocio exige e evitar exclusao fisica desnecessaria.

**Entradas (docs)**:
- docs/adr/0008-persistence-and-database.md (Soft delete: Patient, Appointment como candidatos)
- docs/domain/entities.md

**Saidas (artefatos)**:
- prisma/schema.prisma: campo deletedAt (DateTime?) apenas nos modelos Patient e Appointment (ou conforme decisao documentada)
- Queries de listagem que filtram deletedAt: null onde soft delete existe
- Demais entidades sem deletedAt (hard delete)

**Criterios de aceite**:
- [ ] Apenas entidades documentadas (ex.: Patient, Appointment) possuem coluna deletedAt (ou equivalente)
- [ ] Listagens de Patient e Appointment excluem registros com deletedAt preenchido
- [ ] Demais tabelas nao possuem soft delete (hard delete por padrao)
- [ ] Documentacao ou comentario no schema indica quais entidades usam soft delete

=================================================================

## Rastreabilidade

| US | Entidade/Agregado / ADR |
|----|--------------------------|
| US-DB-01 | ADR 0008, ADR 0002, entities |
| US-DB-02 | ADR 0008 |
| US-DB-03 | entities (Identidade), aggregates (Tenant), ADR 0008 |
| US-DB-04 | entities (Clínico), aggregates (Paciente, Atendimento), ADR 0008 |
| US-DB-05 | entities (Agendamento, Financeiro), aggregates (Agenda, Conta a receber, Recibo), ADR 0008 |
| US-DB-06 | ADR 0008 |
| US-DB-07 | ADR 0008, entities |
