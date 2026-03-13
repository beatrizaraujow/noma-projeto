'use client';

import { WorkspaceScopedRedirect } from '@/components/common';

export default function CustomersRedirect() {
  return <WorkspaceScopedRedirect workspacePathSuffix="/dashboard" loadingText="Carregando clientes..." />;
}
