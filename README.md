# NOMA — Plataforma de Gestão de Projetos e Tarefas

Plataforma web para **gestão de projetos e tarefas**, inspirada em ferramentas como ClickUp/Notion, com **colaboração em tempo real** e arquitetura moderna em **monorepo**.

> Este repositório é voltado para **estudo/demonstração**. Evite usar dados reais e leia as recomendações de segurança antes de publicar em produção.

---

## Visão geral

O **NOMA** reúne:
- **Frontend** em Next.js (App Router) com UI moderna (Tailwind + shadcn/ui)
- **Backend** em NestJS com APIs **REST** e **GraphQL**
- **Tempo real** via WebSockets/Socket.io
- **Persistência** com PostgreSQL (via Prisma) e suporte a serviços complementares (Redis, MongoDB, Elasticsearch) conforme configuração do projeto

---

## Principais recursos

- Autenticação (JWT / NextAuth conforme configuração)
- CRUD de Usuários, Projetos e Tarefas
- Atualizações em tempo real (WebSocket)
- Documentação de API (Swagger)
- Ambiente de desenvolvimento com Docker Compose
- Monorepo (Turborepo) com pacotes compartilhados

---

## Tecnologias

**Frontend**
- Next.js + TypeScript
- Tailwind CSS + shadcn/ui
- Zustand + TanStack Query
- Componentes e views (Kanban/Lista/Calendário/Timeline)

**Backend**
- NestJS + TypeScript
- REST + GraphQL (Apollo)
- WebSockets/Socket.io
- Validação (class-validator / class-transformer)

**Dados/Infra**
- Prisma + PostgreSQL
- Docker / Docker Compose
- Redis / MongoDB / Elasticsearch (dependendo do setup)

---

## Estrutura do projeto (resumo)

```text
.
├── apps/
│   ├── web/          # Frontend (Next.js)
│   └── api/          # Backend (NestJS)
├── packages/
│   ├── database/     # Prisma schema, migrations, seed
│   ├── ui/           # Componentes compartilhados
│   ├── types/        # Tipos TypeScript compartilhados
│   └── config/       # Configurações compartilhadas
├── docker-compose.yml
├── turbo.json
└── package.json
