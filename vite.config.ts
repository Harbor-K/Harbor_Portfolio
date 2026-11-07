import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base './' so the built page works from any sub-folder (e.g. GitHub Pages /Harbor_Portfolio/)
export default defineConfig({
  plugins: [react()],
  base: './',
});
