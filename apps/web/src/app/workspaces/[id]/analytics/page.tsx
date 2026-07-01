'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Sidebar, Header, MainContent } from '@/components/layout';
import { MetricCard } from '@/components/features/dashboard';
import axios from 'axios';
import {
  BarChart, Bar, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell,
} from 'recharts';
import {
  Clock, Target, TrendingUp, CheckCircle2, AlertCircle, FolderOpen,
  BarChart3, FileSpreadsheet, FileText, User,
} from 'lucide-react';
import { TASK_STATUS_CONFIG, TASK_PRIORITY_CONFIG, type TaskStatus, type TaskPriority } from '@nexora/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface StatsData {
  byGroup: { ATIVO: number; FEITO: number; FECHADO: number };
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueCount: number;
  hoursThisMonth: number;
  byMember: { userId: string; name: string; avatar: string | null; active: number; feito: number; fechado: number; overdue: number; hoursThisMonth: number }[];
  byProject: { projectId: string; name: string; active: number; feito: number; fechado: number }[];
  weeklyThroughput: { week: string; label: string; completed: number }[];
}

export default function AnalyticsPage() {
  const params = useParams();
  const workspaceId = String(params.id);
  const { data: session } = useSession();
  const token = (session as any)?.accessToken;
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<StatsData | null>(null);

  const tabs = [
    { id: 'overview', label: 'Visão Geral', active: activeTab === 'overview' },
    { id: 'performance', label: 'Performance', active: activeTab === 'performance' },
    { id: 'reports', label: 'Relatórios', active: activeTab === 'reports' },
  ];

  useEffect(() => {
    if (!token || !workspaceId) return;
    axios.get(`${API_URL}/api/tasks/stats?workspaceId=${workspaceId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then((r) => setStats(r.data)).catch(() => {});
  }, [token, workspaceId]);

  const totalTasks = stats ? stats.byGroup.ATIVO + stats.byGroup.FEITO + stats.byGroup.FECHADO : 0;
  const completionRate = totalTasks > 0 ? Math.round((stats!.byGroup.FECHADO / totalTasks) * 100) : 0;

  const statusChartData = stats
    ? (Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((s) => ({
        label: TASK_STATUS_CONFIG[s].label,
        count: stats.byStatus[s] ?? 0,
        color: TASK_STATUS_CONFIG[s].color,
      })).filter((d) => d.count > 0)
    : [];

  const priorityChartData = stats
    ? (Object.keys(TASK_PRIORITY_CONFIG) as TaskPriority[]).map((p) => ({
        label: TASK_PRIORITY_CONFIG[p].label,
        count: stats.byPriority[p] ?? 0,
        color: TASK_PRIORITY_CONFIG[p].color,
      })).filter((d) => d.count > 0)
    : [];

  return (
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="analytics" />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title="Análises" tabs={tabs} onTabChange={setActiveTab} />

        <MainContent>
          {activeTab === 'overview' && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
                <MetricCard
                  title="Tarefas Ativas"
                  value={stats?.byGroup.ATIVO ?? 0}
                  subtitle="Em andamento"
                  icon={<Clock size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />
                <MetricCard
                  title="Em Aprovação"
                  value={stats?.byGroup.FEITO ?? 0}
                  subtitle="Aguardando revisão"
                  icon={<Target size={20} />}
                  iconBgColor="bg-indigo-500/20"
                  iconColor="text-indigo-400"
                />
                <MetricCard
                  title="Concluídas"
                  value={stats?.byGroup.FECHADO ?? 0}
                  subtitle="Entregues"
                  icon={<CheckCircle2 size={20} />}
                  iconBgColor="bg-green-500/20"
                  iconColor="text-green-400"
                />
                <MetricCard
                  title="Atrasadas"
                  value={stats?.overdueCount ?? 0}
                  subtitle="Prazo vencido"
                  icon={<AlertCircle size={20} />}
                  iconBgColor="bg-red-500/20"
                  iconColor="text-red-400"
                />
                <MetricCard
                  title="Horas este mês"
                  value={`${stats?.hoursThisMonth.toFixed(1) ?? 0}h`}
                  subtitle="Registradas"
                  icon={<Clock size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />
                <MetricCard
                  title="Projetos"
                  value={stats?.byProject.length ?? 0}
                  subtitle="Com tarefas"
                  icon={<FolderOpen size={20} />}
                  iconBgColor="bg-orange-500/20"
                  iconColor="text-orange-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-base mb-5">Performance por Projeto</h3>
                  {stats?.byProject.length === 0 || !stats ? (
                    <p className="text-gray-500 text-sm">Nenhum projeto com tarefas ainda.</p>
                  ) : (
                    <div className="space-y-4">
                      {stats.byProject.slice(0, 6).map((proj) => {
                        const total = proj.active + proj.feito + proj.fechado;
                        const pct = total > 0 ? Math.round((proj.fechado / total) * 100) : 0;
                        return (
                          <div key={proj.projectId}>
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-sm text-white font-medium truncate max-w-[180px]">{proj.name}</span>
                              <span className="text-xs text-gray-400">{pct}% concluído</span>
                            </div>
                            <div className="w-full bg-gray-800 rounded-full h-1.5">
                              <div
                                className="bg-gradient-to-r from-orange-600 to-orange-500 h-1.5 rounded-full transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <div className="flex gap-3 mt-1">
                              <span className="text-xs text-orange-400">{proj.active} ativas</span>
                              <span className="text-xs text-indigo-400">{proj.feito} em revisão</span>
                              <span className="text-xs text-green-400">{proj.fechado} concluídas</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-base mb-5">Entregas semanais</h3>
                  {!stats || stats.weeklyThroughput.every((w) => w.completed === 0) ? (
                    <p className="text-gray-500 text-sm">Nenhuma entrega registrada ainda.</p>
                  ) : (
                    <div className="h-[220px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.weeklyThroughput} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
                          <CartesianGrid stroke="#27272a" strokeDasharray="4 4" vertical={false} />
                          <XAxis dataKey="label" tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fill: '#9ca3af', fontSize: 12 }} axisLine={false} tickLine={false} allowDecimals={false} />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#1f1f24', border: '1px solid #3f3f46', borderRadius: '8px', color: '#f9fafb' }}
                            cursor={{ fill: '#ffffff10' }}
                            formatter={(v) => [`${v} tarefa(s)`, 'Concluídas']}
                          />
                          <Bar dataKey="completed" radius={[4, 4, 0, 0]} fill="#f97316" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {activeTab === 'performance' && (
            <div className="space-y-6">
              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold text-base mb-5">Produtividade por Pessoa</h3>
                {!stats || stats.byMember.length === 0 ? (
                  <p className="text-gray-500 text-sm">Nenhuma tarefa atribuída ainda.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                    {stats.byMember.map((m) => (
                      <div key={m.userId} className="bg-[#25252b] rounded-xl p-4 border border-gray-700">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="h-9 w-9 rounded-full bg-orange-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {m.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white">{m.name}</p>
                            <p className="text-xs text-gray-500">{m.hoursThisMonth.toFixed(1)}h este mês</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div>
                            <p className="text-lg font-bold text-orange-400">{m.active}</p>
                            <p className="text-xs text-gray-500">Ativas</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-indigo-400">{m.feito}</p>
                            <p className="text-xs text-gray-500">Revisão</p>
                          </div>
                          <div>
                            <p className="text-lg font-bold text-green-400">{m.fechado}</p>
                            <p className="text-xs text-gray-500">Entregues</p>
                          </div>
                        </div>
                        {m.overdue > 0 && (
                          <div className="mt-2 flex items-center gap-1 text-xs text-red-400">
                            <AlertCircle size={11} />
                            {m.overdue} tarefa{m.overdue > 1 ? 's' : ''} atrasada{m.overdue > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-base mb-5">Pipeline por Status</h3>
                  {statusChartData.length === 0 ? (
                    <p className="text-gray-500 text-sm">Nenhuma tarefa ainda.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {statusChartData.map((s) => {
                        const max = Math.max(...statusChartData.map((d) => d.count));
                        return (
                          <div key={s.label} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-32 shrink-0 truncate">{s.label}</span>
                            <div className="flex-1 h-2 bg-gray-800 rounded-full overflow-hidden">
                              <div
                                className="h-full rounded-full transition-all"
                                style={{ width: `${(s.count / max) * 100}%`, backgroundColor: s.color }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-gray-300 w-4 text-right">{s.count}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                  <h3 className="text-white font-semibold text-base mb-4">Resumo do workspace</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400 text-sm">Total de tarefas</span>
                      <span className="text-white font-semibold">{totalTasks}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400 text-sm">Taxa de conclusão</span>
                      <span className="text-green-400 font-semibold">{completionRate}%</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400 text-sm">Tarefas atrasadas</span>
                      <span className="text-red-400 font-semibold">{stats?.overdueCount ?? 0}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-gray-800">
                      <span className="text-gray-400 text-sm">Horas este mês</span>
                      <span className="text-orange-400 font-semibold">{stats?.hoursThisMonth.toFixed(1) ?? 0}h</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-400 text-sm">Membros com tarefas</span>
                      <span className="text-white font-semibold">{stats?.byMember.length ?? 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-orange-500/20 text-orange-500 p-2.5 rounded-lg">
                    <BarChart3 size={18} />
                  </div>
                  <h3 className="text-white font-semibold">Status das Tarefas</h3>
                </div>
                <div className="space-y-2">
                  {(Object.keys(TASK_STATUS_CONFIG) as TaskStatus[]).map((s) => {
                    const count = stats?.byStatus[s] ?? 0;
                    const cfg = TASK_STATUS_CONFIG[s];
                    return (
                      <div key={s} className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">{cfg.label}</span>
                        <span
                          className="text-xs font-semibold px-2 py-0.5 rounded"
                          style={{ backgroundColor: cfg.color + '22', color: cfg.color }}
                        >
                          {count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="bg-orange-500/20 text-orange-500 p-2.5 rounded-lg">
                    <Target size={18} />
                  </div>
                  <h3 className="text-white font-semibold">Prioridades</h3>
                </div>
                <div className="space-y-3">
                  {(Object.keys(TASK_PRIORITY_CONFIG) as TaskPriority[]).reverse().map((p) => {
                    const count = stats?.byPriority[p] ?? 0;
                    const cfg = TASK_PRIORITY_CONFIG[p];
                    const pct = totalTasks > 0 ? Math.round((count / totalTasks) * 100) : 0;
                    return (
                      <div key={p}>
                        <div className="flex justify-between mb-1">
                          <span className="text-sm text-gray-400">{cfg.label}</span>
                          <span className="text-xs text-gray-500">{count} ({pct}%)</span>
                        </div>
                        <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: cfg.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
                <h3 className="text-white font-semibold mb-2">Exportar Relatórios</h3>
                <p className="text-gray-400 text-sm mb-5">
                  Gere relatórios para acompanhamento e compartilhamento com a equipe.
                </p>
                <div className="space-y-3">
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-sm font-medium rounded-lg hover:opacity-90 transition-opacity">
                    <FileSpreadsheet size={15} />
                    Exportar CSV
                  </button>
                  <button className="w-full flex items-center gap-2 px-4 py-2.5 bg-[#25252b] border border-gray-700 text-gray-200 text-sm font-medium rounded-lg hover:bg-[#2e2e35] transition-colors">
                    <FileText size={15} />
                    Exportar PDF
                  </button>
                </div>
              </div>
            </div>
          )}
        </MainContent>
      </div>
    </div>
  );
}
