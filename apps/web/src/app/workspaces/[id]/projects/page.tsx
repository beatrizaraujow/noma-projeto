'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'on-hold' | 'completed';
  priority: 'low' | 'medium' | 'high';
  progress: number;
  members: number;
  tasksCount: number;
  completedTasks: number;
  dueDate: string;
}

export default function ProjectsPage() {
  const params = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', priority: 'medium' });

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      name: 'Redesign do Website',
      description: 'Renovação completa do site com UI/UX moderno',
      status: 'active',
      priority: 'high',
      progress: 65,
      members: 3,
      tasksCount: 24,
      completedTasks: 16,
      dueDate: '15/02/2026',
    },
    {
      id: '2',
      name: 'Desenvolvimento App Mobile',
      description: 'App iOS e Android para engajamento do cliente',
      status: 'active',
      priority: 'high',
      progress: 45,
      members: 2,
      tasksCount: 32,
      completedTasks: 14,
      dueDate: '01/03/2026',
    },
    {
      id: '3',
      name: 'Campanha Marketing Q1',
      description: 'Iniciativas de marketing do primeiro trimestre',
      status: 'on-hold',
      priority: 'medium',
      progress: 30,
      members: 1,
      tasksCount: 15,
      completedTasks: 4,
      dueDate: '31/03/2026',
    },
    {
      id: '4',
      name: 'Integração API',
      description: 'Integrações de API de terceiros para sincronização',
      status: 'completed',
      priority: 'low',
      progress: 100,
      members: 2,
      tasksCount: 12,
      completedTasks: 12,
      dueDate: '20/01/2026',
    },
  ]);

  const createProject = () => {
    if (!newProject.name.trim()) return;

    const project: Project = {
      id: String(Date.now()),
      name: newProject.name,
      description: newProject.description,
      status: 'active',
      priority: newProject.priority as any,
      progress: 0,
      members: 1,
      tasksCount: 0,
      completedTasks: 0,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString('pt-BR'),
    };

    setProjects([project, ...projects]);
    setNewProject({ name: '', description: '', priority: 'medium' });
    setShowCreate(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-900/30 text-green-400';
      case 'on-hold': return 'bg-yellow-900/30 text-yellow-400';
      case 'completed': return 'bg-blue-900/30 text-blue-400';
      default: return 'bg-gray-900/30 text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Ativo';
      case 'on-hold': return 'Em Espera';
      case 'completed': return 'Concluído';
      default: return status;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-gray-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a1a1a] border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-800">
          <Link href="/workspaces">
            <span className="text-2xl font-bold text-white">
              <span className="text-orange-500">/</span>noma
            </span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <button 
            onClick={() => router.push(`/workspaces/${params.id}`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="7" height="7" strokeWidth="2"/>
              <rect x="14" y="3" width="7" height="7" strokeWidth="2"/>
              <rect x="14" y="14" width="7" height="7" strokeWidth="2"/>
              <rect x="3" y="14" width="7" height="7" strokeWidth="2"/>
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

          <button className="w-full flex items-center gap-3 px-4 py-3 text-white bg-[#2a2a2a] rounded-lg">
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
        <header className="bg-[#1a1a1a] border-b border-gray-800 px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Projetos</h1>
              <p className="text-gray-400 text-sm">Gerencie e acompanhe todos os seus projetos</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
              >
                + Novo Projeto
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

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-4">
              <div className="text-white/80 text-xs font-medium mb-1">Total</div>
              <div className="text-white text-2xl font-bold">{projects.length}</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Ativos</div>
              <div className="text-white text-2xl font-bold">{projects.filter(p => p.status === 'active').length}</div>
              <div className="text-green-400 text-xs mt-1">Em andamento</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Em Espera</div>
              <div className="text-white text-2xl font-bold">{projects.filter(p => p.status === 'on-hold').length}</div>
              <div className="text-yellow-400 text-xs mt-1">Pausados</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Concluídos</div>
              <div className="text-white text-2xl font-bold">{projects.filter(p => p.status === 'completed').length}</div>
              <div className="text-blue-400 text-xs mt-1">Finalizados</div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Create Form */}
          {showCreate && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Criar Novo Projeto</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Nome do projeto"
                />
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 h-24 resize-none"
                  placeholder="Descrição do projeto"
                />
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="low">Baixa Prioridade</option>
                  <option value="medium">Média Prioridade</option>
                  <option value="high">Alta Prioridade</option>
                </select>
                <div className="flex gap-2">
                  <button
                    onClick={createProject}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    Criar Projeto
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/workspaces/${params.id}/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{project.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                    {getStatusText(project.status)}
                  </span>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Progresso</span>
                      <span className="text-white font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                        style={{ width: `${project.progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Tarefas:</span>
                    <span className="text-white font-medium">{project.completedTasks}/{project.tasksCount}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Membros:</span>
                    <span className="text-white font-medium">{project.members}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Prazo:</span>
                    <span className="text-white font-medium">{project.dueDate}</span>
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400">Prioridade:</span>
                    <span className={`font-medium ${getPriorityColor(project.priority)}`}>
                      {project.priority === 'high' ? 'Alta' : project.priority === 'medium' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/workspaces/${params.id}/projects/${project.id}`);
                  }}
                  className="w-full px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-sm transition-colors"
                >
                  Ver Detalhes
                </button>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
