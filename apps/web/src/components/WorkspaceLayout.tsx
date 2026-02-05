'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Sidebar,
  SidebarItem,
  SidebarSection,
  Topbar,
  WorkspaceSwitcher,
  Workspace,
} from '@nexora/ui';
import {
  Home,
  FolderKanban,
  CheckSquare,
  Calendar,
  Settings,
} from 'lucide-react';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  workspaceId: string;
  currentPath?: string;
}

export default function WorkspaceLayout({
  children,
  workspaceId,
  currentPath = 'home',
}: WorkspaceLayoutProps) {
  const router = useRouter();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Mock data - TODO: Replace with actual data from API
  const workspaces: Workspace[] = [
    {
      id: '1',
      name: 'Acme Inc',
      members: 12,
      plan: 'pro',
    },
    {
      id: '2',
      name: 'Marketing Team',
      members: 5,
      plan: 'free',
    },
    {
      id: '3',
      name: 'Design Studio',
      members: 8,
      plan: 'enterprise',
    },
  ];

  const currentWorkspace = workspaces.find((w) => w.id === workspaceId) || workspaces[0];

  const user = {
    name: 'John Doe',
    email: 'john@example.com',
  };

  const handleWorkspaceChange = (workspace: Workspace) => {
    router.push(`/workspaces/${workspace.id}`);
  };

  const handleCreateWorkspace = () => {
    router.push('/onboarding');
  };

  const handleManageWorkspaces = () => {
    router.push(`/workspaces/${workspaceId}/settings/workspaces`);
  };

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <Sidebar collapsed={sidebarCollapsed} onCollapsedChange={setSidebarCollapsed}>
        {/* Workspace Switcher */}
        <div className="px-3 mb-4">
          <WorkspaceSwitcher
            workspaces={workspaces}
            currentWorkspace={currentWorkspace}
            onWorkspaceChange={handleWorkspaceChange}
            onCreateWorkspace={handleCreateWorkspace}
            onManageWorkspaces={handleManageWorkspaces}
          />
        </div>

        {/* Main Navigation */}
        <SidebarSection title="Main" collapsed={sidebarCollapsed}>
          <SidebarItem
            icon={<Home className="h-5 w-5" />}
            label="Home"
            active={currentPath === 'home'}
            collapsed={sidebarCollapsed}
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
          />
          <SidebarItem
            icon={<FolderKanban className="h-5 w-5" />}
            label="Projects"
            active={currentPath === 'projects'}
            collapsed={sidebarCollapsed}
            onClick={() => router.push(`/workspaces/${workspaceId}/projects`)}
          />
          <SidebarItem
            icon={<CheckSquare className="h-5 w-5" />}
            label="My Tasks"
            badge={5}
            active={currentPath === 'tasks'}
            collapsed={sidebarCollapsed}
            onClick={() => router.push(`/workspaces/${workspaceId}/tasks`)}
          />
          <SidebarItem
            icon={<Calendar className="h-5 w-5" />}
            label="Calendar"
            active={currentPath === 'calendar'}
            collapsed={sidebarCollapsed}
            onClick={() => router.push(`/workspaces/${workspaceId}/calendar`)}
          />
        </SidebarSection>

        {/* Settings */}
        <SidebarSection title="Settings" collapsed={sidebarCollapsed}>
          <SidebarItem
            icon={<Settings className="h-5 w-5" />}
            label="Settings"
            active={currentPath === 'settings'}
            collapsed={sidebarCollapsed}
            onClick={() => router.push(`/workspaces/${workspaceId}/settings`)}
          />
        </SidebarSection>
      </Sidebar>

      {/* Main Content */}
      <div
        className={`transition-all ${sidebarCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}
      >
        <Topbar
          user={user}
          notifications={3}
          onSearch={(value) => console.log('Search:', value)}
          onLogout={() => router.push('/auth/login')}
        />

        <main>{children}</main>
      </div>
    </div>
  );
}
