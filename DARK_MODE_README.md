# 🌙 NOMA Dark Mode

Professional dark mode system with true black (#000000) for OLED displays, WCAG AA compliant contrast, and smooth transitions.

## ✨ Features

- ✅ **True Black OLED** - Optimized for modern displays
- ✅ **Auto/Light/Dark** - Respects system preference
- ✅ **WCAG AA Compliant** - All text meets accessibility standards
- ✅ **Smooth Transitions** - 200ms GPU-accelerated animations
- ✅ **All Components Adapted** - Every UI element works in dark mode
- ✅ **Syntax Highlighting** - Dark-optimized code blocks
- ✅ **No FOUC** - Zero flash of unstyled content
- ✅ **Mobile Optimized** - Updates meta theme-color automatically

## 🚀 Quick Start

### Add Theme Switcher

```tsx
import { ThemeSwitcher } from '@/components/theme';

<ThemeSwitcher variant="compact" />
```

### Use Theme Hook

```tsx
import { useTheme } from '@/contexts/ThemeContext';

const { resolvedTheme, setTheme } = useTheme();
```

### Style Components

```tsx
<div className="bg-white dark:bg-black text-gray-900 dark:text-white">
  <h1 className="text-primary">High Emphasis</h1>
  <p className="text-secondary">Medium Emphasis</p>
</div>
```

## 🎨 Color System

### Backgrounds (Dark Mode)
- `surface-0`: #000000 (true black)
- `surface-1`: #0D0D0D (cards)
- `surface-2`: #1A1A1A (elevated)
- `surface-3`: #262626 (hover)

### Text (WCAG AA)
- `text-primary`: #FFFFFF (21:1 contrast)
- `text-secondary`: #B4B4B4 (9.74:1)
- `text-tertiary`: #737373 (4.61:1)

## 📦 Components

All components work automatically in dark mode:

```tsx
// Cards
<div className="card rounded-xl p-6 border">Content</div>

// Buttons
<button className="btn-primary">Primary</button>
<button className="btn-secondary">Secondary</button>

// Inputs
<input className="input" placeholder="Search..." />

// Code
<CodeBlock language="typescript" code={code} />
```

## 📚 Documentation

- **[Complete Guide](./docs/DARK_MODE_GUIDE.md)** - Full API reference
- **[Quick Start](./docs/DARK_MODE_QUICKSTART.md)** - 5-minute setup
- **[Examples](./docs/DARK_MODE_EXAMPLES.md)** - 7 real-world examples
- **[Summary](./docs/DARK_MODE_SUMMARY.md)** - Implementation overview

## 🎯 Live Showcase

Visit [/showcase/dark-mode](/showcase/dark-mode) to see all components in action.

## 🏆 Highlights

- **Design**: Inspired by Linear's best-in-class dark mode
- **Accessibility**: WCAG AA compliant contrast ratios
- **Performance**: CSS-only transitions, zero JS overhead
- **DX**: Simple API, zero config, full TypeScript support

---

**Status**: ✅ Production Ready

**Built with ❤️ by NOMA Team**
