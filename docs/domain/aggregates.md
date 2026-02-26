# Agregados

**Critério**: uma raiz por agregado; regras de consistência e invariantes protegidos dentro do agregado; transações não cruzam agregados.

=================================================================

## 1. Tenant (Identidade e Acesso)

| Item | Descrição |
|------|-----------|
| **Raiz** | Tenant |
| **Entidades internas** | Usuário, Atribuição de papel, ConsentimentoLGPD |
| **Invariantes** | Todo usuário pertence a um único tenant. Em tenant tipo clínica, usuários têm ao menos um papel. Em tenant autônomo, existe um único usuário e não há papéis de clínica. Consentimento LGPD obrigatório antes de tratamento de dados sensíveis. |
| **Consistência** | Criação/edição de usuários e papéis apenas via Tenant (ou raiz delegando à raiz). Consentimento registrado e verificado na raiz. |

## 2. Assinatura (Assinatura)

| Item | Descrição |
|------|-----------|
| **Raiz** | Assinatura |
| **Entidades internas** | (nenhuma; Plano e PeríodoTrial são VOs) |
| **Invariantes** | Uma assinatura ativa por tenant. Tenant sem assinatura ativa (e fora do trial) tem acesso bloqueado. Trial expira após 1-2 dias. |
| **Consistência** | Criação, ativação, suspensão e cancelamento de assinatura apenas na raiz. Transição de trial para plano pago na raiz. |

## 3. Paciente (Clínico)

| Item | Descrição |
|------|-----------|
| **Raiz** | Paciente |
| **Entidades internas** | Vínculo profissional–paciente (opcional: pode ser agregado separado se houver muitas regras) |
| **Invariantes** | Paciente pertence a um único tenant. Dados cadastrais mínimos obrigatórios conforme regras de domínio. Vínculo contém TarifaDeAtendimento. |
| **Consistência** | Cadastro e atualização de paciente e vínculos no mesmo tenant. Tarifa definida no vínculo e usada ao criar Conta a receber. |

## 4. Agenda (Agendamento)

| Item | Descrição |
|------|-----------|
| **Raiz** | Agenda |
| **Entidades internas** | Agendamento |
| **Invariantes** | Não pode haver dois agendamentos do mesmo profissional sobrepondo o mesmo slot. Agendamento referencia paciente e profissional do mesmo tenant. |
| **Consistência** | Criação, alteração e cancelamento de agendamentos via Agenda; checagem de conflito de horário na raiz. |

## 5. Atendimento (Clínico)

| Item | Descrição |
|------|-----------|
| **Raiz** | Atendimento |
| **Entidades internas** | Evolução (uma por atendimento) |
| **Invariantes** | Atendimento referencia um agendamento realizado (ou equivalente), um paciente e um profissional do tenant. No máximo uma evolução por atendimento. |
| **Consistência** | Criação de atendimento ao marcar agendamento como realizado; evolução criada/alterada apenas no agregado Atendimento. |

## 6. Conta a receber (Financeiro)

| Item | Descrição |
|------|-----------|
| **Raiz** | Conta a receber |
| **Entidades internas** | (nenhuma; baixa é evento ou VO de valor/data) |
| **Invariantes** | Vinculada a um atendimento (ou regra explícita se houver exceção). Valor e moeda imutáveis após criação. Status de pagamento segue regras de baixa. |
| **Consistência** | Baixa e alteração de status apenas na raiz. |

## 7. Recibo (Financeiro)

| Item | Descrição |
|------|-----------|
| **Raiz** | Recibo |
| **Entidades internas** | (nenhuma; dados do recibo são VOs) |
| **Invariantes** | Referencia atendimento(s) e/ou conta(s) a receber do mesmo tenant. Após emitido, dados do recibo são imutáveis. |
| **Consistência** | Emissão e eventual reemissão (se permitido) apenas na raiz. |

=================================================================

**Transações entre agregados**: Criar atendimento a partir de agendamento, criar conta a receber a partir de atendimento e criar recibo a partir de conta a receber/atendimento são operações entre agregados: usar eventos de domínio ou orquestração explícita (saga ou processo aplicação), sem transação distribuída única.
