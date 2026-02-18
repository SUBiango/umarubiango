# Publishing Guide

This guide explains how to publish updates to `umarubiango.com` with the current workflow.

## Prerequisites

- Node dependencies installed:
  ```bash
  npm install
  ```
- Repo connected to Netlify auto-deploy from your main branch.

## What can be published

- Site/page edits (`index.html`, `lab.html`, `notes.html`, etc.)
- Lab data (`data/lab/*.json`)
- Now updates (`data/now.json`)
- Notes (`notes/*.md` + `data/notes-index.json`)

## Standard Publish Flow

1. Make your content/code changes.
2. For notes, generate static note pages:
   ```bash
   npm run generate:notes
   ```
3. Verify changed files:
   ```bash
   git status
   ```
4. Commit and push:
   ```bash
   git add .
   git commit -m "Your update message"
   git push
   ```
5. Netlify deploys automatically.

## Publishing a New Note (Important)

1. Create/update note markdown in `notes/<slug>.md` with frontmatter:
   - `title`
   - `date`
   - `excerpt`
   - `slug`
   - optional: `tags`, `send`, `broadcast`, `sent`
2. Add note entry to `data/notes-index.json`.
3. Generate static note page:
   ```bash
   npm run generate:notes
   ```
4. Commit and push.
5. Confirm these URLs after deploy:
   - Notes list: `https://umarubiango.com/notes.html`
   - Static note page: `https://umarubiango.com/notes/<slug>/`

## Why static note generation matters

`npm run generate:notes` creates `/notes/<slug>/index.html` pages with server-rendered:
- Open Graph tags
- Twitter tags
- Canonical URL

This ensures reliable social media previews when notes are shared.

## Newsletter + Broadcast flow

### Netlify newsletter form capture
- Newsletter form is submitted from the Notes experience and captured by Netlify Forms.
- Ensure production testing happens on deployed Netlify site (not plain local file open).

### Broadcast email
If note frontmatter includes:
- `broadcast: true`
- `sent: false`

Run:
```bash
npm run broadcast
```

Broadcast links now point to static note URLs (`/notes/<slug>/`).

After successful send, set `sent: true`, commit, and push.

## Quick Pre-Publish Checklist

- [ ] Note exists in both `notes/*.md` and `data/notes-index.json`
- [ ] `npm run generate:notes` executed
- [ ] `npm run generate:notes` completed without errors
- [ ] Generated files (e.g., `notes/<slug>/index.html`) are staged/committed
- [ ] No broken internal links in newly added/updated content
- [ ] No accidental `.dev` domain references
- [ ] Forms tested on deployed Netlify URL
- [ ] Social preview validated using a URL debugger if needed

## Troubleshooting

### Note link 404
- Check note filename and frontmatter slug alignment.
- Re-run `npm run generate:notes`.
- Confirm `notes/<slug>/index.html` exists and is committed.

### Newsletter subscription fails
- Confirm deploy is on Netlify and forms are enabled.
- Confirm hidden static fallback form exists in `notes.html`.

### Social cards don’t update
- Ensure static note page URL is shared (`/notes/<slug>/`), not hash URL.
- Use platform card validators to refresh cache.
