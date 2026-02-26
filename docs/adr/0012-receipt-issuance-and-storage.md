# ADR 0012 — Emissão e armazenamento de recibos

**Status**: Aceito  
**Data**: 2026-02-09  
**Contexto**: MVP exige emissão de recibos para reembolso ao plano de saúde; definir formato, armazenamento e numeração.

## Decisão

- **Formato**: PDF padrão. Conteúdo mínimo: emitente (tenant/profissional), paciente, serviço e valor, data do atendimento, data de emissão, número do recibo. Template alinhado a exigências comuns de planos.
- **Geração**: Backend gera PDF na emissão (PDFKit, react-pdf ou HTML to PDF). Dados do agregado Recibo e entidades relacionadas.
- **Armazenamento**: Guardar cópia do PDF em storage (objeto) por tenant e id do recibo. Reemissão, auditoria e direito de acesso; retenção conforme LGPD (ADR 0006). Provedor a definir (S3, blob).
- **Numeração**: Única por tenant por ano civil (ex.: REC-2026-00001). Sequência por tenant; reinício anual.
- **Imutabilidade**: Recibo emitido não é editado; correções geram novo documento com referência ao anterior se necessário.

## Alternativas consideradas

- Só gerar sob demanda sem armazenar: rejeitado (reemissão e auditoria). Numeração global: rejeitado. Só HTML: rejeitado (planos esperam PDF).

## Consequências

- Serviço de geração de PDF e adapter de storage. Política de retenção documentada e job de exclusão/anonimização. Paciente deve poder acessar seus recibos (LGPD).
