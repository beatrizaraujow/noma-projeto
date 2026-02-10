'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona direto para login
    router.push('/login');
  }, [router]);

  // Tela de loading
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 via-red-600 to-red-900">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
        <p className="mt-4 text-white text-lg font-medium">Carregando...</p>
      </div>
    </div>
  );
}
