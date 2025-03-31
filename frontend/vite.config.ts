import { defineConfig } from 'vite';


export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:8000',
      '/media': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            if (proxyRes.headers['content-type']?.startsWith('image/')) {
              proxyRes.headers['content-type'] = proxyRes.headers['content-type'].replace(
                'text/html',
                'image/jpeg'
              );
            }
          });
        }
      }
    }
  },
  build: {
    outDir: '../static',
  },
});