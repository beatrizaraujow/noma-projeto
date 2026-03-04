'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

// Icons
const SunIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="5" />
    <line x1="12" y1="1" x2="12" y2="3" />
    <line x1="12" y1="21" x2="12" y2="23" />
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
    <line x1="1" y1="12" x2="3" y2="12" />
    <line x1="21" y1="12" x2="23" y2="12" />
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
  </svg>
);

const MoonIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const AutoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
    <line x1="8" y1="21" x2="16" y2="21" />
    <line x1="12" y1="17" x2="12" y2="21" />
  </svg>
);

interface ThemeSwitcherProps {
  variant?: 'compact' | 'expanded';
  showLabel?: boolean;
}

export function ThemeSwitcher({ variant = 'compact', showLabel = false }: ThemeSwitcherProps) {
  const { mode, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'light' as const, label: 'Light', icon: SunIcon },
    { value: 'dark' as const, label: 'Dark', icon: MoonIcon },
    { value: 'auto' as const, label: 'Auto', icon: AutoIcon },
  ];

  const currentOption = options.find(opt => opt.value === mode) || options[2];

  if (variant === 'compact') {
    return (
      <div className="relative">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 px-3 py-2 rounded-lg
                     bg-white dark:bg-[#0D0D0D]
                     border border-gray-200 dark:border-[#2C2C2C]
                     hover:bg-gray-50 dark:hover:bg-[#1A1A1A]
                     text-gray-900 dark:text-white
                     transition-colors"
          aria-label="Toggle theme"
        >
          <currentOption.icon />
          {showLabel && (
            <span className="text-sm font-medium">{currentOption.label}</span>
          )}
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsOpen(false)}
                className="fixed inset-0 z-40"
              />
              
              {/* Dropdown */}
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="absolute right-0 mt-2 w-40 py-1 rounded-lg z-50
                           bg-white dark:bg-[#0D0D0D]
                           border border-gray-200 dark:border-[#2C2C2C]
                           shadow-lg dark:shadow-xl"
              >
                {options.map((option) => {
                  const Icon = option.icon;
                  const isActive = mode === option.value;
                  
                  return (
                    <button
                      key={option.value}
                      onClick={() => {
                        setTheme(option.value);
                        setIsOpen(false);
                      }}
                      className={`
                        w-full flex items-center gap-3 px-3 py-2 text-sm
                        transition-colors
                        ${isActive 
                          ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400' 
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1A1A1A]'
                        }
                      `}
                    >
                      <Icon />
                      <span className="flex-1 text-left">{option.label}</span>
                      {isActive && (
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                  );
                })}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // Expanded variant - segmented control
  return (
    <div className="inline-flex items-center gap-1 p-1 rounded-lg
                    bg-gray-100 dark:bg-[#0D0D0D]
                    border border-gray-200 dark:border-[#2C2C2C]">
      {options.map((option) => {
        const Icon = option.icon;
        const isActive = mode === option.value;
        
        return (
          <button
            key={option.value}
            onClick={() => setTheme(option.value)}
            className={`
              relative flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium
              transition-colors
              ${isActive 
                ? 'text-gray-900 dark:text-white' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }
            `}
          >
            {isActive && (
              <motion.div
                layoutId="theme-indicator"
                className="absolute inset-0 rounded-md bg-white dark:bg-[#1A1A1A]
                           border border-gray-300 dark:border-[#2C2C2C]"
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              />
            )}
            <span className="relative z-10 flex items-center gap-2">
              <Icon />
              {showLabel && option.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// Minimal icon-only switcher for toolbars
export function ThemeToggle() {
  const { resolvedTheme, mode, setTheme } = useTheme();

  const cycleTheme = () => {
    const next = mode === 'light' ? 'dark' : mode === 'dark' ? 'auto' : 'light';
    setTheme(next);
  };

  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={cycleTheme}
      className="flex items-center justify-center w-10 h-10 rounded-lg
                 hover:bg-gray-100 dark:hover:bg-[#1A1A1A]
                 text-gray-700 dark:text-gray-300
                 transition-colors"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={resolvedTheme}
          initial={{ rotate: -90, opacity: 0 }}
          animate={{ rotate: 0, opacity: 1 }}
          exit={{ rotate: 90, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {resolvedTheme === 'dark' ? <MoonIcon /> : <SunIcon />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
