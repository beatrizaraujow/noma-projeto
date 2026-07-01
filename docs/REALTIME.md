# Real-time Features Implementation

## ✅ Implementações Completas

### 1. Socket.io Setup
- **Backend**: WebSocket Gateway configurado em `apps/api/src/modules/websocket/websocket.gateway.ts`
- **Frontend**: Hook `useWebSocket` em `apps/web/src/hooks/useWebSocket.ts`
- **Conexão**: Automática ao abrir qualquer projeto
- **CORS**: Configurado para aceitar conexões do frontend

### 2. Live Updates de Tasks
**Eventos Implementados:**
- `task_created` - Nova tarefa criada
- `task_updated` - Tarefa atualizada
- `task_deleted` - Tarefa excluída
- `task_status_changed` - Status da tarefa mudou
- `task_assigned` - Tarefa atribuída a alguém

**Como Funciona:**
- Quando uma tarefa é criada/atualizada/excluída, o backend emite evento para todos os clientes do projeto
- Frontend recarrega automaticamente a lista de tarefas
- Atualizações visíveis em tempo real para todos os usuários

### 3. "User X está editando"
**Presence System:**
- Rastreamento de presença de usuários em projetos
- Indicador visual quando alguém está editando uma tarefa
- Badge azul animado mostrando quem está editando
- Ring azul ao redor do card da tarefa sendo editada

**Métodos:**
- `startEditingTask(taskId)` - Marca que usuário começou a editar
- `stopEditingTask(taskId)` - Marca que usuário parou de editar
- `getUsersEditingTask(taskId)` - Retorna lista de usuários editando

**Visual:**
```tsx
{isBeingEdited && (
  <div className="flex items-center gap-2 mb-2">
    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
    <span>{editedBy} está editando</span>
  </div>
)}
```

### 4. Notificações In-App
**Sistema de Notificações:**
- Componente `NotificationBell` em `apps/web/src/components/NotificationBell.tsx`
- Badge com contagem de não lidas
- Dropdown com lista de notificações
- Suporte a notificações do navegador (browser notifications)

**Tipos de Notificações:**
- `task_assigned` - Quando você é atribuído a uma tarefa
- `task_updated` - Quando uma tarefa sua é atualizada
- `comment_added` - Quando alguém comenta (futuro)
- `mention` - Quando você é mencionado (futuro)

**Features:**
- Auto-dismiss após leitura
- Click para navegar para a tarefa/projeto
- Timestamp relativo (agora, 5m atrás, 2h atrás, etc)
- Marcar todas como lidas
- Persistência em memória (pode ser expandido para DB)

## 🔧 Integrações

### TasksService
Atualizado para emitir eventos WebSocket:
```typescript
// Ao criar tarefa
this.websocketGateway.broadcastTaskCreated(projectId, task);
this.websocketGateway.sendNotification(assigneeId, {...});

// Ao atualizar tarefa
this.websocketGateway.broadcastTaskUpdated(projectId, task);
this.websocketGateway.broadcastTaskStatusChange(...);
```

### Kanban Board
Integrado com WebSocket para:
- Receber atualizações em tempo real
- Mostrar indicador "Online" quando conectado
- Mostrar contador de pessoas online no projeto
- Destacar tarefas sendo editadas por outros

## 📊 Status de Conexão

**Indicadores Visuais:**
- 🟢 Bolinha verde pulsando = Online
- 👥 Contador de pessoas online
- Ring azul + texto = Alguém editando

## 🚀 Como Usar

### No Frontend:
```typescript
const { 
  isConnected, 
  presence, 
  notifications,
  startEditingTask,
  stopEditingTask,
  getUsersEditingTask
} = useWebSocket({
  projectId: 'project-id',
  onTaskCreated: (task) => { /* handle */ },
  onTaskUpdated: (task) => { /* handle */ },
});
```

### Eventos de Presença:
```typescript
// Ao abrir modal de edição
startEditingTask(taskId);

// Ao fechar modal
stopEditingTask(taskId);

// Verificar quem está editando
const editors = getUsersEditingTask(taskId);
```

### Notificações:
```jsx
import { NotificationBell } from '@/components/NotificationBell';

// No layout ou navbar
<NotificationBell />
```

## 🔐 Segurança

> ⚠️ **O gateway NÃO valida JWT no handshake.** A identidade do usuário é lida de `client.handshake.query.userId` **sem verificar nenhum token** — qualquer cliente pode se passar por outro usuário informando um `userId`. Da mesma forma, `join_project` **não valida se o usuário tem acesso ao projeto** antes de entrar na sala. Trate os itens abaixo como comportamento atual vs. recomendado:

- ❌ Autenticação via JWT no handshake — **NÃO implementada** (usa `handshake.query.userId` sem validação). **Recomendado** validar o `access_token` no handshake.
- ❌ Validação de acesso ao projeto antes de juntar sala — **NÃO implementada** (`join_project` não checa permissão). **Recomendado** verificar associação ao projeto.
- ✅ Rooms isoladas por projeto (broadcast só chega a quem está na sala)
- ✅ Notificações direcionadas por sala de usuário (`user:<id>`)

## 📈 Performance

- Conexão persistente (WebSocket)
- Rooms para isolar broadcasts
- Eventos apenas para usuários relevantes
- Limpeza automática de presença ao desconectar

## 🎯 Próximos Passos

- [ ] Persistir notificações no banco de dados
- [ ] Indicador de "typing" em comentários
- [ ] Histórico de atividades do projeto
- [ ] Notificações por email
- [ ] Sincronização de cursores em edição colaborativa
