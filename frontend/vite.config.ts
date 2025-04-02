import { defineConfig } from 'vite';


export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/media/, '/media'),
      }
    }
  },
  build: {
    outDir: '../static',
  },
});