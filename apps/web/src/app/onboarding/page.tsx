'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/common';

type OnboardingStep = 'welcome' | 'workspace' | 'team' | 'project';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string>('1');

  const [workspaceForm, setWorkspaceForm] = useState({ name: '', description: '' });
  const [teamEmails, setTeamEmails] = useState('');
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });

  const steps: OnboardingStep[] = ['welcome', 'workspace', 'team', 'project'];
  const currentStepIndex = steps.indexOf(currentStep);

  const stepTitle: Record<OnboardingStep, string> = {
    welcome: 'Boas-vindas',
    workspace: 'Crie seu Workspace',
    team: 'Convide seu time',
    project: 'Crie o primeiro projeto',
  };

  const handleCreateWorkspace = async () => {
    setLoading(true);
    setError('');

    try {
      if (!workspaceForm.name.trim()) {
        throw new Error('Informe o nome do workspace');
      }

      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(workspaceForm),
      });

      if (!response.ok) {
        setWorkspaceId('1');
      } else {
        const result = await response.json();
        setWorkspaceId(result.id || '1');
      }

      setCurrentStep('team');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTeam = async () => {
    setLoading(true);
    setError('');

    try {
      const emails = teamEmails
        .split(',')
        .map((email) => email.trim())
        .filter(Boolean);

      if (emails.length > 0) {
        await fetch(`/api/workspaces/${workspaceId}/invites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails }),
        });
      }

      setCurrentStep('project');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    setError('');

    try {
      if (projectForm.name.trim()) {
        await fetch(`/api/workspaces/${workspaceId}/projects`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(projectForm),
        });
      }

      router.push(`/workspaces/${workspaceId}/dashboard`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const index = steps.indexOf(currentStep);
    if (index > 0) {
      setCurrentStep(steps[index - 1]);
      setError('');
    }
  };

  return (
    <div className="min-h-screen bg-[#16161a] text-white flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-[#1a1a1f] border border-gray-800 rounded-2xl p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-400 mb-3">
            <span>Etapa {currentStepIndex + 1} de {steps.length}</span>
            <span>{stepTitle[currentStep]}</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-orange-500 to-red-600 h-2 rounded-full transition-all"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {currentStep === 'welcome' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">Bem-vinda ao NOMA</h1>
              <p className="text-gray-400">Vamos configurar seu ambiente em poucos passos.</p>
            </div>
            <Button onClick={() => setCurrentStep('workspace')}>Começar</Button>
          </div>
        )}

        {currentStep === 'workspace' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Crie seu Workspace</h2>
            <input
              type="text"
              value={workspaceForm.name}
              onChange={(e) => setWorkspaceForm({ ...workspaceForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="Nome do workspace"
              disabled={loading}
            />
            <textarea
              value={workspaceForm.description}
              onChange={(e) => setWorkspaceForm({ ...workspaceForm, description: e.target.value })}
              className="w-full px-4 py-3 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 h-24 resize-none"
              placeholder="Descrição (opcional)"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleBack} disabled={loading}>Voltar</Button>
              <Button onClick={handleCreateWorkspace} disabled={loading}>
                {loading ? 'Criando...' : 'Continuar'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'team' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Convide seu time</h2>
            <p className="text-gray-400 text-sm">Separe emails por vírgula. Você pode pular esta etapa.</p>
            <textarea
              value={teamEmails}
              onChange={(e) => setTeamEmails(e.target.value)}
              className="w-full px-4 py-3 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 h-24 resize-none"
              placeholder="ana@email.com, maria@email.com"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleBack} disabled={loading}>Voltar</Button>
              <Button variant="outline" onClick={() => setCurrentStep('project')} disabled={loading}>Pular</Button>
              <Button onClick={handleInviteTeam} disabled={loading}>
                {loading ? 'Enviando...' : 'Continuar'}
              </Button>
            </div>
          </div>
        )}

        {currentStep === 'project' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Crie o primeiro projeto</h2>
            <input
              type="text"
              value={projectForm.name}
              onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
              className="w-full px-4 py-3 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
              placeholder="Nome do projeto"
              disabled={loading}
            />
            <textarea
              value={projectForm.description}
              onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
              className="w-full px-4 py-3 bg-[#25252b] border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500 h-24 resize-none"
              placeholder="Descrição (opcional)"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleBack} disabled={loading}>Voltar</Button>
              <Button variant="outline" onClick={() => router.push(`/workspaces/${workspaceId}/dashboard`)} disabled={loading}>
                Pular
              </Button>
              <Button onClick={handleCreateProject} disabled={loading}>
                {loading ? 'Finalizando...' : 'Finalizar'}
              </Button>
            </div>
          </div>
        )}

        {error && (
          <div className="mt-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-300 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}
