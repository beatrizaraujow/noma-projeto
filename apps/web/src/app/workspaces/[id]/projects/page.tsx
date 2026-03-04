'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar, Header, MainContent } from '@/components/layout';
import { MetricCard } from '@/components/features/dashboard';
import { Badge, Button } from '@/components/common';
import { 
  FolderKanban,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus
} from 'lucide-react';

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
  const [showCreate, setShowCreate] = useState(false);
  const [newProject, setNewProject] = useState({ name: '', description: '', priority: 'medium' });
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Todos', active: activeTab === 'all' },
    { id: 'active', label: 'Ativos', active: activeTab === 'active' },
    { id: 'completed', label: 'Concluídos', active: activeTab === 'completed' },
  ];

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

  return (
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="projects" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Projetos" 
          tabs={tabs}
          onTabChange={setActiveTab}
        />
        
        <MainContent>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Total"
              value={projects.length}
              subtitle="Todos os projetos"
              icon={<FolderKanban size={20} />}
              iconBgColor="bg-orange-500/20"
              iconColor="text-orange-500"
            />
            
            <MetricCard
              title="Ativos"
              value={projects.filter(p => p.status === 'active').length}
              trend={{ value: 2, direction: 'up' }}
              subtitle="Em andamento"
              icon={<Clock size={20} />}
              iconBgColor="bg-green-500/20"
              iconColor="text-green-500"
            />
            
            <MetricCard
              title="Em Espera"
              value={projects.filter(p => p.status === 'on-hold').length}
              subtitle="Pausados"
              icon={<AlertCircle size={20} />}
              iconBgColor="bg-yellow-500/20"
              iconColor="text-yellow-500"
            />
            
            <MetricCard
              title="Concluídos"
              value={projects.filter(p => p.status === 'completed').length}
              trend={{ value: 1, direction: 'up' }}
              subtitle="Finalizados"
              icon={<CheckCircle2 size={20} />}
              iconBgColor="bg-blue-500/20"
              iconColor="text-blue-500"
            />
          </div>

          {/* Create Button */}
          <div className="mb-6">
            <Button 
              onClick={() => setShowCreate(!showCreate)}
              className="w-full md:w-auto"
            >
              <Plus size={16} className="mr-2" />
              Novo Projeto
            </Button>
          </div>

          {/* Create Form */}
          {showCreate && (
            <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold text-lg mb-4">Criar Novo Projeto</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full px-4 py-2 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Nome do projeto"
                />
                <textarea
                  value={newProject.description}
                  onChange={(e) => setNewProject({ ...newProject, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 h-24 resize-none"
                  placeholder="Descrição do projeto"
                />
                <select
                  value={newProject.priority}
                  onChange={(e) => setNewProject({ ...newProject, priority: e.target.value })}
                  className="w-full px-4 py-2 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="low">Baixa Prioridade</option>
                  <option value="medium">Média Prioridade</option>
                  <option value="high">Alta Prioridade</option>
                </select>
                <div className="flex gap-2">
                  <Button onClick={createProject}>
                    Criar Projeto
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => setShowCreate(false)}
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div
                key={project.id}
                className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors cursor-pointer"
                onClick={() => router.push(`/workspaces/${params.id}/projects/${project.id}`)}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold text-lg mb-1">{project.name}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2">{project.description}</p>
                  </div>
                  <Badge 
                    variant={
                      project.status === 'completed' ? 'success' :
                      project.status === 'active' ? 'info' : 'warning'
                    }
                  >
                    {project.status === 'active' ? 'Ativo' : 
                     project.status === 'on-hold' ? 'Em Espera' : 'Concluído'}
                  </Badge>
                </div>

                <div className="space-y-3 mb-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Progresso</span>
                      <span className="text-white font-medium">{project.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full transition-all"
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
                    <Badge 
                      variant={
                        project.priority === 'high' ? 'error' :
                        project.priority === 'medium' ? 'warning' : 'default'
                      }
                      size="sm"
                    >
                      {project.priority === 'high' ? 'Alta' : 
                       project.priority === 'medium' ? 'Média' : 'Baixa'}
                    </Badge>
                  </div>
                </div>

                <Button
                  variant="default"
                  className="w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(`/workspaces/${params.id}/projects/${project.id}`);
                  }}
                >
                  Ver Detalhes
                </Button>
              </div>
            ))}
          </div>
        </MainContent>
      </div>
    </div>
  );
}
