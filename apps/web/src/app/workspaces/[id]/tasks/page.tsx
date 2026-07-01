'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import axios from 'axios';
import {
  Plus, Search, LayoutList, Columns, Clock, XCircle,
  CheckCircle, Circle, Check, ChevronDown, ChevronRight,
  User, Calendar, AlertCircle,
} from 'lucide-react';
import { TASK_STATUS_CONFIG, TASK_STATUS_GROUPS, TASK_PRIORITY_CONFIG, type TaskStatus, type TaskStatusGroup } from '@nexora/types';
import TaskFormModal from '@/components/features/tasks/TaskFormModal';
import { Sidebar } from '@/components/layout';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  assignee?: { id: string; name: string; avatar?: string };
  projectId: string;
  project?: { id: string; name: string };
}

interface Project {
  id: string;
  name: string;
}

const StatusIcon = ({ icon, color }: { icon: string; color: string }) => {
  const props = { size: 14, color, strokeWidth: 2 };
  if (icon === 'clock') return <Clock {...props} />;
  if (icon === 'x-circle') return <XCircle {...props} />;
  if (icon === 'check-circle') return <CheckCircle {...props} />;
  if (icon === 'circle-check') return <Circle {...props} />;
  return <Check {...props} />;
};

const StatusBadge = ({ status }: { status: TaskStatus }) => {
  const cfg = TASK_STATUS_CONFIG[status];
  if (!cfg) return null;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: cfg.color + '22', color: cfg.color }}>
      <StatusIcon icon={cfg.icon} color={cfg.color} />
      {cfg.label}
    </span>
  );
};

const PriorityBadge = ({ priority }: { priority: string }) => {
  const cfg = TASK_PRIORITY_CONFIG[priority as keyof typeof TASK_PRIORITY_CONFIG];
  if (!cfg) return null;
  return (
    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ backgroundColor: cfg.color + '22', color: cfg.color }}>
      {cfg.label}
    </span>
  );
};

export default function TasksPage() {
  const params = useParams();
  const workspaceId = Array.isArray(params?.id) ? params.id[0] : params?.id as string;
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;

  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'kanban'>('list');
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<TaskStatusGroup>>(new Set());
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const loadData = useCallback(async () => {
    if (!token || !workspaceId) return;
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${token}` };
      const [projectsRes, tasksRes] = await Promise.all([
        axios.get(`${API_URL}/projects?workspaceId=${workspaceId}`, { headers }),
        axios.get(`${API_URL}/tasks?workspaceId=${workspaceId}`, { headers }),
      ]);
      setProjects(projectsRes.data || []);
      setTasks(tasksRes.data || []);
    } catch {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  }, [token, workspaceId]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredTasks = tasks.filter((t) =>
    !search || t.title.toLowerCase().includes(search.toLowerCase())
  );

  const toggleGroup = (group: TaskStatusGroup) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      next.has(group) ? next.delete(group) : next.add(group);
      return next;
    });
  };

  const handleSaved = () => { setShowModal(false); setEditingTask(null); loadData(); };

  if (loading) {
    return (
      <div className="flex h-screen bg-[#16161a]">
        <Sidebar activeItem="tasks" />
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="tasks" />
      <div className="flex-1 overflow-auto">
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Tarefas</h1>
        <div className="flex items-center gap-3">
          <div className="flex bg-[#25252b] rounded-lg p-1">
            <button onClick={() => setView('list')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${view === 'list' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              <LayoutList size={15} /> Lista
            </button>
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1.5 ${view === 'kanban' ? 'bg-orange-500 text-white' : 'text-gray-400 hover:text-white'}`}>
              <Columns size={15} /> Kanban
            </button>
          </div>
          <button
            onClick={() => { setEditingTask(null); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus size={16} /> Nova Tarefa
          </button>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar tarefas..."
          className="w-full bg-[#25252b] text-white text-sm pl-9 pr-4 py-2 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
        />
      </div>

      {/* List view */}
      {view === 'list' && (
        <div className="space-y-3">
          {(Object.keys(TASK_STATUS_GROUPS) as TaskStatusGroup[]).map((group) => {
            const groupCfg = TASK_STATUS_GROUPS[group];
            const groupTasks = filteredTasks.filter((t) => TASK_STATUS_CONFIG[t.status]?.group === group);
            const isCollapsed = collapsedGroups.has(group);

            return (
              <div key={group} className="bg-[#1a1a1f] border border-gray-800 rounded-xl overflow-hidden">
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#25252b] transition-colors"
                >
                  <div className="flex items-center gap-2">
                    {isCollapsed ? <ChevronRight size={16} className="text-gray-400" /> : <ChevronDown size={16} className="text-gray-400" />}
                    <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">{groupCfg.label}</span>
                    <span className="text-xs text-gray-500 bg-[#25252b] px-2 py-0.5 rounded-full">{groupTasks.length}</span>
                  </div>
                </button>

                {!isCollapsed && (
                  <div className="divide-y divide-gray-800">
                    {groupTasks.length === 0 ? (
                      <p className="text-gray-500 text-sm px-4 py-3">Nenhuma tarefa neste grupo.</p>
                    ) : (
                      groupTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => { setEditingTask(task); setShowModal(true); }}
                          className="flex items-center gap-4 px-4 py-3 hover:bg-[#25252b] cursor-pointer transition-colors group"
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{task.title}</p>
                            {task.project && <p className="text-xs text-gray-500">{task.project.name}</p>}
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <StatusBadge status={task.status} />
                            <PriorityBadge priority={task.priority} />
                            {task.estimatedHours != null && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Clock size={11} />
                                {task.actualHours ?? 0}h / {task.estimatedHours}h
                              </span>
                            )}
                            {task.dueDate && (
                              <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Calendar size={11} />
                                {new Date(task.dueDate).toLocaleDateString('pt-BR')}
                              </span>
                            )}
                            {task.assignee ? (
                              <div className="h-6 w-6 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                                {task.assignee.name.charAt(0).toUpperCase()}
                              </div>
                            ) : (
                              <User size={16} className="text-gray-600" />
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {(Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((status) => {
            const cfg = TASK_STATUS_CONFIG[status];
            const columnTasks = filteredTasks.filter((t) => t.status === status);
            return (
              <div key={status} className="flex-shrink-0 w-72">
                <div className="flex items-center gap-2 mb-3 px-1">
                  <StatusIcon icon={cfg.icon} color={cfg.color} />
                  <span className="text-sm font-semibold text-gray-300">{cfg.label}</span>
                  <span className="text-xs text-gray-500 ml-auto">{columnTasks.length}</span>
                </div>
                <div className="space-y-2">
                  {columnTasks.map((task) => (
                    <div
                      key={task.id}
                      onClick={() => { setEditingTask(task); setShowModal(true); }}
                      className="bg-[#1a1a1f] border border-gray-800 rounded-lg p-3 cursor-pointer hover:border-gray-600 transition-colors"
                    >
                      <p className="text-sm font-medium text-white mb-2">{task.title}</p>
                      <div className="flex items-center justify-between">
                        <PriorityBadge priority={task.priority} />
                        {task.assignee ? (
                          <div className="h-5 w-5 rounded-full bg-orange-500 flex items-center justify-center text-white text-xs font-bold">
                            {task.assignee.name.charAt(0).toUpperCase()}
                          </div>
                        ) : null}
                      </div>
                      {task.estimatedHours != null && (
                        <div className="mt-2">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>{task.actualHours ?? 0}h realizadas</span>
                            <span>{task.estimatedHours}h estimadas</span>
                          </div>
                          <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-orange-500 rounded-full"
                              style={{ width: `${Math.min(100, ((task.actualHours ?? 0) / task.estimatedHours) * 100)}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tasks.length === 0 && !loading && (
        <div className="text-center py-16">
          <AlertCircle className="mx-auto text-gray-600 mb-3" size={40} />
          <p className="text-gray-400">Nenhuma tarefa ainda. Crie a primeira!</p>
        </div>
      )}

      {showModal && (
        <TaskFormModal
          workspaceId={workspaceId}
          projects={projects}
          task={editingTask}
          token={token}
          onClose={() => { setShowModal(false); setEditingTask(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
      </div>
    </div>
  );
}
