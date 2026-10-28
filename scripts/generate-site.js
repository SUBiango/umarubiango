#!/usr/bin/env node
'use strict';

/**
 * generate-site.js — the only build step.
 *
 * Reads notes/<slug>.md (source of truth) plus data/workshop.json and
 * data/now.json, then writes:
 *
 *   notes/<slug>/index.html        a full field note page
 *   notes/tag/<tag>/index.html     a filtered archive page per tag
 *   data/notes-index.json          the manifest (build input, not fetched)
 *
 * and injects static HTML into the hand-authored root pages between
 * <!-- generated:NAME --> ... <!-- /generated:NAME --> markers.
 *
 * Everything a reader needs is in the HTML at build time: no note content,
 * note list, receipt or "now" data is fetched in the browser.
 */

var fs = require('fs');
var path = require('path');
var matter = require('gray-matter');
var marked = require('marked');

var ROOT = path.join(__dirname, '..');
var NOTES_DIR = path.join(ROOT, 'notes');
var DATA_DIR = path.join(ROOT, 'data');
var SITE_URL = 'https://www.umarubiango.com';

var MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN',
              'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

var SOCIAL_LINKS = [
  { label: 'GitHub',    url: 'https://github.com/SUBiango' },
  { label: 'LinkedIn',  url: 'https://www.linkedin.com/in/umaru-sahr-biango-8898b2127/' },
  { label: 'Instagram', url: 'https://www.instagram.com/umarusahrbiango/' },
  { label: 'Facebook',  url: 'https://www.facebook.com/umaru.biango' },
];

var STATUS = {
  'on-the-bench': { label: 'ON THE BENCH', cls: 'is-bench',    rank: 0 },
  'shipped':      { label: 'SHIPPED',      cls: 'is-shipped',  rank: 1 },
  'parked':       { label: 'PARKED',       cls: 'is-parked',   rank: 2 },
  'scrapped':     { label: 'SCRAPPED',     cls: 'is-scrapped', rank: 3 },
};

/* ==========================================================================
   Read the notes
   ========================================================================== */

var notes = fs.readdirSync(NOTES_DIR)
  .filter(function(name) { return name.endsWith('.md'); })
  .map(function(filename) {
    var parsed = matter(fs.readFileSync(path.join(NOTES_DIR, filename), 'utf8'));
    var fm = parsed.data || {};
    var tags = Array.isArray(fm.tags) ? fm.tags : [];
    return {
      fm: fm,
      content: parsed.content,
      slug: fm.slug || filename.replace(/\.md$/, ''),
      title: fm.title || filename.replace(/\.md$/, ''),
      dek: String(fm.dek || fm.excerpt || '').trim(),
      summary: String(fm.summary || fm.excerpt || '').trim(),
      excerpt: String(fm.excerpt || toExcerpt(parsed.content)).trim(),
      tags: tags,
      displayTag: String(fm.tag || tags[0] || 'FIELD NOTE').toUpperCase(),
      readTime: readTime(parsed.content),
      date: toDate(fm.date),
      isoDate: isoDay(fm.date),
    };
  });

// Newest first, the order the site reads in.
notes.sort(function(a, b) { return b.date - a.date; });

// Numbers run oldest → newest and are never reused, so an explicit
// `number:` in frontmatter always wins over the computed position.
var oldestFirst = notes.slice().reverse();
oldestFirst.forEach(function(note, i) {
  note.number = note.fm.number != null ? Number(note.fm.number) : i + 1;
});

/* ==========================================================================
   Write the note pages
   ========================================================================== */

notes.forEach(function(note, i) {
  var newer = i > 0 ? notes[i - 1] : null;
  var older = i < notes.length - 1 ? notes[i + 1] : null;
  writeFile(path.join(NOTES_DIR, note.slug, 'index.html'), notePage(note, newer, older));
});

/* ==========================================================================
   Write the tag archives
   ========================================================================== */

var tagMap = {};
notes.forEach(function(note) {
  note.tags.forEach(function(tag) {
    var key = slugify(tag);
    if (!tagMap[key]) tagMap[key] = { label: tag, slug: key, notes: [] };
    tagMap[key].notes.push(note);
  });
});

var allTags = Object.keys(tagMap).sort().map(function(key) { return tagMap[key]; });

allTags.forEach(function(tag) {
  writeFile(path.join(NOTES_DIR, 'tag', tag.slug, 'index.html'), tagPage(tag));
});

/* ==========================================================================
   Write the manifest
   ========================================================================== */

writeFile(path.join(DATA_DIR, 'notes-index.json'), JSON.stringify(notes.map(function(note) {
  return {
    number: note.number,
    slug: note.slug,
    title: note.title,
    date: note.isoDate,
    excerpt: note.excerpt,
    tags: note.tags,
  };
}), null, 2) + '\n');

/* ==========================================================================
   Inject into the hand-authored root pages
   ========================================================================== */

var workshop = readJson(path.join(DATA_DIR, 'workshop.json'));
var now = readJson(path.join(DATA_DIR, 'now.json'));

// Homepage: the featured note plus three earlier ones.
inject('index.html', 'notes', noteGrid(notes.slice(0, 4), ''));
inject('index.html', 'receipt', receipt(workshop, ''));

// Archive: every note, plus the tag chips.
inject('notes.html', 'tags', tagChips(allTags, null, ''));
inject('notes.html', 'notes', noteGrid(notes, '', { featured: false }));

// Now: rendered from data/now.json at build time, not fetched.
inject('now.html', 'now', nowBlock(now));

/* ==========================================================================
   Write the sitemap
   ========================================================================== */

var today = isoDay(new Date());
var sitemapUrls = [
  { loc: '/',                  changefreq: 'weekly',  priority: '1.0', lastmod: notes[0] ? notes[0].isoDate : today },
  { loc: '/notes.html',        changefreq: 'monthly', priority: '0.8', lastmod: notes[0] ? notes[0].isoDate : today },
  { loc: '/now.html',          changefreq: 'monthly', priority: '0.7', lastmod: isoDay(now.updated) || today },
  { loc: '/how-i-think.html',  changefreq: 'yearly',  priority: '0.6', lastmod: today },
  { loc: '/contact.html',      changefreq: 'yearly',  priority: '0.5', lastmod: today },
].concat(notes.map(function(note) {
  return {
    loc: '/notes/' + encodeURIComponent(note.slug) + '/',
    changefreq: 'yearly', priority: '0.9', lastmod: note.isoDate,
  };
})).concat(allTags.map(function(t) {
  return {
    loc: '/notes/tag/' + t.slug + '/',
    changefreq: 'monthly', priority: '0.4',
    lastmod: t.notes[0] ? t.notes[0].isoDate : today,
  };
}));

writeFile(path.join(ROOT, 'sitemap.xml'),
  '<?xml version="1.0" encoding="UTF-8"?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
  sitemapUrls.map(function(u) {
    return '  <url>\n' +
           '    <loc>' + SITE_URL + u.loc + '</loc>\n' +
           '    <lastmod>' + u.lastmod + '</lastmod>\n' +
           '    <changefreq>' + u.changefreq + '</changefreq>\n' +
           '    <priority>' + u.priority + '</priority>\n' +
           '  </url>\n';
  }).join('') +
  '</urlset>\n');

console.log('[generate] ' + notes.length + ' note page(s), ' + allTags.length +
            ' tag page(s), 3 root page(s) updated, sitemap with ' +
            sitemapUrls.length + ' url(s).');

/* ==========================================================================
   Page templates
   ========================================================================== */

function notePage(note, newer, older) {
  var base = '../../';
  var url = SITE_URL + '/notes/' + encodeURIComponent(note.slug) + '/';
  var socialTitle = String(note.fm.og_title || '').trim() || note.title;
  var img = socialImage(note.fm);

  var meta = [
    metaTag('meta', { name: 'description', content: note.excerpt }),
    metaTag('meta', { name: 'author', content: 'Umaru Biango' }),
    metaTag('meta', { property: 'og:title', content: socialTitle }),
    metaTag('meta', { property: 'og:description', content: note.excerpt }),
    metaTag('meta', { property: 'og:type', content: 'article' }),
    metaTag('meta', { property: 'og:url', content: url }),
    metaTag('meta', { property: 'og:site_name', content: 'Umaru Biango' }),
    metaTag('meta', { property: 'og:locale', content: 'en_US' }),
    metaTag('meta', { property: 'article:published_time', content: isoFull(note.fm.date) }),
    metaTag('meta', { property: 'article:author', content: SITE_URL + '/' }),
    metaTag('meta', { property: 'article:section', content: 'Notes' }),
  ];
  note.tags.forEach(function(t) {
    meta.push(metaTag('meta', { property: 'article:tag', content: t }));
  });
  if (img.url) {
    meta.push(metaTag('meta', { property: 'og:image', content: img.url }));
    meta.push(metaTag('meta', { property: 'og:image:secure_url', content: img.url }));
    meta.push(metaTag('meta', { property: 'og:image:alt', content: img.alt || note.title }));
    if (img.width)  meta.push(metaTag('meta', { property: 'og:image:width', content: img.width }));
    if (img.height) meta.push(metaTag('meta', { property: 'og:image:height', content: img.height }));
    meta.push(metaTag('meta', { property: 'og:image:type', content: img.type }));
  }
  meta.push(metaTag('meta', { name: 'twitter:card', content: img.url ? 'summary_large_image' : 'summary' }));
  meta.push(metaTag('meta', { name: 'twitter:title', content: socialTitle }));
  meta.push(metaTag('meta', { name: 'twitter:description', content: note.excerpt }));
  if (img.url) meta.push(metaTag('meta', { name: 'twitter:image', content: img.url }));

  var filedUnder = note.tags.length
    ? 'filed under: ' + note.tags.map(function(t) {
        return '<a href="' + base + 'notes/tag/' + slugify(t) + '/">' + esc(t) + '</a>';
      }).join(' · ')
    : '';

  return shell({
    base: base,
    title: note.title + ': Field note No. ' + pad(note.number) + ' · Umaru Biango',
    head: meta.join('\n') + '\n' + metaTag('link', { rel: 'canonical', href: url }),
    activeTab: 0,
    main:
      '    <article class="note-article">\n' +
      '      <a class="back-link" href="' + base + 'notes.html">← all field notes</a>\n' +
      '      <div class="note-meta">\n' +
      '        <span class="stamp stamp--lg tilt">FIELD NOTE NO. ' + pad(note.number) + '</span>\n' +
      '        <span class="meta">' + esc(longDate(note.date)) + ' · ' + esc(note.displayTag) +
             ' · ' + note.readTime + ' MIN READ</span>\n' +
      '      </div>\n' +
      '      <h1 class="note-title">' + esc(note.title) + '</h1>\n' +
      (note.dek ? '      <p class="note-dek">' + esc(note.dek) + '</p>\n' : '') +
      '      <div class="sheet">\n' +
      '        <span class="tape tape--lg tilt" aria-hidden="true"></span>\n' +
      '        <span class="tape tape--lg tape--alt tilt" aria-hidden="true"></span>\n' +
      '        <div class="note-body">\n' + noteBody(note) + '\n' +
      '        </div>\n' +
      '      </div>\n' +
      '      <div class="note-foot">\n' +
      '        <span>' + filedUnder + '</span>\n' +
      '        <span class="note-share">share:\n' + shareLinks(url, socialTitle) +
      '        </span>\n' +
      '      </div>\n' +
      '    </article>\n' +
      slip({
        id: 'note',
        spaced: true,
        title: 'liked this one? pass me a note.',
        slug: note.slug,
      }) +
      postNav(note, newer, older, base),
  });
}

function tagPage(tag) {
  var base = '../../../';
  var url = SITE_URL + '/notes/tag/' + tag.slug + '/';
  var desc = 'Field notes tagged ' + tag.label + ' — building software for West Africa.';

  return shell({
    base: base,
    title: 'Field notes: ' + tag.label + ' · Umaru Biango',
    head: [
      metaTag('meta', { name: 'description', content: desc }),
      metaTag('meta', { property: 'og:title', content: 'Field notes: ' + tag.label }),
      metaTag('meta', { property: 'og:description', content: desc }),
      metaTag('meta', { property: 'og:type', content: 'website' }),
      metaTag('meta', { property: 'og:url', content: url }),
      metaTag('meta', { property: 'og:image', content: SITE_URL + '/assets/images/og-image.jpg' }),
      metaTag('meta', { property: 'og:image:width', content: '1200' }),
      metaTag('meta', { property: 'og:image:height', content: '630' }),
      metaTag('meta', { name: 'twitter:card', content: 'summary_large_image' }),
      metaTag('link', { rel: 'canonical', href: url }),
    ].join('\n'),
    activeTab: 0,
    main:
      '    <div class="page-head">\n' +
      '      <p class="kicker">FIELD NOTEBOOK · FILED UNDER</p>\n' +
      '      <h1 class="section-title">' + esc(tag.label) + '</h1>\n' +
      '    </div>\n' +
      '    <section class="section" aria-label="Notes tagged ' + esc(tag.label) + '">\n' +
      '      <div class="tag-filters">\n' + tagChips(allTags, tag.slug, '        ') +
      '      </div>\n' +
      noteGrid(tag.notes, '      ', { featured: false, base: base }) +
      '      <a class="section-more" href="' + base + 'notes.html">← all field notes</a>\n' +
      '    </section>\n',
  });
}

/* ==========================================================================
   Components
   ========================================================================== */

/** The page frame every generated page shares with the hand-authored ones. */
function shell(o) {
  var base = o.base;
  return '<!DOCTYPE html>\n' +
'<html lang="en">\n' +
'<head>\n' +
'<meta charset="UTF-8">\n' +
'<meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
'<title>' + esc(o.title) + '</title>\n' +
o.head + '\n' +
'<link rel="preload" href="/assets/fonts/literata-latin-variable.woff2" as="font" type="font/woff2" crossorigin>\n' +
'<link rel="preload" href="/assets/fonts/fraunces-latin-700-soft-wonk.woff2" as="font" type="font/woff2" crossorigin>\n' +
'<link rel="stylesheet" href="/assets/css/main.css">\n' +
favicons() +
'</head>\n' +
'<body class="paper page">\n' +
'<a href="#main" class="skip-link">Skip to content</a>\n' +
'<div class="container">\n' +
header(base, o.activeTab) +
'  <main id="main" tabindex="-1">\n' +
o.main +
'  </main>\n' +
footer(false) +
'</div>\n' +
'<script src="/assets/js/site.js" defer></script>\n' +
'</body>\n' +
'</html>\n';
}

function header(base, active) {
  var tabs = [
    { label: 'field notes', href: base + 'notes.html' },
    { label: 'building',    href: base + 'index.html#building' },
    { label: 'now',         href: base + 'now.html' },
    { label: 'say hi',      href: base + 'contact.html' },
  ];
  return '  <header class="site-header">\n' +
'    <a class="brand" href="' + base + 'index.html">\n' +
'      <span class="brand-stamp tilt" aria-hidden="true">UB</span>\n' +
'      <span class="brand-name">Umaru Biango</span>\n' +
'    </a>\n' +
'    <nav class="tabs" aria-label="Main">\n' +
tabs.map(function(t, i) {
  return '      <a class="tab tilt" href="' + t.href + '"' +
    (i === active ? ' aria-current="page"' : '') + '>' + t.label + '</a>\n';
}).join('') +
'    </nav>\n' +
'  </header>\n';
}

function footer(withSign) {
  return '  <footer class="site-footer">\n' +
(withSign ? '    <p class="footer-sign">thanks for scrolling all the way down.</p>\n' : '') +
'    <div class="footer-row">\n' +
'      <span>© 2026 Umaru S. Biango · built light, for 3G</span>\n' +
'      <span class="footer-links">\n' +
'        <a href="mailto:hello@umarubiango.com">hello@umarubiango.com</a>\n' +
SOCIAL_LINKS.map(function(link) {
  return '        <a href="' + link.url + '" target="_blank" rel="me noopener">' + link.label + '</a>\n';
}).join('') +
'      </span>\n' +
'    </div>\n' +
'  </footer>\n';
}

function favicons() {
  return '<link rel="icon" type="image/png" href="/assets/images/favicon/favicon-96x96.png" sizes="96x96">\n' +
'<link rel="icon" type="image/svg+xml" href="/assets/images/favicon/favicon.svg">\n' +
'<link rel="shortcut icon" href="/assets/images/favicon/favicon.ico">\n' +
'<link rel="apple-touch-icon" sizes="180x180" href="/assets/images/favicon/apple-touch-icon.png">\n' +
'<link rel="manifest" href="/assets/images/favicon/site.webmanifest">\n';
}

/**
 * The note grid. The first card is the featured one unless told otherwise;
 * the rest cycle their tint and tilt from their position (see main.css).
 */
function noteGrid(list, pad_, opts) {
  var featured = !opts || opts.featured !== false;
  var p = pad_ || '';
  var base = opts && opts.base ? opts.base : '';

  return p + '<div class="note-grid">\n' +
    list.map(function(note, i) {
      var isFeatured = featured && i === 0;
      var tapePos = isFeatured ? 'tape--mid' : ['tape--left', 'tape--right', 'tape--mid'][i % 3];
      return p + '  <a class="note-card tilt' + (isFeatured ? ' note-card--featured' : '') +
             '" href="' + base + 'notes/' + encodeURIComponent(note.slug) + '/">\n' +
        p + '    <span class="tape tilt ' + tapePos + (i % 2 ? ' tape--alt' : '') +
             (isFeatured ? ' tape--lg' : '') + '" aria-hidden="true"></span>\n' +
        p + '    <span class="card-head">\n' +
        p + '      <span class="stamp' + (isFeatured ? ' stamp--md tilt' : '') + '">NO. ' +
             pad(note.number) + '</span>\n' +
        p + '      <span class="card-meta">' +
             esc(isFeatured ? longDate(note.date) : shortDate(note.date)) + ' · ' +
             esc(note.displayTag) + '</span>\n' +
        (isFeatured ? p + '      <span class="card-flag">← newest</span>\n' : '') +
        p + '    </span>\n' +
        p + '    <span class="card-title">' + esc(note.title) + '</span>\n' +
        p + '    <span class="card-dek">' + esc(note.summary) + '</span>\n' +
        (isFeatured ? p + '    <span class="card-cta">read it →</span>\n' : '') +
        p + '  </a>\n';
    }).join('') +
    p + '</div>\n';
}

function tagChips(tags, activeSlug, pad_) {
  var p = pad_ || '';
  var base = activeSlug === null ? '' : '../../../';
  return p + '<a class="tag-chip" href="' + base + 'notes.html"' +
         (activeSlug === null || activeSlug === undefined ? ' aria-current="true"' : '') +
         '>all</a>\n' +
    tags.map(function(t) {
      return p + '<a class="tag-chip" href="' + base + 'notes/tag/' + t.slug + '/"' +
             (t.slug === activeSlug ? ' aria-current="true"' : '') + '>' + esc(t.label) + '</a>\n';
    }).join('');
}

function receipt(data, pad_) {
  var p = pad_ || '';
  var items = (data.items || []).slice().sort(function(a, b) {
    return (STATUS[a.status] || { rank: 9 }).rank - (STATUS[b.status] || { rank: 9 }).rank;
  });

  return p + '<div class="receipt tilt">\n' +
    p + '  <p class="receipt-title">UB WORKSHOP</p>\n' +
    p + '  <p class="receipt-sub">' + esc(data.order || '') + '</p>\n' +
    p + '  <hr class="receipt-rule" aria-hidden="true">\n' +
    p + '  <ul class="receipt-items" role="list">\n' +
    items.map(function(item) {
      var s = STATUS[item.status] || STATUS.parked;
      var href = item.url || (item.note ? 'notes/' + encodeURIComponent(item.note) + '/' : '');
      var away = item.url ? ' target="_blank" rel="noopener"' : '';
      var inner =
        p + '      <span class="receipt-line"><span class="receipt-name">' +
            esc(item.name.toUpperCase()) + '</span>' +
            '<span class="receipt-status ' + s.cls + '">' + s.label + '</span></span>\n' +
        p + '      <span class="receipt-desc">' + esc(item.description || '') +
            (item.note ? esc(' · read note no. ' + pad(noteNumber(item.note))) : '') + '</span>\n';
      return p + '    <li>\n' +
        (href
          ? p + '    <a class="receipt-item ' + s.cls + '" href="' + esc(href) + '"' + away + '>\n' + inner + p + '    </a>\n'
          : p + '    <span class="receipt-item ' + s.cls + '">\n' + inner + p + '    </span>\n') +
        p + '    </li>\n';
    }).join('') +
    p + '  </ul>\n' +
    p + '  <hr class="receipt-rule" aria-hidden="true">\n' +
    p + '  <p class="receipt-total"><span>ITEMS</span><span>' + items.length + '</span></p>\n' +
    p + '  <p class="receipt-total"><span>PAID IN</span><span>' +
        esc(data.paid_in || 'LATE NIGHTS') + '</span></p>\n' +
    p + '  <p class="receipt-foot">** THANK YOU, COME AGAIN **</p>\n' +
    p + '  <p class="receipt-key">STATUS KEY: ON THE BENCH · SHIPPED · PARKED · SCRAPPED</p>\n' +
    p + '</div>\n';
}

/** The number stamped on a note, for cross-references like the receipt. */
function noteNumber(slug) {
  var match = notes.filter(function(note) { return note.slug === slug; })[0];
  return match ? match.number : 0;
}

function nowBlock(data) {
  var rows = [
    ['building', data.working_on],
    ['learning', data.learning],
    ['reading', data.reading],
  ].filter(function(r) { return r[1]; });

  var updated = toDate(data.updated);

  return (updated.getTime()
    ? '      <p class="now-stamp">' +
      '<span class="stamp stamp--md tilt">LAST UPDATED</span>' +
      '<span class="meta">' + esc(longDate(updated)) + '</span></p>\n'
    : '') +
    '      <dl class="def-list">\n' +
    rows.map(function(r) {
      return '        <dt>' + esc(r[0]) + '</dt>\n' +
             '        <dd>' + esc(r[1]) + '</dd>\n';
    }).join('') +
    '      </dl>\n';
}

function slip(o) {
  return '    <section class="slip-wrap' + (o.spaced ? ' slip-wrap--spaced' : '') +
'" id="hello" aria-labelledby="slip-' + o.id + '">\n' +
'      <div class="slip tilt">\n' +
'        <h2 class="slip-title" id="slip-' + o.id + '">' + esc(o.title) + '</h2>\n' +
'        <p class="slip-copy">One field note a month, straight to your inbox. No growth hacks.</p>\n' +
'        <form class="slip-form" name="newsletter" method="POST" action="/" data-netlify="true" data-subscribe>\n' +
'          <input type="hidden" name="form-name" value="newsletter">\n' +
'          <input type="hidden" name="form-type" value="newsletter">\n' +
'          <input type="hidden" name="note_slug" value="' + esc(o.slug || '') + '">\n' +
'          <div class="field">\n' +
'            <label for="email-' + o.id + '">your email</label>\n' +
'            <input class="input" id="email-' + o.id + '" type="email" name="email"\n' +
'                   placeholder="you@example.com" required autocomplete="email">\n' +
'          </div>\n' +
'          <button class="btn" type="submit">send it</button>\n' +
'        </form>\n' +
'      </div>\n' +
'    </section>\n';
}

function postNav(note, newer, older, base) {
  var cards = [];

  if (older) {
    cards.push(
'      <a class="post-nav-card tilt" href="' + base + 'notes/' + encodeURIComponent(older.slug) + '/">\n' +
'        <span class="tape tilt tape--left" aria-hidden="true"></span>\n' +
'        <span class="card-meta">← PREVIOUS · NO. ' + pad(older.number) + '</span>\n' +
'        <span class="card-title">' + esc(older.title) + '</span>\n' +
'      </a>\n');
  }

  if (newer) {
    cards.push(
'      <a class="post-nav-card tilt" href="' + base + 'notes/' + encodeURIComponent(newer.slug) + '/">\n' +
'        <span class="tape tilt tape--right tape--alt" aria-hidden="true"></span>\n' +
'        <span class="card-meta">NEXT · NO. ' + pad(newer.number) + ' →</span>\n' +
'        <span class="card-title">' + esc(newer.title) + '</span>\n' +
'      </a>\n');
  } else {
    // An honest nudge: one note a month, and the next one isn't written yet.
    cards.push(
'      <div class="post-nav-card post-nav-card--empty tilt">\n' +
'        <span class="card-meta">NEXT · NO. ' + pad(note.number + 1) + ' →</span>\n' +
'        <span class="card-wait">still being written. see you next month.</span>\n' +
'      </div>\n');
  }

  return '    <nav class="post-nav" aria-label="More field notes">\n' + cards.join('') + '    </nav>\n';
}

function shareLinks(url, title) {
  var u = encodeURIComponent(url);
  var t = encodeURIComponent(title);
  return '          <a href="https://x.com/intent/tweet?url=' + u + '&amp;text=' + t +
         '" target="_blank" rel="noopener">X</a>\n' +
'          <a href="https://www.linkedin.com/sharing/share-offsite/?url=' + u + '" target="_blank" rel="noopener">LinkedIn</a>\n' +
'          <a href="https://www.facebook.com/sharer/sharer.php?u=' + u + '" target="_blank" rel="noopener">Facebook</a>\n';
}

/* ==========================================================================
   Markdown → the sheet
   ========================================================================== */

function noteBody(note) {
  var html = marked.parse(note.content);

  // The <h1> is the page title; the sheet starts at the first paragraph.
  html = html.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '');

  // list-style: none strips list semantics in some screen readers.
  html = html.replace(/<(ul|ol)(\s|>)/g, '<$1 role="list"$2');

  // A link that leaves the site opens in a new tab, so the note stays put.
  html = html.replace(/<a href="(https?:\/\/[^"]+)"/g, function(match, href) {
    return href.indexOf(SITE_URL) === 0 ? match : match + ' target="_blank" rel="noopener"';
  });

  html = html.trim().split('\n').map(function(line) {
    return '          ' + line;
  }).join('\n');

  if (note.fm.signature === false) return html;
  return html + '\n          <p class="note-signature tilt tilt-left">— Umaru</p>';
}

/* ==========================================================================
   Root-page injection
   ========================================================================== */

function inject(file, name, html) {
  var filePath = path.join(ROOT, file);
  var source = fs.readFileSync(filePath, 'utf8');
  var open = '<!-- generated:' + name + ' -->';
  var close = '<!-- /generated:' + name + ' -->';
  var start = source.indexOf(open);
  var end = source.indexOf(close);

  if (start === -1 || end === -1) {
    throw new Error('Missing ' + open + ' … ' + close + ' markers in ' + file);
  }

  var next = source.slice(0, start + open.length) + '\n' +
             html.replace(/\n$/, '') + '\n' +
             source.slice(end);

  if (next !== source) fs.writeFileSync(filePath, next);
}

/* ==========================================================================
   Helpers
   ========================================================================== */

function writeFile(target, contents) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, contents);
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function metaTag(name, attrs) {
  var out = '<' + name;
  Object.keys(attrs).forEach(function(key) {
    if (attrs[key] === '' || attrs[key] == null) return;
    out += ' ' + key + '="' + esc(attrs[key]) + '"';
  });
  return out + '>';
}

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function slugify(str) {
  return String(str).toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function pad(n) { return String(n).padStart(2, '0'); }

function toDate(value) {
  if (!value) return new Date(0);
  var d = value instanceof Date ? value : new Date(String(value));
  return isNaN(d.getTime()) ? new Date(0) : d;
}

function isoDay(value) {
  var d = toDate(value);
  return d.getTime() ? d.toISOString().slice(0, 10) : '';
}

function isoFull(value) {
  var d = toDate(value);
  return d.getTime() ? d.toISOString() : '';
}

/** 17 OCT 2026 — the featured card and the note page. */
function longDate(d) {
  return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

/** JUN 2026 — standard cards. */
function shortDate(d) {
  return MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear();
}

/** Words ÷ 200, rounded up. */
function readTime(markdown) {
  var text = String(markdown)
    .replace(/```[\s\S]*?```/g, ' ')   // code blocks aren't read at 200 wpm
    .replace(/<[^>]+>/g, ' ')          // component markup isn't words
    .replace(/[#*_>`[\]()]/g, ' ');
  var words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function toExcerpt(markdown) {
  return String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`[\]()-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 160);
}

/**
 * Covers are JPG at 1200x630 (see CLAUDE.md). WebP still works, but it needs a
 * same-named JPG/PNG twin because many scrapers handle WebP poorly.
 */
function socialImage(fm) {
  var src = String(fm.featured_image || '').trim();
  if (!src) return {};

  var url = src;
  if (/\.webp(?:$|[?#])/i.test(src) && !/^https?:/i.test(src)) {
    var bare = path.join(ROOT, src.replace(/^\//, '').split(/[?#]/)[0]).replace(/\.webp$/i, '');
    ['.jpg', '.jpeg', '.png'].some(function(ext) {
      if (!fs.existsSync(bare + ext)) return false;
      url = '/' + path.relative(ROOT, bare + ext).replace(/\\/g, '/');
      return true;
    });
  }

  return {
    url: /^https?:/i.test(url) ? url : SITE_URL + (url.charAt(0) === '/' ? url : '/' + url),
    alt: fm.featured_image_alt,
    width: fm.featured_image_width,
    height: fm.featured_image_height,
    type: /\.png(?:$|[?#])/i.test(url) ? 'image/png'
        : /\.webp(?:$|[?#])/i.test(url) ? 'image/webp'
        : 'image/jpeg',
  };
}
