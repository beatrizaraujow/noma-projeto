'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChartBar, Timer, CurrencyCircleDollar, Users, Check, Folder } from '@phosphor-icons/react';

interface Report {
  id: string;
  name: string;
  type: string;
  generatedAt: string;
  period: string;
  status: 'completed' | 'processing' | 'failed';
  downloadUrl?: string;
}

export default function ReportsPage() {
  const params = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newReport, setNewReport] = useState({ name: '', type: 'productivity', period: 'weekly' });

  const [reports, setReports] = useState<Report[]>([
    { 
      id: '1', 
      name: 'Relatório de Produtividade Q1 2026', 
      type: 'Produtividade', 
      generatedAt: '2026-02-08', 
      period: 'Jan - Mar 2026',
      status: 'completed',
      downloadUrl: '#'
    },
    { 
      id: '2', 
      name: 'Análise de Tempo - Janeiro', 
      type: 'Tempo', 
      generatedAt: '2026-02-01', 
      period: 'Janeiro 2026',
      status: 'completed',
      downloadUrl: '#'
    },
    { 
      id: '3', 
      name: 'Relatório Financeiro Mensal', 
      type: 'Financeiro', 
      generatedAt: '2026-02-09', 
      period: 'Janeiro 2026',
      status: 'processing'
    },
    { 
      id: '4', 
      name: 'Performance da Equipe', 
      type: 'Equipe', 
      generatedAt: '2026-02-07', 
      period: 'Fev 1-7, 2026',
      status: 'completed',
      downloadUrl: '#'
    },
  ]);

  const reportTypes = [
    { id: 'productivity', name: 'Produtividade', icon: ChartBar },
    { id: 'time', name: 'Tempo', icon: Timer },
    { id: 'financial', name: 'Financeiro', icon: CurrencyCircleDollar },
    { id: 'team', name: 'Equipe', icon: Users },
    { id: 'tasks', name: 'Tarefas', icon: Check },
    { id: 'projects', name: 'Projetos', icon: Folder },
  ];

  const generateReport = () => {
    if (!newReport.name.trim()) return;

    const typeObj = reportTypes.find(t => t.id === newReport.type);
    const report: Report = {
      id: String(Date.now()),
      name: newReport.name,
      type: typeObj?.name || 'Personalizado',
      generatedAt: new Date().toISOString().split('T')[0],
      period: getPeriodText(newReport.period),
      status: 'processing',
    };

    setReports([report, ...reports]);
    setNewReport({ name: '', type: 'productivity', period: 'weekly' });
    setShowCreate(false);

    // Simulate report generation
    setTimeout(() => {
      setReports(prev => prev.map(r => 
        r.id === report.id 
          ? { ...r, status: 'completed' as const, downloadUrl: '#' }
          : r
      ));
    }, 3000);
  };

  const getPeriodText = (period: string) => {
    const now = new Date();
    switch (period) {
      case 'today': return now.toLocaleDateString('pt-BR');
      case 'weekly': return 'Última semana';
      case 'monthly': return 'Último mês';
      case 'quarterly': return 'Último trimestre';
      default: return period;
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

          <button className="w-full flex items-center gap-3 px-4 py-3 text-white bg-[#2a2a2a] rounded-lg">
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
              <h1 className="text-2xl font-bold text-white">Relatórios</h1>
              <p className="text-gray-400 text-sm">Gere e visualize relatórios detalhados</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
              >
                + Gerar Relatório
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
              <div className="text-white/80 text-xs font-medium mb-1">Total de Relatórios</div>
              <div className="text-white text-2xl font-bold">{reports.length}</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Concluídos</div>
              <div className="text-white text-2xl font-bold">{reports.filter(r => r.status === 'completed').length}</div>
              <div className="text-green-400 text-xs mt-1">Prontos para download</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Processando</div>
              <div className="text-white text-2xl font-bold">{reports.filter(r => r.status === 'processing').length}</div>
              <div className="text-blue-400 text-xs mt-1">Em andamento</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Este Mês</div>
              <div className="text-white text-2xl font-bold">
                {reports.filter(r => {
                  const date = new Date(r.generatedAt);
                  const now = new Date();
                  return date.getMonth() === now.getMonth();
                }).length}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Create Form */}
          {showCreate && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Gerar Novo Relatório</h3>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <input
                  type="text"
                  value={newReport.name}
                  onChange={(e) => setNewReport({ ...newReport, name: e.target.value })}
                  className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 col-span-2"
                  placeholder="Nome do relatório"
                />
                <select
                  value={newReport.type}
                  onChange={(e) => setNewReport({ ...newReport, type: e.target.value })}
                  className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  {reportTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.name}</option>
                  ))}
                </select>
                <select
                  value={newReport.period}
                  onChange={(e) => setNewReport({ ...newReport, period: e.target.value })}
                  className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                >
                  <option value="today">Hoje</option>
                  <option value="weekly">Última semana</option>
                  <option value="monthly">Último mês</option>
                  <option value="quarterly">Último trimestre</option>
                </select>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={generateReport}
                  className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                >
                  Gerar Relatório
                </button>
                <button
                  onClick={() => setShowCreate(false)}
                  className="px-4 py-2 bg-[#2a2a2a] hover:bg-[#333] text-white rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Report Types Grid */}
          <div>
            <h2 className="text-white font-semibold text-lg mb-4">Tipos de Relatórios Disponíveis</h2>
            <div className="grid grid-cols-6 gap-4">
              {reportTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <div
                    key={type.id}
                    className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors cursor-pointer text-center"
                  >
                    <div className="flex justify-center mb-2">
                      <IconComponent size={32} weight="duotone" className="text-orange-500" />
                    </div>
                    <div className="text-white text-sm font-medium">{type.name}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reports Table */}
          <div>
            <h2 className="text-white font-semibold text-lg mb-4">Relatórios Gerados</h2>
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
              <table className="w-full">
                <thead className="bg-[#2a2a2a]">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Nome</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Tipo</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Período</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Gerado em</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {reports.map((report) => (
                    <tr key={report.id} className="hover:bg-[#2a2a2a] transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-white font-medium">{report.name}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-400">{report.type}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-400">{report.period}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-400">{new Date(report.generatedAt).toLocaleDateString('pt-BR')}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          report.status === 'completed' ? 'bg-green-900/30 text-green-400' :
                          report.status === 'processing' ? 'bg-blue-900/30 text-blue-400' :
                          'bg-red-900/30 text-red-400'
                        }`}>
                          {report.status === 'completed' ? 'Concluído' :
                           report.status === 'processing' ? 'Processando' :
                           'Falhou'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {report.status === 'completed' && report.downloadUrl ? (
                          <a
                            href={report.downloadUrl}
                            className="text-orange-500 hover:text-orange-400 font-medium text-sm"
                          >
                            Download
                          </a>
                        ) : report.status === 'processing' ? (
                          <span className="text-gray-500 text-sm">Aguarde...</span>
                        ) : (
                          <button className="text-red-500 hover:text-red-400 font-medium text-sm">
                            Tentar novamente
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
