# NexORA - Enterprise Task Management Platform

<div align="center">
  <h3>Advanced project and task management with real-time collaboration</h3>
  <p>Next.js 14+ • NestJS • TypeScript • PostgreSQL • MongoDB • Redis • Elasticsearch</p>
  
  <br />
  
  [![Deploy Guide](https://img.shields.io/badge/Deploy_Guide-Click_Here-blue)](README_DEPLOY.md)
  [![Study Deployment](https://img.shields.io/badge/Study_Deploy-Safe-green)](DEPLOY_STUDY.md)
  [![Security](https://img.shields.io/badge/Security-Important-red)](SECURITY_DEPLOY.md)
</div>

---

## Quick Start (Demo/Study)

```bash
# 1. Clone and install
git clone https://github.com/beatrizaraujow/noma-projeto.git
cd noma-projeto
pnpm install

# 2. Configure environment (IMPORTANT!)
cp .env.example .env
# Edit .env with your settings

# 3. Setup database
cd packages/database
npx prisma migrate dev
npx prisma db seed

# 4. Run in development
cd ../..
pnpm dev
```

**Access:** 
- Frontend: http://localhost:3000
- API: http://localhost:3001

**WARNING: This is a STUDY/DEMO project**
- Use only FAKE data for demonstration
- Configure secrets in deploy provider (not in code)
- Read [SECURITY_DEPLOY.md](SECURITY_DEPLOY.md) before public deployment

**Deploy Guides:**
- [Quick Deploy](README_DEPLOY.md) - Deploy in 2-5 minutes
- [Study Deployment](DEPLOY_STUDY.md) - Complete and safe guide
- [Security Guide](SECURITY_DEPLOY.md) - Best practices

---

## Table of Contents

- [About the Project](#about-the-project)
- [Technologies](#technologies)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Development](#development)
- [Docker](#docker)
- [Testing](#testing)
- [Deploy](#deploy)
- [Project Structure](#project-structure)
- [Features](#features)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)

---

## About the Project

**NexORA** is an enterprise task and project management platform, similar to ClickUp and Notion, with advanced features:

- **Real-time Collaboration** with Socket.io
- **Artificial Intelligence** integration (OpenAI)
- **Advanced Analytics** and metrics
- **Full-text Search** with Elasticsearch
- **Robust Authentication** with NextAuth.js
- **Modern Interface** with Tailwind CSS and Shadcn/ui
- **Fully Responsive** and mobile-optimized
- **Enterprise Performance** with Redis cache

---

## Technologies

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
- **PostgreSQL:** Relational data (users, projects, tasks)
- **MongoDB:** Unstructured data (logs, comments)
- **Redis:** Cache, sessions, pub/sub
- **Elasticsearch:** Advanced search and full-text search

### **DevOps & Infrastructure**
- **Containerization:** Docker + Docker Compose
- **Monorepo:** Turborepo
- **CI/CD:** GitHub Actions
- **Testing:** Jest + React Testing Library + Cypress
- **Documentation:** Swagger/OpenAPI

---

## Architecture

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

### **Microservices Architecture**

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

## Prerequisites

- **Node.js** >= 18.0.0
- **pnpm** >= 8.0.0 (recommended)
- **Docker** and **Docker Compose** (for databases)
- **Git**

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/beatrizaraujow/noma-projeto.git
cd nexora
```

### 2. Install dependencies

```bash
# Install pnpm globally (if you don't have it)
npm install -g pnpm

# Install project dependencies
pnpm install
```

### 3. Configure environment variables

```bash
# Frontend (.env)
cp apps/web/.env.example apps/web/.env

# Backend (.env)
cp apps/api/.env.example apps/api/.env
```

**Edit the `.env` files with your settings.**

### 4. Start services with Docker

```bash
docker-compose up -d
```

This will start:
- PostgreSQL (port 5432)
- MongoDB (port 27017)
- Redis (port 6379)
- Elasticsearch (port 9200)
- Kibana (port 5601) - optional
- Redis Commander (port 8081) - optional
- Mongo Express (port 8082) - optional

### 5. Run database migrations

```bash
cd packages/database
pnpm db:generate
pnpm db:migrate
```

---

## Development

### Start all services

```bash
pnpm dev
```

This will start:
- **Frontend:** http://localhost:3000
- **Backend:** http://localhost:3001
- **API Docs:** http://localhost:3001/api/docs

### Start services individually

```bash
# Frontend only
pnpm dev --filter=@nexora/web

# Backend only
pnpm dev --filter=@nexora/api
```

### Build for production

```bash
pnpm build
```

### Linting

```bash
pnpm lint
```

### Format code

```bash
pnpm format
```

---

## Docker

### Development with Docker

```bash
# Start all containers
docker-compose up -d

# View logs
docker-compose logs -f

# Stop containers
docker-compose down

# Stop and remove volumes
docker-compose down -v
```

### Build applications

```bash
# Build frontend
docker build -f apps/web/Dockerfile -t nexora-web .

# Build backend
docker build -f apps/api/Dockerfile -t nexora-api .
```

### Access administration tools

- **Kibana (Elasticsearch):** http://localhost:5601
- **Redis Commander:** http://localhost:8081
- **Mongo Express:** http://localhost:8082 (user: admin, pass: admin)

---

## Testing

### Unit Tests (Jest)

```bash
# All tests
pnpm test

# Watch mode
pnpm test:watch

# Coverage
pnpm test:cov
```

### E2E Tests (Cypress)

```bash
# Open Cypress UI
cd apps/web
pnpm cypress:open

# Run headless
pnpm cypress:run
```

---

## Deploy

### Vercel (Frontend)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd apps/web
vercel
```

### AWS / DigitalOcean (Backend)

1. Build Docker image
2. Push to container registry
3. Deploy to your preferred service

### GitHub Actions

The project includes automated CI/CD workflows:
- Lint and type-check on PRs
- Automated tests
- Automatic build and deploy
- Docker image builds

---

## Project Structure

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

## Features

### Implemented

- [x] JWT Authentication
- [x] User CRUD
- [x] Project CRUD
- [x] Task CRUD
- [x] Real-time WebSocket
- [x] Documented REST API (Swagger)
- [x] GraphQL API
- [x] PostgreSQL integration with Prisma
- [x] Docker compose for development
- [x] CI/CD with GitHub Actions
- [x] Unit and E2E tests
- [x] Responsive interface

### In Development

- [ ] Task drag & drop
- [ ] Rich editor (Tiptap)
- [ ] Comment system
- [ ] Real-time notifications
- [ ] File upload
- [ ] Advanced search (Elasticsearch)
- [ ] OpenAI integration
- [ ] Analytics dashboard
- [ ] Task calendar
- [ ] Kanban board

### Future Roadmap

- [ ] Workflow automation (n8n)
- [ ] Zapier integration
- [ ] Mobile app (React Native)
- [ ] Google Docs-like collaboration
- [ ] Document versioning
- [ ] Integrations (Slack, Discord, etc)
- [ ] SSO (SAML)
- [ ] Audit logs
- [ ] Multi-tenancy

---

## Contributing

Contributions are welcome! Please:

1. Fork the project
2. Create a branch for your feature (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'feat: Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Commit Convention

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation
- `style:` Formatting
- `refactor:` Refactoring
- `test:` Tests
- `chore:` Maintenance

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---

## Team

**NexORA Team** - [GitHub](https://github.com/beatrizaraujow)

---

## Support

- Email: support@nexora.dev
- Discord: [Join our server](https://discord.gg/nexora)
- Docs: [docs.nexora.dev](https://docs.nexora.dev)

---

<div align="center">
  <p>Made with Next.js, NestJS and TypeScript</p>
  <p>If this project helped you, consider giving it a star!</p>
</div>
