# Stakeholders

**Fonte**: docs/context/project-brief.md  
**Status**: Mapeado — pendente validação de autoridade/interesse

=================================================================

## Classificação

| Stakeholder | Autoridade | Interesse | Influência | Dependência | Observação |
|-------------|------------|-----------|------------|-------------|------------|
| **Profissional autônomo** (psicólogo, fisioterapeuta, massoterapeuta) | Alto (decisor do próprio uso) | Alto | Alto | Plataforma para agenda, pacientes, financeiro, recibos | Usuário único; sem papéis de clínica |
| **Clínica (gestor/admin)** | Alto | Alto | Alto | Plataforma multi-tenant, papéis, personalização | Define papéis (médico, psicólogo, secretária, admin) |
| **Profissional em clínica** (médico, psicólogo) | Médio | Alto | Médio | Agenda, prontuário, atendimentos, recibos | Usuário dentro do tenant |
| **Secretária** | Baixo | Alto | Médio | Agenda, cadastro de pacientes, contatos | Operação do dia a dia |
| **Paciente** | Baixo | Alto (benefício indireto) | Baixo | Agendamento, recibo para reembolso, avisos | Beneficiário indireto — não é usuário da plataforma (não faz login). Recebe atendimentos, recibos e avisos via profissional/sistema. |
| **Regulador / Compliance** (LGPD, saúde) | Alto (imposição) | Médio | Alto | Dados sensíveis, auditoria, retenção | Restrição e obrigações legais |

=================================================================

## Conflitos e alinhamento

- **Autônomo vs clínica**: mesmo produto, modelos diferentes (usuário único vs multi-tenant com papéis); alinhar linguagem e onboarding.
- **Produtividade vs privacidade**: métricas de produtividade e evolução devem respeitar LGPD e confidencialidade do prontuário; documentar em constraints e ADRs.

=================================================================

**Próximo passo**: Validar com patrocinador e principais usuários (autônomos e uma clínica-piloto).
