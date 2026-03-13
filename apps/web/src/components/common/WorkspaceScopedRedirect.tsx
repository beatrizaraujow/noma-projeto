'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getSessionWorkspaceId, resolveWorkspaceIdFromApi } from '@/lib/workspace-routing';

type WorkspaceScopedRedirectProps = {
  workspacePathSuffix: string;
  loadingText: string;
};

const normalizeSuffix = (suffix: string) => {
  if (!suffix) {
    return '/dashboard';
  }

  return suffix.startsWith('/') ? suffix : `/${suffix}`;
};

export function WorkspaceScopedRedirect({
  workspacePathSuffix,
  loadingText,
}: WorkspaceScopedRedirectProps) {
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    let cancelled = false;

    const redirect = async () => {
      if (status === 'loading') {
        return;
      }

      if (status === 'unauthenticated') {
        router.replace('/login');
        return;
      }

      const suffix = normalizeSuffix(workspacePathSuffix);
      const sessionWorkspaceId = getSessionWorkspaceId(session);

      if (sessionWorkspaceId) {
        router.replace(`/workspaces/${sessionWorkspaceId}${suffix}`);
        return;
      }

      const workspaceId = await resolveWorkspaceIdFromApi();
      if (cancelled) {
        return;
      }

      if (workspaceId) {
        router.replace(`/workspaces/${workspaceId}${suffix}`);
        return;
      }

      router.replace('/onboarding');
    };

    void redirect();

    return () => {
      cancelled = true;
    };
  }, [router, session, status, workspacePathSuffix]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#16161a]">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500 mb-4"></div>
        <p className="text-gray-400">{loadingText}</p>
      </div>
    </div>
  );
}
