# 🚀 Guia de Início Rápido - NexORA

Este guia vai te ajudar a ter o NexORA rodando em menos de 5 minutos!

## ⚡ Quick Start (Desenvolvimento Local)

### 1. Pré-requisitos

Certifique-se de ter instalado:
- ✅ Node.js 18+ ([Download](https://nodejs.org/))
- ✅ pnpm 8+ (`npm install -g pnpm`)
- ✅ Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))
- ✅ Git

### 2. Clone e Instale

```bash
# Clone o repositório
git clone https://github.com/seu-usuario/nexora.git
cd nexora

# Instale as dependências
pnpm install
```

### 3. Configure o Ambiente

```bash
# Frontend
cp apps/web/.env.example apps/web/.env

# Backend
cp apps/api/.env.example apps/api/.env
```

### 4. Inicie os Bancos de Dados

```bash
# Inicia PostgreSQL, MongoDB, Redis e Elasticsearch
docker-compose up -d

# Aguarde ~30 segundos para os serviços iniciarem
```

### 5. Configure o Banco de Dados

```bash
# Gere o Prisma Client
cd packages/database
pnpm db:generate

# Execute as migrations
pnpm db:migrate

# Volte para a raiz
cd ../..
```

### 6. Inicie as Aplicações

```bash
# Inicia frontend (3000) e backend (3001) simultaneamente
pnpm dev
```

### 7. Acesse a Aplicação

- 🌐 **Frontend:** http://localhost:3000
- 🔧 **Backend API:** http://localhost:3001
- 📚 **API Docs:** http://localhost:3001/api/docs
- 🔍 **Kibana:** http://localhost:5601
- 💾 **Redis Commander:** http://localhost:8081
- 🍃 **Mongo Express:** http://localhost:8082

---

## 🎯 Próximos Passos

### Criar seu Primeiro Usuário

1. Abra http://localhost:3000
2. Clique em "Cadastrar"
3. Preencha:
   - Nome: Seu Nome
   - Email: seu@email.com
   - Senha: sua senha segura
4. Pronto! Você está logado 🎉

### Criar seu Primeiro Projeto

1. No dashboard, clique em "Novo Projeto"
2. Preencha:
   - Nome: Meu Primeiro Projeto
   - Descrição: Projeto de teste
   - Cor: Escolha uma cor
3. Clique em "Criar"

### Criar sua Primeira Tarefa

1. Entre no projeto criado
2. Clique em "Nova Tarefa"
3. Preencha:
   - Título: Minha primeira tarefa
   - Descrição: Descrição da tarefa
   - Prioridade: Média
   - Status: A Fazer
4. Clique em "Criar"

---

## 🛠 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev                    # Inicia tudo
pnpm dev --filter=@nexora/web   # Só frontend
pnpm dev --filter=@nexora/api   # Só backend

# Build
pnpm build                  # Build de tudo
pnpm build --filter=@nexora/web # Build frontend

# Testes
pnpm test                   # Roda todos os testes
pnpm test:watch             # Watch mode

# Lint
pnpm lint                   # Verifica código
pnpm format                 # Formata código

# Docker
docker-compose up -d        # Inicia serviços
docker-compose down         # Para serviços
docker-compose logs -f      # Ver logs

# Database
cd packages/database
pnpm db:migrate            # Roda migrations
pnpm db:studio             # Abre Prisma Studio
pnpm db:seed               # Popula banco (futuro)
```

---

## 🐛 Solução de Problemas

### Porta já em uso

```bash
# Encontrar e matar processo na porta 3000
npx kill-port 3000

# Ou porta 3001
npx kill-port 3001
```

### Docker não inicia

```bash
# Limpar containers e volumes
docker-compose down -v

# Reiniciar Docker Desktop

# Tentar novamente
docker-compose up -d
```

### Erro de conexão com banco

```bash
# Verificar se PostgreSQL está rodando
docker ps | grep postgres

# Ver logs do PostgreSQL
docker-compose logs postgres

# Reiniciar apenas o PostgreSQL
docker-compose restart postgres
```

### Prisma Client não encontrado

```bash
cd packages/database
pnpm db:generate
cd ../..
pnpm dev
```

### Dependências não instaladas

```bash
# Limpar tudo
rm -rf node_modules
rm -rf apps/web/node_modules
rm -rf apps/api/node_modules
rm -rf packages/*/node_modules

# Reinstalar
pnpm install
```

---

## 📖 Recursos Adicionais

- 📚 [Documentação Completa](README.md)
- 🏗 [Arquitetura](docs/ARCHITECTURE.md)
- 🔌 [API Reference](docs/API.md)
- 🤝 [Como Contribuir](CONTRIBUTING.md)
- 🔒 [Segurança](SECURITY.md)

---

## 💡 Dicas

### Hot Reload

Ambos frontend e backend têm hot reload automático:
- Edite arquivos em `apps/web/src` → Frontend recarrega
- Edite arquivos em `apps/api/src` → Backend recarrega

### Turbo Cache

Turborepo cacheia builds automaticamente:
```bash
# Limpar cache se necessário
pnpm turbo run build --force
```

### Múltiplos Terminais

Recomendado para desenvolvimento:
```bash
# Terminal 1: Frontend
cd apps/web && pnpm dev

# Terminal 2: Backend
cd apps/api && pnpm dev

# Terminal 3: Logs do Docker
docker-compose logs -f
```

---

## 🎉 Tudo Pronto!

Agora você tem:
- ✅ Frontend Next.js rodando
- ✅ Backend NestJS rodando
- ✅ PostgreSQL, MongoDB, Redis e Elasticsearch ativos
- ✅ Hot reload funcionando
- ✅ API Docs disponível

**Happy coding! 🚀**

Precisa de ajuda? Abra uma [issue](https://github.com/seu-usuario/nexora/issues)!
