# Arquitetura do NOMA

> O produto é **NOMA**; o código usa o namespace legado **`@nexora/*`**. Este documento descreve a arquitetura **real e em execução** — dependências declaradas mas inativas estão marcadas explicitamente.

## Visão geral

NOMA é uma plataforma de gestão de projetos e tarefas (estilo ClickUp) construída como **monorepo Turborepo** com dois apps sobre pacotes compartilhados. **Não** é uma arquitetura de microsserviços — são dois serviços (web + api) mais o banco.

## Camadas

### 1. Frontend (`apps/web`)
- **Framework:** Next.js 14 (App Router) + React 18 — porta 3000
- **Estado:** React Context (`ThemeContext`, Toast, Onboarding) + **TanStack Query** para dados de servidor
  - Zustand está no `package.json` mas **NÃO é usado**.
- **Dados:** axios (`src/lib/api-client.ts`) com `Bearer <accessToken>`; `useCreateTask`/`useUpdateTask` usam optimistic updates
- **Tempo real:** cliente Socket.io (`src/hooks/useWebSocket.ts`)
- **Estilo:** Tailwind CSS + Radix + CVA (design system em `packages/ui`)
  - Não usa Shadcn/ui nem next-themes; o tema vem do `ThemeContext` (localStorage `noma-theme-mode`).

### 2. Backend (`apps/api`)
- **Framework:** NestJS 10 (modular), build via webpack — porta 3001, prefixo global `/api`, Swagger em `/api/docs`
- **API:** **REST** (única ativa)
  - GraphQL/Apollo (`GraphQLModule.forRoot`) está **comentado** em `app.module.ts`.
  - WebSockets via Socket.io para eventos de task/comentário, presença e notificações.
- **Autenticação:** JWT (`@nestjs/jwt`) + Passport (`passport-jwt`/`passport-local`), bcrypt, refresh token. `main.ts` aborta o boot se `JWT_SECRET` não estiver definido.
- **Autorização:** verificação por usuário/membership nos services. O módulo de permissões granulares (`modules/permissions`, RBAC) existe mas **NÃO está registrado** em `app.module.ts` — é código morto no app em execução.

### 3. Dados
- **PostgreSQL via Prisma** (`packages/database`) é a fonte única do modelo (~35 models).
- **NÃO ativos** (declarados no `package.json`, sem wiring efetivo): MongoDB/Mongoose, Elasticsearch, Bull/Redis queues. A busca (`modules/search`) roda sobre Postgres.
- **Fluxo de schema:** `prisma db push` (não migrations versionadas). O container da API roda `prisma db push --accept-data-loss` no boot.

```
┌──────────────┐     REST /api      ┌──────────────┐    Prisma    ┌────────────┐
│  apps/web    │ ─────────────────▶ │  apps/api    │ ───────────▶ │ PostgreSQL │
│  Next.js     │ ◀───────────────── │  NestJS      │ ◀─────────── │            │
│  (3000)      │     Socket.io      │  (3001)      │              └────────────┘
└──────────────┘                    └──────────────┘
```

## Fluxo de requisição (REST)

```
Cliente (React Query → axios, Bearer token)
    ↓
NestJS Controller  (ValidationPipe global: whitelist + forbidNonWhitelisted)
    ↓
Service (regra de negócio + verificação de acesso)
    ↓
PrismaService
    ↓
PostgreSQL
    ↓
Resposta → invalidação de cache no React Query
```

## Fluxo WebSocket

```
Conexão do cliente → Socket.io Gateway → autenticação →
join room (workspace/task) → handlers de evento → broadcast para a room → update em tempo real
```

## Módulos do backend

`apps/api/src/modules/`: `auth`, `users`, `workspaces`, `invites`, `projects`, `tasks`, `routines`,
`comments`, `activities`, `attachments`, `search`, `saved-filters`, `analytics`, `ai`,
`automation`, `workflow`, `integrations`, `permissions`*, `websocket`, `database`.

\* `permissions` não está montado (ver acima).

**Pegadinhas conhecidas:**
- `comments`, `activities` e `attachments` declaram `@Controller('api/...')`, então com o prefixo global o caminho real fica **`/api/api/...`**.
- `ThrottlerModule` está configurado, mas nenhum `ThrottlerGuard` é aplicado — **não há rate limiting efetivo**.
- `PrismaService` tolera DB offline no init (só warning); erros de query só aparecem em runtime.

## Estrutura do frontend

```
apps/web/src/
├── app/               # Next.js App Router
│   ├── workspaces/    # superfície principal (estilo ClickUp): tasks, routines, analytics
│   └── projects/      # superfície legada com ViewSwitcher (Kanban/Lista/Calendário/Timeline)
├── components/        # componentes de feature/layout
├── hooks/             # useQueries (React Query), useWebSocket
└── lib/               # api-client (axios), auth-options (NextAuth), query-config
```

> Duas superfícies de tarefas coexistem. Prefira `workspaces` para features novas.

## Pacotes compartilhados

| Pacote | Conteúdo |
| --- | --- |
| `@nexora/database` | Schema Prisma + client Postgres (fonte do modelo) |
| `@nexora/ui` | Design system Radix + CVA + Tailwind (componentes em `packages/ui/components/`) |
| `@nexora/types` | Tipos compartilhados web ↔ api |
| `@nexora/config` | Configs base de eslint/tsconfig/tailwind |

## Autenticação (duas camadas)

```
1. Login → NextAuth CredentialsProvider faz POST /api/auth/login (backend)
2. Backend valida (bcrypt) e emite JWT real (access + refresh)
3. NextAuth guarda o access_token na sessão; callback JWT renova via /api/auth/refresh
4. axios injeta Bearer <accessToken> em toda request
5. 401 → redireciona para /login
```

Ao mexer em auth, **os dois lados precisam estar coerentes**.

## Deploy

- **Frontend → Vercel** (`apps/web/vercel.json`).
- **Backend → Railway** via `apps/api/Dockerfile` (node:20-alpine, `prisma db push` no boot, `node dist/main`). O domínio do Railway **deve apontar para a porta 3001** — porta errada causa 502.
- **CI:** GitHub Actions (`.github/workflows/ci-cd.yml`): lint → type-check → test → build.

## Decisões de tecnologia

- **Turborepo** — builds incrementais e execução paralela no monorepo.
- **Next.js 14** — App Router, SSR/SSG, ótimo DX.
- **NestJS** — TypeScript-first, arquitetura modular, DI.
- **PostgreSQL + Prisma** — ACID, type-safety, prevenção de SQL injection.

## Melhorias futuras (não implementadas)

- [ ] Ativar/registrar o módulo de permissões (RBAC granular)
- [ ] Aplicar `ThrottlerGuard` para rate limiting efetivo
- [ ] Corrigir prefixo duplicado `/api/api/*` em comments/activities/attachments
- [ ] Migrar para migrations versionadas do Prisma (hoje é `db push`)
