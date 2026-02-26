# Riscos

**Status**: Registrado — donos atribuídos por papel no projeto

=================================================================

| ID | Descrição | Prob. | Impacto | Mitigação | Dono |
|----|-----------|-------|---------|-----------|------|
| R1 | Vazamento ou uso indevido de dados de saúde (LGPD) | Média | Alto | Isolamento por tenant, auditoria, política de retenção e acesso; design security-first | Líder técnico + DPO (quando designado) |
| R2 | Integrações (calendário, WhatsApp) instáveis ou limitadas por provedor | Média | Médio | Contratos claros, fallback (ex.: apenas agenda interna), monitoramento | Líder técnico |
| R3 | Escopo do MVP crescer e atrasar entrega | Alta | Médio | Travar escopo do MVP após analyze-business e model-domain; priorizar contas a receber + agenda + recibos | Product owner |
| R4 | Multi-tenant mal desenhado (vazamento entre tenants) | Média | Alto | ADR e design explícito de isolamento; testes de segurança | Líder técnico (arquitetura) |
| R5 | Validação de identidade e confirmação de e-mail insuficientes (fraude ou acesso indevido) | Média | Alto | Definir fluxo de validação em domínio e auth; seguir nextauth-patterns e ADRs | Líder técnico (segurança) |
| R6 | WhatsApp Business API — compliance com políticas do Meta para mensagens de saúde, custo por mensagem, necessidade de opt-in explícito do paciente | Média | Médio | Avaliar provedores (Twilio, Z-API); obter opt-in; fallback para e-mail/SMS; monitorar custos | Líder técnico + product owner |
| R7 | Verificação de registro profissional (CRP/CREFITO/CRM) — não existe API pública unificada para validar registros; risco de profissional não habilitado usar a plataforma | Média | Alto | MVP: declaratório com aceite de termos; futuro: integração com APIs dos conselhos quando disponíveis; canal de denúncia | Product owner + assessoria jurídica |
| R8 | Conflito de sincronização com calendário externo — edição simultânea no calendário externo e na plataforma pode gerar inconsistência | Média | Médio | Definir plataforma como fonte primária; sync periódico com resolução de conflito (último ganha ou notificação); log de conflitos | Líder técnico |
| R9 | Concorrência de edição — dois usuários editando o mesmo recurso (agenda, paciente) simultaneamente | Baixa | Médio | Optimistic locking (versão/timestamp); notificação de conflito ao segundo editor; retry automático | Líder técnico |
| R10 | Vendor lock-in (Supabase/Vercel) — dependência de serviços proprietários dificulta migração futura | Baixa | Médio | Abstrair camada de infraestrutura; usar Prisma como ORM (portabilidade de banco); documentar pontos de acoplamento; avaliar alternativas periodicamente | Líder técnico (arquitetura) |
| R11 | Acessibilidade (WCAG) — não conformidade com padrões de acessibilidade pode excluir usuários e gerar risco legal | Média | Médio | Adotar WCAG 2.1 AA como meta no design system; testes de acessibilidade no CI; revisão periódica com ferramentas automatizadas (axe, Lighthouse) | Líder técnico (frontend) |

=================================================================

**Próximo passo**: Revisar probabilidade/impacto com stakeholders e atualizar donos conforme estrutura definitiva da equipe.
