import fs from 'node:fs';
import path from 'node:path';
import site from '../data/site.json';

export type Special = {
  campaign: string;
  start: string; // YYYY-MM-DD
  end: string;   // YYYY-MM-DD
  store: string;
  department: string;
  name: string;
  brand: string;
  packSize: string;
  qtyValue: number | null;
  qtyUnit: string;
  regularPrice: number | null;
  specialPrice: number | null;
  multibuy: string;
  note: string;
  isHero: boolean;
  liquor: boolean;
  origin: string;
  imageUrl: string;
  approved: boolean;
  sortOrder: number;
  // derived
  id: string;
  status: 'scheduled' | 'live' | 'expired';
  unitPrice: string | null;
  priceLabel: string;      // "$22.99" or "3 for $4"
  priceSuffix: string;     // "/kg", "ea", "/dozen"
  badge: string | null;    // "Save $3.00" | "3 for $4" | null
  weekSlug: string;
};

const DATA_FILE = path.resolve(process.cwd(), 'data/specials.csv');

/** Today's date in Australia/Melbourne as YYYY-MM-DD. */
export function todayMelbourne(): string {
  const fmt = new Intl.DateTimeFormat('en-CA', { timeZone: 'Australia/Melbourne', year: 'numeric', month: '2-digit', day: '2-digit' });
  return fmt.format(new Date());
}

function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let row: string[] = [], field = '', inQ = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQ) {
      if (c === '"') { if (text[i + 1] === '"') { field += '"'; i++; } else inQ = false; }
      else field += c;
    } else if (c === '"') inQ = true;
    else if (c === ',') { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(field); rows.push(row); row = []; field = ''; }
    else field += c;
  }
  if (field.length || row.length) { row.push(field); rows.push(row); }
  const header = rows.shift()!.map((h) => h.trim());
  return rows.filter((r) => r.some((v) => v.trim() !== '')).map((r) => Object.fromEntries(header.map((h, i) => [h, (r[i] ?? '').trim()])));
}

const num = (v: string) => (v === '' ? null : Number(v));
const bool = (v: string) => /^(true|yes|1|y)$/i.test(v);
const slug = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function unitPrice(price: number | null, qty: number | null, unit: string): string | null {
  if (price == null || qty == null || !unit) return null;
  const u = unit.toLowerCase();
  const fmt = (n: number) => `$${n.toFixed(2)}`;
  if (u === 'kg') return `${fmt(price / qty)} per kg`;
  if (u === 'g') return qty >= 1000 ? `${fmt(price / (qty / 1000))} per kg` : `${fmt((price / qty) * 100)} per 100 g`;
  if (u === 'l') return `${fmt(price / qty)} per litre`;
  if (u === 'ml') return qty >= 1000 ? `${fmt(price / (qty / 1000))} per litre` : `${fmt((price / qty) * 100)} per 100 mL`;
  if (u === 'each' || u === 'ea' || u === 'bag' || u === 'pack' || u === 'dozen') return `${fmt(price / qty)} per ${u === 'ea' ? 'each' : u}`;
  return null;
}

function priceParts(s: { specialPrice: number | null; multibuy: string; qtyUnit: string; packSize: string }) {
  if (s.multibuy) return { label: s.multibuy, suffix: '' };
  const p = s.specialPrice == null ? '' : `$${s.specialPrice.toFixed(2)}`;
  const u = s.qtyUnit.toLowerCase();
  let suffix = 'ea';
  if (s.packSize.toLowerCase().startsWith('per ')) suffix = s.packSize.toLowerCase() === 'per kg' ? '/kg' : s.packSize.toLowerCase().replace('per ', '/');
  else if (u === 'kg' && (s.packSize === '' || /^per/i.test(s.packSize))) suffix = '/kg';
  else if (u === 'dozen') suffix = '/dozen';
  else if (u === 'bag') suffix = 'bag';
  return { label: p, suffix };
}

export function loadSpecials(): Special[] {
  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  const today = todayMelbourne();
  return parseCSV(raw)
    .map((r, i): Special => {
      const specialPrice = num(r.special_price);
      const regularPrice = num(r.regular_price);
      const qtyValue = num(r.qty_value);
      const base = {
        campaign: r.campaign, start: r.start_date, end: r.end_date, store: r.store || 'Moorabbin',
        department: r.department, name: r.product_name, brand: r.brand, packSize: r.pack_size,
        qtyValue, qtyUnit: r.qty_unit, regularPrice, specialPrice, multibuy: r.multibuy, note: r.availability_note,
        isHero: bool(r.is_hero), liquor: bool(r.liquor), origin: r.origin, imageUrl: r.image_url,
        approved: bool(r.approved), sortOrder: Number(r.sort_order || i + 1),
      };
      const status: Special['status'] = today < base.start ? 'scheduled' : today > base.end ? 'expired' : 'live';
      const { label, suffix } = priceParts(base);
      let badge: string | null = null;
      if (base.multibuy) badge = base.multibuy;
      else if (regularPrice != null && specialPrice != null && regularPrice > specialPrice) badge = `Save $${(regularPrice - specialPrice).toFixed(2)}`;
      return {
        ...base, status, badge,
        id: `${slug(base.campaign)}-${slug(base.brand + ' ' + base.name)}`,
        unitPrice: base.multibuy || /^per\s/i.test(base.packSize) || ['each','ea','bag','dozen','pack'].includes(base.qtyUnit.toLowerCase()) ? null : unitPrice(specialPrice, qtyValue, base.qtyUnit),
        priceLabel: label, priceSuffix: suffix,
        weekSlug: `${base.start}--${base.end}`,
      };
    })
    .filter((s) => s.approved && s.name)
    .sort((a, b) => a.start.localeCompare(b.start) || a.sortOrder - b.sortOrder);
}

export function liveSpecials(all = loadSpecials()) { return all.filter((s) => s.status === 'live'); }
export function scheduledSpecials(all = loadSpecials()) { return all.filter((s) => s.status === 'scheduled'); }

export type Campaign = { name: string; start: string; end: string; slug: string; status: Special['status']; items: Special[] };
export function campaigns(all = loadSpecials()): Campaign[] {
  const map = new Map<string, Campaign>();
  for (const s of all) {
    const key = `${s.campaign}|${s.start}|${s.end}`;
    if (!map.has(key)) map.set(key, { name: s.campaign, start: s.start, end: s.end, slug: s.weekSlug, status: s.status, items: [] });
    map.get(key)!.items.push(s);
  }
  return [...map.values()].sort((a, b) => b.start.localeCompare(a.start));
}

export function fmtRange(start: string, end: string): string {
  const f = (d: string, withMonth: boolean) => {
    const dt = new Date(d + 'T12:00:00+10:00');
    const day = new Intl.DateTimeFormat('en-AU', { weekday: 'short', timeZone: 'Australia/Melbourne' }).format(dt);
    const dd = new Intl.DateTimeFormat('en-AU', { day: 'numeric', timeZone: 'Australia/Melbourne' }).format(dt);
    const mm = new Intl.DateTimeFormat('en-AU', { month: 'short', timeZone: 'Australia/Melbourne' }).format(dt);
    return withMonth ? `${day} ${dd} ${mm}` : `${day} ${dd}`;
  };
  const sameMonth = start.slice(0, 7) === end.slice(0, 7);
  return `${f(start, !sameMonth)} – ${f(end, true)}`;
}

/** Department sheet names -> site department slugs */
export function deptSlugFor(sheetName: string): string | null {
  for (const d of site.departments as any[]) {
    if (d.sheetName === sheetName || (d.extraSheetNames ?? []).includes(sheetName)) return d.slug;
  }
  return null;
}
