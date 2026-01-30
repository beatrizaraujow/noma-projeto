// Service Worker para PWA - Versão otimizada
const CACHE_VERSION = '1.0.0';
const CACHE_NAME = `numa-static-v${CACHE_VERSION}`;
const RUNTIME_CACHE = `numa-runtime-v${CACHE_VERSION}`;
const IMAGE_CACHE = `numa-images-v${CACHE_VERSION}`;

// Arquivos para cache offline
const STATIC_CACHE_URLS = [
  '/',
  '/login',
  '/manifest.json',
  '/offline.html',
];

// Tamanhos máximos de cache
const MAX_RUNTIME_CACHE_SIZE = 50;
const MAX_IMAGE_CACHE_SIZE = 30;

// Função para limpar caches antigos por tamanho
async function trimCache(cacheName, maxItems) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length > maxItems) {
    await cache.delete(keys[0]);
    return trimCache(cacheName, maxItems);
  }
}

// Instalar service worker e fazer cache dos arquivos estáticos
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_CACHE_URLS);
      })
      .then(() => self.skipWaiting())
  );
});

// Ativar service worker e limpar caches antigos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => 
            name.startsWith('numa-') && 
            name !== CACHE_NAME && 
            name !== RUNTIME_CACHE &&
            name !== IMAGE_CACHE
          )
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => {
      console.log('[SW] Service worker activated');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições e servir do cache quando offline
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições que não são GET
  if (request.method !== 'GET') {
    return;
  }

  // Ignorar requisições de outros domínios (exceto imagens)
  if (url.origin !== location.origin && !request.destination === 'image') {
    return;
  }

  // Estratégia para imagens: Cache First
  if (request.destination === 'image') {
    event.respondWith(
      caches.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request).then((response) => {
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(IMAGE_CACHE).then((cache) => {
              cache.put(request, responseToCache);
              trimCache(IMAGE_CACHE, MAX_IMAGE_CACHE_SIZE);
            });
          }
          return response;
        });
      })
    );
    return;
  }

  // Estratégia para API: Network First com fallback
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Cachear apenas GETs bem-sucedidos
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(RUNTIME_CACHE).then((cache) => {
              cache.put(request, responseToCache);
              trimCache(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
            });
          }
          return response;
        })
        .catch(() => {
          // Tentar servir do cache se offline
          return caches.match(request).then((cachedResponse) => {
            return cachedResponse || new Response(
              JSON.stringify({ 
                error: 'Sem conexão com a internet',
                offline: true 
              }),
              {
                headers: { 'Content-Type': 'application/json' },
                status: 503,
              }
            );
          });
        })
    );
    return;
  }

  // Estratégia para páginas: Network First, fallback para cache
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cachear apenas respostas bem-sucedidas
        if (response.status === 200) {
          const responseToCache = response.clone();
          caches.open(RUNTIME_CACHE).then((cache) => {
            cache.put(request, responseToCache);
            trimCache(RUNTIME_CACHE, MAX_RUNTIME_CACHE_SIZE);
          });
        }
        return response;
      })
      .catch(() => {
        // Se a rede falhar, tentar servir do cache
        return caches.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }

          // Se não houver no cache, retornar página offline para navegação
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }

          return new Response('Recurso não disponível offline', {
            status: 503,
            statusText: 'Service Unavailable',
          });
        });
      })
  );
});

// Sincronização em background
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});

async function syncTasks() {
  console.log('[SW] Syncing tasks...');
  // Implementar lógica de sincronização
  // Por exemplo, enviar tarefas pendentes que foram criadas offline
}

// Notificações push (opcional)
self.addEventListener('push', (event) => {
  const data = event.data?.json() ?? {};
  const title = data.title || 'Nova notificação';
  const options = {
    body: data.body || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    data: data.url,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Ação ao clicar na notificação
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data) {
    event.waitUntil(
      clients.openWindow(event.notification.data)
    );
  }
});
