import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  appType: 'spa',
  plugins: [react()],
  server: {
    port: 5173,
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (id.includes('/node_modules/react/') || id.includes('/node_modules/react-dom/') || id.includes('/node_modules/react-router-dom/')) return 'vendor-react'
          if (id.includes('/node_modules/axios/') || id.includes('/node_modules/lucide-react/') || id.includes('/node_modules/react-helmet-async/')) return 'vendor-utils'
        },
      },
    },
  },
})

