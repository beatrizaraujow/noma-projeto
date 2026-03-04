'use client';

import { useRouter } from 'next/navigation';
import { Plus, Users } from 'lucide-react';
import { Button } from '@/components/common';

export default function EmptyWorkspacePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#16161a] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="bg-[#1a1a1f] border border-gray-800 rounded-2xl p-10 text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Plus className="h-10 w-10 text-white" />
          </div>

          <h1 className="text-3xl font-bold text-white mb-3">Bem-vinda ao NOMA</h1>
          <p className="text-gray-400 mb-8 max-w-xl mx-auto">
            Você ainda não possui workspaces. Crie o primeiro para começar a colaborar com sua equipe.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-10">
            <Button onClick={() => router.push('/onboarding')}>Criar Workspace</Button>
            <Button variant="outline" onClick={() => router.push('/invite')}>
              <Users size={16} className="mr-2" />
              Entrar em Workspace
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="bg-[#25252b] border border-gray-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-1">Setup rápido</h3>
              <p className="text-sm text-gray-400">Configure em poucos minutos.</p>
            </div>
            <div className="bg-[#25252b] border border-gray-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-1">Colaboração</h3>
              <p className="text-sm text-gray-400">Convide time e trabalhem juntos.</p>
            </div>
            <div className="bg-[#25252b] border border-gray-700 rounded-xl p-4">
              <h3 className="text-white font-semibold mb-1">Gestão completa</h3>
              <p className="text-sm text-gray-400">Acompanhe projetos e tarefas.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
