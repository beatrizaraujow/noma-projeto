'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, Header, MainContent } from '@/components/layout';
import { MetricCard, WeeklyProductivityChart } from '@/components/features/dashboard';
import { Badge, Button } from '@/components/common';
import axios from 'axios';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { 
  Clock,
  Target,
  TrendingUp,
  CheckCircle2,
  PlusCircle,
  BarChart3,
  FileSpreadsheet,
  FileText
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface DashboardData {
  overview: {
    totalProjects: number;
    totalTasks: number;
    totalMembers: number;
    completedTasks: number;
    overdueTasks: number;
    completionRate: number;
  };
  recentActivity: Array<{
    id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

interface ProjectProgress {
  projectId: string;
  projectName: string;
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
}

export default function AnalyticsPage() {
  const params = useParams();
  const workspaceId = String(params.id);
  const token = 'demo-token';
  const [activeTab, setActiveTab] = useState('overview');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [projectProgressData, setProjectProgressData] = useState<ProjectProgress[]>([]);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', active: activeTab === 'overview' },
    { id: 'performance', label: 'Performance', active: activeTab === 'performance' },
    { id: 'reports', label: 'Relatórios', active: activeTab === 'reports' },
  ];

  // Analytics data
  const metrics = {
    totalHours: 342,
    completionRate: 78,
    averageTaskTime: 4.2,
    productivityScore: 8.5,
    tasksCompleted: 156,
    tasksCreated: 200,
  };

  const fallbackProjectPerformance = [
    { name: 'Website', completion: 85, tasks: 34, hours: 128 },
    { name: 'App Mobile', completion: 62, tasks: 28, hours: 98 },
    { name: 'Design System', completion: 91, tasks: 19, hours: 76 },
    { name: 'Marketing', completion: 45, tasks: 22, hours: 40 },
  ];

  const heatmapHours = ['09h', '10h', '11h', '12h', '13h', '14h', '15h'];
  const heatmapDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [dashboardResponse, projectProgressResponse] = await Promise.all([
          axios.get(`${API_URL}/analytics/workspaces/${workspaceId}/dashboard`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/analytics/workspaces/${workspaceId}/project-progress`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setDashboardData(dashboardResponse.data);
        setProjectProgressData(projectProgressResponse.data || []);
      } catch (error) {
        console.error('Error loading analytics data:', error);
      }
    };

    loadAnalytics();
  }, [workspaceId]);

  const projectPerformance = useMemo(() => {
    if (projectProgressData.length === 0) {
      return fallbackProjectPerformance;
    }

    return projectProgressData.map((project) => ({
      name: project.projectName,
      completion: project.completionRate,
      tasks: project.totalTasks,
      hours: project.completedTasks * 4,
    }));
  }, [projectProgressData]);

  const heatmapValues = useMemo(() => {
    const base = Array.from({ length: heatmapHours.length }, () => Array.from({ length: heatmapDays.length }, () => 0));

    if (!dashboardData?.recentActivity?.length) {
      return [
        [0, 0, 1, 0, 0, 0, 0],
        [0, 1, 1, 2, 1, 0, 0],
        [1, 1, 2, 3, 2, 1, 0],
        [1, 2, 3, 4, 3, 2, 1],
        [1, 2, 2, 3, 2, 1, 0],
        [0, 1, 1, 2, 1, 1, 0],
        [0, 0, 1, 0, 0, 0, 0],
      ];
    }

    dashboardData.recentActivity.forEach((activity) => {
      const date = new Date(activity.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const hour = date.getHours();
      const rowIndex = hour - 9;
      if (rowIndex < 0 || rowIndex >= heatmapHours.length) return;

      const dayOfWeek = date.getDay();
      const columnIndex = (dayOfWeek + 6) % 7;

      base[rowIndex][columnIndex] += 1;
    });

    const maxValue = Math.max(1, ...base.flat());

    return base.map((row) => row.map((value) => (value === 0 ? 0 : Math.max(1, Math.ceil((value / maxValue) * 4)))));
  }, [dashboardData]);

  const monthlyPerformanceData = useMemo(() => {
    if (!dashboardData?.recentActivity?.length) {
      return [
        { month: 'Jan', sales: 2500, target: 3000 },
        { month: 'Fev', sales: 4700, target: 3400 },
        { month: 'Mar', sales: 3300, target: 4500 },
        { month: 'Abr', sales: 5000, target: 3830 },
        { month: 'Mai', sales: 3900, target: 4400 },
        { month: 'Jun', sales: 5600, target: 5000 },
      ];
    }

    const now = new Date();
    const months = Array.from({ length: 6 }, (_, index) => {
      const date = new Date(now.getFullYear(), now.getMonth() - (5 - index), 1);
      return {
        key: `${date.getFullYear()}-${date.getMonth()}`,
        month: date.toLocaleString('pt-BR', { month: 'short' }).replace('.', ''),
        sales: 0,
      };
    });

    const monthsMap = new Map(months.map((entry) => [entry.key, entry]));

    dashboardData.recentActivity.forEach((activity) => {
      const date = new Date(activity.createdAt);
      if (Number.isNaN(date.getTime())) return;

      const key = `${date.getFullYear()}-${date.getMonth()}`;
      const targetMonth = monthsMap.get(key);
      if (!targetMonth) return;

      targetMonth.sales += 1;
    });

    const averageSales = Math.max(1, Math.round(months.reduce((acc, item) => acc + item.sales, 0) / months.length));

    return months.map((item) => ({
      month: item.month,
      sales: item.sales,
      target: averageSales,
    }));
  }, [dashboardData]);

  const heatmapCellClass = (value: number) => {
    if (value >= 4) return 'bg-orange-500 shadow-[0_0_12px_rgba(249,115,22,0.45)]';
    if (value === 3) return 'bg-orange-500/80';
    if (value === 2) return 'bg-orange-600/60';
    if (value === 1) return 'bg-orange-900/60';
    return 'bg-[#25252b]';
  };

  const topPerformer = projectPerformance.reduce((best, current) =>
    current.completion > best.completion ? current : best
  );

  return (
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="analytics" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Análises" 
          tabs={tabs}
          onTabChange={setActiveTab}
        />
        
        <MainContent>
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-6">
                <MetricCard
                  title="Total de Horas"
                  value={`${metrics.totalHours}h`}
                  trend={{ value: 8, direction: 'up' }}
                  subtitle="Este mês"
                  icon={<Clock size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />

                <MetricCard
                  title="Taxa de Conclusão"
                  value={`${metrics.completionRate}%`}
                  trend={{ value: 5, direction: 'up' }}
                  subtitle="Vs. mês anterior"
                  icon={<Target size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />

                <MetricCard
                  title="Tempo Médio"
                  value={`${metrics.averageTaskTime}h`}
                  subtitle="Por tarefa"
                  icon={<Clock size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />

                <MetricCard
                  title="Score de Produtividade"
                  value={`${metrics.productivityScore}/10`}
                  trend={{ value: 0.5, direction: 'up' }}
                  subtitle="Excelente!"
                  icon={<TrendingUp size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />

                <MetricCard
                  title="Tarefas Concluídas"
                  value={metrics.tasksCompleted}
                  trend={{ value: 12, direction: 'up' }}
                  subtitle="Esta semana"
                  icon={<CheckCircle2 size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />

                <MetricCard
                  title="Tarefas Criadas"
                  value={metrics.tasksCreated}
                  subtitle="Total no mês"
                  icon={<PlusCircle size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <WeeklyProductivityChart />

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
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
                            className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full transition-all"
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
            </>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-white font-semibold text-lg">Pedidos por horário</h3>
                    <div className="flex items-center gap-2 text-[11px] text-gray-400">
                      <span className="w-2 h-2 rounded-full bg-[#25252b]"></span>
                      <span>200</span>
                      <span className="w-2 h-2 rounded-full bg-orange-900/60"></span>
                      <span>500</span>
                      <span className="w-2 h-2 rounded-full bg-orange-600/60"></span>
                      <span>1,000+</span>
                      <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                      <span>2,000+</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-[auto_1fr] gap-3">
                    <div className="space-y-2 pt-1">
                      {heatmapHours.map((hour) => (
                        <div key={hour} className="h-8 flex items-center text-xs text-gray-400 whitespace-nowrap">
                          {hour}
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2">
                      {heatmapValues.map((row, rowIndex) => (
                        <div key={`${heatmapHours[rowIndex]}-row`} className="grid grid-cols-7 gap-2">
                          {row.map((value, colIndex) => (
                            <div
                              key={`${heatmapHours[rowIndex]}-${heatmapDays[colIndex]}`}
                              className={`h-8 rounded-md border border-gray-800 transition-all hover:scale-105 ${heatmapCellClass(value)}`}
                              title={`${heatmapHours[rowIndex]} • ${heatmapDays[colIndex]}`}
                            />
                          ))}
                        </div>
                      ))}
                      <div className="grid grid-cols-7 gap-2 pt-1">
                        {heatmapDays.map((day) => (
                          <span key={day} className="text-center text-xs text-gray-500">
                            {day}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-5">Desempenho mensal</h3>
                  <div className="h-[280px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={monthlyPerformanceData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid stroke="#27272a" strokeDasharray="4 4" />
                        <XAxis dataKey="month" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} tickLine={{ stroke: '#374151' }} />
                        <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={{ stroke: '#374151' }} tickLine={{ stroke: '#374151' }} />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: '#1f1f24',
                            border: '1px solid #3f3f46',
                            borderRadius: '8px',
                            color: '#f9fafb',
                          }}
                          labelStyle={{ color: '#d1d5db' }}
                        />
                        <Legend wrapperStyle={{ color: '#d1d5db', fontSize: 12 }} />
                        <Line type="monotone" dataKey="sales" stroke="#f97316" strokeWidth={2.5} dot={{ r: 3 }} activeDot={{ r: 5 }} name="Atividade" />
                        <Line type="monotone" dataKey="target" stroke="#818cf8" strokeWidth={2} dot={{ r: 2 }} activeDot={{ r: 4 }} name="Meta" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-6">Ranking de Projetos</h3>
                  <div className="space-y-4">
                    {projectPerformance.map((project) => (
                      <div key={project.name} className="p-4 rounded-lg bg-[#25252b] border border-gray-700">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white font-medium">{project.name}</span>
                          <span className="text-orange-400 text-sm font-semibold">{project.completion}%</span>
                        </div>
                        <div className="w-full bg-gray-800 rounded-full h-2 mb-2">
                          <div
                            className="bg-gradient-to-r from-orange-600 to-orange-500 h-2 rounded-full"
                            style={{ width: `${project.completion}%` }}
                          ></div>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>{project.tasks} tarefas</span>
                          <span>{project.hours}h acumuladas</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-lg mb-4">Destaque</h3>
                  <div className="rounded-xl p-5 bg-gradient-to-br from-orange-500 to-red-600">
                    <p className="text-white/90 text-sm mb-1">Melhor performance</p>
                    <h4 className="text-white text-xl font-bold mb-2">{topPerformer.name}</h4>
                    <p className="text-white text-sm">{topPerformer.completion}% de conclusão</p>
                  </div>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Média de conclusão</span>
                      <span className="text-white font-medium">
                        {Math.round(projectPerformance.reduce((sum, item) => sum + item.completion, 0) / projectPerformance.length)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Projetos acompanhados</span>
                      <span className="text-white font-medium">{projectPerformance.length}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500/20 text-orange-500 p-3 rounded-lg">
                    <BarChart3 size={20} />
                  </div>
                  <h3 className="text-white font-semibold">Distribuição de Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Concluídas</span>
                    <Badge variant="success">156</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Em Progresso</span>
                    <Badge variant="warning">28</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">A Fazer</span>
                    <Badge variant="outline">16</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-orange-500/20 text-orange-500 p-3 rounded-lg">
                    <Target size={20} />
                  </div>
                  <h3 className="text-white font-semibold">Prioridades</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Urgente</span>
                    <Badge variant="error">8</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Alta</span>
                    <Badge variant="warning">24</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400 text-sm">Média</span>
                    <Badge variant="info">42</Badge>
                  </div>
                </div>
              </div>

              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-4">Exportar Relatórios</h3>
                <p className="text-gray-400 text-sm mb-4">
                  Gere relatórios para acompanhamento executivo e compartilhamento com stakeholders.
                </p>
                <div className="space-y-3">
                  <Button className="w-full justify-start bg-orange-500 hover:bg-orange-600 text-white">
                    <FileSpreadsheet size={16} className="mr-2" />
                    Exportar CSV
                  </Button>
                  <Button variant="ghost" className="w-full justify-start bg-[#25252b] border border-gray-700 text-gray-200 hover:bg-[#2e2e35] hover:text-white">
                    <FileText size={16} className="mr-2" />
                    Exportar PDF
                  </Button>
                </div>
              </div>
            </div>
          )}
        </MainContent>
      </div>
    </div>
  );
}
