// Platform detection utilities

declare global {
  interface Window {
    electronAPI?: {
      isDesktop: boolean;
      platform: string;
      onMenuAction: (callback: (action: string, data?: any) => void) => () => void;
      exportProject: (data: any) => Promise<void>;
      switchModel: (model: string) => Promise<void>;
      showNotification: (title: string, body: string) => Promise<void>;
      openExternal: (url: string) => Promise<void>;
      setStoreData: (key: string, value: any) => Promise<void>;
      getStoreData: (key: string) => Promise<any>;
      deleteStoreData: (key: string) => Promise<void>;
    };
  }
}

export const isDesktop = (): boolean => {
  return typeof window !== 'undefined' && 
         window.electronAPI?.isDesktop === true;
};

export const isWeb = (): boolean => {
  return !isDesktop() && !isMobileApp();
};

export const isPWA = (): boolean => {
  return typeof window !== 'undefined' && 
         (window.matchMedia('(display-mode: standalone)').matches ||
          (window.navigator as any).standalone === true ||
          document.referrer.includes('android-app://'));
};

export const getPlatform = (): string => {
  if (isDesktop()) {
    return window.electronAPI?.platform || 'unknown';
  }
  
  if (typeof window !== 'undefined') {
    return window.navigator.platform;
  }
  
  return 'unknown';
};

export const isMobile = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    window.navigator.userAgent
  );
};

export const isMobileApp = (): boolean => {
  // Check if running in Capacitor
  return typeof window !== 'undefined' && !!(window as any).Capacitor;
};

export const isAndroid = (): boolean => {
  return isMobileApp() && /Android/i.test(navigator.userAgent);
};

export const isIOS = (): boolean => {
  return isMobileApp() && /iPhone|iPad|iPod/i.test(navigator.userAgent);
};

export const getAppType = (): 'desktop' | 'pwa' | 'web' | 'mobile' | 'mobile-app' => {
  if (isDesktop()) return 'desktop';
  if (isMobileApp()) return 'mobile-app';
  if (isMobile()) return 'mobile';
  if (isPWA()) return 'pwa';
  return 'web';
};

// Mobile-specific utilities (Capacitor)
export const mobileUtils = {
  showNotification: async (title: string, body: string): Promise<void> => {
    if (isMobileApp()) {
      // Use Capacitor's notification plugin if available
      if ((window as any).Capacitor?.Plugins?.LocalNotifications) {
        const { LocalNotifications } = (window as any).Capacitor.Plugins;
        await LocalNotifications.schedule({
          notifications: [
            {
              title,
              body,
              id: Date.now(),
              schedule: { at: new Date(Date.now() + 1000) }
            }
          ]
        });
        return;
      }
    }
    
    // Fallback to web notifications
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  },

  shareContent: async (content: { title?: string; text?: string; url?: string }): Promise<void> => {
    if (isMobileApp() && (window as any).Capacitor?.Plugins?.Share) {
      const { Share } = (window as any).Capacitor.Plugins;
      await Share.share(content);
      return;
    }
    
    // Fallback to Web Share API
    if (navigator.share) {
      await navigator.share(content);
    }
  },

  openApp: async (url: string): Promise<void> => {
    if (isMobileApp() && (window as any).Capacitor?.Plugins?.App) {
      const { App } = (window as any).Capacitor.Plugins;
      await App.openUrl({ url });
      return;
    }
    
    // Fallback to window.open
    window.open(url, '_blank');
  }
};

// Desktop-specific utilities
export const desktopUtils = {
  exportProject: async (data: any): Promise<void> => {
    if (isDesktop() && window.electronAPI) {
      return window.electronAPI.exportProject(data);
    }
    
    // Fallback for web: download as JSON
    const blob = new Blob([JSON.stringify(data, null, 2)], { 
      type: 'application/json' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yumi-project-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },

  switchModel: async (model: string): Promise<void> => {
    if (isDesktop() && window.electronAPI) {
      return window.electronAPI.switchModel(model);
    }
    // For web, this would be handled by the UI directly
  },

  showNotification: async (title: string, body: string): Promise<void> => {
    if (isDesktop() && window.electronAPI) {
      return window.electronAPI.showNotification(title, body);
    }
    
    // Fallback for web: use Web Notifications API
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    } else if ('Notification' in window && Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification(title, { body });
      }
    }
  },

  openExternal: async (url: string): Promise<void> => {
    if (isDesktop() && window.electronAPI) {
      return window.electronAPI.openExternal(url);
    }
    
    // Fallback for web: open in new tab
    window.open(url, '_blank', 'noopener,noreferrer');
  },

  // Persistent storage (better than localStorage for desktop)
  setData: async (key: string, value: any): Promise<void> => {
    if (isDesktop() && window.electronAPI) {
      return window.electronAPI.setStoreData(key, value);
    }
    
    // Fallback for web: use localStorage
    localStorage.setItem(key, JSON.stringify(value));
  },

  getData: async (key: string): Promise<any> => {
    if (isDesktop() && window.electronAPI) {
      return window.electronAPI.getStoreData(key);
    }
    
    // Fallback for web: use localStorage
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  },

  deleteData: async (key: string): Promise<void> => {
    if (isDesktop() && window.electronAPI) {
      return window.electronAPI.deleteStoreData(key);
    }
    
    // Fallback for web: use localStorage
    localStorage.removeItem(key);
  }
};

// Menu integration for desktop
export const setupDesktopMenus = (callbacks: {
  onNewProject?: () => void;
  onExportProject?: () => void;
  onOpenModelGuide?: () => void;
  onSwitchModel?: (model: string) => void;
}): (() => void) | undefined => {
  if (!isDesktop() || !window.electronAPI) {
    return undefined;
  }

  return window.electronAPI.onMenuAction((action: string, data?: any) => {
    switch (action) {
      case 'new-project':
        callbacks.onNewProject?.();
        break;
      case 'export-project':
        callbacks.onExportProject?.();
        break;
      case 'open-model-guide':
        callbacks.onOpenModelGuide?.();
        break;
      case 'switch-model':
        callbacks.onSwitchModel?.(data);
        break;
    }
  });
}; 