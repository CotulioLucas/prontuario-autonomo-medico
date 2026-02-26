# Project Brief — prontuario-autonomo-medico

**Última atualização**: 2026-02-09  
**Status**: Descoberta concluída

=================================================================

## 1. Objetivos e problema

- **Problema principal**: Sistema para ajudar profissionais autônomos (e depois clínicas) a fazer acompanhamento de pacientes, com foco em psicólogos, fisioterapeutas, massagistas (a avaliar necessidade) e massoterapeutas.

- **Usuários principais (papéis)**:
  - **Plataforma multi-tenant**: atende tanto profissionais autônomos quanto empresas/clínicas com N profissionais. Personalização por tenant (logos, cores da empresa).
  - **Clínicas**: papéis definidos — médico, psicólogo, secretária, admin. (Paciente não é usuário da plataforma.)
  - **Profissionais autônomos**: usuário único (sem múltiplos papéis de clínica).

- **MVP / primeira entrega**:
  - Sistema de login e cadastro de usuários com confirmação de e-mail e validação de identidade
  - Agendas e agendamentos
  - Cadastro de pacientes
  - Controle de usuário (e papéis quando multi-tenant/clínica)
  - Monetização: SaaS mensal + trial de 1-2 dias com dados fake
  - Controle financeiro: contas a receber (tarifa por atendimento configurada no vínculo profissional–paciente), aging
  - Dashboard financeiro completo
  - Página de contas a receber (data do atendimento, paciente, profissional, status do atendimento, status do pagamento) com baixa vinculada ao atendimento realizado
  - Streaming dentro da plataforma (acesso pelo calendário de agendas) ou redirecionamento para Google Calendar / outros calendários; opção de integrar e conectar com calendários externos
  - Emissão de recibos para o paciente (reembolso com plano de saúde)

=================================================================

## 2. Escopo e integrações

- **Integrações externas**:
  - Calendários: Google Calendar, Notebook, Apple, Hotmail (Hotmail/Outlook)
  - WhatsApp: avisos (lembretes, confirmações)
  - (Futuro) SSO ou outros conforme necessidade

- **Funcionalidades de escopo**:
  - Autenticação: login, cadastro, confirmação de e-mail e validação de identidade
  - Acompanhamento clínico por paciente e relação profissional–paciente
  - Prontuário de evolução dos atendimentos
  - Emissão de recibos para pacientes

- **Restrições**: A definir (prazo, orçamento); compliance e LGPD aplicáveis a dados de saúde e cadastros.

- **Métricas / indicadores**:
  - Produtividade (profissional/equipe)
  - Evolução do atendimento (clínica)
  - Registros do paciente (histórico, aderência)

=================================================================

## 3. Contexto técnico

- **Stack ou ferramentas**: Padrões definidos conforme ADRs, context e toda documentação técnica e de produto gerada no sistema. (Template atual: TypeScript, Node, src/ + docs/; alinhar ao stack do workspace quando houver stack-profile.)

- **Dados sensíveis**: Cadastros de pacientes, ficha clínica, evolução dos atendimentos, dados de pagamento. Exigências de LGPD e boas práticas para saúde aplicáveis.

- **Auditoria**: Necessária (acesso, alterações em dados sensíveis, conforme definição em design e ADRs).

=================================================================

## 4. Próximos comandos sugeridos

| Comando | Motivo |
|--------|--------|
| /analyze-business | Formalizar problema, stakeholders (autônomos vs clínicas), KPIs (produtividade, evolução, registros) e critérios de sucesso do MVP antes do desenho. |
| /model-domain | Definir entidades e regras: autenticação (login, cadastro, confirmação de e-mail, validação de identidade), tenant, usuário, papéis, paciente, agendamento, prontuário/evolução, financeiro (contas a receber, recibos), integrações (calendário, WhatsApp). |
| /design-architecture | Definir arquitetura multi-tenant, isolamento de dados, LGPD, auditoria, integrações (calendários, WhatsApp) e ADRs. |
| /harvest-knowledge | Alinhar padrões do stack (Next.js, Fastify, Prisma, etc.) com a base de conhecimento do workspace. |
| /implement-usecases | Implementar casos de uso do MVP (agenda, pacientes, usuários, financeiro, recibos, streaming/calendário) após domínio e arquitetura aprovados. |

=================================================================
