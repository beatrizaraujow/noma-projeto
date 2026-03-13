'use client';

import { WorkspaceScopedRedirect } from '@/components/common';

export default function HelpRedirect() {
  return <WorkspaceScopedRedirect workspacePathSuffix="/dashboard" loadingText="Carregando ajuda..." />;
}
