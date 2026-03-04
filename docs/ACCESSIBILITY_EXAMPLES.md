# Accessibility Examples - Real-World Use Cases

## 📋 Table of Contents

1. [Form Examples](#form-examples)
2. [Navigation Examples](#navigation-examples)
3. [Modal Examples](#modal-examples)
4. [Button Examples](#button-examples)
5. [List Examples](#list-examples)
6. [Card Examples](#card-examples)
7. [Dropdown Examples](#dropdown-examples)
8. [Toast/Alert Examples](#toastalert-examples)
9. [Data Table Examples](#data-table-examples)
10. [Search Examples](#search-examples)

---

## Form Examples

### Login Form

```tsx
'use client';

import { useState } from 'react';
import { VisuallyHidden, Alert } from '@/components/a11y';
import { announceToScreenReader } from '@/utils/a11y';

export function LoginForm() {
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      await login();
      announceToScreenReader('Login successful', 'polite');
    } catch (err) {
      setError('Invalid credentials');
      announceToScreenReader('Login failed', 'assertive');
    }
  };

  return (
    <form onSubmit={handleSubmit} aria-label="Login form">
      {error && (
        <Alert>
          <p>{error}</p>
        </Alert>
      )}

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          name="email"
          required
          aria-required="true"
          aria-invalid={!!error}
          aria-describedby={error ? 'login-error' : undefined}
          className="focus-ring-enhanced"
        />
      </div>

      <div>
        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          name="password"
          required
          aria-required="true"
          className="focus-ring-enhanced"
        />
      </div>

      {error && (
        <p id="login-error" role="alert" className="text-red-600">
          {error}
        </p>
      )}

      <button type="submit" className="focus-ring-enhanced">
        Sign In
      </button>
    </form>
  );
}
```

### Form with Validation

```tsx
import { useState } from 'react';
import { ariaPatterns } from '@/utils/a11y';

export function SignupForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});

  return (
    <form>
      <div>
        <label htmlFor="username">
          Username
          <span aria-label="required">*</span>
        </label>
        <input
          id="username"
          type="text"
          {...ariaPatterns.fieldWithError('username-error', !!errors.username)}
          {...ariaPatterns.required()}
          className="focus-ring-enhanced"
        />
        {errors.username && (
          <p id="username-error" role="alert" className="text-red-600">
            {errors.username}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          {...ariaPatterns.fieldWithError('email-error', !!errors.email)}
          className="focus-ring-enhanced"
        />
        {errors.email && (
          <p id="email-error" role="alert">
            {errors.email}
          </p>
        )}
      </div>
    </form>
  );
}
```

---

## Navigation Examples

### Main Navigation

```tsx
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export function MainNav() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home' },
    { href: '/about', label: 'About' },
    { href: '/contact', label: 'Contact' },
  ];

  return (
    <nav aria-label="Main navigation" role="navigation">
      <ul role="list">
        {links.map((link) => {
          const isActive = pathname === link.href;
          
          return (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive ? 'page' : undefined}
                className="focus-ring-enhanced"
              >
                {link.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
```

### Breadcrumb Navigation

```tsx
import Link from 'next/link';
import { ChevronRightIcon } from '@heroicons/react/24/outline';

interface BreadcrumbItem {
  label: string;
  href: string;
}

export function Breadcrumbs({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="flex items-center gap-2">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          
          return (
            <li key={item.href} className="flex items-center gap-2">
              {index > 0 && (
                <ChevronRightIcon
                  className="h-4 w-4"
                  aria-hidden="true"
                />
              )}
              
              {isLast ? (
                <span aria-current="page">{item.label}</span>
              ) : (
                <Link href={item.href} className="focus-ring-enhanced">
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
```

---

## Modal Examples

### Dialog Modal

```tsx
'use client';

import { useFocusTrap } from '@/hooks/useFocusTrap';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { XIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useReducedMotion } from '@/hooks/useReducedMotion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const modalRef = useFocusTrap<HTMLDivElement>(isOpen);
  const prefersReducedMotion = useReducedMotion();

  // Close on Escape
  useKeyboardShortcut(
    {
      key: 'Escape',
      callback: onClose,
    },
    { enabled: isOpen }
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={prefersReducedMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
            aria-hidden="true"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              ref={modalRef}
              initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              className="bg-white dark:bg-black rounded-lg shadow-xl max-w-md w-full"
            >
              {/* Header */}
              <div className="flex items-start justify-between p-6 border-b dark:border-neutral-800">
                <h2 id="modal-title" className="text-xl font-semibold">
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  aria-label="Close dialog"
                  className="focus-ring-enhanced rounded p-1 hover:bg-neutral-100 dark:hover:bg-neutral-900"
                >
                  <XIcon className="h-5 w-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

// Usage
function Example() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsOpen(true)}>Open Modal</button>
      
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Confirm Action"
      >
        <p>Are you sure you want to proceed?</p>
        <div className="flex gap-2 mt-4">
          <button onClick={() => setIsOpen(false)}>Cancel</button>
          <button onClick={handleConfirm}>Confirm</button>
        </div>
      </Modal>
    </>
  );
}
```

### Confirmation Dialog

```tsx
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}) {
  const modalRef = useFocusTrap(isOpen);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div ref={modalRef}>
        <p id="dialog-description">{message}</p>
        
        <div
          role="group"
          aria-label="Confirmation actions"
          className="flex gap-2 mt-6"
        >
          <button
            onClick={onClose}
            className="focus-ring-enhanced"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="focus-ring-enhanced bg-red-600 text-white"
          >
            Delete
          </button>
        </div>
      </div>
    </Modal>
  );
}
```

---

## Button Examples

### Icon Button

```tsx
import { TrashIcon } from '@heroicons/react/24/outline';

export function DeleteButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Delete item"
      className="focus-ring-enhanced p-2 hover:bg-red-50 dark:hover:bg-red-950 rounded"
    >
      <TrashIcon className="h-5 w-5 text-red-600" aria-hidden="true" />
    </button>
  );
}
```

### Toggle Button

```tsx
import { useState } from 'react';

export function ToggleButton() {
  const [isEnabled, setIsEnabled] = useState(false);

  return (
    <button
      role="switch"
      aria-checked={isEnabled}
      onClick={() => setIsEnabled(!isEnabled)}
      className={`
        focus-ring-enhanced
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-colors
        ${isEnabled ? 'bg-blue-600' : 'bg-neutral-300'}
      `}
    >
      <span className="sr-only">
        {isEnabled ? 'Disable' : 'Enable'} notifications
      </span>
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white transition-transform
          ${isEnabled ? 'translate-x-6' : 'translate-x-1'}
        `}
        aria-hidden="true"
      />
    </button>
  );
}
```

### Button with Loading State

```tsx
import { Status } from '@/components/a11y';

export function SubmitButton() {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <>
      <button
        type="submit"
        disabled={isLoading}
        aria-busy={isLoading}
        className="focus-ring-enhanced"
      >
        {isLoading ? 'Saving...' : 'Save'}
      </button>
      
      {isLoading && (
        <Status>
          <span>Saving your changes...</span>
        </Status>
      )}
    </>
  );
}
```

---

## List Examples

### Task List with Keyboard Navigation

```tsx
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export function TaskList({ tasks }: { tasks: Task[] }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Navigate with arrow keys
  useKeyboardShortcut({
    key: 'ArrowDown',
    callback: () => setSelectedIndex((i) => Math.min(i + 1, tasks.length - 1)),
  });

  useKeyboardShortcut({
    key: 'ArrowUp',
    callback: () => setSelectedIndex((i) => Math.max(i - 1, 0)),
  });

  return (
    <ul role="list" aria-label="Task list">
      {tasks.map((task, index) => (
        <li key={task.id}>
          <button
            onClick={() => selectTask(task)}
            aria-selected={index === selectedIndex}
            className="focus-ring-enhanced w-full text-left p-3"
          >
            <h3>{task.title}</h3>
            <p className="text-sm text-neutral-600">{task.description}</p>
          </button>
        </li>
      ))}
    </ul>
  );
}
```

### Sortable List

```tsx
export function SortableList() {
  return (
    <ul role="list" aria-label="Sortable items">
      {items.map((item, index) => (
        <li key={item.id}>
          <div
            role="group"
            aria-label={`Item ${index + 1}: ${item.name}`}
          >
            <button
              aria-label="Move up"
              disabled={index === 0}
              className="focus-ring-enhanced"
            >
              ↑
            </button>
            
            <span>{item.name}</span>
            
            <button
              aria-label="Move down"
              disabled={index === items.length - 1}
              className="focus-ring-enhanced"
            >
              ↓
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
```

---

## Card Examples

### Interactive Card

```tsx
export function ProductCard({ product }: { product: Product }) {
  return (
    <article
      className="border rounded-lg p-4 dark:border-neutral-800"
      aria-labelledby={`product-${product.id}`}
    >
      <img
        src={product.image}
        alt={product.imageAlt || ''}
        className="w-full h-48 object-cover rounded"
      />
      
      <h3 id={`product-${product.id}`} className="mt-4 font-semibold">
        {product.name}
      </h3>
      
      <p className="text-neutral-600">{product.description}</p>
      
      <div className="mt-4 flex items-center justify-between">
        <span aria-label={`Price: $${product.price}`}>
          ${product.price}
        </span>
        
        <button
          aria-label={`Add ${product.name} to cart`}
          className="focus-ring-enhanced px-4 py-2 bg-blue-600 text-white rounded"
        >
          Add to Cart
        </button>
      </div>
    </article>
  );
}
```

---

## Dropdown Examples

### Accessible Dropdown Menu

```tsx
import { useState, useRef } from 'react';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { ariaPatterns } from '@/utils/a11y';

export function DropdownMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuId = 'dropdown-menu';

  useKeyboardShortcut(
    { key: 'Escape', callback: () => setIsOpen(false) },
    { enabled: isOpen }
  );

  return (
    <div className="relative">
      <button
        {...ariaPatterns.popupButton(isOpen, menuId)}
        onClick={() => setIsOpen(!isOpen)}
        className="focus-ring-enhanced"
      >
        Options
      </button>

      {isOpen && (
        <ul
          id={menuId}
          role="menu"
          aria-orientation="vertical"
          className="absolute mt-2 bg-white dark:bg-neutral-900 border rounded shadow-lg"
        >
          <li role="none">
            <button
              role="menuitem"
              onClick={() => handleAction('edit')}
              className="focus-ring-enhanced w-full text-left px-4 py-2"
            >
              Edit
            </button>
          </li>
          <li role="none">
            <button
              role="menuitem"
              onClick={() => handleAction('delete')}
              className="focus-ring-enhanced w-full text-left px-4 py-2 text-red-600"
            >
              Delete
            </button>
          </li>
        </ul>
      )}
    </div>
  );
}
```

---

## Toast/Alert Examples

### Toast Notification

```tsx
import { Alert, Status } from '@/components/a11y';
import { motion, AnimatePresence } from 'framer-motion';

export function Toast({ message, type, onClose }: ToastProps) {
  const Component = type === 'error' ? Alert : Status;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 50 }}
        className="fixed bottom-4 right-4 z-50"
      >
        <Component>
          <div
            role={type === 'error' ? 'alert' : 'status'}
            className={`
              px-4 py-3 rounded-lg shadow-lg
              ${type === 'error' ? 'bg-red-600' : 'bg-green-600'}
              text-white
            `}
          >
            <p>{message}</p>
            <button
              onClick={onClose}
              aria-label="Close notification"
              className="focus-ring-enhanced"
            >
              ✕
            </button>
          </div>
        </Component>
      </motion.div>
    </AnimatePresence>
  );
}
```

---

## Data Table Examples

### Accessible Data Table

```tsx
export function DataTable({ data }: { data: User[] }) {
  return (
    <table aria-label="Users table">
      <caption className="sr-only">List of all users</caption>
      
      <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Email</th>
          <th scope="col">Role</th>
          <th scope="col">
            <span className="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      
      <tbody>
        {data.map((user) => (
          <tr key={user.id}>
            <td>{user.name}</td>
            <td>{user.email}</td>
            <td>{user.role}</td>
            <td>
              <button
                aria-label={`Edit ${user.name}`}
                className="focus-ring-enhanced"
              >
                Edit
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

---

## Search Examples

### Search with Live Results

```tsx
import { useState } from 'react';
import { Status } from '@/components/a11y';
import { announceToScreenReader } from '@/utils/a11y';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (value: string) => {
    setQuery(value);
    setIsSearching(true);

    const data = await search(value);
    setResults(data);
    setIsSearching(false);
    
    announceToScreenReader(
      `${data.length} results found for ${value}`,
      'polite'
    );
  };

  return (
    <div role="search">
      <label htmlFor="search">Search</label>
      <input
        id="search"
        type="search"
        value={query}
        onChange={(e) => handleSearch(e.target.value)}
        aria-busy={isSearching}
        aria-controls="search-results"
        className="focus-ring-enhanced"
      />

      {isSearching && (
        <Status>
          <span>Searching...</span>
        </Status>
      )}

      <ul id="search-results" aria-live="polite" aria-relevant="additions">
        {results.map((result) => (
          <li key={result.id}>{result.title}</li>
        ))}
      </ul>
    </div>
  );
}
```

---

## 🚀 Complete Page Example

```tsx
'use client';

import {
  ShortcutsOverlay,
  SkipLinks,
  SkipLink,
  Alert,
  Status,
} from '@/components/a11y';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';

export default function AccessiblePage() {
  const [showSuccess, setShowSuccess] = useState(false);

  useKeyboardShortcut({
    key: 's',
    meta: true,
    callback: handleSave,
  });

  return (
    <>
      <SkipLinks>
        <SkipLink href="#main">Skip to main content</SkipLink>
        <SkipLink href="#sidebar">Skip to sidebar</SkipLink>
      </SkipLinks>

      <ShortcutsOverlay shortcuts={shortcuts} />

      <div className="flex">
        <aside id="sidebar" aria-label="Sidebar">
          {/* Sidebar content */}
        </aside>

        <main id="main">
          <h1>Dashboard</h1>

          {showSuccess && (
            <Alert>
              <p>Changes saved successfully!</p>
            </Alert>
          )}

          {/* Main content */}
        </main>
      </div>
    </>
  );
}
```

---

**More examples at [Live Showcase](/showcase/accessibility) • NOMA Team**
