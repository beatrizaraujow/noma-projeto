'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { useEffect } from 'react';

interface MobileModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  fullScreen?: boolean;
}

export function MobileModal({
  isOpen,
  onClose,
  children,
  title,
  fullScreen,
}: MobileModalProps) {
  const { isMobile } = useMobileDetect();

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [isOpen, isMobile]);

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
            className="fixed inset-0 bg-black/50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: isMobile ? '100%' : 50, scale: isMobile ? 1 : 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: isMobile ? '100%' : 50, scale: isMobile ? 1 : 0.95 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`
              fixed z-50 bg-white dark:bg-gray-900 overflow-y-auto
              ${
                isMobile && fullScreen !== false
                  ? 'inset-0'
                  : isMobile
                  ? 'inset-x-0 bottom-0 top-20 rounded-t-2xl'
                  : 'inset-0 m-auto max-w-2xl max-h-[90vh] rounded-2xl'
              }
            `}
          >
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
              {/* Mobile Handle */}
              {isMobile && (
                <div className="flex justify-center pt-2 pb-1">
                  <div className="w-12 h-1.5 bg-gray-300 dark:bg-gray-600 rounded-full" />
                </div>
              )}
              
              <div className="flex items-center justify-between p-4">
                {title && <h2 className="text-xl font-bold">{title}</h2>}
                <button
                  onClick={onClose}
                  className="ml-auto p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 touch-manipulation"
                  aria-label="Fechar"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className={isMobile ? 'p-4 pb-safe' : 'p-6'}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
