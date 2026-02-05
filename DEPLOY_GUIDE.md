# 🚀 Guia de Deploy Simplificado - NOMA (Versão Estudo)

## 📋 O que está incluído no repositório

### ✅ Código Essencial
- `apps/` - Aplicações (API e Web)
- `packages/` - Pacotes compartilhados (Database, Types, UI)
- `docs/` - Documentação completa
- Arquivos de configuração (.example)

### ❌ Excluído do Git
- `node_modules/` - Dependências (serão instaladas)
- `.env` - Variáveis de ambiente locais
- `dist/`, `build/`, `.next/` - Builds compilados
- Logs e arquivos temporários

---

## 🎯 Estrutura Limpa para Estudo

```
NOMA/
├── apps/
│   ├── api/              # Backend NestJS
│   │   ├── src/
│   │   │   ├── modules/  # Módulos da aplicação
│   │   │   │   ├── integrations/  ⭐ FASE 2
│   │   │   │   ├── tasks/
│   │   │   │   ├── projects/
│   │   │   │   └── ...
│   │   │   └── main.ts
│   │   └── package.json
│   │
│   └── web/              # Frontend Next.js
│       ├── src/
│       │   ├── app/
│       │   └── components/
│       └── package.json
│
├── packages/
│   ├── database/         # Prisma Schema
│   │   └── prisma/
│   │       └── schema.prisma  ⭐ Modelos da Fase 2
│   ├── types/            # TypeScript Types
│   └── ui/               # Componentes UI
│
├── docs/                 # Documentação
│   ├── INTEGRATIONS.md   ⭐ Doc das Integrações
│   └── ...
│
├── docker-compose.yml    # Docker setup
├── package.json          # Scripts principais
└── README.md
```

---

## 🔧 Setup para Novo Desenvolvedor

### 1. Clonar o Repositório

```bash
git clone https://github.com/beatrizaraujow/noma-projeto.git
cd noma-projeto
```

### 2. Instalar Dependências

```bash
# Instalar pnpm (se não tiver)
npm install -g pnpm

# Instalar dependências do projeto
pnpm install
```

### 3. Configurar Variáveis de Ambiente

```bash
# API
cp apps/api/.env.example apps/api/.env

# Web
cp apps/web/.env.example apps/web/.env

# Database
cp packages/database/.env.example packages/database/.env
```

**Editar os arquivos .env:**

`packages/database/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexora"
```

`apps/api/.env`:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nexora"
PORT=3001
JWT_SECRET="your-secret-key"
```

`apps/web/.env`:
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 4. Iniciar Banco de Dados

**Opção A: Docker (Recomendado)**
```bash
docker-compose up -d postgres
```

**Opção B: PostgreSQL Local**
- Instalar PostgreSQL
- Criar banco `nexora`

### 5. Aplicar Migrações

```bash
cd packages/database
npx prisma migrate dev
npx prisma generate
```

### 6. Iniciar Aplicação

```bash
# Voltar para raiz
cd ../..

# Iniciar tudo
pnpm dev

# OU iniciar separadamente:
# Terminal 1 - API
cd apps/api && pnpm dev

# Terminal 2 - Web
cd apps/web && pnpm dev
```

### 7. Acessar

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001
- **API Docs:** http://localhost:3001/api

---

## 📚 Estudando as Integrações (Fase 2)

### Arquivos Principais para Estudo:

#### 1. **Schema do Banco de Dados**
📁 `packages/database/prisma/schema.prisma`
```prisma
// Veja os 5 novos modelos:
- GitHubPullRequest
- FigmaFile
- CloudFile
- WebhookEndpoint
- WebhookCall
```

#### 2. **Serviços Backend**
📁 `apps/api/src/modules/integrations/services/`
```
├── github.service.ts       ⭐ GitHub API integration
├── figma.service.ts        ⭐ Figma API integration
├── cloud-storage.service.ts ⭐ Google Drive/Dropbox
└── webhook.service.ts      ⭐ Zapier/Make.com
```

#### 3. **Controller REST**
📁 `apps/api/src/modules/integrations/integrations.controller.ts`
- 36 endpoints REST
- Organizado por funcionalidade

#### 4. **Frontend**
📁 `apps/web/src/components/IntegrationManager.tsx`
- UI completa para gerenciar integrações
- Formulários dinâmicos

#### 5. **Documentação**
📁 `docs/INTEGRATIONS.md`
- Exemplos de uso
- Configurações
- Troubleshooting

---

## 🎓 Fluxo de Aprendizado Sugerido

### Iniciante
1. Entender estrutura do projeto (`package.json`, `turbo.json`)
2. Explorar schema Prisma (`packages/database/prisma/schema.prisma`)
3. Ver endpoints REST (`integrations.controller.ts`)

### Intermediário
1. Estudar serviços de integração
2. Entender injeção de dependências (NestJS)
3. Ver como usar APIs externas (GitHub, Figma)

### Avançado
1. Implementar nova integração
2. Adicionar testes
3. Melhorar error handling
4. Adicionar cache com Redis

---

## 🔍 Pontos de Atenção para Estudo

### 1. **Type Safety com Prisma**
```typescript
// Note o uso de type assertions para modelos não migrados
await (this.prisma as any).gitHubPullRequest.findMany()
```
💡 Isso é temporário até migração ser aplicada

### 2. **Error Handling**
```typescript
// Helper function para type-safe error messages
import { getErrorMessage } from './types';

try {
  // código
} catch (error) {
  throw new Error(`Failed: ${getErrorMessage(error)}`);
}
```

### 3. **Dependency Injection (NestJS)**
```typescript
@Injectable()
export class IntegrationsService {
  constructor(
    private readonly githubService: GitHubService,
    private readonly figmaService: FigmaService,
    // ...
  ) {}
}
```

### 4. **API Calls com Fetch Nativo**
```typescript
const response = await fetch('https://api.github.com/...', {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```
💡 Node 18+ tem fetch nativo

---

## 📦 Comandos Úteis

```bash
# Limpar tudo e reinstalar
pnpm clean
pnpm install

# Build para produção
pnpm build

# Rodar testes
pnpm test

# Verificar erros TypeScript
cd apps/api && npx tsc --noEmit

# Ver logs do Docker
docker-compose logs -f

# Resetar banco de dados
cd packages/database
npx prisma migrate reset

# Abrir Prisma Studio (visualizar dados)
npx prisma studio
```

---

## 🚀 Deploy em Produção

### Opção 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
```bash
cd apps/web
vercel --prod
```

**Backend (Railway):**
1. Criar conta: https://railway.app/
2. Conectar repo GitHub
3. Railway detecta automaticamente
4. Adicionar PostgreSQL

### Opção 2: Docker Compose

```bash
docker-compose -f docker-compose.prod.yml up -d --build
```

---

## 📊 Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| **Integrações** | 12 tipos |
| **Endpoints REST** | 36 endpoints |
| **Modelos Prisma** | 9 modelos de integração |
| **Serviços** | 8 serviços |
| **Linhas de Código** | ~5000 linhas |
| **Tecnologias** | NestJS, Next.js, Prisma, PostgreSQL |

---

## 🆘 Problemas Comuns

### "Cannot reach database server"
- ✅ Iniciar Docker: `docker-compose up -d postgres`
- ✅ Ou instalar PostgreSQL localmente

### "Property 'gitHubPullRequest' does not exist"
- ✅ Executar: `npx prisma generate`

### "Module not found"
- ✅ Executar: `pnpm install`

### "Port 3000 already in use"
- ✅ Matar processo: `npx kill-port 3000`

---

## 🎯 Próximos Passos

1. ✅ Clonar repositório
2. ✅ Instalar dependências
3. ✅ Configurar .env
4. ✅ Iniciar PostgreSQL
5. ✅ Aplicar migrações
6. ✅ Estudar código
7. 🚀 Contribuir!

---

## 📞 Suporte

- **Documentação:** `/docs`
- **Issues:** GitHub Issues
- **Wiki:** GitHub Wiki

---

**Boa sorte nos estudos!** 🎓
