import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  root: '.',
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        bypass: (req, res, proxyOptions) => {
          // 브라우저의 페이지 요청(HTML)인 경우 프록시를 타지 않고 React가 처리하게 함
          if (req.headers.accept && req.headers.accept.includes('html')) {
            return req.url;
          }
        }
      },

      '/api': {
        target: 'http://localhost:3333',
        changeOrigin: true,
      }
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
