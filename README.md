# Market Europa Moorabbin — website

Static Astro site. Weekly specials are read from `data/specials.csv`, which `npm run sync` refreshes from the Google Sheet
"Market Europa – Weekly Specials (source of truth)". The build only publishes rows whose dates include today (Australia/Melbourne),
so finished campaigns disappear by themselves and scheduled ones appear on their start date. GitHub Actions rebuilds daily at 00:05 AEST.

- `npm run dev` — local preview
- `npm run sync && npm run build` — pull the sheet and build to `dist/`
- Staging: GitHub Pages at /market-europa (set `SITE_URL` and `BASE_PATH=` repo variables when the custom domain is live)

Content that is not specials (hours, departments, café menu) lives in `src/data/site.json`.
