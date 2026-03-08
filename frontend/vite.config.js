import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      // Redirige /api/* al backend real, evitando CORS en desarrollo
      '/api': {
        target: process.env.VITE_API_BASE_URL?.replace('/api/v1', '') || 'http://localhost:8001',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
});
