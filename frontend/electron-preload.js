const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Platform detection
  isDesktop: true,
  platform: process.platform,
  
  // App control
  closeApp: () => ipcRenderer.invoke('close-app'),
  minimizeApp: () => ipcRenderer.invoke('minimize-app'),
  maximizeApp: () => ipcRenderer.invoke('maximize-app'),
  
  // File operations
  exportProject: (data) => ipcRenderer.invoke('export-project', data),
  importProject: () => ipcRenderer.invoke('import-project'),
  
  // Model operations
  switchModel: (model) => ipcRenderer.invoke('switch-model', model),
  
  // Theme operations
  setTheme: (theme) => ipcRenderer.invoke('set-theme', theme),
  getTheme: () => ipcRenderer.invoke('get-theme'),
  
  // Menu events
  onMenuAction: (callback) => {
    const listeners = {
      'new-project': () => callback('new-project'),
      'export-project': () => callback('export-project'),
      'open-model-guide': () => callback('open-model-guide'),
      'switch-model': (event, model) => callback('switch-model', model)
    };
    
    Object.entries(listeners).forEach(([event, handler]) => {
      ipcRenderer.on(event, handler);
    });
    
    return () => {
      Object.keys(listeners).forEach(event => {
        ipcRenderer.removeAllListeners(event);
      });
    };
  },
  
  // Auto-updater
  checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
  onUpdateAvailable: (callback) => ipcRenderer.on('update-available', callback),
  onUpdateDownloaded: (callback) => ipcRenderer.on('update-downloaded', callback),
  
  // System integration
  openExternal: (url) => ipcRenderer.invoke('open-external', url),
  showInFolder: (path) => ipcRenderer.invoke('show-in-folder', path),
  
  // Notifications
  showNotification: (title, body) => ipcRenderer.invoke('show-notification', { title, body }),
  
  // Store data
  setStoreData: (key, value) => ipcRenderer.invoke('set-store-data', key, value),
  getStoreData: (key) => ipcRenderer.invoke('get-store-data', key),
  deleteStoreData: (key) => ipcRenderer.invoke('delete-store-data', key)
});

// Add desktop-specific styles
window.addEventListener('DOMContentLoaded', () => {
  document.body.classList.add('electron-app');
  
  // Add custom CSS for desktop
  const style = document.createElement('style');
  style.textContent = `
    .electron-app {
      user-select: none;
      -webkit-user-select: none;
    }
    
    .electron-app input,
    .electron-app textarea,
    .electron-app [contenteditable] {
      user-select: text;
      -webkit-user-select: text;
    }
    
    .electron-app .title-bar {
      -webkit-app-region: drag;
    }
    
    .electron-app .title-bar button {
      -webkit-app-region: no-drag;
    }
    
    /* Custom scrollbars for desktop */
    .electron-app ::-webkit-scrollbar {
      width: 8px;
      height: 8px;
    }
    
    .electron-app ::-webkit-scrollbar-track {
      background: #f1f1f1;
      border-radius: 4px;
    }
    
    .electron-app ::-webkit-scrollbar-thumb {
      background: #c1c1c1;
      border-radius: 4px;
    }
    
    .electron-app ::-webkit-scrollbar-thumb:hover {
      background: #a8a8a8;
    }
  `;
  document.head.appendChild(style);
}); 