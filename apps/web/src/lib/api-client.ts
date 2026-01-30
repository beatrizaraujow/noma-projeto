/**
 * Cliente API otimizado com interceptors e tratamento de erros
 */
import axios, { AxiosError, AxiosInstance } from 'axios';
import { getSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Instância do axios com configurações otimizadas
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 15000, // 15 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor para adicionar token automaticamente
 */
apiClient.interceptors.request.use(
  async (config) => {
    const session = await getSession();
    if (session?.accessToken) {
      config.headers.Authorization = `Bearer ${session.accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * Response interceptor para tratamento centralizado de erros
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Funções de API otimizadas com tipagem
 */
export const api = {
  // Workspaces
  workspaces: {
    list: () => apiClient.get('/api/workspaces'),
    get: (id: string) => apiClient.get(`/api/workspaces/${id}`),
    create: (data: any) => apiClient.post('/api/workspaces', data),
    update: (id: string, data: any) => apiClient.put(`/api/workspaces/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/workspaces/${id}`),
  },

  // Projects
  projects: {
    list: (workspaceId: string) => 
      apiClient.get(`/api/projects?workspaceId=${workspaceId}`),
    get: (id: string) => apiClient.get(`/api/projects/${id}`),
    create: (data: any) => apiClient.post('/api/projects', data),
    update: (id: string, data: any) => apiClient.put(`/api/projects/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/projects/${id}`),
  },

  // Tasks - com suporte a paginação
  tasks: {
    list: (projectId: string, page = 1, limit = 50) => 
      apiClient.get(`/api/tasks/${projectId}?page=${page}&limit=${limit}`),
    get: (id: string) => apiClient.get(`/api/tasks/detail/${id}`),
    create: (data: any) => apiClient.post('/api/tasks', data),
    update: (id: string, data: any) => apiClient.put(`/api/tasks/${id}`, data),
    delete: (id: string) => apiClient.delete(`/api/tasks/${id}`),
    reorder: (id: string, data: { status: string; position: number }) =>
      apiClient.put(`/api/tasks/${id}/reorder`, data),
    filter: (filters: any) => apiClient.post('/api/tasks/filter', filters),
  },

  // Activities
  activities: {
    list: (projectId: string, page = 1, limit = 20) =>
      apiClient.get(`/api/activities/project/${projectId}?page=${page}&limit=${limit}`),
    byTask: (taskId: string) =>
      apiClient.get(`/api/activities/task/${taskId}`),
  },

  // Comments
  comments: {
    list: (taskId: string) => apiClient.get(`/api/comments/task/${taskId}`),
    create: (data: any) => apiClient.post('/api/comments', data),
    delete: (id: string) => apiClient.delete(`/api/comments/${id}`),
  },

  // Users
  users: {
    current: () => apiClient.get('/api/users/me'),
    get: (id: string) => apiClient.get(`/api/users/${id}`),
  },

  // Invites
  invites: {
    verify: (token: string) => 
      apiClient.get(`/api/invites/verify?token=${token}`),
    accept: (token: string) => 
      apiClient.post(`/api/invites/accept`, { token }),
    send: (data: any) => apiClient.post('/api/invites', data),
  },

  // Search
  search: {
    global: (query: string) => 
      apiClient.get(`/api/search?q=${encodeURIComponent(query)}`),
    tasks: (query: string, filters?: any) =>
      apiClient.post('/api/search/tasks', { query, ...filters }),
  },
};

export default api;
