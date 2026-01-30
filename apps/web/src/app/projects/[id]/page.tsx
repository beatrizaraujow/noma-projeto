'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useWebSocket } from '@/hooks/useWebSocket';
import ViewSwitcher from '@/components/views/ViewSwitcher';
import { TaskListView } from '@/components/views/TaskListView';
import { TaskCalendarView } from '@/components/views/TaskCalendarView';
import { TaskTimelineView } from '@/components/views/TaskTimelineView';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  position: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    comments: number;
  };
}

interface Project {
  id: string;
  name: string;
  description?: string;
  color?: string;
  tasks: Task[];
  members: Array<{
    id: string;
    name: string;
    email: string;
    avatar?: string;
  }>;
}

const STATUSES = [
  { key: 'TODO', label: 'To Do', color: 'bg-gray-100 dark:bg-gray-700' },
  {
    key: 'IN_PROGRESS',
    label: 'Em Progresso',
    color: 'bg-blue-100 dark:bg-blue-900',
  },
  { key: 'REVIEW', label: 'Revisão', color: 'bg-yellow-100 dark:bg-yellow-900' },
  { key: 'DONE', label: 'Concluído', color: 'bg-green-100 dark:bg-green-900' },
];

const PRIORITIES = [
  { key: 'LOW', label: 'Baixa', color: 'text-gray-500' },
  { key: 'MEDIUM', label: 'Média', color: 'text-blue-500' },
  { key: 'HIGH', label: 'Alta', color: 'text-orange-500' },
  { key: 'URGENT', label: 'Urgente', color: 'text-red-500' },
];

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  isBeingEdited?: boolean;
  editedBy?: string;
}

function TaskCard({ task, onClick, isBeingEdited, editedBy }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'text-gray-500',
      MEDIUM: 'text-blue-500',
      HIGH: 'text-orange-500',
      URGENT: 'text-red-500',
    };
    return colors[priority] || 'text-gray-500';
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: 'Baixa',
      MEDIUM: 'Média',
      HIGH: 'Alta',
      URGENT: 'Urgente',
    };
    return labels[priority] || priority;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`bg-white dark:bg-gray-700 rounded-lg p-4 shadow hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing ${
        isBeingEdited ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {isBeingEdited && (
        <div className="flex items-center gap-2 mb-2 text-xs text-blue-600 dark:text-blue-400">
          <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
          <span>{editedBy} está editando</span>
        </div>
      )}
      <div onClick={onClick}>
        <h4 className="font-medium text-gray-900 dark:text-white mb-2">
          {task.title}
        </h4>
        {task.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
            {task.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span
            className={`text-xs font-medium ${getPriorityColor(task.priority)}`}
          >
            {getPriorityLabel(task.priority)}
          </span>
          {task.dueDate && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formatDate(task.dueDate)}
            </span>
          )}
        </div>
        {task.assignee && (
          <div className="mt-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
              {task.assignee.name[0].toUpperCase()}
            </div>
            <span className="text-xs text-gray-600 dark:text-gray-400">
              {task.assignee.name}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ProjectDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('TODO');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    priority: '',
    assignee: '',
    search: '',
  });
  const [taskForm, setTaskForm] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    assigneeId: '',
    dueDate: '',
  })

  // WebSocket for real-time updates
  const { isConnected, presence, getUsersEditingTask } = useWebSocket({
    projectId: params.id as string,
    onTaskCreated: (task) => {
      console.log('New task created, reloading...');
      loadProject();
    },
    onTaskUpdated: (task) => {
      console.log('Task updated, reloading...');
      loadProject();
    },
    onTaskDeleted: ({ taskId }) => {
      console.log('Task deleted:', taskId);
      loadProject();
    },
    onTaskStatusChanged: ({ taskId, newStatus }) => {
      console.log('Task status changed:', taskId, newStatus);
    },
  });;

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  useEffect(() => {
    if (session?.accessToken && params.id) {
      loadProject();
    }
  }, [session, params.id]);

  const loadProject = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/projects/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      setProject(response.data);
    } catch (error) {
      console.error('Error loading project:', error);
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const createTask = async () => {
    if (!taskForm.title.trim()) return;

    try {
      await axios.post(
        `${API_URL}/api/tasks`,
        {
          projectId: params.id,
          title: taskForm.title,
          description: taskForm.description || undefined,
          priority: taskForm.priority,
          status: selectedStatus,
          assigneeId: taskForm.assigneeId || undefined,
          dueDate: taskForm.dueDate || undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      setTaskForm({
        title: '',
        description: '',
        priority: 'MEDIUM',
        assigneeId: '',
        dueDate: '',
      });
      setShowCreateTask(false);
      loadProject();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating task');
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const taskId = active.id as string;
    const newStatus = over.id as string;

    // Check if status is valid
    if (!STATUSES.find((s) => s.key === newStatus)) return;

    const task = project?.tasks.find((t) => t.id === taskId);
    if (!task || task.status === newStatus) return;

    try {
      await axios.put(
        `${API_URL}/api/tasks/${taskId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      loadProject();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getTasksByStatus = (status: string) => {
    let tasks = project?.tasks.filter((task) => task.status === status) || [];

    // Apply filters
    if (filters.priority) {
      tasks = tasks.filter((task) => task.priority === filters.priority);
    }
    if (filters.assignee) {
      tasks = tasks.filter((task) => task.assignee?.id === filters.assignee);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search)
      );
    }

    return tasks;
  };

  const clearFilters = () => {
    setFilters({ priority: '', assignee: '', search: '' });
  };

  const activeTask = activeId
    ? project?.tasks.find((task) => task.id === activeId)
    : null;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!project) return null;

  // Kanban Board Component
  const KanbanBoard = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {STATUSES.map((status) => (
        <div key={status.key} className="flex flex-col">
          <div
            className={`${status.color} rounded-t-lg p-4 flex items-center justify-between`}
          >
            <h3 className="font-semibold text-gray-900 dark:text-white">
              {status.label}
            </h3>
            <span className="text-sm text-gray-600 dark:text-gray-300">
              {getTasksByStatus(status.key).length}
            </span>
          </div>

          <SortableContext
            id={status.key}
            items={getTasksByStatus(status.key).map((task) => task.id)}
            strategy={verticalListSortingStrategy}
          >
            <div
              className="bg-gray-100 dark:bg-gray-800 rounded-b-lg p-4 min-h-[500px] space-y-3"
              style={{ minHeight: '500px' }}
            >
              {getTasksByStatus(status.key).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onClick={() => router.push(`/tasks/${task.id}`)}
                  isBeingEdited={getUsersEditingTask(task.id).length > 0}
                  editedBy={getUsersEditingTask(task.id)[0]?.userName}
                />
              ))}

              {status.key === 'TODO' && !showCreateTask && (
                <button
                  onClick={() => {
                    setShowCreateTask(true);
                    setSelectedStatus(status.key);
                  }}
                  className="w-full p-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:border-blue-500 hover:text-blue-500 transition-colors"
                >
                  + Nova Tarefa
                </button>
              )}
            </div>
          </SortableContext>
        </div>
      ))}
    </div>
  );

  // Get all filtered tasks
  const filteredTasks = () => {
    let tasks = project?.tasks || [];

    if (filters.priority) {
      tasks = tasks.filter((task) => task.priority === filters.priority);
    }
    if (filters.assignee) {
      tasks = tasks.filter((task) => task.assignee?.id === filters.assignee);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      tasks = tasks.filter(
        (task) =>
          task.title.toLowerCase().includes(search) ||
          task.description?.toLowerCase().includes(search)
      );
    }

    return tasks;
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-[1800px] mx-auto">
          <button
            onClick={() => router.push('/projects')}
            className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
          >
            ← Voltar para Projetos
          </button>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                    {project.name}
                  </h1>
                  {isConnected && (
                    <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                      <div className="w-2 h-2 bg-green-600 rounded-full animate-pulse" />
                      <span>Online</span>
                    </div>
                  )}
                </div>
                {project.description && (
                  <p className="text-gray-600 dark:text-gray-400">
                    {project.description}
                  </p>
                )}
                {presence.length > 0 && (
                  <div className="flex items-center gap-2 mt-3">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      👥 {presence.length} {presence.length === 1 ? 'pessoa' : 'pessoas'} online
                    </span>
                  </div>
                )}
              </div>
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: project.color || '#3B82F6' }}
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Buscar
                </label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                  placeholder="Buscar tarefas..."
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Prioridade
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    setFilters({ ...filters, priority: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todas</option>
                  {PRIORITIES.map((priority) => (
                    <option key={priority.key} value={priority.key}>
                      {priority.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="min-w-[150px]">
                <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                  Responsável
                </label>
                <select
                  value={filters.assignee}
                  onChange={(e) =>
                    setFilters({ ...filters, assignee: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Todos</option>
                  {project.members.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.name}
                    </option>
                  ))}
                </select>
              </div>
              {(filters.search || filters.priority || filters.assignee) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600"
                >
                  Limpar Filtros
                </button>
              )}
            </div>
          </div>

          {/* View Switcher with all views */}
          <ViewSwitcher
            tasks={filteredTasks()}
            projectId={params.id as string}
            ListViewComponent={TaskListView}
            CalendarViewComponent={TaskCalendarView}
            TimelineViewComponent={TaskTimelineView}
            KanbanViewComponent={KanbanBoard}
          />

          {showCreateTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                Nova Tarefa
              </h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, title: e.target.value })
                  }
                  placeholder="Título da tarefa"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                />
                <textarea
                  value={taskForm.description}
                  onChange={(e) =>
                    setTaskForm({ ...taskForm, description: e.target.value })
                  }
                  placeholder="Descrição (opcional)"
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Prioridade
                    </label>
                    <select
                      value={taskForm.priority}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, priority: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      {PRIORITIES.map((priority) => (
                        <option key={priority.key} value={priority.key}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Responsável
                    </label>
                    <select
                      value={taskForm.assigneeId}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, assigneeId: e.target.value })
                      }
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">Nenhum</option>
                      {project.members.map((member) => (
                        <option key={member.id} value={member.id}>
                          {member.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                    Data de Entrega
                  </label>
                  <input
                    type="date"
                    value={taskForm.dueDate}
                    onChange={(e) =>
                      setTaskForm({ ...taskForm, dueDate: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-2 mt-6">
                <button
                  onClick={createTask}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Criar
                </button>
                <button
                  onClick={() => {
                    setShowCreateTask(false);
                    setTaskForm({
                      title: '',
                      description: '',
                      priority: 'MEDIUM',
                      assigneeId: '',
                      dueDate: '',
                    });
                  }}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
          )}
        </div>

        <DragOverlay>
          {activeTask ? (
            <div className="bg-white dark:bg-gray-700 rounded-lg p-4 shadow-lg rotate-3 opacity-90">
              <h4 className="font-medium text-gray-900 dark:text-white">
                {activeTask.title}
              </h4>
            </div>
          ) : null}
        </DragOverlay>
      </div>
    </DndContext>
  );
}
