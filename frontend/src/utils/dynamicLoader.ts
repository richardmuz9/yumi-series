import { lazy, ComponentType } from 'react';
import { modeManager } from './modeManager';

type LazyComponentModule = {
  default: ComponentType<any>;
};

type LazyComponentImport = () => Promise<LazyComponentModule>;

const loadComponent = (key: string) => {
  switch (key) {
    case 'writing-helper':
      return lazy(() => import('../writing-helper/WritingHelperApp'));
    case 'anime-chara':
      return lazy(() => import('../anime-chara-helper/AnimeCharaHelperApp'));
    default:
      throw new Error(`Unknown component: ${key}`);
  }
};

const preloadInstalledComponents = () => {
  // Preload components that are installed by default
  const defaultComponents = ['writing-helper', 'anime-chara'];
  defaultComponents.forEach(key => {
    try {
      loadComponent(key);
    } catch (error) {
      console.error(`Failed to preload component ${key}:`, error);
    }
  });
};

export const dynamicLoader = {
  /**
   * Load a component dynamically with installation check
   */
  loadComponent: async (key: string): Promise<ComponentType<any> | null> => {
    // Check if mode is installed
    const isInstalled = await modeManager.isModeInstalled(key);
    if (!isInstalled) {
      console.warn(`Mode ${key} is not installed. Cannot load component.`);
      return null;
    }

    try {
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
    await dynamicLoader.loadComponent(key);
  },

  /**
   * Preload all installed components
   */
  preloadInstalledComponents,

  /**
   * Clear component cache for a specific mode
   */
  clearComponentCache: (key: string): void => {
    // Implementation needed
  },

  /**
   * Clear all component cache
   */
  clearAllCache: () => {
    // Implementation needed
  },

  /**
   * Get size of component cache
   */
  getCacheSize: () => {
    // Implementation needed
    return 0; // Placeholder return, actual implementation needed
  },

  /**
   * Get cached component without loading
   */
  getCachedComponent: (key: string): LazyComponentModule | null => {
    // Implementation needed
    return null; // Placeholder return, actual implementation needed
  }
}; 