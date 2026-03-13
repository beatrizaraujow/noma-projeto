'use client';

import { WorkspaceScopedRedirect } from '@/components/common';

export default function DealsRedirect() {
  return <WorkspaceScopedRedirect workspacePathSuffix="/deals" loadingText="Carregando negocios..." />;
}
