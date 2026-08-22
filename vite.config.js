import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/Kleenest_Architecture/',
  plugins: [react()],
  build: { sourcemap: true }
});
