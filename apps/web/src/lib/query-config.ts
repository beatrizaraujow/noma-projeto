/**
 * Configurações customizadas de cache para React Query
 * Define estratégias específicas para cada tipo de dado
 */

export const queryConfig = {
  // Dados estáticos ou que mudam raramente
  static: {
    staleTime: 60 * 60 * 1000, // 1 hora
    gcTime: 2 * 60 * 60 * 1000, // 2 horas
  },

  // Dados que mudam frequentemente
  dynamic: {
    staleTime: 30 * 1000, // 30 segundos
    gcTime: 5 * 60 * 1000, // 5 minutos
  },

  // Dados em tempo real
  realtime: {
    staleTime: 0, // Sempre stale
    gcTime: 2 * 60 * 1000, // 2 minutos
  },

  // Configurações específicas por entidade
  entities: {
    workspaces: {
      staleTime: 10 * 60 * 1000, // 10 minutos
      gcTime: 30 * 60 * 1000, // 30 minutos
    },
    projects: {
      staleTime: 5 * 60 * 1000, // 5 minutos
      gcTime: 15 * 60 * 1000, // 15 minutos
    },
    tasks: {
      staleTime: 2 * 60 * 1000, // 2 minutos
      gcTime: 10 * 60 * 1000, // 10 minutos
    },
    activities: {
      staleTime: 1 * 60 * 1000, // 1 minuto
      gcTime: 5 * 60 * 1000, // 5 minutos
    },
    users: {
      staleTime: 15 * 60 * 1000, // 15 minutos
      gcTime: 60 * 60 * 1000, // 1 hora
    },
  },
};

/**
 * Query keys para organização e invalidação de cache
 */
export const queryKeys = {
  workspaces: {
    all: ['workspaces'] as const,
    detail: (id: string) => ['workspaces', id] as const,
    members: (id: string) => ['workspaces', id, 'members'] as const,
  },
  projects: {
    all: (workspaceId: string) => ['projects', workspaceId] as const,
    detail: (id: string) => ['projects', 'detail', id] as const,
    tasks: (id: string) => ['projects', id, 'tasks'] as const,
    activities: (id: string) => ['projects', id, 'activities'] as const,
  },
  tasks: {
    all: (projectId: string) => ['tasks', projectId] as const,
    detail: (id: string) => ['tasks', 'detail', id] as const,
    byUser: (userId: string) => ['tasks', 'user', userId] as const,
    filtered: (filters: Record<string, any>) => ['tasks', 'filtered', filters] as const,
  },
  users: {
    all: ['users'] as const,
    detail: (id: string) => ['users', id] as const,
    current: ['users', 'current'] as const,
  },
  activities: {
    all: (projectId: string) => ['activities', projectId] as const,
    byTask: (taskId: string) => ['activities', 'task', taskId] as const,
  },
  search: {
    global: (query: string) => ['search', 'global', query] as const,
    tasks: (query: string) => ['search', 'tasks', query] as const,
  },
};

/**
 * Helpers para invalidação de cache otimizada
 */
export const invalidationHelpers = {
  /**
   * Invalida todas as queries relacionadas a um projeto
   */
  invalidateProject: (queryClient: any, projectId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.detail(projectId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.tasks(projectId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.activities(projectId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.tasks.all(projectId) });
  },
  /**
   * Invalida queries de um workspace e seus projetos
   */
  invalidateWorkspace: (queryClient: any, workspaceId: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.detail(workspaceId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.members(workspaceId) });
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all(workspaceId) });
  },
};

/**
 * Utilitários para atualizações otimistas
 */
export const optimisticHelpers = {
  /**
   * Atualiza tarefa no cache otimisticamente
   */
  updateTaskInCache: (queryClient: any, projectId: string, taskId: string, updates: any) => {
    queryClient.setQueryData(queryKeys.tasks.all(projectId), (old: any) => {
      if (!old) return old;
      return old.map((task: any) => 
        task.id === taskId ? { ...task, ...updates } : task
      );
    });
  },
};
