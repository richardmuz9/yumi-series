interface ModeConfig {
  id: string;
  name: string;
  version: string;
  size: number; // in bytes
  dependencies: string[];
  cacheKeys: string[];
  assets: string[];
}

interface UsageStats {
  count: number;
  lastUsed: Date;
  totalTime: number;
}

interface InstallationProgress {
  progress: number;
  status: 'downloading' | 'installing' | 'complete' | 'error';
  message: string;
}

class ModeManager {
  private readonly STORAGE_KEY = 'yumi-installed-modes';
  private readonly USAGE_STATS_KEY = 'yumi-usage-stats';
  private readonly CACHE_PREFIX = 'yumi-mode-';
  
  private modeConfigs: Record<string, ModeConfig> = {
    'writing-helper': {
      id: 'writing-helper',
      name: 'Writing Helper',
      version: '1.0.0',
      size: 1800000, // 1.8 MB
      dependencies: ['react-markdown', 'emoji-mart'],
      cacheKeys: ['writing-templates', 'character-styles', 'genre-templates'],
      assets: ['writing-templates.json', 'character-personas.json', 'genre-styles.json']
    },
    'anime-chara-helper': {
      id: 'anime-chara-helper',
      name: 'Anime Character Designer',
      version: '1.0.0',
      size: 3200000, // 3.2 MB
      dependencies: ['fabric', 'color-picker'],
      cacheKeys: ['anime-assets', 'character-presets'],
      assets: ['anime-parts.json', 'character-templates.json', 'anime-backgrounds.png']
    }
  };

  // Core modes that cannot be uninstalled
  private readonly coreModes = ['writing-helper', 'anime-chara-helper']

  /**
   * Get list of currently installed modes
   */
  async getInstalledModes(): Promise<string[]> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
      
      // Default installation: only core modes
      const defaultModes = this.coreModes;
      await this.setInstalledModes(defaultModes);
      return defaultModes;
    } catch (error) {
      console.error('Error getting installed modes:', error);
      return this.coreModes;
    }
  }

  /**
   * Set installed modes list
   */
  private async setInstalledModes(modes: string[]): Promise<void> {
    // Always ensure core modes are included
    const modesWithCore = [...new Set([...this.coreModes, ...modes])];
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(modesWithCore));
  }

  /**
   * Check if a specific mode is installed
   */
  async isModeInstalled(modeId: string): Promise<boolean> {
    const installedModes = await this.getInstalledModes();
    return installedModes.includes(modeId);
  }

  /**
   * Install a mode
   */
  async installMode(modeId: string, onProgress?: (progress: InstallationProgress) => void): Promise<void> {
    const config = this.modeConfigs[modeId];
    if (!config) {
      throw new Error(`Mode ${modeId} not found`);
    }

    const installedModes = await this.getInstalledModes();
    if (installedModes.includes(modeId)) {
      throw new Error(`Mode ${modeId} is already installed`);
    }

    try {
      // Step 1: Download dependencies
      onProgress?.({
        progress: 10,
        status: 'downloading',
        message: 'Downloading dependencies...'
      });

      await this.downloadDependencies(config.dependencies);

      // Step 2: Cache assets
      onProgress?.({
        progress: 50,
        status: 'installing',
        message: 'Caching assets...'
      });

      await this.cacheAssets(modeId, config.assets);

      // Step 3: Initialize cache
      onProgress?.({
        progress: 80,
        status: 'installing',
        message: 'Initializing cache...'
      });

      await this.initializeModeCache(modeId, config.cacheKeys);

      // Step 4: Update installed modes
      onProgress?.({
        progress: 100,
        status: 'complete',
        message: 'Installation complete!'
      });

      const updatedModes = [...installedModes, modeId];
      await this.setInstalledModes(updatedModes);

      // Initialize usage stats
      await this.initializeUsageStats(modeId);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      onProgress?.({
        progress: 0,
        status: 'error',
        message: `Installation failed: ${errorMessage}`
      });
      throw error;
    }
  }

  /**
   * Uninstall a mode
   */
  async uninstallMode(modeId: string): Promise<void> {
    // Prevent uninstalling core modes
    if (this.coreModes.includes(modeId)) {
      throw new Error(`Cannot uninstall core mode: ${modeId}`);
    }

    const installedModes = await this.getInstalledModes();
    if (!installedModes.includes(modeId)) {
      throw new Error(`Mode ${modeId} is not installed`);
    }

    const config = this.modeConfigs[modeId];
    if (!config) {
      throw new Error(`Mode ${modeId} not found`);
    }

    try {
      // Clear mode cache
      await this.clearModeCache(modeId, config.cacheKeys);
      
      // Clear cached assets
      await this.clearCachedAssets(modeId);
      
      // Remove from installed modes
      const updatedModes = installedModes.filter(id => id !== modeId);
      await this.setInstalledModes(updatedModes);
      
      // Clear service worker cache for this mode
      await this.clearServiceWorkerCache(modeId);
      
    } catch (error) {
      console.error(`Error uninstalling mode ${modeId}:`, error);
      throw error;
    }
  }

  /**
   * Get usage statistics for all modes
   */
  async getUsageStats(): Promise<Record<string, UsageStats>> {
    try {
      const stored = localStorage.getItem(this.USAGE_STATS_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('Error getting usage stats:', error);
      return {};
    }
  }

  /**
   * Log mode usage
   */
  async logModeUsage(modeId: string, sessionTime: number = 0): Promise<void> {
    try {
      const stats = await this.getUsageStats();
      const currentStats = stats[modeId] || { count: 0, lastUsed: new Date(), totalTime: 0 };
      
      stats[modeId] = {
        count: currentStats.count + 1,
        lastUsed: new Date(),
        totalTime: currentStats.totalTime + sessionTime
      };
      
      localStorage.setItem(this.USAGE_STATS_KEY, JSON.stringify(stats));
    } catch (error) {
      console.error('Error logging mode usage:', error);
    }
  }

  /**
   * Get estimated storage usage for all modes
   */
  async getStorageUsage(): Promise<Record<string, number>> {
    const installedModes = await this.getInstalledModes();
    const usage: Record<string, number> = {};
    
    for (const modeId of installedModes) {
      const config = this.modeConfigs[modeId];
      if (config) {
        usage[modeId] = config.size;
      }
    }
    
    return usage;
  }

  /**
   * Clear all app data (reset)
   */
  async clearAllData(): Promise<void> {
    try {
      // Clear localStorage
      const keysToRemove = [this.STORAGE_KEY, this.USAGE_STATS_KEY];
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      // Clear IndexedDB
      await this.clearIndexedDB();
      
      // Clear service worker cache
      await this.clearAllServiceWorkerCache();
      
      // Reset to core modes only
      await this.setInstalledModes(this.coreModes);
      
    } catch (error) {
      console.error('Error clearing all data:', error);
      throw error;
    }
  }

  // Private helper methods

  private async downloadDependencies(dependencies: string[]): Promise<void> {
    // In a real implementation, this would dynamically import or fetch dependencies
    // For now, we'll simulate the download
    await this.simulateAsyncOperation(1000);
  }

  private async cacheAssets(modeId: string, assets: string[]): Promise<void> {
    // Cache static assets in IndexedDB or localStorage
    for (const asset of assets) {
      const cacheKey = `${this.CACHE_PREFIX}${modeId}-${asset}`;
      // In production, you would fetch and cache the actual asset
      localStorage.setItem(cacheKey, JSON.stringify({ cached: Date.now(), asset }));
    }
  }

  private async clearCachedAssets(modeId: string): Promise<void> {
    const keys = Object.keys(localStorage);
    const modeKeys = keys.filter(key => key.startsWith(`${this.CACHE_PREFIX}${modeId}`));
    modeKeys.forEach(key => localStorage.removeItem(key));
  }

  private async initializeModeCache(modeId: string, cacheKeys: string[]): Promise<void> {
    // Initialize mode-specific cache entries
    for (const cacheKey of cacheKeys) {
      const fullKey = `${modeId}-${cacheKey}`;
      if (!localStorage.getItem(fullKey)) {
        localStorage.setItem(fullKey, JSON.stringify({ initialized: Date.now() }));
      }
    }
  }

  private async clearModeCache(modeId: string, cacheKeys: string[]): Promise<void> {
    for (const cacheKey of cacheKeys) {
      const fullKey = `${modeId}-${cacheKey}`;
      localStorage.removeItem(fullKey);
    }
  }

  private async initializeUsageStats(modeId: string): Promise<void> {
    const stats = await this.getUsageStats();
    if (!stats[modeId]) {
      stats[modeId] = {
        count: 0,
        lastUsed: new Date(),
        totalTime: 0
      };
      localStorage.setItem(this.USAGE_STATS_KEY, JSON.stringify(stats));
    }
  }

  private async clearServiceWorkerCache(modeId: string): Promise<void> {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        const modeCacheNames = cacheNames.filter(name => name.includes(modeId));
        
        await Promise.all(
          modeCacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.error('Error clearing service worker cache:', error);
      }
    }
  }

  private async clearAllServiceWorkerCache(): Promise<void> {
    if ('serviceWorker' in navigator && 'caches' in window) {
      try {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => caches.delete(cacheName))
        );
      } catch (error) {
        console.error('Error clearing all service worker cache:', error);
      }
    }
  }

  private async clearIndexedDB(): Promise<void> {
    // Clear IndexedDB databases related to the app
    if ('indexedDB' in window) {
      try {
        // List of potential IndexedDB names used by the app
        const dbNames = ['yumi-series-cache', 'yumi-assets', 'yumi-data'];
        
        for (const dbName of dbNames) {
          const deleteReq = indexedDB.deleteDatabase(dbName);
          await new Promise((resolve, reject) => {
            deleteReq.onsuccess = () => resolve(undefined);
            deleteReq.onerror = () => reject(deleteReq.error);
          });
        }
      } catch (error) {
        console.error('Error clearing IndexedDB:', error);
      }
    }
  }

  private async simulateAsyncOperation(delay: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, delay));
  }
}

// Export singleton instance
export const modeManager = new ModeManager(); 