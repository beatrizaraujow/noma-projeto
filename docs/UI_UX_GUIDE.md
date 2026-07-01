# 🎨 Guia de UI/UX - NUMA Design System

## 📊 Visão Geral

Sistema de design completo implementado para o NUMA, incluindo tokens de design, componentes, micro-interações, estados de loading e error handling gracioso.

---

## ✅ Implementações Realizadas

### 1. ✨ Design System Consolidado

**Arquivo:** [`apps/web/src/lib/design-system.ts`](../apps/web/src/lib/design-system.ts)

#### **Design Tokens**

##### Paleta de Cores
- **Primary (Azul)**: 50-950 shades
- **Secondary (Púrpura)**: 50-900 shades
- **Success (Verde)**: 50-900 shades
- **Warning (Amarelo/Laranja)**: 50-900 shades
- **Error (Vermelho)**: 50-900 shades
- **Info (Ciano)**: 50-900 shades
- **Grayscale**: 50-950 shades

```typescript
import { colors } from '@/lib/design-system';

// Uso
<div style={{ backgroundColor: colors.primary[600] }}>
```

##### Tipografia
```typescript
{
  fontFamily: {
    sans: 'Inter, system-ui, sans-serif',
    mono: 'Menlo, Monaco, monospace',
  },
  fontSize: {
    xs: '0.75rem',    // 12px
    sm: '0.875rem',   // 14px
    base: '1rem',     // 16px
    lg: '1.125rem',   // 18px
    xl: '1.25rem',    // 20px
    '2xl': '1.5rem',  // 24px
    // ... até 6xl
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
}
```

##### Espaçamento
Escala de 0 a 32 (0px a 128px) em incrementos consistentes.

##### Border Radius
De `none` a `full`, passando por `sm`, `md`, `lg`, `xl`, `2xl`, `3xl`.

##### Shadows
De `sm` a `2xl`, incluindo `inner` para sombras internas.

##### Animações
```typescript
{
  duration: {
    fast: '150ms',
    base: '200ms',
    slow: '300ms',
    slower: '500ms',
  },
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  },
}
```

##### Z-Index Scale
Escala organizada para evitar conflitos:
- Base: 0
- Dropdown: 1000
- Modal: 1400
- Tooltip: 1600
- Notification: 1700

#### **Variantes de Componentes**

##### Status Variants
```typescript
TODO, IN_PROGRESS, REVIEW, DONE
// Cada um com cor, background e label
```

##### Priority Variants
```typescript
LOW, MEDIUM, HIGH, URGENT
// Cada um com cor, label e ícone
```

---

### 2. 🎭 Micro-interações

**Arquivo:** [`apps/web/src/lib/animations.ts`](../apps/web/src/lib/animations.ts)

#### **Animações Disponíveis**

```typescript
// Fade in
fadeIn: { initial, animate, exit, transition }

// Slide in from right
slideInRight: { initial, animate, exit, transition }

// Slide in from bottom
slideInBottom: { initial, animate, exit, transition }

// Scale in
scaleIn: { initial, animate, exit, transition }

// Bounce
bounce: { animate with repeat }

// Hover effects
hoverScale: { whileHover, whileTap, transition }
hoverLift: { whileHover with shadow, transition }
rotateOnHover: { whileHover, transition }

// Pulse (for notifications)
pulse: { animate with infinite repeat }
```

#### **Tailwind Animations**

Adicionadas ao `tailwind.config.js`:
- `animate-fade-in`
- `animate-slide-in-right`
- `animate-slide-in-bottom`
- `animate-scale-in`
- `animate-shimmer`

**Uso:**
```tsx
<div className="animate-fade-in">
  Conteúdo com fade in
</div>
```

---

### 3. ⏳ Loading States Refinados

#### **Skeleton Loaders**

**Arquivo:** [`apps/web/src/components/common/skeleton.tsx`](../apps/web/src/components/common/skeleton.tsx)

```tsx
import { Skeleton, CardSkeleton, TableSkeleton, ListSkeleton } from '@/components/common/skeleton';

// Skeleton básico
<Skeleton className="h-4 w-full" />

// Skeleton de card completo
<CardSkeleton />

// Skeleton de tabela
<TableSkeleton rows={5} />

// Skeleton de lista
<ListSkeleton items={5} />

// Skeleton de texto
<TextSkeleton lines={3} />
```

**Variantes:**
- `text`: Linha de texto
- `circular`: Avatar circular
- `rectangular`: Retângulo (padrão)

**Animações:**
- `pulse`: Pulsação (padrão)
- `wave`: Efeito shimmer
- `none`: Sem animação

#### **Spinners**

**Arquivo:** [`apps/web/src/components/common/spinner.tsx`](../apps/web/src/components/common/spinner.tsx)

```tsx
import { Spinner, SpinnerWithText, FullPageSpinner, ButtonSpinner } from '@/components/common/spinner';

// Spinner básico
<Spinner size="md" variant="primary" />

// Spinner com texto
<SpinnerWithText text="Carregando dados..." />

// Spinner de página inteira
<FullPageSpinner text="Inicializando..." />

// Spinner para botões
<button>
  <ButtonSpinner />
  Enviando...
</button>
```

**Tamanhos:** `sm`, `md`, `lg`, `xl`  
**Variantes:** `primary`, `secondary`, `white`

#### **Progress Bars**

**Arquivo:** [`apps/web/src/components/common/progress.tsx`](../apps/web/src/components/common/progress.tsx)

```tsx
import { Progress, CircularProgress } from '@/components/common/progress';

// Barra de progresso linear
<Progress value={75} showLabel />

// Progresso circular
<CircularProgress value={75} size={80} />
```

---

### 4. ❌ Error Handling Gracioso

#### **Toast Notifications**

**Arquivo:** [`apps/web/src/components/common/toast.tsx`](../apps/web/src/components/common/toast.tsx)

```tsx
import { useToast, useSuccessToast, useErrorToast } from '@/components/common/toast';

function MyComponent() {
  const { showToast } = useToast();
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();
  
  // Toast customizado
  showToast({
    type: 'success',
    title: 'Sucesso!',
    message: 'Operação concluída.',
    duration: 5000,
  });
  
  // Atalhos
  showSuccess('Tarefa criada!', 'A tarefa foi adicionada ao projeto.');
  showError('Erro', 'Não foi possível salvar os dados.');
}
```

**Tipos:** `success`, `error`, `warning`, `info`

**Features:**
- Auto-dismiss configurável
- Empilhamento de múltiplos toasts
- Animações suaves
- Suporte dark mode
- Botão de fechar

#### **Error Boundary**

**Arquivo:** [`apps/web/src/components/common/error-boundary.tsx`](../apps/web/src/components/common/error-boundary.tsx)

```tsx
import { ErrorBoundary, ErrorState, EmptyState } from '@/components/common/error-boundary';

// Wrapper com error boundary
<ErrorBoundary
  fallback={<CustomErrorFallback />}
  onError={(error, errorInfo) => {
    // Log para serviço de monitoramento
    console.error(error, errorInfo);
  }}
>
  <MyComponent />
</ErrorBoundary>

// Error state inline
<ErrorState
  title="Erro ao carregar"
  message="Não foi possível carregar os dados."
  onRetry={() => refetch()}
/>

// Empty state
<EmptyState
  icon="📭"
  title="Nenhuma tarefa"
  message="Você ainda não tem tarefas neste projeto."
  action={{
    label: 'Criar primeira tarefa',
    onClick: () => openModal(),
  }}
/>
```

---

### 5. 👋 Onboarding Flow

**Arquivo:** [`apps/web/src/components/features/onboarding/OnboardingFlow.tsx`](../apps/web/src/components/features/onboarding/OnboardingFlow.tsx)

#### **Welcome Modal**

```tsx
import { WelcomeModal } from '@/components/features/onboarding/OnboardingFlow';

<WelcomeModal
  isOpen={showWelcome}
  onClose={() => setShowWelcome(false)}
  onStartTour={startTour}
/>
```

#### **Tour Guiado**

```tsx
import { useOnboarding, defaultOnboardingSteps } from '@/components/features/onboarding/OnboardingFlow';

function App() {
  const { startOnboarding } = useOnboarding();
  
  // Iniciar tour
  useEffect(() => {
    if (isFirstTimeUser) {
      startOnboarding(defaultOnboardingSteps);
    }
  }, []);
}
```

**Features:**
- Spotlight no elemento alvo
- Navegação passo a passo
- Indicador de progresso
- Ações customizáveis por passo
- Persistência (localStorage)
- Skip/Complete

**Steps padrão:**
1. Bem-vindo
2. Workspaces
3. Projetos
4. Tarefas
5. Notificações

---

## 🎨 Componentes UI Adicionais

### Badge

**Arquivo:** [`apps/web/src/components/common/badge.tsx`](../apps/web/src/components/common/badge.tsx)

```tsx
import { Badge, StatusBadge, PriorityBadge, CountBadge } from '@/components/common/badge';

// Badge genérico
<Badge variant="success" size="md">Ativo</Badge>

// Badge de status
<StatusBadge status="IN_PROGRESS" />

// Badge de prioridade
<PriorityBadge priority="HIGH" />

// Badge de contagem (notificações)
<div className="relative">
  <BellIcon />
  <CountBadge count={5} />
</div>
```

### Avatar

**Arquivo:** [`apps/web/src/components/common/avatar.tsx`](../apps/web/src/components/common/avatar.tsx)

```tsx
import { Avatar, AvatarGroup } from '@/components/common/avatar';

// Avatar único
<Avatar
  src="/avatar.jpg"
  name="João Silva"
  size="md"
/>

// Grupo de avatares
<AvatarGroup
  avatars={members}
  max={4}
  size="sm"
/>
```

---

## 🚀 Como Usar

### 1. Setup Inicial

Os providers já estão configurados em [`apps/web/src/app/providers.tsx`](../apps/web/src/app/providers.tsx):

```tsx
<ToastProvider>
  <OnboardingProvider>
    {children}
  </OnboardingProvider>
</ToastProvider>
```

### 2. Usar Toast Notifications

```tsx
'use client';

import { useSuccessToast, useErrorToast } from '@/components/common/toast';

export function TaskForm() {
  const showSuccess = useSuccessToast();
  const showError = useErrorToast();
  
  const handleSubmit = async (data) => {
    try {
      await createTask(data);
      showSuccess('Tarefa criada!', 'A tarefa foi adicionada ao projeto.');
    } catch (error) {
      showError('Erro', 'Não foi possível criar a tarefa.');
    }
  };
}
```

### 3. Loading States

```tsx
import { useTasks } from '@/hooks/useQueries';
import { CardSkeleton } from '@/components/common/skeleton';
import { ErrorState, EmptyState } from '@/components/common/error-boundary';

function TaskList({ projectId }) {
  const { data: tasks, isLoading, error, refetch } = useTasks(projectId);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }
  
  if (error) {
    return <ErrorState onRetry={refetch} />;
  }
  
  if (!tasks || tasks.length === 0) {
    return (
      <EmptyState
        icon="📋"
        title="Nenhuma tarefa"
        message="Comece criando sua primeira tarefa."
        action={{
          label: 'Nova Tarefa',
          onClick: () => openModal(),
        }}
      />
    );
  }
  
  return <div>{/* render tasks */}</div>;
}
```

### 4. Error Boundary

```tsx
import { ErrorBoundary } from '@/components/common/error-boundary';

function Page() {
  return (
    <ErrorBoundary>
      <ComplexComponent />
    </ErrorBoundary>
  );
}
```

### 5. Onboarding

```tsx
'use client';

import { useEffect, useState } from 'react';
import { WelcomeModal, useOnboarding, defaultOnboardingSteps } from '@/components/features/onboarding/OnboardingFlow';

export default function Dashboard() {
  const [showWelcome, setShowWelcome] = useState(false);
  const { startOnboarding } = useOnboarding();
  
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('onboarding_completed');
    if (!hasSeenWelcome) {
      setShowWelcome(true);
    }
  }, []);
  
  const handleStartTour = () => {
    setShowWelcome(false);
    startOnboarding(defaultOnboardingSteps);
  };
  
  return (
    <>
      <WelcomeModal
        isOpen={showWelcome}
        onClose={() => setShowWelcome(false)}
        onStartTour={handleStartTour}
      />
      {/* content */}
    </>
  );
}
```

---

## 📝 Boas Práticas

### Loading States
- ✅ Use `Skeleton` para conteúdo estruturado
- ✅ Use `Spinner` para ações/processos
- ✅ Use `Progress` para uploads/downloads
- ✅ Sempre forneça feedback visual

### Error Handling
- ✅ Use `ErrorBoundary` em páginas inteiras
- ✅ Use `ErrorState` inline para seções específicas
- ✅ Use `Toast` para feedback de ações
- ✅ Sempre ofereça um caminho de recuperação (retry)

### Micro-interações
- ✅ Use transições suaves (200-300ms)
- ✅ Forneça feedback em hover/click
- ✅ Mantenha consistência nas animações
- ✅ Não exagere - menos é mais

### Onboarding
- ✅ Mostre apenas para novos usuários
- ✅ Mantenha os passos curtos (5-7 máximo)
- ✅ Permita pular o tour
- ✅ Persista o estado no localStorage

---

## 🎯 Estrutura de Arquivos

```
apps/web/src/
├── lib/
│   ├── design-system.ts       ✨ Design tokens e variantes
│   └── animations.ts          ✨ Configurações de animação
├── components/
│   ├── common/
│   │   ├── skeleton.tsx       ✨ Loading skeletons
│   │   ├── spinner.tsx        ✨ Loading spinners
│   │   ├── progress.tsx       ✨ Progress bars
│   │   ├── toast.tsx          ✨ Toast notifications
│   │   ├── error-boundary.tsx ✨ Error handling
│   │   ├── badge.tsx          ✨ Status/priority badges
│   │   └── avatar.tsx         ✨ User avatars
│   └── features/
│       └── onboarding/
│           └── OnboardingFlow.tsx ✨ Onboarding system
└── app/
    └── providers.tsx          ✅ Updated with new providers
```

---

## 🔍 Debug e Teste

### Visual Testing
1. Abra Storybook (se configurado) ou crie página de testes
2. Teste cada componente em:
   - Light/Dark mode
   - Diferentes tamanhos
   - Estados (loading, error, success)

### Accessibility
- Todos os componentes incluem `aria-label`
- Skeleton e Spinner têm `role="status"`
- Navegação por teclado suportada
- Cores com contraste adequado (WCAG AA)

### Performance
- Animações otimizadas com `transform` e `opacity`
- Lazy loading de componentes pesados
- Memoização quando necessário

---

## 📚 Recursos Adicionais

### Inspiração
- [Radix UI](https://www.radix-ui.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Tailwind UI](https://tailwindui.com/)

### Ferramentas
- [Coolors](https://coolors.co/) - Paletas de cores
- [Type Scale](https://type-scale.com/) - Escala tipográfica
- [Cubic Bezier](https://cubic-bezier.com/) - Easings

---

## ✅ Checklist Completo

- [x] Design system com tokens consolidados
- [x] Paleta de cores completa
- [x] Tipografia e espaçamento
- [x] Animações e transições
- [x] Skeleton loaders
- [x] Spinners variados
- [x] Progress bars
- [x] Toast notifications
- [x] Error boundaries
- [x] Empty states
- [x] Onboarding flow
- [x] Welcome modal
- [x] Badge components
- [x] Avatar components
- [x] Dark mode support
- [x] Accessibility
- [x] Documentação completa

---

**Última atualização:** 30 de Janeiro de 2026  
**Status:** ✅ COMPLETO
