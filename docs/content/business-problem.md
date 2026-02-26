# Problema de negócio

**Fonte**: docs/context/project-brief.md (descoberta)  
**Status**: Formalizado — pendente validação com stakeholders

=================================================================

## 1. Estado atual

- Profissionais autônomos (psicólogos, fisioterapeutas, massoterapeutas, eventualmente massagistas) e pequenas clínicas gerenciam agenda, pacientes, prontuários e financeiro de forma fragmentada (planilhas, papel, múltiplos sistemas ou nenhum).
- Falta de padronização dificulta acompanhamento clínico, emissão de recibos para reembolso e visão financeira (contas a receber, aging).
- Integração com calendários externos e canais de comunicação (ex.: WhatsApp) é ad hoc ou inexistente.

## 2. Estado desejado

- Uma única plataforma que atenda **profissionais autônomos** (usuário único) e **clínicas** (multi-tenant com papéis: médico, psicólogo, secretária, paciente, admin), com personalização por tenant (logos, cores).
- Agenda e agendamentos centralizados, com opção de streaming na plataforma ou integração com calendários (Google, Apple, Outlook, etc.).
- Cadastro de pacientes, prontuário de evolução e relação profissional–paciente claros.
- Controle financeiro (entradas, saídas, aging), contas a receber vinculadas ao atendimento realizado e emissão de recibos para reembolso ao plano de saúde.
- Autenticação com confirmação de e-mail e validação de identidade; avisos via WhatsApp.

## 3. Impacto de negócio

- Redução de tempo gasto em tarefas administrativas e menor erro em cobrança e recibos.
- Melhoria na aderência e no histórico clínico (registros do paciente e evolução do atendimento).
- Produtividade e visibilidade financeira (dashboard, métricas) para o profissional e para a clínica.

## 4. Custo da inação

- Permanência de processos manuais, risco de inadimplência e falha em reembolsos por falta de recibos adequados.
- Dificuldade de escala para clínicas (múltiplos profissionais) sem sistema único.

## 5. Causas raiz (hipóteses)

- Ausência de solução única que una agenda, prontuário, financeiro e integrações para esse perfil (autônomo + clínica pequena).
- Soluções genéricas não contemplam multi-tenant com personalização e papéis específicos da área de saúde.

=================================================================

**Próximo passo**: Validar com stakeholders e ajustar antes de travar modelo de domínio e arquitetura.
