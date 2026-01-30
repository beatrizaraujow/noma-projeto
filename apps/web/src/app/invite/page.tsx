'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface InviteData {
  id: string;
  email: string;
  role: string;
  workspace: {
    id: string;
    name: string;
    slug: string;
  };
  invitedBy: {
    name: string;
    email: string;
  };
}

export default function InviteAcceptPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  
  const [invite, setInvite] = useState<InviteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [accepting, setAccepting] = useState(false);

  useEffect(() => {
    if (token) {
      verifyInvite();
    } else {
      setError('Token de convite não encontrado');
      setLoading(false);
    }
  }, [token]);

  const verifyInvite = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/invites/verify`, {
        params: { token },
      });
      setInvite(response.data);
    } catch (error: any) {
      setError(
        error.response?.data?.message || 'Convite inválido ou expirado'
      );
    } finally {
      setLoading(false);
    }
  };

  const acceptInvite = async () => {
    if (!session?.accessToken) {
      // Redirect to login with return URL
      router.push(`/login?callbackUrl=/invite?token=${token}`);
      return;
    }

    setAccepting(true);
    try {
      await axios.post(
        `${API_URL}/api/invites/accept`,
        { token },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      
      alert('Convite aceito com sucesso!');
      router.push(`/workspaces/${invite?.workspace.id}`);
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erro ao aceitar convite');
    } finally {
      setAccepting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">
          Verificando convite...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600 dark:text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Convite Inválido
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
          >
            Ir para Início
          </button>
        </div>
      </div>
    );
  }

  if (!invite) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Convite para Workspace
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Você foi convidado para participar
          </p>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <div className="mb-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Workspace
            </div>
            <div className="text-lg font-semibold text-gray-900 dark:text-white">
              {invite.workspace.name}
            </div>
          </div>
          <div className="mb-4">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Convidado por
            </div>
            <div className="font-medium text-gray-900 dark:text-white">
              {invite.invitedBy.name}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {invite.invitedBy.email}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              Cargo
            </div>
            <span className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-full text-sm font-medium">
              {invite.role}
            </span>
          </div>
        </div>

        {!session ? (
          <div className="space-y-3">
            <button
              onClick={acceptInvite}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              Fazer Login e Aceitar
            </button>
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              Você precisa estar logado para aceitar o convite
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <button
              onClick={acceptInvite}
              disabled={accepting}
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium rounded-lg transition-colors"
            >
              {accepting ? 'Aceitando...' : 'Aceitar Convite'}
            </button>
            <button
              onClick={() => router.push('/workspaces')}
              className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
