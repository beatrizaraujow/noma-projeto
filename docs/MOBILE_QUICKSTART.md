# 📱 Mobile Responsive - Quick Start

## 🚀 5 Minutos para Mobile-First

### 1. Ver Showcase
```bash
npm run dev
# Acesse: http://localhost:3000/showcase/mobile
```
Teste no Chrome DevTools (F12 → Toggle Device Toolbar)

---

### 2. Detectar Mobile
```tsx
import { useMobileDetect } from '@/hooks/useMobileDetect';

const { isMobile, isTablet, isTouchDevice } = useMobileDetect();

if (isMobile) {
  return <MobileView />;
}
return <DesktopView />;
```

---

### 3. Bottom Navigation
```tsx
import { MobileBottomNav } from '@/components/mobile';

const navItems = [
  { icon: <HomeIcon />, label: 'Home', href: '/' },
  { icon: <TasksIcon />, label: 'Tasks', href: '/tasks' },
];

<MobileBottomNav items={navItems} />
```

---

### 4. Swipeable Cards
```tsx
import { SwipeableCard } from '@/components/mobile';

<SwipeableCard
  onSwipeLeft={() => deleteTask()}
  leftAction={{
    icon: <TrashIcon />,
    label: 'Deletar',
    color: 'bg-red-500',
  }}
>
  <TaskCard />
</SwipeableCard>
```

---

### 5. Quick Add (FAB)
```tsx
import { QuickAddTask } from '@/components/mobile';

<QuickAddTask onAdd={(task) => addTask(task)} />
```

---

## 🎯 Checklist Rápida

### Mobile Navigation
- [ ] Adicionar `MobileBottomNav` (3-5 tabs principais)
- [ ] Usar `MobileHamburger` para menu secundário
- [ ] Testar navegação no mobile

### Touch Optimization
- [ ] Substituir `<button>` por `<TouchButton>`
- [ ] Usar `min-h-[44px]` em elementos clicáveis
- [ ] Testar todos os tap targets

### Swipe Gestures
- [ ] Cards de tasks com swipe para deletar
- [ ] Swipe para marcar como completo
- [ ] Feedback visual claro

### Pull to Refresh
- [ ] Envolver listas com `<PullToRefresh>`
- [ ] Implementar função de refresh
- [ ] Testar no dispositivo real

### Layouts
- [ ] Board: horizontal → vertical
- [ ] Sidebar → drawer no mobile
- [ ] Modals → fullscreen no mobile

---

## 📦 Componentes Essenciais

```tsx
// 1. Navegação
<MobileBottomNav items={[...]} />

// 2. Touch Buttons
<TouchButton variant="primary">Salvar</TouchButton>

// 3. Swipe Cards
<SwipeableCard onSwipeLeft={handleDelete}>
  <Card />
</SwipeableCard>

// 4. Pull to Refresh
<PullToRefresh onRefresh={loadData}>
  <Content />
</PullToRefresh>

// 5. FAB
<FAB icon={<Plus />} onClick={quickAdd} label="Nova Task" />

// 6. Drawer
<MobileDrawer isOpen={open} onClose={close}>
  <Menu />
</MobileDrawer>

// 7. Modal
<MobileModal isOpen={open} onClose={close} title="Detalhes">
  <Details />
</MobileModal>
```

---

## 🎨 Exemplo Completo

```tsx
'use client';

import { useState } from 'react';
import {
  MobileBottomNav,
  PullToRefresh,
  SwipeableCard,
  QuickAddTask,
  ResponsiveLayout,
} from '@/components/mobile';

export default function TasksPage() {
  const [tasks, setTasks] = useState([]);

  const navItems = [
    { icon: <Home />, label: 'Home', href: '/' },
    { icon: <Tasks />, label: 'Tasks', href: '/tasks' },
  ];

  return (
    <ResponsiveLayout mobileFooter={<MobileBottomNav items={navItems} />}>
      <PullToRefresh onRefresh={async () => await loadTasks()}>
        <div className="p-4 space-y-4 pb-20">
          <h1 className="text-2xl font-bold">Tasks</h1>
          
          {tasks.map(task => (
            <SwipeableCard
              key={task.id}
              onSwipeLeft={() => deleteTask(task.id)}
              leftAction={{
                icon: <Trash />,
                label: 'Deletar',
                color: 'bg-red-500',
              }}
            >
              <div className="p-4">
                <h3>{task.title}</h3>
              </div>
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

## 🔧 Tailwind Mobile Classes

```tsx
// Responsive padding
className="p-4 md:p-6 lg:p-8"

// Hide on mobile
className="hidden md:block"

// Show only on mobile
className="block md:hidden"

// Full width on mobile
className="w-full md:w-auto"

// Stack on mobile, row on desktop
className="flex flex-col md:flex-row"

// Touch-friendly spacing
className="space-y-4 md:space-y-6"
```

---

## ⚡ Performance Tips

1. **Lazy load** imagens e componentes pesados
2. **Debounce** eventos de scroll/resize
3. **Virtualize** listas longas
4. **Optimize** animações (use transform/opacity)
5. **Minimize** re-renders

---

## 📲 Testar No Dispositivo

### Chrome DevTools
1. F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Selecione dispositivo (iPhone, iPad, etc)
3. Teste gestos com mouse

### Real Device
1. Mesma rede WiFi
2. Encontre IP: `ipconfig` (Windows) ou `ifconfig` (Mac/Linux)
3. Acesse: `http://192.168.x.x:3000`

---

## 🐛 Problemas Comuns

### Botões pequenos demais
✅ Use `TouchButton` ou `min-h-[44px]`

### Swipe não funciona
✅ Verifique `touchAction: 'pan-y'` no container
✅ Teste no dispositivo real (não apenas DevTools)

### Layout quebra no mobile
✅ Use `overflow-x-hidden` no container pai
✅ Teste todos os breakpoints

### Pull to refresh conflita com scroll
✅ Só ativa quando `scrollTop === 0`
✅ Use `overscroll-behavior-y: none`

---

## 📚 Documentação Completa

- **Guia Completo**: `docs/MOBILE_RESPONSIVE_GUIDE.md`
- **Hooks**: `src/hooks/useMobileDetect.ts`
- **Componentes**: `src/components/mobile/`
- **Showcase**: `/showcase/mobile`

---

**Pronto para começar! 🎉**

Para mais detalhes, veja o guia completo em `MOBILE_RESPONSIVE_GUIDE.md`
