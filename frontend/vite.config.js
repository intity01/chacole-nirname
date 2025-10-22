import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true, // Listen on all addresses
    port: 5173,
    strictPort: true,
    hmr: {
      protocol: 'wss',
      clientPort: 443,
    },
    allowedHosts: [
      '.manus-asia.computer',
      '.manusvm.computer',
      'localhost',
    ],
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
  },
})

