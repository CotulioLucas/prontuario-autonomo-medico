# Politica de Retencao de Dados

**Fonte**: LGPD (Lei 13.709/2018), CFM Resolucao 1.821/2007, CFP Resolucao 001/2009, CTN (Lei 5.172/1966)
**Status**: Documentado
**Ultima atualizacao**: 2026-02-10
**Referencia**: ADR 0006 (Seguranca, auditoria e LGPD), docs/content/constraints.md, docs/content/risks.md (R1)

=================================================================

## 1. Objetivo

Definir os prazos de retencao, bases legais e procedimentos de exclusao e anonimizacao para cada categoria de dado tratado pela plataforma, garantindo conformidade com a LGPD, legislacao fiscal e resolucoes dos conselhos profissionais de saude.

Esta politica aplica-se a todos os tenants (profissionais autonomos e clinicas) e a todos os dados armazenados pela plataforma.

=================================================================

## 2. Categorias de dados e prazos de retencao

### 2.1 Dados clinicos (prontuario, evolucoes, atendimentos)

- **Descricao**: Registros de evolucao clinica, atendimentos realizados, vinculos profissional-paciente e historico de sessoes. Inclui entidades: Evolucao, Atendimento, Vinculo profissional-paciente.
- **Prazo minimo de retencao**: **20 (vinte) anos** a partir da data do ultimo registro no prontuario.
- **Base legal**:
  - CFM Resolucao 1.821/2007 — prontuarios medicos devem ser preservados por no minimo 20 anos apos o ultimo registro.
  - CFP Resolucao 001/2009 — documentos decorrentes de prestacao de servicos psicologicos devem ser guardados por no minimo 5 anos (prontuarios pelo prazo mais restritivo aplicavel ao contexto multi-profissional).
  - LGPD Art. 7, II — cumprimento de obrigacao legal ou regulatoria pelo controlador.
  - LGPD Art. 7, VIII — tutela da saude, exclusivamente, em procedimento realizado por profissionais de saude.
  - LGPD Art. 11, II, f — dados sensiveis tratados para tutela da saude.
- **Observacao**: Para profissionais sujeitos a outras resolucoes (COFFITO, etc.), aplica-se o prazo mais restritivo. A plataforma adota 20 anos como padrao minimo universal para dados clinicos.

### 2.2 Dados financeiros (contas a receber, recibos)

- **Descricao**: Registros de contas a receber, recibos emitidos, historico de pagamentos e baixas. Inclui entidades: Conta a receber, Recibo.
- **Prazo minimo de retencao**: **5 (cinco) anos** a partir do exercicio financeiro seguinte ao fato gerador.
- **Base legal**:
  - CTN Art. 173 — o direito da Fazenda Publica de constituir credito tributario extingue-se apos 5 anos.
  - CTN Art. 174 — a acao para cobranca de credito tributario prescreve em 5 anos.
  - LGPD Art. 7, II — cumprimento de obrigacao legal (obrigacao fiscal/tributaria).
- **Observacao**: Recibos emitidos ao paciente para reembolso junto a plano de saude seguem o mesmo prazo. Dados vinculados a processos judiciais ou administrativos em andamento devem ser retidos ate a conclusao definitiva do processo.

### 2.3 Dados cadastrais de paciente

- **Descricao**: Dados pessoais e de identificacao do paciente (nome, CPF, data de nascimento, contato, endereco). Inclui a entidade Paciente.
- **Prazo minimo de retencao**: **Vinculado ao prontuario — 20 (vinte) anos** a partir do ultimo registro clinico associado ao paciente.
- **Base legal**:
  - LGPD Art. 7, II — cumprimento de obrigacao legal (identificacao do prontuario).
  - LGPD Art. 16, I — cumprimento de obrigacao legal ou regulatoria pelo controlador impede a eliminacao.
  - CFM Resolucao 1.821/2007 — prontuario deve manter a identificacao do paciente.
- **Observacao**: Dados cadastrais sao indissociaveis do prontuario durante o periodo de retencao obrigatoria. Apos o prazo, aplica-se o procedimento de anonimizacao (secao 4).

### 2.4 Dados de acesso e auditoria

- **Descricao**: Logs de acesso, registros de alteracoes em dados sensiveis, trilha de auditoria (quem, quando, qual recurso, tenantId). Conforme ADR 0006.
- **Prazo minimo de retencao**: **5 (cinco) anos** a partir da data do registro.
- **Base legal**:
  - LGPD Art. 7, II — cumprimento de obrigacao legal.
  - LGPD Art. 37 — o controlador e o operador devem manter registro das operacoes de tratamento.
  - Marco Civil da Internet (Lei 12.965/2014) Art. 15 — registros de acesso a aplicacao devem ser mantidos por 6 meses (prazo minimo; a plataforma adota 5 anos para alinhamento com obrigacoes fiscais e de auditoria).
- **Observacao**: Logs de auditoria sao imutaveis e nao podem ser alterados ou excluidos antes do termino do prazo.

### 2.5 Dados de tenant e usuario do sistema

- **Descricao**: Dados do tenant (organizacao), usuarios do sistema (profissionais, secretarias, administradores), atribuicoes de papel, dados de assinatura SaaS. Inclui entidades: Tenant, Usuario, Atribuicao de papel, Assinatura.
- **Prazo minimo de retencao**:
  - **Enquanto ativo**: dados mantidos durante toda a vigencia da assinatura.
  - **Apos cancelamento**: **5 (cinco) anos** apos a data de cancelamento da assinatura, para cumprimento de obrigacoes fiscais, tributarias e eventuais demandas judiciais.
  - **Dados clinicos do tenant**: seguem o prazo da secao 2.1 (20 anos), independentemente do cancelamento.
- **Base legal**:
  - LGPD Art. 7, II — cumprimento de obrigacao legal.
  - LGPD Art. 7, V — execucao de contrato.
  - CTN Art. 173/174 — obrigacoes tributarias.

### 2.6 Dados de consentimento LGPD

- **Descricao**: Registros de consentimento do titular (ConsentimentoLGPD): quem consentiu, quando, finalidade, versao do termo, status, data de revogacao.
- **Prazo minimo de retencao**: **Pelo prazo do dado ao qual o consentimento se refere** (ou seja, se o consentimento e relativo a dados clinicos, segue o prazo de 20 anos; se relativo a dados financeiros, 5 anos). Apos o termino do prazo do dado, o registro de consentimento deve ser retido por mais **5 (cinco) anos** como evidencia de conformidade.
- **Base legal**:
  - LGPD Art. 7, I — consentimento.
  - LGPD Art. 8, par. 2 — onus da prova de consentimento e do controlador.

=================================================================

## 3. Base legal consolidada (LGPD e resolucoes)

### 3.1 LGPD — Lei 13.709/2018

| Artigo | Dispositivo | Aplicacao na plataforma |
|--------|-------------|-------------------------|
| Art. 7, II | Tratamento para cumprimento de obrigacao legal ou regulatoria | Retencao de prontuario (CFM/CFP), retencao fiscal (CTN), auditoria |
| Art. 7, V | Execucao de contrato ou de procedimentos preliminares | Dados de tenant/usuario durante vigencia da assinatura |
| Art. 7, VIII | Tutela da saude, exclusivamente por profissionais de saude | Tratamento de dados clinicos e evolucoes |
| Art. 11, II, f | Dados sensiveis — tutela da saude | Prontuario, evolucao, atendimento (dados sensiveis de saude) |
| Art. 16, I | Dados nao podem ser eliminados quando necessarios para cumprimento de obrigacao legal | Impede exclusao de prontuario antes do prazo legal |
| Art. 37 | Registro das operacoes de tratamento | Logs de auditoria e trilha de acesso |

### 3.2 Resolucoes dos conselhos profissionais

| Resolucao | Orgao | Exigencia | Prazo |
|-----------|-------|-----------|-------|
| Resolucao 1.821/2007 | CFM (Conselho Federal de Medicina) | Guarda de prontuarios medicos | Minimo 20 anos apos ultimo registro |
| Resolucao 001/2009 | CFP (Conselho Federal de Psicologia) | Guarda de documentos psicologicos | Minimo 5 anos (prontuarios seguem prazo do CFM quando aplicavel) |
| Resolucoes aplicaveis | COFFITO e demais conselhos | Guarda de registros profissionais | Conforme resolucao especifica; plataforma adota 20 anos como padrao |

### 3.3 Legislacao fiscal

| Dispositivo | Exigencia | Prazo |
|-------------|-----------|-------|
| CTN Art. 173 | Decadencia do direito de constituir credito tributario | 5 anos |
| CTN Art. 174 | Prescricao da acao de cobranca | 5 anos |

=================================================================

## 4. Procedimentos de exclusao e anonimizacao

### 4.1 Exclusao de tenant (cancelamento de assinatura)

Quando um tenant cancela sua assinatura, o seguinte procedimento deve ser executado:

1. **Dados clinicos (prontuario, evolucoes, atendimentos)**:
   - **Nao sao deletados**. Sao **anonimizados** — os dados de identificacao do tenant e do profissional sao desvinculados, mas o conteudo clinico e preservado em formato que nao permite identificacao direta do controlador original.
   - Os dados cadastrais do paciente vinculados ao prontuario sao mantidos de forma anonimizada (removem-se os vinculos com o tenant, mantendo-se a integridade do prontuario).
   - O prazo de 20 anos continua a contar a partir do ultimo registro clinico.
   - Apos o termino do prazo de 20 anos, os dados sao excluidos definitivamente ou anonimizados de forma irreversivel.

2. **Dados financeiros (contas a receber, recibos)**:
   - **Retidos ate o fim do prazo legal** de 5 anos a partir do exercicio financeiro seguinte ao fato gerador.
   - Apos o prazo, os dados sao excluidos definitivamente.

3. **Dados de acesso e auditoria**:
   - **Retidos ate o fim do prazo legal** de 5 anos a partir da data do registro.
   - Apos o prazo, os dados sao excluidos definitivamente.

4. **Dados de tenant e usuario**:
   - Marcados como inativos/cancelados. Retidos por 5 anos apos o cancelamento.
   - Apos o prazo, excluidos definitivamente (exceto se houver dados clinicos ainda dentro do prazo de retencao, caso em que dados minimos de identificacao do tenant sao preservados).

5. **Dados de consentimento**:
   - Retidos conforme secao 2.6 (prazo do dado referenciado + 5 anos de evidencia).

### 4.2 Solicitacao de exclusao pelo titular (paciente)

Quando um paciente (titular dos dados) solicita a exclusao de seus dados pessoais conforme LGPD Art. 18, VI:

1. **Verificacao de obrigacao legal**: a plataforma verifica se existe obrigacao legal que impeca a exclusao (Art. 16, I). Para dados clinicos, o prontuario deve ser retido por 20 anos; portanto, a exclusao completa nao e possivel durante este prazo.

2. **Dados sem obrigacao legal de retencao**: dados que nao estejam sujeitos a obrigacao legal de retencao sao excluidos no prazo de **15 (quinze) dias uteis** a partir da confirmacao da solicitacao.

3. **Dados com obrigacao legal de retencao**: o titular e informado sobre a impossibilidade de exclusao imediata, a base legal aplicavel e o prazo remanescente de retencao. A plataforma deve:
   - Cessar qualquer tratamento que nao seja o armazenamento para cumprimento da obrigacao legal.
   - Registrar a solicitacao de exclusao e a justificativa de manutencao.
   - Agendar a exclusao automatica para o termino do prazo legal.

4. **Resposta ao titular**: a plataforma deve responder a solicitacao no prazo de **15 (quinze) dias uteis**, conforme LGPD Art. 18, par. 5, informando as medidas adotadas.

### 4.3 Anonimizacao

O procedimento de anonimizacao deve garantir que:

- Os dados nao possam ser revertidos a forma identificavel por meios razoaveis (LGPD Art. 12).
- Campos de identificacao direta (nome, CPF, endereco, contato) sao removidos ou substituidos por valores irreversiveis (hash unidirecional ou exclusao).
- Vinculos entre entidades que permitam identificacao indireta sao desfeitos.
- Registros anonimizados podem ser mantidos para fins estatisticos sem limitacao de prazo (LGPD Art. 12, par. 1).

=================================================================

## 5. Tabela resumo

| Categoria | Prazo de retencao | Base legal | Procedimento apos prazo |
|-----------|-------------------|------------|--------------------------|
| Dados clinicos (prontuario, evolucoes, atendimentos) | 20 anos apos ultimo registro | CFM 1.821/2007; CFP 001/2009; LGPD Art. 7 II, VIII; Art. 11 II f | Exclusao definitiva ou anonimizacao irreversivel |
| Dados financeiros (contas a receber, recibos) | 5 anos apos exercicio seguinte ao fato gerador | CTN Art. 173/174; LGPD Art. 7 II | Exclusao definitiva |
| Dados cadastrais de paciente | Vinculado ao prontuario (20 anos) | CFM 1.821/2007; LGPD Art. 7 II; Art. 16 I | Anonimizacao ou exclusao definitiva |
| Dados de acesso e auditoria | 5 anos apos data do registro | LGPD Art. 7 II, Art. 37; Marco Civil Art. 15 | Exclusao definitiva |
| Dados de tenant/usuario (ativos) | Enquanto assinatura ativa | LGPD Art. 7 V | N/A |
| Dados de tenant/usuario (cancelados) | 5 anos apos cancelamento | CTN Art. 173/174; LGPD Art. 7 II | Exclusao definitiva |
| Consentimento LGPD | Prazo do dado referenciado + 5 anos | LGPD Art. 7 I; Art. 8 par. 2 | Exclusao definitiva |

=================================================================

## 6. Governanca

### 6.1 Responsavel

- **Controlador dos dados**: o tenant (profissional autonomo ou clinica) e o controlador dos dados de seus pacientes no contexto da relacao clinica.
- **Operador dos dados**: a plataforma atua como operador, processando dados em nome do controlador (tenant).
- **Encarregado (DPO)**: a plataforma deve designar um encarregado de protecao de dados conforme LGPD Art. 41. O encarregado e responsavel por:
  - Receber e encaminhar solicitacoes de titulares.
  - Orientar funcionarios e contratados sobre praticas de protecao de dados.
  - Interagir com a ANPD (Autoridade Nacional de Protecao de Dados).

### 6.2 Revisao periodica

- Esta politica deve ser revisada **anualmente** ou sempre que houver:
  - Alteracao legislativa relevante (LGPD, resolucoes de conselhos, legislacao fiscal).
  - Mudanca significativa no modelo de dados ou escopo da plataforma.
  - Incidente de seguranca que exponha dados pessoais.
  - Solicitacao da ANPD ou de conselho profissional.
- A revisao deve ser documentada com data, responsavel e alteracoes realizadas.

### 6.3 Conformidade e auditoria

- A plataforma deve manter registros de todas as operacoes de tratamento (LGPD Art. 37), conforme ADR 0006.
- Processos automatizados de exclusao e anonimizacao devem ser testados periodicamente para garantir eficacia.
- Relatorios de impacto a protecao de dados pessoais (RIPD) devem ser elaborados conforme exigencia da ANPD (LGPD Art. 38).
- Auditorias internas de conformidade com esta politica devem ser realizadas **semestralmente**.

### 6.4 Treinamento

- Todos os usuarios com acesso a dados pessoais devem receber orientacao sobre esta politica e sobre boas praticas de protecao de dados.
- Registros de treinamento devem ser mantidos como evidencia de conformidade.

=================================================================

## 7. Disposicoes finais

- Em caso de conflito entre prazos, prevalece o prazo mais restritivo (maior retencao) para garantir conformidade com todas as obrigacoes legais aplicaveis.
- Dados envolvidos em processos judiciais, administrativos ou investigacoes em andamento devem ser retidos independentemente dos prazos definidos nesta politica, ate a conclusao definitiva do processo.
- Esta politica complementa os ADRs e demais documentos de arquitetura e seguranca do projeto. Alteracoes nesta politica podem exigir atualizacao de ADRs relacionados (especialmente ADR 0006).

=================================================================

**Proximo passo**: Validar com DPO ou assessoria juridica antes da entrada em producao; implementar mecanismos de exclusao/anonimizacao automatizada conforme prazos definidos.
