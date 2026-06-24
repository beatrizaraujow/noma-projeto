FROM node:20-alpine
RUN apk add --no-cache openssl && corepack enable && corepack prepare pnpm@8.12.0 --activate

WORKDIR /app

# Copy manifests first for layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/api/package.json ./apps/api/
COPY packages/config/package.json ./packages/config/
COPY packages/database/package.json ./packages/database/
COPY packages/types/package.json ./packages/types/
COPY packages/ui/package.json ./packages/ui/
# Schema must exist before postinstall runs prisma generate
COPY packages/database/prisma ./packages/database/prisma

RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm --filter @nexora/api build

ENV NODE_ENV=production
EXPOSE 3001

WORKDIR /app/apps/api

CMD ["sh", "-c", "npx prisma db push --schema=../../packages/database/prisma/schema.prisma --accept-data-loss && node dist/main"]
