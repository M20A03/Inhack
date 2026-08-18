import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  build: {
    chunkSizeWarningLimit: 15000, // suppress warnings for large WASM/ML bundles
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'masked-icon.svg'],
      workbox: {
        maximumFileSizeToCacheInBytes: 30 * 1024 * 1024, // 30 MB to handle ONNX WASM
        globPatterns: ['**/*.{js,css,html,ico,png,svg,wasm,json}'],
      },
      manifest: {
        name: 'Sahayak - Physical Edition',
        short_name: 'Sahayak',
        description: 'Hands-free, voice-first accessibility assistant for physical disabilities.',
        theme_color: '#000000',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
