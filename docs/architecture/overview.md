# Visão geral da arquitetura

**Fonte**: docs/domain/*, docs/content/*, ADR 0001  
**Status**: Proposta — pendente validação

=================================================================

## 1. Objetivo do sistema

Plataforma multi-tenant para profissionais autônomos e clínicas: agenda, pacientes, prontuário (evoluções), financeiro (contas a receber, recibos), integrações (calendário, WhatsApp). Isolamento rigoroso por tenant; LGPD e auditoria para dados de saúde.

## 2. Estilo arquitetural escolhido

**Modular monolith** com camadas (Clean/Hexagonal), event-driven entre bounded contexts quando necessário. Justificativa: ADR 0002 (estilo) e ADR 0004 (comunicação).

- **Núcleo**: domínio (agregados, regras, eventos) independente de framework.
- **Aplicação**: casos de uso, orquestração, publicação/consumo de eventos.
- **Adaptadores**: HTTP (Next.js/Fastify), persistência (Prisma), integrações (calendário, WhatsApp), filas/workers para eventos assíncronos.
- **Contextos limitados** mapeados para módulos/pastas; comunicação entre contextos via eventos de domínio (ex.: AgendamentoRealizado → Atendimento + Conta a receber).

## 3. Fronteiras e dependências

| Bounded context      | Responsabilidade resumida        | Depende de              |
|---------------------|-----------------------------------|--------------------------|
| Identidade e Acesso | Tenant, usuário, papéis, auth     | —                        |
| Agendamento         | Agenda, agendamentos, calendário  | Identidade, Clínico (vínculo) |
| Clínico             | Paciente, vínculo, atendimento, evolução | Identidade, Agendamento (realizado) |
| Financeiro          | Contas a receber, baixa, recibos  | Clínico, Identidade      |
| Notificações        | Avisos (WhatsApp, e-mail)         | Eventos de Agendamento (e outros) |

Regra: dependências apontam para dentro (domínio no centro); infraestrutura e integrações nas bordas.

## 4. Segurança (baseline)

- **Autenticação**: NextAuth (ou equivalente) com confirmação de e-mail e fluxo de validação de identidade (ADR 0003).
- **Autorização**: tenantId + papéis em toda requisição; dados filtrados por tenant (row-level); sem acesso cross-tenant.
- **Auditoria**: registro de acesso e alterações em dados sensíveis (prontuário, evolução, cadastro paciente, financeiro) — quem, quando, o quê (ADR 0006).
- **Secrets**: variáveis de ambiente; nenhum segredo em repositório.
- **LGPD**: finalidade, consentimento e retenção definidos por política; dados sensíveis em trânsito e em repouso protegidos (HTTPS, criptografia em BD conforme ADR 0006).

## 5. Escalabilidade e implantação

- **MVP**: single deployment (monolito); escala vertical; estado em banco relacional (Prisma).
- **Futuro**: escala horizontal via réplicas stateless; workers para eventos assíncronos; particionamento por tenant se necessário (ver deployment-view.md).

## 6. Documentos relacionados

| Documento | Conteúdo |
|-----------|----------|
| [style.md](style.md) | Estilo (modular monolith, camadas), trade-offs |
| [components.md](components.md) | Componentes e mapeamento contextos → módulos |
| [deployment-view.md](deployment-view.md) | Nós de implantação, MVP vs evolução |
| [integration-patterns.md](integration-patterns.md) | Sincrono vs assíncrono, integrações externas |
| [quality-attributes.md](quality-attributes.md) | Segurança, disponibilidade, LGPD, desempenho |
| [failure-modes.md](failure-modes.md) | Falhas esperadas e mitigação |
| docs/adr/ | ADRs 0002–0006 (multi-tenant, auth, comunicação, integrações, segurança) |

=================================================================

**Próximo passo**: Validar com stakeholders e aprovar ADRs antes de implement-usecases.
