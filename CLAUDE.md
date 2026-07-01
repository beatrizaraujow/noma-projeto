# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

> O código, commits e UI são em **português (pt-BR)**. Escreva mensagens de commit e UI em português.

## Nomes vs. branding

O produto é **NOMA**, mas o código ainda usa o namespace antigo. Os pacotes se chamam **`@nexora/*`** (`@nexora/web`, `@nexora/api`, `@nexora/database`, `@nexora/ui`, `@nexora/types`, `@nexora/config`). Sempre use esses nomes nos filtros do pnpm/turbo. Você verá "NexORA" (Swagger) e "NUMA" (manifest PWA) em textos — é o mesmo projeto, renomeações incompletas.

## Comandos

Ambiente: **Windows / PowerShell**, **pnpm 8.12**, **Node ≥18/20**, monorepo **Turborepo**.

```bash
pnpm install                       # instala tudo (postinstall roda `prisma generate`)
docker-compose up -d               # sobe Postgres 16 (:5432) e Redis 7 (:6379) para dev local

pnpm dev                           # roda web + api juntos (turbo)
pnpm dev:web                       # só o frontend  → apps/web  (Next :3000)
pnpm dev:api                       # só o backend   → apps/api  (Nest :3001)

pnpm build                         # build de todo o monorepo (turbo, respeita dependências)
pnpm lint                          # lint em todos os pacotes
pnpm test                          # testes em todos os pacotes
pnpm format                        # prettier em **/*.{ts,tsx,md,json}
pnpm deploy:check                  # lint + test + build (rode antes de subir mudanças grandes)
```

**Rodar um único pacote / teste** (o `--` passa args ao script interno):

```bash
pnpm --filter @nexora/api test -- tasks.service.spec.ts   # 1 arquivo de teste (jest)
pnpm --filter @nexora/api test -- -t "nome do teste"      # por nome (jest -t)
pnpm --filter @nexora/api test:e2e                        # e2e do backend (test/jest-e2e.json)
pnpm --filter @nexora/web test -- CustomDashboardWidgets  # teste do frontend
pnpm --filter @nexora/web exec cypress open               # Cypress (config em apps/web/cypress.config.ts)
```

**Banco de dados** (o schema Prisma fica em `packages/database`, mas a API o referencia por caminho relativo):

```bash
pnpm --filter @nexora/api db:migrate    # prisma db push (sincroniza schema — NÃO usa migrate deploy)
pnpm --filter @nexora/api db:studio     # Prisma Studio
pnpm --filter @nexora/database db:seed  # seed (ts-node prisma/seed.ts)
```

> **Workflow de schema é `prisma db push`, não migrations versionadas.** Existem pastas em `packages/database/prisma/migrations/`, mas dev e produção sincronizam o schema com `db push` (o container da API roda `prisma db push --accept-data-loss` no boot). Ao mudar o schema, edite `schema.prisma` e rode `db:migrate` (push); criar uma pasta de migration é opcional/histórico.

## Arquitetura

Monorepo com dois apps sobre pacotes compartilhados:

- **`apps/api`** — backend **NestJS 10** (REST), buildado com **webpack**, porta **3001**.
- **`apps/web`** — frontend **Next.js 14 App Router** + React 18, porta **3000**.
- **`packages/database`** (`@nexora/database`) — schema **Prisma** + client Postgres, fonte única do modelo de dados (~35 models).
- **`packages/ui`** (`@nexora/ui`) — design system React (~50 componentes) sobre **Radix + CVA + Tailwind**; transpilado pelo Next (`transpilePackages`). Componentes vivem em `packages/ui/components/` (não `src/`).
- **`packages/types`** (`@nexora/types`) — tipos compartilhados entre web e api.
- **`packages/config`** — configs base de eslint/tsconfig/tailwind.
- **`packages/packages/`** é uma pasta órfã residual — ignore.

### Autenticação é em duas camadas (ponto crítico)

O frontend **não emite tokens próprios** — ele envelopa o JWT do backend:

1. **NestJS** (`apps/api/src/modules/auth`) emite o JWT real via `@nestjs/jwt` + Passport (`passport-jwt`/`passport-local`), com bcrypt e refresh token. `main.ts` **aborta o boot se `JWT_SECRET` não estiver setado**.
2. **NextAuth** (`apps/web/src/lib/auth-options.ts`) usa `CredentialsProvider` que faz POST para `/api/auth/login` do backend e guarda o `access_token`; o callback JWT renova via `/api/auth/refresh`. O `session.accessToken` é exposto ao client.
3. O **axios** (`apps/web/src/lib/api-client.ts`) injeta `Bearer ${session.accessToken}` em toda request; 401 redireciona para `/login`.

Ao mexer em auth, os dois lados precisam estar coerentes.

### Fluxo de dados no frontend

- **Camada de dados = TanStack React Query** (`src/hooks/useQueries.ts`, config em `src/lib/query-config.ts`) sobre o axios `api-client.ts`. `useCreateTask`/`useUpdateTask` usam **optimistic updates**.
- **Zustand está no `package.json` mas NÃO é usado** — estado global é React Context (`ThemeContext`, Toast, Onboarding). Não adicione stores Zustand assumindo que já existem.
- Tempo real: `src/hooks/useWebSocket.ts` (socket.io-client) ↔ `apps/api/src/modules/websocket` — eventos de task/comentário, presença e notificações por usuário.

### Backend: 20 módulos, mas nem tudo está ligado

`apps/api/src/modules/` tem: `auth`, `users`, `workspaces`, `invites`, `projects`, `tasks`, `routines`, `comments`, `activities`, `attachments`, `search`, `saved-filters`, `analytics`, `ai`, `automation`, `workflow`, `integrations`, `permissions`, `websocket`, `database`. Cada módulo segue o padrão Nest (controller + service + dto + module). API tem prefixo global `/api`; Swagger em `/api/docs`.

**Dependências presentes mas NÃO ativas — não assuma que funcionam:**
- **GraphQL/Apollo**: `GraphQLModule.forRoot` está **comentado** em `app.module.ts`. A API é **REST**.
- **MongoDB** (`mongoose`), **Elasticsearch**, **Bull/Redis queues** (`bull`, `ioredis`): declarados mas sem wiring efetivo. A persistência é **PostgreSQL via Prisma**; a busca (`search`) roda sobre Postgres.
- **De fato ativos**: REST + Prisma/Postgres + Socket.io + **OpenAI** (módulo `ai`, `gpt-3.5-turbo`, gated por `OPENAI_API_KEY`) + **nodemailer** (emails) + integrações em `integrations/services/` (github, slack, discord, figma, calendar, cloud-storage, webhook).

### Pegadinhas conhecidas (verificadas no código)

- **`PermissionsModule` NÃO está registrado** em `app.module.ts`. A pasta `src/modules/permissions/` (RolesService, `PermissionsGuard`, decorator `@RequirePermission`, guest-access, audit-log) existe e compila, mas **não está montada** — as rotas `/permissions/*` não sobem e o sistema de permissões granulares é código morto no app em execução. Para usá-lo é preciso adicioná-lo aos `imports` primeiro.
- **Prefixo duplicado**: `comments`, `activities` e `attachments` declaram `@Controller('api/comments'|'api/activities'|'api/attachments')`. Como já existe o prefixo global `api`, o caminho real fica **`/api/api/comments`**, `/api/api/activities`, `/api/api/attachments`. Os demais controllers omitem o `api/` corretamente.
- **Rate limiting inerte**: `ThrottlerModule.forRoot` está configurado, mas **nenhum `ThrottlerGuard`** é aplicado (global ou por rota) — não há throttling efetivo.
- **`ValidationPipe` global usa `forbidNonWhitelisted: true`**: propriedades extras no body são rejeitadas. Vários controllers de auth/tasks recebem body inline sem DTO (via `@Body('campo')`), então cuidado ao adicionar campos.
- **`PrismaService` tolera DB offline**: falha de conexão no init apenas gera warning e o app continua — erros de query só aparecem em runtime.

### Duas superfícies de tarefas coexistem

- **`/workspaces/[id]/*`** — superfície **principal e ativa** (estilo ClickUp): `tasks` (toggle lista/kanban), `routines`, `analytics`, etc. É onde o desenvolvimento recente acontece (time tracking + rotinas).
- **`/projects/[id]`** — superfície **legada/paralela** com o `ViewSwitcher` completo de 4 views (Kanban `@dnd-kit`, Lista, Calendário `react-big-calendar`, Timeline). Gantt não é implementado.

Ao adicionar features de tarefa, prefira a superfície `workspaces` salvo indicação em contrário.

## Deploy

- **Frontend → Vercel** (`apps/web/vercel.json`, framework Next, `pnpm install --frozen-lockfile`).
- **Backend → Railway** via `apps/api/Dockerfile` (`node:20-alpine`, pnpm 8.12, build webpack, `prisma db push` no boot, `node dist/main`). O domínio do Railway **deve apontar para a porta 3001** (`railway domain update --port 3001`) — porta errada causa 502.
- CI: GitHub Actions (`.github/workflows/ci-cd.yml`) roda lint → type-check → test → build em push/PR para `main`/`develop`.

## Convenções

- Path alias no web: `@/* → apps/web/src/*`.
- Tailwind com `darkMode: 'class'`; tema via `ThemeContext` (localStorage `noma-theme-mode`), não `next-themes`.
- Ícones: prefira **lucide-react** (há duas libs phosphor legadas no bundle — não adicione mais).
- Datas: existem `dayjs` e `moment` no projeto; `moment` é usado pelas views de calendário/timeline.
