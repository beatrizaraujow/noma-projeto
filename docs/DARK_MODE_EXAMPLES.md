# Dark Mode - Real-World Examples

Practical examples showing how to use dark mode in real components.

## 📋 Example 1: Task Card

```tsx
import { motion } from 'framer-motion';
import { useTheme } from '@/contexts/ThemeContext';

export function TaskCard({ task }) {
  const { resolvedTheme } = useTheme();
  
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="card rounded-lg p-4 border cursor-pointer"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-primary font-semibold">{task.title}</h3>
        <span className={`badge-${task.priority} px-2 py-1 rounded text-xs border`}>
          {task.priority}
        </span>
      </div>
      
      {/* Description */}
      <p className="text-secondary text-sm mb-3 line-clamp-2">
        {task.description}
      </p>
      
      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <img 
            src={task.assignee.avatar} 
            alt={task.assignee.name}
            className="w-6 h-6 rounded-full border-2 border-white dark:border-black"
          />
          <span className="text-tertiary text-sm">{task.assignee.name}</span>
        </div>
        
        <time className="text-tertiary text-xs">
          {task.dueDate}
        </time>
      </div>
    </motion.div>
  );
}
```

## 📊 Example 2: Dashboard Widget

```tsx
import { CodeBlock } from '@/components/theme';

export function MetricsWidget({ title, value, change, trend }) {
  const isPositive = change > 0;
  
  return (
    <div className="card-elevated rounded-xl p-6 border">
      {/* Title */}
      <h4 className="text-secondary text-sm font-medium mb-2">
        {title}
      </h4>
      
      {/* Main value */}
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-primary text-3xl font-bold">
          {value}
        </span>
        
        {/* Change indicator */}
        <span className={`text-sm font-medium ${
          isPositive 
            ? 'text-green-600 dark:text-green-400' 
            : 'text-red-600 dark:text-red-400'
        }`}>
          {isPositive ? '+' : ''}{change}%
        </span>
      </div>
      
      {/* Trend chart (theme-aware colors) */}
      <div className="h-16 flex items-end gap-1">
        {trend.map((value, i) => (
          <div
            key={i}
            className="flex-1 rounded-t bg-blue-500 dark:bg-blue-600 opacity-70 hover:opacity-100 transition-opacity"
            style={{ height: `${value}%` }}
          />
        ))}
      </div>
    </div>
  );
}
```

## 🗂️ Example 3: Modal Dialog

```tsx
import { motion, AnimatePresence } from 'framer-motion';

export function ConfirmDialog({ isOpen, onClose, onConfirm, title, description }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="modal-backdrop fixed inset-0 z-40"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="modal-content max-w-md w-full rounded-xl p-6 border"
            >
              {/* Header */}
              <h2 className="text-primary text-xl font-semibold mb-2">
                {title}
              </h2>
              
              {/* Description */}
              <p className="text-secondary mb-6">
                {description}
              </p>
              
              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button 
                  onClick={onClose}
                  className="btn-ghost px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
                <button 
                  onClick={onConfirm}
                  className="btn-primary px-4 py-2 rounded-lg"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
```

## 🎛️ Example 4: Settings Panel

```tsx
import { ThemeSwitcher } from '@/components/theme';
import { useTheme } from '@/contexts/ThemeContext';

export function SettingsPanel() {
  const { mode } = useTheme();
  
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Appearance Section */}
      <section className="card rounded-xl p-6 border">
        <h3 className="text-primary text-lg font-semibold mb-4">
          Appearance
        </h3>
        
        <div className="space-y-4">
          {/* Theme Setting */}
          <div className="flex items-center justify-between">
            <div>
              <label className="text-primary font-medium block mb-1">
                Theme
              </label>
              <p className="text-secondary text-sm">
                Choose your preferred color scheme
              </p>
            </div>
            <ThemeSwitcher variant="expanded" showLabel />
          </div>
          
          <div className="divider border-t" />
          
          {/* Current Theme Info */}
          <div className="surface-1 rounded-lg p-4 border border-subtle">
            <p className="text-secondary text-sm">
              Current theme: <strong className="text-primary">{mode}</strong>
            </p>
            <p className="text-tertiary text-xs mt-1">
              {mode === 'auto' && 'Automatically matches your system preference'}
              {mode === 'dark' && 'OLED optimized true black theme'}
              {mode === 'light' && 'Clean and professional light theme'}
            </p>
          </div>
        </div>
      </section>
      
      {/* Other settings... */}
    </div>
  );
}
```

## 📱 Example 5: Navigation Sidebar

```tsx
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: '📊' },
  { name: 'Projects', href: '/projects', icon: '📁' },
  { name: 'Tasks', href: '/tasks', icon: '✅' },
  { name: 'Team', href: '/team', icon: '👥' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
];

export function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className="sidebar w-64 p-4 border-r">
      {/* Logo */}
      <div className="mb-8 px-3">
        <h1 className="text-primary text-xl font-bold">NOMA</h1>
      </div>
      
      {/* Navigation */}
      <nav className="space-y-1">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2 rounded-lg 
                transition-colors
                ${isActive 
                  ? 'nav-item-active' 
                  : 'nav-item'
                }
              `}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      {/* Theme Switcher */}
      <div className="mt-8 px-3">
        <ThemeSwitcher variant="compact" showLabel />
      </div>
    </aside>
  );
}
```

## 🔍 Example 6: Search Input

```tsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export function SearchBar() {
  const [query, setQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div className="relative">
      {/* Input */}
      <div className={`
        flex items-center gap-3 px-4 py-2.5 rounded-lg border
        transition-all
        ${isFocused 
          ? 'bg-white dark:bg-[#0D0D0D] border-blue-500 ring-2 ring-blue-500/20' 
          : 'input'
        }
      `}>
        {/* Search Icon */}
        <svg 
          width="20" 
          height="20" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          className="text-tertiary"
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.35-4.35" />
        </svg>
        
        {/* Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder="Search tasks, projects..."
          className="flex-1 bg-transparent outline-none text-primary placeholder:text-tertiary"
        />
        
        {/* Clear Button */}
        <AnimatePresence>
          {query && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={() => setQuery('')}
              className="text-tertiary hover:text-primary transition-colors"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      
      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isFocused && query && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="dropdown absolute top-full left-0 right-0 mt-2 rounded-lg p-2 border max-h-96 overflow-y-auto"
          >
            {/* Results */}
            <div className="dropdown-item px-3 py-2 rounded-md cursor-pointer">
              Result 1
            </div>
            <div className="dropdown-item px-3 py-2 rounded-md cursor-pointer">
              Result 2
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

## 🎨 Example 7: Code Documentation

```tsx
import { CodeBlock, InlineCode } from '@/components/theme';

export function APIDocumentation() {
  return (
    <div className="space-y-6 max-w-4xl">
      {/* Section Header */}
      <div className="card rounded-xl p-6 border">
        <h2 className="text-primary text-2xl font-bold mb-2">
          Authentication
        </h2>
        <p className="text-secondary">
          All API requests require authentication using <InlineCode>Bearer</InlineCode> tokens.
        </p>
      </div>
      
      {/* Code Example */}
      <div>
        <h3 className="text-primary text-lg font-semibold mb-3">
          Example Request
        </h3>
        <CodeBlock
          language="typescript"
          highlight={[4, 5]}
          code={`const response = await fetch('/api/tasks', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN',
    'Content-Type': 'application/json'
  }
});

const tasks = await response.json();`}
        />
      </div>
      
      {/* Response Example */}
      <div>
        <h3 className="text-primary text-lg font-semibold mb-3">
          Response
        </h3>
        <CodeBlock
          language="json"
          code={`{
  "tasks": [
    {
      "id": "1",
      "title": "Implement dark mode",
      "status": "completed"
    }
  ],
  "total": 1
}`}
        />
      </div>
    </div>
  );
}
```

## 🎯 Key Takeaways

1. **Use semantic classes**: `text-primary`, `text-secondary`, `surface-1`
2. **Always add `dark:` variants**: For colors, backgrounds, borders
3. **Test both themes**: Ensure all content is readable
4. **Use theme-aware logic**: Check `resolvedTheme` for conditional rendering
5. **Smooth transitions**: Add `transition-theme` or `transition-colors`

## 🚀 More Examples

Check the [complete showcase](/showcase/dark-mode) to see all components in action.

---

**Need help?** See the [Complete Guide](./DARK_MODE_GUIDE.md) or [Quick Start](./DARK_MODE_QUICKSTART.md).
