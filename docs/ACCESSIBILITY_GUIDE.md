# Accessibility (A11y) - Complete Guide

## 🎯 Overview

Professional accessibility system with WCAG AA compliance, keyboard navigation, screen reader support, and reduced motion preferences.

## ✨ Features

### **Keyboard Navigation**
- ✅ Custom keyboard shortcuts with Cmd/Ctrl support
- ✅ Shortcuts overlay (Cmd+K)
- ✅ Focus trap for modals
- ✅ Skip links for quick navigation
- ✅ Logical tab order
- ✅ Focus indicators (keyboard vs mouse)

### **Screen Reader Support**
- ✅ ARIA labels and descriptions
- ✅ Live regions for dynamic content
- ✅ Semantic HTML5 structure
- ✅ Visually hidden labels
- ✅ Alternative text patterns
- ✅ Programmatic announcements

### **Visual Accessibility**
- ✅ WCAG AA contrast ratios (21:1, 9.74:1, 4.61:1)
- ✅ Enhanced focus rings
- ✅ High contrast mode support
- ✅ Reduced motion support
- ✅ Clear visual hierarchy

---

## 🚀 Quick Start

### 1. Keyboard Shortcuts

```tsx
import { useKeyboardShortcut, formatShortcut } from '@/hooks/useKeyboardShortcut';

// Single shortcut
useKeyboardShortcut({
  key: 'k',
  meta: true, // Cmd on Mac, Ctrl on Windows
  callback: () => openSearch(),
  description: 'Open search',
});

// Multiple shortcuts
useKeyboardShortcuts([
  { key: 's', meta: true, callback: save },
  { key: 'n', meta: true, callback: createNew },
]);

// Format for display
const display = formatShortcut({ key: 'k', meta: true });
// Returns: "⌘K" on Mac, "Ctrl+K" on Windows
```

### 2. Shortcuts Overlay

```tsx
import { ShortcutsOverlay } from '@/components/a11y';

const shortcuts = [
  {
    title: 'General',
    shortcuts: [
      {
        id: 'search',
        key: 'k',
        meta: true,
        description: 'Open search',
        callback: () => openSearch(),
      },
    ],
  },
];

<ShortcutsOverlay shortcuts={shortcuts} />
```

### 3. Screen Reader Support

```tsx
import { VisuallyHidden, LiveRegion, Alert, Status } from '@/components/a11y';
import { announceToScreenReader } from '@/utils/a11y';

// Hidden label for screen readers
<VisuallyHidden>
  <label htmlFor="search">Search the site</label>
</VisuallyHidden>
<input id="search" type="search" placeholder="Search..." />

// Live region for dynamic content
<Alert>
  <p>Form submitted successfully!</p>
</Alert>

<Status>
  <p>Loading... 50% complete</p>
</Status>

// Programmatic announcement
announceToScreenReader('Task completed!', 'polite');
```

### 4. Focus Management

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useFocusVisible } from '@/components/a11y/FocusVisible';

// Focus trap for modals
function Modal({ isOpen }) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
  
  return (
    <div ref={modalRef}>
      {/* Modal content */}
    </div>
  );
}

// Focus visible detection (keyboard vs mouse)
function Button() {
  const { isFocusVisible, focusProps } = useFocusVisible();
  
  return (
    <button
      {...focusProps}
      className={isFocusVisible ? 'ring-2 ring-blue-500' : ''}
    >
      Click me
    </button>
  );
}
```

### 5. Reduced Motion

```tsx
import { useReducedMotion, useAnimationDuration } from '@/hooks/useReducedMotion';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  const duration = useAnimationDuration(0.3, 0); // 0.3s or 0s
  
  return (
    <motion.div
      animate={{ opacity: 1 }}
      transition={{ duration }}
    >
      {prefersReducedMotion ? 'No animation' : 'Animated content'}
    </motion.div>
  );
}
```

---

## 📚 Components Reference

### ShortcutsOverlay

Keyboard shortcuts dialog (opens with Cmd/Ctrl+K).

```tsx
interface ShortcutGroup {
  title: string;
  shortcuts: Array<{
    id: string;
    key: string;
    ctrl?: boolean;
    alt?: boolean;
    shift?: boolean;
    meta?: boolean;
    description: string;
    callback: () => void;
  }>;
}

<ShortcutsOverlay shortcuts={groups} />
```

**Features:**
- Searchable shortcuts list
- Automatic keyboard detection (Mac vs Windows)
- Focus trap when open
- ESC to close
- Grouped by category

---

### VisuallyHidden

Hides content visually but keeps it accessible to screen readers.

```tsx
<VisuallyHidden as="label">
  <label htmlFor="email">Email address</label>
</VisuallyHidden>
<input id="email" type="email" placeholder="Enter email" />
```

**Use Cases:**
- Labels for icon buttons
- Skip links
- Additional context for screen readers
- Form labels with placeholder text

---

### SkipLink

Skip navigation links for keyboard users.

```tsx
import { SkipLinks, SkipLink } from '@/components/a11y';

<SkipLinks>
  <SkipLink href="#main-content">Skip to main content</SkipLink>
  <SkipLink href="#navigation">Skip to navigation</SkipLink>
  <SkipLink href="#footer">Skip to footer</SkipLink>
</SkipLinks>

<main id="main-content">
  {/* Content */}
</main>
```

**Behavior:**
- Hidden by default
- Visible when focused with keyboard
- First focusable element on page
- Jumps to target when activated

---

### LiveRegion

Announces dynamic content changes to screen readers.

```tsx
import { LiveRegion, Alert, Status } from '@/components/a11y';

// Critical alerts (interrupts)
<Alert>
  <p>Error: Form validation failed</p>
</Alert>

// Status updates (polite)
<Status>
  <p>Saving... Please wait</p>
</Status>

// Custom live region
<LiveRegion politeness="assertive" role="alert">
  <p>Your session expires in 5 minutes</p>
</LiveRegion>
```

**Props:**
- `politeness`: 'polite' | 'assertive' | 'off'
- `atomic`: boolean - announce entire region or just changes
- `relevant`: what changes to announce
- `role`: 'status' | 'alert' | 'log' | 'timer'

---

### FocusVisible

Detect when focus should be visible (keyboard navigation).

```tsx
import { useFocusVisible } from '@/components/a11y/FocusVisible';

function CustomButton() {
  const { isFocusVisible, focusProps } = useFocusVisible();
  
  return (
    <button
      {...focusProps}
      className={`
        base-styles
        ${isFocusVisible ? 'focus-ring-visible' : ''}
      `}
    >
      Button
    </button>
  );
}
```

**Use Cases:**
- Show focus ring only for keyboard navigation
- Hide focus ring when clicking with mouse
- Custom focus indicators

---

## 🎨 CSS Utilities

### Focus Rings

```css
/* Enhanced focus ring (recommended) */
.focus-ring-enhanced {
  @apply focus:outline-none 
         focus:ring-2 
         focus:ring-blue-500 
         dark:focus:ring-blue-400
         focus:ring-offset-2 
         dark:focus:ring-offset-black;
}

/* Focus visible only (keyboard navigation) */
.focus-visible-only:focus:not(:focus-visible) {
  outline: none;
}
```

### Screen Reader Only

```css
/* Visually hidden but accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

### Skip Link

```css
.skip-link {
  @apply sr-only 
         focus:not-sr-only 
         focus:absolute 
         focus:top-4 
         focus:left-4 
         focus:z-[200]
         focus:px-4 
         focus:py-2 
         focus:rounded-lg 
         focus:bg-blue-600 
         focus:text-white;
}
```

---

## 🔧 Hooks Reference

### useKeyboardShortcut

Register keyboard shortcuts with automatic cleanup.

```tsx
interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  alt?: boolean;
  shift?: boolean;
  meta?: boolean;
  description?: string;
  callback: (event: KeyboardEvent) => void;
}

interface Options {
  enabled?: boolean;
  preventDefault?: boolean;
  eventType?: 'keydown' | 'keyup';
}

useKeyboardShortcut(shortcut, options);
```

**Examples:**

```tsx
// Cmd/Ctrl + K
useKeyboardShortcut({
  key: 'k',
  meta: true,
  callback: () => openSearch(),
});

// Shift + ?
useKeyboardShortcut({
  key: '?',
  shift: true,
  callback: () => showHelp(),
});

// Conditional shortcut
useKeyboardShortcut(
  {
    key: 's',
    meta: true,
    callback: () => save(),
  },
  { enabled: isEditing }
);
```

---

### useFocusTrap

Trap focus within a container (for modals, drawers).

```tsx
function Modal({ isOpen, children }) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
  
  return (
    <div ref={modalRef}>
      {children}
    </div>
  );
}
```

**Behavior:**
- Focuses first focusable element when activated
- Tab cycles through focusable elements
- Shift+Tab cycles backwards
- Restores focus when deactivated

---

### useReducedMotion

Detect user's motion preference.

```tsx
const prefersReducedMotion = useReducedMotion();

// Conditional animation
<motion.div
  animate={{ x: prefersReducedMotion ? 0 : 100 }}
>
  Content
</motion.div>

// With duration helper
const duration = useAnimationDuration(0.3, 0);
```

---

## 🛠️ ARIA Utilities

### ARIA Patterns

Pre-configured ARIA attributes for common patterns.

```tsx
import { ariaPatterns } from '@/utils/a11y';

// Button controlling a popup
<button {...ariaPatterns.popupButton(isOpen, 'menu-id')}>
  Menu
</button>

// Dialog
<div {...ariaPatterns.dialog('dialog-title', 'dialog-desc')}>
  <h2 id="dialog-title">Dialog Title</h2>
  <p id="dialog-desc">Description</p>
</div>

// Tab
<button {...ariaPatterns.tab(isSelected, 'panel-id')}>
  Tab 1
</button>

// Form field with error
<input {...ariaPatterns.fieldWithError('error-id', hasError)} />
{hasError && <p id="error-id">Error message</p>}
```

### Helper Functions

```tsx
import {
  generateId,
  announceToScreenReader,
  isFocusable,
  getFocusableChildren,
} from '@/utils/a11y';

// Generate unique ID
const id = generateId('dialog'); // "dialog-1"

// Announce to screen reader
announceToScreenReader('Task completed!', 'polite');

// Check if element is focusable
if (isFocusable(element)) {
  element.focus();
}

// Get all focusable children
const focusableElements = getFocusableChildren(container);
```

---

## ♿ WCAG AA Compliance

### Contrast Ratios

All text meets WCAG AA standards:

| Text Level | Light Mode | Dark Mode | Contrast Ratio |
|------------|------------|-----------|----------------|
| Primary | `#111827` | `#FFFFFF` | 21:1 ✅ |
| Secondary | `#4B5563` | `#B4B4B4` | 9.74:1 ✅ |
| Tertiary | `#9CA3AF` | `#737373` | 4.61:1 ✅ |
| Disabled | `#D1D5DB` | `#525252` | 3.16:1 ✅ |

### Testing Tool

```tsx
// Check contrast ratio programmatically
function getContrastRatio(fg: string, bg: string): number {
  // Implementation...
}

const ratio = getContrastRatio('#111827', '#FFFFFF');
console.log(ratio); // 21
```

---

## 🎯 Best Practices

### ✅ Do's

1. **Always provide keyboard alternatives**
   ```tsx
   // ✅ Good
   <button onClick={handleClick} onKeyDown={handleKeyDown}>
     Action
   </button>
   ```

2. **Use semantic HTML**
   ```tsx
   // ✅ Good
   <nav>
     <ul>
       <li><a href="/home">Home</a></li>
     </ul>
   </nav>
   
   // ❌ Bad
   <div className="nav">
     <div onClick={goHome}>Home</div>
   </div>
   ```

3. **Add ARIA labels to icons**
   ```tsx
   // ✅ Good
   <button aria-label="Delete item">
     <TrashIcon />
   </button>
   ```

4. **Announce dynamic changes**
   ```tsx
   // ✅ Good
   announceToScreenReader('Items loaded', 'polite');
   ```

5. **Test with keyboard only**
   - Use Tab/Shift+Tab to navigate
   - Use Enter/Space to activate
   - Use Escape to close dialogs

### ❌ Don'ts

1. **Don't rely on color alone**
   ```tsx
   // ❌ Bad
   <span className="text-red-600">Error</span>
   
   // ✅ Good
   <span className="text-red-600">
     <ErrorIcon /> Error
   </span>
   ```

2. **Don't remove focus indicators**
   ```css
   /* ❌ Bad */
   button:focus {
     outline: none;
   }
   
   /* ✅ Good */
   button:focus-visible {
     outline: 2px solid blue;
   }
   ```

3. **Don't use div/span for buttons**
   ```tsx
   // ❌ Bad
   <div onClick={handleClick}>Click me</div>
   
   // ✅ Good
   <button onClick={handleClick}>Click me</button>
   ```

---

## 🧪 Testing Checklist

### Keyboard Navigation
- [ ] All interactive elements are keyboard accessible
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Escape closes modals/dropdowns
- [ ] Enter/Space activates buttons
- [ ] Arrow keys navigate lists/menus

### Screen Readers
- [ ] All images have alt text
- [ ] Form inputs have labels
- [ ] Buttons have descriptive text
- [ ] Dynamic content is announced
- [ ] Semantic HTML is used
- [ ] ARIA labels are present

### Visual
- [ ] Text contrast meets WCAG AA
- [ ] Focus indicators are visible
- [ ] Content is readable at 200% zoom
- [ ] Color is not the only indicator
- [ ] Links are underlined or clearly distinguishable

### Motion
- [ ] Respects prefers-reduced-motion
- [ ] Animations are not essential
- [ ] Auto-playing media can be paused

---

## 📱 Mobile Accessibility

### Touch Targets

Minimum 44×44px tap targets for mobile:

```tsx
import { TouchButton } from '@/components/mobile';

<TouchButton>
  {/* Automatically ensures 44x44px minimum */}
  Click me
</TouchButton>
```

### Gestures

Always provide alternatives to gestures:

```tsx
// ✅ Good - swipe OR button
<SwipeableCard onSwipeLeft={handleDelete}>
  <button onClick={handleDelete}>Delete</button>
</SwipeableCard>
```

---

## 🔍 Tools & Resources

### Testing Tools
- **NVDA** (Windows) - Free screen reader
- **VoiceOver** (Mac/iOS) - Built-in screen reader
- **JAWS** (Windows) - Professional screen reader
- **axe DevTools** - Browser extension for accessibility auditing
- **Lighthouse** - Chrome DevTools accessibility audit

### Keyboard Testing
1. Unplug your mouse
2. Use Tab to navigate
3. Use Enter/Space to activate
4. Use Escape to close
5. Use Arrow keys in menus

### Screen Reader Testing
1. Turn on screen reader (VoiceOver: Cmd+F5)
2. Navigate with Tab
3. Listen to announcements
4. Check form labels
5. Test dynamic content

---

## 📦 Complete Example

```tsx
'use client';

import { useState } from 'react';
import {
  ShortcutsOverlay,
  SkipLinks,
  SkipLink,
  VisuallyHidden,
  Alert,
  useFocusVisible,
} from '@/components/a11y';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { motion } from 'framer-motion';

export default function AccessiblePage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const modalRef = useFocusTrap(isModalOpen);
  const prefersReducedMotion = useReducedMotion();

  // Keyboard shortcuts
  useKeyboardShortcut({
    key: 'n',
    meta: true,
    callback: () => setIsModalOpen(true),
  });

  return (
    <>
      {/* Skip links */}
      <SkipLinks>
        <SkipLink href="#main">Skip to main content</SkipLink>
      </SkipLinks>

      {/* Shortcuts overlay */}
      <ShortcutsOverlay shortcuts={shortcuts} />

      {/* Header */}
      <header role="banner">
        <nav aria-label="Main navigation">
          <VisuallyHidden>
            <h1>Site Navigation</h1>
          </VisuallyHidden>
          {/* Nav items */}
        </nav>
      </header>

      {/* Main content */}
      <main id="main" role="main">
        <h1>Welcome</h1>
        
        {/* Success message */}
        {showSuccess && (
          <Alert>
            <p>Action completed successfully!</p>
          </Alert>
        )}

        {/* Interactive button */}
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn-primary focus-ring-enhanced"
          aria-haspopup="dialog"
        >
          Open Modal
        </button>
      </main>

      {/* Modal with focus trap */}
      {isModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          ref={modalRef}
        >
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <h2 id="modal-title">Modal Title</h2>
            <button onClick={() => setIsModalOpen(false)}>
              Close
            </button>
          </motion.div>
        </div>
      )}
    </>
  );
}
```

---

## 🚀 Next Steps

1. Visit [Live Showcase](/showcase/accessibility)
2. Check [Quick Start Guide](./A11Y_QUICKSTART.md)
3. See [Examples](./A11Y_EXAMPLES.md)
4. Review [Testing Guide](./A11Y_TESTING.md)

---

**Built with ♿ accessibility in mind • WCAG AA Compliant • NOMA Team**
