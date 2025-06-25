import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import { resolve } from 'path'

// Helper to create manual chunks based on regex patterns
const createRegexMatcher = (patterns: RegExp[]) => {
  return (id: string): string | undefined => {
    for (const pattern of patterns) {
      if (pattern.test(id)) {
        return id
      }
    }
    return undefined
  }
}

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      manifest: {
        name: 'Yumi Series - AI Platform',
        short_name: 'Yumi Series',
        description: 'Advanced AI platform for content creation, web building, and character design',
        theme_color: '#ffffff',
        icons: [
          {
            src: 'pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml'
          },
          {
            src: 'pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml'
          }
        ]
      }
    })
  ],
  // Use root path for custom domain, fallback to repo name for GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  server: {
    port: 5173,
    host: true,
    proxy: {
      '/api': {
        target: process.env.PROXY_HOST || 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      },
      '/health': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  preview: {
    port: 5173,
    host: true
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: true,
    chunkSizeWarningLimit: 800, // Increase warning limit for larger chunks
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Core dependencies
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'core-vendor'
          }
          
          // Router
          if (id.includes('node_modules/react-router-dom/')) {
            return 'router-vendor'
          }
          
          // UI Framework chunks
          if (id.includes('node_modules/@mui/material/') || id.includes('node_modules/@mui/system/')) {
            return 'mui-core'
          }
          if (id.includes('node_modules/@mui/icons-material/')) {
            return 'mui-icons'
          }
          if (id.includes('node_modules/@emotion/')) {
            return 'mui-styles'
          }
          
          // Editor
          if (id.includes('node_modules/@monaco-editor/')) {
            return 'editor-vendor'
          }
          
          // State management
          if (id.includes('node_modules/zustand/')) {
            return 'state-management'
          }
          
          // Internationalization
          if (id.includes('node_modules/i18next/') || id.includes('node_modules/react-i18next/')) {
            return 'i18n-vendor'
          }
          
          // Charts
          if (id.includes('node_modules/chart.js/') || id.includes('node_modules/react-chartjs-2/')) {
            return 'chart-vendor'
          }
          
          // Feature modules (code-split by domain)
          if (id.includes('/anime-chara-helper/')) {
            return 'anime-helper'
          }
          if (id.includes('/writing-helper/')) {
            return 'writing-helper'
          }
          if (id.includes('/shared/components/')) {
            return 'shared-components'
          }
          if (id.includes('/components/AIAssistant/')) {
            return 'ai-assistant'
          }
        },
        // Optimize chunk distribution
        chunkFileNames: (chunkInfo) => {
          const name = chunkInfo.name
          if (name.includes('vendor')) {
            return 'vendor/[name]-[hash].js'
          }
          return 'chunks/[name]-[hash].js'
        }
      }
    }
  },
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  define: {
    'process.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL),
    'process.env.VITE_FRONTEND_URL': JSON.stringify(process.env.VITE_FRONTEND_URL)
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      '@mui/material',
      '@mui/icons-material',
      '@emotion/react',
      '@emotion/styled',
      'chart.js',
      'react-chartjs-2',
      'i18next',
      'react-i18next',
      'zustand'
    ]
  }
}) 