import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/pharmawatch/', // ✅ for GitHub Pages
  plugins: [react()],
});