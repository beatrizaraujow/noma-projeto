'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X, GripVertical, Settings } from 'lucide-react';
import WorkspaceDashboard from './WorkspaceDashboard';
import ProjectProgressTracker from './ProjectProgressTracker';
import TeamProductivityMetrics from './TeamProductivityMetrics';

interface Widget {
  id: string;
  type: string;
  title: string;
  size: 'small' | 'medium' | 'large';
  enabled: boolean;
}

interface CustomDashboardWidgetsProps {
  workspaceId: string;
  token: string;
}

const AVAILABLE_WIDGETS = [
  {
    id: 'overview',
    type: 'overview',
    title: 'Workspace Overview',
    size: 'large' as const,
    description: 'Key metrics and recent activity',
  },
  {
    id: 'project-progress',
    type: 'project-progress',
    title: 'Project Progress',
    size: 'large' as const,
    description: 'Track completion rates across projects',
  },
  {
    id: 'team-productivity',
    type: 'team-productivity',
    title: 'Team Productivity',
    size: 'large' as const,
    description: 'Team member performance metrics',
  },
];

export default function CustomDashboardWidgets({
  workspaceId,
  token,
}: CustomDashboardWidgetsProps) {
  const [widgets, setWidgets] = useState<Widget[]>(() => {
    // Load from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(`dashboard-widgets-${workspaceId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    }
    // Default widgets
    return AVAILABLE_WIDGETS.map((w) => ({ ...w, enabled: true }));
  });
  const [isCustomizing, setIsCustomizing] = useState(false);

  const saveWidgets = (newWidgets: Widget[]) => {
    setWidgets(newWidgets);
    if (typeof window !== 'undefined') {
      localStorage.setItem(
        `dashboard-widgets-${workspaceId}`,
        JSON.stringify(newWidgets)
      );
    }
  };

  const toggleWidget = (widgetId: string) => {
    const newWidgets = widgets.map((w) =>
      w.id === widgetId ? { ...w, enabled: !w.enabled } : w
    );
    saveWidgets(newWidgets);
  };

  const moveWidget = (widgetId: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex((w) => w.id === widgetId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === widgets.length - 1)
    ) {
      return;
    }

    const newWidgets = [...widgets];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newWidgets[index], newWidgets[targetIndex]] = [
      newWidgets[targetIndex],
      newWidgets[index],
    ];
    saveWidgets(newWidgets);
  };

  const renderWidget = (widget: Widget) => {
    if (!widget.enabled) return null;

    switch (widget.type) {
      case 'overview':
        return (
          <div key={widget.id} className="widget-container">
            {isCustomizing && (
              <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <span className="text-sm font-medium">{widget.title}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveWidget(widget.id, 'up')}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveWidget(widget.id, 'down')}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWidget(widget.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <WorkspaceDashboard workspaceId={workspaceId} token={token} />
          </div>
        );

      case 'project-progress':
        return (
          <div key={widget.id} className="widget-container">
            {isCustomizing && (
              <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <span className="text-sm font-medium">{widget.title}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveWidget(widget.id, 'up')}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveWidget(widget.id, 'down')}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWidget(widget.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <ProjectProgressTracker workspaceId={workspaceId} token={token} />
          </div>
        );

      case 'team-productivity':
        return (
          <div key={widget.id} className="widget-container">
            {isCustomizing && (
              <div className="flex items-center justify-between mb-2 p-2 bg-gray-100 rounded">
                <div className="flex items-center gap-2">
                  <GripVertical className="h-4 w-4 text-gray-400 cursor-move" />
                  <span className="text-sm font-medium">{widget.title}</span>
                </div>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveWidget(widget.id, 'up')}
                  >
                    ↑
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => moveWidget(widget.id, 'down')}
                  >
                    ↓
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleWidget(widget.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <TeamProductivityMetrics workspaceId={workspaceId} token={token} />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Dashboard</h2>
        <Button
          variant={isCustomizing ? 'default' : 'outline'}
          onClick={() => setIsCustomizing(!isCustomizing)}
        >
          <Settings className="h-4 w-4 mr-2" />
          {isCustomizing ? 'Done Customizing' : 'Customize'}
        </Button>
      </div>

      {isCustomizing && (
        <Card className="p-4 mb-6 bg-blue-50 border-blue-200">
          <h3 className="font-semibold mb-3">Available Widgets</h3>
          <div className="space-y-2">
            {widgets.map((widget) => (
              <div
                key={widget.id}
                className="flex items-center justify-between p-2 bg-white rounded"
              >
                <div>
                  <p className="font-medium">{widget.title}</p>
                  <p className="text-sm text-gray-500">
                    {
                      AVAILABLE_WIDGETS.find((w) => w.id === widget.id)
                        ?.description
                    }
                  </p>
                </div>
                <Button
                  variant={widget.enabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => toggleWidget(widget.id)}
                >
                  {widget.enabled ? 'Hide' : 'Show'}
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="space-y-6">{widgets.map(renderWidget)}</div>
    </div>
  );
}
