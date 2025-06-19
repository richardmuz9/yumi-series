import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,svg,webp}'],
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024, // 10MB
        globIgnores: ['**/yumi-tusr.png', '**/screenshot-*.png'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24 // 24 hours
              }
            }
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 60,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      },
      manifest: {
        name: 'Yumi Series - AI Platform',
        short_name: 'Yumi',
        description: 'Advanced AI platform for content creation, web building, and character design',
        icons: [
          {
            src: '/pwa-192.svg',
            sizes: '192x192',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          },
          {
            src: '/pwa-512.svg',
            sizes: '512x512',
            type: 'image/svg+xml',
            purpose: 'any maskable'
          }
        ],
        start_url: '/',
        display: 'standalone',
        orientation: 'any',
        theme_color: '#7c3aed',
        background_color: '#ffffff',
        categories: ['productivity', 'utilities', 'education'],
        screenshots: [
          {
            src: '/screenshot-wide.svg',
            sizes: '1280x720',
            type: 'image/svg+xml',
            form_factor: 'wide'
          },
          {
            src: '/screenshot-narrow.svg',
            sizes: '750x1334',
            type: 'image/svg+xml',
            form_factor: 'narrow'
          }
        ]
      },
      devOptions: {
        enabled: true // Enable PWA in development
      }
    })
  ],
  // Use root path for custom domain, fallback to repo name for GitHub Pages
  base: process.env.NODE_ENV === 'production' ? '/' : '/',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('Proxy error:', err)
          })
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Proxying request:', req.method, req.url, '→', (options.target || '') + (req.url || ''))
          })
        }
      },
      '/health': {
        target: process.env.VITE_API_URL || 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path
      }
    }
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Ensure assets are properly referenced
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
}) 