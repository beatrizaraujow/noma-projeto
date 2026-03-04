# Accessibility (A11y) - 5 Minute Quick Start

## 🚀 Add Accessibility to Your Components in 5 Minutes

### Step 1: Import Components (30 seconds)

```tsx
import {
  ShortcutsOverlay,
  SkipLinks,
  SkipLink,
  VisuallyHidden,
  Alert,
  Status,
} from '@/components/a11y';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useReducedMotion } from '@/hooks/useReducedMotion';
```

---

### Step 2: Add Skip Links (1 minute)

```tsx
export default function Layout({ children }) {
  return (
    <>
      {/* Add at the top */}
      <SkipLinks>
        <SkipLink href="#main-content">Skip to main content</SkipLink>
        <SkipLink href="#navigation">Skip to navigation</SkipLink>
      </SkipLinks>

      <nav id="navigation">{/* Nav items */}</nav>
      
      <main id="main-content">{children}</main>
    </>
  );
}
```

---

### Step 3: Add Keyboard Shortcuts (1 minute)

```tsx
function MyComponent() {
  // Simple shortcut
  useKeyboardShortcut({
    key: 'k',
    meta: true, // Cmd on Mac, Ctrl on Windows
    callback: () => openSearch(),
    description: 'Open search',
  });

  // More shortcuts
  useKeyboardShortcut({
    key: 's',
    meta: true,
    callback: () => saveData(),
    description: 'Save',
  });

  return <div>{/* Component */}</div>;
}
```

---

### Step 4: Add Shortcuts Overlay (1 minute)

```tsx
const shortcuts = [
  {
    title: 'Navigation',
    shortcuts: [
      { id: 'search', key: 'k', meta: true, description: 'Open search', callback: openSearch },
      { id: 'home', key: 'h', meta: true, description: 'Go home', callback: goHome },
    ],
  },
];

<ShortcutsOverlay shortcuts={shortcuts} />
// Opens with Cmd+K or Ctrl+K
```

---

### Step 5: Add Screen Reader Support (1 minute)

```tsx
// Icon button with label
<button aria-label="Delete item">
  <TrashIcon />
</button>

// Hidden label
<VisuallyHidden>
  <label htmlFor="search">Search the site</label>
</VisuallyHidden>
<input id="search" type="search" placeholder="Search..." />

// Announce changes
import { announceToScreenReader } from '@/utils/a11y';

function handleSubmit() {
  await submitForm();
  announceToScreenReader('Form submitted successfully!', 'polite');
}
```

---

### Step 6: Add Focus Management (1 minute)

```tsx
// Focus trap for modals
function Modal({ isOpen, children }) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
    >
      {children}
    </div>
  );
}

// Focus indicators (add to buttons)
<button className="focus-ring-enhanced">
  Click me
</button>
```

---

### Step 7: Add Reduced Motion Support (30 seconds)

```tsx
import { motion } from 'framer-motion';

function AnimatedComponent() {
  const prefersReducedMotion = useReducedMotion();
  
  return (
    <motion.div
      animate={{ x: prefersReducedMotion ? 0 : 100 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
    >
      Content
    </motion.div>
  );
}
```

---

## ✅ Quick Checklist

After adding these features, verify:

- [ ] **Keyboard navigation works**
  - Tab through all interactive elements
  - Shortcuts work (try Cmd/Ctrl+K)
  - Focus indicators are visible
  
- [ ] **Screen readers work**
  - All buttons have labels
  - Form inputs have labels
  - Dynamic changes are announced
  
- [ ] **Visual accessibility**
  - Text has good contrast
  - Focus rings are visible
  - Content works at 200% zoom
  
- [ ] **Motion preferences**
  - Animations respect reduced motion
  - No essential content in animations

---

## 🎨 Quick CSS Classes

Add these classes to your components:

```tsx
// Enhanced focus ring (recommended for all interactive elements)
<button className="focus-ring-enhanced">
  Click me
</button>

// Screen reader only content
<span className="sr-only">
  Hidden visually, but read by screen readers
</span>

// Skip link (add to layout)
<a href="#main" className="skip-link">
  Skip to main content
</a>
```

---

## 📦 Complete Example (Copy-Paste Ready)

```tsx
'use client';

import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import {
  ShortcutsOverlay,
  SkipLinks,
  SkipLink,
  VisuallyHidden,
} from '@/components/a11y';

export default function MyPage() {
  // Add keyboard shortcuts
  useKeyboardShortcut({
    key: 's',
    meta: true,
    callback: () => console.log('Save!'),
    description: 'Save',
  });

  const shortcuts = [
    {
      title: 'Actions',
      shortcuts: [
        {
          id: 'save',
          key: 's',
          meta: true,
          description: 'Save',
          callback: () => console.log('Save!'),
        },
      ],
    },
  ];

  return (
    <>
      {/* Skip links for keyboard users */}
      <SkipLinks>
        <SkipLink href="#main">Skip to main content</SkipLink>
      </SkipLinks>

      {/* Shortcuts overlay (Cmd/Ctrl+K) */}
      <ShortcutsOverlay shortcuts={shortcuts} />

      {/* Main content */}
      <main id="main">
        <h1>My Accessible Page</h1>

        {/* Button with screen reader label */}
        <button aria-label="Delete item" className="focus-ring-enhanced">
          <TrashIcon />
        </button>

        {/* Input with hidden label */}
        <div>
          <VisuallyHidden>
            <label htmlFor="email">Email address</label>
          </VisuallyHidden>
          <input
            id="email"
            type="email"
            placeholder="Enter email"
            className="focus-ring-enhanced"
          />
        </div>
      </main>
    </>
  );
}
```

---

## 🧪 Quick Test

1. **Keyboard Test (2 minutes)**
   ```
   1. Unplug your mouse
   2. Press Tab repeatedly
   3. Press Enter/Space on buttons
   4. Press Cmd/Ctrl+K for shortcuts
   5. Press Escape to close modals
   ```

2. **Screen Reader Test (2 minutes)**
   ```
   Mac: Press Cmd+F5 to enable VoiceOver
   Windows: Open NVDA or JAWS
   
   1. Tab through the page
   2. Listen to announcements
   3. Check form labels
   ```

3. **Visual Test (1 minute)**
   ```
   1. Tab through and check focus rings
   2. Zoom to 200% (Cmd/Ctrl + Plus)
   3. Open Chrome DevTools > Lighthouse > Accessibility
   ```

---

## 🎯 Common Patterns

### Pattern 1: Icon Button

```tsx
<button aria-label="Close dialog" className="focus-ring-enhanced">
  <XIcon />
</button>
```

### Pattern 2: Form Field

```tsx
<div>
  <label htmlFor="name" className="sr-only">
    Full name
  </label>
  <input
    id="name"
    type="text"
    placeholder="Enter your name"
    className="focus-ring-enhanced"
  />
</div>
```

### Pattern 3: Loading State

```tsx
import { Status } from '@/components/a11y';

{isLoading && (
  <Status>
    <span>Loading... Please wait</span>
  </Status>
)}
```

### Pattern 4: Success Message

```tsx
import { Alert } from '@/components/a11y';

{success && (
  <Alert>
    <p>✓ Saved successfully!</p>
  </Alert>
)}
```

### Pattern 5: Modal Dialog

```tsx
import { useFocusTrap } from '@/hooks/useFocusTrap';

function MyModal({ isOpen }) {
  const modalRef = useFocusTrap(isOpen);
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <h2 id="modal-title">Dialog Title</h2>
      {/* Content */}
    </div>
  );
}
```

---

## 🔥 Pro Tips

1. **Always test with keyboard only** - Unplug your mouse!

2. **Use semantic HTML** - `<button>` for buttons, `<nav>` for navigation

3. **Don't remove focus rings** - Use `.focus-ring-enhanced` instead

4. **Add labels to everything** - Screen readers need them

5. **Test with real screen readers** - VoiceOver (Mac) or NVDA (Windows)

---

## 📚 Next Steps

- Read [Complete Guide](./ACCESSIBILITY_GUIDE.md) for detailed documentation
- View [Live Examples](/showcase/accessibility)
- Check [Real-World Examples](./ACCESSIBILITY_EXAMPLES.md)
- Review [Testing Guide](./ACCESSIBILITY_TESTING.md)

---

**Ready in 5 minutes! ♿ WCAG AA Compliant • NOMA Team**
