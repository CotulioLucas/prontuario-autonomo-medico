# ADR 0003 — Autenticação e autorização

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: MVP exige login, cadastro, confirmação de e-mail e validação de identidade; autorização por tenant e papéis (clínicas).

## Decisão

- **Autenticação**: NextAuth (ou stack alinhada ao workspace) para login e sessão. Cadastro com confirmação de e-mail obrigatória antes do uso pleno. Fluxo de validação de identidade (ex.: documento) definido em produto; suportado na arquitetura (estado do usuário: pendente/validado).
- **Autorização**: Em toda requisição autenticada, resolver **tenantId** e **userId** (e papéis, em tenants tipo clínica). Middleware ou camada de aplicação injeta tenant/user no contexto. Toda operação de dados valida que o recurso pertence ao tenant do usuário.
- **Papéis**: Em clínicas, papéis (médico, psicólogo, secretária, paciente, admin) definem permissões; em autônomo não há papéis de clínica. Políticas de acesso (quem pode agendar, evoluir, emitir recibo) baseadas em papel + tenant.

## Alternativas consideradas

- Auth próprio: rejeitado (NextAuth reduz risco e alinha ao stack).
- RBAC genérico desde o MVP: aceito para clínicas; autônomo tem um único papel implícito.

## Consequências

- Integração com nextauth-patterns em .cursor/knowledge/.
- Auditoria deve registrar tenantId e userId em ações sensíveis (ADR 0006).
- Validação de identidade pode depender de provedor externo (a definir em produto).
