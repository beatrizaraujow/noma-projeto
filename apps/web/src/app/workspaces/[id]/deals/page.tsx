'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Sidebar, Header, MainContent } from '@/components/layout';
import { MetricCard } from '@/components/features/dashboard';
import { Badge, Button } from '@/components/common';
import { 
  Briefcase,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  Clock,
  XCircle,
  Plus,
  Search,
  Filter
} from 'lucide-react';

interface Deal {
  id: string;
  title: string;
  client: string;
  value: number;
  status: 'negociacao' | 'proposta' | 'fechado' | 'perdido';
  priority: 'baixa' | 'media' | 'alta';
  probability: number;
  expectedCloseDate: string;
  createdAt: string;
  assignedTo: string;
}

export default function DealsPage() {
  const params = useParams();
  const [activeTab, setActiveTab] = useState('todos');
  const [showCreate, setShowCreate] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const tabs = [
    { id: 'todos', label: 'Todos' },
    { id: 'negociacao', label: 'Em Negociação' },
    { id: 'proposta', label: 'Proposta Enviada' },
    { id: 'fechado', label: 'Fechados' },
  ];

  const [deals, setDeals] = useState<Deal[]>([
    {
      id: '1',
      title: 'Implementação Sistema CRM',
      client: 'Tech Solutions Ltda',
      value: 150000,
      status: 'negociacao',
      priority: 'alta',
      probability: 75,
      expectedCloseDate: '2026-03-15',
      createdAt: '2026-01-10',
      assignedTo: 'João Silva'
    },
    {
      id: '2',
      title: 'Consultoria Digital Marketing',
      client: 'Marketing Pro',
      value: 45000,
      status: 'proposta',
      priority: 'media',
      probability: 60,
      expectedCloseDate: '2026-02-28',
      createdAt: '2026-01-15',
      assignedTo: 'Maria Santos'
    },
    {
      id: '3',
      title: 'Desenvolvimento E-commerce',
      client: 'Loja Virtual SA',
      value: 280000,
      status: 'negociacao',
      priority: 'alta',
      probability: 85,
      expectedCloseDate: '2026-03-30',
      createdAt: '2026-01-20',
      assignedTo: 'Pedro Costa'
    },
    {
      id: '4',
      title: 'Sistema de Gestão Interna',
      client: 'Indústrias ABC',
      value: 95000,
      status: 'fechado',
      priority: 'media',
      probability: 100,
      expectedCloseDate: '2026-02-10',
      createdAt: '2025-12-01',
      assignedTo: 'Ana Lima'
    },
    {
      id: '5',
      title: 'Aplicativo Mobile',
      client: 'StartUp XYZ',
      value: 120000,
      status: 'perdido',
      priority: 'baixa',
      probability: 0,
      expectedCloseDate: '2026-01-30',
      createdAt: '2025-11-15',
      assignedTo: 'Carlos Souza'
    }
  ]);

  const getStatusBadge = (status: Deal['status']) => {
    const variants: Record<Deal['status'], { variant: any; label: string }> = {
      negociacao: { variant: 'info', label: 'Negociação' },
      proposta: { variant: 'warning', label: 'Proposta' },
      fechado: { variant: 'success', label: 'Fechado' },
      perdido: { variant: 'default', label: 'Perdido' }
    };
    return variants[status];
  };

  const getPriorityBadge = (priority: Deal['priority']) => {
    const variants: Record<Deal['priority'], { variant: any; label: string }> = {
      alta: { variant: 'destructive', label: 'Alta' },
      media: { variant: 'warning', label: 'Média' },
      baixa: { variant: 'default', label: 'Baixa' }
    };
    return variants[priority];
  };

  const filteredDeals = deals.filter(deal => {
    const matchesTab = activeTab === 'todos' || deal.status === activeTab;
    const matchesSearch = deal.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          deal.client.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const closedValue = deals
    .filter(d => d.status === 'fechado')
    .reduce((sum, deal) => sum + deal.value, 0);
  const activeDeals = deals.filter(d => d.status === 'negociacao' || d.status === 'proposta').length;
  const closedDeals = deals.filter(d => d.status === 'fechado').length;

  return (
    <div className="flex min-h-screen bg-[#16161a]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title="Meus Negócios" />
        <MainContent>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Meus Negócios</h1>
                <p className="text-gray-400">Gerencie seu pipeline de vendas</p>
              </div>
              <Button onClick={() => setShowCreate(true)} className="gap-2">
                <Plus size={20} />
                Novo Negócio
              </Button>
            </div>

            {/* Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard
                title="Valor Total"
                value={`R$ ${(totalValue / 1000).toFixed(0)}k`}
                icon={<DollarSign className="text-orange-500" size={24} />}
                trend={{ value: 12, direction: 'up' }}
              />
              <MetricCard
                title="Negócios Ativos"
                value={activeDeals.toString()}
                icon={<Briefcase className="text-blue-500" size={24} />}
                trend={{ value: 8, direction: 'up' }}
              />
              <MetricCard
                title="Fechados"
                value={closedDeals.toString()}
                icon={<CheckCircle2 className="text-green-500" size={24} />}
                trend={{ value: 15, direction: 'up' }}
              />
              <MetricCard
                title="Valor Fechado"
                value={`R$ ${(closedValue / 1000).toFixed(0)}k`}
                icon={<TrendingUp className="text-orange-500" size={24} />}
                trend={{ value: 25, direction: 'up' }}
              />
            </div>

            {/* Filtros e Busca */}
            <div className="flex items-center gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar negócios..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-[#1a1a1f] border border-gray-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
                />
              </div>
              <Button variant="outline" className="gap-2">
                <Filter size={20} />
                Filtros
              </Button>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 border-b border-gray-800">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-orange-500 border-b-2 border-orange-500'
                      : 'text-gray-400 hover:text-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Lista de Negócios */}
            <div className="space-y-4">
              {filteredDeals.map((deal) => {
                const status = getStatusBadge(deal.status);
                const priority = getPriorityBadge(deal.priority);

                return (
                  <div
                    key={deal.id}
                    className="bg-[#1a1a1f] border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors cursor-pointer"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-white">{deal.title}</h3>
                          <Badge variant={status.variant}>{status.label}</Badge>
                          <Badge variant={priority.variant}>{priority.label}</Badge>
                        </div>
                        <p className="text-gray-400 mb-1">{deal.client}</p>
                        <p className="text-sm text-gray-500">Responsável: {deal.assignedTo}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-orange-500">
                          R$ {(deal.value / 1000).toFixed(0)}k
                        </p>
                        <p className="text-sm text-gray-400 mt-1">{deal.probability}% probabilidade</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Criado em {new Date(deal.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <span>Fechamento previsto: {new Date(deal.expectedCloseDate).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </div>

                    {/* Barra de Probabilidade */}
                    <div className="mt-4">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Probabilidade de Fechamento</span>
                        <span>{deal.probability}%</span>
                      </div>
                      <div className="w-full bg-gray-800 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
                          style={{ width: `${deal.probability}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredDeals.length === 0 && (
                <div className="text-center py-12">
                  <Briefcase className="mx-auto text-gray-600 mb-4" size={48} />
                  <h3 className="text-lg font-semibold text-gray-400 mb-2">Nenhum negócio encontrado</h3>
                  <p className="text-gray-500">
                    {searchTerm
                      ? 'Tente ajustar sua busca'
                      : 'Crie seu primeiro negócio para começar'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Modal Criar Negócio */}
          {showCreate && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-[#1a1a1f] border border-gray-800 rounded-lg p-6 w-full max-w-md">
                <h3 className="text-xl font-bold text-white mb-4">Novo Negócio</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Título do Negócio
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#25252b] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                      placeholder="Ex: Novo projeto de desenvolvimento"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cliente
                    </label>
                    <input
                      type="text"
                      className="w-full bg-[#25252b] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                      placeholder="Nome do cliente"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Valor (R$)
                    </label>
                    <input
                      type="number"
                      className="w-full bg-[#25252b] border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-orange-500"
                      placeholder="0,00"
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setShowCreate(false)} className="flex-1">
                      Cancelar
                    </Button>
                    <Button onClick={() => setShowCreate(false)} className="flex-1">
                      Criar Negócio
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </MainContent>
      </div>
    </div>
  );
}
