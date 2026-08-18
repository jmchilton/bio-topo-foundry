// @ts-check
import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import tailwindcss from '@tailwindcss/vite';
import pagefind from 'astro-pagefind';

import remarkCitationLinks from './src/lib/remark-citation-links.ts';
import remarkWikiLinks from './src/lib/remark-wiki-links.ts';

const base = '/bio-topo-foundry';

export default defineConfig({
  site: 'https://jmchilton.github.io',
  base,
  compressHTML: true,
  integrations: [pagefind()],
  markdown: {
    processor: unified({
      remarkPlugins: [[remarkWikiLinks, { base }], remarkCitationLinks],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
