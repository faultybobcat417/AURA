import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 800,
    rollupOptions: {
      output: {
        manualChunks: (id: string) => {
          if (id.includes('recharts') || id.includes('lightweight-charts')) return 'charts'
          if (id.includes('@tanstack/react-table')) return 'table'
          if (id.includes('node_modules')) return 'vendor'
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true,
  }
})
