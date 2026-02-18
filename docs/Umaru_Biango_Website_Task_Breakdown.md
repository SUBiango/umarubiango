# Umaru Biango Personal Website — Task Breakdown

**Derived from:** PRD v3.0  
**Date:** 2026-02-17  
**Total Phases:** 6  

> Tasks are sequenced by dependency. Complete each phase before starting the next.
> Each task has a clear **done condition** — don't mark it done without it.

---

## Phase 0 — Setup & Foundation
*Everything else blocks on this. Do it once, do it right.*

---

### T-001 — Initialize repo and folder structure
**Description:** Create the git repository and scaffold the full folder structure as defined in PRD §5.

**Deliverables:**
- Git repo initialized (local + GitHub/remote)
- All folders created: `assets/css/`, `assets/js/`, `assets/fonts/`, `assets/images/`, `data/lab/`, `notes/`, `scripts/`
- All HTML files stubbed (empty `<!DOCTYPE html>` shells): `index.html`, `lab.html`, `notes.html`, `how-i-think.html`, `now.html`, `contact.html`
- `data/now.json` created with placeholder content
- `_redirects` file created (empty for now)
- `netlify.toml` created with basic config
- `README.md` created with project summary

**Done when:** `git status` is clean, all files exist, Netlify can detect the repo.

---

### T-002 — Configure Netlify deployment
**Description:** Connect the repo to Netlify and confirm auto-deploy on push.

**Deliverables:**
- Repo connected to Netlify project
- Auto-deploy on push to `main` confirmed
- Custom domain configured (or placeholder URL noted)
- Netlify Forms enabled on the project

**Done when:** Pushing a change to `main` triggers a Netlify deploy and the site is live at the Netlify URL.

---

### T-003 — Set up CSS variables and base stylesheet
**Description:** Build `assets/css/main.css` — the single stylesheet used across all pages. Establish all design tokens as CSS variables. No page-specific styles yet.

**Deliverables:**
```css
/* All of these defined as CSS variables */
--color-bg: #0a0e14
--color-text: #c5c8c6
--color-prompt: #00ff41 (at 70% opacity for >)
--color-command: #ffffff
--color-accent-blue: #00d9ff
--color-border: /* muted, subtle */
--font-terminal: 'JetBrains Mono', monospace
--font-body: 'Inter', sans-serif
--font-size-base: /* set for body */
--spacing-* /* consistent spacing scale */
```
- CSS reset / normalize
- Base typography rules
- `body` background and default text
- `.terminal-block` base styles (reusable component)
- `.skip-link` styles (accessibility)
- Responsive breakpoints defined as variables or comments

**Done when:** All variables are defined, `main.css` links correctly in a stub HTML file, no visual regressions on a blank page.

---

### T-004 — Download and subset fonts
**Description:** Download JetBrains Mono and Inter, subset to Latin characters only, convert to woff2, and place in `assets/fonts/`.

**Deliverables:**
- `JetBrainsMono-Regular.woff2` (Latin subset)
- `JetBrainsMono-Bold.woff2` (Latin subset, if used)
- `Inter-Regular.woff2` (Latin subset)
- `Inter-SemiBold.woff2` (Latin subset, weight 600)
- `@font-face` declarations added to `main.css` with `font-display: swap`
- Total font weight: ≤60kb

**Done when:** Fonts render correctly in a browser with no flash of unstyled text, DevTools confirms woff2 files are being loaded, total font payload ≤60kb.

---

### T-005 — Build shared navigation component
**Description:** Write the shared `<nav>` HTML and its CSS. This will be manually copy-pasted into each page (no templating engine).

**Deliverables:**
- Nav links: Home, Lab, Notes, How I Think, Now, Contact
- Active state styling (current page highlighted)
- Terminal aesthetic (monospace, minimal, dark)
- Mobile-responsive (hamburger or stacked)
- Skip-to-main link at top of nav for accessibility
- `aria-current="page"` attribute pattern documented for each page

**Done when:** Nav renders correctly on desktop and mobile, all links work on the stub pages, active state is clear.

---

### T-006 — Write shared terminal JS utilities
**Description:** Build `assets/js/terminal.js` — reusable vanilla JS functions used across multiple pages. No page-specific logic here.

**Deliverables:**
- `typewriter(element, text, speed)` — types text character by character
- `terminalCursor(element)` — adds blinking cursor animation
- `renderTerminalBlock(commands)` — takes array of `{cmd, output}` objects and renders terminal HTML
- All functions exported as named functions (no module bundler — just a plain JS file with clear function names)

**Done when:** Each function is tested manually in the browser console on a stub page and works correctly.

---

## Phase 1 — Simple Pages (No Dynamic Content)
*Build the pages that don't require JS data fetching. Get the aesthetic locked in before tackling dynamic pages.*

---

### T-007 — Build How I Think page
**Description:** Build `how-i-think.html` — fully static, terminal-style philosophy display. First real page. Use this to establish and validate the full aesthetic.

**Deliverables:**
- Full nav included
- Terminal block rendering principles and philosophy (PRD §3.4)
- Terminal prompt format: `> command` / output (no prefix, left-aligned)
- Styled per PRD §10 (prompt green, command white, output light gray)
- Accessible: ARIA labels on terminal elements, semantic HTML
- Links `main.css` and `terminal.js`

**Done when:** Page matches terminal formatting spec, passes WAVE accessibility checker with 0 errors, looks correct on mobile.

---

### T-008 — Build Contact page
**Description:** Build `contact.html` with Netlify Forms.

**Deliverables:**
- Terminal-style form presentation
- Form fields: name, email, message (PRD §3.6)
- `data-netlify="true"` attribute on form
- `<label>` elements for all inputs (not placeholder-only)
- Vanilla JS confirmation message on submit (replaces form with terminal-style output)
- Form submission tested and confirmed received in Netlify dashboard

**Done when:** A real test submission appears in the Netlify Forms dashboard. Confirmation message renders correctly.

---

## Phase 2 — Homepage
*Tackled separately because of the typewriter/animation complexity.*

---

### T-009 — Build homepage hero (terminal animation)
**Description:** Build the animated terminal hero section of `index.html` (PRD §3.1).

**Deliverables:**
- Terminal block with typewriter effect:
  ```
  > whoami
  Umaru Biango
  > role
  Emerging markets product builder
  > thesis
  I design systems where constraints are real.
  ```
- Cursor blink animation while typing
- Animation uses `terminal.js` typewriter utility (T-006)
- Animation is CSS-transform-based (no layout shifts)
- Respects `prefers-reduced-motion` media query (skips animation, shows text immediately)

**Done when:** Animation plays correctly on page load, skips cleanly when reduced motion is preferred, no layout shift during animation (CLS = 0).

---

### T-010 — Build homepage sections
**Description:** Build the remaining sections of `index.html` below the hero.

**Deliverables:**
- **What I Build For** — static content section
- **Current Systems** — static content section
- **Lab preview** — static placeholder (will be wired to real data in T-013)
- **Now snapshot** — static placeholder (will be wired to real data in T-015)
- **How I Think preview** — static terminal block with 2-3 principles
- Full nav included
- All sections styled consistently with terminal aesthetic

**Done when:** Full homepage renders correctly, all sections present, no broken links.

---

## Phase 3 — Dynamic Pages
*These require JS data fetching. Build in order: Now (simplest) → Lab → Notes (most complex).*

---

### T-011 — Create sample data files
**Description:** Before building dynamic pages, create realistic sample data files so pages can be built and tested against real content shape.

**Deliverables:**
- `data/now.json` — filled with real current data
- `data/lab/experiments.json` — 2-3 sample entries matching PRD §8 schema
- `data/lab/architecture.json` — 2-3 sample entries
- `data/lab/insights.json` — 2-3 sample entries
- `data/lab/failures.json` — 2-3 sample entries
- `notes/2026-02-17-sample-note.md` — one full-length sample note with frontmatter, body text, a code block, and `send: true` in frontmatter

**Done when:** All files exist, are valid JSON/Markdown, and match the schemas defined in PRD §8.

---

### T-012 — Build Now page
**Description:** Build `now.html` — fetches `data/now.json` and renders terminal-style output (PRD §3.5).

**Deliverables:**
- `fetch('data/now.json')` on page load
- Terminal output rendered dynamically from JSON:
  ```
  > currently
  building: [value]
  learning: [value]
  optimizing: [value]
  ignoring: [value]
  > last_updated
  [value]
  ```
- Graceful error state if fetch fails (static fallback text)
- `assets/js/now.js` — page-specific JS module

**Done when:** Page renders correct data from `now.json`, error state works when JSON is removed temporarily, content is readable on mobile.

---

### T-013 — Build Lab page (render + categories)
**Description:** Build `lab.html` — fetches all lab JSON files and renders folder-style terminal view by category (PRD §3.2).

**Deliverables:**
- Fetches `data/lab/experiments.json`, `architecture.json`, `insights.json`, `failures.json` in parallel (`Promise.all`)
- Renders each category as a collapsible terminal section:
  ```
  > ls lab/experiments/
  [entry list]
  > cat lab/experiments/[slug]
  Title: ...
  Status: ...
  Stack: ...
  Lesson: ...
  ```
- Each entry expandable (click to reveal full description)
- `assets/js/lab.js` — page-specific JS module
- Error state if any fetch fails

**Done when:** All four categories render from JSON, expand/collapse works, page is readable on mobile.

---

### T-014 — Add syntax highlighting to Lab page
**Description:** Integrate Prism.js into `lab.html` for code blocks in lab entry descriptions.

**Deliverables:**
- Prism.js core loaded (CDN or local — local preferred for performance budget)
- Language plugins loaded: JavaScript, Python, HTML, CSS, SQL
- Prism Tomorrow Night theme applied
- Code blocks in lab entry `description` field render with highlighting
- Total Prism.js payload ≤15kb

**Done when:** A lab entry with a JavaScript code block renders with syntax highlighting, total JS payload verified in DevTools Network tab.

---

### T-015 — Wire homepage Lab + Now previews to live data
**Description:** Replace the static placeholders in T-010 with dynamic data fetched from the same JSON files.

**Deliverables:**
- Homepage **Now snapshot** fetches `data/now.json` and renders 2-3 fields
- Homepage **Lab preview** fetches lab JSON and renders 2 most recent entries
- Both gracefully degrade to static text on fetch failure
- No new JS files — logic added to `assets/js/index.js`

**Done when:** Homepage previews update automatically when JSON files are updated.

---

### T-016 — Build Notes page (list view)
**Description:** Build the notes index view in `notes.html` — fetches and lists all notes with title, excerpt, and date (PRD §3.3).

**Deliverables:**
- `data/notes-index.json` — a manifest file listing all notes (slug, title, date, excerpt). This avoids fetching every Markdown file just to show the list.
- Notes index rendered as a terminal-style list:
  ```
  > ls notes/
  2026-02-17  payment-rails-lagos
  2026-02-10  building-in-constraints
  ```
- Clicking a note title loads the full note view (T-017)
- `assets/js/notes.js` — page-specific JS module

**Done when:** All sample notes appear in the list, click navigation works, date sorting is correct (newest first).

---

### T-017 — Build Notes page (full note view + Markdown render)
**Description:** Build the full note reading view — fetches the Markdown file, parses it with Marked.js, and renders it inline (PRD §3.3).

**Deliverables:**
- Clicking a note in the list fetches the corresponding `.md` file
- YAML frontmatter stripped before parsing
- Marked.js renders body Markdown to HTML
- Prism.js syntax highlighting applied to code blocks after render
- Images: lazy-loaded, max 1200px, correct alt text from Markdown
- Back link returns to note list without full page reload
- URL hash updated on note open (e.g., `notes.html#payment-rails-lagos`) for shareability

**Done when:** Sample note renders correctly with all Markdown elements (headings, code, images, links), syntax highlighting works, browser back button returns to list.

---

### T-018 — Add newsletter signup form to Notes
**Description:** Inject the newsletter signup form at the bottom of every note rendered with `send: true` in frontmatter (PRD §3.7).

**Deliverables:**
- Frontmatter parser reads `send` field
- If `send: true`, newsletter form HTML is injected after note content:
  ```
  > want more?
  I send long-form reflections when they're worth reading.
  enter_email: _______
  [subscribe]
  ```
- Form: Netlify Forms with `note_slug` hidden field populated from frontmatter
- Cursor blink animation on placeholder (uses `terminal.js`)
- Vanilla JS success handler replaces form with:
  ```
  > subscribed
  you're in. I'll write when it's worth it.
  ```
- Form does NOT appear on notes with `send: false` or no `send` field
- Accessible: `<label>` for email input, error state if invalid email

**Done when:** Form appears on sample note with `send: true`, submission appears in Netlify Forms dashboard with correct `note_slug`, success state renders correctly.

---

### T-019 — Add syntax highlighting to Notes
**Description:** Confirm Prism.js syntax highlighting works in rendered Markdown notes (same Prism instance as Lab page).

**Deliverables:**
- Prism.js `highlightAll()` called after Marked.js renders Markdown
- Language auto-detection from fenced code blocks works
- No duplicate Prism.js loading (one instance shared)

**Done when:** Code block in sample note renders with highlighting after Markdown parse.

---

## Phase 4 — Newsletter Broadcast Script
*Frontend-independent. Can be written any time after T-011.*

---

### T-020 — Build `scripts/broadcast.js`
**Description:** Write the local Node.js script that reads notes, finds broadcast-ready entries, and sends via ConvertKit API (PRD §13).

**Deliverables:**
- Reads all `.md` files in `notes/`
- Parses frontmatter using a lightweight YAML parser (e.g., `gray-matter`)
- Finds notes with `broadcast: true` AND `sent: false`
- For each match: calls ConvertKit API to create and send a broadcast
- Broadcast content: note title as subject, excerpt as body, link to live note
- Logs: `[sent] note-title` or `[skipped] note-title (already sent)` to console
- Does NOT write `sent: true` back to file (manual step, by design)
- Requires `CONVERTKIT_API_KEY` env variable (read from `.env`, never committed)
- `.env` added to `.gitignore`

**Done when:** Script runs with `node scripts/broadcast.js`, correctly identifies the sample note (with `broadcast: true, sent: false`), and either sends a test broadcast to ConvertKit or logs a dry-run output. ConvertKit API key must be set.

---

### T-021 — Document broadcast workflow in README
**Description:** Add a clear "How to publish a note and send a broadcast" section to README.md.

**Deliverables:**
```markdown
## Publishing a Note + Sending a Broadcast
1. Write note in `notes/YYYY-MM-DD-slug.md`
2. Set frontmatter:
   - `send: true` (shows signup form)
   - `broadcast: true` (marks for email)
   - `sent: false`
3. Add entry to `data/notes-index.json`
4. `git commit && git push` → Netlify deploys
5. Confirm note is live at [URL]
6. Run: `node scripts/broadcast.js`
7. Confirm broadcast sent in ConvertKit dashboard
8. Set `sent: true` in frontmatter → `git commit`
```

**Done when:** README section is accurate, another person could follow it without asking questions.

---

## Phase 5 — QA & Performance
*Don't skip this. Performance and accessibility are first-class requirements.*

---

### T-022 — Performance audit (all pages)
**Description:** Run Lighthouse on every page under 3G throttling and hit the targets in PRD §11.

**Checklist per page:**
- [ ] Lighthouse Performance Score >90
- [ ] FCP <1.5s
- [ ] LCP <2.5s
- [ ] TBT <300ms
- [ ] CLS <0.1
- [ ] TTI <3.5s
- [ ] Total page weight <200kb (verified in DevTools Network tab)

**Pages:** index, lab, notes (list), notes (full note), how-i-think, now, contact

**Done when:** All pages pass all targets. Document results in a `QA_RESULTS.md` file.

---

### T-023 — Accessibility audit (all pages)
**Description:** Run WAVE and Axe on every page and fix all errors.

**Checklist per page:**
- [ ] WAVE: 0 errors
- [ ] Axe DevTools: 0 critical issues
- [ ] Tab through all interactive elements — all reachable, focus visible
- [ ] Skip-to-main link works
- [ ] All form inputs have `<label>` elements
- [ ] All images have meaningful `alt` text
- [ ] Terminal prompt spans have `aria-hidden="true"`
- [ ] VoiceOver (macOS) can read all page content meaningfully

**Done when:** All pages pass all checks. Issues logged and fixed before marking done.

---

### T-024 — Cross-browser and mobile testing
**Description:** Verify the site works correctly across target environments.

**Checklist:**
- [ ] Chrome (latest) — desktop
- [ ] Firefox (latest) — desktop
- [ ] Safari (latest) — desktop
- [ ] Chrome on Android (mid-range device or DevTools emulation)
- [ ] Safari on iOS
- [ ] Chrome DevTools 3G throttling — all pages load within targets
- [ ] Fonts render correctly on all platforms
- [ ] Animations work or degrade gracefully

**Done when:** No visual regressions or broken functionality on any target.

---

### T-025 — Form testing (contact + newsletter)
**Description:** End-to-end test of both Netlify forms in the production Netlify environment (not local).

**Checklist:**
- [ ] Contact form submission appears in Netlify Forms dashboard with correct fields
- [ ] Newsletter signup appears in Netlify Forms dashboard with correct `note_slug`
- [ ] JS success states fire correctly for both forms
- [ ] Form validation works (required fields, email format)
- [ ] Error states render correctly (network failure, invalid input)

**Done when:** Both forms have been submitted from the live URL and appear correctly in Netlify.

---

### T-026 — Final content pass
**Description:** Replace all placeholder content with real content before launch.

**Checklist:**
- [ ] Homepage hero text is final
- [ ] "What I Build For" section has real content
- [ ] "Current Systems" section has real content
- [ ] "How I Think" principles are final
- [ ] `data/now.json` is current and accurate
- [ ] At least 2 real lab entries exist in each category
- [ ] At least 1 real published note exists
- [ ] `data/notes-index.json` matches actual notes in `notes/`
- [ ] Contact page has correct email/social links (if any)
- [ ] All meta tags set: `<title>`, `<meta name="description">`, `og:*`

**Done when:** No lorem ipsum, no placeholder text, no empty sections anywhere on the live site.

---

## Phase 6 — Launch

---

### T-027 — Custom domain and HTTPS
**Description:** Point the custom domain to Netlify and verify HTTPS.

**Deliverables:**
- DNS records updated to point to Netlify
- HTTPS certificate provisioned (Netlify handles this automatically)
- `www` redirect configured in `_redirects` or Netlify settings
- Site accessible at `umarubiango.com`

**Done when:** Site loads at custom domain over HTTPS, no mixed content warnings.

---

### T-028 — Set up ConvertKit account and list
**Description:** Configure ConvertKit before the first broadcast. Also decide and implement the Netlify → ConvertKit subscriber sync method (see PRD §12).

**Deliverables:**
- ConvertKit account created
- Subscriber list created
- API key generated and saved to local `.env` (never committed)
- Broadcast template configured (plain text, per PRD §12)
- Test broadcast sent to personal email to confirm formatting
- Unsubscribe link verified working
- **Decide and implement Netlify → ConvertKit subscriber sync method** (choose one):
  - Option A: Manual — CSV export from Netlify Forms dashboard → import to ConvertKit
  - Option B: Automated — Netlify webhook → Netlify Function (~10 lines) → ConvertKit API adds subscriber
  - Document chosen method in README under "Subscriber Sync"

**Done when:** Test broadcast received in inbox, unsubscribe works, API key confirmed working with `broadcast.js`, subscriber sync method is implemented and tested end-to-end.

---

### T-029 — Launch checklist sign-off

**Final checks before announcing:**
- [ ] All T-022 performance targets met on production URL
- [ ] All T-023 accessibility checks passed on production URL
- [ ] Both forms tested on production URL (T-025)
- [ ] Custom domain live with HTTPS (T-027)
- [ ] ConvertKit configured (T-028)
- [ ] README is accurate and complete
- [ ] `.env` is in `.gitignore` and not committed
- [ ] No console errors on any page
- [ ] No broken links (check with a link checker tool)
- [ ] `netlify.toml` cache headers confirmed

**Done when:** Every checkbox is ticked. Ship it.

---

## Summary

| Phase | Tasks | Focus |
|-------|-------|-------|
| 0 — Foundation | T-001 → T-006 | Repo, Netlify, CSS, fonts, nav, shared JS |
| 1 — Simple Pages | T-007 → T-008 | How I Think, Contact |
| 2 — Homepage | T-009 → T-010 | Hero animation, sections |
| 3 — Dynamic Pages | T-011 → T-019 | Now, Lab, Notes, newsletter form |
| 4 — Broadcast Script | T-020 → T-021 | `broadcast.js`, README |
| 5 — QA | T-022 → T-026 | Performance, accessibility, content |
| 6 — Launch | T-027 → T-029 | Domain, ConvertKit, sign-off |

**Total tasks: 29**
