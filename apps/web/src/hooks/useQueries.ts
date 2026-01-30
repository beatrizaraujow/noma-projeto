/**
 * Custom hooks otimizados com React Query
 * Implementa caching estratégico e prefetching
 */
import { useQuery, useMutation, useQueryClient, UseQueryOptions } from '@tanstack/react-query';
import { queryConfig, queryKeys, invalidationHelpers } from '@/lib/query-config';
import api from '@/lib/api-client';

/**
 * Hook para listar workspaces com cache otimizado
 */
export function useWorkspaces() {
  return useQuery({
    queryKey: queryKeys.workspaces.all,
    queryFn: async () => {
      const { data } = await api.workspaces.list();
      return data;
    },
    ...queryConfig.entities.workspaces,
  });
}

/**
 * Hook para detalhes de workspace
 */
export function useWorkspace(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.workspaces.detail(id),
    queryFn: async () => {
      const { data } = await api.workspaces.get(id);
      
      // Prefetch projects do workspace
      if (data.projects?.length) {
        data.projects.forEach((project: any) => {
          queryClient.setQueryData(
            queryKeys.projects.detail(project.id),
            project
          );
        });
      }
      
      return data;
    },
    ...queryConfig.entities.workspaces,
    enabled: !!id,
  });
}

/**
 * Hook para criar workspace com invalidação otimizada
 */
export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.workspaces.create(data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
    },
  });
}

/**
 * Hook para projetos com prefetching
 */
export function useProjects(workspaceId: string) {
  return useQuery({
    queryKey: queryKeys.projects.all(workspaceId),
    queryFn: async () => {
      const { data } = await api.projects.list(workspaceId);
      return data;
    },
    ...queryConfig.entities.projects,
    enabled: !!workspaceId,
  });
}

/**
 * Hook para detalhes de projeto com prefetch de tarefas
 */
export function useProject(id: string) {
  const queryClient = useQueryClient();

  return useQuery({
    queryKey: queryKeys.projects.detail(id),
    queryFn: async () => {
      const { data } = await api.projects.get(id);
      
      // Prefetch tasks do projeto
      if (data.tasks?.length) {
        queryClient.setQueryData(queryKeys.tasks.all(id), data.tasks);
      }
      
      return data;
    },
    ...queryConfig.entities.projects,
    enabled: !!id,
  });
}

/**
 * Hook para tarefas com paginação
 */
export function useTasks(projectId: string, page = 1, limit = 50) {
  return useQuery({
    queryKey: [...queryKeys.tasks.all(projectId), page, limit],
    queryFn: async () => {
      const { data } = await api.tasks.list(projectId, page, limit);
      return data;
    },
    ...queryConfig.entities.tasks,
    enabled: !!projectId,
    // Manter dados anteriores enquanto carrega próxima página
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook para criar tarefa com atualização otimista
 */
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.tasks.create(data);
      return response.data;
    },
    onMutate: async (newTask) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.tasks.all(newTask.projectId) 
      });

      // Snapshot previous value
      const previousTasks = queryClient.getQueryData(
        queryKeys.tasks.all(newTask.projectId)
      );

      // Optimistically update
      queryClient.setQueryData(
        queryKeys.tasks.all(newTask.projectId),
        (old: any) => {
          if (!old) return [{ ...newTask, id: 'temp-id' }];
          return [...old, { ...newTask, id: 'temp-id' }];
        }
      );

      return { previousTasks };
    },
    onError: (err, newTask, context: any) => {
      // Rollback on error
      queryClient.setQueryData(
        queryKeys.tasks.all(newTask.projectId),
        context.previousTasks
      );
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      invalidationHelpers.invalidateProject(queryClient, variables.projectId);
    },
  });
}

/**
 * Hook para atualizar tarefa com atualização otimista
 */
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await api.tasks.update(id, data);
      return response.data;
    },
    onMutate: async (variables) => {
      await queryClient.cancelQueries({ 
        queryKey: queryKeys.tasks.all(variables.projectId) 
      });

      const previousTasks = queryClient.getQueryData(
        queryKeys.tasks.all(variables.projectId)
      );

      // Optimistic update
      queryClient.setQueryData(
        queryKeys.tasks.all(variables.projectId),
        (old: any) => {
          if (!old) return old;
          return old.map((task: any) =>
            task.id === variables.id ? { ...task, ...variables } : task
          );
        }
      );

      return { previousTasks };
    },
    onError: (err, variables, context: any) => {
      queryClient.setQueryData(
        queryKeys.tasks.all(variables.projectId),
        context.previousTasks
      );
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: queryKeys.tasks.detail(variables.id) 
      });
    },
  });
}

/**
 * Hook para activities com paginação
 */
export function useActivities(projectId: string, page = 1, limit = 20) {
  return useQuery({
    queryKey: [...queryKeys.activities.all(projectId), page, limit],
    queryFn: async () => {
      const { data } = await api.activities.list(projectId, page, limit);
      return data;
    },
    ...queryConfig.entities.activities,
    enabled: !!projectId,
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Hook para comments de uma task
 */
export function useComments(taskId: string) {
  return useQuery({
    queryKey: ['comments', taskId],
    queryFn: async () => {
      const { data } = await api.comments.list(taskId);
      return data;
    },
    staleTime: 1 * 60 * 1000, // 1 minuto
    enabled: !!taskId,
  });
}

/**
 * Hook para criar comment
 */
export function useCreateComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await api.comments.create(data);
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ 
        queryKey: ['comments', variables.taskId] 
      });
    },
  });
}

/**
 * Hook para usuário atual
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: queryKeys.users.current,
    queryFn: async () => {
      const { data } = await api.users.current();
      return data;
    },
    ...queryConfig.entities.users,
  });
}

/**
 * Hook para search global com debounce
 */
export function useGlobalSearch(query: string, enabled = true) {
  return useQuery({
    queryKey: queryKeys.search.global(query),
    queryFn: async () => {
      const { data } = await api.search.global(query);
      return data;
    },
    staleTime: 30 * 1000, // 30 segundos
    enabled: enabled && query.length >= 3,
  });
}
