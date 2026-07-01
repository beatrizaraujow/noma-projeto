# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Changed
- Documentação reescrita para refletir a stack real (`README.md`, `docs/ARCHITECTURE.md`).
- `.gitignore` reorganizado e reforçado (regras de `.env` explícitas, `.claude/` ignorado).

### Removed
- Removidos ~45 arquivos de documentação de processo/status redundantes (raiz e `docs/`)
  e `DEMO_COMPONENTS.html`, mantendo apenas a documentação de referência.

### Added
- Initial project setup with Turborepo monorepo structure
- Next.js 14+ frontend with TypeScript and Tailwind CSS
- NestJS backend with TypeScript and Prisma ORM
- Authentication system with JWT and NextAuth.js
- PostgreSQL database integration (via Prisma — fonte única de dados)
- WebSocket support with Socket.io for real-time features
- CI/CD pipelines with GitHub Actions
- Comprehensive test setup (Jest + Cypress)
- API documentation with Swagger/OpenAPI
- Shared packages for UI components, types, and configuration

> Nota: `mongoose`, `ioredis`/`bull` e `elasticsearch` constam nas dependências mas **não estão
> ativos** no app em execução; GraphQL/Apollo está comentado (a API é REST).

### Features in Development
- Drag & drop task management
- Rich text editor with Tiptap
- Real-time notifications
- File upload system
- Advanced analytics dashboard
- Calendar view for tasks

## [1.0.0] - 2026-01-13

### Added
- Initial release
- Core task management features
- Project organization
- User authentication
- Real-time collaboration foundation
