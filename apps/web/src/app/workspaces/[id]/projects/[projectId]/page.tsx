'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar, Header, MainContent } from '@/components/layout';
import { Badge, Button } from '@/components/common';
import { ArrowLeft, CheckCircle2, Users, Upload } from 'lucide-react';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');

  const workspaceId = params.id as string;
  const projectId = params.projectId as string;

  const tabs = [
    { id: 'overview', label: 'Visão Geral', active: activeTab === 'overview' },
    { id: 'tasks', label: 'Tarefas', active: activeTab === 'tasks' },
    { id: 'files', label: 'Arquivos', active: activeTab === 'files' },
    { id: 'activity', label: 'Atividade', active: activeTab === 'activity' },
  ];

  const project = {
    id: projectId,
    name: 'Redesign do Website',
    description:
      'Renovação completa do site com UI/UX moderno, melhor performance e experiência aprimorada.',
    status: 'Ativo',
    priority: 'Alta',
    progress: 65,
    tasksTotal: 24,
    tasksDone: 16,
    members: 5,
    dueDate: '15/02/2026',
    createdAt: '01/12/2025',
    budget: 'R$ 50.000',
  };

  return (
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="projects" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={project.name} tabs={tabs} onTabChange={setActiveTab} />

        <MainContent>
          <div className="mb-6">
            <Button variant="secondary" onClick={() => router.push(`/workspaces/${workspaceId}/projects`)}>
              <ArrowLeft size={16} className="mr-2" />
              Voltar para Projetos
            </Button>
          </div>

          <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 mb-4">
              <div>
                <h2 className="text-white text-2xl font-bold mb-2">{project.name}</h2>
                <p className="text-gray-400 max-w-3xl">{project.description}</p>
              </div>
              <div className="flex gap-2">
                <Badge variant="success">{project.status}</Badge>
                <Badge variant="error">Prioridade {project.priority}</Badge>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-[#25252b] rounded-lg p-4 border border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-400 text-sm">Progresso</span>
                  <span className="text-white font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#25252b] rounded-lg p-4 border border-gray-700 flex items-center gap-3">
                <CheckCircle2 className="text-green-500" size={20} />
                <div>
                  <p className="text-gray-400 text-sm">Tarefas</p>
                  <p className="text-white font-semibold">{project.tasksDone}/{project.tasksTotal}</p>
                </div>
              </div>

              <div className="bg-[#25252b] rounded-lg p-4 border border-gray-700 flex items-center gap-3">
                <Users className="text-blue-500" size={20} />
                <div>
                  <p className="text-gray-400 text-sm">Membros</p>
                  <p className="text-white font-semibold">{project.members}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Atividade Recente</h3>
                <p className="text-gray-400">Feed de atividades será exibido aqui.</p>
              </div>

              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Visão de Tarefas</h3>
                <p className="text-gray-400">Lista de tarefas será exibida aqui.</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Ações Rápidas</h3>
                <div className="space-y-2">
                  <Button variant="secondary" className="w-full justify-start">
                    <CheckCircle2 size={16} className="mr-2" />
                    Criar Tarefa
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <Upload size={16} className="mr-2" />
                    Enviar Arquivo
                  </Button>
                  <Button variant="secondary" className="w-full justify-start">
                    <Users size={16} className="mr-2" />
                    Convidar Membro
                  </Button>
                </div>
              </div>

              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Detalhes do Projeto</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Status</span>
                    <span className="text-white font-medium">{project.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Prioridade</span>
                    <span className="text-white font-medium">{project.priority}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Prazo</span>
                    <span className="text-white font-medium">{project.dueDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Criado em</span>
                    <span className="text-white font-medium">{project.createdAt}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Orçamento</span>
                    <span className="text-white font-medium">{project.budget}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </MainContent>
      </div>
    </div>
  );
}
