'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useKeyboardShortcut, formatShortcut, KeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useReducedMotion } from '@/hooks/useReducedMotion';

export interface ShortcutGroup {
  title: string;
  shortcuts: Array<KeyboardShortcut & { id: string }>;
}

interface ShortcutsOverlayProps {
  shortcuts: ShortcutGroup[];
}

export function ShortcutsOverlay({ shortcuts }: ShortcutsOverlayProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const prefersReducedMotion = useReducedMotion();
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);

  // Register Cmd/Ctrl+K to open overlay
  useKeyboardShortcut({
    key: 'k',
    meta: true,
    callback: () => setIsOpen(true),
  });

  // Register Escape to close
  useKeyboardShortcut(
    {
      key: 'Escape',
      callback: () => setIsOpen(false),
    },
    { enabled: isOpen }
  );

  // Filter shortcuts based on search
  const filteredShortcuts = useMemo(() => {
    if (!searchQuery) return shortcuts;

    return shortcuts
      .map((group) => ({
        ...group,
        shortcuts: group.shortcuts.filter(
          (shortcut) =>
            shortcut.description
              ?.toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            formatShortcut(shortcut)
              .toLowerCase()
              .includes(searchQuery.toLowerCase())
        ),
      }))
      .filter((group) => group.shortcuts.length > 0);
  }, [shortcuts, searchQuery]);

  const animationProps = prefersReducedMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.95 },
        animate: { opacity: 1, scale: 1 },
        exit: { opacity: 0, scale: 0.95 },
        transition: { duration: 0.15 },
      };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/50 dark:bg-black/80 z-[100]"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[101] flex items-start justify-center pt-20 px-4">
            <motion.div
              ref={modalRef}
              {...animationProps}
              role="dialog"
              aria-modal="true"
              aria-labelledby="shortcuts-title"
              className="bg-white dark:bg-[#0D0D0D] rounded-xl border border-gray-200 dark:border-[#2C2C2C] 
                         shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden"
            >
              {/* Header */}
              <div className="border-b border-gray-200 dark:border-[#1A1A1A] p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2
                    id="shortcuts-title"
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    Keyboard Shortcuts
                  </h2>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A]
                               text-gray-500 dark:text-gray-400 transition-colors"
                    aria-label="Close shortcuts overlay"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>

                {/* Search */}
                <div className="relative">
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search shortcuts..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 dark:border-[#2C2C2C]
                               bg-white dark:bg-[#000000] text-gray-900 dark:text-white
                               placeholder:text-gray-400 dark:placeholder:text-gray-600
                               focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
                    aria-label="Search keyboard shortcuts"
                    autoFocus
                  />
                </div>
              </div>

              {/* Shortcuts List */}
              <div className="overflow-y-auto max-h-[calc(80vh-180px)] p-6" role="list">
                {filteredShortcuts.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">
                      No shortcuts found matching "{searchQuery}"
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {filteredShortcuts.map((group, groupIndex) => (
                      <div key={groupIndex}>
                        <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-3">
                          {group.title}
                        </h3>
                        <div className="space-y-2" role="list">
                          {group.shortcuts.map((shortcut) => (
                            <div
                              key={shortcut.id}
                              className="flex items-center justify-between p-3 rounded-lg
                                         hover:bg-gray-50 dark:hover:bg-[#1A1A1A] transition-colors"
                              role="listitem"
                            >
                              <span className="text-gray-900 dark:text-white">
                                {shortcut.description}
                              </span>
                              <kbd
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md
                                           bg-gray-100 dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#2C2C2C]
                                           text-xs font-mono text-gray-700 dark:text-gray-300"
                                aria-label={`Keyboard shortcut: ${formatShortcut(shortcut)}`}
                              >
                                {formatShortcut(shortcut)}
                              </kbd>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-gray-200 dark:border-[#1A1A1A] p-4 bg-gray-50 dark:bg-[#000000]">
                <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                  Press{' '}
                  <kbd className="px-2 py-1 rounded bg-white dark:bg-[#0D0D0D] border border-gray-300 dark:border-[#2C2C2C] text-xs font-mono">
                    {formatShortcut({ key: 'k', meta: true, callback: () => {} })}
                  </kbd>{' '}
                  to open this dialog
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
