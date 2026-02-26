# Regras de domínio (invariantes)

**Formato**: escopo, gatilho, mecanismo de garantia, consequência de falha.

=================================================================

## Identidade e Acesso

| ID | Regra | Escopo | Gatilho | Garantia | Falha |
|----|-------|--------|---------|----------|-------|
| DR-IA-1 | Usuário pertence a um único tenant | Tenant, Usuário | Criação/edição de usuário | Agregado Tenant: usuário sempre com tenantId da raiz | Rejeitar operação |
| DR-IA-2 | Tenant autônomo tem exatamente um usuário | Tenant | Criação de usuário em tenant autônomo | Verificar tipo do tenant e contagem de usuários | Rejeitar segundo usuário |
| DR-IA-3 | Papéis existem apenas em tenant tipo clínica | Atribuição de papel | Atribuição de papel | Verificar tipo do tenant antes de persistir | Rejeitar em autônomo |
| DR-IA-4 | Acesso a dados apenas dentro do tenant do usuário | Toda leitura/escrita | Qualquer operação | Filtro por tenantId na aplicação e no armazenamento | Não expor dados de outro tenant |

## Agendamento

| ID | Regra | Escopo | Gatilho | Garantia | Falha |
|----|-------|--------|---------|----------|-------|
| DR-AG-1 | Dois agendamentos do mesmo profissional não podem sobrepor o mesmo slot | Agenda, Agendamento | Criação ou alteração de agendamento | Agregado Agenda: checagem de sobreposição antes de persistir | Rejeitar agendamento |
| DR-AG-2 | Agendamento referencia paciente e profissional do mesmo tenant | Agendamento | Criação de agendamento | Validar tenantId do paciente e do profissional = tenant da agenda | Rejeitar |
| DR-AG-3 | Só é possível agendar para paciente com vínculo ao profissional (ou regra explícita do tenant) | Agendamento | Criação de agendamento | Verificar existência de vínculo profissional–paciente no tenant | Rejeitar ou avisar |

## Clínico

| ID | Regra | Escopo | Gatilho | Garantia | Falha |
|----|-------|--------|---------|----------|-------|
| DR-CL-1 | Atendimento só pode ser criado para agendamento em status realizável (ex.: confirmado) | Atendimento | Criação de atendimento | Verificar status do agendamento | Rejeitar |
| DR-CL-2 | Um atendimento tem no máximo uma evolução | Atendimento, Evolução | Criação/edição de evolução | Agregado Atendimento: cardinalidade 0..1 evolução por atendimento | Rejeitar segunda evolução |
| DR-CL-3 | Evolução só pode ser criada/alterada por profissional vinculado ao paciente (ou perfil autorizado) | Evolução | Escrita em evolução | Verificar vínculo ou papel no tenant | Rejeitar / auditoria |

## Financeiro

| ID | Regra | Escopo | Gatilho | Garantia | Falha |
|----|-------|--------|---------|----------|-------|
| DR-FI-1 | Conta a receber vinculada a um atendimento (ou política explícita) | Conta a receber | Criação de conta a receber | Referência obrigatória a atendimento (ou regra documentada) | Rejeitar |
| DR-FI-2 | Valor e moeda da conta a receber imutáveis após criação | Conta a receber | Alteração | Raiz não permite alterar valor/moeda após persistência | Rejeitar |
| DR-FI-3 | Recibo após emitido tem dados imutáveis | Recibo | Emissão / reemissão | Raiz Recibo: após emitido, apenas reemissão (cópia) se permitido | Rejeitar alteração de conteúdo |

## Compliance e auditoria

| ID | Regra | Escopo | Gatilho | Garantia | Falha |
|----|-------|--------|---------|----------|-------|
| DR-CO-1 | Acesso e alterações em dados sensíveis (prontuário, evolução, cadastro paciente) devem ser auditáveis | Sistema | Leitura/escrita em dados sensíveis | Registro de evento de auditoria (quem, quando, o quê) | Log obrigatório; falha de log = incidente |
| DR-CO-2 | Dados de saúde sujeitos a LGPD: finalidade, consentimento e retenção conforme política do tenant/plataforma | Entidades com dados sensíveis | Qualquer tratamento | Design e política documentados; aplicação na camada de aplicação e infra | Consequência legal/organizacional |
| DR-CO-3 | Consentimento LGPD obrigatório antes de tratamento de dados sensíveis de saúde. Tenant/usuário deve ter ConsentimentoLGPD ativo (não revogado) com versão vigente do termo | ConsentimentoLGPD, Paciente, Evolução | Cadastro de paciente, registro de evolução, qualquer operação com dados de saúde | Verificar existência de consentimento ativo na camada de aplicação antes de prosseguir | Bloquear operação; solicitar aceite do termo |
| DR-CO-4 | Dados de prontuário (evoluções, atendimentos) retidos por no mínimo 20 anos (CFP/CFM). Dados financeiros retidos por 5 anos (fiscal). Na exclusão de tenant, dados clínicos são anonimizados (não deletados) e dados financeiros retidos até fim do prazo legal | Evolução, Atendimento, Conta a receber, Recibo | Exclusão de tenant, solicitação de apagamento | Política de retenção aplicada na camada de infraestrutura; anonimização em vez de deleção para dados clínicos | Violação regulatória |

## Assinatura

| ID | Regra | Escopo | Gatilho | Garantia | Falha |
|----|-------|--------|---------|----------|-------|
| DR-AS-1 | Tenant sem assinatura ativa e fora do período trial tem acesso bloqueado (somente visualização de dados ou tela de contratação) | Assinatura, Tenant | Qualquer operação de negócio | Verificar status da assinatura do tenant antes de autorizar operação | Redirecionar para tela de contratação |
| DR-AS-2 | Ao criar tenant em modo trial, popular com dados de demonstração (seed). Após expiração do trial (1-2 dias), bloquear acesso e solicitar contratação de plano | Assinatura, Tenant | Criação de tenant, expiração de trial | Seed automático na criação; job/check de expiração | Bloquear acesso; notificar usuário |

## Financeiro (complemento)

| ID | Regra | Escopo | Gatilho | Garantia | Falha |
|----|-------|--------|---------|----------|-------|
| DR-FI-4 | Valor da Conta a receber é derivado da TarifaDeAtendimento configurada no vínculo profissional–paciente no momento do registro do atendimento | Conta a receber, Vínculo profissional–paciente | Criação de conta a receber (após AtendimentoRegistrado) | Buscar tarifa do vínculo e aplicar ao atendimento | Rejeitar se tarifa não definida; solicitar configuração |

=================================================================

**Uso**: Implementação deve garantir essas regras na camada de domínio ou na aplicação; invariantes de agregado na raiz.
