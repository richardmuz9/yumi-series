import { lazy, ComponentType } from 'react';
import { modeManager } from './modeManager';

type LazyComponentModule = {
  default: ComponentType<any>;
};

type LazyComponentImport = () => Promise<LazyComponentModule>;

// Define supported components with proper typing
const SUPPORTED_COMPONENTS: Record<string, () => Promise<{ default: ComponentType<any> }>> = {
  'writing-helper': () => import('../writing-helper/WritingHelperScreen'),
  'anime-chara-helper': () => import('../anime-chara-helper/AnimeCharaHelperApp'),
  'manga': () => import('../manga/MangaApp'),
  'charge-page': () => import('../components/ChargePage'),
};

const loadComponent = (key: string) => {
  try {
    const loader = SUPPORTED_COMPONENTS[key as keyof typeof SUPPORTED_COMPONENTS];
    if (!loader) {
      console.warn(`Skipping unknown component: ${key}`);
      return lazy(() => Promise.resolve({ default: () => null }));
    }

    return lazy(() => loader().catch((e: Error) => {
      console.error(`Failed to load ${key}:`, e);
      return { default: () => null } as { default: ComponentType<any> };
    }));
  } catch (error: unknown) {
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
    } catch (error: unknown) {
      console.warn('localStorage not available:', error);
      return; // Exit early if localStorage is not available
    }

    // Get installed modes from modeManager
    const installedModes = await modeManager.getInstalledModes().catch((error: unknown) => {
      console.warn('Failed to get installed modes:', error);
      return Object.keys(SUPPORTED_COMPONENTS); // Fallback to all supported components
    });

    // Preload each installed component
    for (const key of installedModes) {
      if (!SUPPORTED_COMPONENTS[key as keyof typeof SUPPORTED_COMPONENTS]) {
        console.warn(`Skipping preload of unknown component: ${key}`);
        continue;
      }

      try {
        await new Promise(resolve => setTimeout(resolve, 100)); // Add small delay between loads
        const component = loadComponent(key);
        if (component) {
          // Trigger the lazy load
          const modulePromise = (component as any)._payload._result;
          if (modulePromise && typeof modulePromise.then === 'function') {
            await modulePromise.catch((error: unknown) => {
              console.warn(`Non-critical: Failed to preload ${key}:`, error);
            });
          }
        }
      } catch (error: unknown) {
        console.warn(`Non-critical: Failed to preload component ${key}:`, error);
        // Continue with other components even if one fails
      }
    }
  } catch (error: unknown) {
    console.warn('Non-critical: Error in preloadInstalledComponents:', error);
    // Don't throw, just log warning as this is a preload operation
  }
};

export const dynamicLoader = {
  /**
   * Load a component dynamically with installation check
   */
  loadComponent,

  /**
   * Preload a component (cache it without rendering)
   */
  preloadComponent: async (key: string): Promise<void> => {
    if (!SUPPORTED_COMPONENTS[key as keyof typeof SUPPORTED_COMPONENTS]) {
      console.warn(`Cannot preload unknown component: ${key}`);
      return;
    }
    try {
      const component = loadComponent(key);
      if (component) {
        const modulePromise = (component as any)._payload._result;
        if (modulePromise && typeof modulePromise.then === 'function') {
          await modulePromise;
        }
      }
    } catch (error: unknown) {
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
    // No-op for now - implement if needed
    console.warn('clearComponentCache not implemented');
  },

  /**
   * Clear all component cache
   */
  clearAllCache: () => {
    // No-op for now - implement if needed
    console.warn('clearAllCache not implemented');
  },

  /**
   * Get size of component cache
   */
  getCacheSize: () => {
    return Object.keys(SUPPORTED_COMPONENTS).length;
  },

  /**
   * Get cached component without loading
   */
  getCachedComponent: (key: string): LazyComponentModule | null => {
    if (!SUPPORTED_COMPONENTS[key as keyof typeof SUPPORTED_COMPONENTS]) {
      return null;
    }
    try {
      return require(`../${key}`);
    } catch {
      return null;
    }
  }
}; 