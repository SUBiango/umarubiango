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

1. Write note in `notes/YYYY-MM-DD-slug.md`
2. Set frontmatter:
   ```yaml
   send: true        # shows newsletter signup form at bottom of note
   broadcast: true   # marks note for email broadcast
   sent: false       # set to true manually after broadcast fires
   ```
3. Add entry to `data/notes-index.json`
4. `git commit && git push` → Netlify deploys automatically
5. Confirm note is live at the Netlify URL
6. Run: `node scripts/broadcast.js`
7. Confirm broadcast sent in ConvertKit dashboard
8. Set `sent: true` in frontmatter → `git commit && git push`

---

## Subscriber Sync

**Method:** _To be decided before launch._

- **Option A (Manual):** Export subscribers from Netlify Forms dashboard as CSV → import to ConvertKit
- **Option B (Automated):** Netlify webhook → Netlify Function → ConvertKit API adds subscriber

---

## Broadcast Script Setup

1. Create a `.env` file in the project root (never committed):
   ```
   CONVERTKIT_API_KEY=your_api_key_here
   CONVERTKIT_BROADCAST_FROM_URL=https://umarubiango.dev
   ```
2. Install dev dependencies: `npm install`
3. Run: `npm run broadcast`

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
