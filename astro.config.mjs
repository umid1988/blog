// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { cyanotypeLight, cyanotypeDark } from './src/lib/shiki-themes.mjs';

// The GitHub Actions workflow passes SITE_URL and BASE_PATH from
// actions/configure-pages, so a custom domain set in the repo's Pages
// settings is picked up automatically on the next deploy.
// Locally (npm run dev / build) the defaults below are used.
const SITE_URL = process.env.SITE_URL || 'https://umid1988.github.io';
const BASE_PATH =
  process.env.BASE_PATH !== undefined ? process.env.BASE_PATH || '/' : '/blog';

export default defineConfig({
  site: SITE_URL,
  base: BASE_PATH,
  integrations: [sitemap()],
  build: {
    // Keep CSS in files so the Content-Security-Policy stays tight.
    inlineStylesheets: 'never',
  },
  markdown: {
    shikiConfig: {
      themes: { light: cyanotypeLight, dark: cyanotypeDark },
      wrap: false,
    },
  },
  devToolbar: { enabled: false },
});
