# Integrations Module

Sistema completo de integrações do NOMA para conectar com ferramentas externas.

## 🚀 Setup

### 1. Executar migração do banco de dados

```bash
cd packages/database
npx prisma migrate dev --name add_integrations_phase2
npx prisma generate
```

### 2. Verificar instalação

```bash
# Verificar se os serviços compilam
cd apps/api
pnpm build
```

## 📦 Serviços Disponíveis

### Fase 1 - Básico

#### SlackService
- Envio de notificações via webhook
- Mensagens ricas com formatação
- Notificações de eventos de tarefas

#### DiscordService
- Envio de notificações via webhook
- Embeds personalizados
- Notificações de tarefas, comentários e projetos

#### EmailService
- Criação de tarefas via email (IMAP)
- Parsing inteligente de emails
- Detecção automática de prioridade

#### CalendarService
- Sincronização com Google Calendar
- Sincronização com Outlook Calendar
- OAuth 2.0 authentication

### Fase 2 - Essencial

#### GitHubService
- Link Pull Requests para tasks
- Webhooks de eventos de PRs
- Sincronização de repositórios
- Status de PRs nas tasks

#### FigmaService
- Embed de arquivos Figma
- Sincronização de metadados
- Thumbnails automáticos
- Webhooks de atualizações

#### CloudStorageService
- Google Drive integration
- Dropbox integration
- Links compartilháveis
- Sincronização de arquivos

#### WebhookService
- Criação de endpoints personalizados
- Trigger em eventos customizados
- Verificação HMAC
- Logs de chamadas
- Retry automático

## 🔧 Uso

### Exemplo 1: Enviar notificação Slack

```typescript
import { SlackService } from './services/slack.service';

// No seu serviço
constructor(
  private readonly slackService: SlackService
) {}

// Enviar notificação
await this.slackService.sendTaskNotification(
  config,
  task,
  'created'
);
```

### Exemplo 2: Link GitHub PR to Task

```typescript
import { GitHubService } from './services/github.service';

// Link PR
await this.githubService.linkPRToTask(
  {
    workspaceId: 'ws_123',
    taskId: 'task_456',
    repository: 'owner/repo',
    prNumber: 42
  },
  { token: 'ghp_xxx' }
);
```

### Exemplo 3: Attach Figma File

```typescript
import { FigmaService } from './services/figma.service';

// Attach design
await this.figmaService.attachFile(
  {
    workspaceId: 'ws_123',
    fileKey: 'abc123xyz',
    taskId: 'task_456',
    createdBy: 'user_789'
  },
  { accessToken: 'figd_xxx' }
);
```

### Exemplo 4: Create Webhook Endpoint

```typescript
import { WebhookService } from './services/webhook.service';

// Create webhook
const webhook = await this.webhookService.createEndpoint({
  workspaceId: 'ws_123',
  name: 'Zapier Integration',
  provider: 'zapier',
  events: ['task.created', 'task.updated'],
  createdBy: 'user_789'
});

// Use webhook.endpoint.url in Zapier
```

## 🐛 Troubleshooting

### Erro: Cannot find module '@nestjs/common'
Execute: `pnpm install`

### Erro: Property 'calendarEvent' does not exist
Execute:
```bash
cd packages/database
npx prisma generate
```

### Erro: Cannot find name 'fetch'
O projeto requer Node.js 18+ que inclui fetch nativo.

### GitHub API rate limit
Use Personal Access Token com permissões adequadas para aumentar o limite.

### Figma embed não carrega
Verifique se o arquivo é público ou se o access token tem permissões corretas.

## 📚 Documentação

Veja [INTEGRATIONS.md](../../../../docs/INTEGRATIONS.md) para documentação completa.

## 📊 Estatísticas

- **Total de Integrações:** 12 tipos
- **Total de Endpoints:** 36 endpoints
- **Total de Serviços:** 8 serviços
- **Total de Modelos:** 9 modelos de banco
