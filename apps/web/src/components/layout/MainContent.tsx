'use client';

import React from 'react';

interface MainContentProps {
  children: React.ReactNode;
  className?: string;
}

export const MainContent: React.FC<MainContentProps> = ({ children, className = '' }) => {
  return (
    <main className={`flex-1 bg-[#16161a] overflow-auto ${className}`}>
      <div className="p-8">
        {children}
      </div>
    </main>
  );
};
