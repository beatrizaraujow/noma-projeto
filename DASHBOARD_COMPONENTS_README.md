# Dashboard Components Structure

Sistema completo de dashboard seguindo o design "Chattery Echo".

## 📁 Estrutura de Componentes

```
components/
├── Layout/
│   ├── Sidebar.tsx          ✅ Menu lateral com navegação
│   ├── Header.tsx           ✅ Cabeçalho com tabs e busca
│   └── MainContent.tsx      ✅ Container principal
├── Dashboard/
│   ├── MetricCard.tsx       ✅ Cards de métricas com trends
│   ├── SalesChart.tsx       ✅ Gráfico de vendas principal
│   ├── MonthlyProfitCard.tsx ✅ Card de lucro mensal
│   ├── MonthlySalesCard.tsx  ✅ Card de vendas mensais
│   └── OrdersTable.tsx      ✅ Tabela de pedidos
├── UI/
│   ├── Badge.tsx            ✅ Badges com variantes
│   ├── Button.tsx           ✅ Botões customizados
│   ├── Input.tsx            ✅ Inputs com validação
│   ├── Dropdown.tsx         ✅ Dropdown menu
│   └── Card.tsx             ✅ Card base
└── Charts/
    ├── BarChart.tsx         ✅ Gráfico de barras
    ├── LineChart.tsx        ✅ Gráfico de linhas múltiplas
    └── MixedChart.tsx       ✅ Gráfico misto (barras + linhas)
```

## 🎨 Recursos Implementados

### Layout Components
- **Sidebar**: Menu lateral completo com logo, busca, navegação, tools section, banner promocional e logout
- **Header**: Cabeçalho com título, tabs dinâmicas, busca global e notificações
- **MainContent**: Container para conteúdo principal com padding e scroll

### Dashboard Components
- **MetricCard**: Cards de métricas com ícones, valores, trends (up/down), subtítulos
- **SalesChart**: Gráfico de vendas com período selecionável e legendas
- **MonthlyProfitCard**: Card com valor de lucro mensal e gráfico de barras
- **MonthlySalesCard**: Card com vendas mensais e gráfico de linhas
- **OrdersTable**: Tabela completa com filtros, download e status badges

### UI Components
- **Badge**: Componente de badge com 6 variantes (default, success, warning, danger, info, purple)
- **Button**: Botões com 4 variantes (primary, secondary, ghost, danger) e 3 tamanhos
- **Input**: Input field com label, ícone, validação e mensagens de erro
- **Dropdown**: Menu dropdown com ícones e busca
- **Card**: Card base reutilizável

### Charts Components
- **BarChart**: Gráfico de barras vertical com highlight
- **LineChart**: Gráfico de linhas múltiplas (3 séries)
- **MixedChart**: Gráfico misto com barras lado a lado

## 🚀 Como Usar

### Acessar o Dashboard Demo

```bash
npm run dev
```

Acesse: http://localhost:3000/showcase/dashboard-demo

### Usar os Componentes

```tsx
import { Sidebar } from '@/components/Layout/Sidebar';
import { Header } from '@/components/Layout/Header';
import { MetricCard } from '@/components/Dashboard/MetricCard';

<div className="flex h-screen">
  <Sidebar activeItem="dashboard" />
  
  <div className="flex-1 flex flex-col">
    <Header 
      title="Dashboard" 
      tabs={tabs}
      onTabChange={setActiveTab}
    />
    
    <MainContent>
      <MetricCard
        title="Total cost"
        value="$136,755"
        trend={{ value: 12.5, direction: 'up' }}
        icon={<DollarSign size={20} />}
      />
    </MainContent>
  </div>
</div>
```

## 🎨 Design System

### Cores
- **Background Principal**: `#16161a`
- **Background Cards**: `#1a1a1f`
- **Background Inputs**: `#25252b`
- **Borders**: `#2d2d35` / `border-gray-800`
- **Primary**: Purple (`#8b5cf6`)
- **Success**: Green (`#10b981`)
- **Warning**: Orange (`#f97316`)
- **Danger**: Red (`#ef4444`)

### Tipografia
- **Títulos**: Font bold, text-white
- **Subtítulos**: Font medium, text-gray-400
- **Valores**: Font bold, text-2xl/3xl
- **Labels**: Font medium, text-xs uppercase

### Espaçamentos
- **Cards Padding**: `p-6`
- **Grid Gap**: `gap-6`
- **Section Margin**: `mb-6`

## 📱 Responsividade

Todos os componentes são responsivos com breakpoints:
- **Mobile**: Layout em coluna única
- **Tablet** (md): 2 colunas para métricas
- **Desktop** (lg): Grid completo 4 colunas

## ✨ Características

- ✅ Dark theme completo
- ✅ Animações suaves (transitions)
- ✅ Hover states em todos os elementos interativos
- ✅ Ícones do Lucide React
- ✅ Gráficos SVG customizados
- ✅ Sistema de badges com status
- ✅ Tabela com filtros e export
- ✅ Dropdown menus
- ✅ Search bars
- ✅ Notification bell com contador

## 🎯 Próximos Passos

1. Integrar com dados reais (API)
2. Adicionar mais tipos de gráficos (Pie, Donut, Area)
3. Implementar filtros funcionais
4. Adicionar export de dados (CSV, PDF)
5. Criar mais páginas (Analytics, Deals, Customers)
6. Adicionar sistema de notificações real-time

---

**Status**: ✅ Completo e pronto para uso
