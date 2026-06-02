import { defineConfig } from 'vite';
import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { crx } from '@crxjs/vite-plugin';
import manifest from './src/manifest.config';

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    target: 'esnext',
    sourcemap: false,
    rollupOptions: {
      input: {
        // Non-manifest HTML entry points still need to be declared so Vite
        // emits them. The viewer page is opened programmatically.
        viewer: resolve(__dirname, 'src/viewer/index.html'),
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['tests/**/*.test.ts'],
  },
});
