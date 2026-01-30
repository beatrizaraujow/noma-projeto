'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { SessionProvider } from 'next-auth/react';
import { ThemeProvider } from 'next-themes';
import { useState } from 'react';
import { ToastProvider } from '@/components/ui/toast';
import { OnboardingProvider } from '@/components/onboarding/OnboardingFlow';

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Cache por 5 minutos antes de considerar stale
            staleTime: 5 * 60 * 1000,
            // Garbage collection após 10 minutos
            gcTime: 10 * 60 * 1000,
            // Refetch em foco apenas para dados críticos (sobrescrever por query)
            refetchOnWindowFocus: false,
            // Refetch ao reconectar (importante para app offline-first)
            refetchOnReconnect: true,
            // Retry uma vez em caso de erro
            retry: 1,
            // Retry delay de 1 segundo
            retryDelay: 1000,
            // Network mode para PWA
            networkMode: 'online',
          },
          mutations: {
            // Retry mutations críticas uma vez
            retry: 1,
            // Network mode para PWA
            networkMode: 'online',
          },
        },
      })
  );

  return (
    <SessionProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <ToastProvider>
            <OnboardingProvider>
              {children}
            </OnboardingProvider>
          </ToastProvider>
        </ThemeProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </SessionProvider>
  );
}
