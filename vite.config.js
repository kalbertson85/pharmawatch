import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/pharmawatch/', // ✅ this is correct for GitHub Pages
  plugins: [react()],
});