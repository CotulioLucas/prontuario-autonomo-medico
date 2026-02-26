# ADR 0006 — Segurança, auditoria e LGPD

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: Dados de saúde e cadastros sujeitos a LGPD; necessidade de auditoria e isolamento (R1, R4, R5 em docs/content/risks.md).

## Decisão

- **Auditoria**: Registrar acesso e **alterações** em dados sensíveis: prontuário (evolução), cadastro de paciente, dados financeiros e contas a receber. Registro deve incluir: quem (userId), quando (timestamp), qual recurso (id/tipo), tenantId. Leitura de dados sensíveis pode ser auditada conforme política. Armazenamento em tabela de auditoria ou log imutável.
- **LGPD**: Definir política de finalidade, base legal e consentimento por tipo de dado. Retenção definida por política (ex.: prontuário X anos após último contato). Mecanismos para acesso, correção e exclusão do titular (a implementar em casos de uso). Dados em trânsito: HTTPS. Dados em repouso: criptografia de campos sensíveis no BD conforme política (ex.: evolução, documentos).
- **Segurança**: Isolamento por tenant (ADR 0002); autenticação e autorização (ADR 0003). Secrets apenas em variáveis de ambiente. Revisão de acessos e permissões em código.

## Alternativas consideradas

- Auditoria apenas em produção: rejeitado; ambiente de dev pode ter auditoria desabilitada, mas modelo igual.
- Sem criptografia em repouso: aceito no MVP se política permitir; evolução para criptografia de campos sensíveis.

## Consequências

- Toda escrita em entidades sensíveis deve gerar evento de auditoria (ou middleware reutilizável).
- Documentação de política de privacidade e retenção; implementação de endpoints/fluxos para direitos do titular em roadmap.
