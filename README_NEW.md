# 🎯 NOMA - Sistema de Gerenciamento com Integrações

[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma&logoColor=white)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)

> **Plataforma completa de gerenciamento de projetos e tarefas com 12 integrações essenciais**

---

## 🌟 Destaques do Projeto

- ✅ **Sistema Completo de Integrações** - 12 tipos de integrações (GitHub, Figma, Slack, etc.)
- 🎨 **Interface Moderna** - Next.js 14 + Tailwind CSS + Shadcn/ui
- 🚀 **API RESTful** - 36 endpoints organizados
- 📊 **Type-Safe** - TypeScript + Prisma em todo o código
- 🔐 **Autenticação** - Sistema robusto de auth
- 📱 **Responsivo** - Mobile-first design
- 🐳 **Docker Ready** - Setup com um comando

---

## 🔌 Integrações Disponíveis

### Fase 1 - Notificações e Sync
- ✅ **Slack** - Notificações em tempo real
- ✅ **Discord** - Embeds personalizados
- ✅ **Email (IMAP)** - Criar tasks por email
- ✅ **Google Calendar** - Sincronização de eventos
- ✅ **Outlook Calendar** - Sincronização de eventos

### Fase 2 - Colaboração (⭐ NOVO)
- ✅ **GitHub** - Link PRs para tasks, webhooks
- ✅ **Figma** - Embed de designs, sync automático
- ✅ **Google Drive** - Anexar arquivos
- ✅ **Dropbox** - Anexar arquivos
- ✅ **Zapier** - Webhooks customizados
- ✅ **Make.com** - Automações
- ✅ **Custom Webhooks** - API aberta

📚 **[Ver Documentação Completa](docs/INTEGRATIONS.md)**

---

## 🚀 Quick Start

### 1️⃣ Pré-requisitos

```bash
# Node.js 18+
node --version

# pnpm
npm install -g pnpm

# Docker (para PostgreSQL)
docker --version
```

### 2️⃣ Clone e Instale

```bash
git clone https://github.com/beatrizaraujow/noma-projeto.git
cd noma-projeto

# Instalar dependências
pnpm install
```

### 3️⃣ Configure Ambiente

```bash
# Copiar arquivos de exemplo
cp packages/database/.env.example packages/database/.env
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env

# Editar com suas configurações
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexora"
```

### 4️⃣ Iniciar Banco de Dados

```bash
# Com Docker (recomendado)
docker-compose up -d postgres

# Aguardar 30 segundos, depois:
cd packages/database
npx prisma migrate dev
npx prisma generate
```

### 5️⃣ Rodar Aplicação

```bash
# Na raiz do projeto
pnpm dev

# Acessar:
# Frontend: http://localhost:3000
# API: http://localhost:3001
```

---

## 📁 Estrutura do Projeto

```
NOMA/
├── apps/
│   ├── api/                    # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/
│   │   │   │   ├── integrations/  ⭐ Sistema de Integrações
│   │   │   │   │   ├── services/
│   │   │   │   │   │   ├── github.service.ts
│   │   │   │   │   │   ├── figma.service.ts
│   │   │   │   │   │   ├── cloud-storage.service.ts
│   │   │   │   │   │   └── webhook.service.ts
│   │   │   │   │   ├── integrations.controller.ts
│   │   │   │   │   └── integrations.service.ts
│   │   │   │   ├── tasks/
│   │   │   │   ├── projects/
│   │   │   │   └── users/
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/                    # Frontend Next.js
│       ├── src/
│       │   ├── app/
│       │   ├── components/
│       │   │   └── IntegrationManager.tsx  ⭐ UI das Integrações
│       │   └── hooks/
│       └── package.json
│
├── packages/
│   ├── database/               # Prisma ORM
│   │   └── prisma/
│   │       ├── schema.prisma   ⭐ 9 modelos de integração
│   │       └── migrations/
│   ├── types/                  # TypeScript shared types
│   └── ui/                     # Componentes compartilhados
│
├── docs/                       # Documentação
│   ├── INTEGRATIONS.md         ⭐ Guia completo das integrações
│   ├── API.md
│   └── ARCHITECTURE.md
│
├── docker-compose.yml
├── package.json
└── README.md
```

---

## 💻 Tech Stack

### Frontend
- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript 5.9+
- **Styling:** Tailwind CSS
- **Components:** Shadcn/ui
- **State:** Zustand + TanStack Query

### Backend
- **Framework:** NestJS 10
- **Language:** TypeScript 5.9+
- **ORM:** Prisma 5.22
- **Validation:** class-validator
- **Auth:** JWT

### Database
- **Primary:** PostgreSQL 16
- **Cache:** Redis (opcional)
- **Search:** Elasticsearch (opcional)

### DevOps
- **Container:** Docker + Docker Compose
- **Monorepo:** Turborepo
- **Package Manager:** pnpm

---

## 🎓 Para Estudantes

### Conceitos Aplicados no Projeto

1. **Arquitetura Modular** (NestJS)
   - Dependency Injection
   - Service Layer Pattern
   - Controller/Service separation

2. **Type Safety** (TypeScript)
   - Prisma types
   - DTOs com class-validator
   - Error handling type-safe

3. **API Design** (REST)
   - RESTful conventions
   - Query parameters
   - Body validation

4. **Integrações Externas**
   - OAuth 2.0 flows
   - Webhook handling
   - HMAC signature verification
   - API rate limiting

5. **Frontend Moderno**
   - React Server Components
   - Client Components
   - Form handling
   - State management

### Arquivos Recomendados para Estudo

| Nível | Arquivos | Conceitos |
|-------|----------|-----------|
| **Iniciante** | `schema.prisma` | Database modeling |
| | `integrations.controller.ts` | REST endpoints |
| | `IntegrationManager.tsx` | React components |
| **Intermediário** | `github.service.ts` | External API calls |
| | `webhook.service.ts` | Webhook system |
| | `integrations.service.ts` | Business logic |
| **Avançado** | `cloud-storage.service.ts` | Multi-provider pattern |
| | `types.ts` | Type utilities |
| | Full module structure | Architecture patterns |

📚 **[Ver Guia de Deploy](DEPLOY_GUIDE.md)**

---

## 🔧 Comandos Úteis

```bash
# Desenvolvimento
pnpm dev                    # Iniciar tudo
pnpm dev --filter=api       # Apenas API
pnpm dev --filter=web       # Apenas Web

# Build
pnpm build                  # Build tudo
pnpm build --filter=api     # Build API

# Database
cd packages/database
npx prisma studio           # Visualizar dados
npx prisma migrate dev      # Criar migração
npx prisma generate         # Gerar cliente

# Docker
docker-compose up -d        # Subir tudo
docker-compose up -d postgres  # Apenas PostgreSQL
docker-compose logs -f      # Ver logs
docker-compose down         # Parar tudo

# Linting
pnpm lint                   # Verificar código

# TypeScript
cd apps/api
npx tsc --noEmit           # Verificar tipos
```

---

## 📊 Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| **Linhas de Código** | ~5,000+ |
| **Módulos Backend** | 15+ |
| **Endpoints REST** | 36+ |
| **Integrações** | 12 tipos |
| **Modelos Prisma** | 25+ |
| **Componentes React** | 30+ |
| **Testes** | Em desenvolvimento |

---

## 🗺️ Roadmap

### ✅ Concluído
- [x] Autenticação e autorização
- [x] Sistema de projetos e tasks
- [x] Sistema de comentários
- [x] Integrações Fase 1 (Slack, Discord, Email, Calendar)
- [x] Integrações Fase 2 (GitHub, Figma, Cloud, Webhooks)
- [x] Frontend moderno
- [x] Documentação completa

### 🚧 Em Desenvolvimento
- [ ] Testes E2E
- [ ] CI/CD pipeline
- [ ] Performance optimization
- [ ] Cache com Redis

### 📋 Planejado
- [ ] Mobile app (React Native)
- [ ] Mais integrações (Trello, Asana, Jira)
- [ ] AI features (GPT-4)
- [ ] Analytics dashboard
- [ ] Workspace customization

---

## 📚 Documentação

- 📖 **[Guia de Integrações](docs/INTEGRATIONS.md)** - Documentação completa das integrações
- 🚀 **[Guia de Deploy](DEPLOY_GUIDE.md)** - Setup e deploy simplificado
- 🏗️ **[Arquitetura](docs/ARCHITECTURE.md)** - Design do sistema
- 🔌 **[API Reference](docs/API.md)** - Endpoints da API
- 📝 **[Changelog](CHANGELOG.md)** - Histórico de mudanças

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

## 👥 Autores

- **Beatriz Araujo** - [@beatrizaraujow](https://github.com/beatrizaraujow)

---

## 🙏 Agradecimentos

- Next.js team
- NestJS team
- Prisma team
- Shadcn/ui
- Comunidade open source

---

## 📞 Contato

- **GitHub:** [@beatrizaraujow](https://github.com/beatrizaraujow)
- **Email:** [seu-email]
- **LinkedIn:** [seu-linkedin]

---

<div align="center">
  <p>Feito com ❤️ para a comunidade dev</p>
  <p>⭐ Deixe uma estrela se este projeto te ajudou!</p>
</div>
