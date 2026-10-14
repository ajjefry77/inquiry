import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      // پراکسی ژئوسرور برای دور زدن CORS (سرور هدر Access-Control-Allow-Origin نمی‌دهد)
      // در کد با مسیر نسبی /geoserver صدا زده می‌شود تا هم در dev و هم پشت https کار کند.
      '/geoserver': {
        target: 'http://mapiq.ir:8080',
        changeOrigin: true,
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 2000,
    rollupOptions: {
      output: {
        manualChunks: {
          mapbox: ['mapbox-gl'],
          vendor: ['vue'],
        },
      },
    },
  },
})
