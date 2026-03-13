'use client';

import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/common';
import { EVENT_BUFFER_KEY } from '@/lib/analytics';

type EventName =
  | 'signup_completed'
  | 'workspace_created'
  | 'project_created'
  | 'first_task_created'
  | 'onboarding_completed';

type BufferedEvent = {
  name: EventName;
  payload?: {
    workspaceId?: string;
    timestamp?: string;
    [key: string]: unknown;
  };
  timestamp?: string;
};

type Step = {
  id: EventName;
  label: string;
};

const FUNNEL_STEPS: Step[] = [
  { id: 'signup_completed', label: 'Signup completed' },
  { id: 'workspace_created', label: 'Workspace created' },
  { id: 'project_created', label: 'Project created' },
  { id: 'first_task_created', label: 'First task created' },
  { id: 'onboarding_completed', label: 'Onboarding completed' },
];

function readBufferedEvents(): BufferedEvent[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(EVENT_BUFFER_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw) as BufferedEvent[];
  } catch {
    return [];
  }
}

function formatTimestamp(value?: string): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  return date.toLocaleString();
}

interface ActivationFunnelWidgetProps {
  workspaceId: string;
}

export default function ActivationFunnelWidget({ workspaceId }: ActivationFunnelWidgetProps) {
  const [events, setEvents] = useState<BufferedEvent[]>([]);

  useEffect(() => {
    const load = () => setEvents(readBufferedEvents());
    load();

    const onAnalyticsEvent = () => {
      load();
    };

    window.addEventListener('noma:analytics', onAnalyticsEvent);
    window.addEventListener('storage', onAnalyticsEvent);

    return () => {
      window.removeEventListener('noma:analytics', onAnalyticsEvent);
      window.removeEventListener('storage', onAnalyticsEvent);
    };
  }, []);

  const metrics = useMemo(() => {
    const byStep: Record<EventName, BufferedEvent | null> = {
      signup_completed: null,
      workspace_created: null,
      project_created: null,
      first_task_created: null,
      onboarding_completed: null,
    };

    for (const event of events) {
      if (!FUNNEL_STEPS.some((step) => step.id === event.name)) {
        continue;
      }

      const eventWorkspaceId = event.payload?.workspaceId;
      const shouldKeep =
        event.name === 'signup_completed' ||
        !eventWorkspaceId ||
        eventWorkspaceId === workspaceId;

      if (!shouldKeep) {
        continue;
      }

      byStep[event.name] = event;
    }

    const completedSteps = FUNNEL_STEPS.filter((step) => Boolean(byStep[step.id])).length;

    return {
      byStep,
      completedSteps,
      completionRate: Math.round((completedSteps / FUNNEL_STEPS.length) * 100),
    };
  }, [events, workspaceId]);

  return (
    <Card className="p-5 bg-[#1a1a1f] border-gray-800 text-white shadow-[0_0_0_1px_rgba(249,115,22,0.02)]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Activation Funnel</h3>
          <p className="text-sm text-gray-400">Pilot conversion events for this workspace</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-400">{metrics.completionRate}%</p>
          <p className="text-xs text-gray-400">{metrics.completedSteps}/{FUNNEL_STEPS.length} steps</p>
        </div>
      </div>

      <div className="space-y-2">
        {FUNNEL_STEPS.map((step, index) => {
          const event = metrics.byStep[step.id];
          const done = Boolean(event);

          return (
            <div
              key={step.id}
              className="flex items-center justify-between rounded-lg border border-gray-700 bg-[#25252b] px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <div
                  className={
                    done
                      ? 'h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center'
                      : 'h-5 w-5 rounded-full border border-gray-500 text-gray-400 text-xs flex items-center justify-center'
                  }
                >
                  {index + 1}
                </div>
                <span className={done ? 'text-white' : 'text-gray-300'}>{step.label}</span>
              </div>
              <span className="text-xs text-gray-400">{formatTimestamp(event?.payload?.timestamp || event?.timestamp)}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
