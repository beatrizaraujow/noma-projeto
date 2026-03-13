'use client';

import { useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/common';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function validatePassword(password: string): string | null {
  if (password.length < 8) {
    return 'A senha precisa ter no minimo 8 caracteres';
  }

  if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
    return 'A senha precisa conter letra maiuscula, minuscula e numero';
  }

  return null;
}

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!token) {
      setError('Token de redefinicao ausente');
      return;
    }

    const validationError = validatePassword(password);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas nao conferem');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body?.message || 'Falha ao redefinir senha');
      }

      setSuccess(true);
      setTimeout(() => {
        router.push('/login');
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111118] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
        <h1 className="text-2xl font-semibold mb-2">Redefinir senha</h1>
        <p className="text-sm text-gray-400 mb-6">Defina uma nova senha para sua conta.</p>

        {success ? (
          <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-300 text-sm">
            Senha redefinida com sucesso. Redirecionando para login...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm text-gray-300 mb-1">Nova senha</label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-[#25252b] px-3 py-2 outline-none focus:border-orange-500"
                disabled={loading}
                required
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm text-gray-300 mb-1">Confirmar senha</label>
              <input
                id="confirm"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full rounded-lg border border-gray-700 bg-[#25252b] px-3 py-2 outline-none focus:border-orange-500"
                disabled={loading}
                required
              />
            </div>

            <p className="text-xs text-gray-500">Use no minimo 8 caracteres, com maiuscula, minuscula e numero.</p>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar nova senha'}
            </Button>

            <Link href="/login" className="block text-center text-sm text-gray-400 hover:text-white">
              Voltar para login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
