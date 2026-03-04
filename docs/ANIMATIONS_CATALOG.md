# 🎨 Catálogo de Componentes - Micro-interactions

## 📦 Índice de Componentes

| Componente | Descrição | Uso Principal | Complexidade |
|------------|-----------|---------------|--------------|
| **AnimatedButton** | Botão com hover e click feedback | Ações do usuário | 🟢 Básico |
| **AnimatedCard** | Card com efeito de elevação | Container de conteúdo | 🟢 Básico |
| **PageTransition** | Transição suave entre views | Navegação de páginas | 🟢 Básico |
| **Skeleton** | Loader animado básico | Loading states | 🟢 Básico |
| **SkeletonText** | Múltiplas linhas de texto | Parágrafos carregando | 🟢 Básico |
| **SkeletonCard** | Card completo com avatar | Cards carregando | 🟢 Básico |
| **SkeletonList** | Lista de itens | Listas carregando | 🟢 Básico |
| **SkeletonTable** | Tabela de dados | Tabelas carregando | 🟡 Médio |
| **SkeletonDashboard** | Dashboard completo | Dashboard carregando | 🟡 Médio |
| **SuccessCheckmark** | Checkmark animado | Confirmação visual | 🟢 Básico |
| **SuccessConfetti** | Confetti celebration | Celebrações | 🟡 Médio |
| **SuccessToast** | Toast de sucesso | Feedback de ação | 🟢 Básico |
| **Draggable** | Elemento arrastável | Drag & drop livre | 🔴 Avançado |
| **SortableItem** | Item de lista ordenável | Listas reordenáveis | 🔴 Avançado |
| **DragHandle** | Handle visual de drag | Indicador de arrasto | 🟢 Básico |

---

## 🎯 Por Categoria

### 🖱️ Interações (Buttons & Cards)

#### AnimatedButton
```tsx
<AnimatedButton variant="primary" size="md">
  Minha Ação
</AnimatedButton>
```
**Props:**
- `variant`: 'primary' | 'secondary' | 'ghost' | 'danger'
- `size`: 'sm' | 'md' | 'lg'
- Todos os props nativos de `button`

**Quando usar:** Qualquer botão da aplicação

---

#### AnimatedCard
```tsx
<AnimatedCard hoverable clickable className="p-6">
  <h3>Título</h3>
  <p>Conteúdo</p>
</AnimatedCard>
```
**Props:**
- `hoverable`: boolean (padrão: true)
- `clickable`: boolean (padrão: false)

**Quando usar:** Cards de dashboard, listas de projetos, cartões de tarefas

---

### ⏳ Loading States

#### Skeleton (Básico)
```tsx
<Skeleton variant="rectangular" width={200} height={100} />
<Skeleton variant="circular" width={40} height={40} />
<Skeleton variant="text" />
```
**Quando usar:** Elementos individuais carregando

---

#### SkeletonText
```tsx
<SkeletonText lines={3} />
```
**Quando usar:** Textos/descrições carregando

---

#### SkeletonCard
```tsx
<SkeletonCard />
```
**Quando usar:** Card com avatar e texto carregando

---

#### SkeletonList
```tsx
<SkeletonList items={5} />
```
**Quando usar:** Listas de usuários, tarefas, etc carregando

---

#### SkeletonTable
```tsx
<SkeletonTable rows={5} columns={4} />
```
**Quando usar:** Tabelas de dados carregando

---

#### SkeletonDashboard
```tsx
<SkeletonDashboard />
```
**Quando usar:** Dashboard completo carregando (stats + charts + table)

---

### 🎉 Feedback de Sucesso

#### SuccessCheckmark
```tsx
<SuccessCheckmark 
  show={showSuccess} 
  size={64}
  onComplete={() => console.log('Done')}
/>
```
**Quando usar:** Confirmação visual inline

---

#### SuccessConfetti
```tsx
<SuccessConfetti 
  show={celebrate}
  onComplete={() => setCelebrate(false)}
/>
```
**Quando usar:** Celebrações (conclusão de projeto, milestone, etc)

---

#### SuccessToast
```tsx
<SuccessToast
  message="Salvo com sucesso!"
  show={showToast}
  duration={3000}
  withConfetti={true}
  onClose={() => setShowToast(false)}
/>
```
**Quando usar:** Feedback de ações bem-sucedidas (salvar, criar, deletar, etc)

---

### 🎬 Transições

#### PageTransition
```tsx
<PageTransition variant="page">
  <YourPageContent />
</PageTransition>
```
**Props:**
- `variant`: 'fade' | 'slide' | 'page'

**Quando usar:** Envolver conteúdo de páginas inteiras

---

### 🎯 Drag & Drop

#### Draggable
```tsx
<Draggable
  dragConstraints={{ left: 0, right: 400, top: 0, bottom: 200 }}
  onDragStart={() => console.log('Start')}
  onDragEnd={(event, info) => console.log('End', info)}
>
  <div>Arraste-me!</div>
</Draggable>
```
**Quando usar:** Elementos que precisam ser arrastados livremente

---

#### SortableItem
```tsx
<SortableItem id="task-1">
  <div className="flex items-center gap-3">
    <DragHandle />
    <span>Minha Task</span>
  </div>
</SortableItem>
```
**Quando usar:** Listas reordenáveis (tasks, prioridades, etc)

---

#### DragHandle
```tsx
<DragHandle />
```
**Quando usar:** Indicador visual de que algo é arrastável

---

## 🎨 Variantes de Animação

### Import
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

### Uso com motion.div
```tsx
<motion.div
  variants={cardVariants}
  initial="initial"
  whileHover="hover"
>
  Conteúdo
</motion.div>
```

---

## 📊 Matriz de Decisão

| Situação | Componente Recomendado |
|----------|------------------------|
| Botão de ação | `AnimatedButton` |
| Card clicável | `AnimatedCard` + `clickable` |
| Card apenas visual | `AnimatedCard` + `hoverable` |
| Mudança de página | `PageTransition` |
| Lista carregando | `SkeletonList` |
| Tabela carregando | `SkeletonTable` |
| Dashboard carregando | `SkeletonDashboard` |
| Ação bem-sucedida | `SuccessToast` |
| Conquista importante | `SuccessToast` + `withConfetti` |
| Lista reordenável | `SortableItem` + `DragHandle` |
| Elemento móvel | `Draggable` |
| Lista animada | `staggerContainerVariants` + `listItemVariants` |

---

## 🎯 Receitas Rápidas

### Página Completa
```tsx
<PageTransition>
  {loading ? <SkeletonDashboard /> : <Dashboard />}
</PageTransition>
```

### Formulário com Feedback
```tsx
<form onSubmit={handleSubmit}>
  {/* campos */}
  <AnimatedButton type="submit">Salvar</AnimatedButton>
</form>
<SuccessToast show={success} message="Salvo!" />
```

### Lista Animada
```tsx
<motion.div variants={staggerContainerVariants} initial="initial" animate="animate">
  {items.map(item => (
    <motion.div key={item.id} variants={listItemVariants}>
      <AnimatedCard hoverable>{item.content}</AnimatedCard>
    </motion.div>
  ))}
</motion.div>
```

### Card Interativo
```tsx
<AnimatedCard hoverable clickable onClick={() => navigate(`/task/${id}`)}>
  <div className="p-6">
    <h3>{task.title}</h3>
    <p>{task.description}</p>
  </div>
</AnimatedCard>
```

---

## 📈 Nível de Adoção

### Fase 1: Fundação (1-2 dias)
- [ ] `AnimatedButton` em todos os botões principais
- [ ] `PageTransition` nas páginas principais
- [ ] `AnimatedCard` em 50% dos cards

### Fase 2: Refinamento (2-3 dias)
- [ ] Skeletons em todas as telas com loading
- [ ] `SuccessToast` em todos os formulários
- [ ] `AnimatedCard` em 100% dos cards

### Fase 3: Excelência (3-5 dias)
- [ ] Stagger animations em listas
- [ ] Drag & drop onde faz sentido
- [ ] Confetti em conquistas
- [ ] Transições personalizadas

---

## 🔍 Busca Rápida

**Preciso de...**
- Botão? → `AnimatedButton`
- Card? → `AnimatedCard`
- Loading? → `Skeleton*`
- Sucesso? → `SuccessToast`
- Transição? → `PageTransition`
- Arrasto? → `Draggable` ou `SortableItem`

---

## 📚 Recursos

- **Showcase**: `/showcase`
- **Documentação**: `src/components/animations/README.md`
- **Exemplos**: `docs/ANIMATIONS_EXAMPLES.md`
- **Quick Start**: `docs/ANIMATIONS_QUICKSTART.md`
- **Resumo**: `docs/MICRO_INTERACTIONS_SUMMARY.md`
