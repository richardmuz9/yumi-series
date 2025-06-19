import { lazy, ComponentType } from 'react';
import { modeManager } from './modeManager';

type LazyComponent = ComponentType<any>;

// Cache for loaded components
const componentCache = new Map<string, LazyComponent>();

/**
 * Dynamic component loader that checks if a mode is installed before loading
 */
export class DynamicLoader {
  /**
   * Load a component dynamically with installation check
   */
  static async loadComponent(modeId: string): Promise<LazyComponent | null> {
    // Check if mode is installed
    const isInstalled = await modeManager.isModeInstalled(modeId);
    if (!isInstalled) {
      console.warn(`Mode ${modeId} is not installed. Cannot load component.`);
      return null;
    }

    // Check cache first
    if (componentCache.has(modeId)) {
      return componentCache.get(modeId)!;
    }

    try {
      let component: LazyComponent;

      // Load component based on mode
      switch (modeId) {
        case 'web-builder':
          component = lazy(() => import('../webbuilder/WebBuilder'));
          break;
        
        case 'writing-helper':
          component = lazy(() => import('../writing-helper/WritingHelperApp'));
          break;
        
        case 'report-writer':
          component = lazy(() => import('../report-writer/ReportWriterApp'));
          break;
        
        case 'anime-chara-helper':
          component = lazy(() => import('../anime-chara-helper/AnimeCharaHelperApp'));
          break;
        
        case 'study-advisor':
          component = lazy(() => import('../study-advisor/StudyAdvisorApp'));
          break;
        
        default:
          console.error(`Unknown mode: ${modeId}`);
          return null;
      }

      // Cache the component
      componentCache.set(modeId, component);
      
      // Log usage when component is loaded
      await modeManager.logModeUsage(modeId);
      
      return component;
    } catch (error) {
      console.error(`Failed to load component for mode ${modeId}:`, error);
      return null;
    }
  }

  /**
   * Preload a component (cache it without rendering)
   */
  static async preloadComponent(modeId: string): Promise<void> {
    await this.loadComponent(modeId);
  }

  /**
   * Preload all installed components
   */
  static async preloadInstalledComponents(): Promise<void> {
    try {
      const installedModes = await modeManager.getInstalledModes();
      const preloadPromises = installedModes.map(modeId => this.preloadComponent(modeId));
      await Promise.allSettled(preloadPromises);
      console.log('Preloaded all installed components');
    } catch (error) {
      console.error('Error preloading components:', error);
    }
  }

  /**
   * Clear component cache for a specific mode
   */
  static clearComponentCache(modeId: string): void {
    componentCache.delete(modeId);
  }

  /**
   * Clear all component cache
   */
  static clearAllCache(): void {
    componentCache.clear();
  }

  /**
   * Get size of component cache
   */
  static getCacheSize(): number {
    return componentCache.size;
  }

  /**
   * Get cached component without loading
   */
  static getCachedComponent(modeId: string): LazyComponent | null {
    return componentCache.get(modeId) || null;
  }
}

// Export for convenience
export const dynamicLoader = DynamicLoader; 