# ADR 0008 — Persistência e banco de dados

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: ADR 0002 define tenant_id em todas as tabelas; é necessário definir SGBD, ORM, garantia de isolamento e convenções de schema/migrations.

## Decisão

- **SGBD**: PostgreSQL. Justificativa: suporte a JSON/JSONB para dados flexíveis, full-text search futuro, ampla adoção em PaaS e compatibilidade forte com Prisma.
- **ORM**: Prisma como camada única de acesso ao banco. Schema em `prisma/schema.prisma`; migrations versionadas; sem SQL bruto para operações de negócio (exceto otimizações pontuais documentadas).
- **tenant_id**: Todas as tabelas de dados de negócio possuem coluna `tenantId` (UUID ou texto). Middleware ou padrão de repositório garante que toda query de leitura e escrita inclui filtro por `tenantId` resolvido do contexto da requisição (sessão). Prisma: usar extensão/middleware ou wrapper de repositório que injeta `where: { tenantId }`; evitar queries sem tenantId.
- **Índices**: Índice composto `(tenantId, id)` em todas as tabelas com tenantId. Índices adicionais por contexto: ex. agendamentos `(tenantId, professionalId, startAt)`, contas a receber `(tenantId, dueDate)`, atendimentos `(tenantId, patientId)` conforme uso real.
- **Soft delete**: Adotar apenas onde o negócio exija histórico e listagens “excluídos não aparecem”. Candidatos: Patient (evitar perda de vínculo com atendimentos), Appointment (histórico de cancelados). Definir por entidade na implementação; padrão é hard delete salvo exceção documentada.
- **Migrations**: Sempre geradas via `prisma migrate`; nome descritivo; não editar migrations já aplicadas; rollback via nova migration se necessário.

## Alternativas consideradas

- **MySQL**: aceitável; PostgreSQL escolhido por JSON e ecossistema Prisma.
- **Sem ORM**: rejeitado; Prisma alinha ao stack (ADR 0001) e reduz boilerplate.
- **Tenant via RLS (Row Level Security)**: possível em PostgreSQL; no MVP filtro em aplicação é suficiente; evolução futura se necessário.

## Consequências

- Ambiente de desenvolvimento e CI com PostgreSQL (local ou container). Variável DATABASE_URL obrigatória.
- Code review deve verificar ausência de queries sem tenantId em dados de negócio.
- Testes de integração com BD real ou SQLite (Prisma suporta) para validar isolamento; preferência por PostgreSQL em CI para fidelidade.
