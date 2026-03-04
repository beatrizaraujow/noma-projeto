'use client';

import { useMobileDetect } from '@/hooks/useMobileDetect';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  mobileFooter?: React.ReactNode;
}

export function ResponsiveLayout({
  children,
  sidebar,
  mobileFooter,
}: ResponsiveLayoutProps) {
  const { isMobile } = useMobileDetect();

  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen">
        <main className="flex-1 overflow-auto pb-16">
          {children}
        </main>
        {mobileFooter}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {sidebar && (
        <aside className="w-64 lg:w-72 xl:w-80 border-r border-gray-200 dark:border-gray-700 overflow-y-auto">
          {sidebar}
        </aside>
      )}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}

interface ResponsiveBoardLayoutProps {
  children: React.ReactNode;
}

export function ResponsiveBoardLayout({ children }: ResponsiveBoardLayoutProps) {
  const { isMobile } = useMobileDetect();

  if (isMobile) {
    return (
      <div className="flex flex-col gap-4 p-4 pb-20">
        {children}
      </div>
    );
  }

  return (
    <div className="flex gap-4 p-6 overflow-x-auto min-h-screen">
      {children}
    </div>
  );
}

interface ResponsiveGridProps {
  children: React.ReactNode;
  columns?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  gap?: number;
}

export function ResponsiveGrid({
  children,
  columns = { mobile: 1, tablet: 2, desktop: 3 },
  gap = 4,
}: ResponsiveGridProps) {
  const gridCols: Record<number, string> = {
    1: 'grid-cols-1',
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  const mobile = columns.mobile || 1;
  const tablet = columns.tablet || 2;
  const desktop = columns.desktop || 3;

  return (
    <div
      className={`
        grid gap-${gap}
        ${gridCols[mobile]}
        md:${gridCols[tablet]}
        lg:${gridCols[desktop]}
      `}
    >
      {children}
    </div>
  );
}
