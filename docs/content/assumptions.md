# Premissas

**Status**: Registrado — nível de evidência e plano de validação a refinar

=================================================================

| ID | Premissa | Nível de evidência | Plano de validação | Revisão | Impacto se invalidadas |
|----|----------|--------------------|--------------------|---------|-------------------------|
| A1 | Profissionais autônomos e clínicas pequenas aceitam uma única plataforma (multi-tenant) com dois modos (autônomo vs clínica) | Entrevistas / discover-project | Pesquisa ou piloto com 2–3 autônomos e 1 clínica | Antes do MVP | Alto — afeta modelo de tenant e papéis |
| A2 | Inclusão de massagistas no escopo é desejável; pode ser avaliada depois | A definir | Validar com stakeholders | Fase 2 | Baixo — não bloqueia MVP |
| A3 | Integração com calendários externos (Google, Apple, Outlook) é must-have no MVP | project-brief | Validar com usuários-piloto; fallback = agenda interna + export | Antes de travar integrações | Médio — escopo de integração |
| A4 | Avisos por WhatsApp são suficientes para lembretes/confirmações (sem obrigatoriedade de outros canais no MVP) | project-brief | Validar com usuários | MVP | Baixo |
| A5 | LGPD e boas práticas de saúde podem ser atendidas com isolamento por tenant, auditoria e política de retenção definidas em design | Regulatório | Revisão com jurídico ou DPO quando disponível | Antes de produção | Alto |
| A6 | Stack do workspace (Next.js, Fastify, Prisma, Zod, etc.) é adequada para o produto | stack-profile | ADR 0001 já alinha | Feito | Médio |
| A7 | Trial de 1-2 dias com dados fake é suficiente para o usuário avaliar a plataforma e converter em assinatura paga | Hipótese | Medir taxa de conversão trial→pago nos primeiros 50 trials; ajustar duração se conversão < 10% | 3 meses pós-lançamento | Médio — pode exigir trial mais longo ou modelo freemium |
| A8 | Web responsivo (não app nativo) atende a necessidade mobile dos profissionais no MVP | Hipótese de produto | Pesquisa com usuários-piloto; monitorar % de acessos mobile; avaliar PWA como evolução | Antes do MVP e 3 meses pós | Médio — pode exigir investimento em app nativo |
| A9 | Profissional fornece registro profissional válido (CRP/CRM/CREFITO); verificação declaratória é suficiente no MVP | Simplificação para MVP | Monitorar denúncias/fraudes; avaliar integração com APIs dos conselhos | 6 meses pós-lançamento | Alto — risco legal e reputacional se profissionais não habilitados usarem a plataforma |

=================================================================

## Governança

- Premissas de alto impacto (A1, A5) devem ser validadas antes de travar domínio e arquitetura.
- Revisar premissas após model-domain e design-architecture para refletir decisões tomadas.

=================================================================

**Próximo passo**: Stakeholders aprovarem premissas e datas de revisão.
