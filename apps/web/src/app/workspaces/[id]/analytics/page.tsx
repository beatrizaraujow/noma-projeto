'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const [selectedPeriod, setSelectedPeriod] = useState('Esta Semana');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Analytics data
  const metrics = {
    totalHours: 342,
    completionRate: 78,
    averageTaskTime: 4.2,
    productivityScore: 8.5,
    tasksCompleted: 156,
    tasksCreated: 200,
  };

  const weeklyData = [
    { day: 'Seg', hours: 8, tasks: 12 },
    { day: 'Ter', hours: 7.5, tasks: 10 },
    { day: 'Qua', hours: 9, tasks: 15 },
    { day: 'Qui', hours: 8.5, tasks: 13 },
    { day: 'Sex', hours: 6, tasks: 8 },
    { day: 'Sáb', hours: 3, tasks: 4 },
    { day: 'Dom', hours: 2, tasks: 2 },
  ];

  const projectPerformance = [
    { name: 'Website', completion: 85, tasks: 34, hours: 128 },
    { name: 'App Mobile', completion: 62, tasks: 28, hours: 98 },
    { name: 'Design System', completion: 91, tasks: 19, hours: 76 },
    { name: 'Marketing', completion: 45, tasks: 22, hours: 40 },
  ];

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a1a1a] border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <Link href="/workspaces" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-white">
              <span className="text-orange-500">/</span>noma
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => router.push(`/workspaces/${params.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="14" y="3" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="14" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <rect x="3" y="14" width="7" height="7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {sidebarOpen && <span className="font-medium">Painel</span>}
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-white bg-[#2a2a2a] rounded-lg">
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
              <h1 className="text-2xl font-bold text-white">Análises</h1>
              <p className="text-gray-400 text-sm">Insights detalhados de desempenho</p>
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
        </header>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-6 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-4">
              <div className="text-white/80 text-xs font-medium mb-1">Total de Horas</div>
              <div className="text-white text-2xl font-bold">{metrics.totalHours}h</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Taxa de Conclusão</div>
              <div className="text-white text-2xl font-bold">{metrics.completionRate}%</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Tempo Médio</div>
              <div className="text-white text-2xl font-bold">{metrics.averageTaskTime}h</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Score de Produtividade</div>
              <div className="text-white text-2xl font-bold">{metrics.productivityScore}/10</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Tarefas Concluídas</div>
              <div className="text-white text-2xl font-bold">{metrics.tasksCompleted}</div>
            </div>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Tarefas Criadas</div>
              <div className="text-white text-2xl font-bold">{metrics.tasksCreated}</div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-2 gap-6">
            {/* Weekly Activity */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-6">Atividade Semanal</h3>
              <div className="flex items-end justify-between gap-3 h-64">
                {weeklyData.map((data, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex flex-col justify-end" style={{ height: '200px' }}>
                      <div 
                        className="w-full bg-gradient-to-t from-orange-600 to-red-500 rounded-t-lg hover:from-orange-500 hover:to-red-400 transition-all"
                        style={{ height: `${(data.hours / 9) * 100}%` }}
                        title={`${data.hours}h - ${data.tasks} tarefas`}
                      ></div>
                    </div>
                    <div className="text-center">
                      <div className="text-white text-xs font-medium">{data.day}</div>
                      <div className="text-gray-500 text-xs">{data.hours}h</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Project Performance */}
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-6">Performance por Projeto</h3>
              <div className="space-y-4">
                {projectPerformance.map((project, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">{project.name}</span>
                      <span className="text-gray-400 text-sm">{project.completion}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.completion}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-gray-500 text-xs">{project.tasks} tarefas</span>
                      <span className="text-gray-500 text-xs">{project.hours}h</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6">
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Distribuição de Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Concluídas</span>
                  </div>
                  <span className="text-white font-medium">156</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Em Progresso</span>
                  </div>
                  <span className="text-white font-medium">28</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">A Fazer</span>
                  </div>
                  <span className="text-white font-medium">16</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Prioridades</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Urgente</span>
                  </div>
                  <span className="text-white font-medium">8</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Alta</span>
                  </div>
                  <span className="text-white font-medium">24</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-400 text-sm">Média</span>
                  </div>
                  <span className="text-white font-medium">42</span>
                </div>
              </div>
            </div>

            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold mb-4">Membros Ativos</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      J
                    </div>
                    <span className="text-gray-400 text-sm">João</span>
                  </div>
                  <span className="text-white font-medium">34 tarefas</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      M
                    </div>
                    <span className="text-gray-400 text-sm">Maria</span>
                  </div>
                  <span className="text-white font-medium">28 tarefas</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                      A
                    </div>
                    <span className="text-gray-400 text-sm">Ana</span>
                  </div>
                  <span className="text-white font-medium">19 tarefas</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
