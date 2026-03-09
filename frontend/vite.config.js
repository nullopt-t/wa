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
        target: process.env.VITE_PROXY_TARGET || 'https://wa-production-191e.up.railway.app',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path,
      },
      '/upload': {
        target: process.env.VITE_PROXY_TARGET || 'https://wa-production-191e.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
      '/uploads': {
        target: process.env.VITE_PROXY_TARGET || 'https://wa-production-191e.up.railway.app',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true, // Enable sourcemaps for debugging
    minify: false, // Disable minification for easier debugging
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
  publicDir: 'public'
});