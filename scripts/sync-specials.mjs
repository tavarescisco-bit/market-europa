// Pulls the live specials from the Google Sheet (single source of truth) into content/specials.csv.
// Requires the sheet to be shared as "Anyone with the link: Viewer". Falls back to the committed CSV if the fetch fails.
import fs from 'node:fs';
const id = process.env.SHEET_ID || '1ERkqCux2ucSdfu71rkluqwzlg_L0aZt1f8tv2SjzkfY';
const url = `https://docs.google.com/spreadsheets/d/${id}/export?format=csv&gid=0`;
try {
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const text = await res.text();
  if (!/^campaign,start_date/i.test(text.trim())) throw new Error('Unexpected header – is the sheet shared with "Anyone with the link"?');
  fs.writeFileSync('content/specials.csv', text);
  console.log(`Synced ${text.split('\n').length - 1} rows from Google Sheet.`);
} catch (e) {
  console.warn(`Sheet sync skipped (${e.message}). Using committed content/specials.csv.`);
}
