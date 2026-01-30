'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  members: any[];
  _count: {
    projects: number;
    members: number;
  };
}

export default function WorkspacesPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState('');

  useEffect(() => {
    if (session?.accessToken) {
      loadWorkspaces();
    }
  }, [session]);

  const loadWorkspaces = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/workspaces`, {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      });
      setWorkspaces(response.data);
    } catch (error) {
      console.error('Error loading workspaces:', error);
    } finally {
      setLoading(false);
    }
  };

  const createWorkspace = async () => {
    if (!newWorkspaceName.trim()) return;

    try {
      await axios.post(
        `${API_URL}/api/workspaces`,
        { name: newWorkspaceName },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      setNewWorkspaceName('');
      setShowCreate(false);
      loadWorkspaces();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error creating workspace');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Meus Workspaces
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Gerencie seus workspaces e equipes
            </p>
          </div>
          <button
            onClick={() => setShowCreate(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
          >
            + Novo Workspace
          </button>
        </div>

        {showCreate && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Criar Novo Workspace
            </h3>
            <input
              type="text"
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="Nome do workspace"
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-4 dark:bg-gray-700 dark:text-white"
              onKeyPress={(e) => e.key === 'Enter' && createWorkspace()}
            />
            <div className="flex gap-2">
              <button
                onClick={createWorkspace}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              >
                Criar
              </button>
              <button
                onClick={() => {
                  setShowCreate(false);
                  setNewWorkspaceName('');
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg"
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {workspaces.map((workspace) => (
            <div
              key={workspace.id}
              onClick={() => router.push(`/workspaces/${workspace.id}`)}
              className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow hover:shadow-lg transition-shadow cursor-pointer"
            >
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {workspace.name}
              </h3>
              {workspace.description && (
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {workspace.description}
                </p>
              )}
              <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span>{workspace._count.projects} projetos</span>
                <span>{workspace._count.members} membros</span>
              </div>
            </div>
          ))}
        </div>

        {workspaces.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Você ainda não tem workspaces
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
            >
              Criar Primeiro Workspace
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
