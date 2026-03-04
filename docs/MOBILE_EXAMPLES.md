# 📱 Exemplos Práticos - Mobile Responsive

## Exemplo 1: Lista de Tasks Mobile-First

```tsx
'use client';

import { useState } from 'react';
import {
  MobileBottomNav,
  PullToRefresh,
  SwipeableCard,
  QuickAddTask,
  ResponsiveLayout,
  TouchButton,
} from '@/components/mobile';

interface Task {
  id: string;
  title: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export default function MobileTaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const handleRefresh = async () => {
    const response = await fetch('/api/tasks');
    const data = await response.json();
    setTasks(data);
  };

  const handleDelete = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const handleComplete = (id: string) => {
    setTasks(tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    ));
  };

  const handleAddTask = (task: { title: string; priority: string }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: task.title,
      completed: false,
      priority: task.priority as any,
    };
    setTasks([newTask, ...tasks]);
  };

  const navItems = [
    {
      icon: <HomeIcon />,
      label: 'Home',
      href: '/',
    },
    {
      icon: <TasksIcon />,
      label: 'Tasks',
      href: '/tasks',
    },
    {
      icon: <ProfileIcon />,
      label: 'Perfil',
      href: '/profile',
    },
  ];

  return (
    <ResponsiveLayout mobileFooter={<MobileBottomNav items={navItems} />}>
      <PullToRefresh onRefresh={handleRefresh}>
        <div className="p-4 space-y-4 pb-20">
          <h1 className="text-2xl font-bold">Minhas Tasks</h1>

          <div className="space-y-3">
            {tasks.map(task => (
              <SwipeableCard
                key={task.id}
                onSwipeLeft={() => handleDelete(task.id)}
                onSwipeRight={() => handleComplete(task.id)}
                leftAction={{
                  icon: <TrashIcon />,
                  label: 'Deletar',
                  color: 'bg-red-500',
                }}
                rightAction={{
                  icon: <CheckIcon />,
                  label: 'Completar',
                  color: 'bg-green-500',
                }}
              >
                <div className="p-4 bg-white dark:bg-gray-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => handleComplete(task.id)}
                      className="w-5 h-5"
                    />
                    <div className="flex-1">
                      <h3 className={task.completed ? 'line-through' : ''}>
                        {task.title}
                      </h3>
                      <span className={`text-xs px-2 py-1 rounded ${
                        task.priority === 'high' ? 'bg-red-100 text-red-700' :
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-green-100 text-green-700'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                  </div>
                </div>
              </SwipeableCard>
            ))}
          </div>
        </div>
      </PullToRefresh>

      <QuickAddTask onAdd={handleAddTask} />
    </ResponsiveLayout>
  );
}
```

---

## Exemplo 2: Board Kanban Responsivo

```tsx
'use client';

import { ResponsiveBoardLayout, SwipeableCard, MobileDrawer } from '@/components/mobile';
import { useMobileDetect } from '@/hooks/useMobileDetect';

export function ResponsiveKanban() {
  const { isMobile } = useMobileDetect();
  const [selectedTask, setSelectedTask] = useState(null);

  const columns = [
    { id: 'todo', title: 'To Do', tasks: [...] },
    { id: 'doing', title: 'Doing', tasks: [...] },
    { id: 'done', title: 'Done', tasks: [...] },
  ];

  return (
    <>
      <ResponsiveBoardLayout>
        {columns.map(column => (
          <div
            key={column.id}
            className="min-w-[300px] md:min-w-0 md:flex-1 space-y-3"
          >
            <h2 className="text-lg font-bold px-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              {column.title} ({column.tasks.length})
            </h2>
            
            <div className="space-y-2">
              {column.tasks.map(task => (
                <SwipeableCard
                  key={task.id}
                  onSwipeLeft={() => deleteTask(task.id)}
                  leftAction={{
                    icon: <TrashIcon />,
                    label: 'Deletar',
                    color: 'bg-red-500',
                  }}
                >
                  <div
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border cursor-pointer"
                    onClick={() => setSelectedTask(task)}
                  >
                    <h3 className="font-medium">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                  </div>
                </SwipeableCard>
              ))}
            </div>
          </div>
        ))}
      </ResponsiveBoardLayout>

      <MobileDrawer
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
        title="Detalhes da Task"
        position="bottom"
      >
        {selectedTask && <TaskDetails task={selectedTask} />}
      </MobileDrawer>
    </>
  );
}
```

---

## Exemplo 3: Dashboard com Cards Touch-Friendly

```tsx
'use client';

import { ResponsiveGrid, TouchButton, TouchIconButton } from '@/components/mobile';
import { AnimatedCard } from '@/components/animations';

export function MobileDashboard() {
  return (
    <div className="p-4 space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="flex gap-2">
          <TouchIconButton icon={<FilterIcon />} label="Filtrar" />
          <TouchIconButton icon={<SettingsIcon />} label="Configurações" />
        </div>
      </div>

      {/* Stats Grid */}
      <ResponsiveGrid columns={{ mobile: 2, tablet: 4, desktop: 4 }}>
        {stats.map(stat => (
          <AnimatedCard key={stat.label} hoverable className="p-4">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {stat.label}
            </p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
            <p className={`text-sm mt-1 ${
              stat.trend === 'up' ? 'text-green-600' : 'text-red-600'
            }`}>
              {stat.change}
            </p>
          </AnimatedCard>
        ))}
      </ResponsiveGrid>

      {/* Recent Tasks */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold">Tasks Recentes</h2>
        {recentTasks.map(task => (
          <AnimatedCard key={task.id} hoverable clickable className="p-4">
            <h3 className="font-medium">{task.title}</h3>
            <p className="text-sm text-gray-600 mt-1">{task.project}</p>
          </AnimatedCard>
        ))}
      </div>

      {/* Actions */}
      <div className="fixed bottom-20 left-4 right-4 flex gap-3">
        <TouchButton variant="secondary" fullWidth>
          Ver Relatório
        </TouchButton>
        <TouchButton variant="primary" fullWidth>
          Nova Task
        </TouchButton>
      </div>
    </div>
  );
}
```

---

## Exemplo 4: Menu Lateral Responsivo

```tsx
'use client';

import { useState } from 'react';
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { MobileHamburger, MobileDrawer } from '@/components/mobile';

export function ResponsiveSidebar({ children }: { children: React.ReactNode }) {
  const { isMobile } = useMobileDetect();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const sidebarContent = (
    <nav className="space-y-1 p-4">
      <SidebarLink href="/dashboard" icon={<DashboardIcon />}>
        Dashboard
      </SidebarLink>
      <SidebarLink href="/projects" icon={<ProjectsIcon />}>
        Projetos
      </SidebarLink>
      <SidebarLink href="/tasks" icon={<TasksIcon />}>
        Tasks
      </SidebarLink>
      <SidebarLink href="/team" icon={<TeamIcon />}>
        Equipe
      </SidebarLink>
    </nav>
  );

  if (isMobile) {
    return (
      <>
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b p-4">
          <div className="flex items-center gap-3">
            <MobileHamburger>
              {sidebarContent}
            </MobileHamburger>
            <h1 className="text-xl font-bold">NOMA</h1>
          </div>
        </div>
        <main>{children}</main>
      </>
    );
  }

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r bg-white dark:bg-gray-900">
        {sidebarContent}
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  );
}
```

---

## Exemplo 5: Modal de Task Details

```tsx
'use client';

import { MobileModal, TouchButton } from '@/components/mobile';
import { useMobileDetect } from '@/hooks/useMobileDetect';

export function TaskDetailsModal({ task, isOpen, onClose }: Props) {
  const { isMobile } = useMobileDetect();

  return (
    <MobileModal
      isOpen={isOpen}
      onClose={onClose}
      title={task.title}
      fullScreen={isMobile}
    >
      <div className="space-y-6">
        {/* Description */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Descrição</h3>
          <p>{task.description}</p>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Status</h3>
          <select className="w-full px-4 py-3 rounded-lg border min-h-[48px]">
            <option>To Do</option>
            <option>In Progress</option>
            <option>Done</option>
          </select>
        </div>

        {/* Priority */}
        <div>
          <h3 className="text-sm font-medium text-gray-600 mb-2">Prioridade</h3>
          <div className="grid grid-cols-3 gap-2">
            <TouchButton variant={task.priority === 'low' ? 'primary' : 'secondary'}>
              Baixa
            </TouchButton>
            <TouchButton variant={task.priority === 'medium' ? 'primary' : 'secondary'}>
              Média
            </TouchButton>
            <TouchButton variant={task.priority === 'high' ? 'primary' : 'secondary'}>
              Alta
            </TouchButton>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
          <TouchButton variant="ghost" fullWidth onClick={onClose}>
            Cancelar
          </TouchButton>
          <TouchButton variant="primary" fullWidth>
            Salvar
          </TouchButton>
        </div>
      </div>
    </MobileModal>
  );
}
```

---

## Exemplo 6: Pull to Refresh com Lista

```tsx
'use client';

import { useRef } from 'react';
import { PullToRefresh, SwipeableCard } from '@/components/mobile';

export function RefreshableList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/items');
      const data = await response.json();
      setItems(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PullToRefresh onRefresh={handleRefresh} threshold={100}>
      <div className="p-4 space-y-3">
        {loading && (
          <div className="text-center py-4">
            <div className="animate-spin w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full mx-auto" />
          </div>
        )}
        
        {items.map(item => (
          <SwipeableCard
            key={item.id}
            onSwipeLeft={() => deleteItem(item.id)}
            leftAction={{
              icon: <TrashIcon />,
              label: 'Deletar',
              color: 'bg-red-500',
            }}
          >
            <div className="p-4 bg-white rounded-lg">
              <h3>{item.title}</h3>
            </div>
          </SwipeableCard>
        ))}
      </div>
    </PullToRefresh>
  );
}
```

---

**Mais exemplos na documentação completa!**
