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
# python3/make/g++ existem por causa do bcrypt, que e modulo nativo.
#
# O install dele tenta baixar um binario pre-compilado do GitHub releases. Quando
# esse download falha — medido aqui com um 503 Service Unavailable — ele cai no
# fallback de compilar do fonte com node-gyp, que exige Python. Sem essas tres
# ferramentas o build quebra com `gyp ERR! find Python`, de forma INTERMITENTE:
# passa quando o GitHub responde, falha quando nao responde. Diagnosticar isso em
# CI, onde o erro aparece uma vez a cada tantas execucoes, e caro.
#
# Elas ficam so aqui e no builder. O runner copia apenas o .node ja compilado
# dentro de node_modules, entao a imagem final nao carrega compilador nenhum.
RUN apk add --no-cache openssl python3 make g++ \
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

# --filter @nexora/api... limita quais projetos do workspace ganham arvore de
# node_modules. Reduz trabalho de linkagem, mas NAO reduz o tamanho da imagem —
# medido, nao suposto.
#
# Por que nao reduz: o virtual store do pnpm (node_modules/.pnpm) e hidratado a
# partir do LOCKFILE, nao do filtro. Com --frozen-lockfile, todo pacote do
# lockfile aterrissa no store, mesmo que nenhum projeto selecionado o use. O
# filtro decide quem ganha symlink, nao quem e baixado.
#
# Medido na imagem final, com o filtro ativo — tudo isto continua presente:
#   @next/swc-linux-x64-musl  149,6 MB
#   @next/swc-linux-x64-gnu   125,3 MB
#   next                      101,2 MB
#   phosphor-react             58,6 MB
#   @phosphor-icons/react      40,4 MB
#   lucide-react               27,4 MB
# Sao deps de PRODUCAO de @nexora/web, entao `pnpm prune --prod` tambem nao as
# remove — e, medido, o prune nao removia nem as devDependencies.
#
# PENDENCIA: a imagem esta em 1,76 GB contra a meta de 200-400 MB, e o caminho
# certo e `pnpm deploy --filter @nexora/api --prod`, que monta uma arvore
# autocontida so com o necessario, em vez de copiar o store inteiro. Exige
# validar o que o bundle precisa em runtime: @nexora/database tem `main:
# index.ts`, e um .ts nao e requerivel por Node — depende de o webpack do nest
# ter embutido esse pacote no dist. Trocar 1,4 GB por um container que sobe e
# quebra no primeiro import nao e economia.
RUN pnpm install --frozen-lockfile --filter @nexora/api...

# ------------------------------------------------------------------ builder --
FROM deps AS builder
WORKDIR /app
COPY . .

RUN pnpm --filter @nexora/api build

# `pnpm prune --prod` foi REMOVIDO daqui: medido nesta imagem, ele nao removia as
# devDependencies. Depois de rodar, typescript (2x 22 MB) e turbo-linux-64 (21 MB)
# continuavam presentes. Mantê-lo dava a impressao de poda sem poda nenhuma.
#
# PENDENCIA CONHECIDA: as devDependencies da API (nest-cli, webpack, jest, ts) ainda
# vao para a imagem final — cerca de 150-200 MB. A solucao e um estagio separado com
# `pnpm install --prod --ignore-scripts` e `prisma generate` no runner, mas exige
# cuidado com o que o bundle precisa em runtime: @nexora/database tem `main:
# index.ts`, entao dependendo de como o nest build resolve os pacotes de workspace,
# o codigo-fonte deles pode ser necessario no runtime. Otimizar sem validar isso
# troca 200 MB por um container que sobe e quebra no primeiro import.

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
