'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/common';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        throw new Error('Falha ao enviar link de redefinição');
      }

      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-orange-500 via-red-600 to-red-900">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-32 -left-32 w-96 h-96 rounded-full bg-orange-600/30 blur-3xl" />
        <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-red-800/30 blur-3xl" />
      </div>

      <header className="relative z-10 flex items-center justify-between px-8 py-6">
        <Link href="/" className="flex items-center">
          <Image src="/logo-white.svg" alt="NOMA" width={141} height={29} className="h-8 w-auto" priority />
        </Link>
      </header>

      <div className="relative z-10 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">Esqueceu sua senha?</h1>
          <p className="text-gray-600 text-center mb-8">
            Informe seu email para receber as instruções de redefinição.
          </p>

          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  placeholder="seu@email.com"
                  disabled={loading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link de redefinição'}
              </Button>
            </form>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-sm text-green-700">
              Link enviado com sucesso! Verifique seu email para continuar.
            </div>
          )}

          <div className="mt-6 text-center">
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              ← Voltar para login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
