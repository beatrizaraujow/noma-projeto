# 🚀 NOMA - Quick Deploy Guide

## Deploy Rápido para Estudo/Demo

### 🎯 Pré-requisitos

- Node.js 18+
- pnpm 8+
- PostgreSQL 14+ (ou Docker)

### ⚡ Deploy Local (5 minutos)

```bash
# 1. Clone
git clone https://github.com/beatrizaraujow/noma-projeto.git
cd noma-projeto

# 2. Instale dependências
pnpm install

# 3. Configure ambiente
cp .env.example .env
# Edite .env com suas configurações

# 4. Setup banco de dados
cd packages/database
npx prisma migrate dev
npx prisma db seed

# 5. Rode o projeto
cd ../..
pnpm dev
```

**Acesse:**
- 🌐 Frontend: http://localhost:3000
- 🔌 API: http://localhost:3001

---

### 🐳 Deploy com Docker (2 minutos)

```bash
# 1. Clone e configure
git clone https://github.com/beatrizaraujow/noma-projeto.git
cd noma-projeto
cp .env.example .env

# 2. Suba containers
docker-compose up -d

# 3. Rode migrations
docker-compose exec api npx prisma migrate deploy
docker-compose exec api npx prisma db seed
```

**Acesse:** http://localhost:3000

**Parar:** `docker-compose down`

---

### ☁️ Deploy Online

#### Vercel (Frontend)
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/beatrizaraujow/noma-projeto&root-directory=apps/web)

**Environment Variables:**
```bash
NEXT_PUBLIC_API_URL=https://sua-api.railway.app
```

#### Railway (Backend + DB)
[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

**Environment Variables:**
```bash
DATABASE_URL=${{Postgres.DATABASE_URL}}
JWT_SECRET=gere_string_aleatoria_segura
CORS_ORIGIN=https://seu-app.vercel.app
```

---

## 📚 Documentação Completa

- **Deploy detalhado:** [DEPLOY_STUDY.md](DEPLOY_STUDY.md)
- **Guia de segurança:** [SECURITY.md](SECURITY.md)
- **Setup completo:** [DEPLOY_GUIDE.md](DEPLOY_GUIDE.md)

---

## ⚠️ Importante

- ❌ Nunca commite `.env` com dados reais
- ✅ Use `.env.example` com valores de exemplo
- ✅ Configure secrets no provedor de deploy
- ✅ Use dados FAKE para demo pública

---

## 🆘 Problemas?

```bash
# Limpar e reinstalar
rm -rf node_modules .next dist
pnpm install

# Resetar banco
npx prisma migrate reset

# Ver logs
docker-compose logs -f  # Docker
pnpm dev  # Local
```

**Mais ajuda:** [DEPLOY_STUDY.md](DEPLOY_STUDY.md#-troubleshooting)
