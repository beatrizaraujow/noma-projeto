# 🚀 Guia de Deploy - NUMA

## Opções de Deploy

### 1. 🐳 Deploy com Docker (Recomendado para Produção)
### 2. ☁️ Deploy em Plataformas Cloud (Vercel + Railway)
### 3. 🖥️ Deploy Manual em Servidor VPS

---

## 🐳 Opção 1: Deploy com Docker

### Pré-requisitos
- Docker e Docker Compose instalados
- Domínio configurado (opcional)
- Certificado SSL (para produção)

### Passo a Passo

#### 1. Criar arquivo `.env` para API
```bash
cd apps/api
cp .env.example .env
```

Edite o arquivo `.env` com valores de produção:
```env
# Database
DATABASE_URL="postgresql://postgres:SENHA_FORTE@postgres:5432/nexora?schema=public"
MONGODB_URI="mongodb://root:SENHA_FORTE@mongodb:27017/nexora?authSource=admin"
REDIS_URL="redis://redis:6379"
ELASTICSEARCH_NODE="http://elasticsearch:9200"

# JWT (IMPORTANTE: Gere uma chave forte!)
JWT_SECRET="SUA_CHAVE_JWT_SUPER_SECRETA_AQUI"
JWT_EXPIRATION=7d

# Frontend
FRONTEND_URL=https://seu-dominio.com

# Port
PORT=3001

# Node Environment
NODE_ENV=production
```

#### 2. Criar arquivo `.env` para Web
```bash
cd apps/web
cp .env.example .env
```

Edite o arquivo `.env`:
```env
NEXT_PUBLIC_API_URL=https://api.seu-dominio.com
NEXT_PUBLIC_WS_URL=wss://api.seu-dominio.com
NEXTAUTH_URL=https://seu-dominio.com
NEXTAUTH_SECRET="SUA_CHAVE_NEXTAUTH_SUPER_SECRETA_AQUI"
```

#### 3. Build e Deploy
```bash
# Na raiz do projeto
docker-compose up -d --build

# Verificar logs
docker-compose logs -f

# Verificar status
docker-compose ps
```

#### 4. Rodar Migrations
```bash
# Entrar no container da API
docker exec -it nexora-api sh

# Rodar migrations
pnpm db:migrate

# Sair
exit
```

#### 5. Acessar Aplicação
- Frontend: http://localhost:3000
- API: http://localhost:3001
- API Docs: http://localhost:3001/api

---

## ☁️ Opção 2: Deploy em Cloud Platforms

### 2.1. Frontend no Vercel

#### Pré-requisitos
- Conta no [Vercel](https://vercel.com)
- Repositório Git (GitHub, GitLab ou Bitbucket)

#### Passos

1. **Fazer push do código para GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Importar projeto no Vercel**
   - Acesse https://vercel.com
   - Clique em "New Project"
   - Importe seu repositório
   - Configure o projeto:
     - **Framework Preset**: Next.js
     - **Root Directory**: apps/web
     - **Build Command**: `cd ../.. && pnpm install && pnpm build --filter=@nexora/web`
     - **Output Directory**: apps/web/.next
     - **Install Command**: `pnpm install`

3. **Configurar variáveis de ambiente**
   ```
   NEXT_PUBLIC_API_URL=https://sua-api.railway.app
   NEXT_PUBLIC_WS_URL=wss://sua-api.railway.app
   NEXTAUTH_URL=https://seu-app.vercel.app
   NEXTAUTH_SECRET=[gerar com: openssl rand -base64 32]
   ```

4. **Deploy**
   - Clique em "Deploy"
   - Aguarde o build (2-5 minutos)

### 2.2. Backend no Railway

#### Pré-requisitos
- Conta no [Railway](https://railway.app)

#### Passos

1. **Criar novo projeto no Railway**
   - Acesse https://railway.app
   - Clique em "New Project"
   - Escolha "Deploy from GitHub repo"
   - Selecione seu repositório

2. **Adicionar serviços**
   
   **PostgreSQL:**
   - Clique em "+ New"
   - Selecione "Database" > "PostgreSQL"
   - Copie a `DATABASE_URL`

   **Redis:**
   - Clique em "+ New"
   - Selecione "Database" > "Redis"
   - Copie a `REDIS_URL`

   **MongoDB:** (se necessário)
   - Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (gratuito)

3. **Configurar API Service**
   - Clique em "+ New"
   - "Deploy from GitHub repo"
   - Configure:
     - **Root Directory**: apps/api
     - **Build Command**: `cd ../.. && pnpm install && pnpm build --filter=@nexora/api`
     - **Start Command**: `cd apps/api && pnpm start:prod`

4. **Variáveis de ambiente**
   ```
   DATABASE_URL=[copiado do PostgreSQL Railway]
   REDIS_URL=[copiado do Redis Railway]
   MONGODB_URI=[MongoDB Atlas]
   JWT_SECRET=[openssl rand -base64 32]
   JWT_EXPIRATION=7d
   FRONTEND_URL=https://seu-app.vercel.app
   PORT=3001
   NODE_ENV=production
   ```

5. **Rodar Migrations**
   - No Railway, acesse a API service
   - Vá em "Settings" > "Deploy Triggers"
   - Adicione um comando de migration (ou rode manualmente via CLI)

---

## 🖥️ Opção 3: Deploy Manual em VPS

### Pré-requisitos
- Servidor Ubuntu 22.04+ (ou similar)
- Acesso SSH
- Domínio apontado para o servidor
- Nginx instalado

### Passos

#### 1. Preparar Servidor

```bash
# SSH no servidor
ssh usuario@seu-servidor.com

# Atualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar pnpm
npm install -g pnpm

# Instalar PM2
npm install -g pm2

# Instalar Docker e Docker Compose
sudo apt install -y docker.io docker-compose
sudo usermod -aG docker $USER

# Instalar Nginx
sudo apt install -y nginx
```

#### 2. Clonar Projeto

```bash
# Criar diretório
mkdir -p /var/www
cd /var/www

# Clonar
git clone https://github.com/seu-usuario/numa.git
cd numa

# Instalar dependências
pnpm install

# Configurar .env (veja seção acima)
```

#### 3. Setup Database com Docker

```bash
# Subir banco de dados
docker-compose up -d postgres redis mongodb

# Rodar migrations
cd apps/api
pnpm db:migrate
```

#### 4. Build Aplicações

```bash
# Build API
cd /var/www/numa/apps/api
pnpm build

# Build Web
cd /var/www/numa/apps/web
pnpm build
```

#### 5. Configurar PM2

```bash
# Criar arquivo ecosystem.config.js na raiz
cd /var/www/numa
```

Conteúdo do `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [
    {
      name: 'numa-api',
      cwd: '/var/www/numa/apps/api',
      script: 'pnpm',
      args: 'start:prod',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
    },
    {
      name: 'numa-web',
      cwd: '/var/www/numa/apps/web',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3000,
      },
    },
  ],
};
```

```bash
# Iniciar aplicações
pm2 start ecosystem.config.js

# Configurar inicialização automática
pm2 startup
pm2 save
```

#### 6. Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/numa
```

Conteúdo:
```nginx
# Frontend
server {
    listen 80;
    server_name seu-dominio.com www.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API
server {
    listen 80;
    server_name api.seu-dominio.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Ativar configuração
sudo ln -s /etc/nginx/sites-available/numa /etc/nginx/sites-enabled/

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

#### 7. Configurar SSL com Let's Encrypt

```bash
# Instalar Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obter certificados
sudo certbot --nginx -d seu-dominio.com -d www.seu-dominio.com -d api.seu-dominio.com

# Renovação automática
sudo certbot renew --dry-run
```

---

## 🔐 Segurança em Produção

### Checklist de Segurança

- [ ] Alterar senhas padrão dos bancos de dados
- [ ] Gerar JWT_SECRET e NEXTAUTH_SECRET fortes
- [ ] Configurar CORS adequadamente
- [ ] Habilitar rate limiting
- [ ] Configurar SSL/HTTPS
- [ ] Configurar firewall (UFW no Ubuntu)
- [ ] Backups automáticos do banco de dados
- [ ] Monitoramento de logs
- [ ] Variáveis de ambiente seguras (nunca commitar .env)

### Gerar Chaves Secretas

```bash
# JWT Secret
openssl rand -base64 64

# NextAuth Secret
openssl rand -base64 32
```

---

## 📊 Monitoramento

### Logs com PM2
```bash
# Ver logs em tempo real
pm2 logs

# Logs da API
pm2 logs numa-api

# Logs do Web
pm2 logs numa-web

# Monitoramento
pm2 monit
```

### Docker Logs
```bash
# Ver logs de todos os containers
docker-compose logs -f

# Logs da API
docker-compose logs -f api

# Logs do Web
docker-compose logs -f web
```

---

## 🔄 Atualizações

### Atualizar aplicação

```bash
# Pull novo código
git pull origin main

# Instalar novas dependências
pnpm install

# Rebuild
pnpm build

# Restart (PM2)
pm2 restart all

# Ou (Docker)
docker-compose up -d --build
```

---

## 🆘 Troubleshooting

### Problema: Não conecta ao banco
**Solução:** Verificar DATABASE_URL e se PostgreSQL está rodando
```bash
docker ps | grep postgres
docker-compose logs postgres
```

### Problema: Erro 502 Bad Gateway
**Solução:** Verificar se aplicação está rodando
```bash
pm2 status
# ou
docker-compose ps
```

### Problema: Build falha
**Solução:** Limpar cache e reinstalar
```bash
pnpm clean
rm -rf node_modules
pnpm install
pnpm build
```

---

## 📝 Comandos Úteis

```bash
# Ver status (PM2)
pm2 status

# Restart específico
pm2 restart numa-api

# Stop todos
pm2 stop all

# Ver logs
pm2 logs --lines 100

# Monitorar recursos
pm2 monit

# Docker: Ver containers
docker-compose ps

# Docker: Parar tudo
docker-compose down

# Docker: Rebuild
docker-compose up -d --build

# Nginx: Testar config
sudo nginx -t

# Nginx: Reload
sudo systemctl reload nginx
```

---

## ✅ Checklist Pré-Deploy

- [ ] Código testado localmente
- [ ] .env configurado para produção
- [ ] Migrations rodadas
- [ ] Build sem erros
- [ ] Variáveis de ambiente seguras
- [ ] SSL/HTTPS configurado
- [ ] Backup do banco configurado
- [ ] Monitoramento configurado
- [ ] Domínio DNS apontado
- [ ] Firewall configurado

---

## 🎉 Deploy Rápido (Recomendado)

Para um deploy rápido e fácil:

1. **Frontend:** Vercel (grátis, automático)
2. **Backend:** Railway (grátis até certo limite)
3. **Database:** Railway PostgreSQL + Redis (incluído)

**Tempo estimado:** 15-30 minutos

---

**Última atualização:** 30 de Janeiro de 2026
