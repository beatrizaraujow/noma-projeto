'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Clock } from 'lucide-react';
import { TASK_STATUS_CONFIG, TASK_STATUS_GROUPS, TASK_PRIORITY_CONFIG, type TaskStatus, type TaskStatusGroup } from '@nexora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Project { id: string; name: string; }
interface Member { id: string; name: string; avatar?: string; }

interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: string;
  dueDate?: string;
  estimatedHours?: number;
  actualHours?: number;
  assigneeId?: string;
  projectId: string;
}

interface Props {
  workspaceId: string;
  projects: Project[];
  task?: Task | null;
  token: string;
  onClose: () => void;
  onSaved: () => void;
}

export default function TaskFormModal({ workspaceId, projects, task, token, onClose, onSaved }: Props) {
  const isEdit = Boolean(task?.id);
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'EM_PROGRESSO');
  const [priority, setPriority] = useState(task?.priority ?? 'MEDIUM');
  const [projectId, setProjectId] = useState(task?.projectId ?? projects[0]?.id ?? '');
  const [assigneeId, setAssigneeId] = useState(task?.assigneeId ?? '');
  const [dueDate, setDueDate] = useState(task?.dueDate ? task.dueDate.slice(0, 10) : '');
  const [estimatedHours, setEstimatedHours] = useState<string>(task?.estimatedHours?.toString() ?? '');
  const [members, setMembers] = useState<Member[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !workspaceId) return;
    axios.get(`${API_URL}/api/workspaces/${workspaceId}/members`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => setMembers(r.data?.members ?? [])).catch(() => {});
  }, [token, workspaceId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Título é obrigatório'); return; }
    if (!projectId) { setError('Selecione um projeto'); return; }
    setSaving(true);
    setError('');
    try {
      const payload = {
        title,
        description: description || undefined,
        status,
        priority,
        projectId,
        assigneeId: assigneeId || undefined,
        dueDate: dueDate || undefined,
        estimatedHours: estimatedHours ? Number(estimatedHours) : undefined,
      };
      if (isEdit) {
        await axios.put(`${API_URL}/api/tasks/${task!.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
      } else {
        await axios.post(`${API_URL}/api/tasks`, payload, { headers: { Authorization: `Bearer ${token}` } });
      }
      onSaved();
    } catch {
      setError('Erro ao salvar tarefa.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-gray-800">
          <h2 className="text-lg font-semibold text-white">{isEdit ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && <p className="text-red-400 text-sm bg-red-500/10 px-3 py-2 rounded">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Título *</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nome da tarefa"
              className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Descrição</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Detalhes da tarefa..."
              className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              >
                {(Object.keys(TASK_STATUS_GROUPS) as TaskStatusGroup[]).map((group) => (
                  <optgroup key={group} label={TASK_STATUS_GROUPS[group].label}>
                    {TASK_STATUS_GROUPS[group].statuses.map((s) => (
                      <option key={s} value={s}>{TASK_STATUS_CONFIG[s].label}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Prioridade</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              >
                {(Object.keys(TASK_PRIORITY_CONFIG) as Array<keyof typeof TASK_PRIORITY_CONFIG>).map((p) => (
                  <option key={p} value={p}>{TASK_PRIORITY_CONFIG[p].label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Projeto *</label>
            <select
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
            >
              <option value="">Selecione um projeto</option>
              {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-400 mb-1">Responsável</label>
            <select
              value={assigneeId}
              onChange={(e) => setAssigneeId(e.target.value)}
              className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
            >
              <option value="">Sem responsável</option>
              {members.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-400 mb-1">Prazo</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="flex items-center gap-1 text-xs font-medium text-gray-400 mb-1">
                <Clock size={11} /> Horas estimadas
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                placeholder="Ex: 4"
                className="w-full bg-[#25252b] text-white text-sm px-3 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {saving ? 'Salvando...' : isEdit ? 'Salvar' : 'Criar Tarefa'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
