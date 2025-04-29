import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default ({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());

  const commonConfig = {
    plugins: [react()],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
      rollupOptions: {
        output: {
          assetFileNames: 'assets/[name]-[hash][extname]',
          chunkFileNames: 'js/[name]-[hash].js',
          entryFileNames: 'js/[name]-[hash].js',
        },
      },
    },
  };

  if (mode === 'production') {
    return defineConfig({
      ...commonConfig,
      base: '/',
      server: {
        host: '0.0.0.0',
        port: 8022,
        proxy: {
          // Proxy for external API calls (preserves your frontend URLs)
          '/api/v1/weather': {
            target: env.VITE_WEATHER_API_BASE_URL,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/v1\/weather/, ''),
          },
          '/api/v1/user': {
            target: env.VITE_USER_API_BASE_URL,
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api\/v1\/user/, ''),
          },
          // Internal routing for Nginx
          '/internal-api': {
            target: 'http://backend:8000',
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/internal-api/, ''),
          },
          '/media': {
            target: 'http://backend:8000',
            changeOrigin: true,
          },
          '/static': {
            target: 'http://backend:8000',
            changeOrigin: true,
          },
        },
      },
    });
  }

  // Development config remains the same
  return defineConfig({
    ...commonConfig,
    server: {
      proxy: {
        '/api/v1/weather': env.VITE_WEATHER_API_BASE_URL || 'http://localhost:8000/api/v1/weather',
        '/api/v1/user': env.VITE_USER_API_BASE_URL || 'http://localhost:8000/api/v1/user',
        '/media': env.VITE_MEDIA_BASE_URL || 'http://localhost:8000/media',
        '/static': env.VITE_STATIC_BASE_URL || 'http://localhost:8000/static',
      },
    },
  });
};