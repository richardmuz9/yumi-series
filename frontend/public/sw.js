// Yumi Series Service Worker
const CACHE_NAME = 'yumi-series-v1.0.0'
const STATIC_CACHE = 'yumi-static-v1'
const DYNAMIC_CACHE = 'yumi-dynamic-v1'
const API_CACHE = 'yumi-api-v1'

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/yumi-tusr.png',
  '/pwa-192.svg',
  '/pwa-512.svg',
  '/screenshot-narrow.svg',
  '/screenshot-wide.svg'
]

// API endpoints to cache
const API_ENDPOINTS = [
  '/api/settings',
  '/api/web-builder/templates',
  '/api/web-builder/components',
  '/api/post-generator/templates',
  '/api/writing-helper/templates'
]

// Install event - cache static assets
self.addEventListener('install', event => {
  console.log('SW: Installing...')
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('SW: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('SW: Static assets cached')
        return self.skipWaiting()
      })
      .catch(err => console.error('SW: Cache failed', err))
  )
})

// Activate event - cleanup old caches
self.addEventListener('activate', event => {
  console.log('SW: Activating...')
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== API_CACHE) {
              console.log('SW: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('SW: Cleanup complete')
        return self.clients.claim()
      })
  )
})

// Fetch event - handle all requests
self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Handle different types of requests
  if (request.method === 'GET') {
    if (url.pathname.startsWith('/api/')) {
      // API requests - network first, cache fallback
      event.respondWith(handleApiRequest(request))
    } else if (STATIC_ASSETS.some(asset => url.pathname === asset || url.pathname.endsWith(asset))) {
      // Static assets - cache first
      event.respondWith(handleStaticRequest(request))
    } else {
      // Other requests - network first
      event.respondWith(handleDynamicRequest(request))
    }
  }
})

// Handle API requests with network-first strategy
async function handleApiRequest(request) {
  const url = new URL(request.url)
  const cacheKey = url.pathname + url.search

  try {
    // Try network first
    const response = await fetch(request)
    
    if (response.ok) {
      // Cache successful responses
      const cache = await caches.open(API_CACHE)
      cache.put(cacheKey, response.clone())
    }
    
    return response
  } catch (error) {
    console.log('SW: Network failed, trying cache for', cacheKey)
    
    // Network failed, try cache
    const cache = await caches.open(API_CACHE)
    const cachedResponse = await cache.match(cacheKey)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline fallback for specific endpoints
    if (API_ENDPOINTS.some(endpoint => url.pathname.startsWith(endpoint))) {
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
    
    throw error
  }
}

// Handle static assets with cache-first strategy
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  // Not in cache, fetch from network
  try {
    const response = await fetch(request)
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  } catch (error) {
    console.error('SW: Failed to fetch static asset', request.url)
    throw error
  }
}

// Handle dynamic requests with network-first strategy
async function handleDynamicRequest(request) {
  try {
    const response = await fetch(request)
    
    if (response.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, response.clone())
    }
    
    return response
  } catch (error) {
    // Network failed, try cache
    const cache = await caches.open(DYNAMIC_CACHE)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    // Return offline page for navigation requests
    if (request.mode === 'navigate') {
      const offlineResponse = await cache.match('/')
      if (offlineResponse) {
        return offlineResponse
      }
    }
    
    throw error
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('SW: Background sync triggered', event.tag)
  
  if (event.tag === 'save-draft') {
    event.waitUntil(syncDrafts())
  } else if (event.tag === 'upload-file') {
    event.waitUntil(syncUploads())
  }
})

// Sync drafts when back online
async function syncDrafts() {
  try {
    const drafts = await getStoredDrafts()
    
    for (const draft of drafts) {
      try {
        await fetch('/api/drafts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(draft)
        })
        
        // Remove from local storage after successful sync
        await removeDraft(draft.id)
        
        // Notify user
        self.registration.showNotification('Draft Saved', {
          body: `Your draft "${draft.title}" has been saved to the cloud`,
          icon: '/pwa-192.svg',
          badge: '/pwa-192.svg'
        })
      } catch (error) {
        console.error('SW: Failed to sync draft', draft.id, error)
      }
    }
  } catch (error) {
    console.error('SW: Failed to sync drafts', error)
  }
}

// Sync file uploads when back online
async function syncUploads() {
  try {
    const uploads = await getStoredUploads()
    
    for (const upload of uploads) {
      try {
        const formData = new FormData()
        formData.append('file', upload.file)
        formData.append('metadata', JSON.stringify(upload.metadata))
        
        await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        await removeUpload(upload.id)
        
        self.registration.showNotification('File Uploaded', {
          body: `Your file "${upload.filename}" has been uploaded`,
          icon: '/pwa-192.svg'
        })
      } catch (error) {
        console.error('SW: Failed to sync upload', upload.id, error)
      }
    }
  } catch (error) {
    console.error('SW: Failed to sync uploads', error)
  }
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: 'You have new updates in Yumi Series',
    icon: '/pwa-192.svg',
    badge: '/pwa-192.svg',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/pwa-192.svg'
      },
      {
        action: 'close',
        title: 'Close'
      }
    ]
  }

  if (event.data) {
    const payload = event.data.json()
    options.body = payload.body || options.body
    options.data = { ...options.data, ...payload.data }
  }

  event.waitUntil(
    self.registration.showNotification('Yumi Series', options)
  )
})

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close()

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  } else if (event.action === 'close') {
    // Just close the notification
    return
  } else {
    // Default action - open the app
    event.waitUntil(
      clients.matchAll().then(clientList => {
        if (clientList.length > 0) {
          return clientList[0].focus()
        }
        return clients.openWindow('/')
      })
    )
  }
})

// Share target handling
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url)
  
  if (url.pathname === '/share' && event.request.method === 'POST') {
    event.respondWith(handleSharedContent(event.request))
  }
})

async function handleSharedContent(request) {
  const formData = await request.formData()
  const title = formData.get('title')
  const text = formData.get('text')
  const url = formData.get('url')
  const files = formData.getAll('files')

  // Store shared content for the app to handle
  const sharedData = {
    title,
    text,
    url,
    files: files.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size
    })),
    timestamp: Date.now()
  }

  // Store in IndexedDB for the app to retrieve
  await storeSharedContent(sharedData)

  // Redirect to the app with a shared content indicator
  return Response.redirect('/?shared=true', 302)
}

// Utility functions for IndexedDB operations
async function getStoredDrafts() {
  // Implementation would use IndexedDB to retrieve stored drafts
  return []
}

async function removeDraft(id) {
  // Implementation would remove draft from IndexedDB
}

async function getStoredUploads() {
  // Implementation would use IndexedDB to retrieve stored uploads
  return []
}

async function removeUpload(id) {
  // Implementation would remove upload from IndexedDB
}

async function storeSharedContent(data) {
  // Implementation would store shared content in IndexedDB
}

// Periodic background sync
self.addEventListener('periodicsync', event => {
  if (event.tag === 'content-sync') {
    event.waitUntil(syncContent())
  }
})

async function syncContent() {
  // Sync templates, components, and other cached content
  try {
    const cache = await caches.open(API_CACHE)
    
    for (const endpoint of API_ENDPOINTS) {
      try {
        const response = await fetch(endpoint)
        if (response.ok) {
          await cache.put(endpoint, response.clone())
        }
      } catch (error) {
        console.error('SW: Failed to sync', endpoint, error)
      }
    }
  } catch (error) {
    console.error('SW: Periodic sync failed', error)
  }
}

console.log('SW: Service Worker loaded') 