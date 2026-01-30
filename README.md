# NexORA - Enterprise Task Management Platform

<div align="center">
  <h3>🚀 Gerenciamento avançado de projetos e tarefas com colaboração em tempo real</h3>
  <p>Next.js 14+ • NestJS • TypeScript • PostgreSQL • MongoDB • Redis • Elasticsearch</p>
</div>

---

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Tecnologias](#tecnologias)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Desenvolvimento](#desenvolvimento)
- [Docker](#docker)
- [Testes](#testes)
- [Deploy](#deploy)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Features](#features)
- [Roadmap](#roadmap)
- [Contribuindo](#contribuindo)
- [Licença](#licença)

---

## 🎯 Sobre o Projeto

**NexORA** é uma plataforma enterprise de gerenciamento de tarefas e projetos, similar ao ClickUp e Notion, com recursos avançados de:

- ✅ **Colaboração em tempo real** com Socket.io
- 🤖 **Inteligência Artificial** integrada (OpenAI)
- 📊 **Analytics e métricas** avançadas
- 🔍 **Busca full-text** com Elasticsearch
- 🔐 **Autenticação robusta** com NextAuth.js
- 🎨 **Interface moderna** com Tailwind CSS e Shadcn/ui
- 📱 **Totalmente responsivo** e otimizado para mobile
- 🚀 **Performance enterprise** com cache Redis

---

## 🛠 Tecnologias

### **Frontend**
- **Framework:** Next.js 14+ (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Shadcn/ui
- **State Management:** Zustand + TanStack Query
- **Real-time:** Socket.io Client
- **Animations:** Framer Motion
- **Rich Editor:** Tiptap
- **Drag & Drop:** dnd-kit
- **Auth:** NextAuth.js

### **Backend**
- **Framework:** NestJS
- **Language:** TypeScript
- **API:** REST + GraphQL (Apollo Server)
- **Real-time:** Socket.io + WebSockets
- **Authentication:** JWT + Passport
- **Validation:** class-validator + class-transformer

### **Databases**
- **PostgreSQL:** Dados relacionais (usuários, projetos, tarefas)
- **MongoDB:** Dados não estruturados (logs, comentários)
- **Redis:** Cache, sessões, pub/sub
- **Elasticsearch:** Busca avançada e full-text search

### **DevOps & Infrastructure**
- **Containerização:** Docker + Docker Compose
- **Monorepo:** Turborepo
- **CI/CD:** GitHub Actions
- **Testes:** Jest + React Testing Library + Cypress
- **Documentação:** Swagger/OpenAPI

---

## 🏗 Arquitetura

### **Monorepo Structure**

```
NexORA/
├── apps/
│   ├── web/          # Next.js Frontend
│   └── api/          # NestJS Backend
├── packages/
│   ├── ui/           # Shared UI Components
│   ├── types/        # Shared TypeScript Types
│   ├── database/     # Prisma Schema & Client
│   └── config/       # Shared Configuration
├── docker-compose.yml
├── turbo.json
└── package.json
```

### **Microsserviços Architecture**

```
┌─────────────┐
│   Frontend  │ (Next.js)
│  Port 3000  │
└──────┬──────┘
       │
       │ REST/GraphQL
       │ WebSocket
       ▼
┌─────────────┐     ┌──────────────┐
│   Backend   │────►│  PostgreSQL  │
│   (NestJS)  │     │  Port 5432   │
│  Port 3001  │     └──────────────┘
└──────┬──────┘
       │            ┌──────────────┐
       ├───────────►│   MongoDB    │
       │            │  Port 27017  │
       │            └──────────────┘
       │
       │            ┌──────────────┐
       ├───────────►│    Redis     │
       │            │  Port 6379   │
       │            └──────────────┘
       │
       │            ┌──────────────┐
       └───────────►│Elasticsearch │
                    │  Port 9200   │
                    └──────────────┘
```

---

## ⚙️ Pré-requisitos

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recomendado)
- **Docker** e **Docker Compose** (para databases)
- **Git**

---

## 📦 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/nexora.git
cd nexora
```

### 2. Instale as dependências

```bash
# Instalar pnpm globalmente (se não tiver)
npm install -g pnpm

# Instalar dependências do projeto
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
# Frontend (.env)
cp apps/web/.env.example apps/web/.env

# Backend (.env)
cp apps/api/.env.example apps/api/.env
```

**Edite os arquivos `.env` com suas configurações.**

### 4. Inicie os serviços com Docker

```bash
docker-compose up -d
```

Isso iniciará:
- PostgreSQL (porta 5432)
- MongoDB (porta 27017)
- Redis (porta 6379)
- Elasticsearch (porta 9200)
- Kibana (porta 5601) - opcional
- Redis Commander (porta 8081) - opcional
- Mongo Express (porta 8082) - opcional

### 5. Execute as migrations do banco de dados

```bash
cd packages/database
pnpm db:generate
pnpm db:migrate
```

---

## 🚀 Desenvolvimento

### Iniciar todos os serviços

```bash
pnpm dev
```

Isso iniciará:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs

### Iniciar serviços individualmente

```bash
# Frontend apenas
pnpm dev --filter=@nexora/web

# Backend apenas
pnpm dev --filter=@nexora/api
```

### Build para produção

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

### Formatar código

```bash
pnpm format
```

---

## 🐳 Docker

### Desenvolvimento com Docker

```bash
# Iniciar todos os containers
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar containers
docker-compose down

# Parar e remover volumes
docker-compose down -v
```

### Build das aplicações

```bash
# Build do frontend
docker build -f apps/web/Dockerfile -t nexora-web .

# Build do backend
docker build -f apps/api/Dockerfile -t nexora-api .
```

### Acessar ferramentas de administração

- **Kibana (Elasticsearch):** http://localhost:5601
- **Redis Commander:** http://localhost:8081
- **Mongo Express:** http://localhost:8082 (user: admin, pass: admin)

---

## 🧪 Testes

### Testes Unitários (Jest)

```bash
# Todos os testes
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

### Testes E2E (Cypress)

```bash
# Abrir Cypress UI
cd apps/web
pnpm cypress:open

# Executar headless
pnpm cypress:run
```

---

## 📤 Deploy

### Vercel (Frontend)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel
```

### AWS / DigitalOcean (Backend)

1. Build da imagem Docker
2. Push para container registry
3. Deploy no seu serviço preferido

### GitHub Actions

O projeto inclui workflows de CI/CD automatizados:
- ✅ Lint e type-check em PRs
- ✅ Testes automatizados
- ✅ Build e deploy automático
- ✅ Build de imagens Docker

---

## 📁 Estrutura do Projeto

```
NexORA/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
│       ├── ci-cd.yml
│       ├── docker.yml
│       └── pr-checks.yml
├── apps/
│   ├── web/               # Frontend Next.js
│   │   ├── src/
│   │   │   ├── app/       # App Router pages
│   │   │   ├── components/# React components
│   │   │   ├── lib/       # Utilities
│   │   │   └── styles/    # Global styles
│   │   ├── public/        # Static assets
│   │   ├── cypress/       # E2E tests
│   │   ├── Dockerfile
│   │   ├── next.config.js
│   │   └── package.json
│   └── api/               # Backend NestJS
│       ├── src/
│       │   ├── modules/   # Feature modules
│       │   │   ├── auth/
│       │   │   ├── users/
│       │   │   ├── projects/
│       │   │   ├── tasks/
│       │   │   └── websocket/
│       │   ├── app.module.ts
│       │   └── main.ts
│       ├── test/          # E2E tests
│       ├── Dockerfile
│       └── package.json
├── packages/
│   ├── ui/                # Shared UI components
│   │   ├── components/
│   │   └── lib/
│   ├── types/             # Shared TypeScript types
│   ├── database/          # Prisma schema
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── package.json
│   └── config/            # Shared config
├── docker-compose.yml     # Docker services
├── turbo.json            # Turborepo config
├── package.json          # Root package.json
└── README.md
```

---

## ✨ Features

### ✅ Implementadas

- [x] Autenticação JWT
- [x] CRUD de usuários
- [x] CRUD de projetos
- [x] CRUD de tarefas
- [x] WebSocket para real-time
- [x] API REST documentada (Swagger)
- [x] GraphQL API
- [x] Integração PostgreSQL com Prisma
- [x] Docker compose para desenvolvimento
- [x] CI/CD com GitHub Actions
- [x] Testes unitários e E2E
- [x] Interface responsiva

### 🚧 Em Desenvolvimento

- [ ] Drag & drop de tarefas
- [ ] Editor rico (Tiptap)
- [ ] Sistema de comentários
- [ ] Notificações em tempo real
- [ ] Upload de arquivos
- [ ] Busca avançada (Elasticsearch)
- [ ] Integração OpenAI
- [ ] Dashboard de analytics
- [ ] Calendário de tarefas
- [ ] Kanban board

### 🔮 Roadmap Futuro

- [ ] Automação de workflows (n8n)
- [ ] Integração Zapier
- [ ] Mobile app (React Native)
- [ ] Colaboração tipo Google Docs
- [ ] Versionamento de documentos
- [ ] Integrações (Slack, Discord, etc)
- [ ] SSO (SAML)
- [ ] Audit logs
- [ ] Multi-tenancy

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Por favor:

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Convenção de Commits

Seguimos a convenção [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` Nova feature
- `fix:` Correção de bug
- `docs:` Documentação
- `style:` Formatação
- `refactor:` Refatoração
- `test:` Testes
- `chore:` Manutenção

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Equipe

**NexORA Team** - [GitHub](https://github.com/seu-usuario)

---

## 📞 Suporte

- 📧 Email: support@nexora.dev
- 💬 Discord: [Join our server](https://discord.gg/nexora)
- 📖 Docs: [docs.nexora.dev](https://docs.nexora.dev)

---

<div align="center">
  <p>Feito com ❤️ usando Next.js, NestJS e TypeScript</p>
  <p>⭐ Se este projeto te ajudou, considere dar uma estrela!</p>
</div>
