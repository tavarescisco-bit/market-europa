# Market Europa Moorabbin — website rules

Production site for a family-run European supermarket with deli, butcher, seafood, handmade pasta, bakery, liquor and a café (Antonio's fresh gnocchi bar). Goal: make people hungry, get them in the door this week, grow the specials email/SMS list. Feel: fresh, clean, modern, with an honest 1970s continental-grocer character. Never pastiche.

## Stack
Astro 7 static site, no UI framework, plain CSS with tokens in `src/styles/global.css`, self-hosted fonts in `public/fonts` (`src/styles/fonts.css`). Build for production: `SITE_URL=https://marketeuropa.com.au BASE_PATH= npm run build`. Hosting today: GitHub Pages from the `gh-pages` branch on marketeuropa.com.au. Forms need a serverless host (Cloudflare Pages Functions recommended, decision pending).

## Single sources of truth (never hard-code these in components)
- `content/store.json` — address, phone, hours, café hours, departments (with sheet names, notes, images), socials, legal and TODO fields. An empty string means unconfirmed: render nothing, never invent.
- `content/specials.csv` — weekly specials, synced from the Google Sheet by `npm run sync`. Columns double as Canva Bulk Create columns so print and web prices never disagree.
- `content/cafe.json` — café menu and "take it home" department links.
- `content/letterboard.json` — "Today at the counter" lines and `updatedAt`; hidden if older than 24 hours or empty.
- `content/seasonal.json` — active seasonal feature (Christmas pre-orders: ranges, cut-off, pickup slots).
- `content/gnocchi-drops.json`, `content/gazette.json` — limited drops and weekly gazette issues.
Unresolved items are listed by `src/lib/content.ts#todos()` and shown on `/launch-checklist` (dev builds only) and in `TODO.md`.

## Brand tokens
Colours: `--cream #F4ECDD` page background (never pure white) · `--paper #E8DAC0` alternate bands and photo backdrops · `--espresso #2B1D14` all text · `--pomodoro #B3322A` prices and ONE primary CTA per screen · `--bottle #1F4D3A` structure (top bar, tiles, labels) · `--saffron #E0A526` price-ticket fills and badges only, never as text on cream. No Italian-flag red/white/green combinations. Every text/background pair passes WCAG AA.

Type: headlines Fraunces 500 (Georgia fallback) · body/UI DM Sans 400/500 (system-ui fallback) · prices only Bebas Neue (Arial Narrow fallback). H1 `clamp(2.5rem, 6vw, 4.5rem)`, H2 `clamp(2rem, 4vw, 2.5rem)`, body 17–18 px, line-height 1.6, max 65ch, card prices 44 px or larger.

Spacing: 8 px scale (8, 16, 24, 32, 48, 64, 96). Sections 96 px desktop / 64 px mobile. Container 1200 px, 24 px mobile gutters, 24 px card gaps. Radius 10 px cards, 6 px buttons. Separate sections with colour bands, not border lines.

Logo: left-aligned lockup (round seal + "Market Europa" wordmark + small "Moorabbin"), 56 px desktop, 40 px mobile and when the sticky header shrinks. The seal is reused as favicon, footer stamp, video end card and OG image. The refreshed logo from the client replaces `src/components/Logo.astro` when it arrives.

Retro devices, max ONE per section: shelf-ticket price tag (saffron card, pomodoro Bebas numerals) · outlined rubber-stamp origin badge · thin pomodoro/cream awning-stripe divider (max twice per page) · changeable-letterboard panel. Everything else flat, modern, calm.

Motion: 150–250 ms fades and lifts only. Respect `prefers-reduced-motion` everywhere (video shows its poster only).

## Don'ts
No stock or AI photos presented as store products. No "est." without a real year. No autoplay with sound. No carousels for key content. Never more than one pomodoro button per screen. No social media embeds (reels are self-hosted). No placeholder text in production. Never invent prices, dates, history or names.

## Quality bar
Lighthouse mobile 95+ for Performance, Accessibility, Best Practices, SEO; LCP < 2.5 s, CLS < 0.1, INP < 200 ms. WCAG 2.2 AA: keyboard, visible focus, descriptive alt text, pause control on moving media, labelled forms with clear errors. AVIF/WebP responsive images, lazy below the fold. GroceryStore JSON-LD with OpeningHoursSpecification, geo and sameAs. Unique titles and meta per page targeting "European supermarket Moorabbin", "continental deli Heatherton", "Christmas seafood Moorabbin". sitemap.xml, robots.txt, OG image from the seal. Signup: email double opt-in, SMS consent as a separate unticked checkbox, every message identifies Market Europa and includes an unsubscribe (Spam Act 2003). Analytics events: directions_click, call_click, specials_view, list_share, signup_email, signup_sms, christmas_order_submit, video_play.

## Working method
Phase by phase. After each phase: `npm run build`, Lighthouse, screenshots at 390 px and 1440 px (Playwright), then report what is done, what is next, and the TODOs that need the store. Ask before adding any paid service or new dependency.
