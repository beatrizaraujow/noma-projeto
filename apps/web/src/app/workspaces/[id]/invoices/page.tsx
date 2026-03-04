'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Sidebar, Header, MainContent } from '@/components/layout';
import { MetricCard } from '@/components/features/dashboard';
import { Badge, Button } from '@/components/common';
import { 
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus
} from 'lucide-react';

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
  const [showCreate, setShowCreate] = useState(false);
  const [newInvoice, setNewInvoice] = useState({ client: '', amount: '', dueDate: '' });
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'Todas', active: activeTab === 'all' },
    { id: 'paid', label: 'Pagas', active: activeTab === 'paid' },
    { id: 'pending', label: 'Pendentes', active: activeTab === 'pending' },
  ];

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
    <div className="flex h-screen bg-[#16161a] overflow-hidden">
      <Sidebar activeItem="invoices" />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          title="Faturas" 
          tabs={tabs}
          onTabChange={setActiveTab}
        />
        
        <MainContent>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <MetricCard
              title="Total"
              value={`R$ ${totalAmount.toLocaleString('pt-BR')}`}
              subtitle="Valor total"
              icon={<DollarSign size={20} />}
              iconBgColor="bg-orange-500/20"
              iconColor="text-orange-500"
            />
            
            <MetricCard
              title="Pago"
              value={`R$ ${paidAmount.toLocaleString('pt-BR')}`}
              subtitle={`${invoices.filter(i => i.status === 'paid').length} faturas`}
              icon={<CheckCircle2 size={20} />}
              iconBgColor="bg-green-500/20"
              iconColor="text-green-500"
            />
            
            <MetricCard
              title="Pendente"
              value={`R$ ${pendingAmount.toLocaleString('pt-BR')}`}
              subtitle={`${invoices.filter(i => i.status === 'pending').length} faturas`}
              icon={<Clock size={20} />}
              iconBgColor="bg-yellow-500/20"
              iconColor="text-yellow-500"
            />
            
            <MetricCard
              title="Atrasadas"
              value={invoices.filter(i => i.status === 'overdue').length}
              subtitle="Requer atenção"
              icon={<AlertCircle size={20} />}
              iconBgColor="bg-red-500/20"
              iconColor="text-red-500"
            />
          </div>

          {/* Create Button */}
          <div className="mb-6">
            <Button 
              onClick={() => setShowCreate(!showCreate)}
              className="w-full md:w-auto"
            >
              <Plus size={16} className="mr-2" />
              Nova Fatura
            </Button>
          </div>

          {/* Create Form */}
         {showCreate && (
            <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6 mb-6">
              <h3 className="text-white font-semibold text-lg mb-4">Criar Nova Fatura</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  value={newInvoice.client}
                  onChange={(e) => setNewInvoice({ ...newInvoice, client: e.target.value })}
                  className="px-4 py-2 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Cliente"
                />
                <input
                  type="number"
                  value={newInvoice.amount}
                  onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
                  className="px-4 py-2 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                  placeholder="Valor"
                />
                <input
                  type="date"
                  value={newInvoice.dueDate}
                  onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
                  className="px-4 py-2 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
                />
                <div className="flex gap-2">
                  <Button onClick={createInvoice} className="flex-1">
                    Criar
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

          {/* Invoices Table */}
          <div className="bg-[#1a1a1f] border border-gray-800 rounded-xl overflow-hidden">
            <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-[#25252b] border-b border-gray-800 text-xs font-semibold text-gray-400 uppercase">
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
                  className="grid grid-cols-6 gap-4 px-6 py-4 hover:bg-[#25252b] transition-colors cursor-pointer"
                >
                  <div className="text-white font-medium">{invoice.number}</div>
                  <div className="text-gray-300">{invoice.client}</div>
                  <div className="text-white font-medium">R$ {invoice.amount.toLocaleString('pt-BR')}</div>
                  <div className="text-gray-400 text-sm">{new Date(invoice.issueDate).toLocaleDateString('pt-BR')}</div>
                  <div className="text-gray-400 text-sm">{new Date(invoice.dueDate).toLocaleDateString('pt-BR')}</div>
                  <div>
                    <Badge 
                      variant={
                        invoice.status === 'paid' ? 'success' :
                        invoice.status === 'pending' ? 'warning' : 'error'
                      }
                    >
                      {invoice.status === 'paid' ? 'Pago' : 
                       invoice.status === 'pending' ? 'Pendente' : 'Atrasado'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MainContent>
      </div>
    </div>
  );
}
