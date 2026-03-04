'use client';

import { ButtonHTMLAttributes } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { useMobileDetect } from '@/hooks/useMobileDetect';

interface TouchButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

export function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  ...props
}: TouchButtonProps) {
  const { isTouchDevice } = useMobileDetect();

  const baseClasses = 'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600',
    ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 dark:hover:bg-gray-800 dark:text-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
  };

  // Larger tap targets for touch devices
  const sizeClasses = {
    sm: isTouchDevice ? 'px-4 py-2.5 text-sm min-h-[44px]' : 'px-3 py-1.5 text-sm',
    md: isTouchDevice ? 'px-5 py-3 text-base min-h-[48px]' : 'px-4 py-2 text-base',
    lg: isTouchDevice ? 'px-6 py-4 text-lg min-h-[52px]' : 'px-6 py-3 text-lg',
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      className={`
        ${baseClasses}
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : ''}
        ${className}
      `}
      style={{ touchAction: 'manipulation' }}
      {...props}
    >
      {children}
    </motion.button>
  );
}

interface TouchIconButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  icon: React.ReactNode;
  label: string;
}

export function TouchIconButton({
  icon,
  label,
  className = '',
  ...props
}: TouchIconButtonProps) {
  const { isTouchDevice } = useMobileDetect();

  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      className={`
        flex items-center justify-center rounded-lg
        hover:bg-gray-100 dark:hover:bg-gray-800
        transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500
        ${isTouchDevice ? 'w-12 h-12 min-w-[44px] min-h-[44px]' : 'w-10 h-10'}
        ${className}
      `}
      style={{ touchAction: 'manipulation' }}
      aria-label={label}
      {...props}
    >
      {icon}
    </motion.button>
  );
}
