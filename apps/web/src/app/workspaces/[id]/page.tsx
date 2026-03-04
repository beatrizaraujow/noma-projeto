'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar, Header, MainContent } from '@/components/layout';
import { MetricCard, OrdersTable, WeeklyProductivityChart } from '@/components/features/dashboard';
import { CreateTaskTab } from '@/components/features/tasks';
import { Badge, Button } from '@/components/common';
import { 
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Users,
  FolderKanban
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('overview');

  const tabs = [
    { id: 'overview', label: 'Visão Geral', active: activeTab === 'overview' },
    { id: 'tasks', label: 'Tarefas', active: activeTab === 'tasks' },
    { id: 'create-task', label: 'Criar Tarefa', active: activeTab === 'create-task' },
    { id: 'analytics', label: 'Analytics', active: activeTab === 'analytics' },
    { id: 'team', label: 'Equipe', active: activeTab === 'team' },
  ];

  // Stats data
  const stats = {
    totalTasks: 42,
    completedTasks: 28,
    inProgressTasks: 8,
    overdueTasks: 6,
    completionRate: 67,
    activeProjects: 5,
    teamMembers: 12,
  };

  // Transform tasks for OrdersTable
  const tasksForTable = MOCK_TASKS.map(task => ({
    id: task.id,
    customer: task.assignee,
    order: task.title,
    cost: task.project,
    dueDate: task.dueDate,
    deliveryStatus: task.status === 'completed' ? 'Completed' as const : 
                     task.status === 'in-progress' ? 'Pending' as const : 
                     task.status === 'blocked' ? 'Cancelled' as const : 'Processing' as const,
    payment: task.priority === 'urgent' ? 'Urgente' : 
             task.priority === 'high' ? 'Alta' :
             task.priority === 'medium' ? 'Média' : 'Baixa'
  }));

  const teamMembers = Array.from(new Set(MOCK_TASKS.map((task) => task.assignee)));
  const completedTasks = MOCK_TASKS.filter((task) => task.status === 'completed').length;
  const pendingTasks = MOCK_TASKS.filter((task) => task.status === 'todo' || task.status === 'in-progress').length;

  return (
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="dashboard" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Painel do Workspace" 
          tabs={tabs}
          onTabChange={setActiveTab}
        />
        
        <MainContent>
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
                <MetricCard
                  title="Total de Tarefas"
                  value={stats.totalTasks}
                  trend={{ value: 12.5, direction: 'up' }}
                  subtitle="Este mês"
                  icon={<LayoutDashboard size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />

                <MetricCard
                  title="Concluídas"
                  value={stats.completedTasks}
                  trend={{ value: stats.completionRate, direction: 'up' }}
                  subtitle={`${stats.completionRate}% de conclusão`}
                  icon={<CheckCircle2 size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />

                <MetricCard
                  title="Em Progresso"
                  value={stats.inProgressTasks}
                  subtitle="Tarefas ativas"
                  icon={<Clock size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />

                <MetricCard
                  title="Atrasadas"
                  value={stats.overdueTasks}
                  trend={{ value: 15, direction: 'down' }}
                  subtitle="Precisa de atenção"
                  icon={<AlertCircle size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="lg:col-span-2">
                  <WeeklyProductivityChart />
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-white text-lg font-semibold mb-2">Equipe</h3>
                      <p className="text-gray-400 text-sm">{stats.teamMembers} membros ativos</p>
                    </div>
                    <div className="bg-orange-500/20 text-orange-500 p-3 rounded-lg">
                      <Users size={20} />
                    </div>
                  </div>

                  <div className="space-y-4 mt-6">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Projetos Ativos</span>
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                        {stats.activeProjects}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Taxa de Conclusão</span>
                      <span className="text-white font-semibold">{stats.completionRate}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Tarefas/Membro</span>
                      <span className="text-white font-semibold">{Math.round(stats.totalTasks / stats.teamMembers)}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => router.push(`/workspaces/${params.id}/projects`)}
                    className="w-full mt-6 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white rounded-lg transition-colors font-medium flex items-center justify-center gap-2"
                  >
                    <FolderKanban size={16} />
                    Ver Projetos
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <OrdersTable
                  orders={tasksForTable}
                  title="Tarefas Recentes"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                  <h3 className="text-white text-lg font-semibold mb-4">Atividade Recente</h3>
                  <div className="space-y-4">
                    {MOCK_ACTIVITIES.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-3 pb-4 border-b border-gray-800 last:border-0 last:pb-0">
                        <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {activity.user[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-white text-sm font-medium truncate">{activity.title}</p>
                              <p className="text-gray-400 text-xs truncate">{activity.description}</p>
                            </div>
                            <span className="text-gray-500 text-xs whitespace-nowrap">{activity.time}</span>
                          </div>
                          <Badge
                            variant={
                              activity.status === 'Concluído' ? 'success' :
                              activity.status === 'Em Progresso' ? 'warning' : 'info'
                            }
                            size="sm"
                            className="mt-2"
                          >
                            {activity.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)]">
                  <h3 className="text-white text-lg font-semibold mb-4">Ações Rápidas</h3>
                  <div className="space-y-3">
                    <Button
                      variant="default"
                      className="w-full justify-start bg-orange-500 hover:bg-orange-600 text-white"
                      onClick={() => router.push(`/workspaces/${params.id}/board`)}
                    >
                      <LayoutDashboard size={16} className="mr-2" />
                      Visualizar Quadro Kanban
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start bg-[#25252b] border border-gray-700 text-gray-200 hover:text-white hover:bg-[#2e2e35]"
                      onClick={() => router.push(`/workspaces/${params.id}/analytics`)}
                    >
                      <TrendingUp size={16} className="mr-2" />
                      Ver Analytics
                    </Button>
                    <Button
                      variant="ghost"
                      className="w-full justify-start bg-[#25252b] border border-gray-700 text-gray-200 hover:text-white hover:bg-[#2e2e35]"
                      onClick={() => router.push(`/workspaces/${params.id}/projects`)}
                    >
                      <FolderKanban size={16} className="mr-2" />
                      Gerenciar Projetos
                    </Button>
                  </div>

                  <div className="mt-6 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-5 relative overflow-hidden">
                    <div className="relative z-10">
                      <h3 className="text-white font-bold text-lg mb-1">Upgrade Pro!</h3>
                      <p className="text-white/90 text-sm mb-4">
                        Desbloqueie recursos<br />avançados de produtividade
                      </p>
                      <button className="bg-white/20 hover:bg-white/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all backdrop-blur-sm">
                        Fazer Upgrade
                      </button>
                    </div>
                    <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-white/10 rounded-full"></div>
                    <div className="absolute -right-2 top-4 w-16 h-16 bg-white/10 rounded-full"></div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'tasks' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <MetricCard
                  title="Total"
                  value={MOCK_TASKS.length}
                  subtitle="tarefas mapeadas"
                  icon={<LayoutDashboard size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />
                <MetricCard
                  title="Pendentes"
                  value={pendingTasks}
                  subtitle="todo + em progresso"
                  icon={<Clock size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />
                <MetricCard
                  title="Concluídas"
                  value={completedTasks}
                  subtitle="último ciclo"
                  icon={<CheckCircle2 size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
                <div className="lg:col-span-2">
                  <OrdersTable
                    orders={tasksForTable}
                    title="Todas as Tarefas"
                  />
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)]">
                  <h3 className="text-white text-lg font-semibold mb-4">Resumo do Fluxo</h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:border-orange-500/40 transition-colors">
                      <span className="text-gray-300 text-sm">A Fazer</span>
                      <span className="text-white font-semibold">{MOCK_TASKS.filter((task) => task.status === 'todo').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:border-orange-500/40 transition-colors">
                      <span className="text-gray-300 text-sm">Em Progresso</span>
                      <span className="text-orange-400 font-semibold">{MOCK_TASKS.filter((task) => task.status === 'in-progress').length}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:border-orange-500/40 transition-colors">
                      <span className="text-gray-300 text-sm">Concluídas</span>
                      <span className="text-white font-semibold">{completedTasks}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:border-orange-500/40 transition-colors">
                      <span className="text-gray-300 text-sm">Bloqueadas</span>
                      <span className="text-white font-semibold">{MOCK_TASKS.filter((task) => task.status === 'blocked').length}</span>
                    </div>
                  </div>

                  <Button
                    className="w-full mt-4 bg-orange-500 hover:bg-orange-600 text-white"
                    onClick={() => router.push(`/workspaces/${params.id}/board`)}
                  >
                    Visualizar no Kanban
                  </Button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'create-task' && (
            <CreateTaskTab
              workspaceId={String(params.id)}
              projects={Array.from(new Set(MOCK_TASKS.map((task) => task.project)))}
              assignees={teamMembers}
            />
          )}

          {activeTab === 'analytics' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <WeeklyProductivityChart />
              </div>

              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-white text-lg font-semibold mb-4">Resumo Analytics</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Produtividade</span>
                    <span className="text-orange-400 font-semibold">Alta</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Gargalos</span>
                    <span className="text-white font-semibold">2 pontos</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Eficiência semanal</span>
                    <span className="text-white font-semibold">{stats.completionRate}%</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'team' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                <h3 className="text-white text-lg font-semibold mb-4">Membros da Equipe</h3>
                <div className="space-y-3">
                  {teamMembers.map((member) => (
                    <div key={member} className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700 hover:border-orange-500/40 hover:bg-[#2e2e35] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                          {member[0]}
                        </div>
                        <span className="text-white text-sm font-medium">{member}</span>
                      </div>
                      <span className="text-xs px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/30">
                        Ativo
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-5 sm:p-6 shadow-[0_0_0_1px_rgba(249,115,22,0.02)] hover:border-orange-500/30 transition-colors">
                <h3 className="text-white text-lg font-semibold mb-4">Distribuição da Equipe</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700">
                    <span className="text-gray-400 text-sm">Membros totais</span>
                    <span className="text-white font-semibold">{stats.teamMembers}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700">
                    <span className="text-gray-400 text-sm">Contribuidores ativos</span>
                    <span className="text-white font-semibold">{teamMembers.length}</span>
                  </div>
                  <div className="flex items-center justify-between p-3 rounded-lg bg-[#25252b] border border-gray-700">
                    <span className="text-gray-400 text-sm">Projetos por membro</span>
                    <span className="text-orange-400 font-semibold">{Math.max(1, Math.round(stats.activeProjects / teamMembers.length))}</span>
                  </div>
                </div>

                <div className="mt-5 rounded-xl p-5 bg-gradient-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-500/20">
                  <p className="text-white/90 text-sm mb-1">Capacidade da equipe</p>
                  <p className="text-white text-xl font-bold mb-2">{stats.completionRate}%</p>
                  <p className="text-white text-sm">A taxa atual indica boa previsibilidade de entrega.</p>
                </div>
              </div>
            </div>
          )}
        </MainContent>
      </div>
    </div>
  );
}
