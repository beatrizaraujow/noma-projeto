# ♿ Accessibility Quick Reference Card

## 🚀 Import Everything

```tsx
// Components
import {
  ShortcutsOverlay,
  SkipLinks,
  SkipLink,
  VisuallyHidden,
  LiveRegion,
  Alert,
  Status,
  FocusVisible,
  useFocusVisible,
} from '@/components/a11y';

// Hooks
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useReducedMotion } from '@/hooks/useReducedMotion';

// Utilities
import {
  ariaPatterns,
  announceToScreenReader,
  formatShortcut,
  generateId,
  isFocusable,
  getFocusableChildren,
} from '@/utils/a11y';
```

---

## ⌨️ Keyboard Shortcuts

### Register Shortcut
```tsx
useKeyboardShortcut({
  key: 'k',
  meta: true, // Cmd/Ctrl
  callback: () => openSearch(),
  description: 'Open search',
});
```

### Multiple Shortcuts
```tsx
useKeyboardShortcuts([
  { key: 's', meta: true, callback: save },
  { key: 'n', meta: true, callback: createNew },
  { key: '?', shift: true, callback: showHelp },
]);
```

### Shortcuts Overlay
```tsx
<ShortcutsOverlay shortcuts={[
  {
    title: 'Navigation',
    shortcuts: [
      { id: 'home', key: 'h', meta: true, description: 'Go home', callback: goHome },
    ],
  },
]} />
```

### Format for Display
```tsx
const display = formatShortcut({ key: 'k', meta: true });
// Mac: "⌘K"
// Windows: "Ctrl+K"
```

---

## 🎯 Focus Management

### Focus Trap
```tsx
function Modal({ isOpen }) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
  
  return <div ref={modalRef}>{/* Modal content */}</div>;
}
```

### Focus Visible Detection
```tsx
// Hook
const { isFocusVisible, focusProps } = useFocusVisible();

<button
  {...focusProps}
  className={isFocusVisible ? 'ring-2' : ''}
>
  Button
</button>

// Render Prop
<FocusVisible>
  {({ isFocusVisible, focusProps }) => (
    <button {...focusProps}>Button</button>
  )}
</FocusVisible>
```

### Skip Links
```tsx
<SkipLinks>
  <SkipLink href="#main">Skip to main content</SkipLink>
  <SkipLink href="#nav">Skip to navigation</SkipLink>
</SkipLinks>
```

---

## 🔊 Screen Reader Support

### Visually Hidden Label
```tsx
<VisuallyHidden>
  <label htmlFor="search">Search the site</label>
</VisuallyHidden>
<input id="search" type="search" placeholder="Search..." />
```

### Live Announcements
```tsx
// Assertive (interrupts)
<Alert>
  <p>Error: Form failed</p>
</Alert>

// Polite (waits)
<Status>
  <p>Loading complete</p>
</Status>

// Custom
<LiveRegion politeness="assertive" role="alert">
  <p>Important message</p>
</LiveRegion>
```

### Programmatic Announcement
```tsx
announceToScreenReader('Task completed!', 'polite');
announceToScreenReader('Error occurred!', 'assertive');
```

---

## 🎭 ARIA Patterns

### Dialog
```tsx
<div {...ariaPatterns.dialog('title-id', 'desc-id')}>
  <h2 id="title-id">Title</h2>
  <p id="desc-id">Description</p>
</div>
```

### Popup Button
```tsx
<button {...ariaPatterns.popupButton(isOpen, 'menu-id')}>
  Menu
</button>
```

### Tab
```tsx
<button {...ariaPatterns.tab(isSelected, 'panel-id')}>
  Tab 1
</button>
```

### Menu
```tsx
<button {...ariaPatterns.menuButton(isOpen, 'menu-id')}>
  Options
</button>

<ul id="menu-id" role="menu">
  <li>
    <button {...ariaPatterns.menuItem()}>Edit</button>
  </li>
</ul>
```

### Form Field with Error
```tsx
<input
  {...ariaPatterns.fieldWithError('error-id', hasError)}
  {...ariaPatterns.required()}
/>
{hasError && <p id="error-id">Error message</p>}
```

### Accordion
```tsx
<button {...ariaPatterns.accordionButton(isExpanded, 'content-id')}>
  Section Title
</button>
<div id="content-id">Content</div>
```

### All Patterns
```tsx
ariaPatterns.popupButton(isOpen, targetId)
ariaPatterns.dialogButton(dialogId)
ariaPatterns.tab(isSelected, panelId)
ariaPatterns.tabPanel(tabId)
ariaPatterns.accordionButton(isExpanded, contentId)
ariaPatterns.menuButton(isOpen, menuId)
ariaPatterns.menuItem()
ariaPatterns.loading()
ariaPatterns.fieldWithError(errorId, hasError)
ariaPatterns.required()
ariaPatterns.disabled(isDisabled)
ariaPatterns.dialog(titleId, descId?)
ariaPatterns.alertDialog(titleId, descId)
ariaPatterns.combobox(isExpanded, listboxId, activeId?)
ariaPatterns.listbox(labelId?, activeId?)
```

---

## 🎬 Reduced Motion

### Detect Preference
```tsx
const prefersReducedMotion = useReducedMotion();

<motion.div
  animate={{ x: prefersReducedMotion ? 0 : 100 }}
/>
```

### Animation Duration
```tsx
const duration = useAnimationDuration(0.3, 0);
// Returns 0.3 normally, 0 if reduced motion

<motion.div
  transition={{ duration }}
/>
```

---

## 🎨 CSS Classes

### Focus Management
```css
/* Enhanced focus ring */
.focus-ring-enhanced

/* Keyboard-only focus */
.focus-visible-only

/* Skip link */
.skip-link
```

### Screen Readers
```css
/* Visually hidden */
.sr-only

/* Undo sr-only */
.not-sr-only
```

### Usage
```tsx
<button className="focus-ring-enhanced">
  Button
</button>

<span className="sr-only">
  Hidden label
</span>

<a href="#main" className="skip-link">
  Skip to content
</a>
```

---

## 🛠️ Utilities

### Generate ID
```tsx
const id = generateId('dialog'); // "dialog-1"
```

### Check Focusability
```tsx
if (isFocusable(element)) {
  element.focus();
}
```

### Get Focusable Children
```tsx
const focusable = getFocusableChildren(container);
focusable[0]?.focus();
```

---

## ✅ Common Patterns

### Icon Button
```tsx
<button aria-label="Delete item">
  <TrashIcon />
</button>
```

### Form with Label
```tsx
<label htmlFor="email">Email</label>
<input
  id="email"
  type="email"
  aria-required="true"
  className="focus-ring-enhanced"
/>
```

### Loading State
```tsx
<button aria-busy={isLoading} disabled={isLoading}>
  {isLoading ? 'Saving...' : 'Save'}
</button>

{isLoading && (
  <Status>
    <span>Saving your changes...</span>
  </Status>
)}
```

### Modal Dialog
```tsx
function Modal({ isOpen, onClose, title, children }) {
  const modalRef = useFocusTrap(isOpen);
  
  useKeyboardShortcut(
    { key: 'Escape', callback: onClose },
    { enabled: isOpen }
  );
  
  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="title"
    >
      <h2 id="title">{title}</h2>
      {children}
    </div>
  );
}
```

### Navigation with Current Page
```tsx
<nav aria-label="Main navigation">
  <Link
    href="/"
    aria-current={pathname === '/' ? 'page' : undefined}
  >
    Home
  </Link>
</nav>
```

### Search with Results Announcement
```tsx
const handleSearch = async (query) => {
  const results = await search(query);
  announceToScreenReader(
    `${results.length} results found`,
    'polite'
  );
};
```

---

## 🧪 Quick Test

### Keyboard Test
```bash
1. Tab through page
2. Press Cmd/Ctrl+K
3. Press Escape to close
4. Use arrow keys in menus
5. Press Enter/Space on buttons
```

### Screen Reader Test
```bash
Mac: Cmd+F5 (VoiceOver)
Windows: NVDA/JAWS

- Tab through elements
- Check announcements
- Verify labels
```

### Visual Test
```bash
- Check focus rings visible
- Zoom to 200%
- Run Lighthouse audit
```

---

## 📚 Documentation Links

- [Complete Guide](./docs/ACCESSIBILITY_GUIDE.md)
- [Quick Start](./docs/ACCESSIBILITY_QUICKSTART.md)
- [Examples](./docs/ACCESSIBILITY_EXAMPLES.md)
- [Summary](./docs/ACCESSIBILITY_SUMMARY.md)
- [Checklist](./docs/ACCESSIBILITY_CHECKLIST.md)
- [Deliverables](./docs/ACCESSIBILITY_DELIVERABLES.md)

---

## 🎯 WCAG AA Quick Check

- [ ] All text has 4.5:1 contrast ratio
- [ ] All interactive elements keyboard accessible
- [ ] All images have alt text
- [ ] All forms have labels
- [ ] Focus indicators visible
- [ ] No content only in color
- [ ] Respects reduced motion
- [ ] Semantic HTML used
- [ ] ARIA labels where needed
- [ ] Tab order logical

---

**♿ Quick Reference • WCAG AA Compliant • NOMA Team**
