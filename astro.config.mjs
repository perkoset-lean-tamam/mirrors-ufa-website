// @ts-check
import { defineConfig } from 'astro/config';
import icon from 'astro-icon';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://xn--80aanhqh6a2aj4e.xn--p1ai',
  integrations: [icon(), sitemap()],
  vite: {
    plugins: [tailwindcss()]
  }
});