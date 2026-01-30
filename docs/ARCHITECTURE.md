# NexORA Project Architecture

## System Overview

NexORA é uma plataforma enterprise de gerenciamento de tarefas construída com arquitetura de microsserviços usando um monorepo Turborepo.

## Architecture Layers

### 1. Presentation Layer (Frontend)
- **Framework:** Next.js 14 with App Router
- **Rendering:** SSR (Server-Side Rendering) + SSG (Static Site Generation)
- **State Management:** Zustand (global) + TanStack Query (server state)
- **Real-time:** Socket.io client
- **Styling:** Tailwind CSS + Shadcn/ui components

### 2. Application Layer (Backend)
- **Framework:** NestJS with modular architecture
- **API Styles:**
  - REST API (primary)
  - GraphQL (Apollo Server)
  - WebSockets (Socket.io)
- **Authentication:** JWT + Passport strategies
- **Authorization:** RBAC (Role-Based Access Control)

### 3. Data Layer
```
┌─────────────────────────────────────────┐
│           Data Access Layer             │
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │ Prisma   │  │ Mongoose │           │
│  │ (ORM)    │  │ (ODM)    │           │
│  └────┬─────┘  └────┬─────┘           │
│       │             │                  │
│       ▼             ▼                  │
│  ┌──────────┐  ┌──────────┐           │
│  │PostgreSQL│  │ MongoDB  │           │
│  └──────────┘  └──────────┘           │
│                                         │
│  ┌──────────┐  ┌──────────┐           │
│  │  Redis   │  │Elastic-  │           │
│  │  Cache   │  │ search   │           │
│  └──────────┘  └──────────┘           │
└─────────────────────────────────────────┘
```

## Data Flow

### Request Flow (REST API)
```
Client Request
    ↓
Next.js Middleware (Auth check)
    ↓
API Route Handler
    ↓
NestJS Controller
    ↓
Service Layer (Business Logic)
    ↓
Repository/Prisma (Data Access)
    ↓
Database
    ↓
Response Pipeline
    ↓
Client
```

### WebSocket Flow
```
Client Connection
    ↓
Socket.io Gateway
    ↓
Authentication
    ↓
Join Room (Project/Task)
    ↓
Event Handlers
    ↓
Broadcast to Room
    ↓
Real-time Update
```

## Module Structure

### Backend Modules

```
src/
├── modules/
│   ├── auth/           # Authentication & Authorization
│   ├── users/          # User management
│   ├── projects/       # Project CRUD
│   ├── tasks/          # Task management
│   ├── comments/       # Comments system
│   ├── activities/     # Activity logs
│   ├── websocket/      # Real-time gateway
│   └── database/       # Database connections
```

### Frontend Structure

```
src/
├── app/                # Next.js App Router
│   ├── (auth)/        # Auth pages
│   ├── (dashboard)/   # Dashboard pages
│   └── api/           # API routes
├── components/
│   ├── ui/            # Base UI components
│   ├── features/      # Feature components
│   └── layout/        # Layout components
├── lib/
│   ├── api/           # API client
│   ├── hooks/         # Custom hooks
│   └── utils/         # Utilities
└── stores/            # Zustand stores
```

## Shared Packages

### @nexora/types
- Shared TypeScript interfaces and types
- DTOs (Data Transfer Objects)
- API response types

### @nexora/ui
- Reusable UI components
- Based on Shadcn/ui
- Shared across frontend apps

### @nexora/database
- Prisma schema
- Database client
- Migrations

### @nexora/config
- Shared configuration
- Constants
- Environment-specific configs

## Security Architecture

### Authentication Flow
```
1. User Login → Credentials
2. Backend validates → User exists?
3. Password check → bcrypt.compare()
4. Generate JWT → access_token + refresh_token
5. Store refresh token → Database/Redis
6. Return tokens → Client
7. Client stores → httpOnly cookie (refresh) + memory (access)
8. Subsequent requests → Bearer token in header
9. Token validation → JWT verify middleware
10. Access granted → Continue to route handler
```

### Authorization Levels
- **PUBLIC:** No authentication required
- **AUTHENTICATED:** Valid JWT required
- **ROLE-BASED:** Specific role required (USER, ADMIN)
- **RESOURCE-BASED:** Owner or member of resource

## Caching Strategy

### Multi-Level Cache
```
Request
    ↓
1. Browser Cache (static assets)
    ↓
2. CDN Cache (Cloudflare)
    ↓
3. Redis Cache (API responses)
    ↓
4. Prisma Query Cache
    ↓
5. Database
```

### Cache Invalidation
- **Time-based:** TTL expiration
- **Event-based:** On data mutations
- **Manual:** Admin trigger

## Scalability Considerations

### Horizontal Scaling
- Stateless backend services
- Load balancer (NGINX)
- Session store in Redis
- Database read replicas

### Vertical Scaling
- Optimized queries
- Database indexing
- Connection pooling
- Query result caching

## Monitoring & Observability

### Metrics
- **APM:** Application Performance Monitoring
- **Logs:** Centralized logging (Winston/Pino)
- **Traces:** Distributed tracing
- **Alerts:** Error threshold alerts

### Health Checks
- Database connectivity
- Redis availability
- API response times
- Error rates

## Deployment Architecture

### Production Setup
```
┌─────────────────────────────────────┐
│         Load Balancer               │
│         (NGINX/AWS ALB)             │
└─────────────┬───────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌─────────┐        ┌─────────┐
│Frontend │        │Backend  │
│Next.js  │        │NestJS   │
│(3 inst.)│        │(5 inst.)│
└────┬────┘        └────┬────┘
     │                  │
     └────────┬─────────┘
              │
    ┌─────────┴──────────┐
    │                    │
    ▼                    ▼
┌─────────┐        ┌─────────┐
│Database │        │  Cache  │
│Cluster  │        │  Redis  │
└─────────┘        └─────────┘
```

## Technology Decisions

### Why Turborepo?
- Efficient monorepo management
- Incremental builds
- Remote caching
- Parallel execution

### Why Next.js?
- SSR/SSG capabilities
- API routes
- Image optimization
- Excellent DX

### Why NestJS?
- TypeScript-first
- Modular architecture
- Dependency injection
- Enterprise-ready

### Why PostgreSQL?
- ACID compliance
- Complex queries
- Mature ecosystem
- JSON support

### Why Redis?
- Fast in-memory storage
- Pub/Sub for real-time
- Session management
- Rate limiting

## Future Enhancements

- [ ] Kubernetes orchestration
- [ ] Service mesh (Istio)
- [ ] Event-driven architecture (Kafka)
- [ ] CQRS pattern implementation
- [ ] GraphQL Federation
- [ ] Microservices decomposition
