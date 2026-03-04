'use client';

import React from 'react';

interface LiveRegionProps {
  children: React.ReactNode;
  /**
   * Politeness level for screen readers
   * - polite: Announces when user is idle (default)
   * - assertive: Interrupts current announcement
   * - off: Not announced
   */
  politeness?: 'polite' | 'assertive' | 'off';
  /**
   * Whether the entire region is relevant or only changes
   */
  atomic?: boolean;
  /**
   * What types of changes are relevant
   */
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  /**
   * ARIA role
   */
  role?: 'status' | 'alert' | 'log' | 'marquee' | 'timer';
}

/**
 * Live region for dynamic content that should be announced to screen readers
 * @example
 * <LiveRegion politeness="assertive" role="alert">
 *   <p>Form submitted successfully!</p>
 * </LiveRegion>
 */
export function LiveRegion({
  children,
  politeness = 'polite',
  atomic = false,
  relevant = 'additions',
  role = 'status',
}: LiveRegionProps) {
  return (
    <div
      role={role}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
    >
      {children}
    </div>
  );
}

/**
 * Alert component for important messages
 */
export function Alert({ children }: { children: React.ReactNode }) {
  return (
    <LiveRegion politeness="assertive" role="alert">
      {children}
    </LiveRegion>
  );
}

/**
 * Status component for non-critical updates
 */
export function Status({ children }: { children: React.ReactNode }) {
  return (
    <LiveRegion politeness="polite" role="status">
      {children}
    </LiveRegion>
  );
}
