import type { APIRoute } from 'astro';
import { store } from '../lib/content';

export const GET: APIRoute = ({ site }) => {
  const base = (site?.toString() || 'https://marketeuropa.com.au/').replace(/\/$/, '') + (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  const pages = ['/', '/specials', '/departments', ...store.departments.map((d) => `/departments/${d.slug}`), '/cafe', '/christmas', '/gnocchi-drop', '/gazette', '/visit', '/about', '/catering', '/privacy', '/accessibility'];
  const today = new Date().toISOString().slice(0, 10);
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${pages.map((p) => `  <url><loc>${base}${p === '/' ? '/' : p + '/'}</loc><lastmod>${today}</lastmod><changefreq>${p === '/specials' || p === '/' ? 'weekly' : 'monthly'}</changefreq></url>`).join('\n')}\n</urlset>\n`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
