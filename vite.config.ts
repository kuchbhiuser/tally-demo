import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: '/tally-demo/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'mask-icon.svg'],
      manifest: false,
      workbox: {
        navigateFallback: '/index.html'
      }
    })
  ],
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  server: {
    host: '0.0.0.0'
  },
  preview: {
    host: '0.0.0.0'
  }
});
