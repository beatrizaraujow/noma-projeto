'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';

interface Invoice {
  id: string;
  number: string;
  client: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  dueDate: string;
  issueDate: string;
}

export default function InvoicesPage() {
  const params = useParams();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client: '', amount: '', dueDate: '' });

  const [invoices, setInvoices] = useState<Invoice[]>([
    { id: '1', number: 'INV-2026-001', client: 'Empresa Alpha', amount: 5400, status: 'paid', dueDate: '2026-02-01', issueDate: '2026-01-15' },
    { id: '2', number: 'INV-2026-002', client: 'Beta Solutions', amount: 3200, status: 'pending', dueDate: '2026-02-15', issueDate: '2026-02-01' },
    { id: '3', number: 'INV-2026-003', client: 'Gamma Tech', amount: 7800, status: 'overdue', dueDate: '2026-01-30', issueDate: '2026-01-10' },
    { id: '4', number: 'INV-2026-004', client: 'Delta Corp', amount: 4500, status: 'pending', dueDate: '2026-02-20', issueDate: '2026-02-05' },
  ]);

  const createInvoice = () => {
    if (!newInvoice.client.trim() || !newInvoice.amount) return;

    const invoice: Invoice = {
      id: String(Date.now()),
      number: `INV-2026-${String(invoices.length + 1).padStart(3, '0')}`,
      client: newInvoice.client,
      amount: parseFloat(newInvoice.amount),
      status: 'pending',
      dueDate: newInvoice.dueDate,
      issueDate: new Date().toISOString().split('T')[0],
    };

    setInvoices([...invoices, invoice]);
    setNewInvoice({ client: '', amount: '', dueDate: '' });
    setShowCreate(false);
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.amount, 0);
  const paidAmount = invoices.filter(inv => inv.status === 'paid').reduce((sum, inv) => sum + inv.amount, 0);
  const pendingAmount = invoices.filter(inv => inv.status === 'pending').reduce((sum, inv) => sum + inv.amount, 0);

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a1a1a] border-r border-gray-800 transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-800">
          <Link href="/workspaces" className="flex items-center space-x-2">
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

          <button className="w-full flex items-center gap-3 px-4 py-3 text-white bg-[#2a2a2a] rounded-lg">
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
              <h1 className="text-2xl font-bold text-white">Faturas</h1>
              <p className="text-gray-400 text-sm">Gerencie pagamentos e faturamento</p>
            </div>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowCreate(true)}
                className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors font-medium"
              >
                + Nova Fatura
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

          {/* Summary Cards */}
          <div className="grid grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-orange-500 to-red-600 rounded-lg p-4">
              <div className="text-white/80 text-xs font-medium mb-1">Total</div>
              <div className="text-white text-2xl font-bold">R$ {totalAmount.toLocaleString('pt-BR')}</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Pago</div>
              <div className="text-white text-2xl font-bold">R$ {paidAmount.toLocaleString('pt-BR')}</div>
              <div className="text-green-400 text-xs mt-1">{invoices.filter(i => i.status === 'paid').length} faturas</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Pendente</div>
              <div className="text-white text-2xl font-bold">R$ {pendingAmount.toLocaleString('pt-BR')}</div>
              <div className="text-yellow-400 text-xs mt-1">{invoices.filter(i => i.status === 'pending').length} faturas</div>
            </div>
            <div className="bg-[#2a2a2a] rounded-lg p-4">
              <div className="text-gray-400 text-xs font-medium mb-1">Atrasadas</div>
              <div className="text-white text-2xl font-bold">{invoices.filter(i => i.status === 'overdue').length}</div>
              <div className="text-red-400 text-xs mt-1">Requer atenção</div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-6">
          {/* Create Form */}
          {showCreate && (
            <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl p-6">
              <h3 className="text-white font-semibold text-lg mb-4">Criar Nova Fatura</h3>
              <div className="grid grid-cols-4 gap-4">
                <input
                  type="text"
                  value={newInvoice.client}
                  onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                  className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Cliente"
                />
                <input
                  type="number"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Valor"
                />
                <input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  className="px-4 py-2 bg-[#2a2a2a] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
                <div className="flex gap-2">
                  <button
                    onClick={createInvoice}
                    className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                  >
                    Criar
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

          {/* Invoices Table */}
          <div className="bg-[#1a1a1a] border border-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-[#2a2a2a] border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase">
              <div>Número</div>
              <div>Cliente</div>
              <div>Valor</div>
              <div>Emissão</div>
              <div>Vencimento</div>
              <div>Status</div>
            </div>

            <div className="divide-y divide-gray-800">
              {invoices.map((invoice) => (
                <div 
                  key={invoice.id}
                  className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-[#2a2a2a] transition-colors cursor-pointer"
                >
                  <div className="text-white font-medium">{invoice.number}</div>
                  <div className="text-gray-300">{invoice.client}</div>
                  <div className="text-white font-medium">R$ {invoice.amount.toLocaleString('pt-BR')}</div>
                  <div className="text-gray-400 text-sm">{new Date(invoice.issueDate).toLocaleDateString('pt-BR')}</div>
                  <div className="text-gray-400 text-sm">{new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      invoice.status === 'paid' ? 'bg-green-900/30 text-green-400' :
                      invoice.status === 'pending' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-red-900/30 text-red-400'
                    }`}>
                      {invoice.status === 'paid' ? 'Pago' : invoice.status === 'pending' ? 'Pendente' : 'Atrasado'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
