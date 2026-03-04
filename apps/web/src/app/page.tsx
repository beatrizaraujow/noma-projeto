'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona direto para login após 1.5s
    const timeout = setTimeout(() => {
      router.push('/login');
    }, 1500);
    
    return () => clearTimeout(timeout);
  }, [router]);

  // Tela de loading animada
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-500 via-red-600 to-red-900">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="rounded-full h-16 w-16 border-b-4 border-white mx-auto"
        />
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-4 text-white text-lg font-medium"
        >
          Carregando NOMA...
        </motion.p>
      </motion.div>
    </div>
  );
}
