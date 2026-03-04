'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HelpRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/workspaces/1/dashboard');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#16161a]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400">Carregando ajuda...</p>
      </div>
    </div>
  );
}
