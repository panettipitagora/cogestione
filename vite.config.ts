import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';
import { CLASSI_ISTITUTO } from './src/data/schoolData';
import { formatLimClassSlug } from './src/utils/limRouteUtils';

export default defineConfig(() => {
  const rawBase = process.env.VITE_BASE_PATH || '/';
  const base = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

  return {
    base,
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'icon.svg',
          'icon-maskable.svg',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
        ],
        manifest: {
          id: base,
          name: 'Tre Giorni di Cultura e Sport — Lista 1 EN-CORE',
          short_name: 'CulturaSport',
          description:
            'Piattaforma ufficiale di Lista 1 EN-CORE per programmi classe, convocazioni e tornei live.',
          theme_color: '#09090B',
          background_color: '#09090B',
          display: 'standalone',
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}pwa-192x192.png`,
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}pwa-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: `${base}pwa-maskable-512x512.png`,
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          navigateFallbackDenylist: [/manifest\.webmanifest$/],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
      // Copies src/assets into dist/, adds GitHub Pages SPA 404 fallback,
      // and pre-generates HTTP-200 entry points & per-class PWA manifests for /staff and /staff/<classe>.
      {
        name: 'copy-assets-and-gh-pages-lim-routes',
        apply: 'build',
        closeBundle(error?: Error): void {
          if (error) {
            return;
          }
          const rootDir = import.meta.dirname ?? process.cwd();
          const distDir = path.resolve(rootDir, 'dist');
          const srcAssets = path.resolve(rootDir, 'src/assets');
          const distAssets = path.resolve(distDir, 'src/assets');
          if (fs.existsSync(distDir) && fs.existsSync(srcAssets)) {
            fs.cpSync(srcAssets, distAssets, { recursive: true, force: true });
          }

          const indexHtmlPath = path.join(distDir, 'index.html');
          if (!fs.existsSync(indexHtmlPath)) return;

          const baseIndexHtml = fs.readFileSync(indexHtmlPath, 'utf8');

          // 1. 404.html fallback for any SPA subpath on GitHub Pages
          fs.writeFileSync(path.join(distDir, '404.html'), baseIndexHtml, 'utf8');

          // 2. /staff configurator entry (HTTP 200)
          const staffDir = path.join(distDir, 'staff');
          fs.mkdirSync(staffDir, { recursive: true });
          const staffHtml = baseIndexHtml.replace(
            /<title>.*?<\/title>/,
            '<title>Configurazione LIM — Tre Giorni di Cultura e Sport</title>'
          );
          fs.writeFileSync(path.join(staffDir, 'index.html'), staffHtml, 'utf8');

          // 3. Dedicated HTTP-200 entry + standalone manifest per every classroom LIM (/staff/1G, /staff/4-ITIA_A, ...)
          for (const cls of CLASSI_ISTITUTO) {
            const slug = formatLimClassSlug(cls);
            const clsDir = path.join(staffDir, slug);
            fs.mkdirSync(clsDir, { recursive: true });

            const classStartUrl = `${base}staff/${slug}`;
            const classManifest = {
              id: classStartUrl,
              name: `LIM ${cls} · Tre Giorni di Cultura e Sport`,
              short_name: `LIM ${cls}`.slice(0, 12),
              description: `Schermo LIM permanente per la classe ${cls} — Lista 1 EN-CORE`,
              theme_color: '#09090B',
              background_color: '#09090B',
              display: 'standalone',
              start_url: classStartUrl,
              scope: classStartUrl,
              icons: [
                {
                  src: `${base}pwa-192x192.png`,
                  sizes: '192x192',
                  type: 'image/png',
                  purpose: 'any',
                },
                {
                  src: `${base}pwa-512x512.png`,
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'any',
                },
                {
                  src: `${base}pwa-maskable-512x512.png`,
                  sizes: '512x512',
                  type: 'image/png',
                  purpose: 'maskable',
                },
              ],
            };

            fs.writeFileSync(
              path.join(clsDir, 'manifest.webmanifest'),
              JSON.stringify(classManifest, null, 2),
              'utf8'
            );

            let clsHtml = baseIndexHtml
              .replace(
                /<title>.*?<\/title>/,
                `<title>LIM ${cls} — Tre Giorni di Cultura e Sport</title>`
              )
              .replace(
                /content="Cultura &amp; Sport"/,
                `content="LIM ${cls}"`
              );

            clsHtml = clsHtml.replace(
              /<link rel="manifest" href="[^"]*">/,
              `<link rel="manifest" href="${base}staff/${slug}/manifest.webmanifest">`
            );

            fs.writeFileSync(path.join(clsDir, 'index.html'), clsHtml, 'utf8');
          }
        },
      },
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
