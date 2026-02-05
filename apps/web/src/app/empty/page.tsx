'use client';

import { useRouter } from 'next/navigation';
import { EmptyState } from '@nexora/ui';
import { Plus } from 'lucide-react';

export default function EmptyWorkspacePage() {
  const router = useRouter();

  const handleCreateWorkspace = () => {
    router.push('/onboarding');
  };

  const handleJoinWorkspace = () => {
    // TODO: Implement join workspace flow
    console.log('Join workspace');
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <EmptyState
          variant="default"
          icon={
            <div className="relative">
              <div className="w-20 h-20 bg-orange-100 rounded-2xl flex items-center justify-center">
                <Plus className="h-10 w-10 text-orange-600" />
              </div>
            </div>
          }
          title="Welcome to NOMA!"
          description="You don't have any workspaces yet. Create your first workspace to start collaborating with your team."
          action={{
            label: 'Create Workspace',
            onClick: handleCreateWorkspace,
          }}
          secondaryAction={{
            label: 'Join Existing Workspace',
            onClick: handleJoinWorkspace,
          }}
        />

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">🚀</span>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Fast Setup
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Get started in less than 2 minutes
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">👥</span>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Team Collaboration
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Invite your team and work together
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl">📊</span>
            </div>
            <h3 className="font-semibold text-neutral-900 dark:text-white mb-1">
              Project Management
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400">
              Organize and track all your projects
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
