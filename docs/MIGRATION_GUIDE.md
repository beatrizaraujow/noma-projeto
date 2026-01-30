# 🔄 Guia de Migração - Performance Optimizations

## Como migrar componentes existentes para usar as otimizações

### 1. Migrar de Axios direto para API Client

#### Antes:
```tsx
import axios from 'axios';
import { useSession } from 'next-auth/react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function Component() {
  const { data: session } = useSession();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [projectId]);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `${API_URL}/api/tasks/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${(session as any)?.accessToken}`,
          },
        }
      );
      setTasks(response.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {loading ? <Loading /> : tasks.map(task => <TaskCard task={task} />)}
    </div>
  );
}
```

#### Depois:
```tsx
import { useTasks } from '@/hooks/useQueries';

function Component() {
  const { data: tasks, isLoading, error } = useTasks(projectId);

  if (isLoading) return <Loading />;
  if (error) return <Error error={error} />;

  return (
    <div>
      {tasks?.map(task => <TaskCard task={task} />)}
    </div>
  );
}
```

**Benefícios:**
- ✅ 10 linhas vs 30+ linhas
- ✅ Cache automático
- ✅ Refetch inteligente
- ✅ Estados de loading/error gerenciados
- ✅ Sem necessidade de useEffect

---

### 2. Migrar mutations (create, update, delete)

#### Antes:
```tsx
const createTask = async (taskData) => {
  try {
    await axios.post(
      `${API_URL}/api/tasks`,
      taskData,
      {
        headers: {
          Authorization: `Bearer ${(session as any)?.accessToken}`,
        },
      }
    );
    // Recarregar lista manualmente
    loadTasks();
  } catch (error) {
    console.error('Error:', error);
    alert('Erro ao criar tarefa');
  }
};
```

#### Depois:
```tsx
import { useCreateTask } from '@/hooks/useQueries';

function Component() {
  const createTask = useCreateTask();

  const handleCreate = async (taskData) => {
    try {
      await createTask.mutateAsync(taskData);
      // Cache atualizado automaticamente!
    } catch (error) {
      console.error('Error:', error);
      alert('Erro ao criar tarefa');
    }
  };

  return (
    <button 
      onClick={() => handleCreate(data)}
      disabled={createTask.isPending}
    >
      {createTask.isPending ? 'Criando...' : 'Criar Tarefa'}
    </button>
  );
}
```

**Benefícios:**
- ✅ Invalidação automática do cache
- ✅ Atualização otimista (UI atualiza antes da resposta)
- ✅ Rollback automático em caso de erro
- ✅ Estado de loading gerenciado

---

### 3. Migrar para responsive design

#### Antes:
```tsx
function TaskCard({ task }) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className={isMobile ? 'p-2 text-sm' : 'p-4 text-base'}>
      {/* content */}
    </div>
  );
}
```

#### Depois:
```tsx
import { useDeviceInfo } from '@/hooks/useResponsive';

function TaskCard({ task }) {
  const { isMobile, isTouch } = useDeviceInfo();

  return (
    <div className={isMobile ? 'p-2 text-sm' : 'p-4 text-base'}>
      {!isTouch && <HoverEffects />}
      {/* content */}
    </div>
  );
}
```

**Ou usando classes CSS:**
```tsx
import { responsive } from '@/hooks/useResponsive';

function TaskCard({ task }) {
  return (
    <>
      <div className={responsive.mobile}>
        {/* Layout mobile */}
      </div>
      <div className={responsive.desktop}>
        {/* Layout desktop */}
      </div>
    </>
  );
}
```

---

### 4. Adicionar debounce em search

#### Antes:
```tsx
function SearchBar() {
  const [query, setQuery] = useState('');

  const handleSearch = async (value) => {
    // Chamado em cada tecla digitada 😱
    const results = await api.search(value);
    setResults(results);
  };

  return (
    <input 
      onChange={(e) => handleSearch(e.target.value)}
    />
  );
}
```

#### Depois:
```tsx
import { debounce } from '@/lib/performance';
import { useGlobalSearch } from '@/hooks/useQueries';

function SearchBar() {
  const [query, setQuery] = useState('');
  const { data: results, isLoading } = useGlobalSearch(query, query.length >= 3);

  // Debounce no setState
  const handleChange = debounce((value) => {
    setQuery(value);
  }, 300);

  return (
    <input 
      onChange={(e) => handleChange(e.target.value)}
      placeholder="Digite no mínimo 3 caracteres..."
    />
  );
}
```

**Benefícios:**
- ✅ Aguarda usuário parar de digitar
- ✅ Reduz requisições em 90%
- ✅ Melhor performance
- ✅ Cache automático

---

### 5. Lazy loading de componentes pesados

#### Antes:
```tsx
import HeavyChart from './HeavyChart';

function Dashboard() {
  return (
    <div>
      <HeavyChart data={data} />
    </div>
  );
}
```

#### Depois:
```tsx
import { Suspense } from 'react';
import { lazyWithRetry } from '@/lib/performance';

const HeavyChart = lazyWithRetry(() => import('./HeavyChart'));

function Dashboard() {
  return (
    <div>
      <Suspense fallback={<ChartSkeleton />}>
        <HeavyChart data={data} />
      </Suspense>
    </div>
  );
}
```

**Benefícios:**
- ✅ Bundle inicial menor
- ✅ Carregamento sob demanda
- ✅ Retry automático em caso de falha
- ✅ Loading state elegante

---

### 6. Monitorar performance de operações

#### Antes:
```tsx
async function loadDashboard() {
  const data = await fetchData();
  processData(data);
}
```

#### Depois:
```tsx
import { measurePerformance } from '@/lib/performance';

async function loadDashboard() {
  const measure = measurePerformance('Load Dashboard');
  
  const data = await fetchData();
  processData(data);
  
  measure.end(); // Log: [Performance] Load Dashboard: 245.32ms
}
```

---

### 7. Detectar conexão lenta

#### Antes:
```tsx
function VideoPlayer() {
  return <video src="high-quality.mp4" />;
}
```

#### Depois:
```tsx
import { useNetworkStatus } from '@/lib/performance';

function VideoPlayer() {
  const { isSlowConnection, isOnline } = useNetworkStatus();

  if (!isOnline) return <OfflineMessage />;
  
  return (
    <video 
      src={isSlowConnection ? 'low-quality.mp4' : 'high-quality.mp4'} 
    />
  );
}
```

---

## 📋 Checklist de Migração por Componente

Para cada componente, verifique:

- [ ] Substituir axios direto por hooks `useQueries`
- [ ] Remover useState/useEffect desnecessários
- [ ] Adicionar debounce em inputs de search
- [ ] Usar `useDeviceInfo` para responsive
- [ ] Lazy loading de componentes pesados
- [ ] Medir performance de operações críticas

## 🎯 Prioridade de Migração

### Alta Prioridade
1. **Páginas principais** - [page.tsx, projects/[id]/page.tsx]
2. **Componentes que fazem fetch** - TaskList, ActivityLog, CommentsList
3. **Search components** - GlobalSearch, SearchModal

### Média Prioridade
4. **Modals e Dialogs**
5. **Sidebar e Navigation**
6. **Forms**

### Baixa Prioridade
7. **Componentes puramente visuais**
8. **Componentes sem estado**

## ⚠️ Atenção

### NÃO migre se:
- Componente é puramente visual (sem fetch)
- Componente já está otimizado de outra forma
- Seria overengineering para o caso de uso

### SEMPRE migre se:
- Faz requisições HTTP
- Tem useEffect com fetch
- Precisa de cache
- Usa muito useState para loading/error

---

## 📚 Exemplos Práticos

Veja exemplos completos em:
- [PERFORMANCE_GUIDE.md](./PERFORMANCE_GUIDE.md)
- [Código atual em apps/web/src/hooks/useQueries.ts](../apps/web/src/hooks/useQueries.ts)

## 🆘 Ajuda

Se tiver dúvidas:
1. Verifique a [documentação oficial do React Query](https://tanstack.com/query/latest)
2. Use o React Query DevTools para debug
3. Confira os exemplos neste guia
