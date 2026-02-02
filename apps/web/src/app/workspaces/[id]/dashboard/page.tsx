'use client';

import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import CustomDashboardWidgets from '@/components/CustomDashboardWidgets';
import DashboardExport from '@/components/DashboardExport';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function WorkspaceDashboardPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const workspaceId = params.id as string;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  if (!mounted || status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session?.accessToken) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push(`/workspaces/${workspaceId}`)}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Workspace
          </Button>
        </div>

        {/* Dashboard Widgets */}
        <CustomDashboardWidgets
          workspaceId={workspaceId}
          token={session.accessToken}
        />

        {/* Export Section */}
        <div className="mt-6">
          <DashboardExport workspaceId={workspaceId} token={session.accessToken} />
        </div>
      </div>
    </div>
  );
}
