/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base: './' → 상대 경로로 빌드되므로 GitHub Pages의 어떤 저장소 이름에서도 그대로 작동합니다.
export default defineConfig({
  base: './',
  plugins: [react()],
  test: {
    include: ['tests/**/*.test.ts'],
  },
});
