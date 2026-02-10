'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Bug, Sparkle, Wrench, Question, Chat } from '@phosphor-icons/react';

interface Feedback {
  id: string;
  author: string;
  type: 'bug' | 'feature' | 'improvement' | 'question';
  title: string;
  description: string;
  status: 'open' | 'in-review' | 'resolved' | 'closed';
  priority: 'low' | 'medium' | 'high';
  createdAt: string;
  votes: number;
}

export default function FeedbackPage() {
  const params = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newFeedback, setNewFeedback] = useState({ 
    title: '', 
    description: '', 
    type: 'feature' as const,
    priority: 'medium' as const
  });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>([
    { 
      id: '1', 
      author: 'João Silva',
      type: 'feature',
      title: 'Adicionar integração com Slack',
      description: 'Seria interessante poder receber notificações no Slack quando tarefas são atribuídas',
      status: 'in-review',
      priority: 'high',
      createdAt: '2026-02-08',
      votes: 15
    },
    { 
      id: '2', 
      author: 'Maria Santos',
      type: 'bug',
      title: 'Bug ao exportar relatórios em PDF',
      description: 'O botão de exportar PDF não está funcionando corretamente',
      status: 'open',
      priority: 'high',
      createdAt: '2026-02-09',
      votes: 8
    },
    { 
      id: '3', 
      author: 'Pedro Costa',
      type: 'improvement',
      title: 'Melhorar performance do dashboard',
      description: 'O dashboard está um pouco lento ao carregar muitos cards',
      status: 'resolved',
      priority: 'medium',
      createdAt: '2026-02-05',
      votes: 23
    },
    { 
      id: '4', 
      author: 'Ana Oliveira',
      type: 'question',
      title: 'Como configurar permissões personalizadas?',
      description: 'Não encontrei na documentação como criar níveis de permissão customizados',
      status: 'closed',
      priority: 'low',
      createdAt: '2026-02-03',
      votes: 5
    },
  ]);

  const submitFeedback = () => {
    if (!newFeedback.title.trim() || !newFeedback.description.trim()) return;

    const feedback: Feedback = {
      id: String(Date.now()),
      author: 'Você',
      type: newFeedback.type,
      title: newFeedback.title,
      description: newFeedback.description,
      status: 'open',
      priority: newFeedback.priority,
      createdAt: new Date().toISOString().split('T')[0],
      votes: 0,
    };

    setFeedbacks([feedback, ...feedbacks]);
    setNewFeedback({ title: '', description: '', type: 'feature', priority: 'medium' });
    setShowCreate(false);
  };

  const vote = (id: string) => {
    setFeedbacks(feedbacks.map(f => 
      f.id === id ? { ...f, votes: f.votes + 1 } : f
    ));
  };

  const getTypeIcon = (type: string) => {
    const iconProps = { size: 24, weight: 'duotone' as const, className: 'text-orange-500' };
    switch (type) {
      case 'bug': return <Bug {...iconProps} />;
      case 'feature': return <Sparkle {...iconProps} />;
      case 'improvement': return <Wrench {...iconProps} />;
      case 'question': return <Question {...iconProps} />;
      default: return <Chat {...iconProps} />;
    }
  };

  const getTypeText = (type: string) => {
    switch (type) {
      case 'bug': return 'Bug';
      case 'feature': return 'Nova Funcionalidade';
      case 'improvement': return 'Melhoria';
      case 'question': return 'Pergunta';
      default: return type;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'Aberto';
      case 'in-review': return 'Em Análise';
      case 'resolved': return 'Resolvido';
      case 'closed': return 'Fechado';
      default: return status;
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'Baixa';
      case 'medium': return 'Média';
      case 'high': return 'Alta';
      default: return priority;
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

          <button 
            onClick={() => router.push(`/workspaces/${params.id}/reports`)}
            className="w-full flex items-center gap-3 px-4 py-3 text-gray-400 rounded-lg hover:bg-[#2a2a2a] hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {sidebarOpen && <span className="font-medium">Relatórios</span>}
          </button>

          <button className="w-full flex items-center gap-3 px-4 py-3 text-white bg-[#2a2a2a] rounded-lg">
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
              <h1 className="text-2xl font-bold text-white">Feedback</h1>
              <p className="text-gray-400 text-sm">Compartilhe suas ideias e reporte problemas</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
              >
                + Enviar Feedback
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
              <div className="text-white/80 text-xs font-medium mb-1">Total de Feedbacks</div>
              <div className="text-white text-2xl font-bold">{feedbacks.length}</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Abertos</div>
              <div className="text-white text-2xl font-bold">{feedbacks.filter(f => f.status === 'open').length}</div>
              <div className="text-blue-400 text-xs mt-1">Aguardando análise</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Em Análise</div>
              <div className="text-white text-2xl font-bold">{feedbacks.filter(f => f.status === 'in-review').length}</div>
              <div className="text-yellow-400 text-xs mt-1">Sendo avaliados</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Resolvidos</div>
              <div className="text-white text-2xl font-bold">{feedbacks.filter(f => f.status === 'resolved').length}</div>
              <div className="text-green-400 text-xs mt-1">Implementados</div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Create Form */}
          {showCreate && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Enviar Novo Feedback</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  value={newFeedback.title}
                  onChange={(e) => setNewFeedback({ ...newFeedback, title: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Título do feedback"
                />
                <textarea
                  value={newFeedback.description}
                  onChange={(e) => setNewFeedback({ ...newFeedback, description: e.target.value })}
                  className="w-full px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 h-32 resize-none"
                  placeholder="Descreva seu feedback em detalhes..."
                />
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newFeedback.type}
                    onChange={(e) => setNewFeedback({ ...newFeedback, type: e.target.value as any })}
                    className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="feature">Nova Funcionalidade</option>
                    <option value="bug">Bug</option>
                    <option value="improvement">Melhoria</option>
                    <option value="question">Pergunta</option>
                  </select>
                  <select
                    value={newFeedback.priority}
                    onChange={(e) => setNewFeedback({ ...newFeedback, priority: e.target.value as any })}
                    className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  >
                    <option value="low">Baixa Prioridade</option>
                    <option value="medium">Média Prioridade</option>
                    <option value="high">Alta Prioridade</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={submitFeedback}
                    className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    Enviar Feedback
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

          {/* Feedbacks List */}
          <div className="space-y-4">
            {feedbacks.map((feedback) => (
              <div
                key={feedback.id}
                className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-start gap-4">
                  {/* Vote Button */}
                  <div className="flex flex-col items-center gap-1">
                    <button
                      onClick={() => vote(feedback.id)}
                      className="w-10 h-10 bg-[#2a2a2a] hover:bg-[#333] rounded-lg flex items-center justify-center transition-colors"
                    >
                      <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <span className="text-white font-bold text-sm">{feedback.votes}</span>
                    <span className="text-gray-500 text-xs">votos</span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center justify-center">{getTypeIcon(feedback.type)}</div>
                        <div>
                          <h3 className="text-white font-semibold text-lg">{feedback.title}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-gray-400 text-sm">{feedback.author}</span>
                            <span className="text-gray-600">•</span>
                            <span className="text-gray-400 text-sm">{new Date(feedback.createdAt).toLocaleDateString('pt-BR')}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          feedback.status === 'open' ? 'bg-blue-900/30 text-blue-400' :
                          feedback.status === 'in-review' ? 'bg-yellow-900/30 text-yellow-400' :
                          feedback.status === 'resolved' ? 'bg-green-900/30 text-green-400' :
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {getStatusText(feedback.status)}
                        </span>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                          feedback.priority === 'high' ? 'bg-red-900/30 text-red-400' :
                          feedback.priority === 'medium' ? 'bg-yellow-900/30 text-yellow-400' :
                          'bg-gray-900/30 text-gray-400'
                        }`}>
                          {getPriorityText(feedback.priority)}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-400 mb-4">{feedback.description}</p>

                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-[#2a2a2a] rounded-lg text-xs text-gray-400">
                        {getTypeText(feedback.type)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
