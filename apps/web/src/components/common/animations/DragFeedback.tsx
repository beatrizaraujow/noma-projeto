'use client';

import { motion, HTMLMotionProps, PanInfo } from 'framer-motion';
import { useState } from 'react';

interface DraggableProps extends Omit<HTMLMotionProps<'div'>, 'drag' | 'onDragEnd'> {
  children: React.ReactNode;
  onDragStart?: () => void;
  onDragEnd?: (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => void;
  dragConstraints?: any;
  dragElastic?: number;
  disabled?: boolean;
}

export function Draggable({ 
  children, 
  onDragStart,
  onDragEnd,
  dragConstraints,
  dragElastic = 0.2,
  disabled = false,
  className = '',
  ...props 
}: DraggableProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      drag={!disabled}
      dragConstraints={dragConstraints}
      dragElastic={dragElastic}
      dragMomentum={false}
      onDragStart={() => {
        setIsDragging(true);
        onDragStart?.();
      }}
      onDragEnd={(event, info) => {
        setIsDragging(false);
        onDragEnd?.(event, info);
      }}
      className={`${className} ${disabled ? 'cursor-not-allowed' : 'cursor-grab'}`}
      whileDrag={{
        scale: 1.05,
        rotate: isDragging ? 2 : 0,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        cursor: 'grabbing',
        zIndex: 50,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

interface SortableItemProps {
  children: React.ReactNode;
  id: string;
  className?: string;
}

export function SortableItem({ children, id, className = '' }: SortableItemProps) {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <motion.div
      layoutId={id}
      className={className}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        boxShadow: isDragging 
          ? '0 25px 50px -12px rgba(0, 0, 0, 0.25)' 
          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      }}
      exit={{ opacity: 0, scale: 0.9 }}
      drag="y"
      dragConstraints={{ top: 0, bottom: 0 }}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      whileDrag={{
        scale: 1.05,
        cursor: 'grabbing',
        zIndex: 50,
      }}
      transition={{
        layout: {
          type: 'spring',
          stiffness: 500,
          damping: 35,
        },
      }}
    >
      {children}
    </motion.div>
  );
}

interface DragHandleProps {
  className?: string;
}

export function DragHandle({ className = '' }: DragHandleProps) {
  return (
    <div className={`cursor-grab active:cursor-grabbing ${className}`}>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="text-gray-400"
      >
        <path
          d="M7 6C7 6.55228 6.55228 7 6 7C5.44772 7 5 6.55228 5 6C5 5.44772 5.44772 5 6 5C6.55228 5 7 5.44772 7 6Z"
          fill="currentColor"
        />
        <path
          d="M7 10C7 10.5523 6.55228 11 6 11C5.44772 11 5 10.5523 5 10C5 9.44772 5.44772 9 6 9C6.55228 9 7 9.44772 7 10Z"
          fill="currentColor"
        />
        <path
          d="M7 14C7 14.5523 6.55228 15 6 15C5.44772 15 5 14.5523 5 14C5 13.4477 5.44772 13 6 13C6.55228 13 7 13.4477 7 14Z"
          fill="currentColor"
        />
        <path
          d="M11 6C11 6.55228 10.5523 7 10 7C9.44772 7 9 6.55228 9 6C9 5.44772 9.44772 5 10 5C10.5523 5 11 5.44772 11 6Z"
          fill="currentColor"
        />
        <path
          d="M11 10C11 10.5523 10.5523 11 10 11C9.44772 11 9 10.5523 9 10C9 9.44772 9.44772 9 10 9C10.5523 9 11 9.44772 11 10Z"
          fill="currentColor"
        />
        <path
          d="M11 14C11 14.5523 10.5523 15 10 15C9.44772 15 9 14.5523 9 14C9 13.4477 9.44772 13 10 13C10.5523 13 11 13.4477 11 14Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
