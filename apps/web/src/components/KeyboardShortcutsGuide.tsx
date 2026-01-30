'use client';

import React, { useState, useEffect } from 'react';
import { Command, X } from 'lucide-react';

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const SHORTCUTS: Shortcut[] = [
  // Navigation
  { keys: ['Ctrl', 'K'], description: 'Open global search', category: 'Navigation' },
  { keys: ['Ctrl', 'B'], description: 'Toggle sidebar', category: 'Navigation' },
  { keys: ['Ctrl', 'P'], description: 'Quick project switcher', category: 'Navigation' },
  { keys: ['Ctrl', '/'], description: 'Show keyboard shortcuts', category: 'Navigation' },
  
  // Tasks
  { keys: ['C'], description: 'Create new task', category: 'Tasks' },
  { keys: ['E'], description: 'Edit selected task', category: 'Tasks' },
  { keys: ['Delete'], description: 'Delete selected task', category: 'Tasks' },
  { keys: ['Ctrl', 'Enter'], description: 'Save task', category: 'Tasks' },
  { keys: ['Esc'], description: 'Cancel/Close', category: 'Tasks' },
  
  // Filters
  { keys: ['F'], description: 'Focus filters', category: 'Filters' },
  { keys: ['Ctrl', 'Shift', 'F'], description: 'Clear all filters', category: 'Filters' },
  { keys: ['Ctrl', 'S'], description: 'Save current filter', category: 'Filters' },
  
  // View
  { keys: ['1'], description: 'Board view', category: 'View' },
  { keys: ['2'], description: 'List view', category: 'View' },
  { keys: ['3'], description: 'Calendar view', category: 'View' },
];

interface KeyboardShortcutsGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function KeyboardShortcutsGuide({ isOpen, onClose }: KeyboardShortcutsGuideProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const groupedShortcuts = SHORTCUTS.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, Shortcut[]>);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-full max-w-3xl bg-white rounded-lg shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <Command className="w-6 h-6 text-blue-600" />
            <h2 className="text-2xl font-bold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Shortcuts List */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedShortcuts).map(([category, shortcuts]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 hover:bg-gray-50 rounded"
                    >
                      <span className="text-sm text-gray-700">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <React.Fragment key={keyIdx}>
                            <kbd className="px-2 py-1 text-xs font-semibold bg-gray-100 border border-gray-300 rounded">
                              {key}
                            </kbd>
                            {keyIdx < shortcut.keys.length - 1 && (
                              <span className="text-gray-400">+</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-2 p-4 text-sm text-gray-500 border-t bg-gray-50">
          <span>Press</span>
          <kbd className="px-2 py-1 bg-white border rounded">Ctrl</kbd>
          <span>+</span>
          <kbd className="px-2 py-1 bg-white border rounded">/</kbd>
          <span>to open this guide anytime</span>
        </div>
      </div>
    </div>
  );
}

// Hook for keyboard shortcuts guide
export function useKeyboardShortcutsGuide() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+/ or Cmd+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return { isOpen, setIsOpen };
}
