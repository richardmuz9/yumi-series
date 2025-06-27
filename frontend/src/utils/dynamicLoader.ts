import { lazy, ComponentType } from 'react';
import { modeManager } from './modeManager';

type LazyComponentModule = {
  default: ComponentType<any>;
};

type LazyComponentImport = () => Promise<LazyComponentModule>;

const loadComponent = (key: string) => {
  try {
    switch (key) {
      case 'writing-helper':
        return lazy(() => import('../writing-helper/WritingHelperScreen').catch(e => {
          console.error(`Failed to load writing-helper:`, e);
          return { default: () => null };
        }));
      case 'anime-chara':
        return lazy(() => import('../anime-chara-helper/AnimeCharaHelperApp').catch(e => {
          console.error(`Failed to load anime-chara:`, e);
          return { default: () => null };
        }));
      default:
        throw new Error(`Unknown component: ${key}`);
    }
  } catch (error) {
    console.error(`Error in loadComponent for ${key}:`, error);
    return lazy(() => Promise.resolve({ default: () => null }));
  }
};

const preloadInstalledComponents = async () => {
  try {
    // First check if localStorage is available
    const testKey = 'yumi-test-storage';
    try {
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
    } catch (e: unknown) {
      console.warn('localStorage not available:', e);
      return; // Exit early if localStorage is not available
    }

    // Get installed modes from modeManager
    const installedModes = await modeManager.getInstalledModes().catch(e => {
      console.warn('Failed to get installed modes:', e);
      return ['writing-helper', 'anime-chara']; // Fallback to default modes
    });

    // Preload each installed component
    for (const key of installedModes) {
      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add small delay between loads
        const component = loadComponent(key);
        if (component) {
          // Trigger the lazy load
          const modulePromise = (component as any)._payload._result;
          if (modulePromise && typeof modulePromise.then === 'function') {
            await modulePromise.catch(e => {
              console.warn(`Non-critical: Failed to preload ${key}:`, e);
            });
          }
        }
      } catch (error) {
        console.warn(`Non-critical: Failed to preload component ${key}:`, error);
        // Continue with other components even if one fails
      }
    }
  } catch (error) {
    console.warn('Non-critical: Error in preloadInstalledComponents:', error);
    // Don't throw, just log warning as this is a preload operation
  }
};

export const dynamicLoader = {
  /**
   * Load a component dynamically with installation check
   */
  loadComponent: async (key: string): Promise<ComponentType<any> | null> => {
    try {
      // Check if mode is installed
      const isInstalled = await modeManager.isModeInstalled(key);
      if (!isInstalled) {
        console.warn(`Mode ${key} is not installed. Cannot load component.`);
        return null;
      }

      return loadComponent(key);
    } catch (error) {
      console.error(`Failed to load component for mode ${key}:`, error);
      return null;
    }
  },

  /**
   * Preload a component (cache it without rendering)
   */
  preloadComponent: async (key: string): Promise<void> => {
    try {
      await dynamicLoader.loadComponent(key);
    } catch (error) {
      console.error(`Failed to preload component ${key}:`, error);
    }
  },

  /**
   * Preload all installed components
   */
  preloadInstalledComponents,

  /**
   * Clear component cache for a specific mode
   */
  clearComponentCache: (key: string): void => {
    try {
      // Implementation needed
    } catch (error) {
      console.error(`Failed to clear component cache for ${key}:`, error);
    }
  },

  /**
   * Clear all component cache
   */
  clearAllCache: () => {
    try {
      // Implementation needed
    } catch (error) {
      console.error('Failed to clear all component cache:', error);
    }
  },

  /**
   * Get size of component cache
   */
  getCacheSize: () => {
    try {
      // Implementation needed
      return 0; // Placeholder return
    } catch (error) {
      console.error('Failed to get cache size:', error);
      return 0;
    }
  },

  /**
   * Get cached component without loading
   */
  getCachedComponent: (key: string): LazyComponentModule | null => {
    try {
      // Implementation needed
      return null; // Placeholder return
    } catch (error) {
      console.error(`Failed to get cached component ${key}:`, error);
      return null;
    }
  }
}; 