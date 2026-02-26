# Primeiro passo para execução (mão na massa)

**Objetivo**: Deixar o projeto pronto para implementar a primeira tela (Feature F01 — Autenticação) e começar a codar.

**Referências**: [docs/content/user-stories-mvp.md](../content/user-stories-mvp.md) (F01, US-01 a US-04), [docs/ui/screens.md](../ui/screens.md) (Tela 01–08), [docs/ui/design-system.md](../ui/design-system.md), [docs/adr/0001-initial-stack.md](../adr/0001-initial-stack.md).

=================================================================

## Situação atual

- **Documentação**: content, domain, architecture, ADRs, user stories e especificação de telas (screens.md, design-system.md) estão prontos.
- **Código**: O projeto tem apenas `src/main.ts` (template) e **não** tem `package.json` nem aplicação Next.js. Ou seja: ainda não há frontend para implementar as telas.

=================================================================

## Primeiro passo (em ordem)

### 1. Inicializar o app Next.js no projeto

Criar a base do frontend conforme ADR 0001 e design-system (Next.js 14+ App Router, TypeScript, Tailwind).

**Opção A — Criar app na raiz do projeto (recomendado)**  
Na pasta `prontuario-autonomo-medico/`:

```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --no-import-alias
```

(Responder às perguntas; usar `src/` como pasta do app. Se já existir `src/main.ts`, pode ser sobrescrito ou movido; o Next.js usa `src/app/`.)

**Opção B — Manter src/main.ts e criar app em subpasta**  
Criar `prontuario-autonomo-medico/app/` ou `prontuario-autonomo-medico/web/` com Next.js e depois ajustar scripts e estrutura conforme preferir.

**Resultado esperado**: `package.json`, `src/app/layout.tsx`, `src/app/page.tsx`, `tailwind.config.*`, `next.config.*`, pasta `src/app/`.

---

### 2. Configurar o Design System (shadcn/ui + variáveis CSS)

- Inicializar **shadcn/ui** no projeto Next.js:
  ```bash
  npx shadcn@latest init
  ```
  Escolher style (ex.: New York), cores em CSS variables (sim), base gray (Slate).  
  O [design-system.md](../ui/design-system.md) usa **emerald** como primary; após o init, ajustar `app/globals.css` com as variáveis do design-system (emerald/teal, sidebar, etc.).

- Instalar os componentes necessários para a **Tela 01 (Login)**:
  ```bash
  npx shadcn@latest add button input checkbox separator card label
  ```
  (E outros que a especificação da Tela 01 exigir: toast para erros, alert, link.)

**Resultado esperado**: `components.json`, `src/components/ui/*`, `src/app/globals.css` com as variáveis do design-system.

---

### 3. Implementar a primeira tela: Tela 01 — Landing / Login

- **Rota**: `src/app/login/page.tsx` (ou `src/app/(auth)/login/page.tsx`).
- **Especificação**: [docs/ui/screens.md](../ui/screens.md) — seção "Tela 01: Landing / Login".
- **User story**: US-04 (Login com e-mail e senha).
- **Conteúdo mínimo**:
  - Layout: metade branding (logo, tagline, ilustração), metade formulário (e-mail, senha, "Lembrar de mim", "Esqueci minha senha", botão Entrar, links para cadastro).
  - Estados: vazio, loading, erro (credenciais inválidas, conta bloqueada, e-mail não confirmado), validação inline.
  - Navegação: "Esqueci minha senha" → `/esqueci-senha`; "Cadastrar como profissional" → `/cadastro/autonomo`; "Cadastrar clinica" → `/cadastro/clinica`.

Inicialmente a **ação "Entrar"** pode:
- Fazer um POST para uma API de login **mock** (ex.: `src/app/api/auth/login/route.ts` que retorna 200 ou 401), ou
- Apenas redirecionar para `/dashboard` (sem auth real) para validar o fluxo da tela.

A autenticação real (NextAuth ou outro) pode ser adicionada em seguida (ADR 0003).

---

### 4. (Opcional) Rodar e validar

```bash
npm run dev
```

Abrir `http://localhost:3000/login`, preencher o formulário e verificar layout, estados e links conforme screens.md.

=================================================================

## Resumo

| # | Passo | Resultado |
|---|--------|-----------|
| 1 | Inicializar Next.js no projeto | package.json, src/app/, Tailwind, ESLint |
| 2 | shadcn init + variáveis do design-system + componentes da Tela 01 | UI kit pronto e tema emerald |
| 3 | Implementar Tela 01 (Login) em `src/app/login/page.tsx` | Primeira tela da F01 no ar |
| 4 | Rodar `npm run dev` e testar | Validação manual da tela |

Depois disso, o próximo passo natural é: **Tela 02 (Cadastro profissional autônomo)** ou **conectar o login a uma API de autenticação real** (NextAuth).

=================================================================

## Observação

Se o workspace `cursor-ia` for a raiz e `prontuario-autonomo-medico` for um subprojeto, executar os comandos **dentro** de `prontuario-autonomo-medico` (cd prontuario-autonomo-medico antes de `npx create-next-app`).
