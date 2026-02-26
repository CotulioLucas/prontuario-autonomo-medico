# Especificacao Legal de Recibos

**Contexto**: Plataforma SaaS de gestao de consultorios e clinicas de saude (multi-tenant).
**Ultima atualizacao**: 2026-02-10
**Status**: Em elaboracao
**Documentos relacionados**: [ADR 0012 - Emissao e armazenamento de recibos](../adr/0012-receipt-issuance-and-storage.md), [Entidades](../domain/entities.md), [Agregados](../domain/aggregates.md), [Regras de dominio](../domain/domain-rules.md)

=================================================================

## 1. Finalidade do recibo

O recibo emitido pela plataforma tem como finalidade principal servir de **comprovante de pagamento por servicos de saude** prestados pelo profissional ao paciente. O documento e utilizado pelo paciente para solicitar **reembolso junto ao plano de saude** (operadora de saude suplementar).

### 1.1 Cenario de uso

1. O profissional (psicologo, fisioterapeuta, medico, massoterapeuta) realiza um atendimento.
2. O atendimento gera uma **Conta a receber** no sistema (evento `AtendimentoRegistrado` -> `ContaAReceberCriada`).
3. Apos o pagamento (baixa da conta a receber), o profissional emite o **Recibo** pelo sistema.
4. O paciente recebe o recibo em PDF e o submete ao plano de saude para reembolso.

### 1.2 Base legal

O recibo de prestacao de servicos de saude nao e nota fiscal e nao substitui a obrigacao tributaria de emissao de NFS-e (Nota Fiscal de Servicos Eletronica) quando exigida pelo municipio. O recibo serve como:

- **Comprovante de pagamento** entre profissional e paciente (Art. 320 do Codigo Civil - Lei 10.406/2002: quitacao regular de obrigacao).
- **Documento para reembolso** exigido pelas operadoras de planos de saude conforme regulamentacao da ANS (Agencia Nacional de Saude Suplementar), em especial a RN 259/2011 e suas atualizacoes, que tratam do reembolso em prestadores nao credenciados.
- **Comprovante de despesa medica** para deducao no Imposto de Renda Pessoa Fisica (IRPF), conforme Art. 73 do Decreto 9.580/2018 (Regulamento do Imposto de Renda) e Instrucao Normativa RFB 1.500/2014.

> **Importante**: A plataforma emite recibos, nao notas fiscais. O profissional continua responsavel por suas obrigacoes fiscais municipais (ISS/NFS-e) de forma independente.

=================================================================

## 2. Campos obrigatorios do recibo

Para que o recibo seja aceito por planos de saude e pela Receita Federal, ele deve conter os seguintes campos:

### 2.1 Dados do profissional (emitente)

| Campo | Descricao | Validacao | Origem no sistema |
|-------|-----------|-----------|-------------------|
| **Nome completo do profissional** | Nome civil completo, sem abreviacoes | Obrigatorio; minimo 2 palavras | Cadastro do Usuario (tenant) |
| **CPF do profissional** | Cadastro de Pessoa Fisica | Obrigatorio; validacao de digitos verificadores (algoritmo CPF) | Cadastro do Usuario |
| **Registro profissional** | Numero do conselho de classe com UF | Obrigatorio; formato conforme conselho | Cadastro do Usuario |
| **Endereco do profissional/clinica** | Endereco completo (logradouro, numero, complemento, bairro, cidade, UF, CEP) | Obrigatorio; CEP valido | Cadastro do Tenant |
| **Telefone de contato** | Telefone do profissional ou da clinica | Recomendado | Cadastro do Tenant |

#### 2.1.1 Registro profissional por categoria

| Profissional | Conselho | Formato do registro | Exemplo |
|-------------|----------|---------------------|---------|
| Psicologo | CRP (Conselho Regional de Psicologia) | CRP XX/NNNNN (XX = regiao, NNNNN = numero) | CRP 06/123456 |
| Fisioterapeuta | CREFITO (Conselho Regional de Fisioterapia e Terapia Ocupacional) | CREFITO-X/NNNNN-F (X = regiao) | CREFITO-3/12345-F |
| Medico | CRM (Conselho Regional de Medicina) | CRM/UF NNNNNN | CRM/SP 123456 |
| Massoterapeuta | Nao possui conselho obrigatorio | Informar formacao/certificacao quando aplicavel | Certificacao ABMT |

> **Nota sobre massoterapeutas**: Massoterapia nao e profissao regulamentada por conselho de classe no Brasil. Recibos de massoterapeutas podem nao ser aceitos para reembolso por planos de saude nem para deducao no IRPF, dependendo da operadora e da interpretacao da Receita Federal. O sistema deve alertar o profissional sobre essa limitacao.

### 2.2 Dados do paciente (tomador do servico)

| Campo | Descricao | Validacao | Origem no sistema |
|-------|-----------|-----------|-------------------|
| **Nome completo do paciente** | Nome civil completo | Obrigatorio; minimo 2 palavras | Cadastro do Paciente |
| **CPF do paciente** | CPF do paciente (ou responsavel legal, no caso de menores) | Obrigatorio; validacao de digitos verificadores | Cadastro do Paciente |

### 2.3 Dados do servico

| Campo | Descricao | Validacao | Origem no sistema |
|-------|-----------|-----------|-------------------|
| **Descricao do servico prestado** | Descricao clara do servico (ex.: "Sessao de psicoterapia", "Sessao de fisioterapia") | Obrigatorio; texto livre com sugestoes pre-definidas por categoria | Configuracao do Vinculo profissional-paciente ou input manual |
| **Data do atendimento** | Data em que o servico foi efetivamente prestado | Obrigatorio; formato DD/MM/AAAA; nao pode ser data futura | Entidade Atendimento (data/hora efetiva) |
| **Valor do servico (numerico)** | Valor em reais (R$) com duas casas decimais | Obrigatorio; maior que zero; formato R$ X.XXX,XX | Conta a receber (valor) |
| **Valor do servico (por extenso)** | Valor escrito por extenso em portugues | Obrigatorio; gerado automaticamente a partir do valor numerico | Gerado pelo sistema |

### 2.4 Dados do documento

| Campo | Descricao | Validacao | Origem no sistema |
|-------|-----------|-----------|-------------------|
| **Numero sequencial do recibo** | Identificador unico do recibo no tenant, por ano civil | Obrigatorio; formato `REC-AAAA-NNNNN` (ex.: REC-2026-00001) | Gerado pelo sistema (sequencia por tenant/ano) |
| **Data de emissao** | Data em que o recibo foi gerado | Obrigatorio; data atual no momento da emissao | Gerado pelo sistema |
| **Assinatura do profissional** | Assinatura digital do profissional | Obrigatorio (ver secao 2.5) | Imagem cadastrada ou assinatura digital |

### 2.5 Assinatura digital

No contexto do sistema, a assinatura do profissional pode ser implementada de duas formas:

1. **Imagem de assinatura digitalizada**: O profissional faz upload de uma imagem (PNG/JPG com fundo transparente) da sua assinatura manuscrita. Essa imagem e inserida no PDF do recibo. Essa abordagem e a mais comum em sistemas SaaS e aceita pela maioria dos planos de saude.

2. **Assinatura digital com certificado (ICP-Brasil)**: Assinatura digital qualificada conforme MP 2.200-2/2001. Tem validade juridica equivalente a assinatura de proprio punho. Implementacao opcional no MVP; considerar como evolucao futura.

> **Decisao para o MVP**: Utilizar imagem de assinatura digitalizada (opcao 1). A imagem e armazenada no cadastro do profissional (Usuario) e aplicada ao PDF na geracao. A plataforma deve exigir o upload da assinatura antes de permitir a emissao do primeiro recibo.

=================================================================

## 3. Referencias legais e boas praticas

### 3.1 Legislacao e normas aplicaveis

| Referencia | Descricao | Aplicacao ao recibo |
|-----------|-----------|---------------------|
| **Codigo Civil (Lei 10.406/2002), Art. 320** | Quitacao regular de obrigacao designara o valor e a especie da divida quitada, o nome do devedor, tempo e lugar do pagamento | Fundamenta a necessidade de todos os campos do recibo |
| **RN 259/2011 (ANS)** e atualizacoes | Regulamenta o reembolso de despesas assistenciais em planos de saude | Define que o beneficiario deve apresentar comprovante do pagamento ao prestador |
| **Decreto 9.580/2018, Art. 73** | Deducao de despesas medicas no IRPF | Recibo deve conter dados suficientes para comprovacao de despesa medica |
| **IN RFB 1.500/2014** | Regulamenta deducao de despesas medicas no IRPF | Exige identificacao do profissional (nome, CPF, registro) e do paciente |
| **LGPD (Lei 13.709/2018)** | Protecao de dados pessoais | CPF e dados pessoais no recibo sao dados pessoais; armazenamento e acesso conforme politica de privacidade |
| **MP 2.200-2/2001** | Infraestrutura de Chaves Publicas Brasileira (ICP-Brasil) | Base legal para assinatura digital qualificada (evolucao futura) |
| **CFP Resolucao 11/2018** | Regulamenta a prestacao de servicos psicologicos por meios tecnologicos | Aplicavel quando o atendimento e realizado por teleconsulta |
| **COFITO Resolucao 516/2020** | Teleconsulta, telemonitoramento e teleconsultoria em fisioterapia | Aplicavel quando o atendimento e realizado por teleconsulta |

### 3.2 Boas praticas

1. **Descricao do servico padronizada**: Utilizar terminologia reconhecida pelos conselhos de classe e pelas operadoras de planos de saude. Exemplos:
   - Psicologia: "Sessao de psicoterapia individual", "Avaliacao psicologica"
   - Fisioterapia: "Sessao de fisioterapia", "Avaliacao fisioterapeutica"
   - Medicina: "Consulta medica", "Consulta de retorno"

2. **Um recibo por atendimento (preferencialmente)**: Embora o modelo permita que um Recibo referencie multiplos atendimentos/contas a receber, a pratica recomendada para reembolso e emitir um recibo por atendimento, facilitando a analise pela operadora.

3. **Recibo emitido apos pagamento**: O recibo so deve ser emitido apos a confirmacao do pagamento (baixa da Conta a receber). Recibos emitidos antes do pagamento podem gerar inconsistencias.

4. **Numeracao sem lacunas**: A sequencia de numeracao por tenant/ano nao deve apresentar lacunas (gaps). Recibos cancelados ou anulados devem manter o numero e ter status de cancelado, com emissao de novo recibo com numero subsequente se necessario.

5. **Retencao e acesso**: Conforme LGPD e regras fiscais:
   - O paciente deve poder acessar seus recibos a qualquer momento (portal do paciente ou envio por e-mail).
   - O profissional deve manter os recibos por no minimo **5 anos** (prazo fiscal/tributario).
   - Dados financeiros retidos conforme DR-CO-4 (5 anos para dados fiscais).

6. **Valor por extenso sem ambiguidade**: O sistema deve gerar o valor por extenso automaticamente, utilizando biblioteca confiavel para conversao de numeros para texto em portugues brasileiro (ex.: `extenso.js` ou equivalente). Exemplo: R$ 250,00 -> "duzentos e cinquenta reais".

=================================================================

## 4. Formato e geracao do documento

### 4.1 Formato do arquivo

- **Formato de saida**: PDF (conforme ADR 0012).
- **Motivo**: Planos de saude e a Receita Federal esperam documentos em PDF. HTML nao e aceito como comprovante oficial pela maioria das operadoras.
- **Tamanho da pagina**: A4 (210mm x 297mm), orientacao retrato.
- **Resolucao**: Minimo 150 DPI para impressao legivel.

### 4.2 Estrutura visual do PDF

O PDF do recibo deve seguir a seguinte estrutura:

```
+--------------------------------------------------+
|  [Logo do tenant]     RECIBO DE PRESTACAO         |
|                       DE SERVICOS DE SAUDE        |
|                       No REC-2026-00001           |
+--------------------------------------------------+
|                                                    |
|  PROFISSIONAL:                                     |
|  Nome: [nome completo]                             |
|  CPF: [XXX.XXX.XXX-XX]                            |
|  Registro: [CRP/CRM/CREFITO XX/NNNNN]             |
|  Endereco: [endereco completo]                     |
|                                                    |
+--------------------------------------------------+
|                                                    |
|  PACIENTE:                                         |
|  Nome: [nome completo]                             |
|  CPF: [XXX.XXX.XXX-XX]                            |
|                                                    |
+--------------------------------------------------+
|                                                    |
|  SERVICO PRESTADO:                                 |
|  Descricao: [descricao do servico]                 |
|  Data do atendimento: [DD/MM/AAAA]                 |
|                                                    |
+--------------------------------------------------+
|                                                    |
|  VALOR:                                            |
|  R$ [X.XXX,XX] ([valor por extenso])               |
|                                                    |
+--------------------------------------------------+
|                                                    |
|  [Cidade], [DD] de [mes] de [AAAA]                 |
|                                                    |
|  [imagem da assinatura]                            |
|  ________________________________                  |
|  [Nome do profissional]                            |
|  [Registro profissional]                           |
|                                                    |
+--------------------------------------------------+
```

### 4.3 Personalizacao por tenant

- **Logo**: Inserido no cabecalho do recibo. Origem: Marca do tenant (Value Object `Marca do tenant`).
- **Cores**: A cor primaria do tenant pode ser aplicada em linhas divisorias e cabecalho, mantendo legibilidade e sobriedade.
- **Informacoes de contato**: Telefone, e-mail e site do profissional/clinica podem ser adicionados no rodape.

### 4.4 Geracao tecnica

Conforme ADR 0012, a geracao do PDF ocorre no backend:

- **Bibliotecas candidatas**: PDFKit (Node.js), react-pdf (server-side), Puppeteer/Playwright (HTML-to-PDF).
- **Processo**:
  1. Coletar dados do agregado Recibo e entidades relacionadas (Profissional/Usuario, Paciente, Atendimento, Conta a receber, Tenant).
  2. Renderizar template com os dados.
  3. Gerar PDF.
  4. Armazenar PDF em object storage (S3, Supabase Storage ou equivalente), organizado por `tenant/{tenantId}/recibos/{reciboId}.pdf`.
  5. Registrar URL/referencia do arquivo no agregado Recibo.
  6. Publicar evento `ReciboEmitido`.

### 4.5 Armazenamento e retencao

| Aspecto | Especificacao |
|---------|---------------|
| **Local de armazenamento** | Object storage (S3/Supabase Storage), isolado por tenant |
| **Organizacao** | `tenant/{tenantId}/recibos/{ano}/{reciboId}.pdf` |
| **Retencao minima** | 5 anos (prazo fiscal) |
| **Acesso** | Profissional (emitente) e paciente (titular dos dados) |
| **Imutabilidade** | PDF nao pode ser alterado apos geracao; correcoes geram novo recibo |
| **Backup** | Conforme politica de backup do object storage |
| **Exclusao/anonimizacao** | Conforme politica LGPD (DR-CO-4): dados financeiros retidos por 5 anos; apos prazo, exclusao ou anonimizacao |

=================================================================

## 5. Relacionamento com o modelo de dominio

### 5.1 Entidades e agregados envolvidos

```
Agendamento (realizado)
    |
    v
Atendimento  ------>  Conta a receber  ------>  Recibo
    |                       |                      |
    |                       |                      +-- numero: REC-AAAA-NNNNN
    |                       |                      +-- dataEmissao
    |                       +-- valor               +-- dados do emitente (snapshot)
    |                       +-- statusPagamento     +-- dados do paciente (snapshot)
    +-- data/hora efetiva   +-- baixa               +-- descricao do servico
    +-- profissional                                +-- valor (numerico + extenso)
    +-- paciente                                    +-- dataAtendimento
                                                    +-- urlPdf
                                                    +-- status (emitido/cancelado)
```

### 5.2 Agregado Recibo (detalhamento)

| Atributo | Tipo | Descricao |
|----------|------|-----------|
| `id` | UUID | Identificador unico do recibo |
| `tenantId` | UUID | Tenant proprietario |
| `numero` | String | Numero sequencial formatado (REC-AAAA-NNNNN) |
| `dataEmissao` | Date | Data e hora da emissao |
| `emitente` | Value Object (snapshot) | Nome, CPF, registro profissional, endereco do profissional no momento da emissao |
| `paciente` | Value Object (snapshot) | Nome e CPF do paciente no momento da emissao |
| `descricaoServico` | String | Descricao do servico prestado |
| `dataAtendimento` | Date | Data do atendimento referenciado |
| `valor` | Valor monetario (VO) | Valor do servico |
| `valorExtenso` | String | Valor escrito por extenso |
| `atendimentoIds` | UUID[] | Referencias ao(s) atendimento(s) coberto(s) |
| `contaAReceberIds` | UUID[] | Referencias a(s) conta(s) a receber |
| `urlPdf` | String | URL do PDF armazenado |
| `assinaturaUrl` | String | URL da imagem de assinatura utilizada |
| `status` | Enum | `emitido`, `cancelado` |
| `reciboCanceladoRef` | UUID (nullable) | Referencia ao recibo cancelado que este substitui |
| `createdAt` | DateTime | Timestamp de criacao |

> **Snapshot de dados**: Os dados do emitente e do paciente sao copiados (snapshot) no momento da emissao, e nao referenciados por foreign key. Isso garante que o recibo permaneca correto mesmo que o cadastro do profissional ou paciente seja alterado posteriormente. Esta decisao reforca a regra DR-FI-3 (imutabilidade do recibo apos emissao).

### 5.3 Fluxo de emissao (orquestracao)

1. **Pre-condicoes**:
   - Conta a receber com status `pago` (baixa realizada).
   - Profissional com cadastro completo (nome, CPF, registro profissional, endereco).
   - Profissional com imagem de assinatura cadastrada.
   - Paciente com cadastro completo (nome, CPF).

2. **Comando**: `EmitirRecibo(contaAReceberId, tenantId)`

3. **Execucao**:
   - Validar pre-condicoes.
   - Gerar numero sequencial (proximo na sequencia do tenant/ano).
   - Criar snapshot dos dados do emitente e paciente.
   - Converter valor para extenso.
   - Criar instancia do agregado Recibo.
   - Gerar PDF a partir do template + dados.
   - Armazenar PDF no object storage.
   - Persistir agregado Recibo com `urlPdf`.
   - Publicar evento `ReciboEmitido`.

4. **Pos-condicoes**:
   - Recibo persistido com status `emitido`.
   - PDF disponivel para download pelo profissional e pelo paciente.
   - Evento `ReciboEmitido` publicado para consumidores (notificacao, auditoria).

### 5.4 Regras de dominio aplicaveis

| Regra | Descricao |
|-------|-----------|
| **DR-FI-3** | Recibo apos emitido tem dados imutaveis. Nenhum campo pode ser alterado; correcoes geram novo recibo. |
| **DR-CO-1** | Emissao de recibo deve ser auditavel (quem emitiu, quando, para qual paciente/atendimento). |
| **DR-CO-4** | Recibos retidos por no minimo 5 anos (dados financeiros). |
| **DR-IA-4** | Recibos acessiveis apenas dentro do tenant do profissional. Paciente acessa seus proprios recibos. |

### 5.5 Cancelamento de recibo

Recibos nao sao deletados. O cancelamento segue o fluxo:

1. Profissional solicita cancelamento informando motivo.
2. Status do recibo e alterado para `cancelado`.
3. Se necessario, um novo recibo e emitido com `reciboCanceladoRef` apontando para o recibo original.
4. O PDF original permanece armazenado (auditoria); um novo PDF e gerado para o recibo substituto.
5. Evento `ReciboCancelado` publicado.

### 5.6 Reemissao (segunda via)

A reemissao (segunda via) consiste em disponibilizar novamente o PDF original ja armazenado. Nao gera novo numero nem novo documento. O sistema simplesmente retorna a URL do PDF existente ou gera um link temporario de download.

=================================================================

## 6. Validacoes e alertas no sistema

### 6.1 Validacoes antes da emissao

| Validacao | Tipo | Mensagem de erro |
|-----------|------|------------------|
| CPF do profissional valido | Bloqueante | "CPF do profissional invalido. Atualize o cadastro." |
| CPF do paciente valido | Bloqueante | "CPF do paciente invalido. Atualize o cadastro." |
| Registro profissional preenchido | Bloqueante | "Registro profissional nao informado. Atualize o cadastro." |
| Endereco do profissional/clinica completo | Bloqueante | "Endereco incompleto. Preencha todos os campos do endereco." |
| Imagem de assinatura cadastrada | Bloqueante | "Assinatura nao cadastrada. Faca o upload da sua assinatura." |
| Conta a receber com baixa (pago) | Bloqueante | "Pagamento nao confirmado. Registre a baixa antes de emitir o recibo." |
| Valor maior que zero | Bloqueante | "Valor do servico deve ser maior que zero." |
| Data do atendimento nao futura | Bloqueante | "Data do atendimento nao pode ser futura." |

### 6.2 Alertas (nao bloqueantes)

| Alerta | Condicao | Mensagem |
|--------|----------|----------|
| Massoterapeuta sem conselho | Profissional do tipo massoterapeuta | "Recibos de massoterapia podem nao ser aceitos para reembolso por planos de saude." |
| Recibo retroativo | Data do atendimento com mais de 30 dias | "Atendimento realizado ha mais de 30 dias. Verifique o prazo de reembolso da operadora." |
| Recibo duplicado | Ja existe recibo emitido para a mesma conta a receber | "Ja existe um recibo emitido para este atendimento. Deseja emitir outro?" |

=================================================================

## 7. Consideracoes de privacidade (LGPD)

- O recibo contem dados pessoais (CPF, nome) do profissional e do paciente. O tratamento desses dados esta amparado na **base legal de execucao de contrato** (Art. 7, V da LGPD) e **cumprimento de obrigacao legal** (Art. 7, II - obrigacoes fiscais).
- O PDF armazenado deve seguir a politica de retencao definida em DR-CO-4.
- O paciente tem direito de acesso aos seus recibos (Art. 18 da LGPD).
- Na exclusao de tenant, os recibos sao retidos pelo prazo fiscal (5 anos) e, apos isso, excluidos ou anonimizados.
- O acesso ao PDF deve ser autenticado e autorizado (link temporario com expiracao, nao URL publica permanente).
