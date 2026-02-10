'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Task {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'completed' | 'blocked';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignee: string;
  dueDate: string;
  project: string;
}

interface Activity {
  id: string;
  type: 'task' | 'project' | 'member';
  title: string;
  description: string;
  time: string;
  status: string;
  user: string;
}

// Mock data
const MOCK_TASKS: Task[] = [
  { id: '1', title: 'Design da nova landing page', status: 'in-progress', priority: 'high', assignee: 'João', dueDate: '15/02/2026', project: 'Website' },
  { id: '2', title: 'Corrigir bug no login', status: 'todo', priority: 'urgent', assignee: 'Sarah', dueDate: '12/02/2026', project: 'Backend' },
  { id: '3', title: 'Atualizar documentação', status: 'completed', priority: 'low', assignee: 'Mike', dueDate: '10/02/2026', project: 'Docs' },
  { id: '4', title: 'Reunião de revisão com cliente', status: 'todo', priority: 'medium', assignee: 'Ana', dueDate: '14/02/2026', project: 'Gestão' },
];

const MOCK_ACTIVITIES: Activity[] = [
  { id: '1', type: 'task', title: 'Tarefa Concluída', description: 'Design da landing page aprovado', time: '2h atrás', status: 'Concluído', user: 'João Silva' },
  { id: '2', type: 'project', title: 'Novo Projeto', description: 'App Mobile iniciado', time: '5h atrás', status: 'Em Progresso', user: 'Maria Santos' },
  { id: '3', type: 'member', title: 'Novo Membro', description: 'Pedro entrou na equipe', time: '1d atrás', status: 'Ativo', user: 'Admin' },
];

export default function WorkspaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('Esta Semana');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Stats data
  const stats = {
    totalTasks: 42,
    completedTasks: 28,
    inProgressTasks: 8,
    todoTasks: 6,
    overdueTasks: 6,
    completionRate: 67,
    activeProjects: 5,
    totalProjects: 8,
    teamMembers: 12,
    onlineMembers: 7,
    hoursTracked: 156,
    weeklyHours: 38,
  };

  // Chart data for productivity (last 7 days)
  const productivityData = [
    { day: 'Mon', completed: 6, inProgress: 3 },
    { day: 'Tue', completed: 8, inProgress: 4 },
    { day: 'Wed', completed: 5, inProgress: 5 },
    { day: 'Thu', completed: 9, inProgress: 2 },
    { day: 'Fri', completed: 7, inProgress: 4 },
    { day: 'Sat', completed: 3, inProgress: 1 },
    { day: 'Sun', completed: 2, inProgress: 0 },
  ];

  const maxProductivity = Math.max(...productivityData.map(d => d.completed + d.inProgress));

  const getStatusColor = (status: Task['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-900/30 text-green-400';
      case 'in-progress': return 'bg-orange-900/30 text-orange-400';
      case 'todo': return 'bg-gray-700 text-gray-300';
      case 'blocked': return 'bg-red-900/30 text-red-400';
    }
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
    }
  };

  return (
    <div className="flex min-h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a1a1a] border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-6 border-b border-gray-800">
          <Link href="/workspaces" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-white">
              <span className="text-orange-500">/</span>noma
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button className="w-full flex items-center gap-3 px-4 py-3 text-white bg-[#2a2a2a] rounded-lg hover:bg-[#333] transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="14" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="14" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {sidebarOpen && <span className="font-medium">Painel</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/analytics`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Análises</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/projects`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Projetos</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/invoices`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Faturas</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/recurring`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {sidebarOpen && <span className="font-medium">Recorrente</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/reports`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Relatórios</span>}
          </button>

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/feedback`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Feedback</span>}
          </button>
        </nav>

        {/* Upgrade Card */}
        <div className="p-4 m-4 bg-gradient-to-br from-orange-600 to-red-600 rounded-xl">
          <h3 className="text-white font-bold mb-1">Upgrade Pro!</h3>
          <p className="text-white/80 text-xs mb-3">Maior produtividade com melhores recursos</p>
          <button className="w-full px-4 py-2 bg-white text-orange-600 rounded-lg text-sm font-semibold hover:bg-gray-100 transition-colors">
            Fazer Upgrade
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-[#1a1a1a] border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
            <h1 className="text-2xl font-bold text-white">Painel</h1>
            <p className="text-gray-400 text-sm">Acompanhe seu fluxo de trabalho e produtividade</p>
            </div>
            <div className="flex items-center gap-3">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg border border-gray-700 hover:bg-[#333] transition-colors focus:outline-none focus:border-orange-500"
              >
                <option>Esta Semana</option>
                <option>Este Mês</option>
                <option>Este Ano</option>
              </select>
              <button className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium">
                + Nova Tarefa
              </button>
              <button 
                onClick={() => router.push('/workspaces')}
                className="p-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-4">
              <div className="text-white/80 text-xs font-medium mb-1">Total de Tarefas</div>
              <div className="text-white text-2xl font-bold">{stats.totalTasks}</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Concluídas</div>
              <div className="text-white text-2xl font-bold">{stats.completedTasks}</div>
              <div className="text-green-400 text-xs mt-1">{stats.completionRate}% taxa</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Em Progresso</div>
              <div className="text-white text-2xl font-bold">{stats.inProgressTasks}</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Atrasadas</div>
              <div className="text-white text-2xl font-bold">{stats.overdueTasks}</div>
              <div className="text-red-400 text-xs mt-1">Precisa de atenção</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Horas Registradas</div>
              <div className="text-white text-2xl font-bold">{stats.hoursTracked}</div>
              <div className="text-blue-400 text-xs mt-1">{stats.weeklyHours}h esta semana</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Projetos Ativos</div>
              <div className="text-white text-2xl font-bold">{stats.activeProjects}</div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* View Tabs and Filters */}
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button className="px-4 py-2 bg-orange-600 text-white rounded-lg font-medium">Lista</button>
              <button 
                onClick={() => router.push(`/workspaces/${params.id}/board`)}
                className="px-4 py-2 bg-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#333] transition-colors"
              >
                Quadro
              </button>
              <button className="px-4 py-2 bg-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#333] transition-colors">Linha do Tempo</button>
              <button className="px-4 py-2 bg-[#2a2a2a] text-gray-400 rounded-lg hover:bg-[#333] transition-colors">Calendário</button>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Buscar tarefas..." 
                  className="pl-10 pr-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500 w-64"
                />
                <svg className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <button className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                </svg>
                Filtrar
              </button>
              <button className="px-4 py-2 bg-[#2a2a2a] text-white rounded-lg hover:bg-[#333] transition-colors">
                Ordenar
              </button>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#2a2a2a] border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase">
              <div className="col-span-5">Tarefa</div>
              <div className="col-span-2">Status</div>
              <div className="col-span-2">Prioridade</div>
              <div className="col-span-2">Responsável</div>
              <div className="col-span-1">Entrega</div>
            </div>

            {/* Task Rows */}
            <div className="divide-y divide-gray-800">
              {MOCK_TASKS.map((task) => (
                <div 
                  key={task.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                >
                  {/* Task Title */}
                  <div className="col-span-5 flex items-center gap-3">
                    <input 
                      type="checkbox"
                      checked={task.status === 'Completed'}
                      readOnly
                      className="w-5 h-5 rounded border-gray-600 bg-[#2a2a2a] checked:bg-orange-600 checked:border-orange-600 cursor-pointer"
                    />
                    <div>
                      <div className="text-white font-medium">{task.title}</div>
                      <div className="text-gray-500 text-xs">{task.project}</div>
                    </div>
                  </div>

                  {/* Status */}
                  <div className="col-span-2 flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                      {task.status === 'completed' ? 'Concluído' : task.status === 'in-progress' ? 'Em Progresso' : task.status === 'todo' ? 'A Fazer' : 'Bloqueado'}
                    </span>
                  </div>

                  {/* Priority */}
                  <div className="col-span-2 flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                      {task.priority === 'high' ? 'Alta' : task.priority === 'medium' ? 'Média' : task.priority === 'low' ? 'Baixa' : 'Urgente'}
                    </span>
                  </div>

                  {/* Assignee */}
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      {task.assignee[0]}
                    </div>
                    <span className="text-gray-300 text-sm">{task.assignee}</span>
                  </div>

                  {/* Due Date */}
                  <div className="col-span-1 flex items-center">
                    <span className="text-gray-400 text-sm">{task.dueDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Grid - Productivity and Team Stats */}
          <div className="grid grid-cols-2 gap-6">
            {/* Productivity Chart */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg">Produtividade Semanal</h3>
                  <p className="text-gray-400 text-sm">Tarefas concluídas por dia</p>
                </div>
                <button className="text-orange-500 hover:text-orange-400 text-sm font-medium">Ver Detalhes</button>
              </div>

              {/* Bar Chart */}
              <div className="flex items-end justify-between gap-3 h-48">
                {productivityData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
                      <div 
                        className="w-full bg-gradient-to-t from-orange-600 to-red-500 rounded-t-lg hover:from-orange-500 hover:to-red-400 transition-all"
                        style={{ height: `${(data.completed / Math.max(...productivityData.map(d => d.completed))) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xs font-medium">{data.day}</div>
                      <div className="text-gray-500 text-xs">{data.completed}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Team Activity */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-white font-semibold text-lg">Atividade da Equipe</h3>
                  <p className="text-gray-400 text-sm">Atualizações e progresso recentes</p>
                </div>
              </div>

              {/* Activity List */}
              <div className="space-y-4">
                {MOCK_ACTIVITIES.slice(0, 4).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-1">
                      {activity.user[0]}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-white text-sm font-medium">{activity.title}</div>
                          <div className="text-gray-400 text-xs">{activity.description}</div>
                        </div>
                        <span className="text-gray-500 text-xs whitespace-nowrap ml-2">{activity.time}</span>
                      </div>
                      <span className={`inline-block mt-1 px-2 py-0.5 rounded text-xs font-medium ${
                        activity.status === 'Concluído' 
                          ? 'bg-green-900/30 text-green-400' 
                          : activity.status === 'Em Progresso'
                          ? 'bg-orange-900/30 text-orange-400'
                          : 'bg-blue-900/30 text-blue-400'
                      }`}>
                        {activity.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              <button className="w-full mt-4 py-2 text-orange-500 hover:text-orange-400 text-sm font-medium">
                Ver Todas as Atividades →
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
