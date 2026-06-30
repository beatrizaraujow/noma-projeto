// User Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

// Permissions & Roles
export * from './permissions';

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
}

export interface UpdateUserDto {
  name?: string;
  email?: string;
}

// Auth Types
export interface LoginDto {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  user: Omit<User, 'password'>;
}

// Project Types
export interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectDto {
  name: string;
  description?: string;
  color?: string;
  icon?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
  color?: string;
  icon?: string;
}

// Task Types
export type TaskStatus =
  | 'EM_PROGRESSO'
  | 'ALTERAR'
  | 'APROVAR'
  | 'REVISAO_IA'
  | 'APROVACAO_LIDER'
  | 'PUBLICAR'
  | 'BANCO_CRIATIVOS'
  | 'REVISAO_SOLICITADA'
  | 'COMPLETO';

export type TaskStatusGroup = 'ATIVO' | 'FEITO' | 'FECHADO';

export const TASK_STATUS_CONFIG: Record<TaskStatus, {
  label: string;
  group: TaskStatusGroup;
  color: string;
  icon: 'clock' | 'x-circle' | 'check-circle' | 'circle-check' | 'check';
}> = {
  EM_PROGRESSO:       { label: 'Em Progresso',       group: 'ATIVO',   color: '#f59e0b', icon: 'clock' },
  ALTERAR:            { label: 'Alterar',             group: 'ATIVO',   color: '#ef4444', icon: 'x-circle' },
  APROVAR:            { label: 'Aprovar',             group: 'FEITO',   color: '#22c55e', icon: 'check-circle' },
  REVISAO_IA:         { label: 'Revisão IA',          group: 'FEITO',   color: '#6b7280', icon: 'circle-check' },
  APROVACAO_LIDER:    { label: 'Aprovação Líder',     group: 'FEITO',   color: '#f97316', icon: 'circle-check' },
  PUBLICAR:           { label: 'Publicar',            group: 'FEITO',   color: '#ec4899', icon: 'circle-check' },
  BANCO_CRIATIVOS:    { label: 'Banco de Criativos',  group: 'FEITO',   color: '#3b82f6', icon: 'circle-check' },
  REVISAO_SOLICITADA: { label: 'Revisão Solicitada',  group: 'FEITO',   color: '#6366f1', icon: 'circle-check' },
  COMPLETO:           { label: 'Completo',            group: 'FECHADO', color: '#22c55e', icon: 'check' },
};

export const TASK_STATUS_GROUPS: Record<TaskStatusGroup, { label: string; statuses: TaskStatus[] }> = {
  ATIVO:   { label: 'Ativo',   statuses: ['EM_PROGRESSO', 'ALTERAR'] },
  FEITO:   { label: 'Feito',   statuses: ['APROVAR', 'REVISAO_IA', 'APROVACAO_LIDER', 'PUBLICAR', 'BANCO_CRIATIVOS', 'REVISAO_SOLICITADA'] },
  FECHADO: { label: 'Fechado', statuses: ['COMPLETO'] },
};

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export const TASK_PRIORITY_CONFIG: Record<TaskPriority, { label: string; color: string }> = {
  LOW:    { label: 'Baixa',   color: '#6b7280' },
  MEDIUM: { label: 'Média',   color: '#f59e0b' },
  HIGH:   { label: 'Alta',    color: '#f97316' },
  URGENT: { label: 'Urgente', color: '#ef4444' },
};

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate?: Date;
  projectId: string;
  assigneeId?: string;
  position: number;
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTaskDto {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  projectId: string;
  assigneeId?: string;
  estimatedHours?: number;
}

export interface UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date;
  assigneeId?: string;
  position?: number;
  estimatedHours?: number;
  actualHours?: number;
}

// Time Entry Types
export interface TimeEntry {
  id: string;
  taskId: string;
  userId: string;
  hours: number;
  description?: string;
  date: Date;
  createdAt: Date;
  user?: { id: string; name: string; avatar?: string };
}

export interface CreateTimeEntryDto {
  hours: number;
  description?: string;
  date?: string;
}

// Routine Types
export type RoutineFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY';

export interface Routine {
  id: string;
  workspaceId: string;
  title: string;
  description?: string;
  frequency: RoutineFrequency;
  order: number;
  isActive: boolean;
  allowedRoles: string[];
  createdAt: Date;
  updatedAt: Date;
  completions?: RoutineCompletion[];
  completedByMe?: boolean;
}

export interface RoutineCompletion {
  id: string;
  routineId: string;
  userId: string;
  completedAt: Date;
  periodKey: string;
  user?: { id: string; name: string; avatar?: string };
}

export interface CreateRoutineDto {
  title: string;
  description?: string;
  frequency: RoutineFrequency;
  allowedRoles?: string[];
  order?: number;
}

export interface RoutineMetrics {
  routine: Routine;
  completionRate: number;
  completedBy: { userId: string; name: string; completedAt: Date }[];
}

// Comment Types
export interface Comment {
  id: string;
  content: string;
  taskId: string;
  authorId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateCommentDto {
  content: string;
  taskId: string;
}

// Activity Types
export interface Activity {
  id: string;
  type: string;
  description: string;
  projectId?: string;
  taskId?: string;
  userId: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

// WebSocket Events
export interface WebSocketEvent<T = any> {
  event: string;
  data: T;
}

export interface TaskUpdateEvent {
  projectId: string;
  task: Task;
}

export interface TypingEvent {
  projectId: string;
  user: string;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
