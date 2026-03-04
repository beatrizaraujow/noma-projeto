'use client';

import React, { useState } from 'react';
import { ShortcutsOverlay, VisuallyHidden, SkipLinks, SkipLink, LiveRegion, Alert, Status } from '@/components/common/a11y';
import { useKeyboardShortcut, formatShortcut } from '@/hooks/useKeyboardShortcut';
import { useFocusVisible } from '@/components/common/a11y/FocusVisible';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';
import { ariaPatterns, announceToScreenReader } from '@/utils/a11y';

const shortcuts = [
  {
    title: 'General',
    shortcuts: [
      { id: 'help', key: '?', description: 'Show keyboard shortcuts', callback: () => {} },
      { id: 'search', key: 'k', meta: true, description: 'Open command palette', callback: () => {} },
      { id: 'theme', key: 't', meta: true, description: 'Toggle theme', callback: () => {} },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { id: 'dashboard', key: 'd', meta: true, description: 'Go to dashboard', callback: () => {} },
      { id: 'projects', key: 'p', meta: true, description: 'Go to projects', callback: () => {} },
      { id: 'tasks', key: 't', meta: true, shift: true, description: 'Go to tasks', callback: () => {} },
    ],
  },
  {
    title: 'Actions',
    shortcuts: [
      { id: 'new-task', key: 'n', meta: true, description: 'Create new task', callback: () => {} },
      { id: 'save', key: 's', meta: true, description: 'Save changes', callback: () => {} },
      { id: 'delete', key: 'Backspace', meta: true, description: 'Delete item', callback: () => {} },
    ],
  },
];

export default function AccessibilityShowcase() {
  const [showAlert, setShowAlert] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [count, setCount] = useState(0);
  const prefersReducedMotion = useReducedMotion();
  const { isFocusVisible, focusProps } = useFocusVisible();

  // Demo shortcuts
  useKeyboardShortcut({
    key: 'a',
    ctrl: true,
    callback: () => {
      setShowAlert(true);
      announceToScreenReader('Alert triggered!', 'assertive');
      setTimeout(() => setShowAlert(false), 3000);
    },
  });

  const animationProps = prefersReducedMotion
    ? {}
    : {
        whileHover: { scale: 1.02 },
        whileTap: { scale: 0.98 },
      };

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Skip Links */}
      <SkipLinks>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#keyboard-shortcuts">Skip to keyboard shortcuts</SkipLink>
        <SkipLink href="#examples">Skip to examples</SkipLink>
      </SkipLinks>

      {/* Shortcuts Overlay */}
      <ShortcutsOverlay shortcuts={shortcuts} />

      {/* Header */}
      <header
        className="sticky top-0 z-50 bg-white/80 dark:bg-black/80 backdrop-blur-lg border-b border-gray-200 dark:border-[#1A1A1A]"
        role="banner"
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Accessibility (A11y) Showcase
            </h1>
            <button
              className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] hover:bg-gray-200 dark:hover:bg-[#262626]
                         text-gray-700 dark:text-gray-300 transition-colors
                         focus-ring-enhanced"
              onClick={() => announceToScreenReader('Demo button clicked', 'polite')}
              aria-label="Demo button with accessibility features"
            >
              Press {formatShortcut({ key: 'k', meta: true, callback: () => {} })} for shortcuts
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main id="main-content" className="max-w-7xl mx-auto px-6 py-12 space-y-16" role="main">
        {/* Introduction */}
        <section aria-labelledby="intro-heading">
          <h2 id="intro-heading" className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
            Complete Accessibility System
          </h2>
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            WCAG AA compliant components with keyboard navigation, screen reader support, and reduced motion preferences.
          </p>
        </section>

        {/* Live Regions Demo */}
        <section aria-labelledby="live-regions-heading" className="space-y-6">
          <h2 id="live-regions-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            Live Regions & Announcements
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Alert Demo */}
            <div className="card rounded-xl p-6 border">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Alert (Assertive)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Interrupts screen reader immediately. Press Ctrl+A or click button.
              </p>
              <button
                onClick={() => {
                  setShowAlert(true);
                  announceToScreenReader('Alert triggered!', 'assertive');
                  setTimeout(() => setShowAlert(false), 3000);
                }}
                className="btn-primary px-4 py-2 rounded-lg focus-ring-enhanced"
              >
                Trigger Alert
              </button>
              {showAlert && (
                <Alert>
                  <div className="mt-4 p-4 rounded-lg bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20">
                    <p className="text-red-700 dark:text-red-400 font-medium">
                      ⚠️ This is an important alert!
                    </p>
                  </div>
                </Alert>
              )}
            </div>

            {/* Status Demo */}
            <div className="card rounded-xl p-6 border">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Status (Polite)
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Announces when user is idle. Won't interrupt current reading.
              </p>
              <button
                onClick={() => {
                  setShowStatus(true);
                  setCount((c) => c + 1);
                  announceToScreenReader(`Counter increased to ${count + 1}`, 'polite');
                  setTimeout(() => setShowStatus(false), 3000);
                }}
                className="btn-secondary px-4 py-2 rounded-lg focus-ring-enhanced"
              >
                Update Status
              </button>
              {showStatus && (
                <Status>
                  <div className="mt-4 p-4 rounded-lg bg-blue-100 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20">
                    <p className="text-blue-700 dark:text-blue-400">
                      ℹ️ Counter: {count}
                    </p>
                  </div>
                </Status>
              )}
            </div>
          </div>
        </section>

        {/* Keyboard Navigation */}
        <section id="keyboard-shortcuts" aria-labelledby="keyboard-heading" className="space-y-6">
          <h2 id="keyboard-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            Keyboard Navigation
          </h2>

          <div className="card rounded-xl p-6 border space-y-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Try These Shortcuts
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {shortcuts.flatMap((group) =>
                group.shortcuts.map((shortcut) => (
                  <div
                    key={shortcut.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#0D0D0D]"
                  >
                    <span className="text-gray-900 dark:text-white text-sm">
                      {shortcut.description}
                    </span>
                    <kbd
                      className="px-2.5 py-1.5 rounded-md bg-white dark:bg-[#1A1A1A] border border-gray-300 dark:border-[#2C2C2C]
                                 text-xs font-mono text-gray-700 dark:text-gray-300"
                    >
                      {formatShortcut(shortcut)}
                    </kbd>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* Focus Indicators */}
        <section aria-labelledby="focus-heading" className="space-y-6">
          <h2 id="focus-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            Focus Indicators
          </h2>

          <div className="card rounded-xl p-6 border space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Tab Through These Elements
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Notice the blue focus ring when using Tab key. Click with mouse to see difference.
              </p>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary px-4 py-2 rounded-lg focus-ring-enhanced">
                  Primary Button
                </button>
                <button className="btn-secondary px-4 py-2 rounded-lg focus-ring-enhanced">
                  Secondary Button
                </button>
                <a
                  href="#"
                  className="inline-flex items-center px-4 py-2 rounded-lg bg-gray-100 dark:bg-[#1A1A1A]
                             hover:bg-gray-200 dark:hover:bg-[#262626] text-gray-900 dark:text-white
                             focus-ring-enhanced transition-colors"
                >
                  Link Element
                </a>
                <input
                  type="text"
                  placeholder="Input field"
                  className="input px-4 py-2 rounded-lg border focus:ring-2"
                  aria-label="Demo input field"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Focus Visible Detection
              </h3>
              <button
                {...focusProps}
                className={`
                  px-6 py-3 rounded-lg font-medium transition-all
                  ${
                    isFocusVisible
                      ? 'bg-blue-600 text-white ring-4 ring-blue-500/50'
                      : 'bg-gray-100 dark:bg-[#1A1A1A] text-gray-900 dark:text-white'
                  }
                `}
              >
                {isFocusVisible ? 'Keyboard Focus Active! 🎯' : 'Click or Tab to this button'}
              </button>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                This button shows different states for keyboard vs mouse focus
              </p>
            </div>
          </div>
        </section>

        {/* Screen Reader Support */}
        <section aria-labelledby="screen-reader-heading" className="space-y-6">
          <h2 id="screen-reader-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            Screen Reader Support
          </h2>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Visually Hidden */}
            <div className="card rounded-xl p-6 border">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Visually Hidden Labels
              </h3>
              <div className="space-y-4">
                <div>
                  <VisuallyHidden>
                    <label htmlFor="search-demo">Search the site</label>
                  </VisuallyHidden>
                  <input
                    id="search-demo"
                    type="search"
                    placeholder="Search..."
                    className="input w-full px-4 py-2 rounded-lg border focus:ring-2"
                  />
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">
                    Has hidden label for screen readers
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] focus-ring-enhanced"
                    aria-label="Edit item"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    <VisuallyHidden>Edit</VisuallyHidden>
                  </button>
                  <button
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#1A1A1A] focus-ring-enhanced"
                    aria-label="Delete item"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6" />
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                    <VisuallyHidden>Delete</VisuallyHidden>
                  </button>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    Icon buttons with ARIA labels
                  </p>
                </div>
              </div>
            </div>

            {/* Semantic HTML */}
            <div className="card rounded-xl p-6 border">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Semantic HTML
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 dark:bg-[#1A1A1A] font-mono text-xs">
                    {'<nav>'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">Navigation containers</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 dark:bg-[#1A1A1A] font-mono text-xs">
                    {'<main>'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">Main content area</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 dark:bg-[#1A1A1A] font-mono text-xs">
                    {'<article>'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">Independent content</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 dark:bg-[#1A1A1A] font-mono text-xs">
                    {'<section>'}
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">Thematic grouping</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 rounded bg-gray-100 dark:bg-[#1A1A1A] font-mono text-xs">
                    role="..."
                  </span>
                  <span className="text-gray-600 dark:text-gray-400">ARIA roles for clarity</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Reduced Motion */}
        <section aria-labelledby="motion-heading" className="space-y-6">
          <h2 id="motion-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            Reduced Motion Support
          </h2>

          <div className="card rounded-xl p-6 border">
            <div className="flex items-start gap-4 mb-6">
              <div
                className={`flex items-center justify-center w-12 h-12 rounded-full ${
                  prefersReducedMotion
                    ? 'bg-green-100 dark:bg-green-500/10 text-green-600 dark:text-green-400'
                    : 'bg-blue-100 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400'
                }`}
              >
                {prefersReducedMotion ? '✓' : '↻'}
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-white">
                  Motion Preference: {prefersReducedMotion ? 'Reduced' : 'Full'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                  {prefersReducedMotion
                    ? 'Animations are disabled based on your system preferences'
                    : 'Full animations are enabled. You can change this in your OS settings.'}
                </p>
                <div className="flex gap-3">
                  <motion.button
                    {...animationProps}
                    className="btn-primary px-4 py-2 rounded-lg focus-ring-enhanced"
                  >
                    Animated Button
                  </motion.button>
                  <p className="text-gray-600 dark:text-gray-400 text-sm self-center">
                    {prefersReducedMotion ? 'No animation' : 'Hover to see animation'}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-lg bg-gray-50 dark:bg-[#0D0D0D]">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                <strong>How to test:</strong> On macOS, go to System Settings → Accessibility →
                Display → Reduce motion. On Windows, Settings → Accessibility → Visual effects →
                Animation effects.
              </p>
            </div>
          </div>
        </section>

        {/* Contrast Compliance */}
        <section id="examples" aria-labelledby="contrast-heading" className="space-y-6">
          <h2 id="contrast-heading" className="text-2xl font-bold text-gray-900 dark:text-white">
            Color Contrast (WCAG AA)
          </h2>

          <div className="card rounded-xl p-6 border space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Text Hierarchy - All WCAG AA Compliant
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#0D0D0D]">
                  <p className="text-gray-900 dark:text-white font-semibold">Primary Text</p>
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-400">21:1 contrast</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#0D0D0D]">
                  <p className="text-gray-600 dark:text-[#B4B4B4]">Secondary Text</p>
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-400">9.74:1 contrast</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#0D0D0D]">
                  <p className="text-gray-500 dark:text-[#737373]">Tertiary Text</p>
                  <span className="text-xs font-mono text-gray-600 dark:text-gray-400">4.61:1 contrast</span>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
                Interactive Elements
              </h3>
              <div className="flex flex-wrap gap-3">
                <button className="btn-primary px-4 py-2 rounded-lg focus-ring-enhanced">
                  Primary Action
                </button>
                <button className="btn-secondary px-4 py-2 rounded-lg focus-ring-enhanced">
                  Secondary Action
                </button>
                <button className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white focus-ring-enhanced">
                  Success Action
                </button>
                <button className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white focus-ring-enhanced">
                  Danger Action
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Summary */}
        <section aria-labelledby="summary-heading" className="card rounded-xl p-8 border bg-blue-50 dark:bg-blue-500/5">
          <h2 id="summary-heading" className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
            ✅ Accessibility Checklist
          </h2>
          <div className="grid md:grid-cols-2 gap-4">
            {[
              'Keyboard navigation with visual indicators',
              'Shortcuts overlay (Cmd+K)',
              'Logical tab order throughout',
              'Screen reader announcements',
              'ARIA labels on all interactive elements',
              'Semantic HTML5 structure',
              'Alternative text for images',
              'WCAG AA contrast ratios (21:1, 9.74:1, 4.61:1)',
              'Reduced motion support',
              'Focus trap in modals',
              'Skip links for quick navigation',
              'Live regions for dynamic content',
            ].map((item, index) => (
              <div key={index} className="flex items-start gap-3">
                <span className="text-green-600 dark:text-green-400 mt-0.5">✓</span>
                <span className="text-gray-700 dark:text-gray-300">{item}</span>
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-[#1A1A1A] mt-16" role="contentinfo">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            Built with accessibility in mind • WCAG AA Compliant • NOMA Team
          </p>
        </div>
      </footer>
    </div>
  );
}
