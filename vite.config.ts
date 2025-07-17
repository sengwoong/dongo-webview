import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    strictPort: true,
    proxy: {
      '/api': 'http://localhost:3000', // 추가: /api로 시작하는 요청을 3000번 포트로 프록시
    },
  },
})
