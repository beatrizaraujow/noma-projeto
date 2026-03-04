'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function WorkspacesPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/workspaces/1/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] text-white">
      Redirecionando para o dashboard...
    </div>
  );
}
