# 🎨 Guia Completo - Mobile Responsive

## ✅ Implementação Completa

Todos os componentes mobile-first foram implementados com Framer Motion e React hooks.

---

## 📦 Componentes Criados

### 1. ✅ Mobile Navigation

#### MobileBottomNav
Bottom tabs com animações e indicador ativo.

```tsx
import { MobileBottomNav } from '@/components/mobile';

const navItems = [
  { icon: <HomeIcon />, label: 'Home', href: '/' },
  { icon: <TasksIcon />, label: 'Tasks', href: '/tasks' },
  { icon: <ProfileIcon />, label: 'Perfil', href: '/profile' },
];

<MobileBottomNav items={navItems} />
```

#### MobileHamburger
Menu hamburger com drawer lateral.

```tsx
import { MobileHamburger } from '@/components/mobile';

<MobileHamburger>
  <nav>
    <a href="/dashboard">Dashboard</a>
    <a href="/projects">Projetos</a>
  </nav>
</MobileHamburger>
```

---

### 2. ✅ Touch-Optimized Components

#### TouchButton
Botões com tap targets maiores (min 44px).

```tsx
import { TouchButton, TouchIconButton } from '@/components/mobile';

<TouchButton variant="primary" size="lg" fullWidth>
  Salvar
</TouchButton>

<TouchIconButton icon={<BellIcon />} label="Notificações" />
```

**Features:**
- Tap targets aumentados automaticamente em touch devices
- Feedback visual ao toque (scale 0.95)
- Touch-action otimizado

---

### 3. ✅ Swipe Gestures

#### SwipeableCard
Cards com gestos de swipe para ações.

```tsx
import { SwipeableCard } from '@/components/mobile';

<SwipeableCard
  onSwipeLeft={() => deleteTask(id)}
  leftAction={{
    icon: <TrashIcon />,
    label: 'Deletar',
    color: 'bg-red-500',
  }}
>
  <TaskCard {...task} />
</SwipeableCard>
```

---

### 4. ✅ Pull to Refresh

```tsx
import { PullToRefresh } from '@/components/mobile';

<PullToRefresh onRefresh={async () => await loadData()}>
  <YourContent />
</PullToRefresh>
```

**Features:**
- Indicador visual com spinner
- Threshold configurável
- Resistência ao arrasto

---

### 5. ✅ Responsive Layouts

#### ResponsiveLayout
Layout adaptativo com sidebar→drawer no mobile.

```tsx
import { ResponsiveLayout } from '@/components/mobile';

<ResponsiveLayout
  sidebar={<Sidebar />}
  mobileFooter={<MobileBottomNav items={navItems} />}
>
  <MainContent />
</ResponsiveLayout>
```

#### ResponsiveBoardLayout
Board com scroll horizontal→vertical.

```tsx
import { ResponsiveBoardLayout } from '@/components/mobile';

<ResponsiveBoardLayout>
  <Column title="Todo" />
  <Column title="Doing" />
  <Column title="Done" />
</ResponsiveBoardLayout>
```

**Desktop:** Horizontal scroll
**Mobile:** Vertical stack

#### ResponsiveGrid
Grid adaptativo por breakpoint.

```tsx
import { ResponsiveGrid } from '@/components/mobile';

<ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }}>
  {cards.map(card => <Card key={card.id} {...card} />)}
</ResponsiveGrid>
```

---

### 6. ✅ Mobile Drawers & Modals

#### MobileDrawer
Drawer lateral/inferior.

```tsx
import { MobileDrawer } from '@/components/mobile';

<MobileDrawer
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Menu"
  position="right" // ou 'left', 'bottom'
>
  <MenuContent />
</MobileDrawer>
```

#### MobileModal
Modal responsivo (fullscreen no mobile).

```tsx
import { MobileModal } from '@/components/mobile';

<MobileModal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Detalhes"
  fullScreen={true} // auto no mobile
>
  <TaskDetails />
</MobileModal>
```

---

### 7. ✅ FAB (Floating Action Button)

```tsx
import { FAB } from '@/components/mobile';

<FAB
  icon={<PlusIcon />}
  onClick={handleQuickAdd}
  label="Nova Task"
  position="bottom-right"
/>
```

**Positions:** bottom-right, bottom-left, bottom-center

---

### 8. ✅ Quick Add Task

Componente completo para adicionar tasks rapidamente.

```tsx
import { QuickAddTask } from '@/components/mobile';

<QuickAddTask
  onAdd={(task) => {
    console.log('Nova task:', task);
  }}
/>
```

---

## 🎣 Hooks Customizados

### useMobileDetect
Detecta tipo de dispositivo e breakpoint.

```tsx
import { useMobileDetect } from '@/hooks/useMobileDetect';

const { isMobile, isTablet, isDesktop, isTouchDevice, screenSize } = useMobileDetect();
```

**Returns:**
- `isMobile`: boolean (< 768px)
- `isTablet`: boolean (768-1024px)
- `isDesktop`: boolean (>= 1024px)
- `isTouchDevice`: boolean
- `screenSize`: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'

---

### useSwipeGesture
Hook para gestos de swipe.

```tsx
import { useSwipeGesture } from '@/hooks/useSwipeGesture';

const swipeProps = useSwipeGesture({
  onSwipeLeft: () => console.log('Swipe left'),
  onSwipeRight: () => console.log('Swipe right'),
  threshold: 50,
});

<motion.div {...swipeProps}>Swipeable content</motion.div>
```

---

### usePullToRefresh
Hook para pull-to-refresh.

```tsx
import { usePullToRefresh } from '@/hooks/usePullToRefresh';

const ref = useRef(null);
const { isRefreshing, pullDistance } = usePullToRefresh(ref, {
  onRefresh: async () => await loadData(),
  threshold: 80,
});
```

---

## 🎯 Padrões de Uso

### Página Completa Mobile-First

```tsx
'use client';

import { 
  ResponsiveLayout,
  MobileBottomNav,
  FAB,
  PullToRefresh,
  QuickAddTask
} from '@/components/mobile';

export default function TasksPage() {
  const navItems = [
    { icon: <HomeIcon />, label: 'Home', href: '/' },
    { icon: <TasksIcon />, label: 'Tasks', href: '/tasks' },
  ];

  return (
    <ResponsiveLayout mobileFooter={<MobileBottomNav items={navItems} />}>
      <PullToRefresh onRefresh={loadTasks}>
        <div className="p-4 space-y-4 pb-20">
          <h1 className="text-2xl font-bold">Minhas Tasks</h1>
          {tasks.map(task => (
            <SwipeableCard
              key={task.id}
              onSwipeLeft={() => deleteTask(task.id)}
              leftAction={{
                icon: <TrashIcon />,
                label: 'Deletar',
                color: 'bg-red-500',
              }}
            >
              <TaskCard {...task} />
            </SwipeableCard>
          ))}
        </div>
      </PullToRefresh>
      
      <QuickAddTask onAdd={addTask} />
    </ResponsiveLayout>
  );
}
```

---

### Board Responsivo

```tsx
import { ResponsiveBoardLayout } from '@/components/mobile';

export function KanbanBoard() {
  return (
    <ResponsiveBoardLayout>
      {columns.map(column => (
        <div key={column.id} className="min-w-[300px] lg:min-w-0 lg:flex-1">
          <h2>{column.title}</h2>
          {column.tasks.map(task => (
            <TaskCard key={task.id} {...task} />
          ))}
        </div>
      ))}
    </ResponsiveBoardLayout>
  );
}
```

---

### Sidebar → Drawer

```tsx
import { useMobileDetect } from '@/hooks/useMobileDetect';
import { MobileDrawer } from '@/components/mobile';

export function Layout() {
  const { isMobile } = useMobileDetect();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const sidebarContent = <Sidebar />;

  if (isMobile) {
    return (
      <>
        <button onClick={() => setDrawerOpen(true)}>Menu</button>
        <MobileDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)}>
          {sidebarContent}
        </MobileDrawer>
      </>
    );
  }

  return (
    <div className="flex">
      <aside className="w-64">{sidebarContent}</aside>
      <main className="flex-1">...</main>
    </div>
  );
}
```

---

## 📱 Breakpoints (Tailwind)

```css
xs: < 640px   - Small phones
sm: 640px     - Large phones
md: 768px     - Tablets
lg: 1024px    - Small laptops
xl: 1280px    - Desktops
2xl: 1536px   - Large screens
```

---

## ⚙️ Configuração CSS

Adicione ao seu `globals.css`:

```css
/* Safe areas para notch/dynamic island */
.safe-area-top {
  padding-top: env(safe-area-inset-top);
}

.safe-area-bottom {
  padding-bottom: env(safe-area-inset-bottom);
}

.pb-safe {
  padding-bottom: calc(1rem + env(safe-area-inset-bottom));
}

/* Previne bounce em iOS */
body {
  overscroll-behavior-y: none;
}

/* Melhora touch */
* {
  -webkit-tap-highlight-color: transparent;
}
```

---

## 🎨 Boas Práticas Mobile

### 1. Tap Targets
✅ Mínimo 44x44px para elementos tocáveis
✅ Use `TouchButton` e `TouchIconButton`

### 2. Touch Gestures
✅ Swipe para deletar
✅ Pull to refresh
✅ Drag to reorder

### 3. Performance
✅ Use `will-change` com moderação
✅ Evite animações complexas em scroll
✅ Otimize imagens para mobile

### 4. Layout
✅ Mobile-first CSS
✅ Responsive grid/flexbox
✅ Evite horizontal scroll (exceto intencionalmente)

### 5. Navegação
✅ Bottom tabs no mobile
✅ Burger menu para secundário
✅ FAB para ação principal

---

## 📊 Checklist de Implementação

### Básico
- [ ] Testar em dispositivo móvel real
- [ ] Adicionar `MobileBottomNav`
- [ ] Converter modals para fullscreen no mobile
- [ ] Aumentar tap targets

### Intermediário
- [ ] Implementar pull-to-refresh
- [ ] Adicionar swipe gestures em cards
- [ ] FAB para quick actions
- [ ] Drawer para sidebar

### Avançado
- [ ] Board responsive (horizontal → vertical)
- [ ] Gestos customizados
- [ ] Haptic feedback
- [ ] PWA features

---

## 🚀 Ver Showcase

```bash
npm run dev
# Acesse: http://localhost:3000/showcase/mobile
```

---

## 📁 Estrutura de Arquivos

```
apps/web/src/
├── hooks/
│   ├── useMobileDetect.ts       # Detecta mobile/tablet/desktop
│   ├── useSwipeGesture.ts       # Hook para swipes
│   └── usePullToRefresh.ts      # Hook para pull-to-refresh
├── components/mobile/
│   ├── MobileBottomNav.tsx      # Bottom tabs
│   ├── MobileHamburger.tsx      # Burger menu
│   ├── SwipeableCard.tsx        # Cards com swipe
│   ├── PullToRefresh.tsx        # Pull to refresh
│   ├── FAB.tsx                  # Floating action button
│   ├── MobileDrawer.tsx         # Drawer lateral/inferior
│   ├── MobileModal.tsx          # Modal responsivo
│   ├── TouchOptimized.tsx       # Botões touch-friendly
│   ├── ResponsiveLayout.tsx     # Layouts adaptativos
│   ├── QuickAddTask.tsx         # Quick add component
│   └── index.ts                 # Exports
└── app/showcase/mobile/
    └── page.tsx                 # Showcase page
```

---

**✅ Tudo implementado e pronto para uso!**
