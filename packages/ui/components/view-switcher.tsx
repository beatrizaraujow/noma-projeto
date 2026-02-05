import * as React from 'react';
import { LayoutGrid, List, Calendar, GanttChart } from 'lucide-react';
import { cn } from '../lib/utils';

export type ViewType = 'board' | 'list' | 'calendar' | 'timeline';

export interface ViewSwitcherProps {
  currentView: ViewType;
  onViewChange: (view: ViewType) => void;
  className?: string;
}

const views = [
  { id: 'board' as ViewType, label: 'Board', icon: LayoutGrid },
  { id: 'list' as ViewType, label: 'List', icon: List },
  { id: 'calendar' as ViewType, label: 'Calendar', icon: Calendar },
  { id: 'timeline' as ViewType, label: 'Timeline', icon: GanttChart },
];

export const ViewSwitcher = React.forwardRef<HTMLDivElement, ViewSwitcherProps>(
  ({ currentView, onViewChange, className }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center gap-1 p-1 rounded-lg',
          'bg-neutral-100 dark:bg-neutral-800',
          className
        )}
      >
        {views.map((view) => {
          const Icon = view.icon;
          const isActive = currentView === view.id;

          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-md',
                'text-sm font-medium transition-all',
                'focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2',
                isActive
                  ? 'bg-white dark:bg-neutral-900 text-orange-600 dark:text-orange-400 shadow-sm'
                  : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
              )}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{view.label}</span>
            </button>
          );
        })}
      </div>
    );
  }
);

ViewSwitcher.displayName = 'ViewSwitcher';
