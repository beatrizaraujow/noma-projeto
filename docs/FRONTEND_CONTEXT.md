# Contexto do Frontend (`apps/web`)

Guia de abordagem para trabalhar no frontend do NOMA. Complementa o
[`CLAUDE.md`](../CLAUDE.md) raiz (visão do monorepo) e o
[`BACKEND_CONTEXT.md`](./BACKEND_CONTEXT.md). Foco: **como o frontend está montado
hoje na `main`**, convenções, pegadinhas e receitas.

> Verificado contra o código em `main`.

---

## 1. Stack e visão geral

- **Next.js 14 (App Router)** + **React 18**, porta **3000**.
- Path alias: **`@/* → apps/web/src/*`**.
- Data layer: **TanStack React Query** sobre um cliente **axios** central.
- Auth: **NextAuth** que envelopa o JWT emitido pelo backend (ver seção 2).
- Estilo: **Tailwind** (`darkMode: 'class'`), design system em `@nexora/ui`
  (transpilado via `transpilePackages`).
- Estado global: **React Context** (tema, toast, onboarding). **Zustand está no
  `package.json` mas NÃO é usado** — não crie stores assumindo que já existem.

### Estrutura de `apps/web/src`
```
app/                 # App Router (rotas)
  (auth)/            # login, signup, forgot-password (route group, sem prefixo na URL)
  workspaces/[id]/   # SUPERFÍCIE PRINCIPAL e ativa (tasks, routines, analytics, ...)
  projects/[id]/     # superfície LEGADA (ViewSwitcher: kanban/lista/calendário/timeline)
  dashboard/ analytics/ settings/ onboarding/ invite/ showcase/ ...
  api/               # route handlers do Next (auth/[...nextauth], register, google-origin, search, saved-filters)
  layout.tsx  providers.tsx  page.tsx  globals.css
components/
  common/   # UI base movida para cá (era 'ui'); a11y, animations, theme
  features/ # componentes por domínio: tasks, projects, dashboard, analytics, automation, ai, integrations, workspace, onboarding
  layout/   # Sidebar, mobile, etc.
hooks/      # useQueries.ts (data layer), useWebSocket.ts, e hooks de UX (responsive, swipe, focus-trap...)
lib/        # api-client.ts, query-config.ts, auth-options.ts, signup-origin.ts, utils.ts, design-system.ts
contexts/   # ThemeContext.tsx
```

---

## 2. Arquitetura e fluxo de dados

### Camada de dados: React Query + axios
Fluxo canônico: **componente → hook em [`useQueries.ts`](../apps/web/src/hooks/useQueries.ts)
→ objeto `api` em [`api-client.ts`](../apps/web/src/lib/api-client.ts) → backend**.

- **[`api-client.ts`](../apps/web/src/lib/api-client.ts)**: instância axios com
  `baseURL = NEXT_PUBLIC_API_URL` (host **sem** `/api`). Um **request interceptor**
  chama `getSession()` e injeta `Authorization: Bearer <accessToken>`. Um
  **response interceptor** redireciona para `/login` em `401`. O objeto `api`
  namespaceia todos os endpoints com o prefixo **`/api/...`** — **use sempre esse
  objeto**, não monte URLs à mão.
- **[`query-config.ts`](../apps/web/src/lib/query-config.ts)**: fonte única de
  `queryKeys` (chaves estruturadas), `queryConfig` (staleTime/gcTime por entidade),
  `invalidationHelpers` e `optimisticHelpers`. Sempre reutilize `queryKeys` — não
  invente arrays de chave soltos (quebra invalidação).
- **[`useQueries.ts`](../apps/web/src/hooks/useQueries.ts)**: hooks tipados
  (`useWorkspaces`, `useProjects`, `useTasks`, ...). `useCreateTask`/`useUpdateTask`
  usam **optimistic updates** (padrão `onMutate` → snapshot → `setQueryData` →
  `onError` rollback → `onSuccess` invalidate). Alguns hooks fazem **prefetch**
  (ex.: `useProject` popula o cache de tasks).

### Autenticação (NextAuth envelopando o JWT do backend)
- [`auth-options.ts`](../apps/web/src/lib/auth-options.ts):
  - **`CredentialsProvider`** faz `POST ${API_URL}/api/auth/login` e guarda o
    `access_token` no token do NextAuth.
  - **`GoogleProvider`** é condicional: só entra se `GOOGLE_CLIENT_ID`+`SECRET`
    existirem. No callback JWT, troca o token Google por um JWT do backend via
    `POST /api/auth/google`, repassando o `origin` de signup (cookie, ver adiante).
  - **Callback `jwt`**: guarda `expiresAt`; pula refresh se falta > 1 dia; senão
    renova via `POST /api/auth/refresh`. Erros viram `token.error`
    (`RefreshTokenError`/`GoogleTokenExchangeError`).
  - **Callback `session`**: expõe `session.accessToken` e `session.workspace` ao client.
- [`api/auth/[...nextauth]/route.ts`](../apps/web/src/app/api/auth/%5B...nextauth%5D/route.ts)
  só monta o handler a partir de `authOptions`.
- **Signup origin**: [`signup-origin.ts`](../apps/web/src/lib/signup-origin.ts)
  normaliza origem (source/utm/campaign/invite). Para email, vai no body do
  `register`; para Google, é persistido num cookie (`persistGoogleSignupOrigin` →
  `POST /api/auth/google-origin`) e consumido no callback JWT. Alimenta as métricas
  de signup do backend.

### Tempo real
[`useWebSocket.ts`](../apps/web/src/hooks/useWebSocket.ts) (socket.io-client) conecta
ao gateway do backend para eventos de task/comentário, presença e notificações por
usuário. Combine com `invalidateQueries` para refletir mudanças remotas no cache.

### Providers e tema
- [`providers.tsx`](../apps/web/src/app/providers.tsx) monta o `QueryClientProvider`
  (React Query) e demais contexts.
- Tema via [`ThemeContext`](../apps/web/src/contexts/ThemeContext.tsx)
  (localStorage `noma-theme-mode`), **não** `next-themes`. Tailwind com
  `darkMode: 'class'`.

---

## 3. Convenções e padrões

- **Idioma**: código, commits e **UI em pt-BR**.
- **Data fetching**: SEMPRE via hook em `useQueries.ts` + objeto `api`. Não chame
  `axios`/`fetch` cru em componente (exceto route handlers do Next em `app/api/*`).
- **Query keys**: use e estenda `queryKeys` de `query-config.ts`; reaproveite os
  `queryConfig.entities.*` para staleTime/gcTime consistentes.
- **Ícones**: prefira **lucide-react**. Há duas libs phosphor legadas no bundle —
  **não adicione mais**.
- **Datas**: `dayjs` e `moment` coexistem; `moment` é usado pelas views de
  calendário/timeline (superfície legada de projetos).
- **Design system**: componentes reutilizáveis do `@nexora/ui` vivem em
  `packages/ui/components/` (**não** `packages/ui/src/`). Componentes de domínio
  ficam em `apps/web/src/components/features/`.
- **Superfície de tarefas**: prefira **`/workspaces/[id]/*`** (ativa) para features
  novas. `/projects/[id]` é legada (mantida, mas não é onde o dev recente acontece).

---

## 4. Pegadinhas e armadilhas

### `NEXT_PUBLIC_API_URL` é o host SEM `/api`
O `api-client` adiciona `/api` em cada método. Se você setar
`NEXT_PUBLIC_API_URL=https://host/api`, as chamadas viram `/api/api/...` e quebram.
Valor correto: **`https://host`** (sem `/api`).

### Um único esquema de URL (`/api`)
Todo o frontend usa `${API_URL}/api/<recurso>`. Antes havia mistura (`/tasks` sem
`/api` e `/api/comments` com), que nunca funcionava com um valor único de env. Ao
adicionar chamadas, mantenha o prefixo `/api` (o objeto `api` já garante isso).

### Zustand NÃO é usado
Está no `package.json`, mas o estado global é React Context. Não introduza stores
Zustand assumindo que a infra existe.

### `getSession()` a cada request
O request interceptor chama `getSession()` por request. Em loops de muitas chamadas,
prefira agrupar via React Query (cache) a disparar N requests independentes.

### `session.accessToken` / `session.error`
São expostos via cast (`(session as any)`), tipados em
[`types/next-auth.d.ts`](../apps/web/src/types/next-auth.d.ts). Trate
`session.error` (ex.: `RefreshTokenError`) para deslogar/re-autenticar quando o
refresh falhar.

### Renomeações incompletas
Você verá **"NexORA"** (Swagger) e **"NUMA"** (manifest PWA) em textos — é o mesmo
projeto (NOMA). Ao criar UI nova, use **NOMA**.

---

## 5. Receitas de tarefas comuns

### Adicionar um endpoint no cliente + hook de leitura
1. Em [`api-client.ts`](../apps/web/src/lib/api-client.ts), adicione o método no
   objeto `api` (mantenha o prefixo `/api`):
   ```ts
   exemplos: {
     list: (workspaceId: string) => apiClient.get(`/api/exemplos?workspaceId=${workspaceId}`),
   },
   ```
2. Em [`query-config.ts`](../apps/web/src/lib/query-config.ts), adicione a chave em
   `queryKeys` (e um preset em `queryConfig.entities` se fizer sentido).
3. Em [`useQueries.ts`](../apps/web/src/hooks/useQueries.ts), crie o hook:
   ```ts
   export function useExemplos(workspaceId: string) {
     return useQuery({
       queryKey: queryKeys.exemplos.all(workspaceId),
       queryFn: async () => (await api.exemplos.list(workspaceId)).data,
       ...queryConfig.entities.projects, // ou o preset adequado
       enabled: !!workspaceId,
     });
   }
   ```

### Adicionar uma mutação com optimistic update
Copie o padrão de `useCreateTask`/`useUpdateTask`: `onMutate` (cancelQueries →
snapshot via `getQueryData` → `setQueryData` otimista) → `onError` (rollback com o
snapshot) → `onSuccess` (`invalidateQueries` ou `invalidationHelpers.*`). Use
`invalidationHelpers.invalidateProject/invalidateWorkspace` para invalidar em bloco.

### Adicionar uma página (superfície workspaces)
1. Crie `apps/web/src/app/workspaces/[id]/<rota>/page.tsx`.
2. Consuma dados via hooks de `useQueries.ts` (nunca `fetch` cru).
3. Reaproveite `Sidebar` de [`components/layout`](../apps/web/src/components/layout)
   e componentes de `components/features/<domínio>`.
4. UI em pt-BR; ícones `lucide-react`; classes Tailwind com suporte a dark
   (`dark:` já habilitado por `darkMode: 'class'`).

### Rodar testes do frontend
```bash
pnpm --filter @nexora/web test -- CustomDashboardWidgets   # jest por nome de arquivo
pnpm --filter @nexora/web exec cypress open                # Cypress (E2E)
```

---

## Ver também
- [`BACKEND_CONTEXT.md`](./BACKEND_CONTEXT.md) — o outro lado da auth em duas camadas
  e dos endpoints `/api/*`.
- [`CLAUDE.md`](../CLAUDE.md) — visão do monorepo, comandos e deploy.
