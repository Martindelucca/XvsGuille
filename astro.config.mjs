// @ts-check
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

// El sitio es estático salvo /api/rsvp, que se renderiza on-demand como
// función serverless (ahí vive la URL secreta del Apps Script).
export default defineConfig({
  site: 'https://xv-guille.vercel.app',
  output: 'static',
  adapter: vercel(),
  build: {
    inlineStylesheets: 'always', // una sola request: mejor LCP en datos móviles
  },
  compressHTML: true,
  vite: {
    build: {
      cssMinify: 'lightningcss',
    },
  },
});
