# Dark Mode Integration Guide

Complete examples showing how to integrate dark mode with existing NOMA components.

## 🚀 Animation Components + Dark Mode

### 1. Animated Buttons

```tsx
import { AnimatedButton } from '@/components/animations';

// Buttons automatically work in dark mode
<AnimatedButton variant="primary">
  Primary Action
</AnimatedButton>

<AnimatedButton variant="secondary">
  Secondary Action
</AnimatedButton>

// Custom dark mode colors
<AnimatedButton 
  variant="primary"
  className="bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-600"
>
  Custom Colors
</AnimatedButton>
```

### 2. Animated Cards

```tsx
import { AnimatedCard } from '@/components/animations';
import { useTheme } from '@/contexts/ThemeContext';

export function TaskCard({ task }) {
  const { resolvedTheme } = useTheme();
  
  return (
    <AnimatedCard
      className="card border"
      onClick={() => handleClick(task)}
    >
      <div className="p-6">
        <h3 className="text-primary font-semibold mb-2">
          {task.title}
        </h3>
        <p className="text-secondary text-sm">
          {task.description}
        </p>
      </div>
    </AnimatedCard>
  );
}
```

### 3. Success Animations

```tsx
import { SuccessCheckmark, SuccessToast } from '@/components/animations';

// Checkmark adapts to theme automatically
<SuccessCheckmark />

// Toast with dark mode styling
<SuccessToast
  message="Task completed!"
  onClose={() => setShowToast(false)}
  className="bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-[#2C2C2C]"
/>
```

### 4. Skeleton Loaders

```tsx
import { SkeletonCard, SkeletonList } from '@/components/animations';

// Skeletons automatically use correct colors
<div className="space-y-4">
  <SkeletonCard />
  <SkeletonList count={3} />
</div>

// Custom skeleton styling
<div className="animate-pulse">
  <div className="h-4 bg-gray-200 dark:bg-[#1A1A1A] rounded" />
</div>
```

---

## 📱 Mobile Components + Dark Mode

### 1. Bottom Navigation

```tsx
import { MobileBottomNav } from '@/components/mobile';
import { ThemeToggle } from '@/components/theme';

const tabs = [
  { id: 'home', label: 'Home', icon: '🏠' },
  { id: 'tasks', label: 'Tasks', icon: '✅' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
];

<MobileBottomNav 
  tabs={tabs}
  activeTab="home"
  onTabChange={setActiveTab}
  className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200 dark:border-[#1A1A1A]"
/>
```

### 2. Mobile Drawer

```tsx
import { MobileDrawer } from '@/components/mobile';
import { ThemeSwitcher } from '@/components/theme';

export function SettingsDrawer({ isOpen, onClose }) {
  return (
    <MobileDrawer
      isOpen={isOpen}
      onClose={onClose}
      position="right"
      className="bg-white dark:bg-[#000000] border-l border-gray-200 dark:border-[#1A1A1A]"
    >
      <div className="p-6">
        <h2 className="text-primary text-xl font-semibold mb-6">
          Settings
        </h2>
        
        {/* Theme Setting */}
        <div className="mb-6">
          <label className="text-primary font-medium block mb-3">
            Appearance
          </label>
          <ThemeSwitcher variant="expanded" showLabel />
        </div>
        
        {/* Other settings */}
      </div>
    </MobileDrawer>
  );
}
```

### 3. Swipeable Cards

```tsx
import { SwipeableCard } from '@/components/mobile';
import { useTheme } from '@/contexts/ThemeContext';

export function TaskList({ tasks }) {
  const { resolvedTheme } = useTheme();
  
  return (
    <div className="space-y-2">
      {tasks.map(task => (
        <SwipeableCard
          key={task.id}
          onSwipeLeft={() => handleDelete(task.id)}
          onSwipeRight={() => handleComplete(task.id)}
          leftContent={
            <div className="flex items-center justify-center h-full bg-green-500 dark:bg-green-600 text-white px-6">
              ✓ Complete
            </div>
          }
          rightContent={
            <div className="flex items-center justify-center h-full bg-red-500 dark:bg-red-600 text-white px-6">
              🗑️ Delete
            </div>
          }
          className="card border"
        >
          <div className="p-4">
            <h3 className="text-primary font-medium">{task.title}</h3>
            <p className="text-secondary text-sm mt-1">{task.status}</p>
          </div>
        </SwipeableCard>
      ))}
    </div>
  );
}
```

### 4. Pull to Refresh

```tsx
import { PullToRefresh } from '@/components/mobile';

export function TasksView() {
  const refreshData = async () => {
    await fetchTasks();
  };
  
  return (
    <PullToRefresh 
      onRefresh={refreshData}
      className="min-h-screen bg-white dark:bg-black"
    >
      <div className="p-6">
        {/* Content */}
      </div>
    </PullToRefresh>
  );
}
```

### 5. Floating Action Button

```tsx
import { FAB } from '@/components/mobile';
import { useTheme } from '@/contexts/ThemeContext';

export function QuickActions() {
  const { resolvedTheme } = useTheme();
  
  return (
    <FAB
      icon="+"
      onClick={handleAddTask}
      position="bottom-right"
      className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white shadow-lg dark:shadow-xl"
    />
  );
}
```

---

## 🎨 Full Page Examples

### 1. Dashboard with Dark Mode

```tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { ThemeSwitcher } from '@/components/theme';
import { AnimatedCard } from '@/components/animations';
import { useMobileDetect } from '@/hooks/useMobileDetect';

export default function Dashboard() {
  const { resolvedTheme } = useTheme();
  const { isMobile } = useMobileDetect();
  
  return (
    <div className="min-h-screen bg-white dark:bg-black transition-theme">
      {/* Header */}
      <header className="navbar sticky top-0 z-50 px-6 py-4 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-primary text-2xl font-bold">Dashboard</h1>
          <ThemeSwitcher variant={isMobile ? 'compact' : 'expanded'} showLabel={!isMobile} />
        </div>
      </header>
      
      {/* Content */}
      <main className="max-w-7xl mx-auto p-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <AnimatedCard className="card-elevated border">
            <div className="p-6">
              <h3 className="text-secondary text-sm font-medium mb-2">
                Total Tasks
              </h3>
              <p className="text-primary text-3xl font-bold">48</p>
              <p className="text-green-600 dark:text-green-400 text-sm mt-2">
                +12% from last week
              </p>
            </div>
          </AnimatedCard>
          
          <AnimatedCard className="card-elevated border">
            <div className="p-6">
              <h3 className="text-secondary text-sm font-medium mb-2">
                Completed
              </h3>
              <p className="text-primary text-3xl font-bold">32</p>
              <p className="text-blue-600 dark:text-blue-400 text-sm mt-2">
                67% completion rate
              </p>
            </div>
          </AnimatedCard>
          
          <AnimatedCard className="card-elevated border">
            <div className="p-6">
              <h3 className="text-secondary text-sm font-medium mb-2">
                In Progress
              </h3>
              <p className="text-primary text-3xl font-bold">16</p>
              <p className="text-amber-600 dark:text-amber-400 text-sm mt-2">
                3 due today
              </p>
            </div>
          </AnimatedCard>
        </div>
        
        {/* Recent Tasks */}
        <section className="card rounded-xl border p-6">
          <h2 className="text-primary text-xl font-semibold mb-4">
            Recent Tasks
          </h2>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div 
                key={i}
                className="surface-1 rounded-lg p-4 border border-default hover:border-strong transition-colors"
              >
                <h3 className="text-primary font-medium mb-1">
                  Task {i}
                </h3>
                <p className="text-secondary text-sm">
                  Description for task {i}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
```

### 2. Mobile Task List

```tsx
'use client';

import { useState } from 'react';
import { MobileBottomNav, SwipeableCard, PullToRefresh, FAB } from '@/components/mobile';
import { ThemeToggle } from '@/components/theme';
import { SuccessToast } from '@/components/animations';

export default function MobileTasks() {
  const [tasks, setTasks] = useState([...]);
  const [showSuccess, setShowSuccess] = useState(false);
  
  const handleComplete = async (taskId: string) => {
    // Complete task
    setShowSuccess(true);
  };
  
  const handleRefresh = async () => {
    // Refresh tasks
  };
  
  return (
    <div className="min-h-screen bg-white dark:bg-black pb-20">
      {/* Header */}
      <header className="navbar sticky top-0 z-50 px-4 py-3 border-b">
        <div className="flex items-center justify-between">
          <h1 className="text-primary text-lg font-bold">Tasks</h1>
          <ThemeToggle />
        </div>
      </header>
      
      {/* Content with Pull to Refresh */}
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 space-y-3">
          {tasks.map(task => (
            <SwipeableCard
              key={task.id}
              onSwipeLeft={() => handleDelete(task.id)}
              onSwipeRight={() => handleComplete(task.id)}
              leftContent={
                <div className="flex items-center justify-center h-full bg-green-500 dark:bg-green-600 text-white px-6">
                  ✓
                </div>
              }
              rightContent={
                <div className="flex items-center justify-center h-full bg-red-500 dark:bg-red-600 text-white px-6">
                  🗑️
                </div>
              }
              className="card border"
            >
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-primary font-medium flex-1">
                    {task.title}
                  </h3>
                  <span className={`badge-${task.priority} px-2 py-1 rounded-full text-xs border`}>
                    {task.priority}
                  </span>
                </div>
                <p className="text-secondary text-sm">
                  {task.description}
                </p>
              </div>
            </SwipeableCard>
          ))}
        </div>
      </PullToRefresh>
      
      {/* FAB */}
      <FAB
        icon="+"
        onClick={() => setShowQuickAdd(true)}
        position="bottom-right"
        className="bg-blue-600 dark:bg-blue-500 text-white shadow-lg dark:shadow-xl"
      />
      
      {/* Bottom Navigation */}
      <MobileBottomNav
        tabs={[
          { id: 'tasks', label: 'Tasks', icon: '✅' },
          { id: 'projects', label: 'Projects', icon: '📁' },
          { id: 'settings', label: 'Settings', icon: '⚙️' },
        ]}
        activeTab="tasks"
        onTabChange={setActiveTab}
        className="bg-white/80 dark:bg-black/80 backdrop-blur-lg border-t border-gray-200 dark:border-[#1A1A1A]"
      />
      
      {/* Success Toast */}
      {showSuccess && (
        <SuccessToast
          message="Task completed!"
          onClose={() => setShowSuccess(false)}
          className="bg-white dark:bg-[#0D0D0D] border border-gray-200 dark:border-[#2C2C2C text-primary"
        />
      )}
    </div>
  );
}
```

---

## 🎯 Best Practices

### 1. Consistent Theme Classes

Always use semantic classes for consistency:

```tsx
// ✅ Good - Semantic classes
<div className="text-primary">High emphasis</div>
<div className="text-secondary">Medium emphasis</div>
<div className="surface-1">Card background</div>

// ❌ Bad - Hard-coded colors
<div className="text-black dark:text-white">Text</div>
<div className="bg-gray-100 dark:bg-gray-900">Background</div>
```

### 2. Component Composition

Combine animation, mobile, and dark mode features:

```tsx
import { AnimatedCard } from '@/components/animations';
import { SwipeableCard } from '@/components/mobile';
import { useMobileDetect } from '@/hooks/useMobileDetect';

export function AdaptiveTaskCard({ task }) {
  const { isMobile } = useMobileDetect();
  
  if (isMobile) {
    return (
      <SwipeableCard
        onSwipeLeft={() => handleDelete(task.id)}
        className="card border"
      >
        <TaskCardContent task={task} />
      </SwipeableCard>
    );
  }
  
  return (
    <AnimatedCard className="card border">
      <TaskCardContent task={task} />
    </AnimatedCard>
  );
}
```

### 3. Theme-Aware Logic

Use theme context for conditional rendering or styling:

```tsx
import { useTheme } from '@/contexts/ThemeContext';

export function Chart({ data }) {
  const { resolvedTheme } = useTheme();
  
  const chartConfig = {
    colors: resolvedTheme === 'dark' 
      ? ['#3B82F6', '#8B5CF6', '#EC4899']  // Dark mode colors
      : ['#2563EB', '#7C3AED', '#DB2777'], // Light mode colors
    grid: resolvedTheme === 'dark' ? '#1A1A1A' : '#E5E7EB',
    text: resolvedTheme === 'dark' ? '#B4B4B4' : '#4B5563',
  };
  
  return <ChartComponent data={data} config={chartConfig} />;
}
```

### 4. Mobile + Dark Mode

Optimize for mobile dark mode:

```tsx
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { useTheme } from '@/contexts/ThemeContext';

export function AdaptiveHeader() {
  const { isMobile } = useMobileDetect();
  const { resolvedTheme } = useTheme();
  
  return (
    <header className={`
      sticky top-0 z-50
      ${isMobile 
        ? 'navbar px-4 py-3' 
        : 'navbar px-6 py-4'
      }
      ${resolvedTheme === 'dark' 
        ? 'bg-black/80' 
        : 'bg-white/80'
      }
      backdrop-blur-lg border-b
    `}>
      {/* Content */}
    </header>
  );
}
```

---

## 🚀 Complete Integration Example

Here's a full example combining all systems:

```tsx
'use client';

import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { ThemeSwitcher } from '@/components/theme';
import { AnimatedButton, PageTransition, SuccessAnimation } from '@/components/animations';
import { MobileBottomNav, SwipeableCard, FAB } from '@/components/mobile';

export default function IntegratedApp() {
  const { resolvedTheme } = useTheme();
  const { isMobile } = useMobileDetect();
  const [showSuccess, setShowSuccess] = useState(false);
  
  return (
    <PageTransition>
      <div className="min-h-screen bg-white dark:bg-black transition-theme">
        {/* Adaptive Header */}
        <header className="navbar sticky top-0 z-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <h1 className="text-primary text-2xl font-bold">NOMA</h1>
            <div className="flex items-center gap-4">
              <ThemeSwitcher 
                variant={isMobile ? 'compact' : 'expanded'} 
                showLabel={!isMobile} 
              />
            </div>
          </div>
        </header>
        
        {/* Main Content */}
        <main className="max-w-7xl mx-auto p-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Cards adapt to mobile with swipe and desktop with hover */}
            {isMobile ? (
              <SwipeableCard
                onSwipeRight={() => handleComplete()}
                className="card border"
              >
                <CardContent />
              </SwipeableCard>
            ) : (
              <AnimatedCard className="card border">
                <CardContent />
              </AnimatedCard>
            )}
          </div>
          
          {/* Action Button */}
          {isMobile ? (
            <FAB
              icon="+"
              onClick={() => handleAdd()}
              className="bg-blue-600 dark:bg-blue-500 text-white"
            />
          ) : (
            <AnimatedButton
              variant="primary"
              size="lg"
              onClick={() => handleAdd()}
              className="fixed bottom-6 right-6"
            >
              Add New
            </AnimatedButton>
          )}
        </main>
        
        {/* Mobile Navigation */}
        {isMobile && (
          <MobileBottomNav
            tabs={tabs}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            className="bg-white/80 dark:bg-black/80 backdrop-blur-lg"
          />
        )}
        
        {/* Success Animation */}
        {showSuccess && (
          <SuccessAnimation onComplete={() => setShowSuccess(false)} />
        )}
      </div>
    </PageTransition>
  );
}
```

---

## 📚 More Resources

- **[Dark Mode Guide](./DARK_MODE_GUIDE.md)** - Complete API reference
- **[Animation Guide](./MICRO_INTERACTIONS.md)** - Animation system
- **[Mobile Guide](./MOBILE_RESPONSIVE_GUIDE.md)** - Mobile components
- **[Design System](./DESIGN_SYSTEM.md)** - Full design system

---

**All systems work together seamlessly!** 🚀
