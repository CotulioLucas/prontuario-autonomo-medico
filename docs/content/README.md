# Conteúdo de negócio (analyze-business)

Saídas do comando **analyze-business**, alinhadas à skill **product/business-analysis**.

## Artefatos

| Artefato | Descrição |
|----------|-----------|
| [business-problem.md](business-problem.md) | Estado atual, desejado, impacto, custo da inação, causas raiz |
| [strategic-objectives.md](strategic-objectives.md) | Objetivos mensuráveis com métrica, baseline, horizonte |
| [stakeholders.md](stakeholders.md) | Mapeamento por autoridade, interesse, influência, dependência |
| [constraints.md](constraints.md) | Compliance (LGPD), saúde, prazo, orçamento, integrações, estratégia mobile |
| [risks.md](risks.md) | Riscos R1-R11 com probabilidade, impacto, mitigação, dono |
| [kpis.md](kpis.md) | KPIs com fonte, frequência, dono, limiar de alerta |
| [assumptions.md](assumptions.md) | Premissas A1-A9 com evidência, validação, revisão, impacto |
| [data-retention-policy.md](data-retention-policy.md) | Política de retenção de dados: prazos, base legal (LGPD/CFM/CFP/CTN), exclusão e anonimização |
| [user-stories-mvp.md](user-stories-mvp.md) | User stories do MVP organizadas por bounded context e persona |
| [receipt-legal-spec.md](receipt-legal-spec.md) | Especificação legal do recibo para reembolso de plano de saúde |
| [onboarding-flows.md](onboarding-flows.md) | Fluxos de onboarding para profissional autônomo e clínica |

## Fonte

Conteúdo derivado de **docs/context/project-brief.md** (descoberta do projeto). Baselines com método de coleta definido (primeiros 5 usuários do trial). Prazo e orçamento com template para preenchimento com stakeholders.

## Checklist de validação (exit criteria)

Antes de considerar a análise concluída e liberar trabalho técnico adicional:

- [x] Problema de negócio aprovado por stakeholders — documentado em `business-problem.md`
- [x] Objetivos quantificados (baseline definido onde aplicável) — método de coleta definido para O1/O3/O4/O5 em `strategic-objectives.md` (coletar com primeiros 5 usuários do trial)
- [x] Stakeholders validados (autoridade/interesse) — paciente reclassificado como beneficiário indireto em `stakeholders.md`
- [x] Restrições documentadas (prazo e orçamento quando possível) — templates com método de coleta em `constraints.md`; estratégia mobile documentada
- [x] Riscos com donos atribuídos — R1-R11 com donos concretos em `risks.md`
- [x] KPIs operacionais (fontes e alertas definidos no design) — limiares de alerta definidos em `kpis.md`
- [x] Premissas governadas (revisão e datas) — A1-A9 com plano de validação e revisão em `assumptions.md`

## Pré-condições do comando

O comando define pré-condições "No src/ directory" e "No active ADRs". Neste projeto já existiam `src/` (template) e `docs/adr/0001-initial-stack.md`. A análise foi executada mesmo assim para formalizar o negócio; o bloqueio de trabalho técnico refere-se a **novo desenvolvimento de domínio/arquitetura** até validação dos artefatos acima.
