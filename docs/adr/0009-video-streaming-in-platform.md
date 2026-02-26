# ADR 0009 — Streaming de vídeo na plataforma

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: project-brief exige streaming dentro da plataforma (acesso pelo calendário); decidir entre solução própria ou terceiro.

## Decisão

- **Abordagem**: **Provedor de terceiros** (PaaS de vídeo) no MVP. WebRTC próprio rejeitado por complexidade e custo.
- **Provedor**: A definir na implementação (Jitsi, Daily.co, Whereby, Twilio Video ou similar). Critérios: custo por sessão, LGPD, integração (embed/SDK), gravação se necessário no futuro.
- **Integração**: Link ou sala gerada no agendamento; armazenar link ou roomId. Acesso via botão na agenda. Gravação fora do MVP salvo decisão de produto e compliance.

## Alternativas consideradas

- WebRTC próprio: rejeitado para MVP. Apenas link externo (Zoom/Meet): rejeitado; brief exige streaming na plataforma.

## Consequências

- Dependência de API e termos do provedor; adapter com interface única para facilitar troca. Custos por sessão monitorados. Documentar uso do provedor em política de privacidade e LGPD.
