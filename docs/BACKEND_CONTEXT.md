# Contexto do Backend (`apps/api`)

Guia de abordagem para trabalhar no backend do NOMA. Complementa o
[`CLAUDE.md`](../CLAUDE.md) raiz (visão do monorepo) e o
[`FRONTEND_CONTEXT.md`](./FRONTEND_CONTEXT.md). Foco: **como o backend está
montado hoje na `main`**, convenções, pegadinhas e receitas.

> Verificado contra o código em `main`. Onde o `CLAUDE.md` raiz diverge do
> estado atual, este documento é a fonte mais recente (ver
> [Divergências com o CLAUDE.md](#divergências-com-o-claudemd)).

---

## 1. Stack e visão geral

- **NestJS 10** (REST), build com **webpack**, porta **3001**.
- Prefixo global **`/api`** em todas as rotas ([`main.ts`](../apps/api/src/main.ts)).
- Swagger em **`/api/docs`** (título "NexORA API" — branding antigo, mesmo projeto).
- Persistência: **PostgreSQL via Prisma** (`provider = "postgresql"` em
  [`schema.prisma`](../packages/database/prisma/schema.prisma)). O schema mora em
  `packages/database`, mas a API o referencia por caminho relativo.
- Tempo real: **Socket.io** ([`modules/websocket`](../apps/api/src/modules/websocket)).
- Ativos de fato: REST + Prisma/Postgres + Socket.io + **OpenAI** (módulo `ai`,
  gated por `OPENAI_API_KEY`) + **nodemailer** + integrações
  ([`integrations/services/`](../apps/api/src/modules/integrations/services)).

### `main.ts` — o que o boot faz (em ordem)
1. **Aborta se `JWT_SECRET` não estiver setado** (`process.exit(1)`).
2. `set('trust proxy', true)` — atrás do proxy do Railway, para `req.ip` refletir o `X-Forwarded-For`.
3. `helmet()` + `compression()`.
4. **CORS** restrito a `FRONTEND_URL` (default `http://localhost:3000`) + `https://noma-teal.vercel.app`, com `credentials: true`.
5. **`ValidationPipe` global**: `{ whitelist: true, transform: true, forbidNonWhitelisted: true }` — ver [pegadinha](#validationpipe-forbidnonwhitelisted).
6. Swagger em `api/docs`, depois `setGlobalPrefix('api')`.
7. `listen(PORT ?? 3001, '0.0.0.0')`.

---

## 2. Arquitetura e fluxo de dados

### Módulos montados (`app.module.ts`)
Ordem real de `imports`: `ConfigModule` (global, `.env`) → `ThrottlerModule`
→ `DatabaseModule.forRoot()` → `Auth`, `Users`, `Workspaces`, `Invites`,
`Projects`, `Tasks`, `Comments`, `Activities`, `Attachments`, `Search`,
`SavedFilters`, `Analytics`, `AI`, `Automation`, `Workflow`, `Integrations`,
`Routines`, `Websocket`.

Cada módulo segue o padrão Nest: **`controller` + `service` + `dto/` + `module`**.
Um módulo típico importa `DatabaseModule` (para `PrismaService`) e, se emite
eventos em tempo real, `WebsocketModule`:

```ts
// tasks.module.ts — molde recomendado
@Module({
  imports: [DatabaseModule, WebsocketModule],
  providers: [TasksService],
  controllers: [TasksController],
  exports: [TasksService], // exporte se outro módulo injeta o service
})
export class TasksModule {}
```

### Camada de dados: Prisma
- `PrismaService` ([`database/prisma.service.ts`](../apps/api/src/modules/database/prisma.service.ts))
  estende `PrismaClient`. Injete-o no service e use `this.prisma.<model>...`.
- **Tolerante a DB offline**: se `$connect()` falha no init, apenas loga um
  warning e o app continua — erros de query só aparecem em runtime. Não confie
  no boot para validar conexão.
- Prefira agregações no banco (`groupBy`/`count`/`_sum`) em vez de carregar tudo
  em memória — ver [`analytics.service.ts`](../apps/api/src/modules/analytics/analytics.service.ts)
  e `getDeliveryStats` em [`tasks.service.ts`](../apps/api/src/modules/tasks/tasks.service.ts) como referência.

### Autenticação (duas camadas — ponto crítico)
O backend é o **único emissor do JWT real**; o frontend (NextAuth) apenas
envelopa esse token. Ao mexer em auth, mantenha os dois lados coerentes
(ver `FRONTEND_CONTEXT.md`).

- [`auth.controller.ts`](../apps/api/src/modules/auth/auth.controller.ts) expõe
  `POST /api/auth/{login,register,google,refresh,logout}`.
- JWT via `@nestjs/jwt` + Passport (`passport-jwt`/`passport-local`), senha com bcrypt.
- **Shape de `req.user`** (vem de `jwt.strategy.ts` `validate`): `{ userId, email, workspaceId }`.
  O payload do token usa `sub`, que a strategy mapeia para `userId`. **Nos
  controllers use sempre `req.user.userId`** (não `req.user.sub`).
- Google: `POST /api/auth/google` recebe `id_token`/`access_token` e os verifica
  server-side contra a Google (`tokeninfo`/`userinfo`), checando `aud` e
  `email_verified`.
- Registro grava um evento de signup em **`AuditLog`** (metadata JSON) — é a base
  do painel de métricas de signup no `AnalyticsService`.

### Rate limiting (ATIVO — só nas rotas de auth)
Configurado em `ThrottlerModule.forRoot` com **dois throttlers nomeados**:
- **`default`** — por IP do cliente. `getTracker` resolve o **IP público mais à
  direita do `X-Forwarded-For`** (o que a borda do Railway anexa). IPs privados à
  direita são ignorados; XFF forjado pelo cliente fica à esquerda e também é
  ignorado → resistente a spoofing. (`req.ip` sozinho não funciona: a borda do
  Railway rotaciona o IP a cada request.)
- **`account`** — por **email do body** (lowercased/trim), 10 tentativas / 15 min.
  `skipIf` pula quando não há email (ex.: login Google). Protege contra
  brute-force **distribuído** (muitos IPs contra a mesma conta).

Aplicado por rota via `@UseGuards(ThrottlerGuard)` + `@Throttle(...)`:
`login` 5/min (+account), `register` 3/min (+account), `google` 10/min.
**Não há guard global** — as demais rotas não têm throttling.

### WebSocket
[`modules/websocket`](../apps/api/src/modules/websocket) (socket.io) emite eventos
de task/comentário, presença e notificações por usuário. Services que mutam dados
relevantes (ex.: `TasksService`) injetam o gateway para emitir. **Não há
endpoint REST de notificações** — notificação é só via WebSocket, em memória.

---

## 3. Convenções e padrões

- **Idioma**: código, commits e UI em **pt-BR**. Mensagens de commit em português.
- **Pacotes**: namespace antigo `@nexora/*`. Use `pnpm --filter @nexora/api ...`.
- **DTOs**: em `dto/`, com `class-validator`/`class-transformer`
  (ex.: [`task-filter.dto.ts`](../apps/api/src/modules/tasks/dto/task-filter.dto.ts)).
  Rotas de auth usam `@Body('campo')` inline (sem classe DTO) de propósito — ver pegadinha.
- **Controllers**: `@Controller('<recurso>')` **sem** o prefixo `api/` (o prefixo
  global já adiciona). Proteja rotas autenticadas com
  `@UseGuards(JwtAuthGuard)` e leia o usuário via `@Req() req` → `req.user.userId`.
- **Ordem de rotas importa**: rotas estáticas (`/tasks/stats`, `/tasks/time-report`)
  devem vir **antes** de `/:id`, senão o param `:id` as captura. Já houve bug assim.
- **Swagger**: anote com `@ApiTags`, `@ApiOperation`, `@ApiBody`/`@ApiBearerAuth`.
- **Schema Prisma**: workflow é **`prisma db push`**, não migrations versionadas.
  Ao mudar o schema, edite `schema.prisma` e rode `pnpm --filter @nexora/api db:migrate`
  (que é `db push`). O container roda `prisma db push --accept-data-loss` no boot.
  Criar pasta de migration é opcional/histórico.

---

## 4. Pegadinhas e armadilhas

### `ValidationPipe` forbidNonWhitelisted
O pipe global rejeita **propriedades extras** no body **quando há uma classe DTO**
com decorators. Controllers que recebem body via `@Body('campo')` (auth, alguns de
tasks) não sofrem isso, mas ao **adicionar um campo novo** a um endpoint com DTO,
adicione o campo (com decorator) no DTO — senão vem `400`.

### `PermissionsModule` NÃO está montado
A pasta [`modules/permissions/`](../apps/api/src/modules/permissions) (RolesService,
`PermissionsGuard`, `@RequirePermission`, guest-access, audit-log) **compila mas
não está nos `imports` do `app.module`**. As rotas `/permissions/*` não sobem e o
sistema de permissões granulares é **código morto no app em execução**. Para usar,
adicione o módulo aos `imports` primeiro.

### Dependências declaradas mas INATIVAS
Não assuma que funcionam:
- **GraphQL/Apollo**: `GraphQLModule.forRoot` está **comentado**. A API é **REST**.
- **MongoDB** (`mongoose`), **Elasticsearch**, **Bull/Redis queues**: declarados,
  sem wiring efetivo. A busca (`search`) roda sobre **Postgres**.

### `PrismaService` tolera DB offline
Boot com DB indisponível só gera warning. Não use "subiu sem erro" como prova de
que o banco está conectado.

### Rate limiting é só em `/api/auth/*`
Não há guard global. Se precisar limitar outra rota, aplique `ThrottlerGuard`
explicitamente. Ao testar em produção atrás do Railway, valide o comportamento do
`getTracker` (IP real via XFF), não `req.ip`.

### Prefixo `/api/api` — JÁ CORRIGIDO (não recrie)
`comments`, `activities` e `attachments` **já usam** `@Controller('comments'|...)`.
Se você declarar `@Controller('api/comments')`, o prefixo global duplica e a rota
vira `/api/api/comments`. Sempre omita o `api/` no decorator.

---

## 5. Receitas de tarefas comuns

### Adicionar um novo módulo
1. `apps/api/src/modules/<nome>/` com `*.module.ts`, `*.controller.ts`,
   `*.service.ts` e `dto/` (siga o molde de `tasks.module.ts`).
2. Injete `PrismaService` (importe `DatabaseModule`); importe `WebsocketModule` se
   for emitir eventos.
3. **Registre o módulo em [`app.module.ts`](../apps/api/src/modules)** nos `imports`
   (é o passo esquecido com mais frequência — sem isso as rotas não sobem).
4. Se mexer no modelo de dados, edite `schema.prisma` e rode `db:migrate` (push).

### Adicionar um endpoint autenticado
```ts
@ApiTags('exemplo')
@Controller('exemplo')            // sem 'api/'
@UseGuards(JwtAuthGuard)          // no controller ou por rota
export class ExemploController {
  constructor(private readonly service: ExemploService) {}

  @Get(':id')
  async getOne(@Param('id') id: string, @Req() req: any) {
    return this.service.getOne(id, req.user.userId); // sempre userId
  }

  @Post()
  async create(@Body() dto: CreateExemploDto) {      // DTO com class-validator
    return this.service.create(dto);
  }
}
```
- Coloque rotas estáticas antes de `/:id`.
- Se o service precisa checar acesso a workspace, siga o padrão
  `verifyWorkspaceAccess(workspaceId, userId)` do `AnalyticsService`.

### Alterar o schema do banco
1. Edite [`schema.prisma`](../packages/database/prisma/schema.prisma).
2. `pnpm --filter @nexora/api db:migrate` (roda `prisma db push`).
3. `pnpm --filter @nexora/database db:seed` se precisar de dados.
4. `postinstall` roda `prisma generate`; se o client não atualizar, rode manualmente.

### Rodar um teste isolado
```bash
pnpm --filter @nexora/api test -- tasks.service.spec.ts     # 1 arquivo
pnpm --filter @nexora/api test -- -t "nome do teste"        # por nome
pnpm --filter @nexora/api test:e2e                          # e2e
```

---

## Divergências com o `CLAUDE.md`
O `CLAUDE.md` raiz descreve dois pontos como **gargalos atuais** que já foram
resolvidos na `main` (contexto histórico, não estado atual):
- "Rate limiting inerte" → **hoje está ATIVO** nas rotas de auth (seção 2).
- "Prefixo duplicado `/api/api`" em comments/activities/attachments → **corrigido**
  (seção 4).

Seguem válidos: `PermissionsModule` desmontado, GraphQL/Mongo/ES/Bull inativos,
`ValidationPipe forbidNonWhitelisted`, `PrismaService` tolera offline, workflow `db push`.
