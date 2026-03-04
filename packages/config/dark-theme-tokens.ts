/**
 * Dark Mode Design Tokens
 * Based on Linear's industry-leading dark mode
 * Supports true black for OLED and dark gray variants
 */

export const darkThemeTokens = {
  // Base colors - True black for OLED displays
  colors: {
    // Background layers (from deepest to highest)
    background: {
      primary: '#000000',      // True black - OLED optimized
      secondary: '#0D0D0D',    // Subtle lift
      tertiary: '#1A1A1A',     // Cards, elevated surfaces
      quaternary: '#262626',   // Hover states
      overlay: 'rgba(0, 0, 0, 0.8)', // Modals, drawers
    },

    // Alternative backgrounds (dark gray mode)
    backgroundGray: {
      primary: '#0A0A0A',
      secondary: '#141414',
      tertiary: '#1F1F1F',
      quaternary: '#2A2A2A',
      overlay: 'rgba(10, 10, 10, 0.8)',
    },

    // Borders and dividers
    border: {
      subtle: '#1A1A1A',       // Barely visible
      default: '#2C2C2C',      // Standard borders
      strong: '#404040',       // Emphasized borders
      focus: '#3B82F6',        // Focus rings
    },

    // Text hierarchy (WCAG AA compliant)
    text: {
      primary: '#FFFFFF',      // High emphasis - 21:1 contrast
      secondary: '#B4B4B4',    // Medium emphasis - 9.74:1
      tertiary: '#737373',     // Low emphasis - 4.61:1
      disabled: '#525252',     // Disabled state - 3.16:1
      inverse: '#0A0A0A',      // On light backgrounds
    },

    // Interactive colors
    primary: {
      default: '#3B82F6',      // Blue 500
      hover: '#2563EB',        // Blue 600
      active: '#1D4ED8',       // Blue 700
      subtle: 'rgba(59, 130, 246, 0.1)',
      text: '#60A5FA',         // Blue 400 - better contrast on dark
    },

    secondary: {
      default: '#6B7280',      // Gray 500
      hover: '#4B5563',        // Gray 600
      active: '#374151',       // Gray 700
      subtle: 'rgba(107, 114, 128, 0.1)',
    },

    // Semantic colors (dark mode optimized)
    success: {
      default: '#10B981',      // Green 500
      hover: '#059669',        // Green 600
      subtle: 'rgba(16, 185, 129, 0.1)',
      text: '#34D399',         // Green 400
    },

    warning: {
      default: '#F59E0B',      // Amber 500
      hover: '#D97706',        // Amber 600
      subtle: 'rgba(245, 158, 11, 0.1)',
      text: '#FCD34D',         // Amber 300
    },

    danger: {
      default: '#EF4444',      // Red 500
      hover: '#DC2626',        // Red 600
      subtle: 'rgba(239, 68, 68, 0.1)',
      text: '#F87171',         // Red 400
    },

    info: {
      default: '#06B6D4',      // Cyan 500
      hover: '#0891B2',        // Cyan 600
      subtle: 'rgba(6, 182, 212, 0.1)',
      text: '#22D3EE',         // Cyan 400
    },

    // Chart colors (vibrant on dark)
    chart: [
      '#3B82F6', // Blue
      '#8B5CF6', // Violet
      '#EC4899', // Pink
      '#10B981', // Green
      '#F59E0B', // Amber
      '#06B6D4', // Cyan
      '#F97316', // Orange
      '#6366F1', // Indigo
    ],
  },

  // Elevation system (shadows for depth)
  elevation: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
    glow: '0 0 20px rgba(59, 130, 246, 0.3)', // Blue glow for focus
  },

  // Typography (optimized for dark backgrounds)
  typography: {
    fontFamily: {
      sans: 'var(--font-inter, system-ui, -apple-system, sans-serif)',
      mono: 'var(--font-mono, "Fira Code", "Consolas", monospace)',
    },
    fontSize: {
      xs: '0.75rem',     // 12px
      sm: '0.875rem',    // 14px
      base: '1rem',      // 16px
      lg: '1.125rem',    // 18px
      xl: '1.25rem',     // 20px
      '2xl': '1.5rem',   // 24px
      '3xl': '1.875rem', // 30px
      '4xl': '2.25rem',  // 36px
    },
    fontWeight: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },

  // Spacing (consistent with light mode)
  spacing: {
    px: '1px',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    2: '0.5rem',      // 8px
    3: '0.75rem',     // 12px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    8: '2rem',        // 32px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    16: '4rem',       // 64px
  },

  // Border radius
  radius: {
    none: '0',
    sm: '0.25rem',   // 4px
    md: '0.375rem',  // 6px
    lg: '0.5rem',    // 8px
    xl: '0.75rem',   // 12px
    '2xl': '1rem',   // 16px
    full: '9999px',
  },

  // Transitions (smooth theme switching)
  transition: {
    colors: 'background-color 200ms ease-in-out, border-color 200ms ease-in-out, color 200ms ease-in-out',
    all: 'all 200ms ease-in-out',
    fast: 'all 100ms ease-in-out',
    slow: 'all 300ms ease-in-out',
  },

  // Z-index scale
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '2rem',    // 32px
        md: '2.5rem',  // 40px
        lg: '3rem',    // 48px
      },
      padding: {
        sm: '0 0.75rem',
        md: '0 1rem',
        lg: '0 1.5rem',
      },
    },
    input: {
      height: {
        sm: '2rem',
        md: '2.5rem',
        lg: '3rem',
      },
      background: '#0D0D0D',
      border: '#2C2C2C',
      focusBorder: '#3B82F6',
      hover: '#1A1A1A',
    },
    card: {
      background: '#0D0D0D',
      border: '#1A1A1A',
      hover: '#1A1A1A',
    },
    modal: {
      background: '#0D0D0D',
      backdrop: 'rgba(0, 0, 0, 0.8)',
    },
    sidebar: {
      background: '#000000',
      border: '#1A1A1A',
      hover: '#0D0D0D',
    },
    navbar: {
      background: 'rgba(0, 0, 0, 0.8)',
      backdropBlur: 'blur(12px)',
      border: '#1A1A1A',
    },
  },
} as const;

// Light mode tokens for comparison
export const lightThemeTokens = {
  colors: {
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
      quaternary: '#E5E7EB',
      overlay: 'rgba(0, 0, 0, 0.5)',
    },
    border: {
      subtle: '#F3F4F6',
      default: '#E5E7EB',
      strong: '#D1D5DB',
      focus: '#3B82F6',
    },
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      tertiary: '#9CA3AF',
      disabled: '#D1D5DB',
      inverse: '#FFFFFF',
    },
    primary: {
      default: '#3B82F6',
      hover: '#2563EB',
      active: '#1D4ED8',
      subtle: 'rgba(59, 130, 246, 0.1)',
      text: '#1D4ED8',
    },
    // ... rest matches dark mode structure
  },
} as const;

export type ThemeTokens = typeof darkThemeTokens;
export type ThemeMode = 'light' | 'dark' | 'auto';
