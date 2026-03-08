import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    port: 3000,
    host: true,
    strictPort: false,
    proxy: {
      '/api': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/upload': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: process.env.VITE_PROXY_TARGET || 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  publicDir: 'public'
});