'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
}

interface Workspace {
  id: string;
  name: string;
  slug: string;
  description?: string;
  members: Member[];
  projects: any[];
  _count: {
    projects: number;
    members: number;
  };
}

export default function WorkspaceDetailPage() {
  const { data: session } = useSession();
  const params = useParams();
  const router = useRouter();
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  useEffect(() => {
    if (session?.accessToken && params.id) {
      loadWorkspace();
    }
  }, [session, params.id]);

  const loadWorkspace = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/api/workspaces/${params.id}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      setWorkspace(response.data);
      
      // Find current user's role
      const currentMember = response.data.members.find(
        (m: Member) => m.user.id === session?.user?.id
      );
      setCurrentUserRole(currentMember?.role || '');
    } catch (error) {
      console.error('Error loading workspace:', error);
      router.push('/workspaces');
    } finally {
      setLoading(false);
    }
  };

  const sendInvite = async () => {
    if (!inviteEmail.trim()) return;

    try {
      await axios.post(
        `${API_URL}/api/invites`,
        {
          workspaceId: params.id,
          email: inviteEmail,
          role: inviteRole,
        },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      setInviteEmail('');
      setShowInvite(false);
      alert('Convite enviado com sucesso!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error sending invite');
    }
  };

  const removeMember = async (memberId: string) => {
    if (!confirm('Tem certeza que deseja remover este membro?')) return;

    try {
      await axios.delete(
        `${API_URL}/api/workspaces/${params.id}/members/${memberId}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      loadWorkspace();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error removing member');
    }
  };

  const updateMemberRole = async (memberId: string, newRole: string) => {
    try {
      await axios.put(
        `${API_URL}/api/workspaces/${params.id}/members/${memberId}/role`,
        { role: newRole },
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      loadWorkspace();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Error updating role');
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'ADMIN':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const canManageMembers = ['OWNER', 'ADMIN'].includes(currentUserRole);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Carregando...</div>
      </div>
    );
  }

  if (!workspace) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => router.push('/workspaces')}
          className="mb-6 text-blue-600 dark:text-blue-400 hover:underline"
        >
          ← Voltar para Workspaces
        </button>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {workspace.name}
          </h1>
          {workspace.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {workspace.description}
            </p>
          )}
          <div className="mt-4 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
            <span>{workspace._count.projects} projetos</span>
            <span>{workspace._count.members} membros</span>
          </div>
          <div className="mt-4 flex gap-3">
            <button
              onClick={() => router.push(`/workspaces/${params.id}/dashboard`)}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm inline-flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="3" y="3" width="7" height="7"></rect>
                <rect x="14" y="3" width="7" height="7"></rect>
                <rect x="14" y="14" width="7" height="7"></rect>
                <rect x="3" y="14" width="7" height="7"></rect>
              </svg>
              Ver Dashboard & Analytics
            </button>
            <button
              onClick={() => router.push(`/workspaces/${params.id}/integrations`)}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm inline-flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
              </svg>
              Integrações
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Membros
            </h2>
            {canManageMembers && (
              <button
                onClick={() => setShowInvite(true)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
              >
                Convidar Membro
              </button>
            )}
          </div>

          {showInvite && (
            <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="font-semibold mb-3 text-gray-900 dark:text-white">
                Enviar Convite
              </h3>
              <input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="email@exemplo.com"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 dark:bg-gray-600 dark:text-white"
              />
              <select
                value={inviteRole}
                onChange={(e) => setInviteRole(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg mb-3 dark:bg-gray-600 dark:text-white"
              >
                <option value="MEMBER">Membro</option>
                <option value="ADMIN">Admin</option>
              </select>
              <div className="flex gap-2">
                <button
                  onClick={sendInvite}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                >
                  Enviar
                </button>
                <button
                  onClick={() => setShowInvite(false)}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          <div className="space-y-3">
            {workspace.members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold">
                    {member.user.name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.user.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {member.user.email}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {canManageMembers && member.role !== 'OWNER' ? (
                    <select
                      value={member.role}
                      onChange={(e) =>
                        updateMemberRole(member.user.id, e.target.value)
                      }
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg text-sm dark:bg-gray-600 dark:text-white"
                    >
                      <option value="MEMBER">Membro</option>
                      <option value="ADMIN">Admin</option>
                    </select>
                  ) : (
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                        member.role
                      )}`}
                    >
                      {member.role}
                    </span>
                  )}
                  {canManageMembers &&
                    member.role !== 'OWNER' &&
                    member.user.id !== session?.user?.id && (
                      <button
                        onClick={() => removeMember(member.user.id)}
                        className="text-red-600 dark:text-red-400 hover:text-red-700 text-sm"
                      >
                        Remover
                      </button>
                    )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
