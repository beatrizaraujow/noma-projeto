'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { CustomDashboardWidgets, DashboardExport, WeeklyProductivityChart } from '@/components/features/dashboard';
import { CreateTaskTab } from '@/components/features/tasks';
import { Button } from '@/components/common';
import { Sidebar, Header, MainContent } from '@/components/layout';
import TeamProductivityMetrics from '@/components/features/dashboard/TeamProductivityMetrics';
import { ArrowLeft, LayoutDashboard, CheckCircle2, Clock, TrendingUp, Users } from 'lucide-react';

export default function WorkspaceDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const [mounted, setMounted] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Visão Geral', active: activeTab === 'overview' },
    { id: 'tasks', label: 'Tarefas', active: activeTab === 'tasks' },
    { id: 'create-task', label: 'Criar Tarefa', active: activeTab === 'create-task' },
    { id: 'analytics', label: 'Analytics', active: activeTab === 'analytics' },
    { id: 'team', label: 'Equipe', active: activeTab === 'team' },
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#111118]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  const token = 'demo-token';

  return (
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="workspace-dashboard" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          title="Painel do Workspace"
          tabs={tabs}
          onTabChange={setActiveTab}
        />

        <MainContent>
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              variant="ghost"
              onClick={() => router.push(`/workspaces/${workspaceId}`)}
              className="w-full sm:w-auto text-gray-300 border border-gray-700 bg-[#1a1a1f] hover:bg-[#25252b] hover:text-white"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Workspace
            </Button>

            <Button
              variant="ghost"
              onClick={() => router.push(`/workspaces/${workspaceId}`)}
              className="w-full sm:w-auto bg-orange-500 text-white hover:bg-orange-600 border border-orange-500"
            >
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Ver Resumo Geral
            </Button>
          </div>

          {activeTab === 'overview' && (
            <>
              <CustomDashboardWidgets
                workspaceId={workspaceId}
                token={token}
              />

              <div className="mt-6">
                <DashboardExport workspaceId={workspaceId} token={token} />
              </div>
            </>
          )}

          {activeTab === 'tasks' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Tarefas Hoje</p>
                      <p className="text-white text-2xl sm:text-3xl font-bold">14</p>
                    </div>
                    <div className="bg-orange-500/20 text-orange-400 p-3 rounded-lg">
                      <Clock size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Concluídas</p>
                      <p className="text-white text-2xl sm:text-3xl font-bold">9</p>
                    </div>
                    <div className="bg-orange-500/20 text-orange-400 p-3 rounded-lg">
                      <CheckCircle2 size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Eficiência</p>
                      <p className="text-white text-2xl sm:text-3xl font-bold">67%</p>
                    </div>
                    <div className="bg-orange-500/20 text-orange-400 p-3 rounded-lg">
                      <TrendingUp size={20} />
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm mb-1">Equipe</p>
                      <p className="text-white text-2xl sm:text-3xl font-bold">12</p>
                    </div>
                    <div className="bg-orange-500/20 text-orange-400 p-3 rounded-lg">
                      <Users size={20} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                <div className="lg:col-span-2 bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <h3 className="text-white font-semibold text-lg mb-4">Pipeline de Execução</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:bg-[#2e2e35] transition-colors">
                      <span className="text-gray-300 text-sm">Backlog</span>
                      <span className="text-white font-semibold">11</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:bg-[#2e2e35] transition-colors">
                      <span className="text-gray-300 text-sm">Em andamento</span>
                      <span className="text-orange-400 font-semibold">14</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:bg-[#2e2e35] transition-colors">
                      <span className="text-gray-300 text-sm">Em revisão</span>
                      <span className="text-white font-semibold">5</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:bg-[#2e2e35] transition-colors">
                      <span className="text-gray-300 text-sm">Concluídas</span>
                      <span className="text-white font-semibold">9</span>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <h3 className="text-white font-semibold text-lg mb-4">Ações</h3>
                  <div className="space-y-3">
                    <Button className="w-full bg-orange-500 hover:bg-orange-600 text-white" onClick={() => router.push(`/workspaces/${workspaceId}/board`)}>
                      Ver Kanban
                    </Button>
                    <Button variant="ghost" className="w-full bg-[#25252b] border border-gray-700 text-gray-200 hover:bg-[#2e2e35] hover:text-white" onClick={() => router.push(`/workspaces/${workspaceId}/analytics`)}>
                      Ver Analytics
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <WeeklyProductivityChart />
              <DashboardExport workspaceId={workspaceId} token={token} />
            </div>
          )}

          {activeTab === 'create-task' && (
            <CreateTaskTab workspaceId={workspaceId} />
          )}

          {activeTab === 'team' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <p className="text-gray-400 text-sm mb-1">Membros Ativos</p>
                  <p className="text-white text-2xl sm:text-3xl font-bold">12</p>
                </div>
                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <p className="text-gray-400 text-sm mb-1">Produtividade Média</p>
                  <p className="text-white text-2xl sm:text-3xl font-bold">87%</p>
                </div>
                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <p className="text-gray-400 text-sm mb-1">Horas Registradas</p>
                  <p className="text-white text-2xl sm:text-3xl font-bold">312h</p>
                </div>
              </div>

              <TeamProductivityMetrics workspaceId={workspaceId} token={token} />
            </div>
          )}
        </MainContent>
      </div>
    </div>
  );
}
