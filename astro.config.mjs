// @ts-check
import { defineConfig } from 'astro/config';

// SITE and BASE are set by the deploy workflow. Locally they default to the GitHub Pages staging path.
const site = process.env.SITE_URL || 'https://tavarescisco-bit.github.io';
const base = process.env.BASE_PATH ?? '/market-europa';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  build: { format: 'directory' },
});
