const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
/** Prefix an absolute site path with the configured base (GitHub Pages staging uses /market-europa). */
export const u = (p: string) => `${base}${p.startsWith('/') ? p : '/' + p}`;
