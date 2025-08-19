import path from "path"
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'


export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    proxy: {
      // Бэкенд antonvz.ru
      '/api': {
        target: 'http://antonvz.ru:8080',
        changeOrigin: true,
        secure: false,
        // /api/groups  ->  http://antonvz.ru:8080/groups
        // /api/auth/... ->  http://antonvz.ru:8080/auth/...
        rewrite: (p) => p.replace(/^\/api/, ''),
      },

      // Если нужен jsonplaceholder — перенеси его на другой префикс, чтобы не конфликтовать:
      '/placeholder': {
        target: 'https://jsonplaceholder.typicode.com',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/placeholder/, ''),
      },
    }
  }
})