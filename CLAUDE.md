# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack & deploy

Vanilla HTML/CSS/JS personal site (umarubiango.com). **No build step, no framework, no bundler.** Hosted on Netlify; the publish root is the repo root (`publish = "."` in `netlify.toml`). Pages are authored as raw `.html` files at the repo root and served as-is.

The only "build" is a Node script that converts Markdown notes into static `notes/<slug>/index.html` pages and regenerates `data/notes-index.json`.

## Commands

```bash
npm install                  # installs gray-matter + marked (only used by scripts/)
npm run generate:notes       # regenerate notes/<slug>/index.html AND data/notes-index.json
npm run broadcast            # send pending ConvertKit broadcasts (live)
DRY_RUN=1 npm run broadcast  # preview broadcasts without API calls
npx serve .                  # local dev server (no build, just static files)
```

There is no test runner, no linter, and no typecheck. `tests/` contains only `TESTING_GUIDE.md` (manual checklist).

## Note publishing pipeline

Source of truth for a note is `notes/<slug>.md` with YAML frontmatter. **Both** `notes/<slug>/index.html` and `data/notes-index.json` are **generated output** — never hand-edit either.

1. Author writes `notes/<slug>.md` with frontmatter (`title`, `date`, `excerpt`, `tags`, `featured_image`, plus workflow flags `send`, `broadcast`, `sent`).
2. `npm run generate:notes` (`scripts/generate-note-pages.js`) reads every `.md` in `notes/`, runs `gray-matter` + `marked`, and writes:
   - `notes/<slug>/index.html` per note (with prev/next nav by date desc, OG/Twitter meta, optional featured image)
   - `data/notes-index.json` containing `{slug, title, date, excerpt, tags}` per entry, sorted newest first
   For `.webp` `featured_image`, the script looks for a sibling `.jpg`/`.jpeg`/`.png` and uses that as the social image fallback (`findSocialImageFallback`) — Facebook and many other scrapers handle WebP poorly.
3. Commit + push → Netlify deploys.
4. `npm run broadcast` (`scripts/broadcast.js`) scans `notes/*.md` for entries where `broadcast: true` AND `sent: false`, and POSTs each to ConvertKit's `/v3/broadcasts` endpoint. **It does not write `sent: true` back** — that flip is manual to keep the script idempotent on failure.

`broadcast.js` loads `.env` via its own minimal loader (no `dotenv` dependency). Required env: `CONVERTKIT_API_SECRET` (falls back to `CONVERTKIT_API_KEY` for backwards compatibility — broadcasts require the *secret*, not the key). Optional: `CONVERTKIT_BASE_URL`. `generate-note-pages.js` uses no env vars.

`SITE_URL` is hardcoded to `https://www.umarubiango.com` in `generate-note-pages.js` — change there if the canonical host changes.

## Subscriber sync (Netlify Function)

`netlify/functions/sync-subscriber.js` receives the Netlify Forms submission webhook for the `newsletter` form and subscribes the email to ConvertKit (`/v3/forms/<id>/subscribe` — that endpoint legitimately takes `api_key`, not `api_secret`). It validates an `x-webhook-secret` header (constant-time compare), ignores submissions whose `form_name` is not `newsletter`, and uses a 10s socket timeout. Env: `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID`, `NETLIFY_SYNC_SECRET`.

## Caching

`netlify.toml` sets `no-cache` (ETag revalidation) on `assets/css/*`, `assets/js/*`, all HTML, and `data/now.json`; `max-age=300` on other `data/*`; and `immutable` 1-year on `assets/images/*` and `assets/fonts/*`. No `?v=` cache-busting — the site relies entirely on ETag revalidation.

## Social preview caching (Facebook, LinkedIn)

OG-scrape results are cached by Facebook (~7 days) and LinkedIn. After publishing or editing a note, manually force a re-scrape:
- Facebook (also covers WhatsApp/Instagram): https://developers.facebook.com/tools/debug/ → paste URL → **Scrape Again**
- LinkedIn: https://www.linkedin.com/post-inspector/
- X/Twitter: re-scrapes within minutes on its own

If a user reports "Facebook only shows title + image, not excerpt," it's almost always stale cache rather than missing meta tags. Generated pages emit `og:description`, `twitter:description`, `og:image:secure_url`, etc. — verify by reading the generated HTML before touching the generator.

## Page → data wiring

| Page                | Data source                                       |
| ------------------- | ------------------------------------------------- |
| `index.html`        | `data/now.json`, `data/notes-index.json`          |
| `notes.html`        | `data/notes-index.json` (filters by `?tag=` query) |
| `notes/<slug>/`     | generated from `notes/<slug>.md`                  |
| `now.html`          | `data/now.json`                                   |
| `contact.html`      | Netlify Forms (no data file)                      |

Front-end JS lives in `assets/js/`: `terminal.js` is shared utilities loaded by every page; `index.js`, `notes.js`, `now.js`, `note-page.js` are per-page entry points. `notes.js` is just the listing — it does NOT render individual notes (clicks navigate to the static `notes/<slug>/` pages; legacy hash URLs redirect there). `note-page.js` runs on generated note pages and initializes Prism syntax highlighting (Prism is loaded from jsDelivr CDN, allowed by the CSP in `netlify.toml`).

## CSP

`netlify.toml` ships a strict-ish CSP: scripts only from `'self'` + `cdn.jsdelivr.net`, no inline scripts, styles allow inline (needed for some terminal effects) + jsDelivr. If you add a third-party script or external API call from the browser, update the CSP `script-src` / `connect-src` lists or it will be blocked silently.
