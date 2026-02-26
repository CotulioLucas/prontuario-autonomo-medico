# Restrições

**Fonte**: docs/context/project-brief.md  
**Status**: Documentado — prazo e orçamento a definir com stakeholders

=================================================================

## Restrições operacionais e legais

| Área | Restrição | Quantificação / observação |
|------|-----------|----------------------------|
| Compliance | LGPD aplicável a cadastros, ficha clínica, evolução, pagamentos | Dados sensíveis; consentimento, finalidade, retenção e auditoria devem ser definidos em design |
| Saúde | Boas práticas para dados de saúde e registro profissional | Prontuário e evolução; exigências de auditoria |
| Prazo | Template: _[data alvo MVP]_ | **Método de coleta**: reunião com stakeholders. **Sugestão**: definir após validação dos artefatos de negócio. |
| Orçamento | Template: _[orçamento mensal infra]_ / _[horas dev/mês]_ | **Método de coleta**: estimar com base na stack (Supabase free tier → pro, Vercel free → pro). **Sugestão**: levantar custos após design de arquitetura. |
| Infraestrutura | Stack alinhada ao workspace (Next.js, Fastify, Prisma, etc.) | Conforme .cursor/knowledge/stack-profile.md e ADRs |
| Integrações | Calendários (Google, Apple, Outlook, etc.) e WhatsApp (avisos) | Dependência de APIs externas e políticas de uso |

=================================================================

## Restrições de produto (MVP)

- Multi-tenant com isolamento de dados por tenant.
- Autônomo = um usuário por tenant; clínica = múltiplos usuários com papéis.
- Personalização por tenant: logos, cores (avaliar escopo no MVP).

=================================================================

## Estratégia mobile

- MVP: web responsivo (não app nativo). Interface otimizada para dispositivos móveis via design responsivo.
- Evolução futura: PWA (Progressive Web App) para experiência offline e instalação em dispositivo.
- App nativo: apenas se pesquisa com usuários indicar necessidade não atendida pelo web responsivo/PWA.

=================================================================

**Próximo passo**: Quantificar prazo e orçamento; formalizar requisitos de LGPD e saúde em design-architecture.
