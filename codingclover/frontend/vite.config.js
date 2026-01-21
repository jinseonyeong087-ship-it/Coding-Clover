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
      },

      // '/course': {
      //   target: 'http://localhost:3333',
      //   changeOrigin: true,
      // },

      // vite.config.js
      '/course': {
        target: 'http://localhost:3333',
        changeOrigin: true,
        // HTML 요청(페이지 이동)은 프록시 안 함
        bypass: (req) => {
          if (req.headers.accept?.includes('html')) {
            return req.url;
          }
        }
      }
      // 이렇게 하면 브라우저 페이지 이동은 React가 처리하고, API 호출만 백엔드로 감

      // vite.config.js 역할
      // React Router가 처리하기 전에
      // Vite가 가로채서 백엔드로 보냄
      // 백엔드에 /course/level/1 API가 없으니 500 에러

      // '/instructor': {
      //   target: 'http://localhost:3333',
      //   changeOrigin: true,
      // },
    }
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
