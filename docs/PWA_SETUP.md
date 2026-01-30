# Guia de Configuração PWA - NUMA

## 🎯 Implementações Realizadas

### 1. Otimização de Queries (Backend)
- ✅ Adicionada paginação nas queries de tasks (`page` e `limit`)
- ✅ Substituído `include` por `select` para reduzir dados transferidos
- ✅ Otimização de queries em `tasks.service.ts` e `projects.service.ts`
- ✅ Índices já configurados no Prisma schema

### 2. React Query - Caching Estratégico
- ✅ Configurações avançadas de cache:
  - `staleTime`: 5 minutos
  - `gcTime`: 10 minutos
  - Retry logic configurado
- ✅ React Query DevTools adicionado para debug
- ✅ Arquivo de configuração customizada por entidade (`query-config.ts`)
- ✅ Query keys organizados para invalidação eficiente

### 3. Responsive Design
- ✅ Breakpoints mobile-first no Tailwind:
  - xs: 375px
  - sm: 640px
  - md: 768px
  - lg: 1024px
  - xl: 1280px
  - 2xl: 1536px
- ✅ Hooks customizados para responsividade:
  - `useMediaQuery`
  - `useIsMobile`
  - `useIsTablet`
  - `useIsDesktop`
  - `useBreakpoint`

### 4. PWA Básico
- ✅ `manifest.json` completo com:
  - Ícones em múltiplos tamanhos
  - Screenshots desktop e mobile
  - Shortcuts para ações rápidas
  - Categorias e tema
- ✅ Service Worker (`sw.js`) com:
  - Cache offline
  - Estratégia Network First
  - Sincronização em background
  - Push notifications
- ✅ Página offline (`offline.html`)
- ✅ Componente `PWAInstaller` para registro automático
- ✅ Meta tags PWA no layout
- ✅ Configurações otimizadas no `next.config.js`

## 📦 Instalação de Dependências

Execute o seguinte comando na pasta `apps/web`:

```bash
pnpm install
```

A dependência `@tanstack/react-query-devtools` já foi adicionada ao `package.json`.

## 🖼️ Gerando Ícones PWA

Você precisará criar os ícones PWA. Recomendações:

### Opção 1: Ferramenta Online (Recomendado)
Use o [PWA Asset Generator](https://www.pwabuilder.com/imageGenerator) ou [RealFaviconGenerator](https://realfavicongenerator.net/):

1. Prepare um logo quadrado de alta qualidade (1024x1024px mínimo)
2. Faça upload na ferramenta
3. Baixe os ícones gerados
4. Coloque-os em `apps/web/public/`

### Opção 2: Usando ImageMagick (Local)
Se tiver ImageMagick instalado:

```bash
# Converter de um logo de alta qualidade
convert logo.png -resize 192x192 public/icon-192x192.png
convert logo.png -resize 256x256 public/icon-256x256.png
convert logo.png -resize 384x384 public/icon-384x384.png
convert logo.png -resize 512x512 public/icon-512x512.png
```

### Ícones Necessários
Coloque estes arquivos em `apps/web/public/`:
- `icon-192x192.png`
- `icon-256x256.png`
- `icon-384x384.png`
- `icon-512x512.png`
- `icon-task.png` (96x96 - para shortcut)
- `icon-projects.png` (96x96 - para shortcut)
- `badge-72x72.png` (para notificações)
- `screenshot-desktop.png` (1280x720)
- `screenshot-mobile.png` (750x1334)

## 🚀 Como Usar

### 1. Usando Query Config Customizado

```typescript
import { useQuery } from '@tanstack/react-query';
import { queryKeys, queryConfig } from '@/lib/query-config';

// Exemplo: buscar projetos com cache otimizado
const { data: projects } = useQuery({
  queryKey: queryKeys.projects.all(workspaceId),
  queryFn: () => fetchProjects(workspaceId),
  ...queryConfig.entities.projects,
});
```

### 2. Usando Hooks Responsivos

```typescript
import { useIsMobile, useBreakpoint } from '@/hooks/useResponsive';

function MyComponent() {
  const isMobile = useIsMobile();
  const breakpoint = useBreakpoint();

  return (
    <div className={isMobile ? 'p-2' : 'p-6'}>
      {/* Conteúdo adaptativo */}
    </div>
  );
}
```

### 3. Verificando Status PWA

```typescript
import { useIsPWA, useOnlineStatus } from '@/components/PWAInstaller';

function App() {
  const isPWA = useIsPWA();
  const isOnline = useOnlineStatus();

  return (
    <div>
      {isPWA && <p>Rodando como PWA instalado</p>}
      {!isOnline && <OfflineBanner />}
    </div>
  );
}
```

## 🧪 Testando o PWA

### 1. Desenvolvimento Local
```bash
cd apps/web
pnpm dev
```

Abra Chrome DevTools:
- Application > Service Workers (verificar registro)
- Application > Manifest (verificar configurações)
- Lighthouse > Progressive Web App (auditoria)

### 2. Build de Produção
```bash
pnpm build
pnpm start
```

### 3. Testando Offline
1. Abra o site no navegador
2. Chrome DevTools > Network > Throttling > Offline
3. Navegue pelo site - deve funcionar offline

### 4. Instalando o PWA
1. Chrome: botão "Install" na barra de endereço
2. Edge: botão "App disponível"
3. Mobile: "Adicionar à tela inicial"

## 📊 Métricas de Performance

Após implementação, você deve ver melhorias em:

### Backend
- ⚡ Redução de 30-50% no tamanho das respostas API
- ⚡ Queries mais rápidas com `select` específico
- ⚡ Paginação evita sobrecarga de dados

### Frontend
- ⚡ Menos requisições à API (cache inteligente)
- ⚡ Carregamento mais rápido (PWA cache)
- ⚡ Melhor experiência offline
- ⚡ Lighthouse PWA score > 90

## 🔧 Próximos Passos (Opcional)

### Otimizações Avançadas
1. **Code Splitting**:
   ```typescript
   const TaskDetail = dynamic(() => import('./TaskDetail'), {
     loading: () => <Skeleton />,
   });
   ```

2. **Image Optimization**:
   ```typescript
   import Image from 'next/image';
   
   <Image 
     src="/avatar.png" 
     width={40} 
     height={40}
     loading="lazy"
   />
   ```

3. **Virtual Scrolling** para listas grandes:
   ```bash
   pnpm add react-window
   ```

4. **Background Sync** para ações offline:
   - Implementar fila de sincronização
   - Salvar ações no IndexedDB
   - Sincronizar quando online

5. **Push Notifications**:
   - Configurar servidor push
   - Implementar subscriptions
   - Backend para envio de notificações

## 📱 Compatibilidade

### Service Worker
- ✅ Chrome 40+
- ✅ Firefox 44+
- ✅ Safari 11.1+
- ✅ Edge 17+

### PWA Install
- ✅ Chrome Desktop/Mobile
- ✅ Edge Desktop/Mobile
- ✅ Safari iOS 11.3+
- ⚠️ Firefox (limitado)

## 🐛 Troubleshooting

### Service Worker não registra
```javascript
// Verificar em DevTools > Console
navigator.serviceWorker.getRegistrations().then(console.log);
```

### Cache não funciona
```javascript
// Limpar cache
caches.keys().then(keys => {
  keys.forEach(key => caches.delete(key));
});
```

### Manifest não detectado
- Verificar Content-Type: `application/manifest+json`
- Validar JSON em [Web App Manifest Validator](https://manifest-validator.appspot.com/)

## 📚 Referências

- [Next.js PWA Guide](https://nextjs.org/docs/app/building-your-application/optimizing/metadata#manifest)
- [React Query Best Practices](https://tanstack.com/query/latest/docs/react/guides/important-defaults)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Web.dev PWA](https://web.dev/progressive-web-apps/)
