# Dark Mode - Complete Guide

## 🌙 Overview

Professional dark mode system inspired by Linear's industry-leading implementation. Features true black for OLED displays, WCAG AA compliant contrast ratios, and smooth theme transitions.

## ✨ Features

### **Color System**
- ✅ True black (#000000) for OLED optimization
- ✅ Layered background system (4 elevation levels)
- ✅ WCAG AA compliant text contrast (21:1, 9.74:1, 4.61:1)
- ✅ Dark-optimized semantic colors
- ✅ Subtle borders and dividers

### **Theme Modes**
- ✅ **Light Mode** - Clean, professional light theme
- ✅ **Dark Mode** - True black with subtle grays
- ✅ **Auto Mode** - Respects system preference

### **Components**
- ✅ All UI components adapted
- ✅ Syntax highlighting for code blocks
- ✅ Smooth 200ms transitions
- ✅ Focus rings and accessibility
- ✅ Glass morphism effects

### **Developer Experience**
- ✅ Simple `useTheme()` hook
- ✅ Tailwind utility classes
- ✅ CSS custom properties
- ✅ No flash of unstyled content
- ✅ LocalStorage persistence

---

## 🚀 Quick Start

### 1. Add Theme Switcher

```tsx
import { ThemeSwitcher } from '@/components/theme';

// Compact dropdown
<ThemeSwitcher variant="compact" />

// Expanded segmented control
<ThemeSwitcher variant="expanded" showLabel />

// Icon-only toggle
<ThemeToggle />
```

### 2. Use Theme Hook

```tsx
import { useTheme } from '@/contexts/ThemeContext';

export function MyComponent() {
  const { mode, resolvedTheme, setTheme, systemTheme } = useTheme();
  
  return (
    <div>
      <p>Current mode: {mode}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <button onClick={() => setTheme('dark')}>Go Dark</button>
    </div>
  );
}
```

### 3. Use Tailwind Classes

```tsx
// Background layers
<div className="surface-0">Deepest layer (true black)</div>
<div className="surface-1">Card background</div>
<div className="surface-2">Elevated surface</div>
<div className="surface-3">Highest elevation</div>

// Text hierarchy
<h1 className="text-primary">High emphasis</h1>
<p className="text-secondary">Medium emphasis</p>
<span className="text-tertiary">Low emphasis</span>

// Borders
<div className="border border-subtle">Barely visible</div>
<div className="border border-default">Standard border</div>
<div className="border border-strong">Emphasized border</div>

// Components
<button className="btn-primary">Primary Button</button>
<div className="card">Standard Card</div>
<input className="input" />
```

---

## 🎨 Color Palette

### Background Layers (Dark Mode)

| Layer | Color | Usage |
|-------|-------|-------|
| Primary | `#000000` | True black - OLED optimized |
| Secondary | `#0D0D0D` | Cards, panels |
| Tertiary | `#1A1A1A` | Elevated surfaces |
| Quaternary | `#262626` | Hover states |

### Text Contrast (WCAG AA)

| Level | Light | Dark | Contrast |
|-------|-------|------|----------|
| Primary | `#111827` | `#FFFFFF` | 21:1 |
| Secondary | `#4B5563` | `#B4B4B4` | 9.74:1 |
| Tertiary | `#9CA3AF` | `#737373` | 4.61:1 |
| Disabled | `#D1D5DB` | `#525252` | 3.16:1 |

### Semantic Colors

```tsx
// Primary
bg-blue-600 dark:bg-blue-500
text-blue-600 dark:text-blue-400

// Success
bg-green-600 dark:bg-green-500
text-green-600 dark:text-green-400

// Warning
bg-amber-600 dark:bg-amber-500
text-amber-600 dark:text-amber-400

// Danger
bg-red-600 dark:bg-red-500
text-red-600 dark:text-red-400
```

---

## 🧩 Component Patterns

### Cards

```tsx
// Standard card
<div className="card rounded-xl p-6 border">
  <h3 className="text-primary">Card Title</h3>
  <p className="text-secondary">Card content</p>
</div>

// Elevated card
<div className="card-elevated rounded-xl p-6 border">
  Content with higher elevation
</div>
```

### Buttons

```tsx
// Primary
<button className="btn-primary px-6 py-2.5 rounded-lg">
  Primary Action
</button>

// Secondary
<button className="btn-secondary px-6 py-2.5 rounded-lg">
  Secondary Action
</button>

// Ghost
<button className="btn-ghost px-6 py-2.5 rounded-lg">
  Tertiary Action
</button>
```

### Inputs

```tsx
<input
  type="text"
  className="input w-full px-4 py-2.5 rounded-lg border focus:ring-2"
  placeholder="Enter text..."
/>

<textarea
  className="input w-full px-4 py-2.5 rounded-lg border focus:ring-2"
  rows={4}
  placeholder="Enter description..."
/>
```

### Modals

```tsx
// Backdrop
<div className="modal-backdrop fixed inset-0" />

// Modal content
<div className="modal-content rounded-xl p-6 border">
  <h2 className="text-xl font-semibold mb-4">Modal Title</h2>
  <p className="text-secondary mb-6">Modal content</p>
  <div className="flex gap-3 justify-end">
    <button className="btn-ghost">Cancel</button>
    <button className="btn-primary">Confirm</button>
  </div>
</div>
```

### Dropdowns

```tsx
<div className="dropdown rounded-lg p-2 border">
  <button className="dropdown-item px-3 py-2 rounded-md w-full text-left">
    Option 1
  </button>
  <button className="dropdown-item-active px-3 py-2 rounded-md w-full text-left">
    Option 2 (Active)
  </button>
  <button className="dropdown-item px-3 py-2 rounded-md w-full text-left">
    Option 3
  </button>
</div>
```

### Navigation

```tsx
// Sidebar
<aside className="sidebar w-64 p-4 border-r">
  <nav className="space-y-1">
    <a href="#" className="nav-item-active px-3 py-2 rounded-lg block">
      Dashboard
    </a>
    <a href="#" className="nav-item px-3 py-2 rounded-lg block">
      Projects
    </a>
  </nav>
</aside>

// Navbar
<header className="navbar sticky top-0 px-6 py-4 border-b">
  <nav className="flex items-center gap-6">
    <a href="#" className="nav-item-active">Home</a>
    <a href="#" className="nav-item">About</a>
  </nav>
</header>
```

### Badges

```tsx
<span className="badge px-3 py-1 rounded-full text-sm border">
  Default
</span>

<span className="badge-primary px-3 py-1 rounded-full text-sm border">
  Primary
</span>

<span className="badge-success px-3 py-1 rounded-full text-sm border">
  Active
</span>

<span className="badge-warning px-3 py-1 rounded-full text-sm border">
  Pending
</span>

<span className="badge-danger px-3 py-1 rounded-full text-sm border">
  Error
</span>
```

---

## 💻 Code Highlighting

### Basic Usage

```tsx
import { CodeBlock, InlineCode } from '@/components/theme';

// Code block with syntax highlighting
<CodeBlock
  language="typescript"
  code={`const greeting = "Hello, World!";
console.log(greeting);`}
/>

// Inline code
<p>Use <InlineCode>useTheme()</InlineCode> hook to access theme.</p>
```

### Advanced Features

```tsx
// With line numbers and highlighting
<CodeBlock
  language="typescript"
  showLineNumbers={true}
  highlight={[2, 5, 6]} // Highlight specific lines
  code={`import { useTheme } from '@/contexts/ThemeContext';

export function Example() {
  const { resolvedTheme } = useTheme();
  
  return <div>Theme: {resolvedTheme}</div>;
}`}
/>
```

---

## 🔧 Advanced Usage

### Custom Theme Detection

```tsx
import { useTheme } from '@/contexts/ThemeContext';

export function AdaptiveComponent() {
  const { resolvedTheme, systemTheme } = useTheme();
  
  // Check if using system theme
  const isUsingSystemTheme = mode === 'auto';
  
  // Get system preference
  const isSystemDark = systemTheme === 'dark';
  
  return (
    <div>
      {resolvedTheme === 'dark' ? (
        <DarkModeComponent />
      ) : (
        <LightModeComponent />
      )}
    </div>
  );
}
```

### Theme-Specific Logic

```tsx
export function ThemedChart() {
  const { resolvedTheme } = useTheme();
  
  const chartColors = resolvedTheme === 'dark' 
    ? ['#3B82F6', '#8B5CF6', '#EC4899'] // Dark mode colors
    : ['#2563EB', '#7C3AED', '#DB2777']; // Light mode colors
  
  return <Chart colors={chartColors} />;
}
```

### Programmatic Theme Change

```tsx
export function WelcomeFlow() {
  const { setTheme } = useTheme();
  
  const onComplete = () => {
    // Set user's preference
    setTheme('dark');
  };
  
  return <OnboardingFlow onComplete={onComplete} />;
}
```

---

## 📱 Mobile Considerations

### Meta Theme Color

The theme color meta tag is automatically updated:

```tsx
// Automatically handled by ThemeProvider
<meta name="theme-color" content="#000000" /> // Dark mode
<meta name="theme-color" content="#FFFFFF" /> // Light mode
```

### PWA Support

```json
// manifest.json
{
  "theme_color": "#000000",
  "background_color": "#000000",
  "display": "standalone"
}
```

---

## ♿ Accessibility

### Focus Rings

```tsx
// Automatic focus ring with proper offset
<button className="focus-ring">
  Accessible Button
</button>

// Manual focus styling
<div className="focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400">
  Custom focus
</div>
```

### Contrast Ratios

All text colors meet WCAG AA standards:
- **Primary text**: 21:1 contrast ratio
- **Secondary text**: 9.74:1 contrast ratio  
- **Tertiary text**: 4.61:1 contrast ratio
- **Disabled text**: 3.16:1 contrast ratio

### Screen Reader Support

```tsx
<ThemeSwitcher 
  variant="compact"
  aria-label="Toggle theme" 
/>
```

---

## 🎯 Best Practices

### ✅ Do's

- Use semantic token classes (`text-primary`, `surface-1`)
- Test in both light and dark modes
- Use `transition-theme` for smooth color changes
- Provide theme switcher in settings/header
- Test contrast ratios with actual content

### ❌ Don'ts

- Don't use hard-coded colors
- Don't forget to test hover/focus states
- Don't use light mode shadows in dark mode
- Don't assume user's theme preference
- Don't use pure white text on dark backgrounds

---

## 🐛 Troubleshooting

### Flash of Unstyled Content (FOUC)

The `suppressHydrationWarning` prop on `<html>` prevents FOUC:

```tsx
<html lang="pt-BR" suppressHydrationWarning>
```

### Theme Not Persisting

Check if localStorage is available:

```tsx
// ThemeProvider automatically handles storage
const saved = localStorage.getItem('noma-theme-mode');
```

### Transition Flicker

Use the `transition-theme` utility:

```tsx
<div className="transition-theme">
  Content with smooth theme transitions
</div>
```

---

## 📚 API Reference

### `useTheme()` Hook

```tsx
interface ThemeContextValue {
  mode: 'light' | 'dark' | 'auto';
  resolvedTheme: 'light' | 'dark';
  setTheme: (mode: ThemeMode) => void;
  systemTheme: 'light' | 'dark';
}
```

### ThemeSwitcher Props

```tsx
interface ThemeSwitcherProps {
  variant?: 'compact' | 'expanded';
  showLabel?: boolean;
}
```

### CodeBlock Props

```tsx
interface CodeBlockProps {
  code: string;
  language?: string;
  showLineNumbers?: boolean;
  highlight?: number[];
}
```

---

## 🎨 Design Tokens

See [`packages/config/dark-theme-tokens.ts`](../../packages/config/dark-theme-tokens.ts) for complete token definitions.

---

## 📦 Files Structure

```
apps/web/src/
├── contexts/
│   └── ThemeContext.tsx          # Theme provider & hook
├── components/
│   └── theme/
│       ├── ThemeSwitcher.tsx     # Theme switcher components
│       ├── CodeBlock.tsx         # Syntax highlighting
│       └── index.ts              # Exports
├── app/
│   ├── globals.css               # Dark mode styles
│   ├── layout.tsx                # Root layout with theme
│   └── showcase/
│       └── dark-mode/
│           └── page.tsx          # Live showcase
└── hooks/
    └── useMobileDetect.ts        # Mobile detection

packages/config/
└── dark-theme-tokens.ts          # Design tokens
```

---

## 🚀 Next Steps

1. Visit [Showcase](/showcase/dark-mode) to see all components
2. Check [Quick Start Guide](./DARK_MODE_QUICKSTART.md)
3. See [Examples](./DARK_MODE_EXAMPLES.md) for real-world usage
4. Read [Migration Guide](./DARK_MODE_MIGRATION.md) for existing projects

---

**Built with ❤️ by NOMA Team**
