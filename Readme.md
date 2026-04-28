# umarubiango.dev

Personal website of Umaru B Biango — hybrid hacker-lab + clean portfolio.

**Stack:** Vanilla HTML, CSS, JS. No frameworks. No build step.  
**Hosting:** Netlify (static, CDN-backed, forms via `data-netlify`)  
**Performance target:** <200kb per page, >90 Lighthouse score on 3G

---

## Pages

| Page | File | Data Source |
|------|------|-------------|
| Home | `index.html` | `data/now.json`, `data/lab/*.json` |
| Lab | `lab.html` | `data/lab/*.json` |
| Notes | `notes.html` | `notes/*.md`, `data/notes-index.json` |
| How I Think | `how-i-think.html` | Static |
| Now | `now.html` | `data/now.json` |
| Contact | `contact.html` | Netlify Forms |

---

## Publishing a Note + Sending a Broadcast

1. Write note in `notes/slug.md`
2. Set frontmatter:
   ```yaml
   send: true        # shows newsletter signup form at bottom of note
   broadcast: true   # marks note for email broadcast
   sent: false       # set to true manually after broadcast fires
   ```
3. Add entry to `data/notes-index.json`
4. Run: `npm run generate:notes` (builds `/notes/<slug>/` static page with social meta tags)
5. `git commit && git push` → Netlify deploys automatically
6. Confirm note is live at `https://umarubiango.com/notes/<slug>/`
7. Run: `node scripts/broadcast.js`
8. Confirm broadcast sent in ConvertKit dashboard
9. Set `sent: true` in frontmatter → `git commit && git push`

---

## Subscriber Sync

**Method:** Option B (Automated) is implemented.

- Netlify Forms submission webhook → `/.netlify/functions/sync-subscriber`
- Function subscribes the email to ConvertKit form via API

### Option B Setup Steps

1. Add environment variables in Netlify (Site settings → Environment variables):
   - `CONVERTKIT_API_KEY`
   - `CONVERTKIT_FORM_ID`
   - `NETLIFY_SYNC_SECRET` (recommended)
2. In Netlify, configure a Form submission webhook:
   - Event: Newsletter form submission
   - URL: `https://umarubiango.com/.netlify/functions/sync-subscriber`
   - Header: `x-webhook-secret: <NETLIFY_SYNC_SECRET>`
3. Deploy.
4. Submit the newsletter form once and confirm subscriber appears in ConvertKit.

---

## Broadcast Script Setup

1. Create a `.env` file in the project root (never committed):
   ```
   CONVERTKIT_API_KEY=your_api_key_here
   CONVERTKIT_BASE_URL=https://umarubiango.com
   CONVERTKIT_FORM_ID=your_convertkit_form_id
   NETLIFY_SYNC_SECRET=your_webhook_shared_secret
   ```
2. Install dev dependencies: `npm install`
3. Run: `npm run broadcast`

---

## Caching Strategy

No build pipeline means no content-hashed filenames. Cache busting is handled manually via a `?v=` query string on all CSS and JS references in every HTML file.

### Cache headers (set in `netlify.toml`)

| Resource | Strategy | Reason |
|---|---|---|
| `assets/css/*` | `no-cache` | Always revalidate via ETag |
| `assets/js/*` | `no-cache` | Always revalidate via ETag |
| `assets/images/*` | `immutable`, 1 year | Never changes at same URL |
| `assets/fonts/*` | `immutable`, 1 year | Never changes at same URL |
| `data/now.json` | `no-cache` | Updated content |
| `data/*` | 5 minutes | Infrequently updated |
| `*.html` / `/` | `no-cache` | Always serve latest markup |

### When to bump `?v=`

Bump the version string in all HTML files **any time you change a CSS or JS file** before deploying.

- Changed `main.css` or any `.js` file → bump `?v=`
- Changed only `.json` data or HTML content → no need to bump
- When in doubt → bump it (harmless)

---

## Development

No build step. Open any `.html` file directly or use a local server:

```bash
npx serve .
```

---

## Folder Structure

```
umarubiango.dev/
├── index.html
├── lab.html
├── notes.html
├── how-i-think.html
├── now.html
├── contact.html
├── assets/
│   ├── css/main.css
│   ├── js/
│   │   ├── terminal.js      ← shared utilities
│   │   ├── index.js
│   │   ├── lab.js
│   │   ├── notes.js
│   │   └── now.js
│   ├── fonts/
│   └── images/
├── data/
│   ├── lab/ 
│   │   ├── experiments.json
│   │   ├── architecture.json
│   │   ├── insights.json
│   │   └── failures.json
│   ├── now.json
│   └── notes-index.json
├── notes/
├── scripts/
│   └── broadcast.js
├── _redirects
└── netlify.toml
```
