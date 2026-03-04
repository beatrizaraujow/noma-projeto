'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
}

/**
 * Skip link for keyboard navigation - jumps to main content
 * @example
 * <SkipLink href="#main-content">Skip to main content</SkipLink>
 */
export function SkipLink({ href, children }: SkipLinkProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <a
      href={href}
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[200]
                 px-4 py-2 rounded-lg bg-blue-600 text-white font-medium
                 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
      style={{
        position: 'absolute',
        left: '-9999px',
      }}
      onFocus={(e) => {
        e.currentTarget.style.position = 'fixed';
        e.currentTarget.style.left = '1rem';
      }}
      onBlur={(e) => {
        e.currentTarget.style.position = 'absolute';
        e.currentTarget.style.left = '-9999px';
      }}
    >
      {children}
    </a>
  );
}

/**
 * Container for multiple skip links
 */
export function SkipLinks({ children }: { children: React.ReactNode }) {
  return (
    <div className="skip-links" role="navigation" aria-label="Skip links">
      {children}
    </div>
  );
}
