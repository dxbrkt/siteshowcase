import { defineConfig, fontProviders } from 'astro/config';
import sitemap from '@astrojs/sitemap';

const site = process.env.SITE_URL || undefined;

export default defineConfig({
  output: 'static',
  base: process.env.BASE_PATH || '/',
  site,
  trailingSlash: 'always',
  build: { format: 'directory' },
  integrations: site ? [sitemap()] : [],
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Golos Text',
      cssVariable: '--font-golos',
      options: {
        variants: [
          {
            src: ['./src/assets/fonts/golos-text.woff2'],
            weight: '400 900',
            style: 'normal',
          },
        ],
      },
    },
  ],
});
