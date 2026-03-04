'use client';

import { useMemo, useState } from 'react';
import { Button } from '@/components/common';
import { PlusCircle } from 'lucide-react';

interface CreateTaskTabProps {
  workspaceId: string;
  projects?: string[];
  assignees?: string[];
}

const DEFAULT_PROJECTS = ['Website', 'App Mobile', 'Design System', 'Marketing'];
const DEFAULT_ASSIGNEES = ['João', 'Maria', 'Ana', 'Sarah'];

export default function CreateTaskTab({ workspaceId, projects = DEFAULT_PROJECTS, assignees = DEFAULT_ASSIGNEES }: CreateTaskTabProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [project, setProject] = useState(projects[0] ?? '');
  const [assignee, setAssignee] = useState(assignees[0] ?? '');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');
  const [dueDate, setDueDate] = useState('');
  const [estimateHours, setEstimateHours] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const isSubmitDisabled = useMemo(() => !title.trim() || !dueDate, [title, dueDate]);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      setErrorMessage('Informe um título para a tarefa.');
      setSuccessMessage('');
      return;
    }

    if (!dueDate) {
      setErrorMessage('Selecione um prazo para a tarefa.');
      setSuccessMessage('');
      return;
    }

    setSuccessMessage(`Tarefa "${title}" criada no workspace ${workspaceId}.`);
    setErrorMessage('');
    setTitle('');
    setDescription('');
    setPriority('medium');
    setDueDate('');
    setEstimateHours('');
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6">
      <div className="xl:col-span-2 bg-[#1a1a1f] border border-gray-800 rounded-xl p-6 sm:p-7 shadow-[0_0_0_1px_rgba(249,115,22,0.02)]">
        <div className="flex items-center gap-3 mb-5 sm:mb-6">
          <div className="bg-orange-500/20 text-orange-500 p-3 rounded-lg">
            <PlusCircle size={20} />
          </div>
          <div>
            <h3 className="text-white text-base sm:text-lg font-semibold">Criar Nova Tarefa</h3>
            <p className="text-gray-400 text-sm">Preencha os campos abaixo para registrar uma nova atividade.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm text-gray-300 mb-2">Título</label>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ex.: Implementar fluxo de aprovação"
              className={`w-full bg-[#25252b] text-white text-sm px-4 py-2.5 rounded-lg border ${errorMessage && !title.trim() ? 'border-red-500/70' : 'border-gray-700'} focus:border-orange-500 focus:outline-none transition-colors`}
            />
            <p className="mt-1 text-xs text-gray-500">Use um nome curto e objetivo para facilitar buscas.</p>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Descrição</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Detalhes importantes, critérios de conclusão e observações."
              rows={4}
              className="w-full bg-[#25252b] text-white text-sm px-4 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition-colors resize-none"
            />
            <p className="mt-1 text-xs text-gray-500">Opcional: inclua critérios de aceite e contexto.</p>
          </div>

          <div className="rounded-xl border border-gray-800 bg-[#16161a] p-4">
            <p className="text-xs uppercase tracking-wide text-gray-500 mb-3">Planejamento</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
              <label className="block text-sm text-gray-300 mb-2">Projeto</label>
              <select
                value={project}
                onChange={(event) => setProject(event.target.value)}
                className="w-full bg-[#25252b] text-white text-sm px-4 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition-colors"
              >
                {projects.map((projectOption) => (
                  <option key={projectOption} value={projectOption}>
                    {projectOption}
                  </option>
                ))}
              </select>
              </div>

              <div>
              <label className="block text-sm text-gray-300 mb-2">Responsável</label>
              <select
                value={assignee}
                onChange={(event) => setAssignee(event.target.value)}
                className="w-full bg-[#25252b] text-white text-sm px-4 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition-colors"
              >
                {assignees.map((assigneeOption) => (
                  <option key={assigneeOption} value={assigneeOption}>
                    {assigneeOption}
                  </option>
                ))}
              </select>
              </div>

              <div>
              <label className="block text-sm text-gray-300 mb-2">Prioridade</label>
              <select
                value={priority}
                onChange={(event) => setPriority(event.target.value as 'low' | 'medium' | 'high' | 'urgent')}
                className="w-full bg-[#25252b] text-white text-sm px-4 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition-colors"
              >
                <option value="low">Baixa</option>
                <option value="medium">Média</option>
                <option value="high">Alta</option>
                <option value="urgent">Urgente</option>
              </select>
              </div>

              <div>
              <label className="block text-sm text-gray-300 mb-2">Prazo</label>
              <input
                type="date"
                value={dueDate}
                onChange={(event) => setDueDate(event.target.value)}
                className={`w-full bg-[#25252b] text-white text-sm px-4 py-2.5 rounded-lg border ${errorMessage && !dueDate ? 'border-red-500/70' : 'border-gray-700'} focus:border-orange-500 focus:outline-none transition-colors`}
              />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-2">Estimativa (horas)</label>
            <input
              type="number"
              min="1"
              value={estimateHours}
              onChange={(event) => setEstimateHours(event.target.value)}
              placeholder="Ex.: 8"
              className="w-full md:w-48 bg-[#25252b] text-white text-sm px-4 py-2.5 rounded-lg border border-gray-700 focus:border-orange-500 focus:outline-none transition-colors"
            />
            <p className="mt-1 text-xs text-gray-500">Opcional: ajuda no cálculo de capacidade da equipe.</p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
              <p className="text-red-300 text-sm">{errorMessage}</p>
            </div>
          )}

          {successMessage && (
            <div className="rounded-lg border border-orange-500/30 bg-orange-500/10 p-3">
              <p className="text-orange-300 text-sm">{successMessage}</p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
            <Button type="submit" disabled={isSubmitDisabled} className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white">
              Criar tarefa
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto bg-[#25252b] border border-gray-700 text-gray-200 hover:bg-[#2e2e35] hover:text-white"
              onClick={() => {
                setTitle('');
                setDescription('');
                setPriority('medium');
                setDueDate('');
                setEstimateHours('');
                setSuccessMessage('');
                setErrorMessage('');
              }}
            >
              Limpar
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6 sm:p-7 shadow-[0_0_0_1px_rgba(249,115,22,0.02)]">
        <h3 className="text-white text-base sm:text-lg font-semibold mb-4">Resumo</h3>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:border-orange-500/40 transition-colors">
            <span className="text-gray-400">Projeto</span>
            <span className="text-white font-medium">{project || '-'}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:border-orange-500/40 transition-colors">
            <span className="text-gray-400">Responsável</span>
            <span className="text-white font-medium">{assignee || '-'}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:border-orange-500/40 transition-colors">
            <span className="text-gray-400">Prioridade</span>
            <span className="text-orange-400 font-medium">{priority === 'low' ? 'Baixa' : priority === 'medium' ? 'Média' : priority === 'high' ? 'Alta' : 'Urgente'}</span>
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:border-orange-500/40 transition-colors">
            <span className="text-gray-400">Prazo</span>
            <span className="text-white font-medium">{dueDate || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
