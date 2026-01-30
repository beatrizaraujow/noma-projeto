# 📦 Arquivos Criados para Deploy

## ✅ Documentação
1. **DEPLOY_GUIDE.md** - Guia completo de deploy com 3 opções:
   - 🐳 Docker (produção)
   - ☁️ Cloud Platforms (Vercel + Railway)
   - 🖥️ VPS Manual
   
2. **DEPLOY_CHECKLIST.md** - Checklist detalhado:
   - Pré-deploy (código, config, banco, segurança)
   - Durante deploy (backend, frontend, infra)
   - Pós-deploy (testes, monitoramento, backup)
   
3. **DEPLOY_QUICK.md** - Guia rápido (15 minutos):
   - Deploy fácil: Vercel + Railway
   - Deploy Docker: comandos essenciais

## 🐳 Docker
4. **docker-compose.prod.yml** - Compose para produção:
   - PostgreSQL, Redis, MongoDB, Elasticsearch
   - API e Web com health checks
   - Networks e volumes isolados
   
5. **apps/web/Dockerfile.prod** - Multi-stage Dockerfile:
   - Stage 1: Dependencies
   - Stage 2: Builder
   - Stage 3: Runner (standalone)
   
6. **apps/api/Dockerfile.prod** - Multi-stage Dockerfile:
   - Otimizado para NestJS
   - Non-root user (segurança)

## ⚙️ Configuração
7. **.env.prod.example** - Template de variáveis:
   - Database configs
   - JWT secrets
   - API URLs
   - Instruções de geração

8. **nginx.conf** - Configuração Nginx:
   - Proxy reverso para API e Web
   - WebSocket support
   - Gzip compression
   - Rate limiting
   - SSL ready (comentado)

9. **ecosystem.config.js** - PM2 config:
   - Gerenciamento de processos
   - Auto-restart
   - Logs estruturados

## 🤖 Automação
10. **.github/workflows/deploy.yml** - CI/CD GitHub Actions:
    - Testes automatizados
    - Build validation
    - Deploy automático

11. **scripts/deploy.sh** - Script de deploy:
    - Validação de código
    - Testes
    - Build
    - Git tagging

12. **scripts/health-check.sh** - Health check:
    - Verifica API, Web e bancos
    - Exit codes para CI/CD

## 📝 Updates
13. **apps/web/next.config.js** - Atualizado:
    - `output: 'standalone'` para Docker
    
14. **package.json** - Scripts adicionados:
    - `docker:prod` - Deploy Docker produção
    - `docker:logs` - Ver logs
    - `health` - Health check
    - `deploy:check` - Validação pré-deploy

---

## 🚀 Como Usar

### Deploy Rápido (Vercel + Railway)
```bash
# 1. Ler o guia rápido
cat DEPLOY_QUICK.md

# 2. Seguir passos do Vercel
# 3. Seguir passos do Railway
# 4. Pronto! ✅
```

### Deploy com Docker
```bash
# 1. Copiar e configurar .env
cp .env.prod.example .env.prod
# Editar .env.prod com seus valores

# 2. Build e deploy
pnpm docker:prod

# 3. Rodar migrations
docker exec -it numa-api-prod sh
pnpm db:migrate
exit

# 4. Verificar
pnpm docker:logs
```

### Deploy em VPS
```bash
# 1. Ler documentação completa
cat docs/DEPLOY_GUIDE.md

# 2. Seguir seção "Deploy Manual em VPS"
# 3. Usar scripts fornecidos
```

---

## 📊 Checklist de Deploy

### Antes de Deployar
- [ ] Ler [DEPLOY_GUIDE.md](./docs/DEPLOY_GUIDE.md)
- [ ] Escolher plataforma de deploy
- [ ] Configurar variáveis de ambiente
- [ ] Gerar secrets (JWT, NextAuth)

### Durante Deploy
- [ ] Seguir checklist em [DEPLOY_CHECKLIST.md](./docs/DEPLOY_CHECKLIST.md)
- [ ] Rodar migrations
- [ ] Configurar DNS (se aplicável)
- [ ] Configurar SSL/HTTPS

### Após Deploy
- [ ] Testar funcionalidades
- [ ] Verificar logs
- [ ] Configurar monitoramento
- [ ] Configurar backups

---

## 🆘 Problemas Comuns

**Erro de build?**
```bash
pnpm clean
pnpm install
pnpm build
```

**Não conecta ao banco?**
```bash
# Verificar se DATABASE_URL está correta
docker-compose logs postgres
```

**API não responde?**
```bash
# Verificar logs
docker-compose logs api
# ou
pm2 logs numa-api
```

---

## 📞 Recursos

- **Documentação Completa:** [docs/DEPLOY_GUIDE.md](./docs/DEPLOY_GUIDE.md)
- **Checklist Detalhado:** [docs/DEPLOY_CHECKLIST.md](./docs/DEPLOY_CHECKLIST.md)
- **Guia Rápido:** [DEPLOY_QUICK.md](./DEPLOY_QUICK.md)

---

**Última atualização:** 30 de Janeiro de 2026
**Status:** ✅ Pronto para Deploy
