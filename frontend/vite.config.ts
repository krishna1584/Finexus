/// <reference types="vitest" />

import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import type { ProxyOptions } from 'vite'

const GATEWAY = 'http://localhost:8088'

/**
 * Some API prefixes (e.g. /transactions) are also front-end page routes.
 * A browser navigation or refresh asks for text/html, so serve the SPA for
 * those instead of forwarding them to the gateway (which returned a 502).
 */
const apiProxy: ProxyOptions = {
  target: GATEWAY,
  changeOrigin: true,
  bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': apiProxy,
      '/accounts': apiProxy,
      '/transactions': apiProxy,
      '/fund-transfers': apiProxy,
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
