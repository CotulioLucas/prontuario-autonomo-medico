# Telas — P2 (Complementar) e P3 (Desejavel)

> Especificacao de telas para geracao de codigo frontend.
> Stack: **Next.js 14+ (App Router) . shadcn/ui . Tailwind CSS . Lucide Icons**
> Design system: [design-system.md](./design-system.md)
> Telas P0/P1: [screens.md](./screens.md)
> Ultima atualizacao: 2026-02-17

---

## Inventario de telas (P2 e P3)

| # | Tela | Feature | User Stories | Rota | Prioridade |
|---|------|---------|-------------|------|------------|
| T01 | Lista de recibos | F06 | US-17 | `/recibos` | P2 |
| T02 | Emitir recibo (wizard 3 etapas) | F06 | US-17 | `/recibos/novo` | P2 |
| T03 | Visualizar recibo (PDF preview) | F06 | US-17 | `/recibos/[id]` | P2 |
| T04 | Dashboard financeiro | F07 | US-18 | `/dashboard` | P2 |
| T05 | Banner de trial (componente) | F08 | US-19 | N/A (componente global) | P2 |
| T06 | Pagina de planos | F08 | US-20, US-22 | `/assinatura/planos` | P2 |
| T07 | Bloqueio por expiracao de trial | F08 | US-21 | `/assinatura/expirado` | P2 |
| T08 | Gestao da assinatura | F08 | US-20, US-22 | `/configuracoes/assinatura` | P2 |
| T09 | Configuracoes de notificacoes | F09 | US-23, US-24 | `/configuracoes/notificacoes` | P3 |
| T10 | Log de notificacoes | F09 | US-23, US-24 | `/configuracoes/notificacoes/log` | P3 |

### Dependencias entre telas

```
T01 Lista de recibos
 ├──> T02 Emitir recibo (botao "Emitir recibo")
 └──> T03 Visualizar recibo (acao na tabela)

T04 Dashboard financeiro (independente)

T05 Banner de trial
 └──> T06 Pagina de planos (botao "Contratar plano")

T07 Bloqueio por expiracao
 └──> T06 Pagina de planos (botao "Ver planos")

T08 Gestao da assinatura
 └──> T06 Pagina de planos (botao "Fazer upgrade")

T09 Configuracoes de notificacoes
 └──> T10 Log de notificacoes (link "Ver historico")
```

---

## P2 — Feature F06: Emissao de Recibos

Objetivo: Gerar recibos para reembolso de plano de saude.
Bounded context: Financeiro.
Dependencias: F05 (conta a receber com baixa).
Spec complementar: [receipt-legal-spec.md](../content/receipt-legal-spec.md)

---

### Tela T01: Lista de recibos

**Feature**: F06 | **User Stories**: US-17
**Rota**: `/recibos`
**Acesso**: Profissional autonomo, Secretaria, Admin de clinica, Profissional de clinica

**Layout**:

```
+------------------+---------------------------------------------------------------+
|                  |  HEADER  [Breadcrumb: Recibos]            [Avatar]            |
|  S I D E B A R   +---------------------------------------------------------------+
|                  |                                                                |
|  [Logo]          |  Recibos                                    [ + Emitir recibo] |
|                  |                                                                |
|  - Dashboard     |  +------------------------------------------------------------+|
|  - Agenda        |  | [__ Periodo __]  [Paciente v]  [Profissional v]  [Limpar]  ||
|  - Pacientes     |  +------------------------------------------------------------+|
|  - Financeiro    |                                                                |
|  > Recibos       |  +------------------------------------------------------------+|
|  - Configuracoes |  | Numero         | Emissao    | Paciente     | Profissional  ||
|                  |  |                | (data)     |              |               ||
|                  |  |----------------|------------|--------------|---------------||
|                  |  | REC-2026-00003 | 15/02/2026 | Maria Santos | Dr. Joao      ||
|                  |  | REC-2026-00002 | 10/02/2026 | Pedro Lima   | Dr. Joao      ||
|                  |  | REC-2026-00001 | 05/02/2026 | Ana Costa    | Dra. Laura    ||
|                  |  +------------------------------------------------------------+|
|                  |  |  (cont.)       | Valor (R$) | Acoes                        ||
|                  |  |----------------|------------|------------------------------||
|                  |  |                | R$ 250,00  | [Visualizar] [Baixar] [...]  ||
|                  |  |                | R$ 180,00  | [Visualizar] [Baixar] [...]  ||
|                  |  |                | R$ 320,00  | [Visualizar] [Baixar] [...]  ||
|                  |  +------------------------------------------------------------+|
|                  |                                                                |
|                  |                    < 1  2  3  ...  10 >                        |
|                  |                                                                |
+------------------+---------------------------------------------------------------+
```

**Componentes**:

- `Button` (variant `default`) — "Emitir recibo" no cabecalho da pagina, com icone `Plus`
- `DatePickerWithRange` — filtro de periodo (data inicio e data fim)
- `Combobox` (Command + Popover do shadcn/ui) — filtro por paciente com busca por nome/CPF
- `Select` — filtro por profissional (visivel apenas em tenants do tipo clinica para admin/secretaria)
- `Button` (variant `ghost`, size `sm`) — "Limpar filtros" com icone `X`
- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — tabela de listagem
- `DropdownMenu` — menu de acoes por linha (icone `MoreHorizontal`)
  - Item "Visualizar" com icone `Eye` — abre preview do recibo
  - Item "Baixar PDF" com icone `Download` — download direto do PDF
  - Item "Reemitir copia" com icone `Copy` — gera segunda via (mesmo PDF)
- `Pagination` — navegacao entre paginas da lista
- `Badge` — exibir status do recibo (emitido = `emerald-100 text-emerald-700`, cancelado = `red-100 text-red-700`)

**Dados exibidos**:

| Campo | Tipo | Origem |
|-------|------|--------|
| Numero | `string` (formato `REC-AAAA-NNNNN`) | `recibo.numero` |
| Data de emissao | `date` (formato `DD/MM/AAAA`) | `recibo.dataEmissao` |
| Paciente | `string` (nome completo) | `recibo.paciente.nome` (snapshot) |
| Profissional | `string` (nome) | `recibo.emitente.nome` (snapshot) |
| Valor | `currency` (formato `R$ X.XXX,XX`) | `recibo.valor` |
| Status | `enum` (`emitido`, `cancelado`) | `recibo.status` |

**Acoes do usuario**:

- Clicar em "Emitir recibo" -> navegar para `/recibos/novo`
- Alterar filtros (periodo, paciente, profissional) -> recarregar tabela com filtros aplicados via query params
- Clicar em "Visualizar" na linha -> navegar para `/recibos/[id]`
- Clicar em "Baixar PDF" na linha -> iniciar download do arquivo PDF (`recibo.urlPdf`)
- Clicar em "Reemitir copia" na linha -> gerar link temporario de download (mesmo PDF original, nao gera novo documento)
- Clicar em paginacao -> navegar para a pagina correspondente

**Estados**:

- **Vazio**:
  ```tsx
  <EmptyState
    icon={FileText}
    titulo="Nenhum recibo emitido"
    descricao="Emita recibos a partir das contas a receber pagas. Os recibos servem como comprovante para reembolso de planos de saude."
    acaoLabel="Emitir recibo"
    onAcao={() => router.push("/recibos/novo")}
  />
  ```

- **Loading**:
  ```tsx
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />          {/* barra de filtros */}
    <Skeleton className="h-8 w-full" />            {/* header da tabela */}
    {Array.from({ length: 5 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" /> {/* linhas */}
    ))}
  </div>
  ```

- **Erro**: Toast de erro via Sonner: `toast.error("Erro ao carregar recibos. Tente novamente.")`. Exibir botao "Tentar novamente" no centro da area de conteudo.

- **Filtros sem resultado**: Mesma tabela vazia com mensagem "Nenhum recibo encontrado para os filtros selecionados" e botao "Limpar filtros".

---

### Tela T02: Emitir recibo (wizard 3 etapas)

**Feature**: F06 | **User Stories**: US-17
**Rota**: `/recibos/novo`
**Acesso**: Profissional autonomo, Secretaria, Admin de clinica

**Layout geral**:

```
+------------------+---------------------------------------------------------------+
|                  |  HEADER  [Breadcrumb: Recibos > Emitir recibo]    [Avatar]    |
|  S I D E B A R   +---------------------------------------------------------------+
|                  |                                                                |
|  [Logo]          |  Emitir recibo                                                |
|                  |                                                                |
|  - Dashboard     |  +------------------------------------------------------------+|
|  - Agenda        |  |  STEPPER                                                  ||
|  - Pacientes     |  |  (1) Selecionar       (2) Dados do        (3) Revisao     ||
|  - Financeiro    |  |      atendimentos          recibo              e emissao   ||
|  > Recibos       |  |  [=== ativo ===]      [--- inativo ---]   [--- inativo -] ||
|  - Configuracoes |  +------------------------------------------------------------+|
|                  |                                                                |
|                  |  +------------------------------------------------------------+|
|                  |  |                                                            ||
|                  |  |              CONTEUDO DA ETAPA ATUAL                       ||
|                  |  |              (varia conforme etapa)                        ||
|                  |  |                                                            ||
|                  |  +------------------------------------------------------------+|
|                  |                                                                |
|                  |  +------------------------------------------------------------+|
|                  |  |  [Cancelar]                    [Voltar]  [Proximo / Emitir]||
|                  |  +------------------------------------------------------------+|
|                  |                                                                |
+------------------+---------------------------------------------------------------+
```

**Componente stepper**:

- Implementar com uma barra horizontal de 3 passos usando `div` + classes Tailwind
- Passo ativo: circulo `bg-primary text-primary-foreground` + label `font-medium text-foreground`
- Passo concluido: circulo `bg-primary text-primary-foreground` com icone `Check` + label `text-muted-foreground`
- Passo futuro: circulo `bg-muted text-muted-foreground` + label `text-muted-foreground`
- Conector entre passos: linha `h-0.5 bg-primary` (concluido) ou `h-0.5 bg-muted` (futuro)

---

#### Etapa 1: Selecionar atendimentos

**Layout da etapa 1**:

```
+------------------------------------------------------------------+
|  Card: Selecionar atendimentos                                    |
+------------------------------------------------------------------+
|                                                                    |
|  Filtros: [Paciente v]  [__ Periodo __]                           |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | [ ] | Paciente       | Data       | Tipo          | Valor    | |
|  |-----|----------------|------------|---------------|----------| |
|  | [x] | Maria Santos   | 10/02/2026 | Psicoterapia  | R$ 250  | |
|  | [x] | Maria Santos   | 03/02/2026 | Psicoterapia  | R$ 250  | |
|  | [ ] | Pedro Lima     | 08/02/2026 | Fisioterapia  | R$ 180  | |
|  | [ ] | Ana Costa      | 12/02/2026 | Psicoterapia  | R$ 320  | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  Selecionados: 2 atendimentos                                     |
|  Valor total: R$ 500,00                                            |
|                                                                    |
+------------------------------------------------------------------+
```

**Componentes da etapa 1**:

- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` — container da etapa
- `Combobox` (Command + Popover) — filtro por paciente com busca
- `DatePickerWithRange` — filtro por periodo
- `Table` com `Checkbox` na primeira coluna — selecao multipla de atendimentos
- `Checkbox` — no header para "selecionar todos" / "deselecionar todos"
- Rodape de resumo: `div` com contagem de selecionados e valor total em `font-semibold text-lg`

**Dados exibidos na etapa 1**:

| Campo | Tipo | Origem |
|-------|------|--------|
| Paciente | `string` | `contaAReceber.paciente.nome` |
| Data do atendimento | `date` (DD/MM/AAAA) | `contaAReceber.dataAtendimento` |
| Tipo de atendimento | `string` | `contaAReceber.tipoAtendimento` |
| Valor | `currency` | `contaAReceber.valor` |
| Status do pagamento | `enum` | `contaAReceber.statusPagamento` (apenas `pago` e exibido) |

**Regras da etapa 1**:

- Exibir **apenas** contas a receber com status `pago` (baixa realizada) e que **ainda nao possuem recibo emitido**
- Se uma conta ja possui recibo, nao exibir na lista (ou exibir desabilitada com tooltip "Recibo ja emitido — REC-XXXX-XXXXX")
- O botao "Proximo" so fica habilitado quando ao menos 1 atendimento esta selecionado
- Ao selecionar atendimentos de pacientes diferentes, exibir `Alert` (variant `warning`): "Voce selecionou atendimentos de pacientes diferentes. Cada recibo deve ser emitido para um unico paciente."
- Ao selecionar multiplos atendimentos do mesmo paciente: permitido (recibo agrupado)

**Estado vazio da etapa 1**:

```tsx
<EmptyState
  icon={FileText}
  titulo="Nenhum atendimento disponivel"
  descricao="Nao existem contas a receber pagas sem recibo. Registre a baixa de pagamentos na area financeira para poder emitir recibos."
/>
```

---

#### Etapa 2: Dados do recibo

**Layout da etapa 2**:

```
+------------------------------------------------------------------+
|  Card: Dados do recibo                                            |
+------------------------------------------------------------------+
|                                                                    |
|  DADOS DO PROFISSIONAL (secao, read-only)                         |
|  +--------------------------------------------------------------+ |
|  | Nome:      Dr. Joao da Silva                                 | |
|  | CPF:       123.456.789-00                                    | |
|  | Registro:  CRP 06/123456                                     | |
|  | Endereco:  Rua das Flores, 123 - Sao Paulo/SP                | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  DADOS DO PACIENTE (secao, read-only)                             |
|  +--------------------------------------------------------------+ |
|  | Nome:      Maria Santos                                       | |
|  | CPF:       987.654.321-00                                    | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  DADOS DO SERVICO (secao, editavel)                               |
|  +--------------------------------------------------------------+ |
|  | Descricao do servico:                                         | |
|  | [Textarea: "Sessao de psicoterapia individual"           ]    | |
|  |                                                               | |
|  | Valor total:       R$ 500,00   (read-only, soma dos selecion.)| |
|  | Valor por extenso: quinhentos reais (gerado automaticamente)  | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  DADOS DO DOCUMENTO (secao)                                       |
|  +--------------------------------------------------------------+ |
|  | Numero:          REC-2026-00004  (gerado automaticamente)     | |
|  | Data de emissao: [DatePicker: 17/02/2026]                     | |
|  +--------------------------------------------------------------+ |
|                                                                    |
+------------------------------------------------------------------+
```

**Componentes da etapa 2**:

- `Card`, `CardHeader`, `CardTitle`, `CardContent` — container da etapa
- `Separator` — entre secoes (profissional, paciente, servico, documento)
- Campos read-only: `div` com label (`text-sm font-medium text-muted-foreground`) + valor (`text-sm text-foreground`) dispostos em `grid grid-cols-2 gap-4`
- `Textarea` — descricao do servico (pre-preenchida com tipo de atendimento, editavel pelo usuario)
- `Input` (read-only, `disabled`) — valor total (soma automatica dos atendimentos selecionados)
- `Input` (read-only, `disabled`) — valor por extenso (gerado automaticamente por biblioteca de conversao)
- `Input` (read-only, `disabled`) — numero do recibo (gerado automaticamente, sequencial por tenant/ano)
- `DatePicker` — data de emissao (default: data atual, permite alterar para data passada, nao permite data futura)
- `Alert` (variant `warning`) — exibir alerta se dados do profissional estao incompletos (ex: sem endereco, sem registro profissional, sem assinatura digital)

**Dados exibidos na etapa 2**:

| Campo | Tipo | Editavel | Origem |
|-------|------|----------|--------|
| Profissional — Nome | `string` | Nao | `usuario.nome` |
| Profissional — CPF | `string` (mascarado XXX.XXX.XXX-XX) | Nao | `usuario.cpf` |
| Profissional — Registro | `string` (ex: CRP 06/123456) | Nao | `usuario.registroProfissional` |
| Profissional — Endereco | `string` (completo) | Nao | `tenant.endereco` |
| Paciente — Nome | `string` | Nao | `paciente.nome` |
| Paciente — CPF | `string` (mascarado) | Nao | `paciente.cpf` |
| Descricao do servico | `string` | Sim | Pre-preenchida com tipo do atendimento |
| Valor total | `currency` | Nao | Soma dos atendimentos selecionados na etapa 1 |
| Valor por extenso | `string` | Nao | Gerado automaticamente a partir do valor |
| Numero do recibo | `string` (REC-AAAA-NNNNN) | Nao | Gerado pelo backend (proximo sequencial) |
| Data de emissao | `date` | Sim | Default: data atual |

**Validacoes bloqueantes (exibir Alert antes de permitir avanco)**:

| Validacao | Mensagem |
|-----------|----------|
| CPF do profissional ausente ou invalido | "CPF do profissional invalido. Atualize o cadastro em Configuracoes." |
| Registro profissional nao preenchido | "Registro profissional nao informado. Atualize o cadastro em Configuracoes." |
| Endereco incompleto | "Endereco incompleto. Preencha todos os campos do endereco em Configuracoes." |
| Imagem de assinatura nao cadastrada | "Assinatura nao cadastrada. Faca o upload da sua assinatura em Configuracoes." |
| CPF do paciente ausente ou invalido | "CPF do paciente invalido. Atualize o cadastro do paciente." |
| Descricao do servico vazia | "Informe a descricao do servico prestado." |

Cada alerta bloqueante inclui um link direto para a tela de configuracao ou cadastro correspondente.

---

#### Etapa 3: Revisao e emissao

**Layout da etapa 3**:

```
+------------------------------------------------------------------+
|  Card: Revisao e emissao                                          |
+------------------------------------------------------------------+
|                                                                    |
|  +--------------------------------------------------------------+ |
|  |                   PREVIEW DO RECIBO                           | |
|  |                                                               | |
|  |  [Logo do tenant]       RECIBO DE PRESTACAO                   | |
|  |                         DE SERVICOS DE SAUDE                  | |
|  |                         No REC-2026-00004                     | |
|  |  ---------------------------------------------------------   | |
|  |                                                               | |
|  |  PROFISSIONAL:                                                | |
|  |  Nome: Dr. Joao da Silva                                     | |
|  |  CPF: 123.456.789-00                                         | |
|  |  Registro: CRP 06/123456                                     | |
|  |  Endereco: Rua das Flores, 123 - Sao Paulo/SP 01234-567      | |
|  |                                                               | |
|  |  PACIENTE:                                                    | |
|  |  Nome: Maria Santos                                           | |
|  |  CPF: 987.654.321-00                                         | |
|  |                                                               | |
|  |  SERVICO PRESTADO:                                            | |
|  |  Descricao: Sessao de psicoterapia individual                 | |
|  |  Data(s) do atendimento: 03/02/2026, 10/02/2026               | |
|  |                                                               | |
|  |  VALOR:                                                       | |
|  |  R$ 500,00 (quinhentos reais)                                 | |
|  |                                                               | |
|  |  Sao Paulo, 17 de fevereiro de 2026                           | |
|  |                                                               | |
|  |  [imagem da assinatura]                                       | |
|  |  ________________________________                             | |
|  |  Dr. Joao da Silva                                            | |
|  |  CRP 06/123456                                                | |
|  |                                                               | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  +--------------------------------------------------------------+ |
|  | (!) Apos emitido, o recibo nao podera ser alterado.           | |
|  +--------------------------------------------------------------+ |
|                                                                    |
|  [Cancelar]                              [Voltar]  [Emitir recibo] |
|                                                                    |
+------------------------------------------------------------------+
```

**Componentes da etapa 3**:

- `Card`, `CardContent` — container da etapa
- `Card` (interno, com `border-2 border-border`) — preview estilizado do recibo, simulando o layout do PDF final
  - Fundo `bg-white`, padding `p-8`, fonte `text-sm`
  - Cabecalho do recibo: logo do tenant (se houver, `img` max-h-12) + titulo centralizado `text-lg font-bold`
  - Secoes do recibo separadas por `Separator` (`border-t border-border my-4`)
  - Assinatura: imagem da assinatura (`img` max-h-16) + linha horizontal + nome e registro abaixo
- `Alert` (variant `warning`, com icone `AlertTriangle`) — aviso de imutabilidade: "Apos emitido, o recibo nao podera ser alterado."
- `Button` (variant `outline`) — "Cancelar" (volta para `/recibos`)
- `Button` (variant `outline`) — "Voltar" (volta para etapa 2)
- `Button` (variant `default`, primary) — "Emitir recibo" com icone `FileCheck`

**Acoes do usuario na etapa 3**:

- Clicar em "Emitir recibo" -> confirmar emissao:
  1. Exibir estado de loading no botao (`loading spinner` + texto "Emitindo...")
  2. Chamar API `POST /api/recibos` com todos os dados
  3. Em caso de sucesso: redirecionar para `/recibos` com `toast.success("Recibo REC-XXXX-XXXXX emitido com sucesso.", { action: { label: "Baixar PDF", onClick: () => downloadPdf(reciboId) } })`
  4. Em caso de erro: `toast.error("Erro ao emitir recibo. Tente novamente.")`, manter na etapa 3
- Clicar em "Voltar" -> voltar para etapa 2 (manter dados preenchidos)
- Clicar em "Cancelar" -> `AlertDialog` de confirmacao: "Tem certeza que deseja cancelar? Os dados nao serao salvos." + botoes "Continuar editando" / "Sim, cancelar"

**Estados da etapa 3**:

- **Loading (emissao em andamento)**: Botao "Emitir recibo" com `disabled` + `Loader2 animate-spin` + texto "Emitindo..."
- **Erro de emissao**: Toast de erro via Sonner. Botao volta ao estado normal para nova tentativa.

---

### Tela T03: Visualizar recibo (PDF preview)

**Feature**: F06 | **User Stories**: US-17
**Rota**: `/recibos/[id]`
**Acesso**: Profissional autonomo, Secretaria, Admin de clinica, Profissional de clinica

**Layout**:

```
+------------------+---------------------------------------------------------------+
|                  |  HEADER  [Breadcrumb: Recibos > REC-2026-00004]   [Avatar]    |
|  S I D E B A R   +---------------------------------------------------------------+
|                  |                                                                |
|  [Logo]          |  Recibo REC-2026-00004                                        |
|                  |                                                                |
|  - Dashboard     |  +------------------------------------------------------------+|
|  - Agenda        |  |                                                            ||
|  - Pacientes     |  |  [Logo do tenant]       RECIBO DE PRESTACAO                ||
|  - Financeiro    |  |                         DE SERVICOS DE SAUDE               ||
|  > Recibos       |  |                         No REC-2026-00004                  ||
|  - Configuracoes |  |  ----------------------------------------------------------||
|                  |  |                                                            ||
|                  |  |  PROFISSIONAL:                                             ||
|                  |  |  Nome: Dr. Joao da Silva                                  ||
|                  |  |  CPF: 123.456.789-00                                      ||
|                  |  |  Registro: CRP 06/123456                                  ||
|                  |  |  Endereco: Rua das Flores, 123 - Sao Paulo/SP 01234-567   ||
|                  |  |                                                            ||
|                  |  |  PACIENTE:                                                 ||
|                  |  |  Nome: Maria Santos                                        ||
|                  |  |  CPF: 987.654.321-00                                      ||
|                  |  |                                                            ||
|                  |  |  SERVICO PRESTADO:                                         ||
|                  |  |  Descricao: Sessao de psicoterapia individual              ||
|                  |  |  Data(s) do atendimento: 03/02/2026, 10/02/2026            ||
|                  |  |                                                            ||
|                  |  |  VALOR:                                                    ||
|                  |  |  R$ 500,00 (quinhentos reais)                              ||
|                  |  |                                                            ||
|                  |  |  Sao Paulo, 17 de fevereiro de 2026                        ||
|                  |  |                                                            ||
|                  |  |  [imagem da assinatura]                                    ||
|                  |  |  ________________________________                          ||
|                  |  |  Dr. Joao da Silva                                         ||
|                  |  |  CRP 06/123456                                             ||
|                  |  |                                                            ||
|                  |  +------------------------------------------------------------+|
|                  |                                                                |
|                  |  [< Voltar]                   [Imprimir]  [Baixar PDF]         |
|                  |                                                                |
+------------------+---------------------------------------------------------------+
```

**Componentes**:

- `Card` (com `border-2 border-border bg-white`) — container do recibo renderizado, largura `max-w-[210mm]` centralizado (simula folha A4)
- Layout interno do recibo:
  - Cabecalho: `div className="flex items-start justify-between"` com logo do tenant (`img` max-h-12, se houver) e bloco de titulo/numero alinhado a direita
  - Titulo: `h2 className="text-lg font-bold text-center"` — "RECIBO DE PRESTACAO DE SERVICOS DE SAUDE"
  - Numero: `p className="text-sm text-center text-muted-foreground"` — "No REC-2026-00004"
  - Secoes (profissional, paciente, servico, valor): `div className="space-y-1"` com label em `font-semibold text-xs uppercase tracking-wider text-muted-foreground` e valores em `text-sm`
  - `Separator` entre cada secao
  - Valor numerico: `span className="text-xl font-bold"` + valor por extenso em `text-sm text-muted-foreground`
  - Rodape: local e data em `text-sm`, imagem de assinatura (`img className="max-h-16 mx-auto"`), linha horizontal (`border-t border-foreground w-48 mx-auto`), nome e registro centralizados em `text-sm font-medium`
- `Badge` — status do recibo no topo do card (se cancelado: `variant="destructive"` com texto "Cancelado")
- Barra de acoes (abaixo do card):
  - `Button` (variant `link`, com icone `ArrowLeft`) — "Voltar" (navega para `/recibos`)
  - `Button` (variant `outline`, com icone `Printer`) — "Imprimir" (aciona `window.print()`)
  - `Button` (variant `default`, primary, com icone `Download`) — "Baixar PDF"

**Dados exibidos**:

| Campo | Tipo | Origem |
|-------|------|--------|
| Logo do tenant | `image` (URL) | `tenant.marca.logoUrl` |
| Numero do recibo | `string` | `recibo.numero` |
| Data de emissao | `date` (formato extenso) | `recibo.dataEmissao` |
| Profissional — Nome | `string` | `recibo.emitente.nome` (snapshot) |
| Profissional — CPF | `string` | `recibo.emitente.cpf` (snapshot) |
| Profissional — Registro | `string` | `recibo.emitente.registroProfissional` (snapshot) |
| Profissional — Endereco | `string` | `recibo.emitente.endereco` (snapshot) |
| Paciente — Nome | `string` | `recibo.paciente.nome` (snapshot) |
| Paciente — CPF | `string` | `recibo.paciente.cpf` (snapshot) |
| Descricao do servico | `string` | `recibo.descricaoServico` |
| Data(s) do atendimento | `date[]` | `recibo.dataAtendimento` |
| Valor numerico | `currency` | `recibo.valor` |
| Valor por extenso | `string` | `recibo.valorExtenso` |
| Assinatura | `image` (URL) | `recibo.assinaturaUrl` |
| Status | `enum` | `recibo.status` |

**Acoes do usuario**:

- Clicar em "Baixar PDF" -> download do arquivo PDF via `recibo.urlPdf` (link temporario autenticado)
- Clicar em "Imprimir" -> acionar `window.print()` com CSS de impressao que esconde sidebar, header e barra de acoes (`@media print { .no-print { display: none } }`)
- Clicar em "Voltar" -> navegar para `/recibos`

**Estados**:

- **Loading**: `Card` com `Skeleton` simulando o layout do recibo (blocos retangulares nas posicoes de cada secao)
- **Erro (recibo nao encontrado)**: Pagina 404 com `EmptyState` — icone `FileX`, titulo "Recibo nao encontrado", descricao "O recibo solicitado nao existe ou voce nao tem permissao para visualiza-lo.", botao "Voltar para recibos"
- **Recibo cancelado**: Exibir normalmente com `Badge variant="destructive"` no topo e marca d'agua visual `CANCELADO` em diagonal sobre o conteudo do recibo (usando CSS `transform: rotate(-30deg)` com `opacity-10`)

---

## P2 — Feature F07: Dashboard Financeiro

Objetivo: Visao consolidada da saude financeira do tenant.
Bounded context: Financeiro.
Dependencias: F05 (dados de contas a receber e baixas).

---

### Tela T04: Dashboard financeiro

**Feature**: F07 | **User Stories**: US-18
**Rota**: `/dashboard`
**Acesso**: Profissional autonomo, Admin de clinica, Profissional de clinica (visao filtrada)

**Layout**:

```
+------------------+---------------------------------------------------------------+
|                  |  HEADER  [Breadcrumb: Dashboard]               [Avatar]       |
|  S I D E B A R   +---------------------------------------------------------------+
|                  |                                                                |
|  [Logo]          |  Dashboard                  [__ Periodo __] [Profissional v]  |
|                  |                                                                |
|  > Dashboard     |  ROW 1 — CARDS DE METRICAS (grid 4 colunas)                  |
|  - Agenda        |  +-------------+ +-------------+ +-------------+ +-----------+|
|  - Pacientes     |  | TrendingUp  | | Clock       | | AlertTriang.| | Activity  ||
|  - Financeiro    |  | Entradas    | | Pendentes   | | Vencidas    | | Atendim.  ||
|  - Recibos       |  | R$ 4.500    | | R$ 1.200    | | R$ 800      | | 32        ||
|  - Configuracoes |  | +12% vs mes | | 8 contas    | | 5 contas    | | no period ||
|  |               |  +-------------+ +-------------+ +-------------+ +-----------+|
|                  |                                                                |
|                  |  ROW 2 — GRAFICOS (grid 2 colunas)                            |
|                  |  +-----------------------------+ +----------------------------+|
|                  |  | Aging de contas a receber   | | Entradas por mes           ||
|                  |  |                             | |                            ||
|                  |  |  |||                        | |       /\                   ||
|                  |  |  |||  ||                    | |      /  \    /\            ||
|                  |  |  |||  ||  ||                | |  ---/    \--/  \---        ||
|                  |  |  |||  ||  ||  |             | |                            ||
|                  |  |  0-30 31-60 61-90 +90 dias  | |  set out nov dez jan fev   ||
|                  |  +-----------------------------+ +----------------------------+|
|                  |                                                                |
|                  |  ROW 3 — TABELAS RESUMO (grid 2 colunas)                      |
|                  |  +-----------------------------+ +----------------------------+|
|                  |  | Proximos agendamentos (5)   | | Contas vencidas (5)        ||
|                  |  |-----------------------------|  |----------------------------||
|                  |  | 18/02 09:00 Maria - Psico.  | | Maria  R$ 250 - 15 dias    ||
|                  |  | 18/02 10:00 Pedro - Fisio.  | | Pedro  R$ 180 - 32 dias    ||
|                  |  | 18/02 14:00 Ana   - Psico.  | | Ana    R$ 320 - 45 dias    ||
|                  |  | 19/02 09:00 Carlos - Psico. | |                            ||
|                  |  | 19/02 11:00 Julia  - Fisio. | |                            ||
|                  |  | [Ver agenda completa ->]    | | [Ver financeiro ->]        ||
|                  |  +-----------------------------+ +----------------------------+|
|                  |                                                                |
+------------------+---------------------------------------------------------------+
```

**Componentes**:

- **Cabecalho da pagina**:
  - Titulo `h1 className="text-2xl font-semibold tracking-tight"` — "Dashboard"
  - `DatePickerWithRange` — filtro de periodo (default: mes atual)
  - `Select` — filtro por profissional (visivel apenas em tenants clinica para admin/secretaria; opcao "Todos os profissionais" como default para admin)

- **Row 1 — Cards de metricas** (`div className="grid grid-cols-4 gap-4"`):

  | Card | Icone (Lucide) | Cor do icone | Label | Valor | Subtexto |
  |------|---------------|-------------|-------|-------|----------|
  | Entradas | `TrendingUp` | `text-emerald-600` | "Entradas" | Valor total pago no periodo (R$) | Variacao percentual vs periodo anterior |
  | Pendentes | `Clock` | `text-amber-500` | "Pendentes" | Valor total pendente (R$) | Quantidade de contas pendentes |
  | Vencidas | `AlertTriangle` | `text-red-500` | "Vencidas" | Valor total com aging > 0 (R$) | Quantidade de contas vencidas |
  | Atendimentos | `Activity` | `text-slate-500` | "Atendimentos" | Quantidade no periodo | Texto "no periodo" |

  Cada card usa o padrao do design system (secao 4.4):
  ```tsx
  <Card>
    <CardHeader className="flex flex-row items-center justify-between pb-2">
      <CardTitle className="text-sm font-medium text-muted-foreground">
        {label}
      </CardTitle>
      <Icon className={cn("h-4 w-4", corDoIcone)} />
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-bold tracking-tight">{valor}</div>
      <p className="text-xs text-muted-foreground mt-1">{subtexto}</p>
    </CardContent>
  </Card>
  ```

  Variacao positiva: `text-emerald-600` com icone `TrendingUp` inline.
  Variacao negativa: `text-red-500` com icone `TrendingDown` inline.
  Sem variacao/neutro: `text-muted-foreground`.

- **Row 2 — Graficos** (`div className="grid grid-cols-2 gap-4 mt-4"`):

  - **Coluna 1: Grafico de barras — Aging de contas a receber**
    - `Card` com `CardHeader` (titulo "Aging de contas a receber") e `CardContent`
    - Usar **Recharts** (`BarChart`, `Bar`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`)
    - Faixas no eixo X: "0-30 dias", "31-60 dias", "61-90 dias", "+90 dias"
    - Eixo Y: valor em R$ (formatado)
    - Cores das barras: `fill` com gradiente do emerald (0-30) ao red (90+):
      - 0-30 dias: `fill="#10b981"` (emerald-500)
      - 31-60 dias: `fill="#f59e0b"` (amber-500)
      - 61-90 dias: `fill="#f97316"` (orange-500)
      - +90 dias: `fill="#ef4444"` (red-500)
    - Tooltip com valor formatado em R$ e quantidade de contas

  - **Coluna 2: Grafico de linha — Entradas por mes**
    - `Card` com `CardHeader` (titulo "Entradas por mes") e `CardContent`
    - Usar **Recharts** (`LineChart`, `Line`, `XAxis`, `YAxis`, `Tooltip`, `ResponsiveContainer`)
    - Eixo X: ultimos 6 meses (labels abreviados: "set", "out", "nov", "dez", "jan", "fev")
    - Eixo Y: valor em R$ (formatado)
    - Linha: `stroke="#059669"` (emerald-600), `strokeWidth={2}`
    - Area preenchida abaixo da linha: `fill="url(#emeraldGradient)"` com gradiente de `emerald-600/20` para `emerald-600/0`
    - Tooltip com valor formatado em R$ e nome do mes completo

- **Row 3 — Tabelas resumo** (`div className="grid grid-cols-2 gap-4 mt-4"`):

  - **Coluna 1: Proximos agendamentos**
    - `Card` com `CardHeader` (titulo "Proximos agendamentos", descricao "Agenda dos proximos dias")
    - `Table` simples (sem paginacao): colunas Data/Hora, Paciente, Tipo
    - Maximo 5 linhas
    - Cada linha e clicavel (navega para `/agenda?data=YYYY-MM-DD`)
    - Rodape do card: link "Ver agenda completa" com icone `ArrowRight` — navega para `/agenda`

  - **Coluna 2: Contas vencidas**
    - `Card` com `CardHeader` (titulo "Contas vencidas", descricao "Pagamentos em atraso")
    - `Table` simples (sem paginacao): colunas Paciente, Valor, Dias em atraso
    - Maximo 5 linhas
    - Coluna "Dias em atraso" com `Badge`:
      - 1-30 dias: `bg-amber-100 text-amber-700`
      - 31-60 dias: `bg-orange-100 text-orange-700`
      - 61+ dias: `bg-red-100 text-red-700`
    - Cada linha e clicavel (navega para `/financeiro?paciente=ID`)
    - Rodape do card: link "Ver financeiro" com icone `ArrowRight` — navega para `/financeiro`

**Dados exibidos**:

| Dado | Tipo | Origem |
|------|------|--------|
| Total de entradas | `currency` | Soma de `contasAReceber.valor` onde `status = pago` no periodo |
| Total de pendentes | `currency` | Soma de `contasAReceber.valor` onde `status = pendente` |
| Total de vencidas | `currency` | Soma de `contasAReceber.valor` onde `status = pendente` e `dataVencimento < hoje` |
| Quantidade de atendimentos | `number` | Contagem de `atendimentos` no periodo |
| Aging por faixa | `currency[]` | Agrupamento de contas pendentes por faixa de dias de atraso |
| Entradas por mes | `{ mes: string, valor: number }[]` | Agregacao mensal de baixas nos ultimos 6 meses |
| Proximos agendamentos | `Agendamento[]` (max 5) | Agendamentos com `data >= hoje` e `status = agendado ou confirmado`, ordenados por data ASC |
| Contas vencidas | `ContaAReceber[]` (max 5) | Contas com `status = pendente` e `dataVencimento < hoje`, ordenadas por dias de atraso DESC |

**Acoes do usuario**:

- Alterar periodo no `DatePickerWithRange` -> recarregar todos os dados do dashboard
- Alterar profissional no `Select` -> recarregar todos os dados filtrados por profissional
- Clicar em uma linha de "Proximos agendamentos" -> navegar para `/agenda?data=YYYY-MM-DD`
- Clicar em "Ver agenda completa" -> navegar para `/agenda`
- Clicar em uma linha de "Contas vencidas" -> navegar para `/financeiro?paciente=ID`
- Clicar em "Ver financeiro" -> navegar para `/financeiro`

**Estados**:

- **Vazio (primeiro acesso, sem dados)**:
  ```tsx
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="rounded-full bg-muted p-4 mb-4">
      <LayoutDashboard className="h-8 w-8 text-muted-foreground" />
    </div>
    <h3 className="text-lg font-medium">Seu dashboard esta vazio</h3>
    <p className="text-sm text-muted-foreground mt-1 max-w-md">
      Comece cadastrando pacientes e criando agendamentos para ver seu
      dashboard financeiro com metricas, graficos e resumos.
    </p>
    <div className="flex gap-3 mt-4">
      <Button variant="outline" onClick={() => router.push("/pacientes/novo")}>
        <UserPlus className="mr-2 h-4 w-4" />
        Cadastrar paciente
      </Button>
      <Button onClick={() => router.push("/agenda")}>
        <Calendar className="mr-2 h-4 w-4" />
        Abrir agenda
      </Button>
    </div>
  </div>
  ```

- **Loading**: Skeleton para cada secao:
  ```tsx
  {/* Row 1 - Cards */}
  <div className="grid grid-cols-4 gap-4">
    {Array.from({ length: 4 }).map((_, i) => (
      <Card key={i}>
        <CardHeader className="pb-2">
          <Skeleton className="h-4 w-24" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-8 w-32 mb-1" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    ))}
  </div>
  {/* Row 2 - Graficos */}
  <div className="grid grid-cols-2 gap-4 mt-4">
    <Card><CardContent className="pt-6"><Skeleton className="h-[200px] w-full" /></CardContent></Card>
    <Card><CardContent className="pt-6"><Skeleton className="h-[200px] w-full" /></CardContent></Card>
  </div>
  {/* Row 3 - Tabelas */}
  <div className="grid grid-cols-2 gap-4 mt-4">
    <Card><CardContent className="pt-6"><Skeleton className="h-[180px] w-full" /></CardContent></Card>
    <Card><CardContent className="pt-6"><Skeleton className="h-[180px] w-full" /></CardContent></Card>
  </div>
  ```

- **Erro**: Toast de erro: `toast.error("Erro ao carregar dashboard. Tente novamente.")`. Cada secao pode falhar independentemente; exibir `Alert` inline com botao "Tentar novamente" na secao que falhou.

- **Parcialmente vazio**: Cada secao se adapta individualmente. Ex.: graficos exibem barras/linhas zeradas com label "Sem dados no periodo"; tabelas resumo exibem "Nenhum agendamento proximo" ou "Nenhuma conta vencida".

---

## P2 — Feature F08: Assinatura e Trial

Objetivo: Monetizacao SaaS — trial com dados fake, contratacao e gestao de planos.
Bounded context: Assinatura.
Dependencias: F01 (tenant criado).
Referencia: [onboarding-flows.md](../content/onboarding-flows.md)

---

### Tela T05: Banner de trial (componente global)

**Feature**: F08 | **User Stories**: US-19
**Rota**: N/A (componente renderizado dentro do app shell, acima do header)
**Acesso**: Admin, Profissional autonomo (papeis que podem contratar)

**Layout — Trial ativo (dias restantes > 0)**:

```
+==================================================================================+
| [Sparkles]  Voce esta no periodo de avaliacao. 2 dia(s) restante(s).  [Contratar]|
+==================================================================================+
+------------------+---------------------------------------------------------------+
|                  |  HEADER (restante do app shell)                               |
|  S I D E B A R   +---------------------------------------------------------------+
|                  |                                                                |
```

**Layout — Trial expirado (dias restantes <= 0)**:

```
+==================================================================================+
| [AlertTriangle]  Seu periodo de avaliacao expirou.               [Ver planos]    |
+==================================================================================+
+------------------+---------------------------------------------------------------+
|                  |  HEADER (restante do app shell)                               |
```

**Componentes**:

- `div` fixo no topo — Trial ativo:
  ```tsx
  <div className="flex items-center justify-between bg-emerald-50 border-b border-emerald-200 px-6 py-2.5">
    <div className="flex items-center gap-2">
      <Sparkles className="h-4 w-4 text-emerald-600" />
      <span className="text-sm text-emerald-800">
        Voce esta no periodo de avaliacao.{" "}
        <strong>{diasRestantes} dia(s) restante(s).</strong>
      </span>
    </div>
    <Button size="sm" variant="default" onClick={() => router.push("/assinatura/planos")}>
      Contratar plano
    </Button>
  </div>
  ```

- `div` fixo no topo — Trial expirado:
  ```tsx
  <div className="flex items-center justify-between bg-red-50 border-b border-red-200 px-6 py-2.5">
    <div className="flex items-center gap-2">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <span className="text-sm text-red-800">
        Seu periodo de avaliacao expirou.
      </span>
    </div>
    <Button size="sm" variant="destructive" onClick={() => router.push("/assinatura/planos")}>
      Ver planos
    </Button>
  </div>
  ```

**Dados exibidos**:

| Campo | Tipo | Origem |
|-------|------|--------|
| Dias restantes | `number` | Calculado: `Math.ceil((tenant.assinatura.dataExpiracao - now()) / (1000*60*60*24))` |
| Status da assinatura | `enum` (`trial`, `ativa`, `expirada`) | `tenant.assinatura.status` |

**Regras de exibicao**:

- Exibir **apenas** quando `tenant.assinatura.status === 'trial'`
- Nao exibir quando a assinatura esta ativa (plano contratado)
- Nao exibir para usuarios com papel `secretaria` ou `profissional de clinica` (apenas admin/autonomo veem o banner pois sao os unicos que podem contratar)
- Quando `diasRestantes === 1`: texto "1 dia restante" (singular)
- Quando `diasRestantes <= 0`: alternar para variante de expirado (fundo vermelho)
- O banner empurra todo o conteudo do app shell para baixo (nao sobrepoe)

**Acoes do usuario**:

- Clicar em "Contratar plano" -> navegar para `/assinatura/planos`
- Clicar em "Ver planos" (variante expirada) -> navegar para `/assinatura/planos`

---

### Tela T06: Pagina de planos

**Feature**: F08 | **User Stories**: US-20, US-22
**Rota**: `/assinatura/planos`
**Acesso**: Admin, Profissional autonomo

**Layout — Acesso voluntario (upgrade, com sidebar)**:

```
+------------------+---------------------------------------------------------------+
|                  |  HEADER  [Breadcrumb: Assinatura > Planos]        [Avatar]    |
|  S I D E B A R   +---------------------------------------------------------------+
|                  |                                                                |
|  [Logo]          |              Escolha seu plano                                |
|                  |    Comece a gerenciar sua clinica com eficiencia               |
|  - Dashboard     |                                                                |
|  - Agenda        |  +------------------+ +------------------+ +-----------------+|
|  - Pacientes     |  |                  | |  [Recomendado]   | |                 ||
|  - Financeiro    |  |   AUTONOMO       | |   CLINICA        | |  CLINICA PLUS   ||
|  - Recibos       |  |                  | |                  | |                 ||
|  > Assinatura    |  | R$ 49,90 /mes    | | R$ 149,90 /mes   | | R$ 299,90 /mes  ||
|  - Configuracoes |  |                  | |                  | |                 ||
|                  |  | [v] 1 usuario    | | [v] Ate 5 usuar. | | [v] Ilimitado   ||
|                  |  | [v] 100 pacient. | | [v] 500 pacient. | | [v] Ilimitado   ||
|                  |  | [v] Agenda       | | [v] Agenda       | | [v] Agenda      ||
|                  |  | [v] Prontuario   | | [v] Prontuario   | | [v] Prontuario  ||
|                  |  | [v] Financeiro   | | [v] Financeiro   | | [v] Financeiro  ||
|                  |  | [v] Recibos      | | [v] Recibos      | | [v] Recibos     ||
|                  |  | [ ] WhatsApp     | | [v] WhatsApp     | | [v] WhatsApp    ||
|                  |  | [v] E-mail       | | [v] E-mail prior.| | [v] Suporte VIP ||
|                  |  |                  | |                  | |                 ||
|                  |  | [Contratar]      | | [Contratar]      | | [Contratar]     ||
|                  |  | (outline)        | | (primary)        | | (outline)       ||
|                  |  +------------------+ +------------------+ +-----------------+|
|                  |                                                                |
|                  |  Todos os planos incluem trial de 1-2 dias.                   |
|                  |  Cancele a qualquer momento.                                   |
|                  |                                                                |
+------------------+---------------------------------------------------------------+
```

**Layout — Bloqueio por trial expirado (sem sidebar)**:

Mesmo conteudo acima, porem sem sidebar e sem header do app shell. Layout centralizado:

```
+==================================================================================+
|                                                                                    |
|                         [Logo da plataforma]                                       |
|                                                                                    |
|                         Escolha seu plano                                          |
|              Comece a gerenciar sua clinica com eficiencia                         |
|                                                                                    |
|  +------------------+ +--------------------+ +------------------+                  |
|  |   AUTONOMO       | |  [Recomendado]     | |  CLINICA PLUS    |                  |
|  |                  | |   CLINICA           | |                  |                  |
|  |  (mesma estrut.) | |  (mesma estrutura)  | | (mesma estrut.)  |                  |
|  +------------------+ +--------------------+ +------------------+                  |
|                                                                                    |
|  Todos os planos incluem trial de 1-2 dias. Cancele a qualquer momento.           |
|                                                                                    |
|  [Fazer logout]                                                                    |
|                                                                                    |
+==================================================================================+
```

**Componentes**:

- Cabecalho centralizado:
  - `h1 className="text-2xl font-semibold tracking-tight text-center"` — "Escolha seu plano"
  - `p className="text-muted-foreground text-center mt-1"` — "Comece a gerenciar sua clinica com eficiencia"

- Grid de planos (`div className="grid grid-cols-3 gap-6 mt-8 max-w-4xl mx-auto"`):

  Cada plano e um `Card`:
  ```tsx
  <Card className={cn(
    "relative flex flex-col",
    isRecommended && "border-2 border-primary shadow-lg",
    isCurrentPlan && "border-2 border-emerald-300 bg-emerald-50/30"
  )}>
    {isRecommended && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
        Recomendado
      </Badge>
    )}
    {isCurrentPlan && (
      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-100 text-emerald-700 border border-emerald-300">
        Plano atual
      </Badge>
    )}
    <CardHeader className="text-center">
      <CardTitle className="text-xl">{plano.nome}</CardTitle>
      <div className="mt-2">
        <span className="text-3xl font-bold">R$ {plano.preco}</span>
        <span className="text-muted-foreground"> /mes</span>
      </div>
    </CardHeader>
    <CardContent className="flex-1">
      <ul className="space-y-2">
        {plano.funcionalidades.map((func) => (
          <li key={func.id} className="flex items-center gap-2 text-sm">
            {func.incluso ? (
              <Check className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <X className="h-4 w-4 text-slate-300 shrink-0" />
            )}
            <span className={cn(!func.incluso && "text-muted-foreground")}>
              {func.descricao}
            </span>
          </li>
        ))}
      </ul>
    </CardContent>
    <CardFooter>
      <Button
        className="w-full"
        variant={isRecommended ? "default" : "outline"}
        disabled={isCurrentPlan}
        onClick={() => handleContratar(plano.id)}
      >
        {isCurrentPlan ? "Plano atual" : "Contratar"}
      </Button>
    </CardFooter>
  </Card>
  ```

- Notas no rodape:
  - `p className="text-sm text-muted-foreground text-center mt-6"` — "Todos os planos incluem trial de 1-2 dias."
  - `p className="text-sm text-muted-foreground text-center mt-1"` — "Cancele a qualquer momento."
  - Link "Fazer logout" (visivel apenas no layout de bloqueio, sem sidebar): `Button variant="link"` com icone `LogOut`

**Dados exibidos**:

| Campo | Tipo | Origem |
|-------|------|--------|
| Nome do plano | `string` | `plano.nome` (ex: "Autonomo", "Clinica", "Clinica Plus") |
| Preco mensal | `currency` | `plano.precoMensal` |
| Lista de funcionalidades | `{ descricao: string, incluso: boolean }[]` | `plano.funcionalidades` |
| Limites (usuarios, pacientes) | `string` | `plano.limites` |
| Plano recomendado | `boolean` | `plano.recomendado` (flag do backend) |
| Plano atual do tenant | `string \| null` | `tenant.assinatura.planoId` |

**Acoes do usuario**:

- Clicar em "Contratar" em um plano -> exibir `AlertDialog` de confirmacao:
  - Titulo: "Contratar plano {nome}"
  - Descricao: "Voce esta contratando o plano {nome} por R$ {preco}/mes. A cobranca sera ativada a partir de hoje."
  - Se em trial: adicionar texto "Os dados de demonstracao serao mantidos. Voce pode remove-los a qualquer momento em Configuracoes."
  - Botoes: "Cancelar" (outline) / "Confirmar contratacao" (primary)
  - Apos confirmar: chamar API, exibir loading no botao, redirecionar para `/dashboard` com `toast.success("Plano {nome} contratado com sucesso!")`
- Clicar em "Fazer logout" (layout bloqueio) -> encerrar sessao e redirecionar para `/login`

**Estados**:

- **Loading**: Skeleton para cada card de plano (3 cards lado a lado com `Skeleton` no lugar do conteudo)
- **Erro ao carregar planos**: `Alert variant="destructive"` centralizado com mensagem "Erro ao carregar planos. Tente novamente." e botao "Tentar novamente"
- **Erro ao contratar**: Toast de erro: `toast.error("Erro ao processar contratacao. Tente novamente.")`
- **Plano atual marcado**: O card do plano atual exibe borda `border-emerald-300` e `Badge "Plano atual"`. O botao fica `disabled` com texto "Plano atual".

---

### Tela T07: Bloqueio por expiracao de trial

**Feature**: F08 | **User Stories**: US-21
**Rota**: `/assinatura/expirado` (ou overlay interceptando qualquer rota)
**Acesso**: Todos os usuarios do tenant com trial expirado

**Layout**:

```
+==================================================================================+
|                                                                                    |
|                                                                                    |
|                                                                                    |
|                                                                                    |
|                              [Lock icon]                                           |
|                                                                                    |
|                    Seu periodo de avaliacao terminou                               |
|                                                                                    |
|         Contrate um plano para continuar usando a plataforma.                     |
|         Seus dados serao mantidos por 30 dias.                                    |
|                                                                                    |
|                          [ Ver planos ]                                            |
|                                                                                    |
|                          Fazer logout                                              |
|                                                                                    |
|                                                                                    |
|                                                                                    |
+==================================================================================+
```

**Componentes**:

- Layout de tela cheia, centralizado, sem sidebar e sem header:
  ```tsx
  <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4">
    <div className="flex flex-col items-center text-center max-w-md">
      <div className="rounded-full bg-red-100 p-6 mb-6">
        <Lock className="h-12 w-12 text-red-600" />
      </div>
      <h1 className="text-2xl font-semibold tracking-tight">
        Seu periodo de avaliacao terminou
      </h1>
      <p className="text-muted-foreground mt-2">
        Contrate um plano para continuar usando a plataforma.
        Seus dados serao mantidos por 30 dias.
      </p>
      <Button className="mt-6" size="lg" onClick={() => router.push("/assinatura/planos")}>
        Ver planos
      </Button>
      <Button variant="link" className="mt-2 text-muted-foreground" onClick={() => handleLogout()}>
        Fazer logout
      </Button>
    </div>
  </div>
  ```

**Dados exibidos**:

| Campo | Tipo | Origem |
|-------|------|--------|
| Status da assinatura | `enum` | `tenant.assinatura.status` (deve ser `expirada`) |

**Acoes do usuario**:

- Clicar em "Ver planos" -> navegar para `/assinatura/planos` (layout sem sidebar)
- Clicar em "Fazer logout" -> encerrar sessao e redirecionar para `/login`

**Regras de redirecionamento**:

- Se `tenant.assinatura.status === 'expirada'` e o usuario tenta acessar qualquer rota do app (ex: `/dashboard`, `/pacientes`), redirecionar para `/assinatura/expirado`
- Excecoes (rotas permitidas mesmo com trial expirado): `/assinatura/planos`, `/assinatura/expirado`, `/api/auth/logout`
- Para usuarios com papel `secretaria` ou `profissional de clinica` (que nao podem contratar):
  - Substituir mensagem para: "Seu periodo de avaliacao terminou. Solicite ao administrador da clinica a contratacao de um plano para continuar usando a plataforma."
  - Nao exibir botao "Ver planos" (apenas "Fazer logout")

**Estados**:

- **Loading**: N/A (pagina estatica, sem carregamento de dados)
- **Erro**: N/A

---

### Tela T08: Gestao da assinatura

**Feature**: F08 | **User Stories**: US-20, US-22
**Rota**: `/configuracoes/assinatura`
**Acesso**: Admin, Profissional autonomo

**Layout**:

```
+------------------+---------------------------------------------------------------+
|                  |  HEADER  [Breadcrumb: Config. > Assinatura]       [Avatar]    |
|  S I D E B A R   +---------------------------------------------------------------+
|                  |                                                                |
|  [Logo]          |  Assinatura                                                   |
|                  |                                                                |
|  - Dashboard     |  +------------------------------------------------------------+|
|  - Agenda        |  |  Card: Plano atual                                        ||
|  - Pacientes     |  |                                                            ||
|  - Financeiro    |  |  Plano:             Clinica                                ||
|  - Recibos       |  |  Status:            Ativo     [Badge verde]                ||
|  > Configuracoes |  |  Data de inicio:    15/01/2026                             ||
|    > Assinatura  |  |  Proxima cobranca:  15/03/2026                             ||
|                  |  |  Valor mensal:      R$ 149,90                              ||
|                  |  |                                                            ||
|                  |  |  [Fazer upgrade]             [Cancelar assinatura]          ||
|                  |  |  (primary)                   (destructive outline)          ||
|                  |  |                                                            ||
|                  |  +------------------------------------------------------------+|
|                  |                                                                |
|                  |  +------------------------------------------------------------+|
|                  |  |  Card: Historico de mudancas                               ||
|                  |  |                                                            ||
|                  |  |  Data       | De           | Para          | Usuario       ||
|                  |  |  -----------|--------------|---------------|---------------||
|                  |  |  15/01/2026 | Trial        | Clinica       | Admin Joao    ||
|                  |  |  01/01/2026 | —            | Trial         | Sistema       ||
|                  |  |                                                            ||
|                  |  +------------------------------------------------------------+|
|                  |                                                                |
+------------------+---------------------------------------------------------------+
```

**Componentes**:

- **Card "Plano atual"**:
  - `Card`, `CardHeader` (titulo "Plano atual"), `CardContent`
  - Dados em layout `grid grid-cols-2 gap-y-3`:
    - Label (`text-sm font-medium text-muted-foreground`) + Valor (`text-sm text-foreground`)
  - `Badge` ao lado do status:
    - Ativo: `bg-emerald-100 text-emerald-700` com texto "Ativo"
    - Trial: `bg-amber-100 text-amber-700` com texto "Trial"
    - Expirado: `bg-red-100 text-red-700` com texto "Expirado"
  - Barra de acoes no rodape do card:
    - `Button` (variant `default`, primary) — "Fazer upgrade" com icone `ArrowUpCircle` -> navega para `/assinatura/planos`
    - `Button` (variant `outline`, className `text-destructive border-destructive hover:bg-destructive/10`) — "Cancelar assinatura" com icone `XCircle`

- **AlertDialog para cancelamento de assinatura**:
  ```tsx
  <AlertDialog>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>Cancelar assinatura</AlertDialogTitle>
        <AlertDialogDescription>
          Tem certeza que deseja cancelar sua assinatura? Apos o cancelamento:
        </AlertDialogDescription>
      </AlertDialogHeader>
      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 px-2">
        <li>Seu acesso sera mantido ate o final do periodo ja pago.</li>
        <li>Apos o periodo, o acesso sera bloqueado.</li>
        <li>Seus dados serao mantidos por 30 dias.</li>
        <li>Voce pode recontratar a qualquer momento.</li>
      </ul>
      <AlertDialogFooter>
        <AlertDialogCancel>Manter assinatura</AlertDialogCancel>
        <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
          Sim, cancelar assinatura
        </AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
  ```

- **Card "Historico de mudancas"**:
  - `Card`, `CardHeader` (titulo "Historico de mudancas"), `CardContent`
  - `Table` simples (sem paginacao) com colunas: Data, De (plano anterior), Para (plano novo), Usuario responsavel
  - Ordenacao: mais recente primeiro

**Dados exibidos**:

| Campo | Tipo | Origem |
|-------|------|--------|
| Nome do plano | `string` | `tenant.assinatura.plano.nome` |
| Status | `enum` (`trial`, `ativa`, `cancelada`, `expirada`) | `tenant.assinatura.status` |
| Data de inicio | `date` | `tenant.assinatura.dataInicio` |
| Proxima cobranca | `date` | `tenant.assinatura.dataRenovacao` |
| Valor mensal | `currency` | `tenant.assinatura.plano.precoMensal` |
| Historico | `{ data, planoDe, planoPara, usuario }[]` | `tenant.assinatura.historico` |

**Acoes do usuario**:

- Clicar em "Fazer upgrade" -> navegar para `/assinatura/planos`
- Clicar em "Cancelar assinatura" -> abrir `AlertDialog` de confirmacao -> confirmar -> chamar API -> `toast.success("Assinatura cancelada. Voce tera acesso ate DD/MM/AAAA.")` -> atualizar dados da pagina
- Em caso de erro no cancelamento: `toast.error("Erro ao cancelar assinatura. Tente novamente.")`

**Estados**:

- **Loading**: Skeleton nos dois cards (linhas de `Skeleton` no lugar dos dados)
- **Erro**: Toast de erro: `toast.error("Erro ao carregar dados da assinatura.")`
- **Sem assinatura (trial ativo)**: Card exibe status "Trial" com dias restantes; botao "Fazer upgrade" muda texto para "Contratar plano"; botao "Cancelar assinatura" nao e exibido (nao existe assinatura para cancelar)

---

## P3 — Feature F09: Notificacoes via WhatsApp

Objetivo: Reduzir faltas e manter o paciente informado sobre agendamentos.
Bounded context: Notificacoes.
Dependencias: F03 (agendamentos criados), integracao com WhatsApp Business API.

---

### Tela T09: Configuracoes de notificacoes

**Feature**: F09 | **User Stories**: US-23, US-24
**Rota**: `/configuracoes/notificacoes`
**Acesso**: Admin, Profissional autonomo

**Layout**:

```
+------------------+---------------------------------------------------------------+
|                  |  HEADER  [Breadcrumb: Config. > Notificacoes]     [Avatar]    |
|  S I D E B A R   +---------------------------------------------------------------+
|                  |                                                                |
|  [Logo]          |  Notificacoes                         [Ver historico ->]       |
|                  |                                                                |
|  - Dashboard     |  +------------------------------------------------------------+|
|  - Agenda        |  |  Card: Configuracoes de notificacoes                      ||
|  - Pacientes     |  |                                                            ||
|  - Financeiro    |  |  LEMBRETES DE AGENDAMENTO                                 ||
|  - Recibos       |  |  +---------------------------------------------------------||
|  > Configuracoes |  |  | Enviar lembrete antes do agendamento   [Switch ON/OFF] ||
|    > Notificacoes|  |  | Antecedencia: [Select: 24h v]                          ||
|                  |  |  |   Opcoes: 1h, 2h, 12h, 24h, 48h                        ||
|                  |  |  +---------------------------------------------------------||
|                  |  |                                                            ||
|                  |  |  CONFIRMACAO DE AGENDAMENTO                                ||
|                  |  |  +---------------------------------------------------------||
|                  |  |  | Enviar confirmacao ao criar agendamento [Switch ON/OFF] ||
|                  |  |  +---------------------------------------------------------||
|                  |  |                                                            ||
|                  |  |  AVISO DE CANCELAMENTO                                     ||
|                  |  |  +---------------------------------------------------------||
|                  |  |  | Avisar paciente sobre cancelamento     [Switch ON/OFF]  ||
|                  |  |  +---------------------------------------------------------||
|                  |  |                                                            ||
|                  |  |  [Salvar configuracoes]                                    ||
|                  |  |                                                            ||
|                  |  +------------------------------------------------------------+|
|                  |                                                                |
|                  |  +------------------------------------------------------------+|
|                  |  |  Card: Preview da mensagem                                ||
|                  |  |                                                            ||
|                  |  |  +------------------------------------------------------+ ||
|                  |  |  | [WhatsApp icon]                                      | ||
|                  |  |  |                                                      | ||
|                  |  |  | Ola, Maria! Lembrete do seu agendamento:             | ||
|                  |  |  |                                                      | ||
|                  |  |  | Data: 18/02/2026                                     | ||
|                  |  |  | Horario: 09:00                                       | ||
|                  |  |  | Profissional: Dr. Joao da Silva                      | ||
|                  |  |  | Local: Rua das Flores, 123 - Sao Paulo/SP            | ||
|                  |  |  |                                                      | ||
|                  |  |  | Caso precise remarcar, entre em contato.             | ||
|                  |  |  +------------------------------------------------------+ ||
|                  |  |                                                            ||
|                  |  +------------------------------------------------------------+|
|                  |                                                                |
|                  |  (i) Mensagens enviadas via WhatsApp Business. O paciente     |
|                  |      deve ter telefone cadastrado.                             |
|                  |                                                                |
+------------------+---------------------------------------------------------------+
```

**Componentes**:

- Cabecalho da pagina:
  - Titulo `h1` — "Notificacoes"
  - Link "Ver historico" com icone `ArrowRight` (navega para `/configuracoes/notificacoes/log`)

- **Card "Configuracoes de notificacoes"**:
  - `Card`, `CardHeader` (titulo "Configuracoes de notificacoes", descricao "Defina como e quando notificar seus pacientes"), `CardContent`
  - Secoes separadas por `Separator`:

    **Secao 1: Lembretes de agendamento**
    - `div className="flex items-center justify-between"`:
      - Label: `span className="text-sm font-medium"` — "Enviar lembrete antes do agendamento"
      - `Switch` — ativo/inativo (default: ativo)
    - Condicional (visivel apenas se switch ativo):
      - `Select` — antecedencia do lembrete
        - Opcoes: "1 hora antes", "2 horas antes", "12 horas antes", "24 horas antes" (default), "48 horas antes"

    **Secao 2: Confirmacao de agendamento**
    - `div className="flex items-center justify-between"`:
      - Label: "Enviar confirmacao ao criar agendamento"
      - `Switch` — ativo/inativo (default: ativo)
    - Descricao auxiliar: `p className="text-xs text-muted-foreground mt-1"` — "O paciente recebe uma mensagem ao criar ou alterar um agendamento."

    **Secao 3: Aviso de cancelamento**
    - `div className="flex items-center justify-between"`:
      - Label: "Avisar paciente sobre cancelamento"
      - `Switch` — ativo/inativo (default: ativo)
    - Descricao auxiliar: `p className="text-xs text-muted-foreground mt-1"` — "O paciente recebe uma mensagem quando um agendamento e cancelado."

  - Rodape do card:
    - `Button` (variant `default`) — "Salvar configuracoes"

- **Card "Preview da mensagem"**:
  - `Card`, `CardHeader` (titulo "Preview da mensagem", descricao "Exemplo da mensagem que sera enviada"), `CardContent`
  - `div className="bg-emerald-50 rounded-lg p-4 border border-emerald-100"` — simulacao de balao de WhatsApp
    - Icone do WhatsApp (`MessageCircle` ou icone customizado) no topo
    - Texto da mensagem com dados de exemplo:
      ```
      Ola, {nome_paciente}! Lembrete do seu agendamento:

      Data: {data}
      Horario: {horario}
      Profissional: {nome_profissional}
      Local: {endereco}

      Caso precise remarcar, entre em contato.
      ```
    - A preview muda dinamicamente conforme o tipo de notificacao selecionado (lembrete/confirmacao/cancelamento)

- Nota informativa:
  - `div className="flex items-start gap-2 mt-4"` com icone `Info` (`h-4 w-4 text-muted-foreground shrink-0 mt-0.5`) e texto `text-sm text-muted-foreground`:
    "Mensagens enviadas via WhatsApp Business. O paciente deve ter telefone cadastrado."

**Dados exibidos**:

| Campo | Tipo | Origem |
|-------|------|--------|
| Lembrete ativo | `boolean` | `tenant.configuracoes.notificacoes.lembreteAtivo` |
| Antecedencia do lembrete | `enum` (1h, 2h, 12h, 24h, 48h) | `tenant.configuracoes.notificacoes.lembreteAntecedencia` |
| Confirmacao ativa | `boolean` | `tenant.configuracoes.notificacoes.confirmacaoAtiva` |
| Cancelamento ativo | `boolean` | `tenant.configuracoes.notificacoes.cancelamentoAtivo` |

**Acoes do usuario**:

- Alterar qualquer switch -> marcar formulario como "modificado" (habilitar botao "Salvar")
- Alterar antecedencia no Select -> marcar formulario como "modificado"
- Clicar em "Salvar configuracoes" -> chamar API `PUT /api/configuracoes/notificacoes` -> `toast.success("Configuracoes de notificacao salvas com sucesso.")`
- Clicar em "Ver historico" -> navegar para `/configuracoes/notificacoes/log`
- Tentar sair da pagina com alteracoes nao salvas -> exibir confirmacao: "Voce tem alteracoes nao salvas. Deseja sair sem salvar?"

**Estados**:

- **Loading**: Skeleton nos dois cards
- **Erro ao carregar**: Toast de erro + botao "Tentar novamente"
- **Erro ao salvar**: Toast de erro: `toast.error("Erro ao salvar configuracoes. Tente novamente.")`
- **Salvo com sucesso**: Toast de sucesso, botao "Salvar" volta ao estado `disabled` (nenhuma alteracao pendente)

---

### Tela T10: Log de notificacoes

**Feature**: F09 | **User Stories**: US-23, US-24
**Rota**: `/configuracoes/notificacoes/log`
**Acesso**: Admin, Profissional autonomo

**Layout**:

```
+------------------+---------------------------------------------------------------+
|                  |  HEADER  [Breadcrumb: Config. > Notif. > Log]     [Avatar]    |
|  S I D E B A R   +---------------------------------------------------------------+
|                  |                                                                |
|  [Logo]          |  Historico de notificacoes             [< Voltar p/ config.]   |
|                  |                                                                |
|  - Dashboard     |  +------------------------------------------------------------+|
|  - Agenda        |  | [__ Periodo __]  [Tipo v]  [Status v]           [Limpar]   ||
|  - Pacientes     |  +------------------------------------------------------------+|
|  - Financeiro    |                                                                |
|  - Recibos       |  +------------------------------------------------------------+|
|  > Configuracoes |  | Data/hora         | Paciente     | Tipo          | Status  ||
|    > Notificacoes|  |                   |              |               |         ||
|                  |  |-------------------|--------------|---------------|---------|+
|                  |  | 17/02/2026 08:00  | Maria Santos | Lembrete      | Enviado ||
|                  |  | 16/02/2026 14:30  | Pedro Lima   | Confirmacao   | Enviado ||
|                  |  | 16/02/2026 10:15  | Ana Costa    | Cancelamento  | Falha   ||
|                  |  | 15/02/2026 09:00  | Carlos Souza | Lembrete      | Enviado ||
|                  |  | 15/02/2026 08:00  | Julia Alves  | Lembrete      | Pendente||
|                  |  +------------------------------------------------------------+|
|                  |  |  (cont.)          | Canal        |                         ||
|                  |  |-------------------|--------------|                         ||
|                  |  |                   | WhatsApp     |                         ||
|                  |  |                   | WhatsApp     |                         ||
|                  |  |                   | WhatsApp     |                         ||
|                  |  |                   | WhatsApp     |                         ||
|                  |  |                   | WhatsApp     |                         ||
|                  |  +------------------------------------------------------------+|
|                  |                                                                |
|                  |                    < 1  2  3  ...  10 >                        |
|                  |                                                                |
+------------------+---------------------------------------------------------------+
```

**Componentes**:

- Cabecalho da pagina:
  - Titulo `h1` — "Historico de notificacoes"
  - `Button` (variant `link`, com icone `ArrowLeft`) — "Voltar para configuracoes" -> navega para `/configuracoes/notificacoes`

- Barra de filtros:
  - `DatePickerWithRange` — filtro de periodo
  - `Select` — tipo de notificacao
    - Opcoes: "Todos", "Lembrete", "Confirmacao", "Cancelamento"
  - `Select` — status
    - Opcoes: "Todos", "Enviado", "Falha", "Pendente"
  - `Button` (variant `ghost`, size `sm`) — "Limpar filtros" com icone `X`

- `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` — tabela de log:
  - Coluna "Data/hora": formato `DD/MM/AAAA HH:mm`
  - Coluna "Paciente": nome do paciente
  - Coluna "Tipo": `Badge` com variantes:
    - Lembrete: `bg-blue-100 text-blue-700`
    - Confirmacao: `bg-emerald-100 text-emerald-700`
    - Cancelamento: `bg-amber-100 text-amber-700`
  - Coluna "Status": `Badge` com variantes:
    - Enviado: `bg-emerald-100 text-emerald-700` com icone `CheckCircle2` (h-3 w-3)
    - Falha: `bg-red-100 text-red-700` com icone `XCircle` (h-3 w-3)
    - Pendente: `bg-slate-100 text-slate-700` com icone `Clock` (h-3 w-3)
  - Coluna "Canal": texto "WhatsApp" com icone `MessageCircle` (h-3 w-3)

- `Pagination` — navegacao entre paginas

**Dados exibidos**:

| Campo | Tipo | Origem |
|-------|------|--------|
| Data/hora de envio | `datetime` | `notificacao.dataHoraEnvio` |
| Paciente | `string` | `notificacao.paciente.nome` |
| Tipo | `enum` (`lembrete`, `confirmacao`, `cancelamento`) | `notificacao.tipo` |
| Status | `enum` (`enviado`, `falha`, `pendente`) | `notificacao.status` |
| Canal | `string` (sempre "WhatsApp" no MVP) | `notificacao.canal` |
| Mensagem de erro | `string` (nullable) | `notificacao.mensagemErro` (exibir em tooltip ao passar o mouse sobre status "Falha") |

**Acoes do usuario**:

- Alterar filtros (periodo, tipo, status) -> recarregar tabela com filtros aplicados
- Clicar em "Limpar filtros" -> remover todos os filtros e recarregar
- Clicar em paginacao -> navegar para pagina correspondente
- Passar o mouse sobre status "Falha" -> exibir `Tooltip` com a mensagem de erro tecnico (ex: "Numero de telefone invalido", "Servico indisponivel")
- Clicar em "Voltar para configuracoes" -> navegar para `/configuracoes/notificacoes`

**Estados**:

- **Vazio**:
  ```tsx
  <EmptyState
    icon={Bell}
    titulo="Nenhuma notificacao enviada"
    descricao="As notificacoes enviadas para pacientes via WhatsApp serao exibidas aqui. Ative as notificacoes nas configuracoes."
    acaoLabel="Ir para configuracoes"
    onAcao={() => router.push("/configuracoes/notificacoes")}
  />
  ```

- **Loading**:
  ```tsx
  <div className="space-y-3">
    <Skeleton className="h-10 w-full" />
    <Skeleton className="h-8 w-full" />
    {Array.from({ length: 8 }).map((_, i) => (
      <Skeleton key={i} className="h-12 w-full" />
    ))}
  </div>
  ```

- **Erro**: Toast de erro: `toast.error("Erro ao carregar historico de notificacoes.")`. Botao "Tentar novamente" centralizado.

- **Filtros sem resultado**: Tabela vazia com mensagem "Nenhuma notificacao encontrada para os filtros selecionados" e botao "Limpar filtros".

---

## Notas gerais para implementacao

### Padroes reutilizados do design system

Todas as telas acima seguem os padroes definidos em [design-system.md](./design-system.md):

- **Paleta de cores**: Emerald para primary, Teal para secondary, Slate para neutros, semanticas para estados (red, amber, blue)
- **Tipografia**: Inter (Google Fonts), escala definida na secao 2 do design system
- **Layout shell**: Sidebar (280px, colapsavel) + Header (h-16) + Content area (max-w-7xl mx-auto px-6 py-6)
- **Componentes recorrentes**: Pagina de listagem (secao 4.1), Formulario (secao 4.2), Modal/Dialog (secao 4.3), Cards de metrica (secao 4.4), Toast/Sonner (secao 4.5), Banner de trial (secao 4.6), Estado vazio (secao 4.7)
- **Validacao de formulario**: react-hook-form + zod
- **Notificacoes**: Sonner (via shadcn/ui), posicao top-right
- **Acessibilidade**: WCAG 2.1 AA conforme secao 7 do design system

### Bibliotecas adicionais necessarias (P2/P3)

| Biblioteca | Uso | Tela(s) |
|------------|-----|---------|
| `recharts` | Graficos de barras e linhas no dashboard | T04 |
| Biblioteca de valor por extenso (ex: `extenso.js`) | Converter valor numerico para texto em PT-BR | T02 (etapa 2) |
| `@react-pdf/renderer` ou equivalente | Preview/geracao de PDF no frontend (opcional, PDF e gerado no backend) | T03 |

### Controle de acesso por tela

| Tela | autonomo | admin | profissional | secretaria |
|------|----------|-------|-------------|------------|
| T01 Lista de recibos | Sim | Sim | Sim (proprios) | Sim |
| T02 Emitir recibo | Sim | Sim | Nao | Sim |
| T03 Visualizar recibo | Sim | Sim | Sim (proprios) | Sim |
| T04 Dashboard | Sim | Sim (consolidado) | Sim (filtrado) | Nao |
| T05 Banner trial | Sim | Sim | Nao | Nao |
| T06 Pagina de planos | Sim | Sim | Nao | Nao |
| T07 Bloqueio trial | Sim | Sim | Sim (msg diferente) | Sim (msg diferente) |
| T08 Gestao assinatura | Sim | Sim | Nao | Nao |
| T09 Config. notificacoes | Sim | Sim | Nao | Nao |
| T10 Log notificacoes | Sim | Sim | Nao | Nao |
