'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { cardVariants } from './variants';

interface AnimatedCardProps extends Omit<HTMLMotionProps<'div'>, 'ref'> {
  children: React.ReactNode;
  hoverable?: boolean;
  clickable?: boolean;
}

export function AnimatedCard({ 
  children, 
  hoverable = true, 
  clickable = false,
  className = '', 
  ...props 
}: AnimatedCardProps) {
  return (
    <motion.div
      className={`rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 ${clickable ? 'cursor-pointer' : ''} ${className}`}
      variants={hoverable ? cardVariants : undefined}
      initial="initial"
      whileHover={hoverable ? "hover" : undefined}
      whileTap={clickable ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  );
}
