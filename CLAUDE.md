# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Stack & deploy

Vanilla HTML/CSS/JS personal site (umarubiango.com). **No framework, no bundler.** Hosted on Netlify; the publish root is the repo root (`publish = "."` in `netlify.toml`). Pages are authored as raw `.html` files at the repo root and served as-is.

The only build step is `scripts/generate-site.js` — a Node script that turns Markdown notes into static pages and fills the data-driven regions of the root pages.

## Design

**`docs/DESIGN-GUIDE-v2.md` is the source of truth for the visual system** ("Field notebook": aged paper, taped cards, stamps, ballpoint margin notes). It defines the exact tokens, type scale, tilt angles, interaction states and component specs. When the guide and a prototype disagree, the guide wins. `docs/DESIGN-GUIDE.md` is the superseded v1 — it still names Bricolage Grotesque and has no hover spec, so **don't build from it.**

The implementation lives in one file: `assets/css/main.css`. Its tokens mirror the guide's `:root` block verbatim — **change a value there, change it in the guide too.** `/docs/*` is force-404'd in `_redirects`, so nothing in `docs/` is publicly served.

### Typography

Four families, one job each. The rules that are easy to get wrong:

| Family | Job | Never |
|---|---|---|
| **Fraunces** 700, `SOFT 100, WONK 1` | Display only: headings, card titles, slogans, the name in the header | paragraphs |
| **Literata** 400/500/700 + 400 italic | All reading text, and **bold inside a note** | headings |
| **Caveat** 700 | Handwritten annotations | anything essential, anything under 23px |
| **Space Mono** 400/700 | Metadata, stamps, nav tabs, receipt, labels | prose |

One grouped rule in section 3b of `main.css` assigns Fraunces to every display element — add new headings to that list rather than setting the family inline. The soft/wonky cut comes from `--wonk`, which is the whole reason Fraunces is here; don't drop it.

**Note body is 19px, not 20px** — Literata has a larger x-height than the Bricolage it replaced, so 19px matches the old optical size. A standalone emphasis line and `**bold**` inside a note stay **Literata 700**, so they read as part of the text rather than as a heading.

The reference prototypes exported from the design tool live in `Field notebook · Desktop-html/`, which is **gitignored** — the Netlify publish root is the repo root, so committing it would serve a React mockup on the live domain. They are mockups, not production code; read them for intent and copy, not for markup. The guide is the source of truth either way.

Five rules the design rests on:

1. **Writing first.** The site exists to publish one field note a month.
2. **Quirky frame, clean reading.** Tilts, tape and handwriting decorate. Body text never sits on texture and never tilts.
3. **Muted and earthy.** No bright or saturated color.
4. **Built light, for 3G.** See the budget below.
5. **Honest content.** Projects show their real status, including parked and scrapped.

### Tilts, hover and press

Every tilted element gets `class="tilt"` and an `--angle` set in CSS (never inline, never random — fixed angles keep the page stable and visual diffs meaningful). `--mess` on `:root` scales every angle at once; ship at `1`.

Everything clickable behaves like paper on a desk: it lifts on hover and presses flat on click. Section 18 of `main.css` holds all of it, and three rules keep it working:

1. **Hover replaces the resting `rotate()`** — that's what makes cards and tabs straighten. So hover selectors must stay more specific than `.tilt`, and **never use `!important`.**
2. **Hover lives inside `@media (hover: hover)`** so a tap on a phone can't leave a state stuck on. `:active` and `:focus-visible` stay outside it.
3. **Keyboard focus gets the same lift as a pointer**, on top of the focus outline.

Hover only lifts, straightens and presses. It never reveals information, changes text color or scales anything. All transitions are switched off under `prefers-reduced-motion: reduce` — that block lists every transitioned selector by name, so **a new transition needs adding there too.**

Text links share one rule: a rust underline that fades out as the highlighter sweeps in. Markdown-generated links can't carry a class, so the selector list does the work instead of a `.link` class on every anchor — add new link contexts to all three lists (base, `:focus-visible`/`:hover`, reduced-motion). Do **not** put `color` in that rule: it would override the rust and ochre link colors set earlier in the file, which on the dark poda panel drops the link to unreadable `--ink`.

### Caveat is decoration

The handwriting font carries no information a reader needs. Never use it for body text, links or anything essential, and never below 23px. Only weight 700 is bundled.

## Commands

```bash
npm install          # gray-matter + marked (only used by scripts/)
npm run generate     # the build: note pages, tag pages, root-page regions, sitemap
npm run broadcast    # send pending ConvertKit broadcasts (live)
DRY_RUN=1 npm run broadcast
npx serve .          # local dev server
```

`npm run generate:notes` is kept as an alias of `npm run generate`. There is no test runner, linter or typecheck; `tests/` holds a manual checklist.

## The build

`npm run generate` reads `notes/*.md`, `data/workshop.json` and `data/now.json`, then writes:

| Output | Notes |
|---|---|
| `notes/<slug>/index.html` | one full field note page each |
| `notes/tag/<tag>/index.html` | a filtered archive per tag |
| `data/notes-index.json` | the manifest — a **build input**, never fetched by the browser |
| `sitemap.xml` | every page, with real `lastmod` dates |
| regions inside `index.html`, `notes.html`, `now.html` | see below |

**Everything a reader needs is in the HTML at build time.** Nothing — not the note list, not the receipt, not "now" — is fetched client-side. Crawlers, link previews and slow connections must never see "loading". Do not reintroduce a `fetch()` that renders content.

### Generated regions in hand-authored pages

The root pages are hand-written, but their data-driven parts are injected between markers:

```html
<!-- generated:notes -->
  ...replaced on every build...
<!-- /generated:notes -->
```

`index.html` has `notes` and `receipt`; `notes.html` has `tags` and `notes`; `now.html` has `now`. **Never hand-edit between the markers** — edit the Markdown or the JSON and re-run the build. Removing a marker makes the build fail loudly, which is intended.

Everything outside the markers (header, thesis, poda-poda panel, about, slip, footer) is yours to edit by hand.

### Publishing a note

1. Write `notes/<slug>.md` with the frontmatter below.
2. `npm run generate`.
3. Commit + push → Netlify deploys.
4. `npm run broadcast` POSTs notes where `broadcast: true` AND `sent: false` to ConvertKit `/v3/broadcasts`. **It does not write `sent: true` back** — that flip is manual, to keep the script idempotent on failure.

`broadcast.js` loads `.env` with its own minimal loader (no `dotenv`). Required: `CONVERTKIT_API_SECRET` (falls back to `CONVERTKIT_API_KEY`; broadcasts need the *secret*). Optional: `CONVERTKIT_BASE_URL`. The generator uses no env vars; `SITE_URL` is hardcoded in `generate-site.js`.

## Note frontmatter

```yaml
---
number: 4                 # sequential, never reused; stamped as NO. 04
title: "The AI Assistant I Want To Build"
tag: AI                   # ONE display tag for the stamp row
dek: "One line under the title on the note page."
summary: "Card text on the homepage and archive. Keep it under ~160 characters."
date: 2026-10-17
excerpt: "Used for og:description and meta description."
tags: [development, ai]   # "filed under" + which tag pages it appears on
slug: "the-ai-assistant-i-want-to-build"
featured_image: "/assets/images/notes/<name>.jpg"   # social card only, not shown in-page
featured_image_alt: "..."
featured_image_width: 1200
featured_image_height: 630
send: true
broadcast: false
sent: false
# signature: false        # opt out of the "— Umaru" sign-off
---
```

- `number` wins over position. Omit it and the build numbers notes oldest → newest, which renumbers everything when an older note is added — so set it explicitly.
- `dek`, `summary` and `tag` all fall back to `excerpt` / the first `tags` entry if missing. The fallbacks are mediocre; write the real thing.
- **Read time** is computed (words ÷ 200, rounded up) with HTML and Markdown syntax stripped. Don't put it in frontmatter.
- **Dates** render as `17 OCT 2026` on the featured card and note page, `JUN 2026` on standard cards.
- The newest note is always the featured card. Card tints and tilts cycle by position in CSS, not in the HTML.

### URLs are permanent

`/notes/<slug>/` must never change — don't break inbound links or rankings. Tag pages live at `/notes/tag/<slugified-tag>/`; the old `notes.html?tag=x` URLs 301 there via `_redirects`, and the old `notes.html#slug` links are forwarded by `site.js`.

## Writing inside a note

Plain Markdown gets the field-notebook treatment automatically: `##` headings, bold, links, `<ul>` with rust squares, `<ol>` with rust number stamps (a real `<ol>`, so screen readers still announce the numbering), code blocks on the dark surface, and a blockquote becomes a taped manila index card.

The richer components from the design guide are raw HTML in the Markdown (blank line above and below):

```html
<p class="emphasis">No forms. No navigating menus. Just a conversation.</p>

<div class="callout-card">
First clause.<br>
Second clause.
</div>

<div class="callout-dark paper-dark">
<span>The LLM interprets.</span>
<span>The state engine decides what is true.</span>
<span>The database is the source of truth.</span>
</div>

<div class="chat">
<span class="chat-from">me → Doli</span>
<p class="bubble">I need to call the university tomorrow.</p>
</div>

<p class="margin-note">↑ the whole point</p>
```

Budgets the guide sets, worth honoring: **one** highlighter (`<span class="highlight">`), **one** dark callout and **one** margin note per note. The `— Umaru` signature is appended automatically.

## Images

The cover image is **social only** — the redesign has no in-page hero, by design ("no note cover images", nothing above the fold). It still feeds `og:image`/`twitter:image`, so it must satisfy the social spec: **1200×630 JPG, quality ~82, one file.** The frontmatter dimensions are emitted as `og:image:width`/`height`, so wrong numbers produce bad crops.

**Do not use WebP for covers.** It works (`socialImage()` looks for a same-named `.jpg`/`.jpeg`/`.png` twin), but nothing verifies the twin still matches, so the page can serve one picture while Facebook serves another. Note bodies may use WebP.

`assets/images/og-image.jpg` is the site-wide card for every non-note page, built by `scripts/make-og-card.py` from the site's own materials: paper grain, the about polaroid, the thesis in Fraunces with its highlighter. Regenerate it rather than editing the JPEG. The script needs TTF copies of the webfonts (Pillow cannot read `.woff2`) — its docstring says how.

The thesis is *inside* the image on purpose: Facebook and X drop the description, so the card has to carry its own words. It is sized and contrast-checked at **360px**, roughly a Slack unfurl, not at 1200. If you restyle it, check it there.

`docs/og-card-template.svg` is a Figma-importable version of the same idea for one-off per-note cards; mirror its headline into `og_title`.

## Why Facebook and X show no description

**"Facebook only shows the image and title, the excerpt is missing" is not a bug and is not stale cache — do not try to fix it in the generator.** X stripped descriptions from `summary_large_image` cards in Oct 2023; Facebook dropped the snippet from feed previews. WhatsApp and the Facebook debugger still show `og:description`, which is exactly why it looks like a site bug. Confirmed empirically (Oct 2026): the debugger lists the parsed description while the preview beside it omits it.

Since the title is the only text those platforms render:

- `og_title` frontmatter (optional) overrides `og:title`, `twitter:title` and the X share text without touching the `<h1>` or `<title>`.
- Any wording that must survive into a Facebook or X preview has to be **inside the 1200×630 image**.

### Forcing a re-scrape

OG results are cached (~7 days on Facebook). After publishing or editing a note: [FB debugger](https://developers.facebook.com/tools/debug/) → Scrape Again (also covers WhatsApp/Instagram); [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/). X re-scrapes on its own.

## Page → data wiring

| Page | Source |
|---|---|
| `index.html` | `notes/*.md` (cards), `data/workshop.json` (receipt) |
| `notes.html` | `notes/*.md` — every note, plus tag chips |
| `notes/<slug>/` | generated from `notes/<slug>.md` |
| `notes/tag/<tag>/` | generated |
| `now.html` | `data/now.json` — **re-run the build after editing it** |
| `contact.html`, `how-i-think.html`, `404.html` | static |

## Copy: don't claim a location

The site says the work is **for** West Africa, never that it is written **in** West Africa — Umaru is not currently there, and copy that goes stale is copy nobody remembers to fix. "Field notes from building **for** West Africa" stays true from anywhere.

Note titles and note bodies name Sierra Leone freely; that's the subject matter and it's accurate. The rule is only about claims on the author's whereabouts: no "based in", no bare location in the byline. The nonprofit genuinely is in Kono District, so the bio says so about the organisation, not about him.

The move back is deliberately **not** mentioned anywhere. If it ever should be, `/now` is the page built for things that change.

## Links

`SOCIAL_LINKS` near the top of `scripts/generate-site.js` is the one list of profiles; the generated footer reads from it. The six hand-authored root pages carry the same markup inline, and `index.html` repeats the URLs in its `schema.org` `sameAs` — **update all three places together** or they drift.

**Links that leave the site open in a new tab** (`target="_blank" rel="noopener"`): footer profiles, share buttons, receipt project URLs. These stay in the same tab: `mailto:`, internal pages, and the receipt's Doli row (it points at a note). Markdown links in a note body are handled in `noteBody()` — anything not starting with `SITE_URL` gets the new-tab treatment automatically.

## JavaScript

`assets/js/site.js` is the only script, loaded `defer` on every page, and **nothing you need to read the site depends on it**: it submits the two forms without a reload and forwards legacy note links. Both forms POST normally to Netlify Forms if it never loads. Keep it that way.

## Subscriber sync (Netlify Function)

`netlify/functions/sync-subscriber.js` receives the Netlify Forms webhook for the `newsletter` form and subscribes the email to ConvertKit (`/v3/forms/<id>/subscribe` — that endpoint takes `api_key`, not `api_secret`). It validates an `x-webhook-secret` header (constant-time compare), ignores submissions whose `form_name` is not `newsletter`, and uses a 10s socket timeout. Env: `CONVERTKIT_API_KEY`, `CONVERTKIT_FORM_ID`, `NETLIFY_SYNC_SECRET`.

## Performance budget

| Asset | Budget | Now |
|---|---|---|
| HTML per page (gzip) | < 30 KB | ≤ 5 KB |
| CSS (gzip) | < 15 KB, one file | ~7.7 KB |
| JS required to read | 0 KB | 0 KB |
| Fonts | ≤ 6 latin-subset `.woff2`, `swap` | 6 files, 251 KB |
| Texture | ~20 KB, cached a year | 20 KB |
| Favicon set | small, cached a year | 6 files, ~100 KB |
| Images above the fold | none | none |

Fonts are self-hosted in `assets/fonts/`, at the exact budget of 6 files. **Literata roman and Fraunces are preloaded** on every page; the rest download only when a page actually renders a glyph that needs them (the italic file costs nothing on a note with no italics).

Two of them are deliberately narrowed, so widening the design means re-fetching from Google Fonts:

- **Fraunces** is pinned to one instance — `wght 700, SOFT 100, WONK 1`, optical size still variable. That is 33 KB; the full four-axis file is 121 KB. Adding a second display weight means refetching with a wider `wght` range *and* widening the `@font-face` declaration, which still says `font-weight: 700`.
- **Caveat** is the static 700 instance (51 KB, vs 75 KB variable), because 700 is the only weight the design uses.

The `Literata Fallback` and `Fraunces Fallback` faces map onto Georgia with `size-adjust: 105%` and `90%`. Both numbers are **measured in a browser**, not guessed — re-measure if either family changes rather than estimating. Every line-height in the stylesheet is a unitless number, so matching width is what keeps the line count identical across the swap.

### Favicon

The whole set is the header's UB stamp — paper ground, rust ring, Space Mono Bold "UB" tilted −8°. `assets/images/favicon/favicon.svg` is true vector (the glyphs are outlines, not `<text>`, so it needs no font to render) and is under 1 KB. The rasters were generated from the same geometry by `make_favicon.py`; keep that script's constants and `main.css`'s `.brand-stamp` in step if the mark ever changes.

Note: Chrome renders a `.ico` badly inside an `<img>` tag — green, wrong frame. That is a Chrome quirk, not a broken file. Check a favicon by loading the `.ico` URL directly or by looking at the tab.

Measure on a throttled "Slow 3G" profile. The footer promise ("built light, for 3G") should stay true.

## Caching

`netlify.toml` sets `no-cache` (ETag revalidation) on `assets/css/*`, `assets/js/*`, all HTML and `data/now.json`; `max-age=300` on other `data/*`; and `immutable` 1-year on `assets/images/*`, `assets/fonts/*` and `assets/paper-grain.png`. No `?v=` cache-busting — the site relies on ETag revalidation.

## CSP

`netlify.toml` ships a strict CSP: `script-src 'self'`, `font-src 'self'`, no inline scripts, styles allow inline. **Nothing third-party is loaded any more** — no CDN, no Google Fonts. Adding an external script, font or API call means widening the CSP, or it fails silently. Prefer not to.

## Not yet designed

Per the guide's section 13, with the current status:

- Field notes archive, tag pages, `/now`, 404 — **built**, following the system
- Dark mode: none planned; the paper concept is inherently light
- Open Graph images in the field-notebook style (manila card + NO. stamp) — still the old covers
