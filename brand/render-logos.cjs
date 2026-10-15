// Renders logo variants and social sizes from logo-master.html to PNG (and a lossless WebP for the site header).
const pw = require('/Users/franciscotavares/.nvm/versions/node/v24.14.1/lib/node_modules/@playwright/mcp/node_modules/playwright-core');
const fs = require('fs'); const path = require('path');
const OUT = path.join(__dirname, 'out'); fs.mkdirSync(OUT, { recursive: true });
const file = 'file://' + path.join(__dirname, 'logo-master.html');

const variants = [
  ['full-colour', 'full', 'transparent'], ['black', 'black', 'transparent'], ['white', 'white', 'transparent'],
  ['white-gold', 'whitegold', 'transparent'], ['gold', 'gold', 'transparent'], ['brand-espresso-gold', 'brand', 'transparent'],
];
const lockups = [['primary', ''], ['compact', 'compact'], ['mark', 'mark']];
const social = [
  // name, width, height, body class, lockup class, logo width, background
  ['instagram-profile-1080', 1080, 1080, 'whitegold', 'mark', 900, '#1F4D3A'],
  ['instagram-profile-light-1080', 1080, 1080, 'full', 'mark', 900, '#F4ECDD'],
  ['instagram-post-1080', 1080, 1080, 'full', 'compact', 960, '#F4ECDD'],
  ['instagram-story-1080x1920', 1080, 1920, 'whitegold', '', 940, '#1F4D3A'],
  ['facebook-cover-1640x624', 1640, 624, 'full', 'compact', 1000, '#F4ECDD'],
  ['facebook-profile-720', 720, 720, 'whitegold', 'mark', 600, '#2B1D14'],
  ['linkedin-banner-1584x396', 1584, 396, 'whitegold', 'compact', 760, '#1F4D3A'],
  ['youtube-tiktok-avatar-800', 800, 800, 'full', 'mark', 680, '#F4ECDD'],
  ['og-image-1200x630', 1200, 630, 'full', 'compact', 760, '#F4ECDD'],
];

(async () => {
  const b = await pw.chromium.launch({ headless: true, executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--no-sandbox'] });
  const ctx = await b.newContext({ deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.goto(file, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(800);

  const setup = async (bodyClass, lockupClass, logoW, bg) => {
    await page.evaluate(([bc, lc, w, bg]) => {
      document.body.className = bc; document.documentElement.style.setProperty('--bg', bg);
      const l = document.querySelector('.lockup'); l.className = 'lockup ' + lc; l.style.setProperty('--w', w + 'px');
    }, [bodyClass, lockupClass, logoW, bg]);
    await page.waitForTimeout(150);
  };

  // 1. Logo variants on transparent background, at 2400px master width + 800px web size
  for (const [name, cls] of variants) {
    for (const [lname, lcls] of lockups) {
      for (const w of [2400, 800]) {
        await page.setViewportSize({ width: w + 200, height: Math.round(w * 0.9) });
        await setup(cls, lcls, w, 'transparent');
        const el = await page.$('.lockup');
        const dark = /white|gold/.test(cls) && cls !== 'gold' && cls !== 'full';
        await el.screenshot({ path: path.join(OUT, `market-europa_${lname}_${name}_${w}.png`), omitBackground: true, type: 'png' });
        if (w === 800 && name === 'full-colour') await el.screenshot({ path: path.join(OUT, `market-europa_${lname}_${name}_${w}.webp`), omitBackground: true, type: 'webp', quality: 95 }).catch(() => {});
      }
    }
  }
  // 2. Social sizes with backgrounds
  for (const [name, W, H, cls, lcls, logoW, bg] of social) {
    await page.setViewportSize({ width: W, height: H });
    await setup(cls, lcls, logoW, bg);
    await page.screenshot({ path: path.join(OUT, `social_${name}.png`), type: 'png', clip: { x: 0, y: 0, width: W, height: H } });
  }
  await b.close();
  console.log(fs.readdirSync(OUT).length + ' files in ' + OUT);
})();
