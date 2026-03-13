'use client';

import { WorkspaceScopedRedirect } from '@/components/common';

export default function SettingsRedirect() {
  return <WorkspaceScopedRedirect workspacePathSuffix="/dashboard" loadingText="Carregando configuracoes..." />;
}
