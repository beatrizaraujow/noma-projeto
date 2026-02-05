# 🔌 Sistema de Integrações - NOMA

## Visão Geral

Sistema completo de integrações para conectar o NOMA com ferramentas externas, permitindo notificações automáticas, sincronização de dados e automação de tarefas.

## 📦 Integrações Disponíveis

### 1. **Slack Integration**
- ✅ Envio de notificações via webhook
- ✅ Suporte para mensagens ricas com formatações
- ✅ Notificações automáticas de eventos de tarefas
- ✅ Canal padrão configurável

**Configuração:**
```json
{
  "webhookUrl": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "channel": "#general",
  "username": "NOMA Bot"
}
```

**Eventos Suportados:**
- 🆕 Task Created
- ✏️ Task Updated
- ✅ Task Completed
- 👤 Task Assigned

### 2. **Discord Integration**
- ✅ Envio de notificações via webhook
- ✅ Embeds ricos com cores e campos
- ✅ Notificações de tarefas, comentários e projetos
- ✅ Avatar customizável

**Configuração:**
```json
{
  "webhookUrl": "https://discord.com/api/webhooks/YOUR/WEBHOOK",
  "username": "NOMA Bot",
  "avatarUrl": "https://example.com/avatar.png"
}
```

**Eventos Suportados:**
- 🆕 Task Created
- ✏️ Task Updated
- ✅ Task Completed
- 👤 Task Assigned
- 💬 Comment Added
- 🚀 Project Created

### 3. **Email Sync**
- ✅ Sincronização via IMAP
- ✅ Criação automática de tarefas a partir de emails
- ✅ Parsing inteligente de assunto e corpo
- ✅ Detecção automática de prioridade
- ⏳ Envio de emails (SMTP) - Em desenvolvimento

**Configuração:**
```json
{
  "host": "imap.gmail.com",
  "port": 993,
  "secure": true,
  "user": "your-email@gmail.com",
  "password": "app-password",
  "projectId": "project-id",
  "parseEmails": true
}
```

**Funcionalidades:**
- Criar tarefas por email (ex: `project+abc123@tasks.noma.com`)
- Keywords reconhecidas: `Task:`, `Bug:`, `Feature:`, `TODO:`
- Prioridade automática: `urgent`, `critical`, `low priority`

### 4. **Google Calendar Sync**
- ✅ Sincronização bidirecional de eventos
- ✅ OAuth 2.0 authentication
- ✅ Link entre tarefas e eventos
- ⏳ Criação de eventos a partir de tarefas

**Configuração:**
```json
{
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "refreshToken": "YOUR_REFRESH_TOKEN",
  "calendarId": "primary"
}
```

### 5. **Outlook Calendar Sync**
- ✅ Sincronização via Microsoft Graph API
- ✅ OAuth 2.0 authentication
- ✅ Suporte para eventos recorrentes
- ⏳ Notificações de eventos

**Configuração:**
```json
{
  "clientId": "YOUR_CLIENT_ID",
  "clientSecret": "YOUR_CLIENT_SECRET",
  "refreshToken": "YOUR_REFRESH_TOKEN"
}
```

## 🏗️ Arquitetura

### Backend (NestJS)

```
apps/api/src/modules/integrations/
├── integrations.module.ts       # Módulo principal
├── integrations.controller.ts   # Endpoints REST
├── integrations.service.ts      # Lógica de negócio
├── dto/
│   └── index.ts                 # DTOs
└── services/
    ├── slack.service.ts         # Serviço Slack
    ├── discord.service.ts       # Serviço Discord
    ├── email.service.ts         # Serviço Email
    └── calendar.service.ts      # Serviço Calendar
```

### Frontend (Next.js)

```
apps/web/src/components/
└── IntegrationManager.tsx       # UI de gerenciamento
```

### Database (Prisma)

```prisma
model Integration {
  id          String   @id @default(cuid())
  workspaceId String
  type        String
  name        String
  config      Json
  active      Boolean
  logs        IntegrationLog[]
}

model IntegrationLog {
  id            String   @id @default(cuid())
  integrationId String
  action        String
  status        String
  message       String?
}

model CalendarEvent {
  id         String   @id @default(cuid())
  taskId     String?
  provider   String
  externalId String?
  synced     Boolean
}

model EmailInbox {
  id        String   @id @default(cuid())
  email     String   @unique
  projectId String?
  active    Boolean
}
```

## 🔌 API Endpoints

### Integrations

```typescript
POST   /integrations              // Create integration
GET    /integrations              // List all integrations
GET    /integrations/:id          // Get integration details
PUT    /integrations/:id          // Update integration
DELETE /integrations/:id          // Delete integration
POST   /integrations/:id/test     // Test integration
GET    /integrations/:id/logs     // Get integration logs
```

### Specific Endpoints

```typescript
POST /integrations/slack/notify   // Send Slack notification
POST /integrations/discord/notify // Send Discord notification
POST /integrations/email/sync     // Sync emails
POST /integrations/calendar/sync  // Sync calendar events
```

## 🚀 Como Usar

### 1. Configurar Integração no Frontend

```tsx
import IntegrationManager from '@/components/IntegrationManager';

<IntegrationManager 
  workspaceId={workspace.id} 
  token={session.accessToken} 
/>
```

### 2. Enviar Notificação Slack

```typescript
import { SlackService } from './services/slack.service';

await slackService.sendTaskNotification(config, task, 'created');
```

### 3. Sincronizar Emails

```typescript
import { EmailService } from './services/email.service';

await emailService.syncInbox(config, workspaceId);
```

### 4. Sincronizar Calendário

```typescript
import { CalendarService } from './services/calendar.service';

await calendarService.syncEvents(config, 'google_calendar', workspaceId);
```

## 🔐 Segurança

### Webhook URLs
- Todas as URLs de webhook são armazenadas criptografadas
- Validação de origem para webhooks recebidos
- Rate limiting aplicado

### OAuth Tokens
- Tokens armazenados com hash
- Refresh tokens para renovação automática
- Scopes mínimos necessários

### Email Credentials
- Senhas nunca expostas na API
- Suporte para App Passwords
- Criptografia em repouso

## 📊 Logs e Monitoramento

Cada integração registra logs detalhados:

```typescript
interface IntegrationLog {
  action: string;        // 'notification_sent', 'task_created', etc.
  status: 'success' | 'error' | 'pending';
  message?: string;
  metadata?: any;
  createdAt: Date;
}
```

## 🔄 Automação com Integrações

### Exemplo: Notificação Automática no Slack

```typescript
// Em tasks.service.ts
async createTask(data) {
  const task = await this.prisma.task.create({ data });
  
  // Buscar integrações ativas do workspace
  const integrations = await this.prisma.integration.findMany({
    where: {
      workspaceId: task.project.workspaceId,
      type: 'slack',
      active: true,
    },
  });
  
  // Enviar notificação para cada integração
  for (const integration of integrations) {
    await this.slackService.sendTaskNotification(
      integration.config,
      task,
      'created'
    );
  }
  
  return task;
}
```

## 🛠️ Setup Completo

### 1. Atualizar Database

```bash
cd packages/database
npx prisma migrate dev --name add_integrations
npx prisma generate
```

### 2. Adicionar ao app.module.ts

```typescript
import { IntegrationsModule } from './modules/integrations/integrations.module';

@Module({
  imports: [
    // ... outros módulos
    IntegrationsModule,
  ],
})
```

### 3. Variáveis de Ambiente (Opcional)

```env
# Slack
SLACK_WEBHOOK_URL=https://hooks.slack.com/services/...

# Discord
DISCORD_WEBHOOK_URL=https://discord.com/api/webhooks/...

# Email
EMAIL_HOST=imap.gmail.com
EMAIL_PORT=993
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=app-password

# Google Calendar
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret

# Outlook
OUTLOOK_CLIENT_ID=your-client-id
OUTLOOK_CLIENT_SECRET=your-client-secret
```

## 📝 Próximos Passos

### Fase 2 - Integrações Avançadas
- [ ] GitHub/GitLab (sync de issues)
- [ ] Jira (sync bidirecional)
- [ ] Trello (import/export)
- [ ] Asana (migração)
- [ ] Microsoft Teams (notificações)
- [ ] Telegram (bot)

### Fase 3 - Features Avançadas
- [ ] Webhooks recebidos (incoming webhooks)
- [ ] Gatilhos customizados por integração
- [ ] Templates de mensagem
- [ ] Agendamento de sincronização
- [ ] Dashboard de status de integrações
- [ ] Métricas de uso

---

## 🔗 Fase 2 - Integrações Essenciais (Implementado)

### 6. **GitHub Integration**
- ✅ Link PRs para tasks
- ✅ Webhook de eventos de PRs
- ✅ Sincronização de repositórios
- ✅ Status de PR nas tasks
- ✅ Suporte para issues (futuro)

**Configuração:**
```json
{
  "token": "ghp_xxxxxxxxxxxxx",
  "webhookSecret": "your_secret",
  "repositories": ["owner/repo1", "owner/repo2"]
}
```

**Endpoints:**
- `POST /integrations/github/link-pr` - Link PR to task
- `POST /integrations/github/sync-repository` - Sync repository PRs
- `GET /integrations/github/task/:taskId/prs` - Get PRs for task
- `POST /integrations/github/webhook` - Receive GitHub webhooks

**Eventos Suportados:**
- 🔀 Pull Request opened/updated/merged
- 🐛 Issue created (futuro)
- 📝 Push events (futuro)

**Exemplo de uso:**
```typescript
// Link PR to task
await axios.post('/integrations/github/link-pr', {
  integrationId: 'integration_id',
  taskId: 'task_id',
  repository: 'owner/repo',
  prNumber: 123
});
```

---

### 7. **Figma Integration**
- ✅ Embed de arquivos Figma
- ✅ Anexar designs em tasks/projetos
- ✅ Sincronização de metadados
- ✅ Thumbnails automáticos
- ✅ Webhook de atualizações

**Configuração:**
```json
{
  "accessToken": "figd_xxxxxxxxxxxxx",
  "webhookSecret": "your_secret"
}
```

**Endpoints:**
- `POST /integrations/figma/attach` - Attach Figma file
- `GET /integrations/figma/files` - List Figma files
- `POST /integrations/figma/sync` - Sync file metadata

**Eventos Suportados:**
- 📄 File updated
- 💬 Comments (futuro)
- 👥 Collaborators changed (futuro)

**Exemplo de uso:**
```typescript
// Attach Figma file to task
await axios.post('/integrations/figma/attach', {
  integrationId: 'integration_id',
  fileKey: 'abc123xyz',
  taskId: 'task_id'
});
```

**Embed HTML:**
```html
<iframe
  style="border: 1px solid rgba(0, 0, 0, 0.1);"
  width="100%"
  height="450px"
  src="https://www.figma.com/embed?embed_host=noma&url=https://www.figma.com/file/FILE_KEY"
  allowfullscreen
></iframe>
```

---

### 8. **Google Drive / Dropbox Integration**
- ✅ Anexar arquivos de cloud storage
- ✅ Links compartilháveis automáticos
- ✅ Sincronização de pastas
- ✅ Thumbnails (quando disponível)
- ✅ Suporte para múltiplos providers

**Configuração:**
```json
{
  "accessToken": "ya29.xxxxx or sl.xxxxx",
  "refreshToken": "optional_refresh_token"
}
```

**Endpoints:**
- `POST /integrations/cloud/attach` - Attach cloud file
- `GET /integrations/cloud/files` - List cloud files

**Providers Suportados:**
- 📁 Google Drive
- 📦 Dropbox

**Exemplo de uso:**
```typescript
// Attach Google Drive file
await axios.post('/integrations/cloud/attach', {
  integrationId: 'integration_id',
  fileId: 'google_drive_file_id',
  projectId: 'project_id'
});

// List files
const files = await axios.get('/integrations/cloud/files', {
  params: { 
    workspaceId: 'workspace_id',
    provider: 'google_drive'
  }
});
```

---

### 9. **Zapier / Make.com / Custom Webhooks**
- ✅ Criar endpoints de webhook personalizados
- ✅ Trigger em eventos customizados
- ✅ Verificação HMAC de assinatura
- ✅ Logs de chamadas de webhook
- ✅ Retry automático para falhas
- ✅ Webhooks de entrada (incoming)

**Configuração:**
```json
{
  "events": ["task.created", "task.updated", "comment.added"],
  "secret": "your_hmac_secret"
}
```

**Endpoints:**
- `POST /integrations/webhooks/create` - Create webhook endpoint
- `GET /integrations/webhooks` - List webhooks
- `PUT /integrations/webhooks/:id` - Update webhook
- `DELETE /integrations/webhooks/:id` - Delete webhook
- `GET /integrations/webhooks/:id/logs` - Get webhook logs
- `POST /integrations/webhooks/trigger` - Trigger webhooks manually
- `POST /integrations/webhooks/incoming/:workspaceId/:uniqueId` - Receive webhooks

**Eventos Disponíveis:**
- `task.created` - Nova task criada
- `task.updated` - Task atualizada
- `task.completed` - Task completada
- `task.deleted` - Task deletada
- `comment.added` - Comentário adicionado
- `project.created` - Projeto criado
- `project.updated` - Projeto atualizado
- `user.invited` - Usuário convidado
- `*` - Todos os eventos

**Exemplo de uso:**
```typescript
// Create webhook endpoint
const webhook = await axios.post('/integrations/webhooks/create', {
  workspaceId: 'workspace_id',
  name: 'My Zapier Integration',
  provider: 'zapier',
  events: ['task.created', 'task.updated'],
  description: 'Send tasks to Zapier'
});

// Use the generated URL in Zapier/Make.com
console.log('Webhook URL:', webhook.data.endpoint.url);

// Trigger webhook manually (for testing)
await axios.post('/integrations/webhooks/trigger', {
  workspaceId: 'workspace_id',
  event: 'task.created',
  payload: {
    taskId: 'task_id',
    title: 'New Task',
    status: 'todo'
  }
});
```

**Webhook Payload Format:**
```json
{
  "event": "task.created",
  "timestamp": "2026-02-04T12:00:00Z",
  "data": {
    "taskId": "task_123",
    "title": "New Task",
    "status": "todo",
    "priority": "high"
  }
}
```

**Signature Verification (HMAC-SHA256):**
```typescript
const crypto = require('crypto');

function verifySignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
    
  return signature === expectedSignature;
}
```

---

## 🐛 Troubleshooting

### Slack não envia mensagens
1. Verifique se o webhook URL está correto
2. Teste com curl: `curl -X POST -H 'Content-Type: application/json' --data '{"text":"Test"}' URL`
3. Verifique logs da integração

### Email sync não funciona
1. Use App Password ao invés de senha normal (Gmail)
2. Habilite "Less secure apps" se necessário
3. Verifique porta e SSL/TLS

### Calendar sync falha
1. Verifique se os tokens OAuth estão válidos
2. Re-autorize a aplicação
3. Verifique scopes necessários

### GitHub PR link não funciona
1. Verifique se o token tem permissões `repo`
2. Confirme que o repositório está acessível
3. Verifique formato: `owner/repo`

### Figma embed não carrega
1. Confirme que o fileKey está correto
2. Verifique se o access token é válido
3. Arquivo deve estar acessível

### Cloud storage falha
1. Tokens OAuth podem ter expirado - use refresh token
2. Verifique permissões do arquivo
3. Confirme que o fileId está correto

### Webhook não dispara
1. Verifique se o endpoint está ativo (`active: true`)
2. Confirme que o evento está na lista de `events`
3. Verifique logs de erro na tabela `webhook_calls`

## 📚 Referências

- [Slack Webhooks](https://api.slack.com/messaging/webhooks)
- [Discord Webhooks](https://discord.com/developers/docs/resources/webhook)
- [Google Calendar API](https://developers.google.com/calendar)
- [Microsoft Graph API](https://docs.microsoft.com/en-us/graph/api/resources/calendar)
- [IMAP Protocol](https://www.rfc-editor.org/rfc/rfc3501)
- [GitHub API](https://docs.github.com/en/rest)
- [Figma API](https://www.figma.com/developers/api)
- [Google Drive API](https://developers.google.com/drive)
- [Dropbox API](https://www.dropbox.com/developers/documentation)
- [Zapier Platform](https://platform.zapier.com/docs/basics)
- [Make.com Webhooks](https://www.make.com/en/help/tools/webhooks)

---

**Status:** ✅ Implementado - Fases 1 e 2 Completas
**Última atualização:** 04 de Fevereiro de 2026
