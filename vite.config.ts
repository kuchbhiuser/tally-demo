import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

const BASE_PATH = '/tally-demo/';

export default defineConfig({
  base: BASE_PATH,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg', 'mask-icon.svg'],
      manifest: false,
      workbox: {
        navigateFallback: `${BASE_PATH}index.html`
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
