import { defineConfig, loadEnv, ConfigEnv, UserConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Function to load configuration based on mode
export default ({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());

  if (mode === 'production') {
    return defineConfig({
      plugins: [react()],
      server: {
        host: '0.0.0.0',
        port: 8022,
        proxy: {
          '/api': {
            target: env.VITE_USER_API_BASE_URL || 'http://backend:8000',
            changeOrigin: true,
            secure: false,
            rewrite: (path) => path.replace(/^\/api/, ''),
          },
          '/media': {
            target: env.VITE_MEDIA_BASE_URL || 'http://backend:8000',
            changeOrigin: true,
          },
          '/static': {
            target: env.VITE_STATIC_BASE_URL || 'http://backend:8000',
            changeOrigin: true,
          },
        },
      },
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
    });
  }

  // Development config
  return defineConfig({
    plugins: [react()],
    server: {
      proxy: {
        '/api': env.VITE_USER_API_BASE_URL || 'http://localhost:8000',
        '/media': env.VITE_MEDIA_BASE_URL || 'http://localhost:8000',
        '/static':env.VITE_STATIC_BASE_URL || 'http://localhost:8000',
      },
    },
    build: {
      outDir: 'dist',
    },
  });
};
