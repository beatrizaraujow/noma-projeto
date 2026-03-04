# 🎨 Micro-interactions - NOMA

Biblioteca de componentes animados usando **Framer Motion** para criar uma experiência de usuário fluida e profissional.

## 📦 Componentes Disponíveis

### 1. AnimatedButton
Botões com feedback visual em hover e clique.

```tsx
import { AnimatedButton } from '@/components/animations';

<AnimatedButton variant="primary" size="md">
  Clique aqui
</AnimatedButton>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'

### 2. AnimatedCard
Cards com efeito de elevação no hover.

```tsx
import { AnimatedCard } from '@/components/animations';

<AnimatedCard hoverable clickable>
  <div className="p-6">Conteúdo do card</div>
</AnimatedCard>
```

**Props:**
- `hoverable`: boolean - Ativa efeito hover (padrão: true)
- `clickable`: boolean - Ativa efeito click (padrão: false)

### 3. PageTransition
Transições suaves entre páginas/views.

```tsx
import { PageTransition } from '@/components/animations';

<PageTransition variant="page">
  <YourPageContent />
</PageTransition>
```

**Variants:**
- `fade`: Fade in/out simples
- `slide`: Desliza da esquerda
- `page`: Fade + movimento vertical

### 4. SkeletonLoader
Loaders animados para estados de carregamento.

```tsx
import { 
  Skeleton, 
  SkeletonText, 
  SkeletonCard, 
  SkeletonList, 
  SkeletonTable,
  SkeletonDashboard 
} from '@/components/animations';

// Skeleton básico
<Skeleton variant="rectangular" width={200} height={100} />

// Skeleton de texto
<SkeletonText lines={3} />

// Skeleton de card
<SkeletonCard />

// Skeleton de lista
<SkeletonList items={5} />

// Skeleton de tabela
<SkeletonTable rows={5} columns={4} />

// Skeleton de dashboard completo
<SkeletonDashboard />
```

### 5. SuccessAnimation
Animações de feedback positivo.

```tsx
import { 
  SuccessCheckmark, 
  SuccessConfetti, 
  SuccessToast 
} from '@/components/animations';

// Checkmark animado
<SuccessCheckmark 
  show={isSuccess} 
  size={64}
  onComplete={() => console.log('Animação completa')}
/>

// Confetti celebration
<SuccessConfetti 
  show={showConfetti}
  onComplete={() => setShowConfetti(false)}
/>

// Toast de sucesso
<SuccessToast
  message="Salvo com sucesso!"
  show={showToast}
  duration={3000}
  withConfetti={true}
  onClose={() => setShowToast(false)}
/>
```

### 6. DragFeedback
Componentes com feedback de arrasto.

```tsx
import { Draggable, SortableItem, DragHandle } from '@/components/animations';

// Elemento arrastável livre
<Draggable
  dragConstraints={{ left: 0, right: 400, top: 0, bottom: 200 }}
  onDragStart={() => console.log('Começou a arrastar')}
  onDragEnd={(info) => console.log('Terminou', info)}
>
  <div>Arraste-me!</div>
</Draggable>

// Item de lista ordenável
<SortableItem id="item-1">
  <div className="flex items-center gap-3">
    <DragHandle />
    <span>Item da lista</span>
  </div>
</SortableItem>
```

## 🎭 Variantes de Animação

Variantes pré-configuradas disponíveis em `variants.ts`:

```tsx
import { 
  buttonVariants,
  cardVariants,
  pageVariants,
  fadeVariants,
  slideVariants,
  scaleVariants,
  staggerContainerVariants,
  listItemVariants,
  checkmarkVariants,
  skeletonVariants,
  dragVariants
} from '@/components/animations/variants';
```

### Exemplo de uso com variantes customizadas:

```tsx
import { motion } from 'framer-motion';
import { staggerContainerVariants, listItemVariants } from '@/components/animations/variants';

<motion.div
  variants={staggerContainerVariants}
  initial="initial"
  animate="animate"
>
  {items.map((item) => (
    <motion.div key={item.id} variants={listItemVariants}>
      {item.content}
    </motion.div>
  ))}
</motion.div>
```

## 📖 Exemplos Práticos

### Formulário com feedback

```tsx
'use client';

import { useState } from 'react';
import { AnimatedButton, SuccessToast } from '@/components/animations';

export function MyForm() {
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Sua lógica aqui
    await saveData();
    
    setLoading(false);
    setShowSuccess(true);
  };

  return (
    <>
      <form onSubmit={handleSubmit}>
        {/* Seus campos */}
        <AnimatedButton 
          type="submit" 
          variant="primary"
          disabled={loading}
        >
          {loading ? 'Salvando...' : 'Salvar'}
        </AnimatedButton>
      </form>

      <SuccessToast
        message="Dados salvos com sucesso!"
        show={showSuccess}
        withConfetti={true}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
```

### Lista com loading

```tsx
'use client';

import { useEffect, useState } from 'react';
import { AnimatedCard, SkeletonList } from '@/components/animations';

export function TaskList() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks().then((data) => {
      setTasks(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <AnimatedCard className="p-6">
        <SkeletonList items={5} />
      </AnimatedCard>
    );
  }

  return (
    <AnimatedCard className="p-6">
      {tasks.map((task) => (
        <div key={task.id}>{task.title}</div>
      ))}
    </AnimatedCard>
  );
}
```

### Dashboard com transições

```tsx
'use client';

import { PageTransition, AnimatedCard, SkeletonDashboard } from '@/components/animations';

export default function DashboardPage() {
  const [loading, setLoading] = useState(true);

  if (loading) {
    return (
      <PageTransition>
        <SkeletonDashboard />
      </PageTransition>
    );
  }

  return (
    <PageTransition>
      <div className="grid grid-cols-4 gap-4">
        <AnimatedCard hoverable className="p-6">
          <h3>Métrica 1</h3>
          <p>100</p>
        </AnimatedCard>
        {/* Mais cards... */}
      </div>
    </PageTransition>
  );
}
```

## 🎯 Melhores Práticas

1. **Performance**: Use `AnimatePresence` do Framer Motion para animações de montagem/desmontagem
2. **Acessibilidade**: Não abuse de animações, respeite `prefers-reduced-motion`
3. **Consistência**: Use as variantes pré-definidas para manter padrões
4. **Feedback**: Sempre forneça feedback visual para ações do usuário
5. **Loading**: Use skeletons ao invés de spinners quando possível

## 🔧 Customização

Para criar variantes customizadas, estenda as existentes:

```tsx
import { Variants } from 'framer-motion';
import { buttonVariants } from '@/components/animations/variants';

const customButtonVariants: Variants = {
  ...buttonVariants,
  hover: {
    ...buttonVariants.hover,
    backgroundColor: '#custom-color',
  },
};
```

## 📱 Responsividade

Todos os componentes são responsivos por padrão. Para ajustes específicos:

```tsx
<AnimatedCard className="p-4 md:p-6 lg:p-8">
  Conteúdo responsivo
</AnimatedCard>
```

## 🌙 Dark Mode

Todos os componentes suportam dark mode automaticamente através das classes do Tailwind:

```tsx
<div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
  Suporte automático ao dark mode
</div>
```

## 🎪 Ver Showcase Completo

Acesse `/showcase/animations` para ver todos os componentes em ação.
