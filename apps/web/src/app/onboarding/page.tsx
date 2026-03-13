'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/common';
import { trackActivationEvent } from '@/lib/analytics';
import { getSessionWorkspaceId, resolveWorkspaceIdFromApi } from '@/lib/workspace-routing';

type OnboardingStep = 'welcome' | 'workspace' | 'project';

const ONBOARDING_STATE_KEY = 'noma_onboarding_state_v1';
const ONBOARDING_COMPLETED_KEY = 'onboarding_completed';

type PersistedOnboardingState = {
  currentStep: OnboardingStep;
  workspaceId: string | null;
  workspaceForm: {
    name: string;
    description: string;
  };
  projectForm: {
    name: string;
    description: string;
  };
};

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  const [workspaceForm, setWorkspaceForm] = useState({ name: '', description: '' });
  const [projectForm, setProjectForm] = useState({ name: '', description: '' });

  const steps: OnboardingStep[] = ['welcome', 'workspace', 'project'];
  const currentStepIndex = steps.indexOf(currentStep);

  const stepTitle: Record<OnboardingStep, string> = {
    welcome: 'Boas-vindas',
    workspace: 'Crie seu Workspace',
    project: 'Crie o primeiro projeto',
  };

  useEffect(() => {
    let cancelled = false;

    const initialize = async () => {
      if (status === 'loading') {
        return;
      }

      if (status === 'unauthenticated') {
        router.replace('/login');
        return;
      }

      const completed = localStorage.getItem(ONBOARDING_COMPLETED_KEY);
      if (completed === 'true') {
        const sessionWorkspaceId = getSessionWorkspaceId(session);
        const workspaceIdFromApi = sessionWorkspaceId || await resolveWorkspaceIdFromApi();

        if (cancelled) {
          return;
        }

        if (workspaceIdFromApi) {
          router.replace(`/workspaces/${workspaceIdFromApi}/dashboard`);
          return;
        }

        localStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      }

      const raw = localStorage.getItem(ONBOARDING_STATE_KEY);
      if (!raw) {
        return;
      }

      try {
        const saved = JSON.parse(raw) as PersistedOnboardingState;
        if (saved.currentStep) {
          setCurrentStep(saved.currentStep);
        }
        setWorkspaceId(saved.workspaceId || null);
        if (saved.workspaceForm) {
          setWorkspaceForm(saved.workspaceForm);
        }
        if (saved.projectForm) {
          setProjectForm(saved.projectForm);
        }
      } catch {
        localStorage.removeItem(ONBOARDING_STATE_KEY);
      }
    };

    void initialize();

    return () => {
      cancelled = true;
    };
  }, [router, session, status]);

  useEffect(() => {
    const payload: PersistedOnboardingState = {
      currentStep,
      workspaceId,
      workspaceForm,
      projectForm,
    };

    localStorage.setItem(ONBOARDING_STATE_KEY, JSON.stringify(payload));
  }, [currentStep, workspaceId, workspaceForm, projectForm]);

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
        body: JSON.stringify({
          name: workspaceForm.name.trim(),
          description: workspaceForm.description?.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Nao foi possivel criar o workspace');
      }

      if (!data?.id) {
        throw new Error('Nao foi possivel criar o workspace');
      }

      setWorkspaceId(data.id);
      trackActivationEvent('workspace_created', {
        workspaceId: data.id,
      });
      setCurrentStep('project');
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Nao foi possivel conectar ao servidor. Tente novamente.');
      } else {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async () => {
    setLoading(true);
    setError('');

    try {
      if (!workspaceId) {
        throw new Error('Workspace nao encontrado. Volte e crie o workspace primeiro.');
      }

      if (!projectForm.name.trim()) {
        throw new Error('Informe o nome do primeiro projeto');
      }

      const response = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          workspaceId,
          name: projectForm.name.trim(),
          description: projectForm.description?.trim() || undefined,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || 'Nao foi possivel criar o projeto');
      }

      trackActivationEvent('project_created', {
        workspaceId,
      });

      localStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      localStorage.removeItem(ONBOARDING_STATE_KEY);

      trackActivationEvent('onboarding_completed', {
        workspaceId,
      });

      router.push(`/workspaces/${workspaceId}/dashboard`);
    } catch (err) {
      if (err instanceof TypeError) {
        setError('Nao foi possivel conectar ao servidor. Tente novamente.');
      } else {
        setError(err instanceof Error ? err.message : 'Ocorreu um erro');
      }
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
            <Button onClick={() => setCurrentStep('workspace')}>Comecar</Button>
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
              placeholder="Descricao (opcional)"
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

        {currentStep === 'project' && (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Crie o primeiro projeto</h2>
            <p className="text-gray-400 text-sm">
              Seu workspace ja foi criado. Agora adicione o primeiro projeto para chegar ao dashboard pronto para uso.
            </p>
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
              placeholder="Descricao (opcional)"
              disabled={loading}
            />
            <div className="flex gap-2">
              <Button variant="secondary" onClick={handleBack} disabled={loading}>Voltar</Button>
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
