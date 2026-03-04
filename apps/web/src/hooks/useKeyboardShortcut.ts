'use client';

import { useEffect, useRef, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean; // Cmd on Mac, Win on Windows
  description?: string;
  callback: (event: KeyboardEvent) => void;
}

interface UseKeyboardShortcutOptions {
  enabled?: boolean;
  preventDefault?: boolean;
  eventType?: 'keydown' | 'keyup';
}

/**
 * Hook for registering keyboard shortcuts with proper cleanup
 * @example
 * useKeyboardShortcut({
 *   key: 'k',
 *   meta: true,
 *   callback: () => openSearch()
 * });
 */
export function useKeyboardShortcut(
  shortcut: KeyboardShortcut,
  options: UseKeyboardShortcutOptions = {}
) {
  const {
    enabled = true,
    preventDefault = true,
    eventType = 'keydown',
  } = options;

  const callbackRef = useRef(shortcut.callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = shortcut.callback;
  }, [shortcut.callback]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return;

      const {
        key: targetKey,
        ctrl = false,
        alt = false,
        shift = false,
        meta = false,
      } = shortcut;

      // Normalize key comparison (case-insensitive for letters)
      const pressedKey = event.key.toLowerCase();
      const normalizedTargetKey = targetKey.toLowerCase();

      const isMatch =
        pressedKey === normalizedTargetKey &&
        event.ctrlKey === ctrl &&
        event.altKey === alt &&
        event.shiftKey === shift &&
        event.metaKey === meta;

      if (isMatch) {
        if (preventDefault) {
          event.preventDefault();
        }
        callbackRef.current(event);
      }
    },
    [shortcut, enabled, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener(eventType, handleKeyPress);

    return () => {
      window.removeEventListener(eventType, handleKeyPress);
    };
  }, [eventType, handleKeyPress, enabled]);
}

/**
 * Hook for registering multiple keyboard shortcuts at once
 * @example
 * useKeyboardShortcuts([
 *   { key: 'k', meta: true, callback: openSearch },
 *   { key: '/', callback: focusSearch },
 * ]);
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  options?: UseKeyboardShortcutOptions
) {
  shortcuts.forEach((shortcut) => {
    useKeyboardShortcut(shortcut, options);
  });
}

/**
 * Format keyboard shortcut for display
 * @example
 * formatShortcut({ key: 'k', meta: true }) // "⌘K" on Mac, "Ctrl+K" on Windows
 */
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const isMac =
    typeof navigator !== 'undefined' &&
    /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);

  const parts: string[] = [];

  if (shortcut.ctrl) parts.push(isMac ? '⌃' : 'Ctrl');
  if (shortcut.alt) parts.push(isMac ? '⌥' : 'Alt');
  if (shortcut.shift) parts.push(isMac ? '⇧' : 'Shift');
  if (shortcut.meta) parts.push(isMac ? '⌘' : 'Ctrl');

  // Capitalize single letters, keep special keys as is
  const keyDisplay =
    shortcut.key.length === 1
      ? shortcut.key.toUpperCase()
      : shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1);

  parts.push(keyDisplay);

  return isMac ? parts.join('') : parts.join('+');
}
