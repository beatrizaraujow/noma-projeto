'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import axios from 'axios';
import { Card } from '@/components/common';
import { EVENT_BUFFER_KEY } from '@/lib/analytics';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type EventName = 'project_created' | 'first_task_created' | 'onboarding_completed';

type BufferedEvent = {
  name: EventName;
  payload?: {
    workspaceId?: string;
    timestamp?: string;
  };
};

type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  href: string;
};

function readEvents(): BufferedEvent[] {
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

interface ActivationChecklistWidgetProps {
  workspaceId: string;
  token: string;
}

export default function ActivationChecklistWidget({ workspaceId, token }: ActivationChecklistWidgetProps) {
  const [events, setEvents] = useState<BufferedEvent[]>([]);
  const [hasInvite, setHasInvite] = useState(false);

  useEffect(() => {
    const loadEvents = () => setEvents(readEvents());
    loadEvents();

    const onAnalytics = () => loadEvents();
    window.addEventListener('noma:analytics', onAnalytics);
    window.addEventListener('storage', onAnalytics);

    return () => {
      window.removeEventListener('noma:analytics', onAnalytics);
      window.removeEventListener('storage', onAnalytics);
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadInvites = async () => {
      if (!token) {
        return;
      }

      try {
        const response = await axios.get(`${API_URL}/api/invites/workspace/${workspaceId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!active) {
          return;
        }

        const invites = Array.isArray(response.data) ? response.data : [];
        setHasInvite(invites.length > 0);
      } catch {
        if (active) {
          setHasInvite(false);
        }
      }
    };

    loadInvites();

    return () => {
      active = false;
    };
  }, [workspaceId, token]);

  const items = useMemo<ChecklistItem[]>(() => {
    const hasEvent = (name: EventName): boolean => {
      return events.some((event) => event.name === name && event.payload?.workspaceId === workspaceId);
    };

    return [
      {
        id: 'project',
        label: 'Criar 1 projeto',
        done: hasEvent('project_created'),
        href: `/workspaces/${workspaceId}/projects`,
      },
      {
        id: 'task',
        label: 'Criar 1 tarefa',
        done: hasEvent('first_task_created'),
        href: `/workspaces/${workspaceId}/board`,
      },
      {
        id: 'invite',
        label: 'Convidar 1 membro',
        done: hasInvite,
        href: `/workspaces/${workspaceId}/settings`,
      },
    ];
  }, [events, hasInvite, workspaceId]);

  const completed = items.filter((item) => item.done).length;
  const completionRate = Math.round((completed / items.length) * 100);

  return (
    <Card className="p-5 bg-[#1a1a1f] border-gray-800 text-white shadow-[0_0_0_1px_rgba(249,115,22,0.02)]">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">Checklist de Ativacao</h3>
          <p className="text-sm text-gray-400">Complete os primeiros passos do workspace</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-orange-400">{completionRate}%</p>
          <p className="text-xs text-gray-400">{completed}/{items.length} concluidos</p>
        </div>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div key={item.id} className="flex items-center justify-between rounded-lg border border-gray-700 bg-[#25252b] px-3 py-2">
            <div className="flex items-center gap-3">
              <div
                className={
                  item.done
                    ? 'h-5 w-5 rounded-full bg-orange-500 text-white text-xs flex items-center justify-center'
                    : 'h-5 w-5 rounded-full border border-gray-500 text-gray-400 text-xs flex items-center justify-center'
                }
              >
                {item.done ? 'OK' : '-'}
              </div>
              <span className={item.done ? 'text-white' : 'text-gray-300'}>{item.label}</span>
            </div>

            {!item.done && (
              <Link href={item.href} className="text-xs text-orange-400 hover:text-orange-300">
                Ir
              </Link>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
