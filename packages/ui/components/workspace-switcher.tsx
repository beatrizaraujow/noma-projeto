import * as React from 'react';
import { Check, ChevronsUpDown, Plus, Settings } from 'lucide-react';
import { cn } from '../lib/utils';
import { Dropdown, DropdownItem, DropdownSeparator } from './dropdown';
import { Avatar } from './avatar';
import { Badge } from './badge';

export interface Workspace {
  id: string;
  name: string;
  icon?: string;
  members?: number;
  plan?: 'free' | 'pro' | 'enterprise';
}

export interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace;
  onWorkspaceChange: (workspace: Workspace) => void;
  onCreateWorkspace?: () => void;
  onManageWorkspaces?: () => void;
  className?: string;
}

export const WorkspaceSwitcher = React.forwardRef<HTMLDivElement, WorkspaceSwitcherProps>(
  ({
    workspaces,
    currentWorkspace,
    onWorkspaceChange,
    onCreateWorkspace,
    onManageWorkspaces,
    className,
  }, ref) => {
    const planColors = {
      free: 'neutral',
      pro: 'primary',
      enterprise: 'secondary',
    } as const;

    return (
      <div ref={ref} className={cn('w-full', className)}>
        <Dropdown
          trigger={
            <button
              className={cn(
                'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg',
                'bg-white dark:bg-neutral-800',
                'border border-neutral-200 dark:border-neutral-700',
                'hover:bg-neutral-50 dark:hover:bg-neutral-700',
                'transition-colors'
              )}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {currentWorkspace.icon ? (
                  <Avatar
                    src={currentWorkspace.icon}
                    fallback={currentWorkspace.name}
                    size="sm"
                    variant="square"
                  />
                ) : (
                  <div className="w-8 h-8 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {currentWorkspace.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <div className="font-medium text-sm text-neutral-900 dark:text-white truncate">
                    {currentWorkspace.name}
                  </div>
                  {currentWorkspace.members && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {currentWorkspace.members} members
                    </div>
                  )}
                </div>
              </div>
              <ChevronsUpDown className="h-4 w-4 text-neutral-400 flex-shrink-0" />
            </button>
          }
          align="start"
        >
          <div className="px-2 py-1.5 text-xs font-semibold text-neutral-500 dark:text-neutral-400">
            Workspaces
          </div>

          {workspaces.map((workspace) => (
            <DropdownItem
              key={workspace.id}
              onClick={() => onWorkspaceChange(workspace)}
              selected={workspace.id === currentWorkspace.id}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {workspace.icon ? (
                  <Avatar
                    src={workspace.icon}
                    fallback={workspace.name}
                    size="xs"
                    variant="square"
                  />
                ) : (
                  <div className="w-6 h-6 bg-orange-600 rounded flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-xs">
                      {workspace.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="truncate">{workspace.name}</span>
                    {workspace.plan && workspace.plan !== 'free' && (
                      <Badge size="sm" variant={planColors[workspace.plan]}>
                        {workspace.plan}
                      </Badge>
                    )}
                  </div>
                  {workspace.members && (
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      {workspace.members} members
                    </div>
                  )}
                </div>
                {workspace.id === currentWorkspace.id && (
                  <Check className="h-4 w-4 text-orange-600 flex-shrink-0" />
                )}
              </div>
            </DropdownItem>
          ))}

          <DropdownSeparator />

          {onCreateWorkspace && (
            <DropdownItem leftIcon={<Plus className="h-4 w-4" />} onClick={onCreateWorkspace}>
              Create workspace
            </DropdownItem>
          )}

          {onManageWorkspaces && (
            <DropdownItem leftIcon={<Settings className="h-4 w-4" />} onClick={onManageWorkspaces}>
              Manage workspaces
            </DropdownItem>
          )}
        </Dropdown>
      </div>
    );
  }
);

WorkspaceSwitcher.displayName = 'WorkspaceSwitcher';
