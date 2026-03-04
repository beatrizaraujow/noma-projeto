# Dashboard Components - Guia de Customização

## 🎨 Exemplos de Uso

### Exemplo 1: Dashboard Básico

```tsx
import { Sidebar, Header, MainContent } from '@/components/Layout';
import { MetricCard } from '@/components/Dashboard';
import { DollarSign } from 'lucide-react';

export default function Page() {
  return (
    <div className="flex h-screen">
      <Sidebar activeItem="dashboard" />
      
      <div className="flex-1 flex flex-col">
        <Header title="Dashboard" />
        
        <MainContent>
          <div className="grid grid-cols-4 gap-6">
            <MetricCard
              title="Revenue"
              value="$45,231"
              trend={{ value: 12, direction: 'up' }}
              icon={<DollarSign size={20} />}
            />
          </div>
        </MainContent>
      </div>
    </div>
  );
}
```

### Exemplo 2: Customização de Cores

```tsx
<MetricCard
  title="Total Sales"
  value="$136,755"
  icon={<ShoppingCart size={20} />}
  iconBgColor="bg-gradient-to-br from-purple-500 to-pink-500"
  iconColor="text-white"
/>
```

### Exemplo 3: Tabela com Dados Dinâmicos

```tsx
const orders = [
  {
    id: 'ORD001',
    customer: 'John Doe',
    order: 'Product A',
    cost: '$99.99',
    dueDate: '15 Feb, 2026',
    deliveryStatus: 'Completed',
    payment: 'Credit Card'
  },
  // ... mais pedidos
];

<OrdersTable orders={orders} title="Recent Orders" />
```

### Exemplo 4: Gráfico Personalizado

```tsx
const salesData = [
  { month: 'Jan', revenue: 45000, orders: 320 },
  { month: 'Feb', revenue: 52000, orders: 380 },
  { month: 'Mar', revenue: 48000, orders: 350 },
  // ... mais meses
];

<SalesChart 
  title="Sales Performance" 
  data={salesData}
  period="Q1 2026"
/>
```

### Exemplo 5: Badges com Diferentes Status

```tsx
import { Badge } from '@/components/UI';

<div className="flex gap-2">
  <Badge variant="success">Active</Badge>
  <Badge variant="warning">Pending</Badge>
  <Badge variant="danger">Cancelled</Badge>
  <Badge variant="info">Processing</Badge>
  <Badge variant="purple">Premium</Badge>
</div>
```

### Exemplo 6: Formulário com Inputs

```tsx
import { Input, Button } from '@/components/UI';
import { Search, Mail } from 'lucide-react';

<form className="space-y-4">
  <Input 
    label="Email"
    type="email"
    placeholder="seu@email.com"
    icon={<Mail size={16} />}
  />
  
  <Input 
    label="Buscar"
    type="text"
    placeholder="Digite para buscar..."
    icon={<Search size={16} />}
  />
  
  <Button variant="primary" size="lg">
    Enviar
  </Button>
</form>
```

### Exemplo 7: Header com Tabs Dinâmicas

```tsx
const [activeTab, setActiveTab] = useState('overview');

const tabs = [
  { id: 'overview', label: 'Overview', active: activeTab === 'overview' },
  { id: 'analytics', label: 'Analytics', active: activeTab === 'analytics' },
  { id: 'reports', label: 'Reports', active: activeTab === 'reports' },
];

<Header 
  title="Dashboard" 
  tabs={tabs}
  onTabChange={setActiveTab}
/>
```

### Exemplo 8: Gráfico de Barras Standalone

```tsx
import { BarChart } from '@/components/Charts';

const data = [
  { label: 'Jan', value: 4200 },
  { label: 'Feb', value: 3800 },
  { label: 'Mar', value: 4500 },
  { label: 'Apr', value: 5200 },
];

<div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
  <h3 className="text-white mb-4">Monthly Performance</h3>
  <BarChart 
    data={data}
    height={200}
    barColor="#8b5cf6"
    highlightIndex={3}
  />
</div>
```

### Exemplo 9: Dropdown de Filtros

```tsx
import { Dropdown } from '@/components/UI';
import { Calendar, Users, Tag } from 'lucide-react';

const periodOptions = [
  { value: 'today', label: 'Today', icon: <Calendar size={16} /> },
  { value: 'week', label: 'This Week', icon: <Calendar size={16} /> },
  { value: 'month', label: 'This Month', icon: <Calendar size={16} /> },
  { value: 'year', label: 'This Year', icon: <Calendar size={16} /> },
];

<Dropdown
  options={periodOptions}
  value={selectedPeriod}
  onChange={setSelectedPeriod}
  placeholder="Select period"
/>
```

### Exemplo 10: Layout Completo Responsivo

```tsx
<MainContent>
  {/* Métricas - 4 colunas em desktop, 2 em tablet, 1 em mobile */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
    <MetricCard {...metric1} />
    <MetricCard {...metric2} />
    <MetricCard {...metric3} />
    <MetricCard {...metric4} />
  </div>

  {/* Gráficos - 2/3 e 1/3 em desktop, coluna única em mobile */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
    <div className="lg:col-span-2">
      <SalesChart />
    </div>
    <div>
      <MonthlyProfitCard />
    </div>
  </div>

  {/* Tabela e card lateral */}
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
    <div className="lg:col-span-2">
      <OrdersTable />
    </div>
    <div>
      <MonthlySalesCard />
    </div>
  </div>
</MainContent>
```

## 🎨 Temas e Cores Customizadas

### Variações de Cards

```tsx
// Card escuro padrão
<div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6">
  Conteúdo
</div>

// Card com gradiente
<div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
  Conteúdo em destaque
</div>

// Card com hover
<div className="bg-[#1a1a1f] border border-gray-800 rounded-xl p-6 hover:border-purple-500 transition-colors cursor-pointer">
  Card clicável
</div>
```

### Botões Customizados

```tsx
// Botão com ícone
<Button variant="primary">
  <Save size={16} className="mr-2" />
  Salvar
</Button>

// Botão de loading
<Button variant="primary" disabled>
  <Loader2 size={16} className="mr-2 animate-spin" />
  Carregando...
</Button>

// Grupo de botões
<div className="flex gap-2">
  <Button variant="secondary">Cancelar</Button>
  <Button variant="primary">Confirmar</Button>
</div>
```

## 📊 Dicas de Performance

1. **Lazy Loading**: Use `React.lazy()` para componentes pesados
2. **Memoização**: Use `React.memo()` em componentes que não mudam frequentemente
3. **Virtual Scrolling**: Para tabelas com muitos dados, considere usar react-window
4. **Data Fetching**: Use SWR ou React Query para cache inteligente

## 🎯 Boas Práticas

1. **Tipagem**: Sempre defina interfaces TypeScript para props
2. **Acessibilidade**: Use ARIA labels e navegação por teclado
3. **Responsividade**: Teste em diferentes tamanhos de tela
4. **Performance**: Evite re-renders desnecessários
5. **Consistência**: Mantenha o design system em todos os componentes

---

**Documentação completa**: Ver [DASHBOARD_COMPONENTS_README.md](./DASHBOARD_COMPONENTS_README.md)
