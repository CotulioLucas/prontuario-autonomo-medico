# Value Objects

**Critério**: imutáveis, sem identidade própria, substituíveis por igualdade de valor.

=================================================================

## Identidade e Acesso

| Value Object | Atributos | Observação |
|--------------|-----------|------------|
| **E-mail** | endereço (string normalizada) | Validação de formato; usado em login e confirmação. |
| **Documento de identidade** | tipo, número (ex.: CPF) | Usado na validação de identidade. |
| **Papel** | nome (enum: médico, psicólogo, secretária, admin) | Apenas em tenant tipo clínica. Paciente não é usuário do sistema. |
| **Identidade do tenant** | tenantId (UUID ou slug) | Referência imutável. |
| **Marca do tenant** | logo (URL ou binário), cor primária, cor secundária | Personalização por tenant. |

## Agendamento e tempo

| Value Object | Atributos | Observação |
|--------------|-----------|------------|
| **Intervalo de datas** | dataInício, dataFim | Imutável. |
| **Slot de horário** | data, horaInício, horaFim (ou duração) | Sem identidade; substituível. |
| **Status do agendamento** | valor (rascunho, confirmado, realizado, cancelado, falta) | Enum/imutável. |

## Clínico

| Value Object | Atributos | Observação |
|--------------|-----------|------------|
| **Texto de evolução** | conteúdo (texto), data/hora de registro | Imutável após criação. |
| **Status do atendimento** | valor (previsto, realizado, cancelado) | Consistente com agendamento. |
| **TarifaDeAtendimento** | valor (Valor monetário), tipo (enum: por sessão, por hora) | Definida no vínculo profissional–paciente. Usada para derivar valor da Conta a receber ao registrar atendimento. |

## Financeiro

| Value Object | Atributos | Observação |
|--------------|-----------|------------|
| **Valor monetário** | valor, moeda (ex.: BRL) | Imutável; cálculos geram novo valor. |
| **Status de pagamento** | valor (pendente, pago, parcial, cancelado) | Para conta a receber. |
| **Faixa de aging** | dias (ex.: 0–30, 31–60, 61–90) | Para relatórios. |
| **Dados do recibo** | número, série, data de emissão, valor, descrição, dados do emitente e do paciente | Imutável após emissão. |

## Assinatura

| Value Object | Atributos | Observação |
|--------------|-----------|------------|
| **Plano** | nome (string), limites (maxUsuários, maxPacientes), preço (Valor monetário), período (mensal) | Define capacidades do tenant conforme assinatura contratada. |
| **PeríodoTrial** | duração (1-2 dias), dataInício, dataFim | Período de avaliação com dados fake. Após expiração, exige contratação de plano. |

## Consentimento

| Value Object | Atributos | Observação |
|--------------|-----------|------------|
| **TermoDeConsentimento** | versão, conteúdo (texto ou referência), dataPublicação | Versão do termo aceito pelo responsável legal dos dados. |

## Notificações

| Value Object | Atributos | Observação |
|--------------|-----------|------------|
| **Destino de aviso** | canal (ex.: WhatsApp), identificador (ex.: telefone) | Imutável. |
| **Conteúdo do aviso** | tipo (lembrete, confirmação), texto, referência (ex.: agendamentoId) | Imutável. |

=================================================================

**Regra**: Nenhum value object expõe seters; operações retornam novos valores quando necessário.
