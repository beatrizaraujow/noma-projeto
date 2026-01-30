# 🔄 Guia de Integração - UI/UX Components

## Como integrar os novos componentes nas páginas existentes

Este guia mostra como adicionar os novos componentes de UI/UX nas páginas do NUMA.

---

## 1. 📋 Página de Projeto com Loading e Error States

**Arquivo:** `apps/web/src/app/projects/[id]/page.tsx`

### Antes:
```tsx
'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';

export default function ProjectPage({ params }) {
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProject();
  }, [params.id]);

  if (loading) return <div>Carregando...</div>;
  
  return <div>{/* content */}</div>;
}
```

### Depois:
```tsx
'use client';

import { useProject, useTasks } from '@/hooks/useQueries';
import { CardSkeleton, ListSkeleton } from '@/components/ui/skeleton';
import { ErrorState, EmptyState, ErrorBoundary } from '@/components/ui/error-boundary';
import { Badge, StatusBadge, PriorityBadge } from '@/components/ui/badge';
import { Avatar, AvatarGroup } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { useSuccessToast, useErrorToast } from '@/components/ui/toast';

export default function ProjectPage({ params }) {
  const { data: project, isLoading, error, refetch } = useProject(params.id);
  const { data: tasks } = useTasks(params.id);
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  // Loading state com skeleton
  if (isLoading) {
    return (
      <div className="space-y-6 p-6">
        <CardSkeleton />
        <ListSkeleton items={5} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6">
        <ErrorState
          title="Erro ao carregar projeto"
          message="Não foi possível carregar os dados do projeto."
          onRetry={refetch}
        />
      </div>
    );
  }

  // Empty state
  if (!tasks || tasks.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          icon="📋"
          title="Nenhuma tarefa"
          message="Este projeto ainda não tem tarefas. Comece criando a primeira!"
          action={{
            label: 'Criar primeira tarefa',
            onClick: () => {/* open modal */},
          }}
        />
      </div>
    );
  }

  const handleCreateTask = async (data) => {
    try {
      await createTask(data);
      showSuccess('Tarefa criada!', 'A tarefa foi adicionada ao projeto.');
    } catch (error) {
      showError('Erro', 'Não foi possível criar a tarefa.');
    }
  };

  return (
    <ErrorBoundary>
      <div className="p-6 space-y-6">
        {/* Header com badges e avatars */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              {project.name}
            </h1>
            <div className="flex gap-2 mt-2">
              <Badge variant="info">{project.status}</Badge>
              <Badge variant="outline">{tasks.length} tarefas</Badge>
            </div>
          </div>
          <AvatarGroup avatars={project.members} max={5} />
        </div>

        {/* Progress */}
        <Progress
          value={project.completedTasks}
          max={project.totalTasks}
          showLabel
        />

        {/* Task list */}
        <div className="space-y-3">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 dark:text-white">
                    {task.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                    {task.description}
                  </p>
                </div>
                <div className="flex gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                </div>
              </div>
              {task.assignee && (
                <div className="flex items-center gap-2 mt-3">
                  <Avatar
                    src={task.assignee.avatar}
                    name={task.assignee.name}
                    size="sm"
                  />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {task.assignee.name}
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </ErrorBoundary>
  );
}
```

---

## 2. 🏠 Dashboard com Onboarding

**Arquivo:** `apps/web/src/app/page.tsx`

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import {
  WelcomeModal,
  useOnboarding,
  defaultOnboardingSteps,
} from '@/components/onboarding/OnboardingFlow';

export default function Dashboard() {
  const { data: session } = useSession();
  const [showWelcome, setShowWelcome] = useState(false);
  const { startOnboarding } = useOnboarding();

  useEffect(() => {
    // Verificar se é primeira vez do usuário
    const hasCompletedOnboarding = localStorage.getItem('onboarding_completed');
    if (!hasCompletedOnboarding && session) {
      setShowWelcome(true);
    }
  }, [session]);

  const handleStartTour = () => {
    setShowWelcome(false);
    startOnboarding(defaultOnboardingSteps);
  };

  return (
    <>
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => {
          setShowWelcome(false);
          localStorage.setItem('onboarding_completed', 'skipped');
        }}
        onStartTour={handleStartTour}
      />

      <div className="p-6">
        {/* Dashboard content */}
      </div>
    </>
  );
}
```

---

## 3. 📝 Formulário com Loading e Feedback

**Exemplo:** Criar tarefa

```tsx
'use client';

import { useState } from 'react';
import { useCreateTask } from '@/hooks/useQueries';
import { useSuccessToast, useErrorToast } from '@/components/ui/toast';
import { ButtonSpinner } from '@/components/ui/spinner';

export function TaskForm({ projectId, onSuccess }) {
  const [formData, setFormData] = useState({ title: '', description: '' });
  const createTask = useCreateTask();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      await createTask.mutateAsync({
        ...formData,
        projectId,
      });
      
      showSuccess('Tarefa criada!', 'A tarefa foi adicionada ao projeto.');
      onSuccess();
    } catch (error) {
      showError(
        'Erro ao criar tarefa',
        error.message || 'Tente novamente mais tarde.'
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Título
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Descrição
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg"
          rows={4}
        />
      </div>

      <button
        type="submit"
        disabled={createTask.isPending}
        className="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
      >
        {createTask.isPending && <ButtonSpinner />}
        {createTask.isPending ? 'Criando...' : 'Criar Tarefa'}
      </button>
    </form>
  );
}
```

---

## 4. 📊 Workspace com Progress

```tsx
'use client';

import { useWorkspace } from '@/hooks/useQueries';
import { Progress, CircularProgress } from '@/components/ui/progress';
import { AvatarGroup } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

export function WorkspaceStats({ workspaceId }) {
  const { data: workspace } = useWorkspace(workspaceId);
  
  if (!workspace) return null;

  const completionRate = (workspace.completedProjects / workspace.totalProjects) * 100;
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
        Estatísticas do Workspace
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Total de projetos */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Projetos
          </p>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {workspace.totalProjects}
            </span>
            <Badge variant="success" size="sm">
              {workspace.activeProjects} ativos
            </Badge>
          </div>
        </div>

        {/* Progresso */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Conclusão
          </p>
          <CircularProgress
            value={completionRate}
            size={80}
            variant="success"
          />
        </div>

        {/* Membros */}
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
            Equipe
          </p>
          <AvatarGroup
            avatars={workspace.members.map(m => ({
              name: m.user.name,
              src: m.user.avatar,
            }))}
            max={5}
            size="md"
          />
        </div>
      </div>

      {/* Progress bar */}
      <div className="mt-6">
        <Progress
          value={workspace.completedTasks}
          max={workspace.totalTasks}
          showLabel
          variant="primary"
        />
      </div>
    </div>
  );
}
```

---

## 5. 🔔 Notificações com Toast

```tsx
'use client';

import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/components/ui/toast';
import { useEffect } from 'react';

export function NotificationListener() {
  const { showToast } = useToast();
  const { lastMessage } = useWebSocket();

  useEffect(() => {
    if (!lastMessage) return;

    const notification = JSON.parse(lastMessage.data);

    switch (notification.type) {
      case 'task_assigned':
        showToast({
          type: 'info',
          title: 'Nova tarefa',
          message: notification.message,
        });
        break;
      
      case 'task_completed':
        showToast({
          type: 'success',
          title: 'Tarefa concluída',
          message: notification.message,
        });
        break;
      
      case 'mention':
        showToast({
          type: 'warning',
          title: 'Você foi mencionado',
          message: notification.message,
        });
        break;
    }
  }, [lastMessage, showToast]);

  return null;
}
```

---

## 6. 🎨 Tema e Estilos

### Usar Design System Tokens

```tsx
import { colors, typography, spacing } from '@/lib/design-system';

// Inline styles
<div style={{
  backgroundColor: colors.primary[600],
  fontSize: typography.fontSize.lg,
  padding: spacing[4],
}}>
  Content
</div>

// Ou com Tailwind (já configurado)
<div className="bg-primary-600 text-lg p-4">
  Content
</div>
```

---

## 📋 Checklist de Integração

Para cada página/componente:

- [ ] Substituir loading simples por Skeleton/Spinner
- [ ] Adicionar ErrorBoundary wrapper
- [ ] Usar ErrorState para erros
- [ ] Usar EmptyState quando apropriado
- [ ] Adicionar toast notifications em ações
- [ ] Usar Badge para status/prioridade
- [ ] Usar Avatar para usuários
- [ ] Adicionar Progress quando relevante
- [ ] Implementar onboarding em primeira visita
- [ ] Testar dark mode

---

## 🎯 Prioridade de Integração

### Alta Prioridade
1. ✅ Páginas de projeto (`projects/[id]/page.tsx`)
2. ✅ Dashboard (`page.tsx`)
3. ✅ Formulários de criação

### Média Prioridade
4. ⏳ Lista de workspaces
5. ⏳ Configurações
6. ⏳ Perfil do usuário

### Baixa Prioridade
7. ⏳ Páginas de ajuda
8. ⏳ About

---

## 🚀 Próximos Passos

1. **Integrar componentes nas páginas existentes** usando os exemplos acima
2. **Testar fluxos completos** (criar, editar, deletar)
3. **Ajustar animações** se necessário
4. **Configurar onboarding** com steps específicos do projeto
5. **Deploy e testar em produção**

---

**Dica:** Comece com uma página por vez e teste bem antes de prosseguir!
