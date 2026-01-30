# 🚀 Deploy Rápido - NUMA

## ⚡ Opção 1: Deploy Mais Fácil (15 minutos)

### Frontend → Vercel (Grátis)
1. Push seu código para GitHub
2. Acesse [vercel.com](https://vercel.com)
3. "New Project" → Importar seu repo
4. Configure:
   - Root: `apps/web`
   - Build: `cd ../.. && pnpm install && pnpm build --filter=@nexora/web`
5. Adicione variáveis:
   ```
   NEXT_PUBLIC_API_URL=https://sua-api.railway.app
   NEXT_PUBLIC_WS_URL=wss://sua-api.railway.app
   NEXTAUTH_URL=https://seu-app.vercel.app
   NEXTAUTH_SECRET=[gerar: openssl rand -base64 32]
   ```
6. Deploy! ✅

### Backend → Railway (Grátis até $5/mês)
1. Acesse [railway.app](https://railway.app)
2. "New Project" → "Deploy from GitHub"
3. Adicione PostgreSQL: "+ New" → "Database" → "PostgreSQL"
4. Adicione Redis: "+ New" → "Database" → "Redis"
5. Configure API service:
   - Root: `apps/api`
   - Build: `cd ../.. && pnpm install && pnpm build --filter=@nexora/api`
   - Start: `cd apps/api && pnpm start:prod`
6. Variáveis (copiar de Railway):
   ```
   DATABASE_URL=[from Railway PostgreSQL]
   REDIS_URL=[from Railway Redis]
   JWT_SECRET=[gerar: openssl rand -base64 64]
   FRONTEND_URL=https://seu-app.vercel.app
   ```
7. Deploy! ✅

**🎉 Pronto! Sua aplicação está no ar!**

---

## 🐳 Opção 2: Deploy com Docker (Servidor próprio)

```bash
# 1. Criar .env.prod
cp .env.prod.example .env.prod
# Editar e preencher valores

# 2. Gerar secrets
openssl rand -base64 64  # JWT_SECRET
openssl rand -base64 32  # NEXTAUTH_SECRET
openssl rand -base64 32  # Senhas

# 3. Build e subir
docker-compose -f docker-compose.prod.yml up -d --build

# 4. Rodar migrations
docker exec -it numa-api-prod sh
pnpm db:migrate
exit

# 5. Verificar
docker-compose -f docker-compose.prod.yml ps
docker-compose -f docker-compose.prod.yml logs -f
```

**Acessar:**
- Web: http://localhost:3000
- API: http://localhost:3001

---

## 📚 Documentação Completa

- **Guia Completo:** [docs/DEPLOY_GUIDE.md](./docs/DEPLOY_GUIDE.md)
- **Checklist:** [docs/DEPLOY_CHECKLIST.md](./docs/DEPLOY_CHECKLIST.md)

---

## 🆘 Troubleshooting

**Erro de conexão com banco?**
```bash
# Verificar se bancos estão rodando
docker ps | grep -E "postgres|redis|mongo"

# Ver logs
docker-compose logs postgres
```

**Build falha?**
```bash
# Limpar cache
pnpm clean
rm -rf node_modules
pnpm install
pnpm build
```

**API não conecta?**
```bash
# Verificar logs da API
docker-compose logs api
# ou (se PM2)
pm2 logs numa-api
```

---

## 📞 Precisa de Ajuda?

Consulte a documentação completa em [docs/DEPLOY_GUIDE.md](./docs/DEPLOY_GUIDE.md)
