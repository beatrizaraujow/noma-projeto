# Sistema de Permissões e Controle de Acesso - NUMA

> ⚠️ **AVISO: este sistema NÃO está ativo em produção.** O `PermissionsModule` **não está registrado** em `apps/api/src/app.module.ts` — todo o código (RolesService, `PermissionsGuard`, `@RequirePermission`, guest-access, audit-log) está **disponível no código, porém não montado**. Consequentemente as rotas `/api/permissions/*` **não sobem** e o RBAC granular é código morto no app em execução. Para usá-lo é preciso primeiro adicionar `PermissionsModule` aos `imports` do `app.module.ts` (ver "Próximos Passos"). O restante deste doc descreve o comportamento pretendido do código, não o que está ativo hoje.

## 📋 Visão Geral

Sistema de gerenciamento de permissões (disponível no código, porém não montado) com:
- Custom roles (papéis personalizados)
- Permissões por projeto
- Permissões granulares (view/edit/delete/manage)
- Guest access (acesso temporário)
- Audit logs (rastreamento completo)

## 🗄️ Schema do Banco de Dados

### Novos Modelos

#### CustomRole
```prisma
model CustomRole {
  id          String   @id @default(cuid())
  name        String
  description String?
  workspaceId String?
  isSystem    Boolean  @default(false)
  createdById String
  permissions Permission[]
}
```

#### Permission
```prisma
model Permission {
  id         String   @id @default(cuid())
  roleId     String
  resource   String   // 'project', 'task', 'comment', etc.
  action     String   // 'view', 'create', 'edit', 'delete', 'manage'
  scope      String   @default("all")
  conditions Json?
}
```

#### ProjectMember
```prisma
model ProjectMember {
  id        String   @id @default(cuid())
  projectId String
  userId    String
  roleId    String?
  role      String   @default("MEMBER")
  canView   Boolean  @default(true)
  canEdit   Boolean  @default(false)
  canDelete Boolean  @default(false)
  canManage Boolean  @default(false)
}
```

#### GuestAccess
```prisma
model GuestAccess {
  id         String    @id @default(cuid())
  projectId  String
  email      String
  token      String    @unique
  canView    Boolean   @default(true)
  canComment Boolean   @default(false)
  expiresAt  DateTime?
  revokedAt  DateTime?
}
```

#### AuditLog
```prisma
model AuditLog {
  id          String   @id @default(cuid())
  userId      String
  action      String
  resource    String
  resourceId  String?
  description String
  metadata    Json?
  ipAddress   String?
  userAgent   String?
}
```

## 🔧 Setup

### 1. Sincronizar Schema

```bash
cd packages/database
prisma db push
npx prisma generate
```

### 2. Inicializar Roles do Sistema

```bash
# Via API (recomendado)
POST /api/permissions/roles/initialize
```

Ou manualmente no código:
```typescript
import { RolesService } from './modules/permissions/roles.service';

// No OnModuleInit ou startup
await rolesService.initializeSystemRoles();
```

## 🚀 Uso da API

### Custom Roles

#### Criar Role Customizado
```typescript
POST /api/permissions/roles
{
  "name": "Developer",
  "description": "Pode criar e editar código",
  "workspaceId": "workspace_id",
  "permissions": [
    {
      "resource": "task",
      "action": "create",
      "scope": "all"
    },
    {
      "resource": "task",
      "action": "edit",
      "scope": "assigned"
    },
    {
      "resource": "comment",
      "action": "create"
    }
  ]
}
```

#### Listar Roles
```typescript
GET /api/permissions/roles?workspaceId=workspace_id
```

#### Atualizar Role
```typescript
PUT /api/permissions/roles/:id
{
  "name": "Senior Developer",
  "permissions": [...]
}
```

#### Deletar Role
```typescript
DELETE /api/permissions/roles/:id
```

### Membros do Projeto

#### Adicionar Membro
```typescript
POST /api/permissions/projects/:projectId/members
{
  "userId": "user_id",
  "role": "MEMBER", // OWNER, ADMIN, MEMBER, VIEWER, CUSTOM
  "roleId": "custom_role_id", // Opcional
  "canView": true,
  "canEdit": true,
  "canDelete": false,
  "canManage": false
}
```

#### Listar Membros
```typescript
GET /api/permissions/projects/:projectId/members
```

#### Atualizar Permissões
```typescript
PUT /api/permissions/projects/:projectId/members/:memberId
{
  "role": "ADMIN",
  "canManage": true
}
```

#### Remover Membro
```typescript
DELETE /api/permissions/projects/:projectId/members/:memberId
```

#### Ver Permissões de Membro
```typescript
GET /api/permissions/projects/:projectId/members/:userId/permissions
```

### Guest Access

#### Criar Acesso Guest
```typescript
POST /api/permissions/projects/:projectId/guest-access
{
  "email": "guest@example.com",
  "canView": true,
  "canComment": false,
  "expiresAt": "2026-02-10T00:00:00Z" // Opcional
}
```

Resposta:
```json
{
  "id": "guest_access_id",
  "token": "abc123def456...",
  "projectId": "project_id",
  "email": "guest@example.com",
  ...
}
```

#### Listar Acessos Guest
```typescript
GET /api/permissions/projects/:projectId/guest-access
```

#### Validar Token Guest
```typescript
GET /api/permissions/guest-access/:token
```

#### Revogar Acesso
```typescript
DELETE /api/permissions/guest-access/:id
```

### Audit Logs

#### Buscar Logs
```typescript
GET /api/permissions/audit-logs?userId=...&action=...&resource=...
```

Query params:
- `userId`: Filtrar por usuário
- `action`: Filtrar por ação (create, update, delete, etc.)
- `resource`: Filtrar por recurso (project, task, etc.)
- `resourceId`: ID do recurso específico
- `startDate`: Data inicial
- `endDate`: Data final
- `page`: Página (padrão: 1)
- `limit`: Itens por página (padrão: 50)

#### Logs de Projeto
```typescript
GET /api/permissions/audit-logs/project/:projectId
```

#### Logs de Usuário
```typescript
GET /api/permissions/audit-logs/user/:userId
```

#### Estatísticas
```typescript
GET /api/permissions/audit-logs/stats?startDate=...&endDate=...
```

## 🔒 Uso no Backend

### Guards e Decorators

#### Proteger Rota com Permissões
```typescript
import { RequirePermission } from './modules/permissions/decorators/permissions.decorator';
import { PermissionsGuard } from './modules/permissions/guards/permissions.guard';
import { ResourceType, ActionType } from '@nexora/types';

@Controller('projects')
@UseGuards(PermissionsGuard)
export class ProjectsController {
  
  @Put(':projectId')
  @RequirePermission({ 
    resource: ResourceType.PROJECT, 
    action: ActionType.EDIT 
  })
  async updateProject(@Param('projectId') projectId: string, @Body() data) {
    // Só executará se usuário tiver permissão de EDIT no projeto
    return this.projectsService.update(projectId, data);
  }
  
  @Delete(':projectId')
  @RequirePermission({ 
    resource: ResourceType.PROJECT, 
    action: ActionType.DELETE 
  })
  async deleteProject(@Param('projectId') projectId: string) {
    return this.projectsService.delete(projectId);
  }
}
```

#### Múltiplas Permissões (OR)
```typescript
@Get(':projectId/tasks')
@RequireAnyPermission(
  { resource: ResourceType.TASK, action: ActionType.VIEW },
  { resource: ResourceType.PROJECT, action: ActionType.MANAGE }
)
async getTasks() { ... }
```

#### Múltiplas Permissões (AND)
```typescript
@Post(':projectId/archive')
@RequireAllPermissions(
  { resource: ResourceType.PROJECT, action: ActionType.EDIT },
  { resource: ResourceType.PROJECT, action: ActionType.DELETE }
)
async archiveProject() { ... }
```

### Verificar Permissões Programaticamente

```typescript
import { RolesService } from './modules/permissions/roles.service';

@Injectable()
export class MyService {
  constructor(private rolesService: RolesService) {}
  
  async doSomething(userId: string, projectId: string) {
    const canEdit = await this.rolesService.checkPermission(
      userId,
      ResourceType.TASK,
      ActionType.EDIT,
      undefined,
      projectId
    );
    
    if (canEdit) {
      // Permitir edição
    }
  }
}
```

### Criar Audit Logs

```typescript
import { AuditLogService } from './modules/permissions/audit-log.service';

@Injectable()
export class MyService {
  constructor(private auditLogService: AuditLogService) {}
  
  async createTask(data, userId: string) {
    const task = await this.prisma.task.create({ data });
    
    // Registrar no audit log
    await this.auditLogService.logCreate(
      userId,
      ResourceType.TASK,
      task.id,
      `Criou tarefa: ${task.title}`,
      { priority: task.priority, status: task.status }
    );
    
    return task;
  }
  
  async updateTask(id: string, data, userId: string) {
    const oldTask = await this.prisma.task.findUnique({ where: { id } });
    const task = await this.prisma.task.update({ where: { id }, data });
    
    // Log com comparação
    await this.auditLogService.logUpdate(
      userId,
      ResourceType.TASK,
      id,
      `Atualizou tarefa: ${task.title}`,
      {
        changes: {
          before: oldTask,
          after: task,
        },
      }
    );
    
    return task;
  }
}
```

## 🎨 Frontend (React)

### Hooks Customizados

```typescript
// hooks/usePermissions.ts
import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/query-config';

export function useProjectPermissions(projectId: string, userId: string) {
  return useQuery({
    queryKey: queryKeys.permissions.project(projectId, userId),
    queryFn: () => 
      fetch(`/api/permissions/projects/${projectId}/members/${userId}/permissions`)
        .then((res) => res.json()),
  });
}

export function useCanEdit(projectId: string) {
  const { data: currentUser } = useCurrentUser();
  const { data: permissions } = useProjectPermissions(projectId, currentUser?.id);
  
  return permissions?.canEdit || false;
}
```

### Componentes de Permissão

```typescript
// components/PermissionGate.tsx
interface PermissionGateProps {
  children: React.ReactNode;
  projectId: string;
  action: 'view' | 'edit' | 'delete' | 'manage';
  fallback?: React.ReactNode;
}

export function PermissionGate({ children, projectId, action, fallback }: PermissionGateProps) {
  const { data: permissions } = useProjectPermissions(projectId, currentUser.id);
  
  const hasPermission = () => {
    switch (action) {
      case 'view': return permissions?.canView;
      case 'edit': return permissions?.canEdit;
      case 'delete': return permissions?.canDelete;
      case 'manage': return permissions?.canManage;
    }
  };
  
  if (!hasPermission()) {
    return fallback || null;
  }
  
  return <>{children}</>;
}

// Uso
<PermissionGate projectId={projectId} action="edit">
  <Button onClick={handleEdit}>Editar Projeto</Button>
</PermissionGate>
```

## 📊 Roles Predefinidos

### OWNER
- Controle total
- Pode gerenciar membros
- Pode deletar projeto
- Não pode ser removido

### ADMIN
- Pode editar projeto
- Pode gerenciar tarefas
- Pode editar membros
- Não pode deletar projeto

### MEMBER
- Pode ver projeto
- Pode criar tarefas
- Pode editar tarefas atribuídas
- Pode comentar

### VIEWER
- Apenas leitura
- Pode ver projeto e tarefas
- Não pode editar nada

### GUEST
- Acesso temporário
- Visualização limitada
- Opcionalmente pode comentar

## 🔐 Boas Práticas

1. **Sempre verificar permissões** antes de operações sensíveis
2. **Registrar ações importantes** no audit log
3. **Usar roles do sistema** quando possível
4. **Custom roles** para casos específicos
5. **Guest access com expiração** para segurança
6. **Revisar audit logs** periodicamente
7. **Princípio do menor privilégio** - dar apenas permissões necessárias

## 📝 Próximos Passos

1. Adicionar módulo ao `app.module.ts`:
```typescript
import { PermissionsModule } from './modules/permissions/permissions.module';

@Module({
  imports: [
    // ... outros módulos
    PermissionsModule,
  ],
})
export class AppModule {}
```

2. Criar componentes UI de gerenciamento
3. Integrar com autenticação existente
4. Configurar cron jobs para limpeza de logs e acessos expirados
5. Adicionar testes unitários e de integração
