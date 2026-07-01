# ✅ Checklist de Deploy - NUMA

## 📋 Pré-Deploy

### Código
- [ ] Todos os testes passando (`pnpm test`)
- [ ] Nenhum erro de linting (`pnpm lint`)
- [ ] Build local bem-sucedido (`pnpm build`)
- [ ] Sem erros no TypeScript
- [ ] Code review completo
- [ ] Changelog atualizado

### Configuração
- [ ] Arquivo `.env` criado para API (não commitar!)
- [ ] Arquivo `.env` criado para Web (não commitar!)
- [ ] Variáveis de ambiente validadas
- [ ] JWT_SECRET gerado (forte, único)
- [ ] NEXTAUTH_SECRET gerado (forte, único)
- [ ] DATABASE_URL configurada
- [ ] REDIS_URL configurada (OPCIONAL — Redis não está integrado à API; `bull`/`ioredis` estão inertes. Só necessário se/quando filas forem ativadas)
- [ ] CORS configurado corretamente

### Banco de Dados
- [ ] Migrations testadas localmente
- [ ] Backup do banco atual (se existente)
- [ ] Seeds preparados (se necessário)
- [ ] Índices criados para performance
- [ ] Conexão testada

### Segurança
- [ ] Senhas de banco fortes
- [ ] Secrets seguros (JWT, NextAuth)
- [ ] HTTPS/SSL configurado
- [ ] Rate limiting habilitado
- [ ] CORS restrito aos domínios corretos
- [ ] Environment variables não expostas no cliente
- [ ] `.env` no `.gitignore`

## 🚀 Durante o Deploy

### 1. Deploy do Backend (API)

#### Railway/Cloud
- [ ] Projeto criado no Railway
- [ ] PostgreSQL provisionado
- [ ] Redis provisionado (OPCIONAL/dev — não integrado à API; pode pular)
- [ ] Variáveis de ambiente configuradas
- [ ] Build command configurado: `cd ../.. && pnpm install && pnpm build --filter=@nexora/api`
- [ ] Start command real (via Dockerfile): `prisma db push` no boot, depois `node dist/main`
- [ ] Deploy executado
- [ ] Schema sincronizado com `prisma db push` (não há migrations versionadas)
- [ ] Health check passou (`/api/health`)
- [ ] Swagger acessível (`/api/docs`)
- [ ] API URL anotada

#### VPS
- [ ] SSH configurado
- [ ] Código clonado
- [ ] Dependencies instaladas (`pnpm install`)
- [ ] Build executado (`pnpm build`)
- [ ] PM2 configurado
- [ ] Aplicação iniciada
- [ ] PM2 startup configurado
- [ ] Nginx configurado
- [ ] SSL configurado (Certbot)

### 2. Deploy do Frontend (Web)

#### Vercel
- [ ] Projeto criado no Vercel
- [ ] Repositório conectado
- [ ] Framework preset: Next.js
- [ ] Root directory: `apps/web`
- [ ] Build command: `cd ../.. && pnpm install && pnpm build --filter=@nexora/web`
- [ ] Output directory: `apps/web/.next`
- [ ] Variáveis de ambiente configuradas:
  - [ ] `NEXT_PUBLIC_API_URL`
  - [ ] `NEXT_PUBLIC_WS_URL`
  - [ ] `NEXTAUTH_URL`
  - [ ] `NEXTAUTH_SECRET`
- [ ] Deploy executado
- [ ] Build bem-sucedido
- [ ] Aplicação acessível

#### VPS
- [ ] Build executado
- [ ] PM2 configurado
- [ ] Aplicação iniciada
- [ ] Nginx configurado
- [ ] SSL configurado

### 3. Configuração de Infraestrutura

#### DNS
- [ ] Domínio principal apontado (A record)
- [ ] Subdomínio API apontado (CNAME ou A)
- [ ] TTL configurado
- [ ] Propagação verificada

#### SSL/HTTPS
- [ ] Certificado SSL obtido
- [ ] Auto-renovação configurada
- [ ] HTTPS redirect habilitado
- [ ] Certificado validado

#### Nginx (se VPS)
- [ ] Configuração testada (`nginx -t`)
- [ ] Proxy pass configurado
- [ ] WebSocket suporte habilitado
- [ ] Gzip habilitado
- [ ] Rate limiting configurado
- [ ] Nginx recarregado

## 🧪 Pós-Deploy

### Testes Funcionais
- [ ] Homepage carrega
- [ ] Login funciona
- [ ] Criar workspace funciona
- [ ] Criar projeto funciona
- [ ] Criar task funciona
- [ ] Editar task funciona
- [ ] Comentários funcionam
- [ ] Notificações funcionam
- [ ] WebSocket conecta
- [ ] Search funciona
- [ ] Filtros funcionam

### Testes de Performance
- [ ] Lighthouse score > 90
- [ ] First Contentful Paint < 1.5s
- [ ] Time to Interactive < 3.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] API response time < 200ms (média)

### Monitoramento
- [ ] Logs configurados
- [ ] Error tracking configurado (Sentry?)
- [ ] Analytics configurado (se aplicável)
- [ ] Uptime monitoring configurado
- [ ] Alerts configurados

### Backup
- [ ] Backup automático do banco configurado
- [ ] Frequência definida (diária recomendada)
- [ ] Restore testado
- [ ] Backup armazenado externamente

### Documentação
- [ ] URLs de produção documentadas
- [ ] Credenciais armazenadas com segurança (1Password, etc)
- [ ] Runbook de deploy atualizado
- [ ] Contatos de emergência documentados
- [ ] Processo de rollback documentado

## 🔄 Manutenção Contínua

### Semanal
- [ ] Verificar logs de erro
- [ ] Verificar performance
- [ ] Verificar uso de recursos
- [ ] Verificar backups

### Mensal
- [ ] Atualizar dependências
- [ ] Revisar logs de segurança
- [ ] Testar restore de backup
- [ ] Revisar custos de infraestrutura

### Trimestral
- [ ] Audit de segurança
- [ ] Performance review
- [ ] Capacity planning
- [ ] Disaster recovery drill

## 🆘 Rollback (Se necessário)

- [ ] Identificar problema
- [ ] Notificar equipe
- [ ] Reverter deploy no Vercel/Railway
- [ ] Ou: `git revert` + novo deploy
- [ ] Ou: PM2 restart versão anterior
- [ ] Verificar funcionamento
- [ ] Investigar causa raiz
- [ ] Documentar incidente

## 📞 Contatos de Emergência

- **DevOps Lead:** [Nome] - [Email] - [Telefone]
- **Backend Lead:** [Nome] - [Email] - [Telefone]
- **Frontend Lead:** [Nome] - [Email] - [Telefone]

## 🔗 URLs Importantes

- **Produção Web:** https://seu-dominio.com
- **Produção API:** https://api.seu-dominio.com
- **API Docs:** https://api.seu-dominio.com/api
- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **Sentry (Errors):** [URL se configurado]

---

**Última atualização:** 30 de Janeiro de 2026

**Status:** ⏳ Pendente | ✅ Completo | ❌ Falhou
