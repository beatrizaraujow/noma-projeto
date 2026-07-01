# NOMA — Plataforma de Gestão de Projetos e Tarefas

Plataforma web para **gestão de projetos e tarefas** no estilo ClickUp/Notion, com **colaboração em tempo real**, arquitetura em **monorepo** e stack TypeScript de ponta a ponta.

> **Nomes vs. branding:** o produto é **NOMA**, mas o código ainda usa o namespace legado **`@nexora/*`**. Você verá "NexORA" (Swagger) e "NUMA" (manifest PWA) em alguns textos — é o mesmo projeto, renomeações incompletas.

---

## Visão geral

- **Frontend** — Next.js 14 (App Router) + React 18, na porta **3000**.
- **Backend** — NestJS 10, API **REST** (build via webpack), na porta **3001**. Swagger em `/api/docs`.
- **Tempo real** — WebSockets via Socket.io (eventos de tarefa/comentário, presença e notificações por usuário).
- **Persistência** — PostgreSQL via **Prisma** (fonte única do modelo de dados).
- **Monorepo** — Turborepo com apps e pacotes compartilhados.

---

## Stack real (o que está de fato ativo)

| Camada | Tecnologia |
| --- | --- |
| Frontend | Next.js 14 (App Router), React 18, TypeScript |
| Estilo/UI | Tailwind CSS + Radix + CVA (design system próprio em `packages/ui`) |
| Estado (frontend) | React Context + **TanStack Query** (dados) sobre axios |
| Backend | NestJS 10 (REST), Passport (JWT + local), bcrypt |
| Banco | PostgreSQL + Prisma (~35 models) |
| Tempo real | Socket.io |
| IA | OpenAI (`gpt-3.5-turbo`, ativado por `OPENAI_API_KEY`) |
| E-mail | Nodemailer |
| Integrações | GitHub, Slack, Discord, Figma, Calendar, Cloud Storage, Webhook |

> **Dependências presentes mas NÃO ativas:** GraphQL/Apollo (`GraphQLModule` está comentado — a API é **REST**), MongoDB/Mongoose, Elasticsearch e Bull/Redis queues estão declarados no `package.json` mas **sem wiring efetivo**. A busca roda sobre Postgres. Zustand está instalado mas **não é usado** — o estado global é React Context.

---

## Estrutura do projeto

```text
.
├── apps/
│   ├── web/          # Frontend Next.js (porta 3000)   → @nexora/web
│   └── api/          # Backend NestJS  (porta 3001)     → @nexora/api
├── packages/
│   ├── database/     # Schema Prisma + client Postgres  → @nexora/database
│   ├── ui/           # Design system (Radix + CVA)      → @nexora/ui
│   ├── types/        # Tipos compartilhados web ↔ api    → @nexora/types
│   └── config/       # Configs base (eslint/tsconfig/tw) → @nexora/config
├── docs/             # Documentação de referência
├── turbo.json
└── package.json
```

---

## Como rodar (desenvolvimento)

Pré-requisitos: **Node ≥18/20**, **pnpm 8.12**, **Docker** (para Postgres/Redis locais).

```bash
pnpm install                 # instala tudo (postinstall roda `prisma generate`)
docker-compose up -d         # sobe Postgres 16 (:5432) e Redis 7 (:6379)

# copie e preencha os arquivos de ambiente (veja abaixo)
cp .env.example .env

pnpm dev                     # roda web + api juntos (turbo)
# ou individualmente:
pnpm dev:web                 # só o frontend  → http://localhost:3000
pnpm dev:api                 # só o backend   → http://localhost:3001/api
```

### Banco de dados

O schema fica em `packages/database/prisma/schema.prisma`. O fluxo é **`prisma db push`** (não migrations versionadas):

```bash
pnpm --filter @nexora/api db:migrate     # sincroniza o schema (db push)
pnpm --filter @nexora/api db:studio      # Prisma Studio
pnpm --filter @nexora/database db:seed   # popula dados de exemplo
```

### Scripts úteis

```bash
pnpm build          # build de todo o monorepo (turbo)
pnpm lint           # lint em todos os pacotes
pnpm test           # testes em todos os pacotes
pnpm format         # prettier
pnpm deploy:check   # lint + test + build (rode antes de mudanças grandes)
```

---

## Variáveis de ambiente

Os valores reais **nunca** vão para o Git. Cada `.env` tem um `.env.example` correspondente com placeholders:

| Arquivo | Uso |
| --- | --- |
| `.env.example` / `.env` | Raiz (docker-compose / dev geral) |
| `apps/api/.env.example` | Backend: `DATABASE_URL`, `JWT_SECRET`, OAuth, `OPENAI_API_KEY`, SMTP |
| `apps/web/.env.example` | Frontend: `NEXTAUTH_SECRET`, URL da API, OAuth |
| `.env.prod.example` | Referência para produção |

> ⚠️ O backend **aborta o boot se `JWT_SECRET` não estiver definido**. Gere segredos fortes:
> `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`

Detalhes de segurança para deploy: [SECURITY_DEPLOY.md](SECURITY_DEPLOY.md) e [SECURITY.md](SECURITY.md).

---

## Autenticação (duas camadas)

O frontend **não emite tokens próprios** — ele envelopa o JWT do backend:

1. **NestJS** emite o JWT real (`@nestjs/jwt` + Passport, bcrypt, refresh token).
2. **NextAuth** (`CredentialsProvider`) faz POST para `/api/auth/login` e guarda o `access_token`; renova via `/api/auth/refresh`.
3. O **axios** injeta `Bearer <accessToken>` em toda request; `401` redireciona para `/login`.

---

## Deploy

- **Frontend → Vercel** (`apps/web/vercel.json`).
- **Backend → Railway** via `apps/api/Dockerfile` (`prisma db push` no boot). O domínio do Railway **deve apontar para a porta 3001** — porta errada causa `502`.
- **CI** — GitHub Actions (`.github/workflows/ci-cd.yml`): lint → type-check → test → build em push/PR para `main`/`develop`.

Checklist de deploy: [docs/DEPLOY_CHECKLIST.md](docs/DEPLOY_CHECKLIST.md).

---

## Documentação

| Tema | Arquivo |
| --- | --- |
| Arquitetura geral | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) |
| Referência da API | [docs/API.md](docs/API.md) |
| Design system / UI | [docs/DESIGN_SYSTEM.md](docs/DESIGN_SYSTEM.md) · [docs/COMPONENT_LIBRARY.md](docs/COMPONENT_LIBRARY.md) |
| Tarefas e views | [docs/TASK_DETAIL.md](docs/TASK_DETAIL.md) · [docs/MULTIPLE_VIEWS.md](docs/MULTIPLE_VIEWS.md) · [docs/KANBAN_BOARD.md](docs/KANBAN_BOARD.md) |
| Workspaces / Projetos | [docs/WORKSPACE_PROJECTS.md](docs/WORKSPACE_PROJECTS.md) |
| Tempo real | [docs/REALTIME.md](docs/REALTIME.md) |
| IA | [docs/AI_FEATURES.md](docs/AI_FEATURES.md) |
| Automação / Workflow | [docs/AUTOMATION_FEATURES.md](docs/AUTOMATION_FEATURES.md) · [docs/WORKFLOW_BUILDER.md](docs/WORKFLOW_BUILDER.md) |
| Integrações | [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) |
| Autenticação / Onboarding | [docs/AUTH_ONBOARDING.md](docs/AUTH_ONBOARDING.md) |
| Analytics | [docs/DASHBOARD_ANALYTICS.md](docs/DASHBOARD_ANALYTICS.md) |
| Busca e filtros | [docs/SEARCH_AND_FILTERS.md](docs/SEARCH_AND_FILTERS.md) |

> **Nota:** o módulo de permissões granulares (`docs/PERMISSIONS_SYSTEM.md`) existe no código mas **ainda não está montado** no app em execução.

---

## Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md). Código, commits e UI são em **português (pt-BR)**; commits seguem [Conventional Commits](https://www.conventionalcommits.org/).

## Licença

[MIT](LICENSE).
