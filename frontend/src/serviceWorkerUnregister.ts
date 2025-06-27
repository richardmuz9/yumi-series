export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then(registration => {
        registration.unregister()
          .then(() => {
            // Clear all caches
            if ('caches' in window) {
              caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                  caches.delete(cacheName);
                });
              });
            }
          });
      })
      .catch(error => {
        console.error('Error unregistering service worker:', error);
      });
  }
} 