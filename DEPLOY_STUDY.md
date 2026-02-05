# 🎓 Guia de Deploy para Estudo - NOMA

**Deploy seguro e simplificado para demonstração e aprendizado**

---

## 🎯 Objetivo

Este guia te ajuda a fazer deploy do NOMA para fins de **estudo e demonstração**, sem expor dados sensíveis ou configurações de produção.

---

## ✅ Checklist Pré-Deploy

### 1. Verificar Arquivos Sensíveis

Certifique-se que estes arquivos **NÃO** estão no Git:

```bash
# Verificar se .gitignore está correto
cat .gitignore

# Verificar se não há arquivos sensíveis staged
git status

# Ver o que será enviado ao repositório
git ls-files
```

**❌ NUNCA commite:**
- `.env` (variáveis reais)
- `node_modules/`
- Arquivos de banco de dados (`.db`, `.sqlite`)
- Uploads/arquivos de usuário (`uploads/`)
- Logs com dados sensíveis
- Credenciais de API/OAuth reais

**✅ Pode commitar:**
- `.env.example` (com valores de exemplo)
- Código fonte
- Documentação
- Arquivos de configuração (sem secrets)

---

## 🚀 Opções de Deploy

### Opção 1: Deploy Local (Desenvolvimento)

**Melhor para:** Demonstração local, testes, desenvolvimento

```bash
# 1. Clone o repositório
git clone https://github.com/beatrizaraujow/noma-projeto.git
cd noma-projeto

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas configurações locais

# 4. Setup do banco de dados
cd packages/database
npx prisma migrate dev
npx prisma generate
npx prisma db seed  # Dados de exemplo

# 5. Rodar desenvolvimento
cd ../..
pnpm dev

# Acesse:
# - Frontend: http://localhost:3000
# - API: http://localhost:3001
```

---

### Opção 2: Deploy com Docker (Isolado)

**Melhor para:** Demonstração consistente, sem instalar dependências

```bash
# 1. Criar .env (copiar do .env.example)
cp .env.example .env

# 2. Subir containers
docker-compose up -d

# 3. Rodar migrations
docker-compose exec api npx prisma migrate deploy

# 4. Seed de dados (opcional)
docker-compose exec api npx prisma db seed

# Acesse:
# - Frontend: http://localhost:3000
# - API: http://localhost:3001
# - Banco: localhost:5432
```

**Parar containers:**
```bash
docker-compose down
```

**Limpar tudo (incluindo volumes):**
```bash
docker-compose down -v
```

---

### Opção 3: Deploy na Vercel (Frontend) + Railway (Backend)

**Melhor para:** Demo online pública

#### Frontend na Vercel

1. **Fork o repositório** no GitHub
2. **Importar no Vercel:**
   - Acesse [vercel.com](https://vercel.com)
   - New Project → Import Git Repository
   - Selecione `apps/web` como root directory
   
3. **Configurar Environment Variables:**
   ```bash
   NEXT_PUBLIC_API_URL=https://sua-api.railway.app
   NEXT_PUBLIC_APP_URL=https://seu-app.vercel.app
   ```

4. **Deploy automático** a cada push no main

#### Backend na Railway

1. **Criar conta no Railway:** [railway.app](https://railway.app)
2. **New Project → Deploy from GitHub**
3. **Adicionar PostgreSQL:**
   - New → Database → Add PostgreSQL
   - Railway gera `DATABASE_URL` automaticamente

4. **Configurar Environment Variables:**
   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}  # Auto-injetado
   JWT_SECRET=gere_uma_string_aleatoria_segura
   NODE_ENV=production
   PORT=3001
   CORS_ORIGIN=https://seu-app.vercel.app
   ```

5. **Configurar Build:**
   - Root Directory: `apps/api`
   - Build Command: `pnpm install && pnpm build`
   - Start Command: `pnpm start:prod`

6. **Rodar Migrations:**
   ```bash
   # No Railway, abra o terminal e execute:
   npx prisma migrate deploy
   npx prisma db seed
   ```

---

### Opção 4: GitHub Pages (Apenas Docs)

**Melhor para:** Documentação estática

```bash
# 1. Criar branch gh-pages
git checkout --orphan gh-pages

# 2. Limpar arquivos
git rm -rf .
git clean -fdx

# 3. Copiar apenas docs
cp -r docs/* .
echo "# NOMA Documentation" > README.md

# 4. Commit e push
git add .
git commit -m "docs: Deploy documentation"
git push origin gh-pages

# 5. Ativar no GitHub
# Settings → Pages → Source: gh-pages branch
```

Acesse: `https://beatrizaraujow.github.io/noma-projeto/`

---

## 🔐 Boas Práticas de Segurança

### 1. Configurar Secrets Corretamente

**❌ ERRADO:**
```bash
# .env commitado no Git
DATABASE_URL="postgresql://admin:senha123@prod.db:5432/noma"
JWT_SECRET="minha-senha-secreta"
```

**✅ CORRETO:**
```bash
# .env.example no Git (valores falsos)
DATABASE_URL="postgresql://user:password@localhost:5432/noma"
JWT_SECRET="change-this-in-production"

# .env local (NUNCA commitar)
DATABASE_URL="postgresql://real_user:real_pass@..."
JWT_SECRET="xyz789abc456def..."
```

### 2. Usar Environment Variables do Provedor

**Vercel/Railway/etc:**
- Configure secrets via dashboard
- Use variáveis do sistema quando possível
- Nunca hardcode credenciais no código

### 3. Limitar Permissões

**OAuth Apps (Google, GitHub, etc):**
- Crie apps separados para dev/prod
- Use localhost URLs para desenvolvimento
- Restrinja redirects permitidos

### 4. Dados de Demonstração

**Para demo pública:**
```bash
# Seed com dados FAKE
npx prisma db seed

# Nunca use:
# - Emails reais de usuários
# - Dados de produção
# - Credenciais reais
```

---

## 📁 Estrutura de Arquivos Segura

### O que está no Git ✅

```
NOMA/
├── apps/
│   ├── api/src/           # Código fonte
│   └── web/src/           # Código fonte
├── packages/
│   ├── database/
│   │   └── prisma/        # Schema + migrations
│   ├── types/             # TypeScript types
│   └── ui/                # Componentes UI
├── docs/                  # Documentação
├── .env.example           # ✅ Exemplo (valores fake)
├── .gitignore             # ✅ Importante!
├── package.json           # Dependências
└── README.md              # Instruções
```

### O que NÃO está no Git ❌

```
NOMA/
├── .env                   # ❌ Secrets reais
├── .env.local             # ❌ Configuração local
├── node_modules/          # ❌ Dependências instaladas
├── dist/                  # ❌ Build gerado
├── .next/                 # ❌ Build Next.js
├── uploads/               # ❌ Arquivos de usuário
├── *.log                  # ❌ Logs
└── .turbo/                # ❌ Cache turbo
```

---

## 🧪 Testar Deploy Local

Antes de fazer deploy público, teste localmente:

```bash
# 1. Simular ambiente de produção
NODE_ENV=production pnpm build
NODE_ENV=production pnpm start

# 2. Testar com dados limpos
rm -rf node_modules/.cache
rm -rf .next
rm -rf dist
pnpm build

# 3. Verificar variáveis de ambiente
echo $DATABASE_URL  # Deve estar configurada
echo $JWT_SECRET    # Deve estar configurada

# 4. Testar migrations
npx prisma migrate deploy
npx prisma generate

# 5. Verificar saúde da API
curl http://localhost:3001/health
```

---

## 🐛 Troubleshooting

### "Cannot find module" após clone

```bash
# Reinstalar dependências
rm -rf node_modules
rm pnpm-lock.yaml
pnpm install
```

### Erro de conexão com banco

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Testar conexão
npx prisma db pull

# Recriar banco
npx prisma migrate reset
```

### Build falha no Vercel/Railway

```bash
# Verificar node version
# package.json deve ter:
{
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
```

### Variáveis de ambiente não carregam

```bash
# Verificar .env está no .gitignore
cat .gitignore | grep .env

# Verificar arquivo existe
ls -la .env

# Recarregar environment
source .env  # Linux/Mac
# ou
dotenv -e .env -- pnpm dev  # Windows
```

---

## 📚 Recursos Adicionais

### Provedores de Deploy Gratuitos

| Provedor | Melhor Para | Free Tier |
|----------|-------------|-----------|
| [Vercel](https://vercel.com) | Frontend Next.js | Ilimitado (hobby) |
| [Railway](https://railway.app) | Backend + DB | $5 crédito/mês |
| [Render](https://render.com) | Backend + DB | 750h/mês |
| [Fly.io](https://fly.io) | Full-stack | 3 VMs pequenas |
| [Supabase](https://supabase.com) | PostgreSQL + Auth | 500MB DB |

### Ferramentas de Desenvolvimento

- **Mailtrap:** Teste de emails (sem enviar real)
- **Ethereal:** Email fake para testes
- **ngrok:** Expor localhost publicamente
- **Postman:** Testar API endpoints

---

## ✅ Checklist Final

Antes de fazer deploy público:

- [ ] `.gitignore` configurado corretamente
- [ ] `.env` não está commitado
- [ ] `.env.example` tem valores de exemplo
- [ ] Secrets configurados no provedor (não no código)
- [ ] Dados de seed são FAKE
- [ ] OAuth apps usam URLs corretas
- [ ] README tem instruções claras
- [ ] Migrations estão aplicadas
- [ ] Build local funciona
- [ ] Testes passam (se houver)
- [ ] CORS configurado corretamente
- [ ] Rate limiting configurado (se público)

---

## 🎉 Deploy Concluído!

Seu projeto agora está deployado de forma segura para estudo!

**Próximos passos:**
1. Compartilhe a URL com colegas/recrutadores
2. Documente funcionalidades no README
3. Adicione screenshots/GIFs
4. Configure CI/CD para deploys automáticos
5. Monitore uso e performance

**Lembre-se:** Este é um ambiente de ESTUDO. Para produção real, implemente:
- SSL/HTTPS obrigatório
- Backup de banco de dados
- Monitoring e alertas
- Rate limiting robusto
- Autenticação 2FA
- Logs centralizados
- Testes automatizados
