import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['sk96ps-5173.csb.app'],
    proxy: {
      '/api': {
        target: 'https://acmmedia-backend.onrender.com',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
