# Backend temporário no Render — substituindo o Railway

> **Objetivo:** voltar a rodar testes com o NOMA rapidamente, sem domínio próprio.
> **Frontend:** continua em https://noma-ashy.vercel.app (Vercel).
> **Provisório:** o destino é o VPS Hostinger — ver [RUNBOOK_HOSTINGER.md](RUNBOOK_HOSTINGER.md).

---

## Por que Render, e não qualquer plataforma

Duas restrições do NOMA eliminam quase todas as opções:

| Restrição | O que ela descarta |
|---|---|
| A API mantém conexões **Socket.io** abertas | Serverless — Vercel Functions, Cloudflare Workers, Netlify Functions. Não existe processo persistente lá |
| O frontend é **HTTPS** e o [api-client.ts](../apps/web/src/lib/api-client.ts) roda **no navegador** | Qualquer backend em HTTP puro, inclusive "aponta para o IP do VPS". O navegador bloqueia como *mixed content* |

A segunda é a mais traiçoeira: as chamadas server-side do NextAuth **funcionariam** por HTTP, então o login passaria e o resto do app quebraria. Falhar no login é melhor que isso.

Render atende as duas: processo persistente e HTTPS automático em `*.onrender.com`, sem trabalho de DNS.

---

## O banco fica fora do Render, de propósito

**Postgres no [Neon](https://neon.tech), não no Render.** Não é preferência — é para não migrar dados duas vezes. Compute é descartável; dado não é. Quando o backend migrar para o Hostinger, só o compute muda e o `DATABASE_URL` continua o mesmo.

E tem um efeito que vale além do provisório. Se o banco ficar fora da máquina compartilhada permanentemente, o VPS deixa de pagar:

- 0,35 vCPU e 1 GB de RAM reservados ao Postgres
- a disputa de **I/O** com o ffmpeg do SB Clips
- o problema de **page cache** da §2.3 do [doc de infra](INFRA_COEXISTENCIA_SERVIDOR.md): quando o ffmpeg passa um vídeo de 2 GB pela máquina, o kernel despeja a cache do Postgres e o banco fica lento sem explicação aparente
- a exposição ao backup **semanal** do painel Hostinger, que hoje deixa até 7 dias de dados em risco

O custo honesto é latência de rede por query, contra ~0 num Postgres local. Para o volume atual do NOMA é irrelevante. Se um dia virar gargalo, mover para o container é uma mudança de `DATABASE_URL`.

---

## Passo a passo

### 1. Postgres no Neon

Crie um projeto e copie a connection string. **Use a conexão direta, não a pooled.**

O Neon oferece as duas. Elas se distinguem pelo host:

```
# DIRETA — use esta
postgresql://user:senha@ep-xxxx.us-east-2.aws.neon.tech/neondb?sslmode=require

# POOLED — NAO use
postgresql://user:senha@ep-xxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
                              ^^^^^^^
```

**Por que:** o [schema.prisma](../packages/database/prisma/schema.prisma) declara
apenas `url` no `datasource`, sem `directUrl`. A conexão pooled do Neon é
PgBouncer em modo transaction, que **não suporta** o que o `prisma db push`
precisa e atrapalha prepared statements no runtime. Com uma única URL declarada,
a direta é a que funciona nos dois casos.

Se algum dia o número de conexões virar gargalo, o caminho é declarar `directUrl`
no schema e usar a pooled em `url` com `?pgbouncer=true` — não trocar esta URL.

> O `sslmode=require` é obrigatório e já vem na string; o Prisma respeita.
>
> O `binaryTargets` do schema já inclui `linux-musl-openssl-3.0.x`, que é o
> necessário para a imagem Alpine. Nada a ajustar.

### 2. Serviço no Render

O [`render.yaml`](../render.yaml) na raiz é um Blueprint: **New > Blueprint**, apontando para este repositório. Ele já declara o Dockerfile, o health check, e gera o `JWT_SECRET` sozinho.

Ele vai pedir os valores marcados como `sync: false`:

| Variável | Valor |
|---|---|
| `DATABASE_URL` | a connection string do Neon |
| `CORS_ORIGINS` | vazio (ou outra URL da Vercel, se houver duas em uso) |
| `OPENAI_API_KEY` | vazio — sem ela o módulo `ai` fica desligado, comportamento esperado |

Anote a URL pública gerada, algo como `https://noma-api.onrender.com`.

### 3. Confirme que o backend subiu

```bash
curl -I https://noma-api.onrender.com/api/docs
# esperado: 200

curl -i -X POST https://noma-api.onrender.com/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"invalido@x.com","password":"errada"}'
# esperado: 401  <- um 401 aqui e SUCESSO: prova que a API respondeu
```

### 4. Aponte a Vercel para ele

No projeto `noma` da Vercel, em *Settings > Environment Variables*:

| Variável | Valor |
|---|---|
| `NEXT_PUBLIC_API_URL` | `https://noma-api.onrender.com` — **sem** `/api` no final |
| `NEXTAUTH_URL` | `https://noma-ashy.vercel.app` |
| `NEXTAUTH_SECRET` | um segredo forte (`openssl rand -base64 48`) |

> 🔴 **`NEXT_PUBLIC_API_URL` é inlinada no bundle em tempo de build.** Mudar o
> valor no painel **não tem efeito nenhum** sozinho — é obrigatório **redeploy**
> depois. Esta é a causa nº 1 de "mudei a variável e continua dando o mesmo erro".

Sem o sufixo `/api` porque o código monta `${API_URL}/api/...` — com ele viraria `/api/api`.

### 5. Crie o primeiro usuário

O seed (`db:seed`) usa `ts-node`, que é devDependency e **não existe na imagem de produção**. Use a própria API:

```bash
curl -X POST https://noma-api.onrender.com/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"voce@dominio.com","password":"SENHA_FORTE","name":"Seu Nome"}'
```

> O `ValidationPipe` global usa `forbidNonWhitelisted: true`: campo extra no body é **rejeitado**. Mande só o que o DTO aceita.

### 6. Desligue o push de schema

Depois do primeiro deploy, mude `RUN_DB_PUSH` para `false` no painel do Render. Deixar `true` faz o `prisma db push` rodar a cada restart; sem `DB_PUSH_ACCEPT_DATA_LOSS` ele **aborta em vez de destruir**, então não há perda silenciosa — mas o boot passa a falhar se houver drift, com causa pouco óbvia no log.

---

## Como saber se funcionou

Na tela de login, **com senha errada**, a mensagem tem que ser *"Email ou senha incorretos"*.

Isso é o teste decisivo porque as mensagens distinguem a causa ([auth-options.ts:79-99](../apps/web/src/lib/auth-options.ts#L79-L99)):

| Mensagem na tela | Significado |
|---|---|
| "Email ou senha incorretos" | ✅ **A API respondeu.** 401 — a conexão funciona |
| "Não foi possível conectar ao servidor agora" | ❌ Não abriu conexão. `NEXT_PUBLIC_API_URL` errada, ou faltou o redeploy |
| "O servidor teve um problema" | ⚠️ 5xx — a API respondeu mas quebrou. Quase sempre banco: cheque `DATABASE_URL` |
| "Muitas tentativas de login" | 429 — rate limit, espere ~1 min |

---

## Duas ressalvas do plano gratuito

1. **Hibernação.** O serviço free do Render dorme quando fica ocioso, e o cold start é lento. No login, isso aparece como uma primeira tentativa demorada ou com timeout. Para testes, aceitável; para uso real, é o plano pago mais barato. Confira os termos atuais no painel — eles mudam.

2. **Build no plano free pode ser apertado.** O `pnpm install` deste monorepo são ~1470 pacotes. Se o build estourar tempo ou memória, existe um caminho que evita isso: o workflow [build-images.yml](../.github/workflows/build-images.yml) já constrói e publica a imagem no GHCR — configure o Render para **deployar a imagem pronta** em vez de buildar. Some o limite de build e os deploys ficam muito mais rápidos.

---

## Quando o Hostinger entrar

O que muda, e o que não muda:

| Item | Muda? |
|---|---|
| `DATABASE_URL` (Neon) | ❌ continua igual — foi o motivo de não pôr o banco no Render |
| `NEXT_PUBLIC_API_URL` na Vercel | ✅ passa a `https://api.<seudominio>` + **redeploy** |
| `FRONTEND_URL` no backend | ✅ se o frontend também sair da Vercel |
| Imagem da API | ❌ a mesma do GHCR |

Registrar um domínio é o único pré-requisito que falta, e ele destrava o caminho definitivo.
