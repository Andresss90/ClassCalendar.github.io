import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  // El base path solo aplica al build de producción (GitHub Pages sirve la app
  // en /StudyFlow/); en desarrollo local debe seguir siendo la raíz.
  base: command === 'build' ? '/StudyFlow/' : '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      // 'prompt' = el service worker nuevo instala y espera; recién se activa
      // cuando el usuario cierra y vuelve a abrir la app (sin recargas forzadas
      // ni avisos mientras la está usando).
      registerType: 'prompt',
      injectRegister: 'auto',
      includeAssets: ['icons/favicon-32.png'],
      manifest: {
        name: 'StudyFlow',
        short_name: 'StudyFlow',
        description: 'Calendar, tasks, and schedule for your school.',
        start_url: '.',
        scope: '.',
        display: 'standalone',
        background_color: '#f1f5f9',
        theme_color: '#4f46e5',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Solo precachea los assets estáticos del build (JS/CSS/HTML/íconos).
        // Las llamadas a Firebase/Firestore no son "navegaciones", así que no
        // las intercepta ni las cachea: siempre van a red en vivo.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff2}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
