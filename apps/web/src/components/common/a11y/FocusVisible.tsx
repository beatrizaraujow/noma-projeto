'use client';

import React, { useState } from 'react';

interface FocusVisibleProps {
  children: (props: {
    isFocusVisible: boolean;
    focusProps: {
      onFocus: () => void;
      onBlur: () => void;
      onKeyDown: (e: React.KeyboardEvent) => void;
      onMouseDown: () => void;
    };
  }) => React.ReactNode;
}

/**
 * Hook to detect when focus should be visible (keyboard navigation)
 * Hides focus ring when clicking with mouse, shows it when using keyboard
 */
export function useFocusVisible() {
  const [isFocusVisible, setIsFocusVisible] = useState(false);
  const [isKeyboard, setIsKeyboard] = useState(false);

  const focusProps = {
    onFocus: () => {
      if (isKeyboard) {
        setIsFocusVisible(true);
      }
    },
    onBlur: () => {
      setIsFocusVisible(false);
      setIsKeyboard(false);
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Tab') {
        setIsKeyboard(true);
      }
    },
    onMouseDown: () => {
      setIsKeyboard(false);
      setIsFocusVisible(false);
    },
  };

  return { isFocusVisible, focusProps };
}

/**
 * Render prop component for focus visible behavior
 */
export function FocusVisible({ children }: FocusVisibleProps) {
  const { isFocusVisible, focusProps } = useFocusVisible();
  return <>{children({ isFocusVisible, focusProps })}</>;
}
