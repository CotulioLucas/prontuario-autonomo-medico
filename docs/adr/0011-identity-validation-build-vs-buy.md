# ADR 0011 — Validação de identidade (build vs buy)

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: project-brief e ADR 0003 exigem “validação de identidade”; é necessário decidir se a solução é construída internamente ou via provedor externo e como isso se integra ao fluxo de cadastro.

## Decisão

- **Abordagem**: **Buy** (provedor externo) para o MVP. Validação de identidade via documento (CPF, RG ou equivalente) e eventual comparação com selfie ou dados biométricos envolve requisitos de compliance, detecção de fraude e custo de desenvolvimento; um provedor especializado reduz risco e tempo.
- **Provedor**: A definir na implementação. Critérios: suporte a documento brasileiro (CPF), integração por API, conformidade com LGPD (processamento e armazenamento de dados), custo por verificação, SLA. Candidatos típicos: Unico (IDWall), ClearSale, idwall, ou soluções de KYC/identity verification disponíveis no mercado.
- **Fluxo**: Após cadastro e confirmação de e-mail, o usuário pode ser direcionado ao fluxo de validação de identidade (captura de documento e eventual selfie via SDK ou redirect do provedor). Resultado (aprovado/rejeitado/pendente) armazenado no perfil do usuário; políticas de acesso (ex.: restringir funções sensíveis até “validado”) definidas em produto e aplicadas na autorização (ADR 0003).
- **Fallback**: Se o provedor estiver indisponível, o sistema pode operar em modo “validação pendente” (usuário com acesso limitado ou em fila para nova tentativa); não bloquear cadastro.

## Alternativas consideradas

- **Build**: rejeitado para MVP (validação de documento, anti-fraude e compliance exigem expertise e manutenção).
- **Validação manual (admin confirma documento)**: aceitável como fallback temporário ou para poucos usuários; não escala; considerar apenas em beta fechado.
- **Sem validação no MVP**: rejeitado; brief e ADR 0003 já a incluem como requisito.

## Consequências

- Contrato e custo com o provedor escolhido; monitorar uso (volume de verificações).
- Dados enviados ao provedor (documento, selfie) sujeitos a LGPD; informar o usuário e obter consentimento; minimizar dados armazenados na nossa base (apenas status e id da verificação, não cópia do documento).
- Adapter na camada de integração (porta IIdentityVerificationProvider); implementação concreta por provedor; facilita troca futura.
