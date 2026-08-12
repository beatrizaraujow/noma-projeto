# syntax=docker/dockerfile:1

# =============================================================================
# NOMA - Web (Next.js 14 App Router)
#
# Nao existia Dockerfile para o frontend — ele saia pela Vercel. Este arquivo e
# infra nova, criada para levar o web ao VPS Hostinger.
#
# ATENCAO — as variaveis NEXT_PUBLIC_* sao inlinadas no bundle do cliente em
# TEMPO DE BUILD, nao lidas em runtime. Consequencia pratica: a imagem fica
# atrelada ao dominio. Trocar de dominio exige REBUILD, nao basta mudar o env
# do container. Por isso elas entram como ARG e precisam ser passadas no build
# da CI (ver .github/workflows e docs/RUNBOOK_HOSTINGER.md).
# =============================================================================

ARG NODE_VERSION=20-alpine
ARG PNPM_VERSION=8.12.0

# --------------------------------------------------------------------- deps --
FROM node:${NODE_VERSION} AS deps
ARG PNPM_VERSION
RUN apk add --no-cache libc6-compat openssl \
 && corepack enable \
 && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# O postinstall do cypress baixa e descompacta um binario de ~300 MB. Ele nao roda
# nesta imagem, e num alpine sem libs graficas nem funcionaria. Sem isto o build
# fica minutos parado descompactando algo que sera descartado.
ENV CYPRESS_INSTALL_BINARY=0
ENV PUPPETEER_SKIP_DOWNLOAD=1
ENV HUSKY=0

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json          ./apps/api/
COPY apps/web/package.json          ./apps/web/
COPY packages/config/package.json   ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json    ./packages/types/
COPY packages/ui/package.json       ./packages/ui/

# O postinstall do workspace roda `prisma generate`; sem o schema o install falha
# mesmo instalando so para o web.
COPY packages/database/prisma ./packages/database/prisma

RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------------ builder --
FROM deps AS builder
WORKDIR /app
COPY . .

# Origem da API. Com web e API em hostnames separados (obrigatorio — ver o
# conflito de rotas /api/* documentado no runbook), aponta para o subdominio da
# API, SEM o sufixo /api: o codigo monta `${API_URL}/api/...`.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_WS_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL}
ENV NEXT_PUBLIC_WS_URL=${NEXT_PUBLIC_WS_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Falha cedo e com mensagem clara. Sem isto, o build passa, o bundle sai com o
# fallback http://localhost:3001 embutido e o erro so aparece no navegador do
# usuario como "Nao foi possivel conectar ao servidor".
RUN test -n "$NEXT_PUBLIC_API_URL" \
 || (echo 'FATAL: build-arg NEXT_PUBLIC_API_URL nao informado.' && exit 1)

RUN pnpm --filter @nexora/web build

# ------------------------------------------------------------------- runner --
FROM node:${NODE_VERSION} AS runner
RUN apk add --no-cache libc6-compat \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nextjs -u 1001

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
# O server.js do standalone faz bind em localhost por padrao, o que o torna
# inalcancavel de fora do container.
ENV HOSTNAME=0.0.0.0
ENV NODE_OPTIONS=--max-old-space-size=576

# O standalone ja traz o node_modules minimo. Com outputFileTracingRoot na raiz
# do monorepo, a arvore gerada preserva o layout apps/web/... — dai o server.js
# ficar em apps/web/server.js e nao na raiz.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/standalone ./
# .next/static e public NAO entram no standalone; o Next espera que sejam
# copiados a mao. Sem isto o app sobe sem CSS nem JS.
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/.next/static ./apps/web/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/apps/web/public       ./apps/web/public

USER nextjs
EXPOSE 3000

CMD ["node", "apps/web/server.js"]
