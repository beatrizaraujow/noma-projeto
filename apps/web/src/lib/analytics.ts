type AnalyticsPayload = Record<string, unknown>;

export type ActivationEventName =
  | 'signup_completed'
  | 'workspace_created'
  | 'project_created'
  | 'onboarding_completed'
  | 'first_task_created';

export const EVENT_BUFFER_KEY = 'noma_analytics_events_v1';
const FIRST_TASK_TRACK_KEY_PREFIX = 'noma_first_task_created_tracked';

function readBufferedEvents(): Array<{ name: string; payload: AnalyticsPayload; timestamp: string }> {
  if (typeof window === 'undefined') {
    return [];
  }

  const raw = localStorage.getItem(EVENT_BUFFER_KEY);
  if (!raw) {
    return [];
  }

  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeBufferedEvents(events: Array<{ name: string; payload: AnalyticsPayload; timestamp: string }>): void {
  if (typeof window === 'undefined') {
    return;
  }

  localStorage.setItem(EVENT_BUFFER_KEY, JSON.stringify(events));
}

export function trackActivationEvent(name: ActivationEventName, payload: AnalyticsPayload = {}): void {
  if (typeof window === 'undefined') {
    return;
  }

  const eventPayload = {
    ...payload,
    timestamp: new Date().toISOString(),
  };

  // Buffer events locally so product can inspect funnel data even without provider wiring.
  const events = readBufferedEvents();
  events.push({ name, payload: eventPayload, timestamp: eventPayload.timestamp as string });
  writeBufferedEvents(events.slice(-200));

  // Generic browser event for future integrations.
  window.dispatchEvent(
    new CustomEvent('noma:analytics', {
      detail: {
        name,
        payload: eventPayload,
      },
    })
  );

  // Optional GA hook when available.
  const gtag = (window as Window & { gtag?: (...args: unknown[]) => void }).gtag;
  if (gtag) {
    gtag('event', name, eventPayload);
  }
}

export function trackFirstTaskCreatedOnce(payload: {
  workspaceId: string;
  projectId?: string;
  taskId?: string;
}): void {
  if (typeof window === 'undefined') {
    return;
  }

  if (!payload.workspaceId) {
    return;
  }

  const key = `${FIRST_TASK_TRACK_KEY_PREFIX}:${payload.workspaceId}`;
  if (localStorage.getItem(key) === 'true') {
    return;
  }

  localStorage.setItem(key, 'true');
  trackActivationEvent('first_task_created', payload);
}
