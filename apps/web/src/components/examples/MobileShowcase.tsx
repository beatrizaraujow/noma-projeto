'use client';

import { useState } from 'react';
import { 
  MobileBottomNav, 
  MobileHamburger, 
  SwipeableCard, 
  PullToRefresh,
  FAB,
  MobileDrawer,
  MobileModal,
  TouchButton,
  TouchIconButton,
  ResponsiveBoardLayout,
  ResponsiveGrid,
} from '@/components/layout/mobile';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { PageTransition } from '@/components/common/animations';

export function MobileShowcase() {
  const [showModal, setShowModal] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Implementar autenticação', status: 'doing' },
    { id: 2, title: 'Criar dashboard', status: 'todo' },
    { id: 3, title: 'Testes unitários', status: 'todo' },
  ]);
  const { isMobile, isTouchDevice, screenSize } = useMobileDetect();

  const handleRefresh = async () => {
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('Refreshed!');
  };

  const handleDeleteTask = (id: number) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  const navItems = [
    {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
      label: 'Home',
      href: '/showcase',
    },
    {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>,
      label: 'Tasks',
      href: '/tasks',
    },
    {
      icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>,
      label: 'Perfil',
      href: '/profile',
    },
  ];

  return (
    <PageTransition>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between">
          <MobileHamburger>
            <nav className="flex flex-col gap-2 p-4">
              <a href="#" className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Dashboard</a>
              <a href="#" className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Projetos</a>
              <a href="#" className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Tasks</a>
              <a href="#" className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">Configurações</a>
            </nav>
          </MobileHamburger>
          
          <h1 className="text-xl font-bold">Mobile Showcase</h1>
          
          <TouchIconButton
            icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>}
            label="Notificações"
          />
        </div>

        <PullToRefresh onRefresh={handleRefresh} className="min-h-screen">
          <div className="p-4 space-y-8 pb-24">
            {/* Device Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-2">
              <h2 className="text-lg font-bold mb-4">Informações do Dispositivo</h2>
              <p className="text-sm">
                <strong>Mobile:</strong> {isMobile ? 'Sim' : 'Não'}
              </p>
              <p className="text-sm">
                <strong>Touch:</strong> {isTouchDevice ? 'Sim' : 'Não'}
              </p>
              <p className="text-sm">
                <strong>Tamanho:</strong> {screenSize}
              </p>
            </div>

            {/* Touch Buttons */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Touch-Optimized Buttons</h2>
              <div className="flex flex-wrap gap-3">
                <TouchButton variant="primary" size="md">
                  Primary
                </TouchButton>
                <TouchButton variant="secondary" size="md">
                  Secondary
                </TouchButton>
                <TouchButton variant="ghost" size="md">
                  Ghost
                </TouchButton>
                <TouchButton variant="danger" size="md">
                  Danger
                </TouchButton>
              </div>
              <TouchButton variant="primary" size="lg" fullWidth>
                Full Width Button
              </TouchButton>
            </div>

            {/* Swipeable Cards */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Swipeable Task Cards</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Arraste para a esquerda para deletar
              </p>
              {tasks.map((task) => (
                <SwipeableCard
                  key={task.id}
                  onSwipeLeft={() => handleDeleteTask(task.id)}
                  leftAction={{
                    icon: <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>,
                    label: 'Deletar',
                    color: 'bg-red-500',
                  }}
                  className="p-4 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 rounded border-2 border-gray-300" />
                    <div className="flex-1">
                      <h3 className="font-medium">{task.title}</h3>
                      <p className="text-sm text-gray-500">{task.status}</p>
                    </div>
                  </div>
                </SwipeableCard>
              ))}
            </div>

            {/* Modal & Drawer */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Modal & Drawer</h2>
              <div className="flex gap-3">
                <TouchButton onClick={() => setShowModal(true)}>
                  Abrir Modal
                </TouchButton>
                <TouchButton onClick={() => setShowDrawer(true)} variant="secondary">
                  Abrir Drawer
                </TouchButton>
              </div>
            </div>

            {/* Responsive Grid */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold">Responsive Grid</h2>
              <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div
                    key={n}
                    className="bg-white dark:bg-gray-800 p-6 rounded-lg border border-gray-200 dark:border-gray-700"
                  >
                    <h3 className="font-bold">Card {n}</h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Conteúdo do card
                    </p>
                  </div>
                ))}
              </ResponsiveGrid>
            </div>
          </div>
        </PullToRefresh>

        {/* FAB */}
        <FAB
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
          onClick={() => alert('Quick add!')}
          label="Nova Task"
        />

        {/* Bottom Navigation */}
        <MobileBottomNav items={navItems} />

        {/* Modal */}
        <MobileModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          title="Exemplo de Modal"
        >
          <div className="space-y-4">
            <p>
              No mobile, este modal ocupa toda a tela ou a maior parte dela.
              No desktop, aparece centralizado.
            </p>
            <TouchButton variant="primary" fullWidth>
              Confirmar
            </TouchButton>
          </div>
        </MobileModal>

        {/* Drawer */}
        <MobileDrawer
          isOpen={showDrawer}
          onClose={() => setShowDrawer(false)}
          title="Menu Lateral"
          position="right"
        >
          <nav className="flex flex-col gap-2">
            <a href="#" className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              Opção 1
            </a>
            <a href="#" className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              Opção 2
            </a>
            <a href="#" className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800">
              Opção 3
            </a>
          </nav>
        </MobileDrawer>
      </div>
    </PageTransition>
  );
}
