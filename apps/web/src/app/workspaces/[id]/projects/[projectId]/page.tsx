'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import { ProjectHero, Button } from '@nexora/ui';

export default function ProjectDetailPage({
  params,
}: {
  params: { id: string; projectId: string };
}) {
  const router = useRouter();

  // Mock data - TODO: Replace with actual data from API
  const project = {
    id: params.projectId,
    name: 'Website Redesign',
    description:
      'Complete overhaul of the company website with modern UI/UX design, improved performance, and enhanced user experience.',
    status: 'active' as const,
    priority: 'high' as const,
    progress: 65,
    owner: { name: 'John Doe', avatar: undefined },
    members: [
      { name: 'John Doe', avatar: undefined },
      { name: 'Jane Smith', avatar: undefined },
      { name: 'Bob Johnson', avatar: undefined },
      { name: 'Alice Brown', avatar: undefined },
      { name: 'Charlie Davis', avatar: undefined },
    ],
    tasksCount: 24,
    completedTasks: 16,
    dueDate: new Date('2024-02-15'),
    createdAt: new Date('2023-12-01'),
    favorite: true,
  };

  const handleEdit = () => {
    console.log('Edit project');
  };

  const handleDelete = () => {
    console.log('Delete project');
  };

  const handleArchive = () => {
    console.log('Archive project');
  };

  const handleShare = () => {
    console.log('Share project');
  };

  const handleSettings = () => {
    router.push(`/workspaces/${params.id}/projects/${params.projectId}/settings`);
  };

  const handleToggleFavorite = () => {
    console.log('Toggle favorite');
  };

  return (
    <WorkspaceLayout workspaceId={params.id} currentPath="projects">
      <ProjectHero
        project={project}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onArchive={handleArchive}
        onShare={handleShare}
        onSettings={handleSettings}
        onToggleFavorite={handleToggleFavorite}
      />

      {/* Project Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tabs */}
        <div className="border-b border-neutral-200 dark:border-neutral-800 mb-6">
          <div className="flex gap-8">
            <button className="pb-4 border-b-2 border-orange-600 text-orange-600 font-medium">
              Overview
            </button>
            <button className="pb-4 border-b-2 border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
              Tasks
            </button>
            <button className="pb-4 border-b-2 border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
              Files
            </button>
            <button className="pb-4 border-b-2 border-transparent text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white">
              Activity
            </button>
          </div>
        </div>

        {/* Content placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Recent Activity
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Activity feed will be displayed here...
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
              <h2 className="text-xl font-semibold text-neutral-900 dark:text-white mb-4">
                Tasks Overview
              </h2>
              <p className="text-neutral-600 dark:text-neutral-400">
                Task list will be displayed here...
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Create Task
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Upload File
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  Invite Member
                </Button>
              </div>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
              <h3 className="font-semibold text-neutral-900 dark:text-white mb-4">
                Project Details
              </h3>
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Status:</span>{' '}
                  <span className="text-neutral-900 dark:text-white font-medium">Active</span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Priority:</span>{' '}
                  <span className="text-neutral-900 dark:text-white font-medium">High</span>
                </div>
                <div>
                  <span className="text-neutral-600 dark:text-neutral-400">Budget:</span>{' '}
                  <span className="text-neutral-900 dark:text-white font-medium">$50,000</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </WorkspaceLayout>
  );
}
