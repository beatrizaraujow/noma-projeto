'use client';

import { useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const RELEASE = process.env.NEXT_PUBLIC_APP_VERSION || 'dev';
const MAX_RECENT_ERRORS = 20;

type ErrorReport = {
  message: string;
  stack?: string;
  metadata?: Record<string, unknown>;
};

export function ErrorTrackingInitializer() {
  const { data: session } = useSession();
  const recentErrorKeys = useRef<string[]>([]);

  useEffect(() => {
    const userId = (session as any)?.user?.id || null;
    const workspaceId = (session as any)?.workspace?.id || null;

    const shouldReport = (key: string): boolean => {
      if (recentErrorKeys.current.includes(key)) {
        return false;
      }

      recentErrorKeys.current = [key, ...recentErrorKeys.current].slice(0, MAX_RECENT_ERRORS);
      return true;
    };

    const send = async (report: ErrorReport) => {
      const route = typeof window !== 'undefined' ? window.location.pathname : 'unknown';
      const key = `${route}:${report.message}`;

      if (!shouldReport(key)) {
        return;
      }

      if (report.message.includes('ResizeObserver loop limit exceeded')) {
        return;
      }

      try {
        await fetch(`${API_URL}/api/monitoring/frontend-error`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            message: report.message,
            stack: report.stack,
            route,
            userId,
            workspaceId,
            release: RELEASE,
            metadata: {
              ...report.metadata,
              href: typeof window !== 'undefined' ? window.location.href : null,
            },
          }),
          keepalive: true,
        });
      } catch {
        // Never break app flow because of telemetry failures.
      }
    };

    const onError = (event: ErrorEvent) => {
      send({
        message: event.message || 'Unhandled window error',
        stack: event.error?.stack,
      });
    };

    const onUnhandledRejection = (event: PromiseRejectionEvent) => {
      const reason = event.reason;
      if (reason instanceof Error) {
        send({
          message: reason.message,
          stack: reason.stack,
        });
        return;
      }

      send({
        message: 'Unhandled promise rejection',
        metadata: {
          reason: String(reason),
        },
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandledRejection);

    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandledRejection);
    };
  }, [session]);

  return null;
}
