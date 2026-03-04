'use client';

import { motion } from 'framer-motion';
import { useSwipeGesture } from '@/hooks/useSwipeGesture';
import { useState } from 'react';

interface SwipeableCardProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  rightAction?: {
    icon: React.ReactNode;
    label: string;
    color: string;
  };
  className?: string;
}

export function SwipeableCard({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  className = '',
}: SwipeableCardProps) {
  const [isDragging, setIsDragging] = useState(false);

  const swipeProps = useSwipeGesture({
    onSwipeLeft,
    onSwipeRight,
    threshold: 100,
  });

  return (
    <div className="relative overflow-hidden rounded-lg">
      {/* Background Actions */}
      {leftAction && (
        <div className={`absolute inset-y-0 left-0 flex items-center justify-start px-6 ${leftAction.color}`}>
          <div className="flex flex-col items-center gap-1">
            {leftAction.icon}
            <span className="text-xs font-medium text-white">{leftAction.label}</span>
          </div>
        </div>
      )}
      {rightAction && (
        <div className={`absolute inset-y-0 right-0 flex items-center justify-end px-6 ${rightAction.color}`}>
          <div className="flex flex-col items-center gap-1">
            {rightAction.icon}
            <span className="text-xs font-medium text-white">{rightAction.label}</span>
          </div>
        </div>
      )}

      {/* Draggable Card */}
      <motion.div
        {...swipeProps}
        dragDirectionLock
        onDragStart={() => setIsDragging(true)}
        onDragEnd={(e, info) => {
          setIsDragging(false);
          swipeProps.onDragEnd(e, info);
        }}
        className={`relative bg-white dark:bg-gray-800 cursor-grab active:cursor-grabbing ${className}`}
        style={{
          touchAction: 'pan-y',
        }}
        animate={{
          scale: isDragging ? 1.02 : 1,
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
