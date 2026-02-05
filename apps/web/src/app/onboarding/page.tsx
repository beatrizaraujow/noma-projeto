'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  OnboardingContainer,
  WelcomeStep,
  CreateWorkspaceStep,
  InviteTeamStep,
  CreateProjectStep,
} from '@nexora/ui';

type OnboardingStep = 'welcome' | 'workspace' | 'team' | 'project';

export default function OnboardingPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string>('');

  // TODO: Get user name from session
  const userName = 'John';

  const steps: OnboardingStep[] = ['welcome', 'workspace', 'team', 'project'];
  const currentStepIndex = steps.indexOf(currentStep);

  const handleWelcomeNext = () => {
    setCurrentStep('workspace');
  };

  const handleCreateWorkspace = async (data: { name: string; description?: string }) => {
    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual API call
      const response = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create workspace');
      }

      const result = await response.json();
      setWorkspaceId(result.id);
      setCurrentStep('team');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleInviteTeam = async (emails: string[]) => {
    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual API call
      if (emails.length > 0) {
        const response = await fetch(`/api/workspaces/${workspaceId}/invites`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ emails }),
        });

        if (!response.ok) {
          throw new Error('Failed to send invites');
        }
      }

      setCurrentStep('project');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipTeam = () => {
    setCurrentStep('project');
  };

  const handleCreateProject = async (data: { name: string; description?: string }) => {
    setLoading(true);
    setError('');

    try {
      // TODO: Implement actual API call
      const response = await fetch(`/api/workspaces/${workspaceId}/projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Failed to create project');
      }

      // Complete onboarding
      router.push(`/workspaces/${workspaceId}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleSkipProject = () => {
    router.push(`/workspaces/${workspaceId}`);
  };

  const handleBack = () => {
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1]);
    }
  };

  return (
    <OnboardingContainer currentStep={currentStepIndex} totalSteps={steps.length}>
      {currentStep === 'welcome' && (
        <WelcomeStep onNext={handleWelcomeNext} userName={userName} />
      )}

      {currentStep === 'workspace' && (
        <CreateWorkspaceStep
          onNext={handleCreateWorkspace}
          onBack={handleBack}
          loading={loading}
          error={error}
        />
      )}

      {currentStep === 'team' && (
        <InviteTeamStep
          onNext={handleInviteTeam}
          onSkip={handleSkipTeam}
          onBack={handleBack}
          loading={loading}
          error={error}
        />
      )}

      {currentStep === 'project' && (
        <CreateProjectStep
          onNext={handleCreateProject}
          onSkip={handleSkipProject}
          onBack={handleBack}
          loading={loading}
          error={error}
        />
      )}
    </OnboardingContainer>
  );
}
