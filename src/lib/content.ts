import store from '../../content/store.json';
import cafe from '../../content/cafe.json';
import letterboard from '../../content/letterboard.json';
import seasonal from '../../content/seasonal.json';
import drops from '../../content/gnocchi-drops.json';
import gazette from '../../content/gazette.json';

export { store, cafe, letterboard, seasonal, drops, gazette };
export type Department = (typeof store.departments)[number] & { liquor?: boolean };

const TZ = 'Australia/Melbourne';

/** 0 = Sunday … 6 = Saturday, in Melbourne. */
export function melbourneDow(d = new Date()): number {
  return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(new Intl.DateTimeFormat('en-US', { weekday: 'short', timeZone: TZ }).format(d));
}
export function todayHours(d = new Date()) {
  const dow = melbourneDow(d);
  return store.hours.find((h) => h.dow === dow) ?? store.hours[0];
}
export function melbourneISODate(d = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}
export function fmtDate(iso: string, opts: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short' }): string {
  if (!iso) return '';
  return new Intl.DateTimeFormat('en-AU', { timeZone: TZ, ...opts }).format(new Date(iso.length === 10 ? iso + 'T12:00:00+10:00' : iso));
}
export function fmtTime(iso: string): string {
  return new Intl.DateTimeFormat('en-AU', { timeZone: TZ, hour: 'numeric', minute: '2-digit', weekday: 'short' }).format(new Date(iso));
}

export function departmentBySlug(slug: string): Department | undefined {
  return (store.departments as Department[]).find((d) => d.slug === slug);
}
export function departmentForSheetName(name: string): Department | undefined {
  return (store.departments as Department[]).find((d) => d.sheetNames.includes(name));
}

/** Letterboard is shown only when it has lines and was updated within 24 hours. */
export function letterboardLive(now = Date.now()) {
  if (!letterboard.updatedAt || !letterboard.lines?.length) return null;
  const age = now - new Date(letterboard.updatedAt).getTime();
  if (isNaN(age) || age > 24 * 3600 * 1000) return null;
  return letterboard;
}

export function activeSeasonal() {
  const key = seasonal.active as keyof typeof seasonal;
  const s = key && key !== 'active' ? (seasonal as any)[key] : null;
  return s && s.title ? { key, ...s } : null;
}

/** Every unresolved item that must come from the store before launch. */
export function todos(): { area: string; item: string }[] {
  const t: { area: string; item: string }[] = [];
  const need = (cond: boolean, area: string, item: string) => { if (cond) t.push({ area, item }); };
  need(!store.foundingYear, 'Story', 'Founding year (footer "est." and About page stay hidden until supplied)');
  need(!store.familyStory, 'Story', 'Family story and names for the About page');
  need(!store.legalName || !store.abn, 'Legal', 'Legal entity name and ABN for the footer, privacy policy and email footers');
  need(!store.liquorLicence, 'Legal', 'Liquor licence number and the Liquor Control Victoria warning notice for the Liquor page');
  need(!store.holidayHours.length, 'Hours', 'Public-holiday hours (Melbourne Cup, Christmas, New Year, Easter)');
  need(!store.transport, 'Visit', 'Public transport notes (bus routes, nearest stops)');
  need(!store.hero.poster, 'Media', 'Hero poster image (16:9 desktop, 4:5 mobile)');
  need(!store.hero.mp4Desktop || !store.hero.mp4Mobile, 'Media', 'Hero video: 16:9 desktop and 4:5 mobile, MP4 + WebM, 3 MB or less each');
  need(!store.reels.length, 'Media', 'Three vertical 9:16 clips for "Made here, landed here" (self-hosted)');
  need(store.departments.some((d) => !d.image), 'Media', 'Department photos: ' + store.departments.filter((d) => !d.image).map((d) => d.name).join(', '));
  need(!cafe.pricesConfirmed, 'Café', 'Confirm café menu items and prices (currently from the 2025 Canva menu)');
  const x = (seasonal as any).christmas;
  need(!x?.cutoffDate, 'Christmas', 'Christmas pre-order cut-off date');
  need(!x?.pickupDates?.length || !x?.pickupSlots?.length, 'Christmas', 'Christmas pickup dates and time slots');
  need(x?.ranges?.every((r: any) => !r.items?.length), 'Christmas', 'Christmas ranges: seafood, hams, panettone and platters with prices');
  need(!drops.current, 'Gnocchi drop', "This month's gnocchi collaboration (name, partner, dates, price)");
  need(!gazette.issues.length, 'Gazette', "First gazette issue (this week's specials plus one story)");
  need(!store.analyticsId, 'Analytics', 'GA4 measurement ID');
  t.push({ area: 'Specials', item: 'Confirm the specials rows marked "to confirm" in the sheet, and add product cut-out photos (image_url column)' });
  t.push({ area: 'Forms', item: 'Choose the forms/email host (Cloudflare Pages Functions recommended) and the email provider; forms are inert until then' });
  t.push({ area: 'Brand', item: 'Refreshed logo files (SVG) to replace the interim seal' });
  return t;
}
