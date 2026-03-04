'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ThemeSwitcher, ThemeToggle } from '@/components/common/theme/ThemeSwitcher';
import { CodeBlock, InlineCode } from '@/components/common/theme/CodeBlock';
import { useTheme } from '@/contexts/ThemeContext';

export default function DarkModeShowcase() {
  const { resolvedTheme } = useTheme();

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-theme">
      {/* Header */}
      <div className="navbar sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary">
                Dark Mode Showcase
              </h1>
              <p className="text-sm text-secondary mt-1">
                Linear-inspired dark mode system
              </p>
            </div>
            <ThemeSwitcher variant="expanded" showLabel />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {/* Theme Info */}
        <section className="surface-1 rounded-xl p-8 border border-default">
          <h2 className="text-xl font-semibold mb-4">Current Theme</h2>
          <div className="flex items-center gap-4">
            <div className="px-4 py-2 rounded-lg badge-primary">
              {resolvedTheme === 'dark' ? '🌙 Dark Mode' : '☀️ Light Mode'}
            </div>
            <p className="text-secondary">
              Switch between themes using the controls above
            </p>
          </div>
        </section>

        {/* Color Palette */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Color Palette</h2>
          
          {/* Background Layers */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-secondary">Background Layers</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <ColorSwatch name="Primary" className="surface-0" />
              <ColorSwatch name="Secondary" className="surface-1" />
              <ColorSwatch name="Tertiary" className="surface-2" />
              <ColorSwatch name="Quaternary" className="surface-3" />
            </div>
          </div>

          {/* Text Hierarchy */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-secondary">Text Hierarchy (WCAG AA)</h3>
            <div className="surface-1 rounded-lg p-6 space-y-3 border border-default">
              <p className="text-primary text-xl font-semibold">Primary Text - High Emphasis</p>
              <p className="text-secondary text-lg">Secondary Text - Medium Emphasis</p>
              <p className="text-tertiary">Tertiary Text - Low Emphasis</p>
              <p className="text-gray-500 dark:text-gray-600">Disabled Text</p>
            </div>
          </div>

          {/* Semantic Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-secondary">Semantic Colors</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="surface-1 rounded-lg p-4 border border-default">
                <div className="w-full h-16 rounded-lg bg-blue-500 dark:bg-blue-600 mb-3" />
                <p className="text-sm font-medium">Primary</p>
              </div>
              <div className="surface-1 rounded-lg p-4 border border-default">
                <div className="w-full h-16 rounded-lg bg-green-500 dark:bg-green-600 mb-3" />
                <p className="text-sm font-medium">Success</p>
              </div>
              <div className="surface-1 rounded-lg p-4 border border-default">
                <div className="w-full h-16 rounded-lg bg-amber-500 dark:bg-amber-600 mb-3" />
                <p className="text-sm font-medium">Warning</p>
              </div>
              <div className="surface-1 rounded-lg p-4 border border-default">
                <div className="w-full h-16 rounded-lg bg-red-500 dark:bg-red-600 mb-3" />
                <p className="text-sm font-medium">Danger</p>
              </div>
            </div>
          </div>
        </section>

        {/* Components */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Component Examples</h2>
          
          {/* Buttons */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-secondary">Buttons</h3>
            <div className="flex flex-wrap gap-3">
              <button className="btn-primary px-6 py-2.5 rounded-lg font-medium">
                Primary Button
              </button>
              <button className="btn-secondary px-6 py-2.5 rounded-lg font-medium">
                Secondary Button
              </button>
              <button className="btn-ghost px-6 py-2.5 rounded-lg font-medium">
                Ghost Button
              </button>
              <button className="px-6 py-2.5 rounded-lg font-medium bg-red-600 hover:bg-red-700 text-white">
                Danger Button
              </button>
            </div>
          </div>

          {/* Cards */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-secondary">Cards</h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="card rounded-xl p-6 border">
                <h4 className="text-lg font-semibold mb-2">Standard Card</h4>
                <p className="text-secondary">
                  This is a standard card with default elevation and styling.
                </p>
              </div>
              <div className="card-elevated rounded-xl p-6 border">
                <h4 className="text-lg font-semibold mb-2">Elevated Card</h4>
                <p className="text-secondary">
                  This card has higher elevation with enhanced shadow.
                </p>
              </div>
            </div>
          </div>

          {/* Inputs */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-secondary">Inputs</h3>
            <div className="space-y-4 max-w-md">
              <input
                type="text"
                placeholder="Standard input"
                className="input w-full px-4 py-2.5 rounded-lg border focus:ring-2"
              />
              <input
                type="text"
                value="Focused state"
                className="input w-full px-4 py-2.5 rounded-lg border focus:ring-2"
                readOnly
              />
              <textarea
                placeholder="Textarea input"
                rows={3}
                className="input w-full px-4 py-2.5 rounded-lg border focus:ring-2 resize-none"
              />
            </div>
          </div>

          {/* Badges */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-secondary">Badges</h3>
            <div className="flex flex-wrap gap-2">
              <span className="badge px-3 py-1 rounded-full text-sm border">Default</span>
              <span className="badge-primary px-3 py-1 rounded-full text-sm border">Primary</span>
              <span className="badge-success px-3 py-1 rounded-full text-sm border">Success</span>
              <span className="badge-warning px-3 py-1 rounded-full text-sm border">Warning</span>
              <span className="badge-danger px-3 py-1 rounded-full text-sm border">Danger</span>
            </div>
          </div>

          {/* Dropdown */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4 text-secondary">Dropdown Menu</h3>
            <div className="dropdown rounded-lg p-2 inline-block border">
              <button className="dropdown-item px-3 py-2 rounded-md w-full text-left">
                Menu Item 1
              </button>
              <button className="dropdown-item-active px-3 py-2 rounded-md w-full text-left">
                Active Item
              </button>
              <button className="dropdown-item px-3 py-2 rounded-md w-full text-left">
                Menu Item 3
              </button>
              <div className="divider my-2 border-t" />
              <button className="dropdown-item px-3 py-2 rounded-md w-full text-left text-red-600 dark:text-red-400">
                Delete
              </button>
            </div>
          </div>
        </section>

        {/* Code Highlighting */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Code Syntax Highlighting</h2>
          <div className="space-y-4">
            <div>
              <p className="text-secondary mb-3">
                Dark mode optimized syntax highlighting with <InlineCode>copy</InlineCode> functionality:
              </p>
              <CodeBlock
                language="typescript"
                code={`import { useTheme } from '@/contexts/ThemeContext';

export function MyComponent() {
  const { resolvedTheme, setTheme } = useTheme();
  
  const toggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
  };
  
  return (
    <button onClick={toggleTheme}>
      {resolvedTheme === 'dark' ? '🌙' : '☀️'}
    </button>
  );
}`}
                highlight={[2, 4]}
              />
            </div>
          </div>
        </section>

        {/* Elevation System */}
        <section>
          <h2 className="text-2xl font-bold mb-6">Elevation System</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ y: -4 }}
              className="surface-1 rounded-xl p-6 border border-default shadow-sm"
            >
              <h4 className="font-semibold mb-2">Small Elevation</h4>
              <p className="text-secondary text-sm">Subtle shadow for cards</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="surface-1 rounded-xl p-6 border border-default shadow-md"
            >
              <h4 className="font-semibold mb-2">Medium Elevation</h4>
              <p className="text-secondary text-sm">Dropdown menus</p>
            </motion.div>
            <motion.div
              whileHover={{ y: -4 }}
              className="surface-1 rounded-xl p-6 border border-default shadow-xl"
            >
              <h4 className="font-semibold mb-2">High Elevation</h4>
              <p className="text-secondary text-sm">Modals and dialogs</p>
            </motion.div>
          </div>
        </section>

        {/* Usage Example */}
        <section className="surface-1 rounded-xl p-8 border border-default">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <div className="space-y-4">
            <p className="text-secondary">
              Add the theme switcher to your app:
            </p>
            <CodeBlock
              language="typescript"
              showLineNumbers={false}
              code={`import { ThemeSwitcher } from '@/components/theme/ThemeSwitcher';

<ThemeSwitcher variant="expanded" showLabel />`}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function ColorSwatch({ name, className }: { name: string; className: string }) {
  return (
    <div className={`${className} rounded-lg p-6 border border-default`}>
      <p className="text-sm font-medium">{name}</p>
    </div>
  );
}
