import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Port 3000 matches the backend's default CORS origin. The /api proxy means
// the browser never makes a cross-origin call during development.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: { '/api': { target: 'http://localhost:5000', changeOrigin: true } },
  },
})
