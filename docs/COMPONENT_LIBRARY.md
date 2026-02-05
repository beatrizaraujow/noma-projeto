# Component Library - Atoms

## 📋 Componentes Atômicos Implementados

### ✅ Buttons (5 variantes)
- **Primary**: Ação principal
- **Secondary**: Ação secundária
- **Outline**: Ação menos enfatizada
- **Ghost**: Ação sutil
- **Danger**: Ações destrutivas
- **Link**: Links de texto

**Features**:
- 4 tamanhos: xs, sm, md, lg, icon
- Loading state com spinner
- Left/Right icons
- Fully accessible

**Uso**:
```tsx
import { Button } from '@nexora/ui';

<Button variant="primary" size="md">Salvar</Button>
<Button variant="secondary" loading>Carregando...</Button>
<Button variant="danger" leftIcon={<Trash />}>Deletar</Button>
```

---

### ✅ Form Inputs (5 tipos)

#### Input (Text)
- Suporta left/right icons
- Estados de erro
- Helper text
- Dark mode support

```tsx
<Input 
  placeholder="Email" 
  leftIcon={<Mail />}
  error="Email inválido"
  helperText="Digite seu email"
/>
```

#### Textarea
- Redimensionamento configurável (none, vertical, horizontal, both)
- Estados de erro
- Helper text

```tsx
<Textarea 
  placeholder="Descrição" 
  resize="vertical"
  error="Campo obrigatório"
/>
```

#### Select
- Dropdown nativo estilizado
- Left icon support
- Estados de erro

```tsx
<Select leftIcon={<Filter />} error="Selecione uma opção">
  <option value="">Selecione...</option>
  <option value="1">Opção 1</option>
</Select>
```

#### Checkbox
- Ícone de check animado
- Label integrado
- Estados de erro

```tsx
<Checkbox 
  label="Aceito os termos" 
  error="Você deve aceitar"
/>
```

#### Radio
- Label integrado
- Estados de erro
- Acessível

```tsx
<Radio label="Opção A" name="choice" value="a" />
<Radio label="Opção B" name="choice" value="b" />
```

---

### ✅ Icons System (Lucide React)

Integrado com **Lucide React** - biblioteca moderna e leve de ícones.

**Instalação**:
```bash
pnpm add lucide-react
```

**Uso**:
```tsx
import { Check, X, Search, User, Settings } from 'lucide-react';

<Search className="h-4 w-4" />
<User className="h-5 w-5 text-primary-500" />
```

**Ícones comuns incluídos**:
- Check, X, Plus, Minus, Trash, Edit
- Search, Filter, Settings
- User, Users, Mail, Calendar
- ChevronDown, ChevronUp, ChevronLeft, ChevronRight
- Loader2 (para loading states)

---

### ✅ Badges & Tags (8 variantes)

**Variantes**:
- default, primary, secondary
- success, warning, error, info
- neutral

**Features**:
- 3 tamanhos: sm, md, lg
- Removable (com ícone X)
- Left icon support

```tsx
<Badge variant="success">Ativo</Badge>
<Badge variant="warning" size="sm">Pendente</Badge>
<Badge 
  variant="primary" 
  removable 
  onRemove={() => console.log('removed')}
>
  Tag
</Badge>
<Badge variant="error" leftIcon={<AlertCircle />}>Erro</Badge>
```

---

### ✅ Avatars (3 variantes)

**Variantes**:
- circle (padrão)
- rounded
- square

**Features**:
- 6 tamanhos: xs, sm, md, lg, xl, 2xl
- Fallback para iniciais
- Status indicator (online, offline, away, busy)
- Image com fallback
- AvatarGroup para múltiplos avatares

```tsx
// Avatar simples
<Avatar 
  src="/user.jpg" 
  alt="John Doe"
  size="md"
  variant="circle"
/>

// Com fallback de iniciais
<Avatar 
  fallback="John Doe"
  size="lg"
/>

// Com status
<Avatar 
  src="/user.jpg"
  showStatus
  status="online"
/>

// Avatar Group
<AvatarGroup max={3} size="md">
  <Avatar src="/user1.jpg" />
  <Avatar src="/user2.jpg" />
  <Avatar src="/user3.jpg" />
  <Avatar src="/user4.jpg" />
  <Avatar src="/user5.jpg" />
</AvatarGroup>
```

---

### ✅ Loading States (3 componentes)

#### Spinner
- 5 tamanhos: xs, sm, md, lg, xl
- 3 variantes: primary, secondary, neutral
- Animated rotation

```tsx
<Spinner size="md" variant="primary" />
```

#### Skeleton
- 3 variantes: text, circular, rectangular
- Width/height customizável
- Animação pulse

```tsx
<Skeleton variant="text" />
<Skeleton variant="circular" width="40px" height="40px" />
<Skeleton variant="rectangular" height="200px" />
```

#### Loading Overlay
- Overlay sobre conteúdo
- Backdrop opcional
- Texto customizável

```tsx
<LoadingOverlay loading={isLoading} text="Carregando dados...">
  <div>Conteúdo aqui</div>
</LoadingOverlay>
```

#### Skeleton Helpers
```tsx
// Múltiplas linhas de texto
<SkeletonText lines={3} />

// Card completo
<SkeletonCard />

// Avatar com texto
<SkeletonAvatar withText />
```

---

### ✅ Tooltips

**Features**:
- 4 posições: top, right, bottom, left
- 3 alinhamentos: start, center, end
- Delay configurável
- Animação smooth
- Acessível (role="tooltip")

```tsx
<Tooltip content="Clique para editar" side="top">
  <Button>Editar</Button>
</Tooltip>

<Tooltip 
  content="Informação importante" 
  side="right" 
  align="start"
  delay={500}
>
  <InfoIcon />
</Tooltip>
```

---

### ✅ Popovers

**Features**:
- 4 posições: top, right, bottom, left
- 3 alinhamentos: start, center, end
- Controlled/Uncontrolled modes
- Close button opcional
- Click outside to close
- ESC key to close
- Subcomponentes para composição

```tsx
// Basic Popover
<Popover
  trigger={<Button>Abrir</Button>}
  side="bottom"
  align="center"
>
  <PopoverContent>
    <h3>Título</h3>
    <p>Conteúdo do popover</p>
  </PopoverContent>
</Popover>

// Com Header e Footer
<Popover
  trigger={<Button>Menu</Button>}
  closeButton
>
  <PopoverHeader>
    <h3 className="font-semibold">Opções</h3>
  </PopoverHeader>
  <PopoverContent>
    <div className="space-y-2">
      <button>Opção 1</button>
      <button>Opção 2</button>
    </div>
  </PopoverContent>
  <PopoverFooter>
    <Button size="sm">Cancelar</Button>
    <Button size="sm" variant="primary">Salvar</Button>
  </PopoverFooter>
</Popover>

// Controlled
const [open, setOpen] = useState(false);

<Popover
  trigger={<Button>Toggle</Button>}
  open={open}
  onOpenChange={setOpen}
>
  <PopoverContent>Conteúdo</PopoverContent>
</Popover>
```

---

## 📦 Instalação de Dependências

```bash
cd packages/ui
pnpm add lucide-react
```

---

## 🎨 Design Tokens Usados

Todos os componentes seguem o Design System:

- **Colors**: primary, secondary, neutral, semantic (success, warning, error, info)
- **Spacing**: Sistema de 8px grid
- **Typography**: Inter (sans), Poppins (display), JetBrains Mono (code)
- **Border Radius**: lg (8px) padrão, full para círculos
- **Shadows**: elevation system (1-5)
- **Transitions**: 200ms ease-out

---

## ♿ Acessibilidade

Todos os componentes foram construídos com acessibilidade em mente:

✅ Keyboard navigation
✅ Focus visible states
✅ ARIA attributes
✅ Screen reader support
✅ Color contrast WCAG AA
✅ Disabled states

---

## 🌙 Dark Mode

Todos os componentes suportam Dark Mode automaticamente via Tailwind's `dark:` classes.

Para ativar:
```tsx
// Adicione 'dark' class no html/body
<html className="dark">
```

---

## 📂 Estrutura de Arquivos

```
packages/ui/components/
├── button.tsx          ✅ Buttons (5 variants)
├── input-new.tsx       ✅ Enhanced Input
├── textarea.tsx        ✅ Textarea
├── checkbox.tsx        ✅ Checkbox
├── radio.tsx          ✅ Radio
├── select.tsx         ✅ Select
├── badge.tsx          ✅ Badges & Tags (8 variants)
├── avatar.tsx         ✅ Avatar + AvatarGroup
├── loading.tsx        ✅ Spinner, Skeleton, LoadingOverlay
├── tooltip.tsx        ✅ Tooltip
├── popover.tsx        ✅ Popover + subcomponents
├── cards.tsx          ✅ Cards (4 variants)
├── modal.tsx          ✅ Modal/Dialog system
├── dropdown.tsx       ✅ Dropdown menu
├── search-bar.tsx     ✅ Search with autocomplete
├── navigation.tsx     ✅ Sidebar + Topbar
└── states.tsx         ✅ Empty/Error states
```

---

## 🎯 Component Library - Molecules

### ✅ Cards (4 variantes)

#### Base Card
Card genérico com variantes: `default`, `bordered`, `elevated`

```tsx
<Card variant="elevated" padding="md" hoverable>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

#### ProjectCard
Card especializado para projetos com progresso e membros

```tsx
<ProjectCard
  title="Website Redesign"
  description="Complete overhaul of the website"
  progress={65}
  members={[
    { name: 'John Doe', avatar: 'url' },
    { name: 'Jane Smith', avatar: 'url' }
  ]}
  dueDate={new Date('2024-02-15')}
  status="in-progress"
  onClick={() => console.log('clicked')}
/>
```

#### TaskCard
Card para tarefas com status, prioridade e labels

```tsx
<TaskCard
  title="Update Documentation"
  description="Add new API endpoints"
  status="in-progress"
  priority="high"
  assignee={{ name: 'John', avatar: 'url' }}
  dueDate={new Date()}
  labels={['docs', 'api']}
/>
```

#### UserCard
Card de perfil de usuário com stats e ações

```tsx
<UserCard
  name="Jane Smith"
  role="Senior Developer"
  avatar="url"
  stats={[
    { label: 'Projects', value: 12 },
    { label: 'Tasks', value: 45 }
  ]}
  actions={[
    { label: 'View Profile', onClick: () => {} },
    { label: 'Message', onClick: () => {} }
  ]}
/>
```

---

### ✅ Modals & Dialogs

#### Modal
Modal base com subcomponentes

```tsx
<Modal open={isOpen} onClose={() => setIsOpen(false)}>
  <ModalHeader title="Create Project" />
  <ModalBody>
    <p>Modal content here</p>
  </ModalBody>
  <ModalFooter>
    <Button variant="outline" onClick={onCancel}>Cancel</Button>
    <Button onClick={onCreate}>Create</Button>
  </ModalFooter>
</Modal>
```

#### Dialog
Dialog preset simplificado

```tsx
<Dialog
  open={isOpen}
  onClose={onClose}
  title="Confirm Action"
  description="Are you sure you want to proceed?"
  actions={[
    { label: 'Cancel', onClick: onCancel, variant: 'outline' },
    { label: 'Confirm', onClick: onConfirm, variant: 'primary' }
  ]}
/>
```

#### ConfirmDialog
Dialog de confirmação com variante danger

```tsx
<ConfirmDialog
  open={isOpen}
  onClose={onClose}
  title="Delete Project?"
  description="This action cannot be undone."
  onConfirm={async () => await deleteProject()}
  variant="danger"
  confirmText="Delete"
/>
```

**Features**:
- ESC key handling
- Click outside to close
- Body scroll lock
- Loading state no confirm
- Backdrop com blur

---

### ✅ Dropdowns & Menus

```tsx
<Dropdown
  trigger={<Button>Actions</Button>}
  align="end"
  side="bottom"
>
  <DropdownItem icon={<Edit />}>Edit</DropdownItem>
  <DropdownItem icon={<Download />}>Download</DropdownItem>
  <DropdownSeparator />
  <DropdownLabel>Share</DropdownLabel>
  <DropdownSubmenu label="Export" icon={<Share />}>
    <DropdownItem>PDF</DropdownItem>
    <DropdownItem>Excel</DropdownItem>
    <DropdownItem>CSV</DropdownItem>
  </DropdownSubmenu>
  <DropdownSeparator />
  <DropdownItem icon={<Trash />} danger>Delete</DropdownItem>
</Dropdown>
```

**Features**:
- Positioning (align, side)
- Selected state
- Danger variant
- Nested submenus
- Keyboard navigation
- Click outside handling

---

### ✅ Search Bar

```tsx
<SearchBar
  value={searchValue}
  onValueChange={setSearchValue}
  suggestions={[
    {
      id: '1',
      label: 'Project Alpha',
      description: 'Main project',
      category: 'Projects',
      icon: <Folder />
    }
  ]}
  onSelect={(option) => console.log(option)}
  placeholder="Search..."
  highlightMatch
  size="lg"
/>
```

**Features**:
- Autocomplete com sugestões
- Keyboard navigation (Arrow keys, Enter, ESC)
- Highlight de matches
- Loading state
- Clear button
- Categories
- Icons e descriptions
- Responsive

---

### ✅ Navigation

#### Sidebar
```tsx
<Sidebar
  collapsed={collapsed}
  onCollapsedChange={setCollapsed}
>
  <SidebarSection title="Main" collapsed={collapsed}>
    <SidebarItem
      icon={<Home />}
      label="Dashboard"
      active
      badge={5}
      collapsed={collapsed}
    />
  </SidebarSection>
</Sidebar>
```

**Features**:
- Collapsible desktop
- Mobile drawer
- Badge support
- Active state
- Sections com titles

#### Topbar
```tsx
<Topbar
  user={{
    name: 'John Doe',
    email: 'john@example.com',
    avatar: 'url'
  }}
  notifications={3}
  onSearch={(value) => console.log(value)}
  onLogout={() => console.log('logout')}
/>
```

**Features**:
- Search integrado
- User menu
- Notifications badge
- Responsive

---

### ✅ States

#### EmptyState
```tsx
<EmptyState
  variant="inbox"
  title="No messages"
  description="You haven't received any messages yet"
  action={{
    label: 'Compose message',
    onClick: () => {}
  }}
  secondaryAction={{
    label: 'Learn more',
    onClick: () => {}
  }}
/>
```

**Variants**: `default`, `search`, `files`, `inbox`

#### ErrorState
```tsx
<ErrorState
  variant="404"
  title="Page Not Found"
  description="The page you're looking for doesn't exist"
  error="Error details here..."
  showDetails
  action={{
    label: 'Go home',
    onClick: () => {}
  }}
/>
```

**Variants**: `404`, `500`, `403`, `network`, `generic`

#### InlineError
```tsx
<InlineError
  variant="error"
  message="Failed to save. Please try again."
/>
```

**Variants**: `error`, `warning`, `info`

#### ErrorBanner
```tsx
<ErrorBanner
  variant="warning"
  title="Maintenance Scheduled"
  message="System will be down tonight"
  dismissible
  onDismiss={() => {}}
  action={{
    label: 'Learn more',
    onClick: () => {}
  }}
/>
```

**Variants**: `error`, `warning`, `info`, `success`

---

## 🚀 Próximos Passos (Semana 3-4)

### Organisms
- [ ] Form Builder
- [ ] Data Table com sorting/filtering
- [ ] File Upload com drag & drop
- [ ] Rich Text Editor
- [ ] Calendar/Date picker
- [ ] Notification Center
- [ ] Command Palette

### Templates
- [ ] Login/Auth screens
- [ ] Dashboard layouts
- [ ] Settings page
- [ ] Profile page
- [ ] Project detail page

---

## 📚 Exemplos de Uso

Veja exemplos completos em:
- `/docs/examples/ComponentShowcase.tsx` - Atoms
- `/docs/examples/MoleculeShowcase.tsx` - Molecules

---

**Status**: ✅ Component Library - Atoms & Molecules Completa  
**Componentes**: 30+ componentes (20 Atoms + 10+ Molecules)  
**Versão**: 1.0.0  
**Data**: Semana 2
