'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import WorkspaceLayout from '@/components/WorkspaceLayout';
import {
  SearchBar,
  SearchOption,
  ProjectCardGrid,
  ProjectFiltersBar,
  Project,
  ProjectFilters,
  Button,
  EmptyState,
} from '@nexora/ui';
import { Plus, FolderKanban } from 'lucide-react';

export default function ProjectsPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [searchValue, setSearchValue] = useState('');
  const [filters, setFilters] = useState<ProjectFilters>({});

  // Mock data - TODO: Replace with actual data from API
  const projects: Project[] = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Complete overhaul of the company website with modern UI/UX',
      status: 'active',
      priority: 'high',
      progress: 65,
      owner: { name: 'John Doe' },
      members: [
        { name: 'John Doe' },
        { name: 'Jane Smith' },
        { name: 'Bob Johnson' },
      ],
      tasksCount: 24,
      completedTasks: 16,
      dueDate: new Date('2024-02-15'),
      favorite: true,
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'iOS and Android app for customer engagement',
      status: 'active',
      priority: 'high',
      progress: 45,
      members: [{ name: 'Alice Brown' }, { name: 'Charlie Davis' }],
      tasksCount: 32,
      completedTasks: 14,
      dueDate: new Date('2024-03-01'),
    },
    {
      id: '3',
      name: 'Marketing Campaign Q1',
      description: 'First quarter marketing initiatives',
      status: 'on-hold',
      priority: 'medium',
      progress: 30,
      members: [{ name: 'Eve Wilson' }],
      tasksCount: 15,
      completedTasks: 4,
      dueDate: new Date('2024-03-31'),
    },
    {
      id: '4',
      name: 'API Integration',
      description: 'Third-party API integrations for data sync',
      status: 'completed',
      priority: 'low',
      progress: 100,
      members: [{ name: 'Frank Miller' }, { name: 'Grace Lee' }],
      tasksCount: 12,
      completedTasks: 12,
      dueDate: new Date('2024-01-20'),
    },
  ];

  const searchSuggestions: SearchOption[] = projects.map((project) => ({
    id: project.id,
    label: project.name,
    description: project.description,
    category: 'Projects',
    icon: <FolderKanban className="h-4 w-4" />,
  }));

  const handleCreateProject = () => {
    // TODO: Implement create project modal
    console.log('Create project');
  };

  const handleProjectClick = (projectId: string) => {
    router.push(`/workspaces/${params.id}/projects/${projectId}`);
  };

  const filteredProjects = projects.filter((project) => {
    // Search filter
    if (searchValue && !project.name.toLowerCase().includes(searchValue.toLowerCase())) {
      return false;
    }

    // Status filter
    if (filters.status && filters.status.length > 0 && !filters.status.includes(project.status)) {
      return false;
    }

    // Priority filter
    if (
      filters.priority &&
      filters.priority.length > 0 &&
      project.priority &&
      !filters.priority.includes(project.priority)
    ) {
      return false;
    }

    return true;
  });

  return (
    <WorkspaceLayout workspaceId={params.id} currentPath="projects">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900 dark:text-white">Projects</h1>
            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
              Manage and track all your projects
            </p>
          </div>
          <Button
            onClick={handleCreateProject}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Project
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <SearchBar
              value={searchValue}
              onValueChange={setSearchValue}
              suggestions={searchSuggestions}
              onSelect={(option) => handleProjectClick(option.id)}
              placeholder="Search projects..."
            />
          </div>
          <ProjectFiltersBar
            filters={filters}
            onFiltersChange={setFilters}
            onClearFilters={() => setFilters({})}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Total</div>
            <div className="text-2xl font-bold text-neutral-900 dark:text-white">
              {projects.length}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Active</div>
            <div className="text-2xl font-bold text-green-600">
              {projects.filter((p) => p.status === 'active').length}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">On Hold</div>
            <div className="text-2xl font-bold text-yellow-600">
              {projects.filter((p) => p.status === 'on-hold').length}
            </div>
          </div>
          <div className="bg-white dark:bg-neutral-800 rounded-lg p-4 border border-neutral-200 dark:border-neutral-700">
            <div className="text-sm text-neutral-600 dark:text-neutral-400 mb-1">Completed</div>
            <div className="text-2xl font-bold text-blue-600">
              {projects.filter((p) => p.status === 'completed').length}
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project) => (
              <ProjectCardGrid
                key={project.id}
                project={project}
                onClick={() => handleProjectClick(project.id)}
                onEdit={() => console.log('Edit', project.id)}
                onDelete={() => console.log('Delete', project.id)}
                onArchive={() => console.log('Archive', project.id)}
                onToggleFavorite={() => console.log('Toggle favorite', project.id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            variant="files"
            title="No projects found"
            description={
              searchValue || Object.keys(filters).length > 0
                ? 'Try adjusting your search or filters'
                : 'Create your first project to get started'
            }
            action={
              searchValue || Object.keys(filters).length > 0
                ? {
                    label: 'Clear filters',
                    onClick: () => {
                      setSearchValue('');
                      setFilters({});
                    },
                  }
                : {
                    label: 'Create Project',
                    onClick: handleCreateProject,
                  }
            }
          />
        )}
      </div>
    </WorkspaceLayout>
  );
}
