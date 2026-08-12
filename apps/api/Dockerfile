# syntax=docker/dockerfile:1

# =============================================================================
# NOMA - API (NestJS)
#
# Build multi-stage. A versao anterior era single-stage: fazia `pnpm install`
# completo (dev incluso), `COPY . .` do repositorio inteiro e mantinha tudo na
# imagem final (~1-2 GB). Em servidor com banda estrangulavel, cada deploy
# grande e risco de indisponibilidade da maquina inteira
# (docs/INFRA_COEXISTENCIA_SERVIDOR.md secao 8).
#
# Alvos:
#   deps    - install completo (necessario para compilar)
#   builder - compila a API e poda as deps de dev
#   runner  - imagem final: dist/ + deps de producao + prisma CLI
# =============================================================================

ARG NODE_VERSION=20-alpine
ARG PNPM_VERSION=8.12.0
# Tem que acompanhar @prisma/client (^5.8.1) — CLI e client de major/minor
# diferentes geram erro de engine incompativel.
ARG PRISMA_VERSION=5.8.1

# --------------------------------------------------------------------- deps --
FROM node:${NODE_VERSION} AS deps
ARG PNPM_VERSION
RUN apk add --no-cache openssl \
 && corepack enable \
 && corepack prepare pnpm@${PNPM_VERSION} --activate

WORKDIR /app

# O postinstall do cypress (devDependency de @nexora/web) baixa e descompacta um
# binario de ~300 MB. Ele nao roda em imagem nenhuma, e num container alpine sem
# as libs graficas ele nem funcionaria — mas o `pnpm install` do workspace o puxa
# de qualquer jeito. Medido: travou o build em 7% por mais de 6 minutos.
# Efeito colateral relevante para o VPS: sao 300 MB de banda por build.
ENV CYPRESS_INSTALL_BINARY=0
ENV PUPPETEER_SKIP_DOWNLOAD=1
ENV HUSKY=0

# Manifests antes do codigo: preserva o cache desta layer quando so o fonte muda.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json          ./apps/api/
COPY apps/web/package.json          ./apps/web/
COPY packages/config/package.json   ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json    ./packages/types/
COPY packages/ui/package.json       ./packages/ui/

# O schema precisa existir antes do install: o postinstall de @nexora/api roda
# `prisma generate` e falha sem ele.
COPY packages/database/prisma ./packages/database/prisma

RUN pnpm install --frozen-lockfile

# ------------------------------------------------------------------ builder --
FROM deps AS builder
WORKDIR /app
COPY . .

RUN pnpm --filter @nexora/api build

# Remove as deps de dev (webpack, nest-cli, jest, cypress e todo o dev do web)
# da arvore ja instalada. O client Prisma gerado sobrevive: ele mora dentro de
# @prisma/client, que e dependencia de producao.
RUN pnpm prune --prod

# ------------------------------------------------------------------- runner --
FROM node:${NODE_VERSION} AS runner
ARG PRISMA_VERSION

RUN apk add --no-cache openssl \
 && npm i -g prisma@${PRISMA_VERSION} \
 && npm cache clean --force \
 && addgroup -g 1001 -S nodejs \
 && adduser -S nestjs -u 1001

WORKDIR /app

ENV NODE_ENV=production
ENV PORT=3001
# O V8 nao enxerga o cgroup e dimensiona o heap pelo total da maquina; sem isto
# o container estoura o mem_limit e morre com exit 137 (secao 5.2 do doc).
# O valor final vem do compose, este e so um piso seguro.
ENV NODE_OPTIONS=--max-old-space-size=768

# Os caminhos precisam ser identicos aos do builder (/app/...): pnpm usa
# symlinks para node_modules/.pnpm e eles quebram se a arvore for remontada.
COPY --from=builder --chown=nestjs:nodejs /app/node_modules          ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/packages              ./packages
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=builder --chown=nestjs:nodejs /app/apps/api/dist         ./apps/api/dist

# A sincronizacao de schema saiu do caminho de boot e virou opt-in; a logica esta
# no entrypoint. Ver os comentarios do script e o risco 12 da secao 10 do doc.
# O .gitattributes forca LF neste arquivo: com CRLF o shebang quebra dentro do
# container e o erro ("no such file or directory") nao aponta para a causa.
COPY --chown=nestjs:nodejs apps/api/docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nestjs
WORKDIR /app/apps/api
EXPOSE 3001

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
CMD ["node", "dist/main"]
