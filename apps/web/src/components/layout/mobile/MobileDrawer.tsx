'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMobileDetect } from '@/hooks/useMobileDetect';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  position?: 'left' | 'right' | 'bottom';
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  title,
  position = 'right',
}: MobileDrawerProps) {
  const { isMobile } = useMobileDetect();

  const getInitialPosition = () => {
    switch (position) {
      case 'left':
        return { x: '-100%' };
      case 'right':
        return { x: '100%' };
      case 'bottom':
        return { y: '100%' };
      default:
        return { x: '100%' };
    }
  };

  const getDrawerClasses = () => {
    const baseClasses = 'fixed bg-white dark:bg-gray-900 z-50 overflow-y-auto shadow-2xl';
    
    switch (position) {
      case 'left':
        return `${baseClasses} top-0 left-0 bottom-0 w-80 max-w-[85vw]`;
      case 'right':
        return `${baseClasses} top-0 right-0 bottom-0 w-80 max-w-[85vw]`;
      case 'bottom':
        return `${baseClasses} left-0 right-0 bottom-0 max-h-[85vh] rounded-t-2xl`;
      default:
        return `${baseClasses} top-0 right-0 bottom-0 w-80 max-w-[85vw]`;
    }
  };

  // On desktop, render as regular sidebar/panel
  if (!isMobile) {
    return isOpen ? <div className="relative">{children}</div> : null;
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={getInitialPosition()}
            animate={{ x: 0, y: 0 }}
            exit={getInitialPosition()}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={getDrawerClasses()}
          >
            {/* Handle for bottom drawer */}
            {position === 'bottom' && (
              <div className="flex justify-center pt-2 pb-1">
                <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
                  aria-label="Fechar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

            {/* Content */}
            <div className="p-4">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
