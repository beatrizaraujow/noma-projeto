'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { pageVariants, fadeVariants, slideVariants } from './variants';

interface PageTransitionProps {
  children: React.ReactNode;
  variant?: 'fade' | 'slide' | 'page';
  className?: string;
}

export function PageTransition({ 
  children, 
  variant = 'page',
  className = '' 
}: PageTransitionProps) {
  const variants = {
    fade: fadeVariants,
    slide: slideVariants,
    page: pageVariants,
  }[variant];

  return (
    <motion.div
      className={className}
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      {children}
    </motion.div>
  );
}

interface PageTransitionWrapperProps {
  children: React.ReactNode;
  routeKey?: string;
}

export function PageTransitionWrapper({ children, routeKey }: PageTransitionWrapperProps) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={routeKey}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
