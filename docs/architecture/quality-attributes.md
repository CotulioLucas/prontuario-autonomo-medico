# Atributos de qualidade

**Fonte**: docs/content/constraints.md, docs/content/risks.md, docs/domain/domain-rules.md

=================================================================

## 1. Segurança

| Requisito | Abordagem |
|-----------|-----------|
| Isolamento por tenant | tenant_id em toda tabela e em toda query; sem dados cross-tenant (ADR 0002, 0006). |
| Autenticação | NextAuth (ou equivalente); confirmação de e-mail; validação de identidade conforme fluxo (ADR 0003). |
| Autorização | tenantId + papéis em cada operação; verificação no caso de uso e/ou middleware. |
| Auditoria | Registro de acesso e alterações em dados sensíveis (prontuário, evolução, paciente, financeiro): quem, quando, recurso (ADR 0006). |
| Secrets | Apenas em variáveis de ambiente; não em repositório. |
| Dados em trânsito/repouso | HTTPS obrigatório; criptografia de dados sensíveis em BD conforme política (ADR 0006). |

## 2. Compliance (LGPD e saúde)

| Requisito | Abordagem |
|-----------|-----------|
| Finalidade e consentimento | Política de tratamento por tipo de dado; consentimento para envio de avisos (WhatsApp/e-mail). |
| Retenção | Política de retenção documentada; exclusão/anonimização conforme ADR 0006. |
| Direitos do titular | Processos para acesso, correção, exclusão (a implementar em casos de uso). |
| Dados de saúde | Tratados como sensíveis; acesso restrito e auditado. |

## 3. Disponibilidade e resiliência

| Requisito | Abordagem |
|-----------|-----------|
| Falha de integração (calendário, WhatsApp) | Não bloquear fluxo principal; fallback (agenda interna); retry e circuit breaker (failure-modes.md). |
| Falha de BD | Reconexão; migrations versionadas; backup conforme política. |
| Degradação graciosa | Se WhatsApp indisponível, apenas notificações falham; agendamento e prontuário seguem funcionando. |

## 4. Desempenho

| Requisito | Abordagem |
|-----------|-----------|
| Resposta ao usuário | Operações síncronas leves; envio de notificação em background. |
| Queries | Filtro por tenant_id; índices em (tenant_id, id) e em chaves de busca frequente. |
| MVP | Sem cache distribuído; evolução com Redis se necessário. |

## 5. Manutenibilidade e evolução

| Requisito | Abordagem |
|-----------|-----------|
| Fronteiras claras | Bounded contexts como módulos; dependências para dentro. |
| Decisões rastreáveis | ADRs para estilo, multi-tenant, auth, comunicação, integrações, segurança. |
| Testes | Unitários no domínio; integração em adaptadores; testes de contrato em integrações críticas. |

=================================================================

**Métricas alvo** (a refinar): tempo de resposta p95 &lt; 2s para operações críticas; zero vazamento cross-tenant; 100% das alterações sensíveis auditadas.
