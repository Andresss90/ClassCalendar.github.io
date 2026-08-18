import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // El base path solo aplica al build de producción (GitHub Pages sirve la app
  // en /ClassCalendar.github.io/); en desarrollo local debe seguir siendo la raíz.
  base: command === 'build' ? '/ClassCalendar.github.io/' : '/',
  plugins: [react(), tailwindcss()],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
