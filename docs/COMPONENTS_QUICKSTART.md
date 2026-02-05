# Component Library - Quick Start

## 🚀 Instalação

### 1. Instalar Dependências

```bash
# No root do projeto
pnpm install

# Ou especificamente no pacote ui
cd packages/ui
pnpm add lucide-react
```

### 2. Importar Componentes

```tsx
import { Button, Input, Badge, Avatar } from '@nexora/ui';
```

---

## 📖 Exemplos Rápidos

### Buttons

```tsx
import { Button } from '@nexora/ui';
import { Save, Trash } from 'lucide-react';

function MyComponent() {
  return (
    <>
      <Button variant="primary">Save</Button>
      <Button variant="secondary">Cancel</Button>
      <Button variant="danger" leftIcon={<Trash />}>Delete</Button>
      <Button variant="primary" loading>Saving...</Button>
    </>
  );
}
```

### Form Inputs

```tsx
import { Input, Textarea, Select, Checkbox } from '@nexora/ui';
import { Mail, Search } from 'lucide-react';

function FormExample() {
  return (
    <form className="space-y-4">
      <Input 
        placeholder="Email"
        leftIcon={<Mail />}
        error={errors.email}
      />
      
      <Textarea 
        placeholder="Description"
        helperText="Max 500 characters"
      />
      
      <Select>
        <option value="">Select...</option>
        <option value="1">Option 1</option>
      </Select>
      
      <Checkbox label="I agree to terms" />
    </form>
  );
}
```

### Badges

```tsx
import { Badge } from '@nexora/ui';

function StatusBadges() {
  return (
    <>
      <Badge variant="success">Active</Badge>
      <Badge variant="warning">Pending</Badge>
      <Badge variant="error">Blocked</Badge>
      <Badge variant="primary" removable onRemove={() => {}}>
        Tag
      </Badge>
    </>
  );
}
```

### Avatars

```tsx
import { Avatar, AvatarGroup } from '@nexora/ui';

function UserAvatars() {
  return (
    <>
      <Avatar 
        src="/user.jpg"
        alt="John Doe"
        size="md"
        showStatus
        status="online"
      />
      
      <Avatar fallback="John Doe" />
      
      <AvatarGroup max={3}>
        <Avatar fallback="User 1" />
        <Avatar fallback="User 2" />
        <Avatar fallback="User 3" />
        <Avatar fallback="User 4" />
      </AvatarGroup>
    </>
  );
}
```

### Loading States

```tsx
import { 
  Spinner, 
  Skeleton, 
  LoadingOverlay,
  SkeletonCard 
} from '@nexora/ui';

function LoadingExamples() {
  return (
    <>
      {/* Spinner */}
      <Spinner size="md" />
      
      {/* Skeleton */}
      <Skeleton variant="text" />
      <Skeleton variant="rectangular" height="200px" />
      <SkeletonCard />
      
      {/* Loading Overlay */}
      <LoadingOverlay loading={isLoading} text="Loading...">
        <YourContent />
      </LoadingOverlay>
    </>
  );
}
```

### Tooltip & Popover

```tsx
import { Tooltip, Popover, PopoverContent, Button } from '@nexora/ui';

function OverlayExamples() {
  return (
    <>
      {/* Tooltip */}
      <Tooltip content="Click to edit" side="top">
        <Button>Edit</Button>
      </Tooltip>
      
      {/* Popover */}
      <Popover
        trigger={<Button>Open Menu</Button>}
      >
        <PopoverContent>
          <div className="space-y-2">
            <button>Action 1</button>
            <button>Action 2</button>
          </div>
        </PopoverContent>
      </Popover>
    </>
  );
}
```

---

## 🎨 Customização

### Tailwind Classes

Todos os componentes aceitam `className` para customização:

```tsx
<Button 
  variant="primary" 
  className="w-full mt-4"
>
  Full Width Button
</Button>

<Input 
  className="max-w-xs"
  placeholder="Custom width"
/>

<Badge 
  variant="success"
  className="text-xs"
>
  Small Badge
</Badge>
```

### Dark Mode

Componentes suportam dark mode automaticamente:

```tsx
// Adicione 'dark' class no root
<html className="dark">
  <body>
    <Button variant="primary">Dark Mode Button</Button>
  </body>
</html>
```

---

## 🔧 Props Reference

### Button Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'primary' \| 'secondary' \| 'outline' \| 'ghost' \| 'danger' \| 'link' | 'primary' | Visual style |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'icon' | 'md' | Button size |
| loading | boolean | false | Show loading spinner |
| leftIcon | ReactNode | - | Icon on the left |
| rightIcon | ReactNode | - | Icon on the right |
| disabled | boolean | false | Disable button |

### Input Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| error | string | - | Error message |
| helperText | string | - | Helper text below input |
| leftIcon | ReactNode | - | Icon on the left |
| rightIcon | ReactNode | - | Icon on the right |

### Badge Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| variant | 'default' \| 'primary' \| 'secondary' \| 'success' \| 'warning' \| 'error' \| 'info' \| 'neutral' | 'default' | Badge color |
| size | 'sm' \| 'md' \| 'lg' | 'md' | Badge size |
| removable | boolean | false | Show remove button |
| onRemove | () => void | - | Remove callback |
| leftIcon | ReactNode | - | Icon on the left |

### Avatar Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| src | string | - | Image URL |
| alt | string | 'Avatar' | Alt text |
| size | 'xs' \| 'sm' \| 'md' \| 'lg' \| 'xl' \| '2xl' | 'md' | Avatar size |
| variant | 'circle' \| 'rounded' \| 'square' | 'circle' | Shape |
| fallback | string | - | Text for initials |
| status | 'online' \| 'offline' \| 'away' \| 'busy' | - | Status indicator |
| showStatus | boolean | false | Show status dot |

---

## 📚 Full Documentation

Para documentação completa, veja:
- [Component Library](./COMPONENT_LIBRARY.md)
- [Design System](./DESIGN_SYSTEM.md)
- [Examples](./examples/ComponentShowcase.tsx)

---

## 🐛 Troubleshooting

### Icons não aparecem

Certifique-se de instalar `lucide-react`:
```bash
pnpm add lucide-react
```

### Estilos não aplicados

Verifique se o Tailwind está configurado corretamente:
```js
// tailwind.config.js
content: [
  '../../packages/ui/**/*.{js,ts,jsx,tsx}',
]
```

### Dark mode não funciona

Adicione a classe `dark` no elemento root:
```tsx
<html className="dark">
```

---

**Precisa de ajuda?** Veja a [documentação completa](./COMPONENT_LIBRARY.md) ou os [exemplos](./examples/)
