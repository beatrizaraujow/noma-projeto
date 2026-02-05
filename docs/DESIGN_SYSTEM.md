# NOMA Design System

## 📋 Visão Geral

Este documento define o Design System do NOMA, estabelecendo as diretrizes visuais e de interação para garantir consistência em toda a plataforma.

---

## 🎨 Semana 1: Branding & Design System Foundation

### 1. Logo & Branding

#### Logo Variações
- **Logo Completo**: NOMA (Typography + Icon)
- **Logo Icon Only**: N symbol
- **Logo Light**: Para fundos claros
- **Logo Dark**: Para fundos escuros

#### Espaçamento do Logo
- Mínimo de 16px de clear space ao redor
- Altura mínima: 32px para legibilidade

### 2. Paleta de Cores

#### Primary - Azul Profissional
```
Primary 500 (Main): #3B82F6
Primary 600 (Hover): #2563EB
Primary 700 (Active): #1D4ED8
```

**Uso**: Botões primários, links, elementos de destaque, indicadores de seleção

#### Secondary - Verde Produtividade
```
Secondary 500 (Main): #22C55E
Secondary 600 (Hover): #16A34A
Secondary 700 (Active): #15803D
```

**Uso**: Indicadores de sucesso, badges de status, ações secundárias

#### Neutrals - Escala de Cinzas
```
Neutral 0: #FFFFFF (White)
Neutral 50: #F9FAFB (Background Light)
Neutral 100: #F3F4F6 (Background Alt)
Neutral 200: #E5E7EB (Border Light)
Neutral 300: #D1D5DB (Border)
Neutral 400: #9CA3AF (Placeholder)
Neutral 500: #6B7280 (Text Secondary)
Neutral 600: #4B5563 (Text)
Neutral 700: #374151 (Text Strong)
Neutral 800: #1F2937 (Background Dark Alt)
Neutral 900: #111827 (Text Primary)
Neutral 950: #030712 (Background Dark)
```

#### Semantic Colors

**Success (Verde)**
```
Light: #DCFCE7
Main: #22C55E
Dark: #15803D
```

**Warning (Amarelo)**
```
Light: #FEF3C7
Main: #F59E0B
Dark: #B45309
```

**Error (Vermelho)**
```
Light: #FEE2E2
Main: #EF4444
Dark: #B91C1C
```

**Info (Azul)**
```
Light: #DBEAFE
Main: #3B82F6
Dark: #1E40AF
```

### 3. Tipografia

#### Font Families

**Sans-serif (Principal)**
- Font: Inter
- Fallback: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto
- Uso: Body text, UI elements, general content

**Display (Títulos)**
- Font: Poppins
- Fallback: Inter
- Uso: Headings, hero sections, marketing

**Monospace (Código)**
- Font: JetBrains Mono
- Fallback: Fira Code, Monaco, Consolas
- Uso: Code blocks, technical content

#### Font Sizes

| Token | Size | Pixels | Uso |
|-------|------|--------|-----|
| xs | 0.75rem | 12px | Captions, badges |
| sm | 0.875rem | 14px | Small text, labels |
| base | 1rem | 16px | Body text (default) |
| lg | 1.125rem | 18px | Large body text |
| xl | 1.25rem | 20px | Small headings |
| 2xl | 1.5rem | 24px | H4 |
| 3xl | 1.875rem | 30px | H3 |
| 4xl | 2.25rem | 36px | H2 |
| 5xl | 3rem | 48px | H1 |
| 6xl | 3.75rem | 60px | Display Large |
| 7xl | 4.5rem | 72px | Hero |

#### Font Weights

| Token | Weight | Uso |
|-------|--------|-----|
| light | 300 | Subtle text |
| normal | 400 | Body text |
| medium | 500 | Emphasis |
| semibold | 600 | Subheadings |
| bold | 700 | Headings |
| extrabold | 800 | Hero text |

#### Line Heights

| Token | Value | Uso |
|-------|-------|-----|
| none | 1 | Icons, single line |
| tight | 1.25 | Headings |
| snug | 1.375 | Subheadings |
| normal | 1.5 | Body (default) |
| relaxed | 1.625 | Long-form content |
| loose | 2 | Spacious content |

### 4. Espaçamento (8px Grid System)

| Token | Size | Pixels | Uso |
|-------|------|--------|-----|
| 0 | 0 | 0px | Reset |
| 1 | 0.25rem | 4px | Micro spacing |
| 2 | 0.5rem | 8px | Tight spacing |
| 3 | 0.75rem | 12px | Small spacing |
| 4 | 1rem | 16px | Base spacing |
| 5 | 1.25rem | 20px | Medium spacing |
| 6 | 1.5rem | 24px | Regular spacing |
| 8 | 2rem | 32px | Large spacing |
| 10 | 2.5rem | 40px | XL spacing |
| 12 | 3rem | 48px | Section spacing |
| 16 | 4rem | 64px | Large section |
| 20 | 5rem | 80px | XL section |
| 24 | 6rem | 96px | Hero spacing |
| 32 | 8rem | 128px | Massive spacing |

**Regra de ouro**: Use múltiplos de 4px para manter o grid consistente

### 5. Border Radius System

| Token | Size | Pixels | Uso |
|-------|------|--------|-----|
| none | 0 | 0px | Sharp edges |
| xs | 0.125rem | 2px | Minimal rounding |
| sm | 0.25rem | 4px | Small elements |
| md | 0.375rem | 6px | Default buttons |
| lg | 0.5rem | 8px | Cards, panels |
| xl | 0.75rem | 12px | Large cards |
| 2xl | 1rem | 16px | Modals |
| 3xl | 1.5rem | 24px | Hero cards |
| full | 9999px | - | Pills, avatars |

### 6. Shadow System (Elevation)

#### Standard Shadows

| Level | Token | Uso |
|-------|-------|-----|
| 0 | none | Flat elements |
| 1 | xs | Subtle lift |
| 2 | sm | Hover states |
| 3 | md | Cards (default) |
| 4 | lg | Dropdowns |
| 5 | xl | Modals |
| 6 | 2xl | High elevation |

#### Elevations (Material Design)

```css
/* Elevation 1 - Cards resting */
box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);

/* Elevation 2 - Cards hover, buttons */
box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);

/* Elevation 3 - Dropdowns, popovers */
box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);

/* Elevation 4 - Modals */
box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);

/* Elevation 5 - High elevation */
box-shadow: 0 25px 50px -12px rgb(0 0 0 / 0.25);
```

### 7. Transitions & Animations

#### Duration
```
fast: 150ms
normal: 200ms (default)
slow: 300ms
slower: 500ms
```

#### Timing Functions
```
ease: Padrão suave
easeIn: Aceleração gradual
easeOut: Desaceleração gradual (UI interactions)
easeInOut: Aceleração e desaceleração
linear: Velocidade constante
```

**Recomendação**: Use `easeOut` para a maioria das interações de UI

### 8. Z-Index Layers

| Layer | Value | Uso |
|-------|-------|-----|
| base | 0 | Default content |
| dropdown | 1000 | Dropdown menus |
| sticky | 1020 | Sticky headers |
| fixed | 1030 | Fixed elements |
| modalBackdrop | 1040 | Modal overlay |
| modal | 1050 | Modal content |
| popover | 1060 | Popovers, tooltips |
| tooltip | 1070 | Tooltips (highest) |

### 9. Breakpoints (Responsividade)

| Token | Size | Uso |
|-------|------|-----|
| xs | 375px | Mobile small |
| sm | 640px | Mobile large |
| md | 768px | Tablet |
| lg | 1024px | Desktop small |
| xl | 1280px | Desktop |
| 2xl | 1536px | Desktop large |

---

## 📦 Implementação

### Uso no Código

```typescript
import { designTokens } from '@nexora/config/design-tokens';

// Acessar cores
const primaryColor = designTokens.colors.primary[500];

// Acessar espaçamento
const spacing = designTokens.spacing[4];

// Acessar sombras
const cardShadow = designTokens.shadows.elevation[2];
```

### Uso com Tailwind CSS

Todos os tokens estão configurados no `tailwind.config.js`:

```jsx
// Cores
<div className="bg-primary-500 text-neutral-0">

// Espaçamento
<div className="p-4 mt-6 mb-8">

// Border Radius
<div className="rounded-lg">

// Shadows
<div className="shadow-md hover:shadow-lg">
```

---

## 🎯 Próximos Passos

### Semana 2: Component Library (em planejamento)
- Buttons (Primary, Secondary, Outline, Ghost)
- Inputs (Text, Textarea, Select, Checkbox, Radio)
- Cards
- Badges & Tags
- Tooltips
- Modals
- Navigation components

### Semana 3-4: Core Screens (em planejamento)
- Login & Auth screens
- Dashboard
- Project views
- Task management
- Settings

---

## 📚 Recursos

- [Figma Design File](#) (A ser criado)
- [Storybook Components](#) (A ser implementado)
- [Design Tokens Package](../packages/config/design-tokens.ts)

---

**Versão**: 1.0.0  
**Última atualização**: Semana 1 - Foundation  
**Mantido por**: Design Team
