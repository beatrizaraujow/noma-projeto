'use client';

import { useRef } from 'react';
import { motion } from 'framer-motion';
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  onRefresh,
  children,
  threshold = 80,
  className = '',
}: PullToRefreshProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { isRefreshing, pullDistance } = usePullToRefresh(containerRef, {
    onRefresh,
    threshold,
  });

  const showSpinner = pullDistance > threshold / 2;
  const spinnerRotation = Math.min((pullDistance / threshold) * 360, 360);

  return (
    <div ref={containerRef} className={`relative overflow-auto ${className}`}>
      {/* Pull Indicator */}
      <motion.div
        className="absolute top-0 left-0 right-0 flex items-center justify-center"
        animate={{
          height: pullDistance,
          opacity: showSpinner ? 1 : 0,
        }}
        transition={{ duration: 0.2 }}
      >
        <motion.div
          animate={{
            rotate: isRefreshing ? 360 : spinnerRotation,
          }}
          transition={{
            duration: isRefreshing ? 1 : 0,
            repeat: isRefreshing ? Infinity : 0,
            ease: 'linear',
          }}
          className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full"
        />
      </motion.div>

      {/* Content */}
      <motion.div
        animate={{
          paddingTop: pullDistance,
        }}
        transition={{ duration: 0.2 }}
      >
        {children}
      </motion.div>
    </div>
  );
}
