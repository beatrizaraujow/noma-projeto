'use client';

import { WorkspaceScopedRedirect } from '@/components/common';

export default function AnalyticsRedirectPage() {
  return <WorkspaceScopedRedirect workspacePathSuffix="/analytics" loadingText="Carregando analises..." />;
}
