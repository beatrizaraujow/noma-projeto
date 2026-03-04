'use client';

import { useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar, Header, MainContent } from '@/components/layout';
import { Badge, Button } from '@/components/common';
import { ArrowLeft, ArrowRight, Columns3, ListChecks } from 'lucide-react';

type ColumnId = 'backlog' | 'todo' | 'in-progress' | 'review' | 'done';

type Priority = 'low' | 'medium' | 'high' | 'urgent';

interface BoardTask {
  id: string;
  title: string;
  priority: Priority;
  assignee: string;
  dueDate: string;
}

interface BoardColumn {
  id: ColumnId;
  title: string;
  tasks: BoardTask[];
}

const COLUMN_ORDER: ColumnId[] = ['backlog', 'todo', 'in-progress', 'review', 'done'];

const PRIORITY_LABEL: Record<Priority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};

const INITIAL_COLUMNS: BoardColumn[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    tasks: [
      {
        id: '1',
        title: 'Mapear requisitos do novo fluxo de onboarding',
        priority: 'medium',
        assignee: 'Ana',
        dueDate: '22/02/2026',
      },
      {
        id: '2',
        title: 'Definir estrutura de permissões por workspace',
        priority: 'high',
        assignee: 'Bruno',
        dueDate: '24/02/2026',
      },
    ],
  },
  {
    id: 'todo',
    title: 'A Fazer',
    tasks: [
      {
        id: '3',
        title: 'Criar tela de configurações de equipe',
        priority: 'high',
        assignee: 'Carla',
        dueDate: '21/02/2026',
      },
      {
        id: '4',
        title: 'Atualizar validações de formulário de login',
        priority: 'urgent',
        assignee: 'Diego',
        dueDate: '20/02/2026',
      },
    ],
  },
  {
    id: 'in-progress',
    title: 'Em Progresso',
    tasks: [
      {
        id: '5',
        title: 'Padronizar estilos das páginas de autenticação',
        priority: 'medium',
        assignee: 'Elisa',
        dueDate: '23/02/2026',
      },
    ],
  },
  {
    id: 'review',
    title: 'Em Revisão',
    tasks: [
      {
        id: '6',
        title: 'Revisar métricas do dashboard principal',
        priority: 'low',
        assignee: 'Fabio',
        dueDate: '25/02/2026',
      },
    ],
  },
  {
    id: 'done',
    title: 'Concluído',
    tasks: [
      {
        id: '7',
        title: 'Aplicar nova logo em telas principais',
        priority: 'high',
        assignee: 'Giovana',
        dueDate: '19/02/2026',
      },
    ],
  },
];

export default function BoardPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('board');
  const [columns, setColumns] = useState<BoardColumn[]>(INITIAL_COLUMNS);

  const workspaceId = params.id as string;

  const tabs = [
    { id: 'board', label: 'Quadro', active: activeTab === 'board' },
    { id: 'list', label: 'Lista', active: activeTab === 'list' },
  ];

  const totalTasks = useMemo(
    () => columns.reduce((acc, col) => acc + col.tasks.length, 0),
    [columns]
  );

  const moveTask = (taskId: string, fromColumnId: ColumnId, direction: 'left' | 'right') => {
    const fromIndex = COLUMN_ORDER.indexOf(fromColumnId);
    const toIndex = direction === 'left' ? fromIndex - 1 : fromIndex + 1;

    if (toIndex < 0 || toIndex >= COLUMN_ORDER.length) {
      return;
    }

    const toColumnId = COLUMN_ORDER[toIndex];
    let taskToMove: BoardTask | null = null;

    const updatedColumns = columns.map((column) => {
      if (column.id === fromColumnId) {
        const nextTasks = column.tasks.filter((task) => {
          if (task.id === taskId) {
            taskToMove = task;
            return false;
          }
          return true;
        });
        return { ...column, tasks: nextTasks };
      }
      return column;
    });

    if (!taskToMove) return;

    setColumns(
      updatedColumns.map((column) => {
        if (column.id === toColumnId) {
          return { ...column, tasks: [taskToMove as BoardTask, ...column.tasks] };
        }
        return column;
      })
    );
  };

  const priorityVariant = (priority: Priority): 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' => {
    if (priority === 'urgent') return 'error';
    if (priority === 'high') return 'warning';
    if (priority === 'medium') return 'info';
    return 'default';
  };

  return (
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="projects" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Quadro Kanban" tabs={tabs} onTabChange={setActiveTab} />

        <MainContent>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={() => router.push(`/workspaces/${workspaceId}/projects`)}>
                <ArrowLeft size={16} className="mr-2" />
                Voltar para Projetos
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-[#1a1a1f] border border-gray-800 px-3 py-2 rounded-lg">
                <Columns3 size={16} />
                {columns.length} colunas
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-300 bg-[#1a1a1f] border border-gray-800 px-3 py-2 rounded-lg">
                <ListChecks size={16} />
                {totalTasks} tarefas
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4">
            {columns.map((column) => (
              <div key={column.id} className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-4 min-h-[420px]">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-white font-semibold">{column.title}</h3>
                  <span className="text-xs text-gray-400 bg-[#25252b] px-2 py-1 rounded-md border border-gray-700">
                    {column.tasks.length}
                  </span>
                </div>

                <div className="space-y-3">
                  {column.tasks.map((task) => (
                    <div key={task.id} className="bg-[#25252b] border border-gray-700 rounded-lg p-3">
                      <div className="mb-3">
                        <p className="text-white text-sm font-medium leading-relaxed">{task.title}</p>
                      </div>

                      <div className="flex items-center justify-between mb-3">
                        <Badge variant={priorityVariant(task.priority)} size="sm">
                          {PRIORITY_LABEL[task.priority]}
                        </Badge>
                        <span className="text-xs text-gray-400">{task.dueDate}</span>
                      </div>

                      <div className="text-xs text-gray-400 mb-3">Responsável: {task.assignee}</div>

                      <div className="flex items-center justify-between gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={column.id === 'backlog'}
                          onClick={() => moveTask(task.id, column.id, 'left')}
                        >
                          ←
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1"
                          disabled={column.id === 'done'}
                          onClick={() => moveTask(task.id, column.id, 'right')}
                        >
                          →
                        </Button>
                      </div>
                    </div>
                  ))}

                  {column.tasks.length === 0 && (
                    <div className="text-sm text-gray-500 text-center py-8 border border-dashed border-gray-700 rounded-lg">
                      Sem tarefas nesta coluna
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </MainContent>
      </div>
    </div>
  );
}
