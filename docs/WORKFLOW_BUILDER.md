# Workflow Builder - Guia Completo

## 📋 Visão Geral

O **Workflow Builder** permite criar automações visuais complexas com múltiplos passos, lógica condicional, webhooks e agendamentos. É uma evolução das automações básicas, oferecendo controle total sobre fluxos de trabalho.

## 🎯 Funcionalidades

### 1. **Visual Automation Builder** ✅
Interface drag-and-drop para construir workflows visualmente.

**Recursos:**
- Canvas visual com paleta de componentes
- Pré-visualização em tempo real
- Configuração inline de cada passo
- Teste de execução antes de salvar

### 2. **Conditional Logic** ✅
Lógica condicional if/else para decisões dinâmicas.

**Operadores:**
- `equals` - Igual a
- `not_equals` - Diferente de
- `greater_than` - Maior que
- `less_than` - Menor que
- `contains` - Contém texto
- `not_contains` - Não contém texto

### 3. **Multi-Step Workflows** ✅
Workflows com múltiplos passos encadeados e loops.

**Tipos de Step:**
- **Action**: Criar/atualizar/deletar tarefas, definir variáveis
- **Condition**: Decisões if/else baseadas em condições
- **Loop**: Iterar sobre arrays de dados
- **Webhook**: Chamar APIs externas
- **Notification**: Enviar notificações
- **Delay**: Pausar execução por tempo determinado

### 4. **Webhook Triggers** ✅
Triggers via webhooks externos para integração com serviços third-party.

**Recursos:**
- URLs únicos por webhook
- Autenticação via secret (HMAC SHA256)
- Tracking de uso (contagem e último trigger)
- Suporte a payload JSON

### 5. **Scheduled Automations** ⚠️ NÃO ativo
Automações agendadas usando expressões cron — **não funcionam hoje**. O método `@Cron processScheduledWorkflows` está **comentado** em `workflow.service.ts` e o `@nestjs/schedule`/`ScheduleModule` **não está instalado nem registrado** em `app.module.ts`. Você pode salvar um workflow com trigger `scheduled`, mas ele **nunca será disparado automaticamente** — só via execução manual (`POST /workflows/:id/execute`). Para ativar, siga os passos em "Configuração".

**Suporte pretendido (após ativação manual):**
- Cron expressions (minuto, hora, dia, mês, dia da semana)
- Presets comuns (diário, semanal, mensal)
- Timezones configuráveis
- Intervalos personalizados

---

## 🚀 API Reference

### Workflows

#### POST `/workflows`
Cria um novo workflow.

```json
{
  "workspaceId": "workspace_123",
  "name": "Onboard New Tasks",
  "description": "Automatically process new tasks",
  "trigger": {
    "type": "event",
    "event": "task_created"
  },
  "steps": [
    {
      "name": "Set Priority",
      "type": "action",
      "config": {
        "actionType": "update_task",
        "priority": "HIGH"
      },
      "position": 0
    }
  ],
  "createdBy": "user_123"
}
```

#### GET `/workflows/workspace/:workspaceId`
Lista todos os workflows do workspace.

**Response:**
```json
[
  {
    "id": "wf_123",
    "name": "Onboard New Tasks",
    "active": true,
    "steps": [...],
    "_count": {
      "executions": 42
    }
  }
]
```

#### PUT `/workflows/:id`
Atualiza um workflow existente.

#### DELETE `/workflows/:id`
Deleta um workflow.

#### POST `/workflows/:id/execute`
Executa um workflow manualmente.

```json
{
  "input": {
    "taskId": "task_123"
  },
  "triggeredBy": "user_123"
}
```

**Response:**
```json
{
  "success": true,
  "executionId": "exec_123",
  "output": {
    "createdTask": {...}
  }
}
```

#### GET `/workflows/:id/executions`
Lista execuções de um workflow.

**Query Params:**
- `limit` (default: 50)

---

### Webhooks

#### POST `/workflows/webhooks`
Cria um novo webhook trigger.

```json
{
  "workspaceId": "workspace_123",
  "workflowId": "wf_123",
  "name": "GitHub Push Webhook",
  "createdBy": "user_123"
}
```

**Response:**
```json
{
  "id": "webhook_123",
  "url": "webhook_abc123def456",
  "secret": "secret_xyz789...",
  "active": true
}
```

#### GET `/workflows/webhooks/workspace/:workspaceId`
Lista todos os webhooks do workspace.

#### POST `/workflows/webhooks/:url/trigger`
Executa um webhook (endpoint público).

**Headers:**
- `X-Webhook-Signature` (opcional): HMAC SHA256 do payload com o secret

**Body:** Qualquer JSON será passado como input para o workflow.

```json
{
  "event": "push",
  "repository": "my-repo",
  "branch": "main"
}
```

#### DELETE `/workflows/webhooks/:id`
Deleta um webhook.

---

### Executions

#### GET `/workflows/executions/:executionId`
Obtém detalhes de uma execução.

**Response:**
```json
{
  "id": "exec_123",
  "workflowId": "wf_123",
  "status": "completed",
  "startedAt": "2026-02-02T20:00:00Z",
  "completedAt": "2026-02-02T20:00:05Z",
  "input": {...},
  "output": {...},
  "logs": [
    {
      "timestamp": "2026-02-02T20:00:01Z",
      "step": "Set Priority",
      "type": "action",
      "status": "completed"
    }
  ]
}
```

#### POST `/workflows/executions/:executionId/cancel`
Cancela uma execução em andamento.

---

## 💡 Exemplos de Uso

### 1. Workflow com Condição

```json
{
  "name": "Smart Task Assignment",
  "trigger": { "type": "event", "event": "task_created" },
  "steps": [
    {
      "name": "Check Priority",
      "type": "condition",
      "config": {
        "operator": "equals",
        "left": "{{input.priority}}",
        "right": "HIGH"
      },
      "position": 0
    },
    {
      "name": "Assign to Senior",
      "type": "action",
      "config": {
        "actionType": "update_task",
        "assigneeId": "senior_dev_id"
      },
      "position": 1,
      "parentId": "step_condition_id",
      "config": { "branch": "true" }
    },
    {
      "name": "Assign to Junior",
      "type": "action",
      "config": {
        "actionType": "update_task",
        "assigneeId": "junior_dev_id"
      },
      "position": 2,
      "parentId": "step_condition_id",
      "config": { "branch": "false" }
    }
  ]
}
```

### 2. Workflow com Loop

```json
{
  "name": "Bulk Task Creation",
  "trigger": { "type": "manual" },
  "steps": [
    {
      "name": "Loop Tasks",
      "type": "loop",
      "config": {
        "items": "{{input.tasks}}",
        "variableName": "task"
      },
      "position": 0
    },
    {
      "name": "Create Task",
      "type": "action",
      "config": {
        "actionType": "create_task",
        "title": "{{variables.task.title}}",
        "description": "{{variables.task.description}}"
      },
      "position": 1,
      "parentId": "loop_step_id"
    }
  ]
}
```

### 3. Workflow com Webhook

```json
{
  "name": "Slack Notification on Complete",
  "trigger": { "type": "event", "event": "task_completed" },
  "steps": [
    {
      "name": "Notify Slack",
      "type": "webhook",
      "config": {
        "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
        "method": "POST",
        "body": {
          "text": "Task completed: {{input.title}}"
        }
      },
      "position": 0
    }
  ]
}
```

### 4. Workflow Agendado

```json
{
  "name": "Daily Status Report",
  "trigger": {
    "type": "scheduled",
    "schedule": "0 9 * * *"  // 9 AM every day
  },
  "steps": [
    {
      "name": "Generate Report",
      "type": "action",
      "config": {
        "actionType": "create_task",
        "title": "Daily Status Report - {{now}}",
        "description": "Review completed tasks from yesterday"
      },
      "position": 0
    }
  ]
}
```

---

## 🔧 Configuração

### 1. Instalar Dependências (Opcional para Scheduled)

```bash
cd apps/api
pnpm add @nestjs/schedule
```

### 2. Adicionar ScheduleModule ao app.module.ts

```typescript
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // ... outros imports
    ScheduleModule.forRoot(),
    WorkflowModule,
  ],
})
export class AppModule {}
```

### 3. Descomentar Cron Job no workflow.service.ts

```typescript
@Cron(CronExpression.EVERY_MINUTE)
async processScheduledWorkflows() {
  // ... código já está implementado
}
```

---

## 🎨 Componentes Frontend

### WorkflowBuilder

Interface visual para criar/editar workflows.

```tsx
import WorkflowBuilder from '@/components/WorkflowBuilder';

<WorkflowBuilder 
  workspaceId={workspaceId}
  token={token}
  onSave={(workflow) => console.log('Saved:', workflow)}
/>
```

**Recursos:**
- Canvas com paleta de steps
- Configuração inline
- Preview visual
- Teste de execução

### WebhookManager

Gerenciamento de webhooks triggers.

```tsx
import WebhookManager from '@/components/WebhookManager';

<WebhookManager 
  workspaceId={workspaceId}
  token={token}
/>
```

**Recursos:**
- Criar/deletar webhooks
- Copiar URL e secret
- Ver estatísticas de uso
- Instruções de integração

### ScheduledAutomations

Configuração de agendamentos.

```tsx
import ScheduledAutomations from '@/components/ScheduledAutomations';

<ScheduledAutomations 
  workspaceId={workspaceId}
  token={token}
/>
```

**Recursos:**
- Editor de cron expressions
- Presets comuns
- Seleção de timezone
- Validação de expressões

---

## 📊 Modelos de Banco de Dados

### Workflow
```prisma
model Workflow {
  id          String   @id @default(cuid())
  workspaceId String
  name        String
  description String?
  icon        String?
  color       String?
  trigger     Json     // Trigger config
  active      Boolean  @default(true)
  version     Int      @default(1)
  createdBy   String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  steps      WorkflowStep[]
  executions WorkflowExecution[]
}
```

### WorkflowStep
```prisma
model WorkflowStep {
  id         String  @id @default(cuid())
  workflowId String
  name       String
  type       String  // action, condition, loop, delay, webhook, notification
  config     Json
  position   Int
  parentId   String?
  nextStepId String?

  workflow Workflow @relation(fields: [workflowId], references: [id], onDelete: Cascade)
}
```

### WorkflowExecution
```prisma
model WorkflowExecution {
  id          String   @id @default(cuid())
  workflowId  String
  status      String   // running, completed, failed, cancelled
  startedAt   DateTime @default(now())
  completedAt DateTime?
  input       Json?
  output      Json?
  logs        Json[]
  error       String?
  triggeredBy String?

  workflow Workflow @relation(fields: [workflowId], references: [id])
}
```

### WebhookTrigger
```prisma
model WebhookTrigger {
  id            String    @id @default(cuid())
  workspaceId   String
  workflowId    String
  name          String
  url           String    @unique
  secret        String
  active        Boolean   @default(true)
  lastTriggered DateTime?
  triggerCount  Int       @default(0)
  createdBy     String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}
```

---

## 🔐 Segurança

### Webhook Signature Verification

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  
  return signature === expectedSignature;
}
```

**Exemplo de uso:**

```bash
curl -X POST https://api.example.com/workflows/webhooks/webhook_abc123/trigger \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Signature: computed_signature_here" \
  -d '{"event": "test"}'
```

---

## 🎓 Melhores Práticas

1. **Nomenclatura Clara**: Use nomes descritivos para workflows e steps
2. **Teste Antes de Ativar**: Sempre teste workflows antes de ativar
3. **Monitoramento**: Verifique logs de execução regularmente
4. **Tratamento de Erros**: Configure notificações para falhas
5. **Versionamento**: Workflows incrementam versão a cada edição
6. **Limites**: Evite loops infinitos e workflows muito longos
7. **Variáveis**: Use interpolação `{{variable}}` para dados dinâmicos
8. **Webhook Security**: Sempre valide assinaturas em webhooks públicos

---

## 📈 Próximas Melhorias

- [ ] Drag-and-drop visual real no canvas
- [ ] Templates de workflows pré-configurados
- [ ] Suporte a branches paralelos
- [ ] Retry automático em falhas
- [ ] Workflow versioning com rollback
- [ ] Analytics e métricas de execução
- [ ] Integração com serviços populares (Slack, GitHub, Jira)
- [ ] Editor de código para steps complexos

---

## 📚 Recursos Adicionais

- **Cron Expression Guide**: [crontab.guru](https://crontab.guru)
- **Webhook Testing**: [webhook.site](https://webhook.site)
- **JSON Path**: [jsonpath.com](https://jsonpath.com)

---

## 🐛 Troubleshooting

### Workflow não executa
- Verifique se está ativo (`active: true`)
- Confirme que o trigger está configurado corretamente
- Cheque logs de execução para erros

### Webhook não dispara
- Verifique se a URL está correta
- Confirme que o webhook está ativo
- Valide a assinatura se estiver usando

### Scheduled não roda
- Instale `@nestjs/schedule`
- Adicione `ScheduleModule.forRoot()` ao app.module.ts
- Descomente o método `@Cron` no workflow.service.ts
- Verifique a expressão cron

---

**Status**: ⚠️ Workflows/webhooks/execução manual funcionam; **agendamento (Scheduled) NÃO está ativo** (`@Cron processScheduledWorkflows` comentado e `@nestjs/schedule`/`ScheduleModule` não instalado/registrado). Ver seção "Configuração" para ativar.

**Documentação atualizada**: 02/02/2026
