'use client';

import { useEffect, useState } from 'react';

export function PWAInstaller() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      // Registrar service worker
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registrado:', registration);

          // Verificar atualizações a cada hora
          setInterval(() => {
            registration.update();
          }, 60 * 60 * 1000);

          // Detectar quando está online/offline
          window.addEventListener('online', () => {
            console.log('Conexão restaurada');
            // Sincronizar dados offline
            if ('sync' in registration) {
              (registration as any).sync.register('sync-tasks');
            }
          });
        })
        .catch((error) => {
          console.error('Erro ao registrar Service Worker:', error);
        });

      // Listener para mensagens do service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data.type === 'SW_UPDATE') {
          // Notificar usuário sobre atualização disponível
          if (confirm('Nova versão disponível! Deseja atualizar?')) {
            window.location.reload();
          }
        }
      });

      window.addEventListener('offline', () => {
        console.log('Conexão perdida - modo offline');
      });
    }

    // Prompt de instalação do PWA
    let deferredPrompt: any;

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      deferredPrompt = e;

      // Mostrar botão de instalação customizado ou notificação
      // Pode ser implementado um banner ou modal aqui
      console.log('PWA pode ser instalado');
    });

    window.addEventListener('appinstalled', () => {
      console.log('PWA instalado com sucesso');
      deferredPrompt = null;
    });
  }, []);

  return null;
}

/**
 * Hook para verificar se o app está instalado como PWA
 */
export function useIsPWA(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

/**
 * Hook para verificar status online/offline
 */
export function useOnlineStatus(): boolean {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}
