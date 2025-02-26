import { defineConfig } from 'vite';


export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:8000',  // Forward API requests to Django backend
    },
  },
  build: {
    outDir: '../static',  // Vite's default output directory for development
  },
});