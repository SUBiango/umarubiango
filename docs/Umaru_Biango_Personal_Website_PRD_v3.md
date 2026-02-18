
# Umaru Biango Personal Website — Project Requirements Document (PRD)

**Version:** 3.0  
**Date:** 2026-02-17  
**Owner:** Umaru Biango  

---

## 1. Purpose

Create a **personal, static website** that is a **hybrid hacker-lab + clean portfolio**, showcasing:

- Identity, philosophy, and work in emerging markets product building
- A playground for experiments, notes, and journal entries
- A sharp, opinionated voice
- Fast, lightweight, and 3G-ready performance

---

## 2. Scope

### In Scope

- Homepage with terminal-style hero + key sections
- Lab page (experiments, architecture notes, market insights, failures)
- Notes/Journal page (Markdown content)
- How I Think page (philosophy and principles)
- Now page (current logs of projects)
- Contact page (Netlify static form)
- Newsletter signup embedded at the bottom of long-form notes
- Automated email broadcast via ConvertKit when a note is marked `broadcast: true`
- Vanilla HTML, CSS, JS only
- JSON and Markdown-based dynamic content rendering

### Out of Scope

- Backend server or database
- Frameworks or libraries
- User accounts/authentication

---

## 3. Functional Requirements

### 3.1 Homepage (`index.html`)

Terminal-style hero:

```
> whoami
Umaru Biango

> role
Emerging markets product builder

> thesis
I design systems where constraints are real.
```

Sections:

- What I Build For
- Current Systems
- Lab preview
- Now snapshot
- How I Think preview

Interactivity:

- Terminal cursor animation
- Optional typewriter effect

---

### 3.2 Lab Page (`lab.html`)

- Fetch JSON from `data/lab/*.json`
- Display folder-style terminal view for:
  - Experiments
  - Architecture notes
  - Market insights
  - Failures
- Each entry includes: title, status, stack, lesson
- Code snippets with syntax highlighting (Prism.js)
- Optional search/filter

---

### 3.3 Notes Page (`notes.html`)

- Render Markdown from `notes/` folder
- Vanilla JS fetch + Marked.js parser
- List notes with title, excerpt, date
- Click to view full note
- Code snippets with syntax highlighting
- Newsletter signup form injected at the bottom of every long-form note (see §3.7)

---

### 3.7 Newsletter Signup (embedded in Notes)

**Placement:** Bottom of every long-form note. Not on the homepage, Lab, or any other page.

**Visual / UX — terminal-style prompt:**
```
> want more?
I send long-form reflections when they're worth reading.

enter_email: _______
[subscribe]
```

- Email input only — no name, no other fields
- Hidden field `note_slug` captures which note drove the signup
- Monospace font, terminal aesthetic, inline with note content
- Not a modal, not a banner — part of the page flow
- Optional: subtle cursor blink animation on `_______` placeholder

**Form Implementation (Netlify Forms):**
```html
<form name="newsletter" method="POST" data-netlify="true">
  <input type="hidden" name="form-type" value="newsletter">
  <input type="hidden" name="note_slug" value="{{slug}}">
  <input type="email" name="email" placeholder="enter_email" required />
  <button type="submit">subscribe</button>
</form>
```

> **Note on Netlify vs ConvertKit:** Netlify Forms collects signups and stores them in the Netlify dashboard. ConvertKit manages the subscriber list and handles broadcasts. These are two separate responsibilities. The integration flow is: Netlify form submission → Netlify webhook → ConvertKit API (adds subscriber to list). This can be handled by a Netlify Function (~10 lines) or manually exported and imported into ConvertKit. Decide before launch which approach to use.

**Success State:** Vanilla JS replaces form with terminal-style confirmation:
```
> subscribed
you're in. I'll write when it's worth it.
```

---

### 3.4 How I Think Page (`how-i-think.html`)

Terminal-style philosophy display:

```
> principles
Optimize for constraints
Performance over trend
Clarity over cleverness
Systems over features
Fun is optional. Impact is not
```

---

### 3.5 Now Page (`now.html`)

- Fetch `data/now.json`
- Terminal-style log output:

```
> currently
building: Korporty
learning: payment compliance structures
optimizing: backend modularity
ignoring: unnecessary complexity

> last_updated
2026-02-16
```

---

### 3.6 Contact Page (`contact.html`)

Netlify Forms:

```html
<form name="contact" method="POST" data-netlify="true">
  <input type="text" name="name" placeholder="Name" required />
  <input type="email" name="email" placeholder="Email" required />
  <textarea name="message" placeholder="Message"></textarea>
  <button type="submit">Send</button>
</form>
```

- Optional vanilla JS confirmation message

---

## 4. Non-Functional Requirements

- **Performance:** Target <200kb total page weight, optimized for 3G
- **Styling:** Dark hacker-lab theme with muted green / electric blue accents
- **Fonts:** JetBrains Mono (terminal headings), Inter (body)
- **Animations:** Minimal CSS + JS only
- **Hosting:** Static site on Netlify, CDN-backed, forms via `data-netlify`
- **Maintainability:** Modular JS per page, CSS variables for theming, JSON/Markdown for content

---

## 5. File / Folder Structure

```
umarubiango.dev/
│
├── index.html
├── lab.html
├── notes.html
├── how-i-think.html
├── now.html
├── contact.html
├── assets/
│   ├── css/
│   ├── js/
│   ├── fonts/
│   └── images/
├── data/
│   ├── lab/
│   ├── now.json
│   └── notes-index.json
├── notes/
├── scripts/
│   └── broadcast.js        ← local Node script; triggers ConvertKit broadcast
├── _redirects
├── netlify.toml
└── README.md
```

---

## 6. Success Metrics

- Pages fully functional on 3G / low-end devices
- Homepage hero loads in under 1 second
- Lab and Notes render correctly from JSON/Markdown
- Netlify contact form successfully receives submissions
- Consistent hacker-lab + clean hybrid aesthetic
- Total page weight remains under 200kb

---

## 7. Technical Dependencies

### Core Libraries
- **Markdown Parser:** Marked.js v11+ (~30kb minified)
- **Syntax Highlighting:** Prism.js Core + selective language plugins (~15kb total)
  - Languages: JavaScript, Python, HTML, CSS, SQL
  - Theme: Prism Tomorrow Night (matches dark terminal aesthetic)
- **Form Handling:** Netlify Forms (zero-bundle) — contact form + newsletter signup
- **Email Broadcast:** ConvertKit API — subscriber list management + broadcast sending
- **Fonts:** 
  - JetBrains Mono (Latin subset, woff2) - terminal headings (~25kb)
  - Inter (Latin subset, woff2, 400/600 weights) - body text (~35kb)

### Performance Budget Breakdown
- **HTML:** ~10kb per page
- **CSS:** ~30kb total (minified, single stylesheet)
- **JavaScript:** ~50kb total (Marked.js + Prism.js + custom scripts)
- **Fonts:** ~60kb total (both fonts, subsetted)
- **Images:** ~50kb average per page (WebP format, lazy loaded)
- **Total:** ~200kb per page load

### Hosting & Deployment
- **Platform:** Netlify
- **CDN:** Netlify Edge (global)
- **Cache Strategy:** 
  - Static assets: 1 year cache
  - HTML: 5 minutes cache
  - `now.json`: 1 hour cache (weekly updates)
- **Build:** None required (static files only)
- **Content Updates:** Git commit workflow

---

## 8. Content Guidelines

### Markdown Content (`notes/`)
- **Format:** GitHub Flavored Markdown (GFM)
- **Frontmatter:** YAML (title, date, excerpt, tags, broadcast flags)
- **Code Blocks:** Fenced with language identifiers (```javascript)
- **Images:** Max 10 per note, WebP format, max 1200px width
- **File Naming:** `YYYY-MM-DD-slug.md`

Example frontmatter:
```yaml
---
title: "Building Payment Rails for Lagos"
date: 2026-02-15
excerpt: "Lessons from 6 months of fintech compliance"
tags: [payments, emerging-markets, compliance]
slug: "payment-rails-lagos"
send: true           # include newsletter signup form at bottom of this note
broadcast: true      # trigger ConvertKit email broadcast on next deploy
sent: false          # set to true manually after broadcast fires; prevents re-sends
---
```

**Broadcast Flag Rules:**
- `send: true` — renders the newsletter signup form at the bottom of the note
- `broadcast: true` — marks this note as ready to trigger an email to subscribers
- `sent: true` — set manually after `broadcast.js` runs; prevents duplicate sends
- Notes with `broadcast: false` or no broadcast field are never emailed, even if `send: true`

### Lab Entries (`data/lab/*.json`)
**Schema:**
```json
{
  "id": "unique-slug",
  "title": "Entry Title",
  "category": "experiments|architecture|insights|failures",
  "status": "active|archived|failed",
  "date": "2026-02-15",
  "stack": ["Node.js", "PostgreSQL"],
  "lesson": "Key takeaway in one sentence",
  "description": "Full markdown content with code snippets",
  "links": [{"label": "GitHub", "url": "https://..."}]
}
```

### Now Page (`data/now.json`)
**Update Frequency:** Weekly (every Monday)  
**Schema:**
```json
{
  "updated": "2026-02-16",
  "building": "Korporty - B2B payments platform",
  "learning": "Payment compliance structures in West Africa",
  "optimizing": "Backend modularity and API design",
  "ignoring": "Unnecessary complexity and trend-chasing"
}
```

### Images
- **Format:** WebP (fallback to PNG for older browsers)
- **Compression:** 80% quality
- **Max Dimensions:** 1200px width, auto height
- **Lazy Loading:** Native `loading="lazy"` attribute
- **Max Per Page:** 10 images
- **Naming:** Descriptive kebab-case (e.g., `lagos-traffic-optimization.webp`)

---

## 9. Accessibility Requirements

### Semantic HTML
- Use proper heading hierarchy (h1 → h2 → h3)
- `<main>`, `<nav>`, `<article>`, `<section>` landmarks
- List markup for navigation and content groups

### Terminal UI Accessibility
- ARIA labels for decorative elements:
  - `<span aria-hidden="true">></span>` for terminal prompts
  - `role="region"` and `aria-label` for terminal sections
- Ensure terminal content is readable by screen readers
- Skip link to main content: `<a href="#main" class="skip-link">Skip to content</a>`

### Keyboard Navigation
- All interactive elements accessible via Tab
- Focus indicators visible (custom outline styling)
- No keyboard traps

### Color & Contrast
- WCAG AA compliance (4.5:1 contrast ratio minimum)
- Terminal green: `#00ff41` on `#0a0e14` background
- Electric blue links: `#00d9ff` on `#0a0e14` background
- Test with browser DevTools contrast checker

### Forms
- Proper `<label>` elements (no placeholder-only)
- Error messages announced to screen readers
- Required field indicators

### Motion & Animation
- Respect `prefers-reduced-motion` media query on all animations
- When reduced motion is preferred: skip typewriter effect, show terminal text immediately, disable cursor blink
- No animation should be required to read or interact with content

---

## 10. Terminal Output Formatting

### Consistent Prompt Style
All terminal outputs follow this format:

```
> command
Output text (no prefix, left-aligned)
```

**Examples:**

Homepage:
```
> whoami
Umaru Biango

> role
Emerging markets product builder

> thesis
I design systems where constraints are real.
```

How I Think page:
```
> principles
Optimize for constraints
Performance over trend
Clarity over cleverness
Systems over features
Fun is optional. Impact is not

> philosophy
Build for the 99%, not the 1%
```

Now page:
```
> currently
building: Korporty
learning: payment compliance structures
optimizing: backend modularity
ignoring: unnecessary complexity

> last_updated
2026-02-16
```

Lab entries:
```
> cat experiments/payment-webhook-retry.json
Title: Exponential Backoff for Payment Webhooks
Status: active
Stack: Node.js, Redis, Bull Queue
Lesson: Retry logic is not optional in emerging markets
```

**Styling Rules:**
- Prompt (`>`) in muted green (`#00ff41` at 70% opacity)
- Commands in white (`#ffffff`)
- Output in light gray (`#c5c8c6`)
- No indentation or prefixes on output lines
- Single blank line between command/output blocks

---

## 11. Success Metrics (Updated)

### Performance Targets
- **Lighthouse Performance Score:** >90
- **First Contentful Paint (FCP):** <1.5s on 3G
- **Largest Contentful Paint (LCP):** <2.5s on 3G
- **Total Blocking Time (TBT):** <300ms
- **Cumulative Layout Shift (CLS):** <0.1
- **Time to Interactive (TTI):** <3.5s on 3G

### Functional Validation
- All pages render correctly on 3G / low-end devices (tested via Chrome DevTools throttling)
- Lab and Notes load and parse JSON/Markdown without errors
- Syntax highlighting displays correctly for all specified languages
- Netlify contact form successfully receives and logs submissions
- Images lazy-load and don't trigger layout shifts
- Terminal animations run at 60fps on mid-range devices

### Accessibility Validation
- WAVE accessibility checker: 0 errors
- Axe DevTools: 0 critical issues
- Keyboard navigation: all interactive elements reachable
- Screen reader testing: VoiceOver (macOS) and NVDA (Windows) compatible

### Aesthetic Consistency
- Terminal green (`#00ff41`) and electric blue (`#00d9ff`) used consistently
- JetBrains Mono for terminal headings, Inter for body text
- Dark hacker-lab theme maintained across all pages
- Animations subtle and performance-friendly (CSS transforms only)

### Content Management
- New lab entries added via JSON in <5 minutes
- New notes published via Markdown in <10 minutes
- Git commit workflow functional for all content types
- `now.json` updated weekly without deployment issues
- Newsletter signup form renders correctly at bottom of notes with `send: true`
- `broadcast.js` runs without errors and sends to ConvertKit correctly

---

## 12. Newsletter & Email Broadcast System

### Overview
A lightweight, no-backend system for collecting subscribers and sending reflections-style emails when a note is worthy. Built on Netlify Forms for collection and ConvertKit for delivery. No fixed schedule. No fluff.

### Subscriber Collection
- Form embedded at the bottom of every long-form note (see §3.7)
- Submissions captured by Netlify Forms
- `note_slug` hidden field tracks which note drove the signup
- Subscriber data synced to ConvertKit manually (CSV export/import) or via Netlify webhook → ConvertKit API

### Broadcast Automation Flow

```
1. Write note in Markdown
2. Set frontmatter: broadcast: true, sent: false
3. git commit + push → Netlify deploys
4. Run locally: node scripts/broadcast.js
5. Script reads notes/ folder, finds broadcast: true AND sent: false
6. Calls ConvertKit API to send broadcast with note title + link
7. Manually set sent: true in frontmatter → git commit
```

> **Why local script, not a Netlify Build Plugin?** Static sites can't write back to their own repo after deploy. A local script keeps it simple, auditable, and entirely under your control. Run it once after confirming the note is live.

### `scripts/broadcast.js` — Responsibilities
- Parse all `.md` files in `notes/`
- Find entries with `broadcast: true` AND `sent: false`
- Send ConvertKit broadcast via API (title, excerpt, link to note)
- Log success to console
- Does NOT auto-update `sent: true` — this is set manually to keep the commit intentional

### ConvertKit Broadcast Template
```
Subject: [note title]

---

[excerpt — 2-3 sentences, personal and direct]

Read it here → [note URL]

—
Umaru
```
- Plain text preferred over HTML
- No header image, no footer links except unsubscribe (handled by ConvertKit)
- Tone: personal, founder-journal, slightly sharp

### Email Philosophy
- **Voice:** Personal, reflective, field-journal style
- **Tone:** Honest, practical — write like you're emailing one serious person
- **Frequency:** Only when a note earns it. No calendar. No streak.
- **Goal:** Build a small, engaged audience of serious builders — not a numbers game
- **Subject lines:** Title of the note, no emoji, no clickbait

### Duplicate Send Protection
- Primary guard: `sent: true` frontmatter flag — checked by `broadcast.js` before every run
- Secondary guard: ConvertKit's own broadcast history (manual check before sending)
- There is no automated rollback — review before running the script

### Success Metrics (Newsletter)
- Netlify Forms captures signups with correct `note_slug` attribution
- ConvertKit receives subscriber data without errors
- `broadcast.js` correctly skips notes with `sent: true`
- Broadcast email delivers within 10 minutes of script run
- Open rate target: >40% (quality audience baseline)
- Unsubscribe rate: <2% per broadcast

---

## 14. Future Enhancements

### Phase 2 (Post-Launch)
- SPA-style hash routing for single-page navigation
- Search/filter across Notes and Lab content (Fuse.js ~10kb)
- Optional "3G mode" toggle (strips images, reduces animations)
- RSS feed for Notes page
- Dark/Light theme toggle (currently dark-only)

### Phase 3 (Long-term)
- Analytics integration (Plausible or Netlify Analytics)
- JSON-LD structured data for SEO
- Service worker for offline reading of Notes
- Command palette (Cmd+K) for quick navigation
- WebMention support for blog interactions
