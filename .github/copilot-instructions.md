# Copilot instructions for `personal-website`

## Commands

| Task | Command | Notes |
| --- | --- | --- |
| Install dependencies | `npm install` | Needed for the note-generation and broadcast scripts. |
| Run locally | `npx serve .` | Prefer a local server over opening `*.html` directly because the site fetches JSON and Markdown at runtime. |
| Generate static note pages | `npm run generate:notes` | Reads `notes/*.md` and writes committed pages to `notes/<slug>/index.html`. Run this after editing note Markdown or note metadata. |
| Send newsletter broadcasts | `npm run broadcast` | Requires `.env` values for ConvertKit. Use `DRY_RUN=1 node scripts/broadcast.js` for a no-send pass. |
| Manual testing | Follow `tests/TESTING_GUIDE.md` | There is no automated test runner in this repo. |

There are currently **no lint scripts** and **no automated test scripts** in `package.json`, so there is no single-test command to run.

## Architecture

- This is a **multi-page static site**: top-level HTML files (`index.html`, `notes.html`, `now.html`, `contact.html`, `how-i-think.html`) are the entry points, and Netlify serves the repo root directly.
- The frontend is **vanilla HTML/CSS/JS with global scripts**. `assets/js/terminal.js` is the shared dependency that provides nav, terminal rendering, read-time, share-button, and typewriter helpers. Page scripts load it first and then call its globals on `DOMContentLoaded`.
- Runtime content is split between **static HTML** and **fetched content**:
  - `index.html` and `now.html` fetch `data/now.json`.
  - `index.html` and `notes.html` fetch `data/notes-index.json`.
- Notes are **always served as pre-rendered static pages**:
  - `notes.html` is the listing only (filterable by tag, driven by `assets/js/notes.js`). Clicking a note navigates to a static page.
  - `scripts/generate-note-pages.js` renders each `notes/<slug>.md` into `notes/<slug>/index.html` and also regenerates `data/notes-index.json` (so the listing always reflects what's been built). Those generated pages load `assets/js/note-page.js` plus `terminal.js`.
  - Legacy `notes.html#<slug>` URLs are redirected to `notes/<slug>/` by `notes.js`.
- Netlify handles more than hosting:
  - `netlify.toml` defines CSP and cache headers.
  - Contact and newsletter forms post to `/` using Netlify Forms.
  - `netlify/functions/sync-subscriber.js` is the webhook target that pushes newsletter signups into ConvertKit.
  - `scripts/broadcast.js` is a local Node script for sending ConvertKit broadcasts based on note frontmatter flags.

## Key conventions

- Keep the stack **framework-free and bundle-free**. New frontend behavior should follow the existing pattern: plain scripts, globals, DOM queries, and `DOMContentLoaded` initialization.
- Reuse the **terminal UI primitives** instead of inventing new patterns. Existing pages consistently use `terminal-block`, `terminal-line`, `t-prompt`, `t-cmd`, `t-out`, `state-loading`, and `state-error`.
- Treat the Markdown file in `notes/*.md` as the **single source of truth** for note frontmatter and body. `data/notes-index.json` is generated output — never hand-edit it. Run `npm run generate:notes` after any `.md` change and commit both the regenerated `notes/<slug>/index.html` and the regenerated `data/notes-index.json`.
- Preserve the **Netlify newsletter form contract** when editing note signup behavior. The same field set appears in two places: the generator template in `scripts/generate-note-pages.js` and the hidden fallback form in `notes.html`. Keep them aligned.
- When editing generated note page behavior or templates, remember that `/notes/<slug>/index.html` uses **different relative paths** (`../../assets/...`, `../../notes.html`) from the top-level pages.
- Note frontmatter supports publish/broadcast behavior. The workflow relies on fields like `slug`, `excerpt`, `tags`, `featured_image`, `featured_image_alt`, `send`, `broadcast`, and `sent`, and `scripts/broadcast.js` only sends notes where `broadcast === true` and `sent !== true`.
