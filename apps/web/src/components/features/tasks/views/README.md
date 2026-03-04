# Views de Tarefas

Este diretório contém diferentes visualizações para as tarefas do projeto.

## Componentes Disponíveis

### 1. ViewSwitcher
O componente principal que gerencia a alternância entre diferentes views.

**Funcionalidades:**
- Tabs para alternar entre views (Kanban, Lista, Calendário, Timeline)
- Persistência da preferência do usuário no localStorage
- Interface responsiva com ícones

**Uso:**
```tsx
<ViewSwitcher
  tasks={filteredTasks}
  projectId={projectId}
  ListViewComponent={TaskListView}
  CalendarViewComponent={TaskCalendarView}
  TimelineViewComponent={TaskTimelineView}
  KanbanViewComponent={KanbanBoard}
/>
```

### 2. TaskListView
Visualização em lista agrupada por status.

**Funcionalidades:**
- Agrupamento automático por status (A Fazer, Em Progresso, Revisão, Concluído)
- Badges coloridos de prioridade
- Informações do responsável
- Data de entrega formatada
- Click para navegar para detalhes da tarefa

**Características:**
- Layout em cards com hover effect
- Cores distintas por prioridade (LOW, MEDIUM, HIGH, URGENT)
- Contador de tarefas por status

### 3. TaskCalendarView
Visualização em calendário usando `react-big-calendar`.

**Funcionalidades:**
- Visualizações: Mês, Semana, Dia
- Cores baseadas em prioridade e status
- Localização em português (pt-br)
- Event cards customizados mostrando prioridade e responsável
- Click para navegar para detalhes da tarefa

**Características:**
- Verde para tarefas concluídas
- Vermelho para urgentes
- Laranja para alta prioridade
- Azul para média prioridade
- Cinza para baixa prioridade

### 4. TaskTimelineView
Visualização em linha do tempo cronológica.

**Funcionalidades:**
- Ordenação por data de entrega
- Agrupamento por mês
- Indicadores visuais:
  - Destaque para tarefas de hoje (azul pulsante)
  - Alerta para tarefas atrasadas (vermelho)
  - Linha do tempo com pontos conectados
- Cores de borda por prioridade
- Cores de fundo por status
- Click para navegar para detalhes da tarefa

**Características:**
- Mostra apenas tarefas com data de entrega
- Formatação de datas em português
- Layout vertical com timeline visual

## Preferências do Usuário

A preferência de view é salva automaticamente no localStorage com a chave:
```
project-{projectId}-view
```

Valores possíveis:
- `kanban`
- `list`
- `calendar`
- `timeline`

## Dependências

- `react-big-calendar`: Calendário interativo
- `moment`: Localização de datas
- `@types/react-big-calendar`: Tipos TypeScript
- `lucide-react`: Ícones
- `next/navigation`: Roteamento

## Tipos

Todas as views utilizam a mesma interface `Task`:

```typescript
interface Task {
  id: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  dueDate?: string;
  position: number;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  _count?: {
    comments: number;
  };
}
```

## Futuras Melhorias

- [ ] Gantt chart view
- [ ] Board view customizável
- [ ] Filtros por view
- [ ] Exportação de dados por view
- [ ] Preferências de usuário no backend
- [ ] Views personalizadas salvas
