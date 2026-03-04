# Dark Mode - 5 Minute Quick Start

Get dark mode up and running in your app in 5 minutes.

## ⚡ Installation (Already Done)

The dark mode system is already configured in NOMA. Just start using it!

## 1️⃣ Add Theme Switcher (30 seconds)

Add to your navbar or settings page:

```tsx
import { ThemeSwitcher } from '@/components/theme';

export function Navbar() {
  return (
    <nav className="flex items-center justify-between p-4">
      <h1>NOMA</h1>
      <ThemeSwitcher variant="compact" />
    </nav>
  );
}
```

## 2️⃣ Use Theme Classes (2 minutes)

Update your components with dark mode classes:

```tsx
// Before
<div className="bg-white text-gray-900">
  <h1 className="text-gray-900">Title</h1>
  <p className="text-gray-600">Content</p>
</div>

// After - Add dark: variants
<div className="bg-white dark:bg-black text-gray-900 dark:text-white">
  <h1 className="text-primary">Title</h1>
  <p className="text-secondary">Content</p>
</div>
```

## 3️⃣ Common Patterns (2 minutes)

### Cards

```tsx
<div className="card rounded-xl p-6 border">
  Your content
</div>
```

### Buttons

```tsx
<button className="btn-primary px-6 py-2.5 rounded-lg">
  Click me
</button>
```

### Inputs

```tsx
<input className="input w-full px-4 py-2.5 rounded-lg border" />
```

### Backgrounds

```tsx
<div className="surface-0">Deepest layer (black)</div>
<div className="surface-1">Cards</div>
<div className="surface-2">Elevated</div>
```

## 4️⃣ Programmatic Control (30 seconds)

```tsx
import { useTheme } from '@/contexts/ThemeContext';

export function MyComponent() {
  const { resolvedTheme, setTheme } = useTheme();
  
  return (
    <button onClick={() => setTheme('dark')}>
      Current: {resolvedTheme}
    </button>
  );
}
```

## ✅ Checklist

- [ ] Add `<ThemeSwitcher />` to navbar
- [ ] Update components with `dark:` variants
- [ ] Use semantic classes (`text-primary`, `surface-1`)
- [ ] Test in both light and dark modes
- [ ] Check contrast ratios for important text

## 🎯 Pre-made Components

All these work in dark mode automatically:

```tsx
import { 
  ThemeSwitcher,    // Theme switcher
  ThemeToggle,      // Icon-only toggle
  CodeBlock,        // Syntax highlighting
  InlineCode,       // Inline code
} from '@/components/theme';
```

## 🚀 Next Steps

1. **See it live**: Visit `/showcase/dark-mode`
2. **Full guide**: Read [Complete Guide](./DARK_MODE_GUIDE.md)
3. **Examples**: Check [Real Examples](./DARK_MODE_EXAMPLES.md)

---

**That's it!** Your app now has professional dark mode. 🌙
