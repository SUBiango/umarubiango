# umarubiango.com: Design & Dev Guide

**Direction:** Field Notebook
**Status:** Approved design, ready to build
**Prototypes:** Homepage (desktop), Homepage (mobile, 390px), Field note page (desktop)

This is the source of truth for rebuilding umarubiango.com. When the prototypes and this guide disagree, this guide wins. Values here are exact; the prototypes are a visual reference.

---

## 1. Concept

> **Systems designed where constraints are real.**
> Field notes from building in West Africa.

The site is a builder's field notebook: aged paper, taped index cards, stamps, ballpoint margin notes. It should feel handmade and a little quirky, but **reading must always be clean**. The quirk lives in the frame; the words sit on calm, solid surfaces.

Five rules behind every decision:

1. **Writing first.** The site exists to publish one field note a month. Everything else supports that.
2. **Quirky frame, clean reading.** Tilts, tape and handwriting decorate. Body text never sits on texture and never tilts in long-form reading.
3. **Muted and earthy.** Parchment, rust, faded ink. No bright or saturated color.
4. **Built light, for 3G.** Performance is part of the message, not an afterthought.
5. **Honest content.** Projects show their real status (including parked and scrapped). Placeholders are clearly placeholders.

---

## 2. Information architecture

### Homepage (top to bottom)

| # | Section | Anchor | Purpose |
|---|---------|--------|---------|
| 1 | Header: stamp logo + name, tab nav | `#top` | Identity + navigation |
| 2 | Thesis, subline, byline | — | Point of view in six words, plus who wrote it |
| 3 | Field notes | `#notes` | Featured latest note + earlier notes grid |
| 4 | Currently building (receipt) | `#building` | Projects and their honest status |
| 5 | Principles (poda-poda panel) | `#principles` | How I build, in three slogans |
| 6 | About (polaroid + bio card) | `#about` | Who's behind the notes |
| 7 | Subscribe slip | `#hello` | "Pass me a note?" |
| 8 | Footer | — | Contact, socials, © |

The about section sits **below** the work on purpose: the thesis promises field notes, so notes come immediately after it. A one-line byline under the thesis ("by Umaru Biango, product builder, Sierra Leone · more about me ↓") keeps first-time visitors oriented and links to `#about`.

### Field note page (top to bottom)

1. Header (same as homepage)
2. `← all field notes` back link
3. Meta row: stamp (`FIELD NOTE NO. 04`) + date · tag · read time
4. Title (h1) + one-line dek
5. **The sheet**: the full note on a solid, untilted, taped card
6. Below the sheet: "filed under" tags + share links
7. Subscribe slip ("liked this one? pass me a note.")
8. Previous / next note cards (next shows a placeholder until published)
9. Footer

### Navigation tabs

`field notes` · `building` · `now` · `say hi`

On the homepage, tabs link to in-page anchors. On note pages, `field notes` and `building` link to the homepage sections (`/#notes`, `/#building`). `now` goes to `/now`.

### URLs

Keep existing note URLs exactly: `/notes/<slug>/`. Do not break inbound links or search rankings.

---

## 3. Design tokens

```css
:root {
  /* Surfaces */
  --paper:        #E3D8C5; /* page background, under grain texture */
  --sheet:        #FBF7EF; /* reading surface: note sheet, bio card, receipt, slip */
  --manila:       #EFE4CC; /* featured note card, nav tab 1, callout card */
  --sage:         #E2E3DA; /* note card tint, nav tab 3 */
  --clay:         #EBDDD1; /* note card tint, nav tab 2 */
  --photo:        #CFC4B0; /* photo placeholder */
  --bubble:       #DCE3D3; /* chat bubble in notes */
  --dark:         #26211C; /* poda-poda panel, dark callout, code blocks */

  /* Ink */
  --ink:          #1F1A15; /* primary text */
  --ink-2:        #3B332B; /* secondary text on manila */
  --muted:        #554B40; /* metadata, deks, captions */
  --muted-2:      #4A4036; /* muted text on sage/clay cards */
  --line:         #2B241D; /* borders and hard shadows */
  --pen:          #2C3A5C; /* handwritten annotations (faded blue-black ink) */
  --rust:         #8A3B1E; /* stamps, active status, links, primary button */

  /* Accents on dark */
  --ochre:        #D8B66A;
  --clay-light:   #D39A7C;
  --dusty-blue:   #A7BFC3;

  /* Decorative */
  --tape:         rgba(214, 196, 158, 0.85);
  --highlighter:  rgba(184, 140, 62, 0.38);
  --dash:         #A8987E; /* receipt edges, dashed rules */
  --margin-line:  #D9A99A; /* red margin line on bio card */

  /* Shadows */
  --shadow-hard:    6px 6px 0 var(--line);
  --shadow-hard-lg: 8px 8px 0 var(--line);
  --shadow-hard-sm: 4px 4px 0 var(--line); /* buttons */
  --shadow-soft:    0 10px 24px rgba(43, 36, 29, 0.18); /* polaroid, receipt, slip */

  /* Radius */
  --radius-card: 4px;
  --radius-panel: 8px;
  --radius-tab: 8px 8px 2px 2px;

  /* Layout */
  --container: 1080px;
  --reading: 800px;     /* note page column (sheet incl. padding) */
  --gutter: 32px;       /* desktop side padding */
  --gutter-mobile: 22px;

  /* Type */
  --font-display: "Fraunces", Georgia, serif;
  --font-body:    "Literata", Georgia, serif;
  --font-hand:    "Caveat", cursive;
  --font-mono:    "Space Mono", ui-monospace, monospace;
}
```

### Verified contrast (WCAG 2.1)

All pairs below pass AA for normal text (4.5:1). Do not introduce new text/background pairs without checking.

| Text | Background | Ratio |
|------|-----------|-------|
| `--ink` | `--paper` | 12.2:1 |
| `--ink` | `--sheet` | 16.2:1 |
| `--muted` | `--paper` | 6.0:1 |
| `--muted` | `--sheet` | 8.0:1 |
| `--muted` | `--manila` | 6.7:1 |
| `--muted-2` | `--sage` | 7.8:1 |
| `--muted-2` | `--clay` | 7.6:1 |
| `--ink-2` | `--manila` | 9.8:1 |
| `--rust` | `--paper` | 5.5:1 |
| `--rust` | `--sheet` | 7.2:1 |
| `--pen` | `--paper` | 8.0:1 |
| `--pen` | `--sheet` | 10.5:1 |
| white | `--rust` (button) | 7.7:1 |
| `--ochre` | `--dark` | 8.2:1 |
| `--clay-light` | `--dark` | 6.6:1 |
| `--dusty-blue` | `--dark` | 8.3:1 |
| `--ink` | `--bubble` | 13.1:1 |

The burned-edge vignette (section 5) darkens the paper near the viewport edges. Keep text at least `--gutter-mobile` (22px) from the edge, and re-check muted text there if you strengthen the vignette.

---

## 4. Typography

Four families, each with one job:

| Family | Role | Weights / settings |
|--------|------|--------------------|
| **Fraunces** | Headlines, card titles, slogans, the name in the header | 600–800 (use 700). Axes: `"SOFT" 100, "WONK" 1`; optical size automatic |
| **Literata** | All reading text: note body, deks, bio, form copy | 400, 500, 700, italic 400 |
| **Caveat** | Handwritten annotations only | 500, 700 |
| **Space Mono** | Metadata, stamps, nav tabs, receipt, labels | 400, 700 |

**Why this pairing:** Fraunces is a soft, slightly wonky old-style serif. With its `SOFT` and `WONK` axes turned up, it looks hand-cut, like a rubber stamp or an old notebook label, which suits the paper and tape. Literata was designed for long-form reading on screens, so monthly notes stay comfortable at length. Bricolage Grotesque (used in the first prototypes) was dropped because it's already used heavily in other projects.

```css
h1, h2, h3, .display {
  font-family: var(--font-display);
  font-variation-settings: "SOFT" 100, "WONK" 1;
  font-weight: 700;
}
body { font-family: var(--font-body); }
.hand { font-family: var(--font-hand); }  /* e.g. the "hi, I'm Umaru." and "pass me a note?" headings */
.mono { font-family: var(--font-mono); }  /* e.g. the poda-poda panel label */
```

```html
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Fraunces:opsz,wght,SOFT,WONK@9..144,600..800,0..100,0..1&family=Literata:ital,opsz,wght@0,7..72,400;0,7..72,500;0,7..72,700;1,7..72,400&family=Space+Mono:wght@400;700&display=swap">
```

For production, prefer self-hosting Latin-subset `.woff2` files with `font-display: swap` (see section 10).

### Scale

| Element | Desktop | Mobile (390px) | Weight / line-height |
|---------|---------|----------------|----------------------|
| Thesis (h1, home) | `clamp(48px, 8.4vw, 108px)` | 48px | Fraunces 700 / 0.98, tracking −0.02em |
| Note title (h1) | `clamp(42px, 6.6vw, 80px)` | ~42px | Fraunces 700 / 1.0, tracking −0.02em |
| Section heading (h2) | `clamp(40px, 5vw, 56px)` | 40px | Fraunces 700 / 1.0, tracking −0.02em |
| Note subheading (h2 in sheet) | `clamp(28px, 3.4vw, 36px)` | 28px | Fraunces 700 / 1.1 |
| Featured card title | `clamp(30px, 4.4vw, 48px)` | 30px | Fraunces 700 / 1.05 |
| Card title | 26px | 23px | Fraunces 700 / 1.12 |
| Name in header | 23px | 21px | Fraunces 700 |
| Subline under thesis | `clamp(22px, 2.6vw, 30px)` | 21px | Literata 500 / 1.35 |
| **Note body** | **19px** | **18px** | **Literata 400 / 1.7** |
| Bio / card deks | 18–20px | 17–18px | Literata 400 / 1.55–1.65 |
| Metadata | 12–14px | 12–13px | Space Mono 400 or 700 |
| Annotations | 26–30px | 23–25px | Caveat 700 / 1.2 |
| Poda-poda slogans | `clamp(30px, 5.4vw, 64px)` | 31px | Fraunces 700 / 1.0, uppercase |

### Rules

- **Caveat is decoration, never content.** Use it only for margin notes, captions, the greeting, the signature and playful asides. Minimum 23px. Never for body text, links people need, or anything longer than two short lines.
- **Fraunces is for display only:** headings, card titles, slogans and the name. Never use it for paragraphs.
- Note body text is Literata 400 at 19px/1.7 on `--sheet`. Keep line length near 65–75 characters (the 800px sheet with its padding gets you there).
- Bold text and standalone emphasis lines inside a note ("No forms. No navigating menus. Just a conversation.") stay in **Literata 700**, not Fraunces, so they read as part of the text.
- Metadata is Space Mono, uppercase, often with `·` separators: `17 OCT 2026 · AI · 6 MIN READ`.

---

## 5. Texture & surfaces

### Paper grain

- **Asset:** `paper-grain.png`, a 256×256 tileable, 16-level transparent brown grain with soft mottling and sparse specks. **~20 KB.** Delivered alongside this guide.
- It's transparent, so it tints whatever background color sits under it.

```css
.paper {
  background-color: var(--paper);
  background-image: url("/assets/paper-grain.png");
  background-size: 256px 256px;
}
.paper-dark {
  background-color: var(--dark);
  background-image: url("/assets/paper-grain.png");
  background-size: 256px 256px;
}
```

### Burned edges

A double inset shadow on the page root gives the page aged, darkened edges:

```css
/* desktop */
body.paper { box-shadow: inset 0 0 140px 30px rgba(92, 52, 20, 0.30),
                         inset 0 0 24px 6px rgba(48, 26, 10, 0.45); }
/* ≤ 600px */
@media (max-width: 600px) {
  body.paper { box-shadow: inset 0 0 70px 14px rgba(92, 52, 20, 0.30),
                           inset 0 0 16px 4px rgba(48, 26, 10, 0.45); }
}
```

Apply this to a full-height wrapper (or `body` with `min-height: 100vh`) so the edges run the length of the page.

### Surface rule

**Reading text always sits on a solid surface** (`--sheet`, `--manila`, `--sage`, `--clay`, `--bubble`, `--dark`). Only short, large text sits directly on the textured paper: the thesis, section headings, metadata lines and annotations.

---

## 6. Tilt, hover & press

Tilts make the page feel handmade. They are subtle, fixed per element, and never applied to long-form reading.

### Angles (degrees, at messiness = 1)

| Element | Desktop | Mobile |
|---------|---------|--------|
| UB stamp logo / NO. stamps | −8 | −8 |
| Nav tabs 1–4 | −2, 1.5, −1, 2 | same |
| Annotation under thesis | −3 | −2.5 |
| Polaroid | −4 | −4 |
| Bio card | 0.8 | 0.6 |
| Tape strips | 3 / −4 (alternate) | same |
| Featured note card | −0.6 | −0.8 |
| Note cards (03, 02, 01) | −1.5, 1.2, −0.8 | −1.2, 1, −0.8 |
| Receipt | 1.5 | 1.2 |
| Poda-poda panel | −0.6 | −0.8 |
| Slogans 1–3 | −1.5, 1, −0.5 | same |
| Subscribe slip | −1 | −0.8 |
| Note page: stamp | −3 | −3 |
| Note page: index-card callout | −0.8 | −0.8 |
| Note page: dark callout | 0.6 | 0.6 |

The prototypes expose a **messiness** multiplier (0–2) that scales every angle. Ship at **1**. If you want a toggle, implement it as a single CSS variable:

```css
:root { --mess: 1; }
.tilt { transform: rotate(calc(var(--angle) * var(--mess) * 1deg)); }
/* <div class="tilt" style="--angle:-1.5"> */
```

### Rules

- **Never tilt:** the note sheet, note body paragraphs, headings inside the sheet, inputs on their own, or anything with more than ~3 lines of reading text, except cards whose angle is ≤ 1.5°.
- Use `transform` only, so tilts never affect layout. Set `overflow-x: hidden` on the page wrapper so rotated corners can't cause horizontal scroll.
- Tilted elements keep hard offset shadows; the shadow rotates with the element, which is intended.
- Tilt angles are fixed, not random per page load. Randomness makes the page feel unstable and breaks visual regression tests.

### Hover & press states

Everything clickable behaves like paper on a desk: it lifts when you hover and presses flat when you click. Keyboard users get the same lift on `:focus-visible`, and the focus outline stays on as well.

| Element | Hover / focus | Press (`:active`) | Timing |
|---------|---------------|-------------------|--------|
| Button (`.btn`) | moves up-left 2px, shadow grows 4px → 6px | moves down-right 4px, shadow → 0 (pressed flat) | 120ms ease-out |
| Note card (`.card`) | straightens to 0°, moves up-left 3px, shadow grows 6px → 10px (featured: 8px → 12px) | — | 180ms ease-out |
| Nav tab (`.tab`) | straightens to 0° and rises 4px, like pulling out a notebook divider | — | 150ms ease-out |
| Text link (`.link`) | highlighter sweeps in left to right under the text; the rust underline fades out | — | 220ms ease-out |

```css
.btn  { transition: transform .12s ease-out, box-shadow .12s ease-out; }
.card { transition: transform .18s ease-out, box-shadow .18s ease-out; }
.tab  { transition: transform .15s ease-out; }

.btn:active { transform: translate(4px, 4px); box-shadow: 0 0 0 var(--line); }

@media (hover: hover) {
  .btn:hover  { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--line); }
  .card:hover { transform: translate(-3px, -3px); box-shadow: 10px 10px 0 var(--line); }
  .card--featured:hover { box-shadow: 12px 12px 0 var(--line); }
  .tab:hover  { transform: translateY(-4px); }
}
.btn:focus-visible  { transform: translate(-2px, -2px); box-shadow: 6px 6px 0 var(--line); }
.card:focus-visible { transform: translate(-3px, -3px); box-shadow: 10px 10px 0 var(--line); }
.tab:focus-visible  { transform: translateY(-4px); }

.link {
  text-decoration: underline 2px var(--rust);
  text-underline-offset: 4px;
  background: linear-gradient(var(--highlighter), var(--highlighter)) no-repeat 0 88% / 0% 45%;
  transition: background-size .22s ease-out, text-decoration-color .22s ease-out;
}
.link:focus-visible { background-size: 100% 45%; text-decoration-color: transparent; }
@media (hover: hover) {
  .link:hover { background-size: 100% 45%; text-decoration-color: transparent; }
}

@media (prefers-reduced-motion: reduce) {
  .btn, .card, .tab, .link { transition: none; }
}
```

How it fits with the tilt system:

- Hover rules **replace** the resting `rotate()`, which is what makes cards and tabs straighten. Keep the hover selectors more specific than `.tilt` (`.card:hover` beats `.tilt`), and never use `!important` in production. The prototypes only use it to override their inline styles.
- Hover rules sit inside `@media (hover: hover)` so phones don't get "stuck" hover states after a tap. `:active` and `:focus-visible` stay outside it.
- Hover never reveals information, changes text color, or scales elements. It only lifts, straightens and presses.

---

## 7. Components

Each component lists its key specs. Spacing values are desktop; mobile reduces padding by roughly 25–30% (see the mobile prototype).

### 7.1 Header

- **Stamp logo:** 60×60 circle (48 on mobile), 3px `--rust` border, "UB" in Space Mono 700 18px `--rust`, rotated −8°. Next to it, "Umaru Biango" in Fraunces 700 23px.
- **Nav tabs:** Space Mono 700 14px, padding `12px 16px` (min 44px tall), 2px `--line` border, `--radius-tab`, each a different tint (`--manila`, `--clay`, `--sage`, `--sheet`), each slightly rotated. They wrap on small screens.

### 7.2 Thesis block

- Kicker: `FIELD NOTEBOOK · VOL. 1 · 2026`, Space Mono 14px `--muted`, tracking 0.06em.
- h1 thesis with a **highlighter** behind "constraints are real.":
  ```css
  .highlight {
    background: linear-gradient(transparent 54%, var(--highlighter) 54%,
                var(--highlighter) 92%, transparent 92%);
    padding: 0 6px; margin: 0 -6px;
  }
  ```
- Annotation directly under it: "↑ the whole idea, in six words" (Caveat 700 30px `--pen`, −3°, `transform-origin: left center`).
- Subline: "Field notes from building in West Africa." with a wavy rust underline on "West Africa":
  `text-decoration: underline wavy var(--rust); text-decoration-thickness: 2px; text-underline-offset: 8px;`
- Byline: Space Mono 14px `--muted` + rust link "more about me ↓" to `#about`.

### 7.3 Annotation (margin note)

A reusable handwritten aside. Caveat 700, `--pen`, 23–30px, slight rotation, `transform-origin: left center`. Usually starts with an arrow (`↑`, `←`, `→`, `↓`) pointing at what it describes.

Voice: lowercase, short, dry, first person. Examples in use: "↑ the whole idea, in six words", "one a month, promise →", "← newest", "every project costs something. here's the receipt.", "thanks for scrolling all the way down."

Use them sparingly: **maximum one per section, and at most one inside a note.**

### 7.4 Note card

Two variants share one structure: stamp + meta row, title, dek.

| | Featured (latest) | Standard |
|---|---|---|
| Background | `--manila` | cycles `--sheet` → `--sage` → `--clay` |
| Padding | 40px | 30px |
| Shadow | `--shadow-hard-lg` | `--shadow-hard` |
| Grid | spans full width | `repeat(auto-fit, minmax(290px, 1fr))`, gap `48px 32px` |
| Extra | Caveat "← newest" next to meta; "read it →" in Caveat `--rust` | — |

- Border: 2px `--line`, radius `--radius-card`.
- **Tape strip:** absolutely positioned on the top edge, 80–110 × 24–28px, `--tape` background, rotated ±3–4°, `aria-hidden="true"`. Vary its position between cards (left, centre, right).
- **Number stamp:** `NO. 04`, Space Mono 700 12–13px, 2px `--rust` border, `--rust` text, padding `3px 8px`.
- Meta: `JUN 2026 · IDENTITY` in Space Mono 12px. Use `--muted` on sheet/manila and `--muted-2` on sage/clay.
- The whole card is one `<a>`.

### 7.5 Receipt ("Currently building")

A thermal-paper receipt listing projects. It's monospace throughout and reads like a real till slip.

- Container: `--sheet`, padding `32px 28px`, 3px dashed `--dash` top and bottom edges, `--shadow-soft`, rotated 1.5°, max width ~420px. Space Mono 14px / 1.5.
- Header: `UB WORKSHOP` (700, tracking 0.08em, centred), then `SIERRA LEONE · ORDER #2026` in `--muted`.
- Dashed rule: `border-top: 2px dashed var(--line)`.
- Line item: name left (700), status right, one-line description below (13px `--muted`). Each line links to the project or to its field note.
- Totals: `ITEMS  4`, `PAID IN  LATE NIGHTS`.
- Footer: `** THANK YOU, COME AGAIN **`, then the status key in 12px `--muted`.
- Aside next to it (Caveat): "every project costs something. here's the receipt."

**Status vocabulary (fixed, use only these):**

| Status | Meaning | Color |
|--------|---------|-------|
| `ON THE BENCH` | Actively being built | `--rust` |
| `SHIPPED` | Done and live | `--ink` |
| `PARKED` | Paused, may return | `--muted` |
| `SCRAPPED` | Abandoned | `--muted`, consider strikethrough on the name |

**Ordering:** On the bench first, then shipped, then parked, then scrapped. **Keep 4–5 lines max.** When something new goes on the bench, the oldest shipped or scrapped item drops off.

Current data:

```yaml
# data/workshop.yml
- name: Sierrafy
  status: on-the-bench
  description: identity verification SDK
  url: https://sierrafy.dev
- name: Doli
  status: on-the-bench
  description: whatsapp assistant
  note: the-ai-assistant-i-want-to-build
- name: Witap
  status: parked
  description: b2b payment gateway
  url: https://getwitap.netlify.app
- name: Kontriticket
  status: parked
  description: registration + ticketing
  url: https://kontriticket.com
```

`ITEMS` is computed from the list length.

### 7.6 Principles panel (poda-poda)

Inspired by the slogans hand-painted on the back of poda-podas.

- `.paper-dark` surface, padding `52px 40px`, radius `--radius-panel`, shadow `8px 8px 0 rgba(43,36,29,0.35)`, rotated −0.6°.
- Label: `IF MY CODE WERE A PODA-PODA, THE BACK WOULD SAY:` in Space Mono 700 13px `--ochre`.
- Three slogans, Fraunces 700 uppercase, each in its own color (`--ochre`, `--clay-light`, `--dusty-blue`), each slightly rotated:
  1. Optimize for constraints
  2. Clarity over cleverness
  3. Systems over features

### 7.7 About (polaroid + bio card)

- **Polaroid:** 240px wide (210 on mobile), `--sheet` with padding `14px 14px 56px`, 1px `#CFC2AA` border, `--shadow-soft`, rotated −4°, tape on top. Photo area 240px tall. The caption sits in the bottom strip in Caveat 26px `--pen`.
- **Bio card:** `--sheet`, 2px `--line` border, `--shadow-hard`, rotated 0.8°, a red margin line (2px `--margin-line`) at 48px from the left, padding `36px 40px 36px 72px`, tape on the top-right.
  - Greeting h2: "hi, I'm Umaru." in Caveat 42px `--pen`.
  - Two paragraphs, Literata 20px/1.65: the first in `--ink`, the second in `--muted`.
- Layout: flex-wrap, gap `48px 56px`. On mobile the polaroid stacks above and is centred.

### 7.8 Subscribe slip

- `--sheet`, 2px **dashed** `--line` border, `--shadow-soft`, rotated −1°, max-width 640px, centred, padding 36px.
- h2 in Caveat 42px `--pen`: "pass me a note?" (on note pages: "liked this one? pass me a note.").
- Copy: "One field note a month, straight to your inbox. No growth hacks."
- Input: 48px tall, 2px `--line` border, white background, visible `<label>` ("your email").
- Button: "send it", 48px tall, `--rust` background, white Space Mono 700 14px, 2px `--line` border, `--shadow-hard-sm`.
- Mobile: input and button stack full-width.

### 7.9 Footer

- Centred Caveat line: "thanks for scrolling all the way down." (homepage only)
- 2px solid `--line` top rule, then Space Mono 13px: `© 2026 Umaru S. Biango · built light, for 3G` on the left; email, GitHub, Instagram and Facebook on the right.
- Links need at least 4px vertical padding on desktop and 10px on mobile for tap targets.

### 7.10 Field note page components

**The sheet**
- `--sheet`, 2px `--line` border, `--shadow-hard-lg`, **no rotation**, padding `clamp(28px, 6vw, 72px)`, max-width 800px (`--reading`), two tape strips on the top corners.
- Body: Literata 400 19px/1.7 `--ink`, paragraphs separated by a 24px gap.
- h2: Fraunces 700 `clamp(28px, 3.4vw, 36px)`, 32px space above.
- Bold: 700. Key sentences can use the highlighter (once per note at most).

**Emphasis line:** a standalone short sentence at 24–26px 700, for lines like "No forms. No navigating menus. Just a conversation."

**Numbered list:** no default markers. Each item gets a rust number stamp (`01`, `02` …, Space Mono 700 14px, 2px `--rust` border) in a flex row with the text.

**Chat bubble** (for messages to a product, e.g. Doli):
```html
<div class="chat">  <!-- flex column, align-items: flex-end, gap 6px -->
  <span class="chat-from">me → Doli</span>  <!-- Space Mono 12px --muted -->
  <p class="bubble">I need to call the university tomorrow.</p>
</div>
```
`.bubble`: `--bubble` background, 2px `--line` border, radius `18px 18px 4px 18px`, padding `12px 18px`, 19px/1.5, max-width 85%.

**Index-card callout:** for definitions or key frameworks. `--manila`, 2px `--line` border, `--shadow-hard`, rotated −0.8°, tape centred on top, text 22px 700 with line breaks between clauses.

**Dark callout:** for the note's central thesis, at most once per note. `.paper-dark`, padding `36px 32px`, rotated 0.6°, clauses stacked in `--ochre` / `--clay-light` / `--dusty-blue`, Fraunces 700 `clamp(24px, 3vw, 32px)`.

**Margin note:** at most one per note, placed under the line it points to: "↑ the whole point".

**Signature:** "— Umaru" in Caveat 38px `--pen`, slightly rotated, after the last paragraph.

**Code blocks** (not shown in the prototypes; specified for notes that need them): `--dark` background, `#EFE4CC` text, Space Mono 15px/1.6, padding 20px, radius 4px, horizontal scroll inside the block. Untilted. Map your syntax highlighter's tokens to `--ochre`, `--clay-light`, `--dusty-blue` and `#9C9284` for comments, and check contrast.

**Below the sheet:** a 2px dashed `--dash` rule, then Space Mono 13px: `filed under: development · ai` on the left, and `share: X · LinkedIn · Facebook` in `--rust` on the right.

**Previous / next:** two cards in an `auto-fit, minmax(280px, 1fr)` grid. Previous is a standard note card (`← PREVIOUS · NO. 03` + title). When there's no next note yet, show a dashed `#8A7C66` card with `NEXT · NO. 05 →` and the Caveat line "still being written. see you next month."

---

## 8. Responsive behavior

The design is fluid, with one main breakpoint. The mobile prototype shows the 390px result.

| | ≥ 601px | ≤ 600px |
|---|---|---|
| Side padding | 32px | 22px |
| Header | logo left, tabs right (wrap as needed) | logo on top, tabs below |
| Note grid | auto-fit, min 290px | single column, gap 36px |
| Building | aside + receipt side by side | stacked, receipt full width |
| About | polaroid + card side by side | polaroid centred above card |
| Subscribe | input + button inline | stacked, full width |
| Footer | two columns | stacked, links first |
| Burned edge | 140px / 24px | 70px / 16px |
| Tilt angles | as listed | slightly smaller on long cards (see section 6) |

Use `clamp()` for display sizes, as in section 4, so text scales smoothly between breakpoints.

**Note page on mobile** (derived; not separately prototyped): sheet padding drops to 28px via the clamp, body text to 18px/1.7, the tape strips shrink to 80px, and the chat bubble max-width rises to 90%.

---

## 9. Accessibility checklist

- [ ] All text/background pairs come from the verified table in section 3.
- [ ] Semantic landmarks: `<header>`, `<nav aria-label="Main">`, `<main>`, `<article>` for notes, `<footer>`.
- [ ] One `<h1>` per page (the thesis on home, the title on notes), with a logical h2 order below.
- [ ] Every decorative element (tape, margin line, stamp logo graphic, dashed rules) has `aria-hidden="true"`.
- [ ] The number stamps in ordered lists are `aria-hidden`; use a real `<ol>` so screen readers announce the numbering.
- [ ] Inputs have visible `<label>`s; the subscribe button is a real `<button>`.
- [ ] Focus is visible everywhere: `outline: 3px solid var(--pen); outline-offset: 3px;`
- [ ] Cards, tabs and buttons show the same lift on `:focus-visible` as on hover (section 6).
- [ ] All motion is switched off under `prefers-reduced-motion: reduce`.
- [ ] Tap targets are ≥ 44px tall (nav tabs, buttons, footer links on mobile).
- [ ] No information is conveyed by tilt or color alone. Receipt statuses are words, not just colors.
- [ ] Caveat is never used for essential information.
- [ ] Rotated elements stay readable at 200% zoom with no horizontal scroll.
- [ ] Images (when you add your photo) have meaningful `alt` text.

---

## 10. Performance budget (built light, for 3G)

| Asset | Budget |
|-------|--------|
| HTML per page | < 30 KB (gzipped) |
| CSS | < 15 KB (gzipped), one file, no framework |
| JavaScript | 0 KB required for reading. Subscribe form works as a plain POST. |
| Fonts | ≤ 6 files: Fraunces (variable, roman, wght 600–800), Literata (variable roman + italic), Caveat 700, Space Mono 400 + 700. Latin subset `.woff2`, `font-display: swap`. Preload only Literata roman and Fraunces. |
| Texture | `paper-grain.png`, ~20 KB, cached long-term |
| Images | None above the fold. Your photo: ≤ 40 KB WebP/AVIF, sized to 240px (×2 for retina). No note cover images. |

**Hard requirements:**

1. **Notes must be in the HTML at build time.** The current site loads the notes list and "now" content client-side, so crawlers, link previews and slow connections see "loading". Render the homepage note cards, the receipt and every note page statically. A `notes-index.json` manifest is fine as a *build input*, but don't fetch it in the browser to render content.
2. No layout shift from fonts: define `@font-face` fallbacks with `size-adjust` (and ascent/descent overrides) so Georgia matches Literata's and Fraunces' metrics while the web fonts load.
3. Long-cache static assets (`Cache-Control: public, max-age=31536000, immutable` with hashed filenames).
4. Measure on a throttled "Slow 3G" profile. The footer promise ("built light, for 3G") should stay true.

---

## 11. Content model & conventions

### Note front matter

```yaml
---
number: 4                 # sequential, never reused
title: The AI Assistant I Want To Build
slug: the-ai-assistant-i-want-to-build
date: 2026-10-17
tag: AI                   # one display tag for the stamp row
tags: [development, ai]   # "filed under" + tag pages
dek: Natural language for the conversation, deterministic logic for the truth.
summary: >-               # homepage card text, ≤ 160 characters
  Natural language for the conversation, deterministic logic for the truth.
  Designing Doli, a WhatsApp assistant whose memory doesn't depend on which model is running it.
---
```

- **Numbering:** zero-padded in stamps (`NO. 04`). The newest note is always the featured card.
- **Read time:** words ÷ 200, rounded up (`6 MIN READ`).
- **Dates:** `17 OCT 2026` on the featured card and note page; `JUN 2026` on standard cards.
- **Card tints:** the featured card is always `--manila`; the rest cycle `--sheet` → `--sage` → `--clay` by position.
- **Homepage count:** featured + 3 earlier notes. Add a "more field notes" link to an archive once you pass 4.
- **Cadence:** one note a month. The "next note" placeholder card is an honest nudge, so keep it.

### Annotation voice

Lowercase, short, dry, first person, a little self-aware. Never sarcastic about readers. At most one per section.

### Copy placeholders to replace before launch

- `[ your photo ]` in the polaroid → your real photo
- Polaroid caption "me, mid-thought" → your own line
- `PAID IN  LATE NIGHTS` on the receipt → keep it or make it yours
- The bio paragraphs → check they still describe your work

---

## 12. Migration notes from the current site

- Remove the terminal styling (`ub://`, `cat about.txt`, `ls projects/`, JetBrains Mono).
- **Keep:** note URLs (`/notes/<slug>/`), the `/now` page, the contact email, social links, and the newsletter provider. Point the subscribe slip at your existing form handler.
- The existing `how-i-think` content is now condensed into the poda-poda panel. Either keep the full page and link it from the panel, or redirect it to `/#principles`.
- Existing Open Graph images can stay for now. A follow-up could generate OG images in this style: a manila card with the note title and a NO. stamp.
- Set `<title>` patterns: home is `Umaru Biango: Systems designed where constraints are real`; notes are `<Title>: Field note No. 04 · Umaru Biango`.

---

## 13. Not yet designed

These pages follow the system but don't have prototypes yet:

- Field notes archive (`/notes`): a grid of standard note cards, newest first
- Tag pages: same grid, filtered
- `/now` page: a single sheet with a "last updated" stamp is the natural fit
- 404: a scrapped index card ("this page got scrapped") with a link home
- Mobile note page: follow the rules in section 8
- Dark mode: none planned; the paper concept is inherently light

---

*Prototypes: "umarubiango.com redesign" canvas, Direction C (Field notebook). Desktop homepage, mobile homepage, field note page.*
