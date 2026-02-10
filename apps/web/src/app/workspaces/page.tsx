'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  _count: {
    projects: number;
    members: number;
  };
}

// Mock data for demonstration
const MOCK_WORKSPACES: Workspace[] = [
  {
    id: '1',
    name: 'Projeto Principal',
    slug: 'main-project',
    description: 'Workspace principal para desenvolvimento',
    icon: 'rocket',
    color: 'from-orange-500 to-red-600',
    _count: { projects: 0, members: 0 }
  },
  {
    id: '2',
    name: 'Marketing Digital',
    slug: 'marketing',
    description: 'Campanhas e estratégias de marketing',
    icon: 'device-mobile',
    color: 'from-purple-500 to-pink-600',
    _count: { projects: 0, members: 0 }
  },
  {
    id: '3',
    name: 'Design & UX',
    slug: 'design',
    description: 'Projetos de interface e experiência',
    icon: 'palette',
    color: 'from-blue-500 to-cyan-600',
    _count: { projects: 0, members: 0 }
  },
];

export default function WorkspacesPage() {
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>(MOCK_WORKSPACES);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspace, setNewWorkspace] = useState({
    name: '',
    description: '',
    icon: 'briefcase'
  });

  const createWorkspace = () => {
    if (!newWorkspace.name.trim()) return;

    const workspace: Workspace = {
      id: String(Date.now()),
      name: newWorkspace.name,
      slug: newWorkspace.name.toLowerCase().replace(/\s+/g, '-'),
      description: newWorkspace.description,
      icon: newWorkspace.icon,
      color: 'from-orange-500 to-red-600',
      _count: { projects: 0, members: 0 }
    };

    setWorkspaces([...workspaces, workspace]);
    setNewWorkspace({ name: '', description: '', icon: 'briefcase' });
    setShowCreate(false);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-600 to-red-900">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-600/30 blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-red-800/30 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-red-700/20 blur-3xl" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/10 backdrop-blur-sm">
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-3xl font-bold text-white tracking-tight">
            <span className="text-orange-300">/</span>noma
          </span>
        </Link>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white rounded-lg font-medium transition-all duration-200 border border-white/20"
        >
          Logout
        </button>
      </header>

      {/* Main Content */}
      <div className="relative z-10 px-8 py-12">
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="flex justify-between items-center mb-12">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Meus Workspaces
              </h1>
              <p className="text-white/80 text-lg">
                Gerencie seus projetos e equipes
              </p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-white hover:bg-white/90 text-orange-600 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
            >
              <span className="text-xl">+</span>
              Novo Workspace
            </button>
          </div>

          {/* Create Workspace Form */}
          {showCreate && (
            <div className="bg-white rounded-2xl p-8 mb-8 shadow-2xl animate-in fade-in slide-in-from-top-4 duration-300">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Criar Novo Workspace
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone (nome Phosphor)
                  </label>
                  <input
                    type="text"
                    value={newWorkspace.icon}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, icon: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="briefcase"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Workspace
                  </label>
                  <input
                    type="text"
                    value={newWorkspace.name}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none"
                    placeholder="ex: Meu Projeto"
                    onKeyPress={(e) => e.key === 'Enter' && createWorkspace()}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={newWorkspace.description}
                    onChange={(e) => setNewWorkspace({ ...newWorkspace, description: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none resize-none"
                    placeholder="Descreva o propósito deste workspace"
                    rows={3}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={createWorkspace}
                  disabled={!newWorkspace.name.trim()}
                  className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-orange-500/30"
                >
                  Criar Workspace
                </button>
                <button
                  onClick={() => {
                    setShowCreate(false);
                    setNewWorkspace({ name: '', description: '', icon: 'briefcase' });
                  }}
                  className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-semibold transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Workspaces Grid */}
          {workspaces.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {workspaces.map((workspace) => (
                <div
                  key={workspace.id}
                  onClick={() => router.push(`/workspaces/${workspace.id}`)}
                  className="group bg-white rounded-2xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  {/* Workspace Icon */}
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${workspace.color || 'from-orange-500 to-red-600'} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform`}>
                    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 256 256">
                      <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.36V200Z"></path>
                    </svg>
                  </div>

                  {/* Workspace Name */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors">
                    {workspace.name}
                  </h3>

                  {/* Description */}
                  {workspace.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {workspace.description}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex gap-4 pt-4 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                      </svg>
                      <span className="text-sm font-medium">{workspace._count.projects}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span className="text-sm font-medium">{workspace._count.members}</span>
                    </div>
                  </div>

                  {/* Hover Arrow */}
                  <div className="mt-4 flex items-center text-orange-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="text-sm font-semibold">Abrir workspace</span>
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <div className="bg-white rounded-2xl p-12 shadow-2xl max-w-md mx-auto">
                <svg className="w-24 h-24 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 256 256">
                  <path d="M216,72H131.31L104,44.69A15.86,15.86,0,0,0,92.69,40H40A16,16,0,0,0,24,56V200.62A15.4,15.4,0,0,0,39.38,216H216.89A15.13,15.13,0,0,0,232,200.89V88A16,16,0,0,0,216,72ZM40,56H92.69l16,16H40ZM216,200H40V88H216Z"></path>
                </svg>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  Nenhum workspace ainda
                </h3>
                <p className="text-gray-600 mb-6">
                  Crie seu primeiro workspace para começar a organizar seus projetos
                </p>
                <button
                  onClick={() => setShowCreate(true)}
                  className="px-8 py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold shadow-lg shadow-orange-500/30 transition-colors"
                >
                  Criar Primeiro Workspace
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
