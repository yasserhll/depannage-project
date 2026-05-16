import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png', 'screenshots/*.png'],
      manifest: {
        name: 'AutoDepan — Dépannage Automobile',
        short_name: 'AutoDepan',
        description: 'Service de dépannage automobile en temps réel',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        background_color: '#0f172a',
        theme_color: '#f97316',
        lang: 'fr',
        scope: '/',
        categories: ['utilities', 'transportation'],
        icons: [
          { src: '/icons/icon-72x72.png',   sizes: '72x72',   type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-96x96.png',   sizes: '96x96',   type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-128x128.png', sizes: '128x128', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-144x144.png', sizes: '144x144', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-384x384.png', sizes: '384x384', type: 'image/png', purpose: 'maskable any' },
          { src: '/icons/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable any' },
        ],
        screenshots: [
          {
            src: '/screenshots/client-map.png',
            sizes: '390x844',
            type: 'image/png',
            // @ts-expect-error form_factor est supporté mais pas encore dans les types
            form_factor: 'narrow',
            label: 'Carte de dépannage',
          },
        ],
        shortcuts: [
          {
            name: 'Demander un dépannage',
            url: '/client/nouveau',
            icons: [{ src: '/icons/icon-96x96.png', sizes: '96x96' }],
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          // Tuiles OpenStreetMap — Cache First, 7 jours
          {
            urlPattern: /^https:\/\/[abc]\.tile\.openstreetmap\.org\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'osm-tiles',
              expiration: { maxEntries: 500, maxAgeSeconds: 7 * 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Dashboard et données non critiques — Network First
          {
            urlPattern: /\/api\/(client|depanneur)\/dashboard/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-dashboard',
              expiration: { maxAgeSeconds: 5 * 60 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // Historique missions — Network First avec fallback
          {
            urlPattern: /\/api\/(client|depanneur)\/missions$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-missions',
              expiration: { maxAgeSeconds: 10 * 60 },
              networkTimeoutSeconds: 5,
              cacheableResponse: { statuses: [0, 200] },
            },
          },
          // GPS et tracking — Network Only (jamais de cache)
          {
            urlPattern: /\/api\/gps/,
            handler: 'NetworkOnly',
          },
          // Paiements — Network Only
          {
            urlPattern: /\/api\/payments/,
            handler: 'NetworkOnly',
          },
          // Assets statiques — Stale While Revalidate
          {
            urlPattern: /\.(js|css|woff2?)(\?.*)?$/,
            handler: 'StaleWhileRevalidate',
            options: { cacheName: 'static-assets' },
          },
          // Images uploads — Cache First, 24h
          {
            urlPattern: /\/storage\//,
            handler: 'CacheFirst',
            options: {
              cacheName: 'uploads',
              expiration: { maxEntries: 100, maxAgeSeconds: 24 * 60 * 60 },
              cacheableResponse: { statuses: [0, 200] },
            },
          },
        ],
      },
      devOptions: {
        enabled: true,
        type: 'module',
      },
    }),
  ],
  server: {
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://192.168.100.35:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://192.168.100.35:8000',
        changeOrigin: true,
      },
    },
  },
});
