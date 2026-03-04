'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AnalyticsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona para o primeiro workspace
    router.replace('/workspaces/1/analytics');
  }, [router]);

  return (
    <div className="min-h-screen bg-[#16161a] flex items-center justify-center">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-400">Carregando análises...</p>
      </div>
    </div>
  );
}
