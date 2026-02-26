# KPIs

**Fonte**: docs/context/project-brief.md (métricas desejadas)  
**Status**: Definido — fontes de dados e alertas a implementar no produto

=================================================================

## KPIs de negócio / produto

| KPI | Descrição | Fonte de dados | Frequência | Dono | Limiar de alerta (exemplo) |
|-----|-----------|----------------|------------|------|----------------------------|
| **Produtividade (profissional/equipe)** | Atendimentos realizados por período (dia/semana), por profissional ou por tenant | Registro de atendimentos na plataforma | Diária / semanal | Product | Queda > 20% vs média dos últimos 30 dias do profissional |
| **Evolução do atendimento** | Existência e completude de registro de evolução quando obrigatório | Prontuário / evolução por atendimento | Por atendimento | Clínica / Profissional | Evolução ausente quando obrigatória |
| **Registros do paciente** | Histórico e aderência (ex.: comparecimento, cancelamentos) | Agendamentos e status de atendimento | Contínuo | Product | Taxa de faltas > 30% ou cancelamentos > 25% nos últimos 30 dias |
| **Contas a receber (aging)** | Valor e idade das contas a receber por status | Financeiro: contas a receber, baixa por atendimento | Diária | Profissional / Clínica | Aging > N dias sem baixa |
| **Emissão de recibos** | % de atendimentos com recibo emitido quando solicitado | Funcionalidade de recibos | Por demanda | Profissional | N/A (operacional) |

=================================================================

## Observação

- Dados sensíveis (prontuário, evolução) devem ser tratados conforme LGPD; KPIs agregados ou anonimizados quando necessário.
- Implementação dos dashboards e alertas será feita no MVP conforme prioridade (ex.: dashboard financeiro e contas a receber primeiro).

=================================================================

**Próximo passo**: Validar com stakeholders e incluir thresholds de alerta no design.
