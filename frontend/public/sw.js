// Enhanced Service Worker for Yumi Series PWA
const CACHE_NAME = 'yumi-series-v2.0.0'
const STATIC_CACHE = 'yumi-static-v2.0.0'
const DYNAMIC_CACHE = 'yumi-dynamic-v2.0.0'
const API_CACHE = 'yumi-api-v2.0.0'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/yumi-tusr.png',
  '/pwa-192.svg',
  '/pwa-512.svg',
  // Add critical CSS and JS files
  // These will be auto-generated by build process
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/user',
  '/api/billing/user',
  '/api/models',
  '/api/auth/status'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('🚀 Yumi Series SW: Installing...')
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE).then(cache => {
        console.log('📦 Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  )
})

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('✅ Yumi Series SW: Activating...')
  
  event.waitUntil(
    Promise.all([
      // Clean old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames
            .filter(cacheName => 
              cacheName.startsWith('yumi-') && 
              ![STATIC_CACHE, DYNAMIC_CACHE, API_CACHE].includes(cacheName)
            )
            .map(cacheName => {
              console.log('🗑️ Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            })
        )
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  )
})

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests and chrome-extension URLs
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return
  }

  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    // API requests - Network first with cache fallback
    event.respondWith(handleApiRequest(request))
  } else if (isStaticAsset(url.pathname)) {
    // Static assets - Cache first
    event.respondWith(handleStaticAsset(request))
  } else {
    // Pages - Network first with cache fallback
    event.respondWith(handlePageRequest(request))
  }
})

// API request handler - Network first with cache fallback
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful responses
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('📡 Network failed, trying cache:', request.url)
    
    // Fallback to cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'This feature requires an internet connection',
        offline: true 
      }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Static asset handler - Cache first
async function handleStaticAsset(request) {
  const cache = await caches.open(STATIC_CACHE)
  
  // Try cache first
  const cachedResponse = await cache.match(request)
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Fallback to network
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.log('📦 Asset not available offline:', request.url)
    return new Response('Asset not available offline', { status: 503 })
  }
}

// Page request handler - Network first with cache fallback
async function handlePageRequest(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  
  try {
    // Try network first
    const networkResponse = await fetch(request)
    
    // Cache successful HTML responses
    if (networkResponse.ok && networkResponse.headers.get('content-type')?.includes('text/html')) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.log('🌐 Page offline, trying cache:', request.url)
    
    // Fallback to cache
    const cachedResponse = await cache.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page
    return caches.match('/') // Fallback to main app
  }
}

// Utility function to check if URL is a static asset
function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(pathname)
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Background sync:', event.tag)
  
  if (event.tag === 'background-sync-yumi') {
    event.waitUntil(syncOfflineActions())
  }
})

// Sync offline actions when back online
async function syncOfflineActions() {
  try {
    // Get offline actions from IndexedDB
    const offlineActions = await getOfflineActions()
    
    for (const action of offlineActions) {
      try {
        await fetch(action.url, action.options)
        await removeOfflineAction(action.id)
        console.log('✅ Synced offline action:', action.id)
      } catch (error) {
        console.log('❌ Failed to sync action:', action.id, error)
      }
    }
  } catch (error) {
    console.log('🔄 Background sync failed:', error)
  }
}

// Push notification handler
self.addEventListener('push', event => {
  console.log('🔔 Push notification received')
  
  const options = {
    body: event.data ? event.data.text() : 'New update available!',
    icon: '/pwa-192.svg',
    badge: '/pwa-192.svg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open Yumi Series',
        icon: '/pwa-192.svg'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/pwa-192.svg'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Yumi Series', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification click:', event.action)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Message handler for communication with main app
self.addEventListener('message', event => {
  console.log('💬 SW Message:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

// Utility functions for IndexedDB operations
async function getOfflineActions() {
  // Implement IndexedDB operations for offline action queue
  return []
}

async function removeOfflineAction(id) {
  // Implement IndexedDB removal
  console.log('Removing offline action:', id)
}

console.log('🚀 Yumi Series Service Worker loaded successfully!') 