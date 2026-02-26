# Design System — Prontuario Autonomo Medico

> Documento de referencia para geracao de interfaces consistentes.
> Stack: **Next.js 14+ (App Router) · shadcn/ui · Tailwind CSS · Lucide Icons**

---

## 1. Paleta de cores

A paleta transmite **confianca, saude e bem-estar** por meio de tons de verde combinados com neutros claros.

### 1.1 Variaveis CSS (formato shadcn/ui — valores HSL)

Inserir no arquivo `app/globals.css` dentro de `:root` (tema claro):

```css
:root {
  /* --- Cores de marca --- */
  --primary:            160 84% 39%;      /* emerald-600  #059669 */
  --primary-foreground: 0 0% 100%;        /* branco puro           */

  --secondary:          173 80% 40%;      /* teal-600     #0d9488 */
  --secondary-foreground: 0 0% 100%;

  /* --- Superficies --- */
  --background:         210 40% 98%;      /* slate-50      #f8fafc */
  --foreground:         222 47% 11%;      /* slate-900     #0f172a */

  --card:               0 0% 100%;        /* branco                */
  --card-foreground:    222 47% 11%;      /* slate-900             */

  --popover:            0 0% 100%;
  --popover-foreground: 222 47% 11%;

  /* --- Muted / bordas --- */
  --muted:              210 40% 96%;      /* slate-100     #f1f5f9 */
  --muted-foreground:   215 16% 47%;     /* slate-500     #64748b */

  --accent:             160 84% 95%;      /* emerald-50    #ecfdf5 */
  --accent-foreground:  160 84% 39%;      /* emerald-600           */

  --border:             214 32% 91%;      /* slate-200     #e2e8f0 */
  --input:              214 32% 91%;
  --ring:               160 84% 39%;      /* emerald-600           */

  /* --- Semanticas --- */
  --destructive:            0 84% 60%;    /* red-500       #ef4444 */
  --destructive-foreground: 0 0% 100%;

  --warning:            38 92% 50%;       /* amber-500     #f59e0b */
  --warning-foreground: 0 0% 100%;

  --success:            160 84% 39%;      /* emerald-600 (igual primary) */
  --success-foreground: 0 0% 100%;

  --info:               217 91% 60%;      /* blue-500      #3b82f6 */
  --info-foreground:    0 0% 100%;

  /* --- Sidebar --- */
  --sidebar:            160 30% 96%;      /* verde bem claro       */
  --sidebar-foreground: 222 47% 11%;
  --sidebar-accent:     160 84% 95%;
  --sidebar-border:     160 20% 90%;

  /* --- Radius padrao --- */
  --radius: 0.5rem;
}
```

### 1.2 Classes utilitarias Tailwind de referencia rapida

| Proposito              | Classe Tailwind              | Hex aproximado |
|------------------------|------------------------------|----------------|
| Primary (botao, link)  | `bg-emerald-600`             | #059669        |
| Primary hover          | `hover:bg-emerald-700`       | #047857        |
| Secondary              | `bg-teal-600`                | #0d9488        |
| Secondary hover        | `hover:bg-teal-700`          | #0f766e        |
| Background             | `bg-slate-50`                | #f8fafc        |
| Texto principal        | `text-slate-900`             | #0f172a        |
| Texto secundario       | `text-slate-500`             | #64748b        |
| Destrutivo             | `bg-red-500`                 | #ef4444        |
| Warning                | `bg-amber-500`               | #f59e0b        |
| Success                | `bg-emerald-500`             | #10b981        |
| Info                   | `bg-blue-500`                | #3b82f6        |
| Muted / disabled       | `bg-slate-100`               | #f1f5f9        |
| Borda padrao           | `border-slate-200`           | #e2e8f0        |
| Card                   | `bg-white`                   | #ffffff        |

---

## 2. Tipografia

**Fonte principal:** Inter (Google Fonts) — sans-serif limpa, otima legibilidade em telas.

Importar no `layout.tsx` via `next/font/google`:

```tsx
import { Inter } from "next/font/google";
const inter = Inter({ subsets: ["latin"] });
```

### 2.1 Escala tipografica

| Elemento                       | Classes Tailwind                           | Tamanho |
|--------------------------------|--------------------------------------------|---------|
| Titulo da pagina               | `text-2xl font-semibold tracking-tight`    | 24px    |
| Titulo de secao                | `text-lg font-medium`                      | 18px    |
| Subtitulo / card header        | `text-base font-medium`                    | 16px    |
| Corpo de texto                 | `text-sm`                                  | 14px    |
| Label de campo                 | `text-sm font-medium`                      | 14px    |
| Texto auxiliar / helper        | `text-xs text-muted-foreground`            | 12px    |
| Badge / tag                    | `text-xs font-medium`                      | 12px    |
| Valor de metrica (dashboard)   | `text-3xl font-bold tracking-tight`        | 30px    |

### 2.2 Regras gerais

- Cor padrao do texto: `text-foreground` (slate-900).
- Texto secundario: `text-muted-foreground` (slate-500).
- Nunca usar `font-light` — manter minimo `font-normal` para legibilidade.
- Links: `text-primary underline-offset-4 hover:underline`.

---

## 3. Layout shell (aplicacao autenticada)

### 3.1 Estrutura visual

```
+------------------+-----------------------------------------------+
|                  |  HEADER (breadcrumb + acoes + avatar)         |
|  S I D E B A R   +-----------------------------------------------+
|  (280px)         |                                               |
|                  |                                               |
|  [Logo]          |              CONTENT AREA                     |
|                  |         (max-w-7xl mx-auto px-6 py-6)         |
|  - Dashboard     |                                               |
|  - Agenda        |                                               |
|  - Pacientes     |                                               |
|  - Financeiro    |                                               |
|  - Recibos       |                                               |
|  - Configuracoes |                                               |
|                  |                                               |
|  [Trial badge]   |                                               |
|  [Tenant/User]   |                                               |
+------------------+-----------------------------------------------+
```

### 3.2 Sidebar

| Propriedade         | Valor                                                  |
|---------------------|--------------------------------------------------------|
| Largura expandida   | `w-[280px]`                                            |
| Largura colapsada   | `w-[68px]` (apenas icones)                             |
| Background          | `bg-sidebar` (verde muito claro) ou `bg-white`         |
| Borda direita       | `border-r border-sidebar-border`                       |
| Posicao             | `fixed left-0 top-0 h-screen`                          |

**Composicao (de cima para baixo):**

1. **Logo / nome do produto** — parte superior, `py-6 px-4`.
2. **Navegacao principal** — lista de itens com icone + label, item ativo com `bg-accent text-accent-foreground rounded-md`.
3. **Badge de trial** (condicional) — exibido quando o tenant esta em periodo de teste.
4. **Rodape da sidebar** — nome do tenant (clinica), nome do usuario logado, botao de colapsar sidebar.

### 3.3 Header (top bar)

| Propriedade         | Valor                                                  |
|---------------------|--------------------------------------------------------|
| Altura              | `h-16`                                                 |
| Background          | `bg-background` (slate-50) ou `bg-white`               |
| Borda inferior      | `border-b border-border`                               |
| Padding             | `px-6`                                                 |

**Composicao (esquerda para direita):**

1. **Breadcrumb** — ex.: `Dashboard / Pacientes / Joao Silva`.
2. **Spacer** (`flex-1`).
3. **Acao contextual** — botao primario da pagina (ex.: `+ Novo paciente`). Visivel apenas quando a pagina define uma acao.
4. **Avatar do usuario** — dropdown com opcoes: Perfil, Configuracoes, Sair.

### 3.4 Content area

```tsx
<main className="ml-[280px] pt-16">
  <div className="max-w-7xl mx-auto px-6 py-6">
    {children}
  </div>
</main>
```

- `max-w-7xl` (1280px) para manter boa leitura em monitores grandes.
- `px-6 py-6` como padding interno padrao.

---

## 4. Componentes recorrentes (padroes)

### 4.1 Pagina de listagem

Usado em: **Pacientes, Financeiro (contas a receber), Recibos**.

```
+------------------------------------------------------------------+
| Titulo da pagina                          [ + Novo paciente ]    |
+------------------------------------------------------------------+
| [Busca______]  [Filtro v]  [Data inicio] ~ [Data fim]  [Limpar] |
+------------------------------------------------------------------+
| Nome          | CPF          | Telefone     | Acoes              |
|---------------------------------------------------------------|
| Joao Silva    | 123.456...   | (11) 9...    | [Editar] [Excluir] |
| Maria Santos  | 987.654...   | (21) 9...    | [Editar] [Excluir] |
+------------------------------------------------------------------+
|                    < 1  2  3  ...  10 >                          |
+------------------------------------------------------------------+
```

**Componentes shadcn/ui utilizados:**

- `Button` (variante `default` para acao primaria)
- `Input` para busca
- `Select` para filtros
- `DatePickerWithRange` para intervalo de datas
- `Table`, `TableHeader`, `TableRow`, `TableCell` para a DataTable
- `Pagination` para paginacao
- `DropdownMenu` para acoes por linha (tres pontos `MoreHorizontal`)

**Estado vazio:**

```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <Users className="h-12 w-12 text-muted-foreground mb-4" />
  <h3 className="text-lg font-medium">Nenhum paciente cadastrado</h3>
  <p className="text-sm text-muted-foreground mt-1 mb-4">
    Comece adicionando seu primeiro paciente.
  </p>
  <Button>
    <Plus className="mr-2 h-4 w-4" />
    Novo paciente
  </Button>
</div>
```

**Estado loading (skeleton):**

```tsx
<div className="space-y-3">
  <Skeleton className="h-10 w-full" />  {/* barra de filtros */}
  <Skeleton className="h-8 w-full" />   {/* header da tabela */}
  {Array.from({ length: 5 }).map((_, i) => (
    <Skeleton key={i} className="h-12 w-full" />
  ))}
</div>
```

### 4.2 Formulario

Usado em: **Cadastro de paciente, Agendamento, Configuracoes**.

**Estrutura:**

```tsx
<Card>
  <CardHeader>
    <CardTitle>Dados pessoais</CardTitle>
    <CardDescription>Informacoes basicas do paciente.</CardDescription>
  </CardHeader>
  <CardContent className="space-y-4">
    {/* campos do formulario */}
  </CardContent>
</Card>
```

**Regras de formulario:**

- Validacao com `react-hook-form` + `zod`.
- Cada campo usa o padrao `FormField` do shadcn/ui:
  ```tsx
  <FormField
    control={form.control}
    name="nome"
    render={({ field }) => (
      <FormItem>
        <FormLabel>Nome completo</FormLabel>
        <FormControl>
          <Input placeholder="Digite o nome" {...field} />
        </FormControl>
        <FormMessage />   {/* mensagem de erro inline */}
      </FormItem>
    )}
  />
  ```
- Layout de campos: `grid grid-cols-2 gap-4` para pares lado a lado; campo unico usa `col-span-2`.
- **Rodape de acoes** sempre no final:
  ```tsx
  <div className="flex justify-end gap-3 pt-6">
    <Button variant="outline" type="button">Cancelar</Button>
    <Button type="submit">Salvar</Button>
  </div>
  ```

### 4.3 Modal / Dialog

Usado em: **Agendamento rapido, confirmacao de exclusao, baixa de titulo**.

```tsx
<Dialog>
  <DialogContent className="sm:max-w-[425px]">  {/* sm */}
  <DialogContent className="sm:max-w-[560px]">  {/* md */}
  <DialogContent className="sm:max-w-[720px]">  {/* lg */}
    <DialogHeader>
      <DialogTitle>Confirmar exclusao</DialogTitle>
      <DialogDescription>
        Esta acao nao pode ser desfeita. Deseja continuar?
      </DialogDescription>
    </DialogHeader>
    {/* conteudo */}
    <DialogFooter>
      <Button variant="outline">Cancelar</Button>
      <Button variant="destructive">Excluir</Button>
    </DialogFooter>
  </DialogContent>
</Dialog>
```

**Tamanhos de referencia:**

| Tamanho | `max-w`  | Uso tipico                          |
|---------|----------|-------------------------------------|
| sm      | 425px    | Confirmacoes, mensagens simples     |
| md      | 560px    | Formularios simples (1-4 campos)    |
| lg      | 720px    | Formularios complexos, previews     |

### 4.4 Cards de metrica (Dashboard)

```tsx
<Card>
  <CardHeader className="flex flex-row items-center justify-between pb-2">
    <CardTitle className="text-sm font-medium text-muted-foreground">
      Pacientes ativos
    </CardTitle>
    <Users className="h-4 w-4 text-muted-foreground" />
  </CardHeader>
  <CardContent>
    <div className="text-3xl font-bold">128</div>
    <p className="text-xs text-muted-foreground mt-1">
      <span className="text-emerald-600">+12%</span> em relacao ao mes anterior
    </p>
  </CardContent>
</Card>
```

**Layout de cards no dashboard:** `grid grid-cols-4 gap-4` (4 colunas).

**Variacao de tendencia:**
- Positiva: `text-emerald-600` com icone `TrendingUp`.
- Negativa: `text-red-500` com icone `TrendingDown`.
- Neutra: `text-muted-foreground`.

### 4.5 Toast / Notificacao

Utilizar o componente `Sonner` (recomendado pelo shadcn/ui).

```tsx
import { toast } from "sonner";

// Sucesso
toast.success("Paciente cadastrado com sucesso.");

// Erro
toast.error("Erro ao salvar. Tente novamente.");

// Informacao
toast.info("Lembrete: voce tem 3 consultas hoje.");

// Com acao
toast("Paciente excluido.", {
  action: {
    label: "Desfazer",
    onClick: () => handleUndo(),
  },
});
```

**Posicao:** `top-right` (padrao). Configurar no `Toaster`:

```tsx
<Toaster position="top-right" richColors />
```

### 4.6 Banner de trial

Componente fixo exibido no topo da area de conteudo enquanto o tenant estiver em periodo de teste.

```tsx
<div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 mb-6">
  <div className="flex items-center gap-2">
    <AlertTriangle className="h-4 w-4 text-amber-600" />
    <span className="text-sm text-amber-800">
      Seu periodo de teste termina em <strong>7 dias</strong>.
    </span>
  </div>
  <Button size="sm" variant="default">
    Contratar plano
  </Button>
</div>
```

**Regras de exibicao:**
- Visivel apenas para usuarios com papel `admin` ou `autonomo`.
- Quando `dias_restantes <= 0`, alterar para fundo vermelho: `bg-red-50 border-red-200 text-red-800`.

### 4.7 Estado vazio (padrao generico)

Padrao reutilizavel para qualquer lista ou secao sem dados.

```tsx
interface EmptyStateProps {
  icon: LucideIcon;
  titulo: string;
  descricao: string;
  acaoLabel?: string;
  onAcao?: () => void;
}

function EmptyState({ icon: Icon, titulo, descricao, acaoLabel, onAcao }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="rounded-full bg-muted p-4 mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium">{titulo}</h3>
      <p className="text-sm text-muted-foreground mt-1 max-w-sm">{descricao}</p>
      {acaoLabel && onAcao && (
        <Button className="mt-4" onClick={onAcao}>
          <Plus className="mr-2 h-4 w-4" />
          {acaoLabel}
        </Button>
      )}
    </div>
  );
}
```

---

## 5. Navegacao principal

### 5.1 Itens do menu

| Icone (Lucide)     | Label           | Rota              | Visibilidade                        |
|---------------------|-----------------|--------------------|-------------------------------------|
| `LayoutDashboard`   | Dashboard       | `/dashboard`       | Todos os papeis                     |
| `Calendar`          | Agenda          | `/agenda`          | Todos os papeis                     |
| `Users`             | Pacientes       | `/pacientes`       | Todos (secretaria ve visao limitada)|
| `DollarSign`        | Financeiro      | `/financeiro`      | Todos os papeis                     |
| `FileText`          | Recibos         | `/recibos`         | Todos os papeis                     |
| `Settings`          | Configuracoes   | `/configuracoes`   | Admin, Autonomo                     |
| `CreditCard`        | Assinatura      | `/assinatura`      | Admin, Autonomo                     |

### 5.2 Padrao de item da sidebar

```tsx
interface NavItem {
  icon: LucideIcon;
  label: string;
  href: string;
  roles: ("admin" | "autonomo" | "medico" | "secretaria")[];
}

// Renderizacao de cada item:
<Link
  href={item.href}
  className={cn(
    "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
    isActive
      ? "bg-accent text-accent-foreground"
      : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
  )}
>
  <item.icon className="h-5 w-5" />
  {!isCollapsed && <span>{item.label}</span>}
</Link>
```

### 5.3 Controle de visibilidade

Filtrar itens do menu com base no papel do usuario logado:

```tsx
const visibleItems = navItems.filter((item) =>
  item.roles.includes(currentUser.role)
);
```

---

## 6. Responsividade (nota para MVP)

| Regra                     | Detalhe                                                     |
|---------------------------|-------------------------------------------------------------|
| Resolucao minima suportada | `min-width: 1024px` (desktop)                              |
| Sidebar em telas `< 1280px` | Colapsar automaticamente para modo icone (`w-[68px]`)    |
| Sidebar em telas `>= 1280px` | Expandida por padrao (`w-[280px]`)                       |
| Versao mobile             | Fora do escopo do MVP. Sera especificada em fase futura.   |

**Implementacao sugerida:**

```tsx
// Hook simples para controlar o estado da sidebar
const isDesktopLarge = useMediaQuery("(min-width: 1280px)");
const [isCollapsed, setIsCollapsed] = useState(!isDesktopLarge);
```

---

## 7. Acessibilidade

### 7.1 Diretrizes obrigatorias

| Requisito                          | Implementacao                                                 |
|------------------------------------|---------------------------------------------------------------|
| Contraste de cores                 | WCAG 2.1 AA — minimo 4.5:1 para texto normal, 3:1 para texto grande e elementos de UI |
| Focus visible                      | Todos os elementos interativos devem ter anel de foco visivel. Tailwind: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2` |
| Labels de formulario               | Todo `<input>` deve ter um `<label>` associado via `htmlFor` / `FormLabel` |
| Icones sem texto                   | Devem ter `aria-label` descritivo. Ex.: `<Button size="icon" aria-label="Editar paciente">` |
| Navegacao por teclado              | Tab para navegar, Enter/Space para ativar, Escape para fechar dialogs |
| Componentes shadcn/ui              | Ja construidos com primitivos Radix UI que seguem padroes WAI-ARIA |
| Leitores de tela                   | Usar `sr-only` para textos visiveis apenas para leitores de tela quando necessario |

### 7.2 Verificacao de contraste — cores principais

| Par de cores                        | Ratio estimado | Resultado |
|-------------------------------------|----------------|-----------|
| emerald-600 sobre branco            | 4.6:1          | AA Pass   |
| slate-900 sobre slate-50            | 15.4:1         | AAA Pass  |
| slate-500 sobre branco              | 4.6:1          | AA Pass   |
| branco sobre red-500                | 4.6:1          | AA Pass   |
| amber-800 sobre amber-50            | 7.5:1          | AAA Pass  |

---

## Resumo de decisoes

| Decisao                 | Escolha                                 |
|-------------------------|-----------------------------------------|
| Component library       | shadcn/ui (Radix + Tailwind)            |
| Icones                  | Lucide React                            |
| Validacao de formulario | react-hook-form + zod                   |
| Notificacoes            | Sonner (via shadcn/ui)                  |
| Fonte                   | Inter (Google Fonts)                    |
| Tema                    | Apenas claro (dark mode fora do escopo) |
| Responsividade          | Desktop only (>= 1024px)               |
| Acessibilidade          | WCAG 2.1 AA                             |
