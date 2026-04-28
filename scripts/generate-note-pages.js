#!/usr/bin/env node
'use strict';

var fs = require('fs');
var path = require('path');
var matter = require('gray-matter');
var marked = require('marked');

var ROOT = path.join(__dirname, '..');
var NOTES_DIR = path.join(ROOT, 'notes');
var SITE_URL = 'https://umarubiango.com';

var markdownFiles = fs.readdirSync(NOTES_DIR)
  .filter(function(name) { return name.endsWith('.md'); });

var noteEntries = markdownFiles.map(function(filename) {
  var sourcePath = path.join(NOTES_DIR, filename);
  var raw = fs.readFileSync(sourcePath, 'utf8');
  var parsed = matter(raw);
  var fm = parsed.data || {};
  return {
    filename: filename,
    raw: raw,
    parsed: parsed,
    fm: fm,
    slug: fm.slug || filename.replace(/\.md$/, ''),
    title: fm.title || filename.replace(/\.md$/, ''),
    sortTs: toSortTimestamp(fm.date),
  };
});

var sortedNotes = noteEntries.slice().sort(function(a, b) {
  return b.sortTs - a.sortTs;
});

noteEntries.forEach(function(entry) {
  var parsed = entry.parsed;
  var fm = entry.fm;
  var slug = entry.slug;
  var title = entry.title;
  var excerpt = fm.excerpt || toExcerpt(parsed.content);
  var date = formatDate(fm.date);
  var tags = Array.isArray(fm.tags) ? fm.tags : [];
  var featuredImage = typeof fm.featured_image === 'string' ? fm.featured_image.trim() : '';
  var featuredImageAlt = fm.featured_image_alt || title;
  var featuredImageWidth = fm.featured_image_width != null ? fm.featured_image_width : fm.featuredImageWidth;
  var featuredImageHeight = fm.featured_image_height != null ? fm.featured_image_height : fm.featuredImageHeight;
  var featuredImageUrl = featuredImage ? toAbsoluteUrl(featuredImage) : '';
  var socialImageUrl = featuredImage ? toSocialImageUrl(featuredImage) : '';
  var socialImageType = socialImageUrl ? toImageMimeType(socialImageUrl) : '';
  var showNewsletter = fm.send !== false;
  var postNavHtml = buildPostNavHtml(sortedNotes, slug);
  var articleMetaHtml = buildArticleMetaHtml(fm, tags);

  var htmlBody = marked.parse(parsed.content);
  htmlBody = htmlBody.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '');
  var tagsHtml = tags.map(function(tag) {
    return '<a href="../../notes.html?tag=' + encodeURIComponent(tag) + '">' + escapeHtml(tag) + '</a>';
  }).join('');
  var featuredImageWidthAttr = featuredImageWidth ? ' width="' + escapeHtml(featuredImageWidth) + '"' : '';
  var featuredImageHeightAttr = featuredImageHeight ? ' height="' + escapeHtml(featuredImageHeight) + '"' : '';
  var featuredImageHtml = featuredImage
    ? '        <figure class="note-featured-image"><img src="' + escapeHtml(featuredImage) + '" alt="' + escapeHtml(featuredImageAlt) + '"' + featuredImageWidthAttr + featuredImageHeightAttr + ' loading="lazy" decoding="async"></figure>\n'
    : '';
  var newsletterHtml = showNewsletter
    ? (
      '        <div class="newsletter-form">\n' +
      '          <div class="terminal-block" role="region" aria-label="Newsletter signup">\n' +
      '            <span class="terminal-line"><span class="t-prompt" aria-hidden="true">&gt;</span> <span class="t-cmd">want_more</span></span>\n' +
      '            <span class="t-out">No growth hacks. Just hard-won lessons worth stealing.</span>\n' +
      '          </div>\n' +
      '          <form name="newsletter" method="POST" data-netlify="true" id="newsletter-form" novalidate>\n' +
      '            <input type="hidden" name="form-name" value="newsletter">\n' +
      '            <input type="hidden" name="form-type" value="newsletter">\n' +
      '            <input type="hidden" name="note_slug" value="' + escapeHtml(slug) + '">\n' +
      '            <div class="form-row">\n' +
      '              <label for="newsletter-email" class="u-sr-only">Email address</label>\n' +
      '              <input type="email" id="newsletter-email" name="email" placeholder="enter_email" required autocomplete="email">\n' +
      '              <button type="submit" class="form-submit-inline">subscribe</button>\n' +
      '            </div>\n' +
      '          </form>\n' +
      '        </div>\n'
    )
    : '';

  var shareUrl = SITE_URL + '/notes/' + encodeURIComponent(slug) + '/';
  var shareHtml =
    '        <div class="note-share">\n' +
    '          <span class="note-share__label">share</span>\n' +
    '          <a href="https://x.com/intent/tweet?url=' + encodeURIComponent(shareUrl) + '&amp;text=' + encodeURIComponent(title) + '" class="note-share__btn" target="_blank" rel="noopener noreferrer" aria-label="Share on X">\n' +
    '            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>\n' +
    '          </a>\n' +
    '          <a href="https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(shareUrl) + '" class="note-share__btn" target="_blank" rel="noopener noreferrer" aria-label="Share on Facebook">\n' +
    '            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8.25h2.75L16.75 9h-3.25V6.75c0-1.031.281-1.75 1.75-1.75h1.75V2.125A23.74 23.74 0 0 0 14.438 2C11.719 2 9.75 3.656 9.75 6.688V9H7v3.75h2.75V21h3.75Z"/></svg>\n' +
    '          </a>\n' +
    '          <a href="https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl) + '" class="note-share__btn" target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn">\n' +
    '            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.448 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>\n' +
    '          </a>\n' +
    '        </div>\n';

  var pageHtml = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <meta name="description" content="' + escapeHtml(excerpt) + '">\n' +
    '  <meta name="author" content="Umaru Biango">\n' +
    '  <meta property="og:title" content="' + escapeHtml(title) + ' — Umaru Biango">\n' +
    '  <meta property="og:description" content="' + escapeHtml(excerpt) + '">\n' +
    '  <meta property="og:type" content="article">\n' +
    '  <meta property="og:url" content="' + SITE_URL + '/notes/' + encodeURIComponent(slug) + '/">\n' +
    '  <meta property="og:site_name" content="Umaru Biango">\n' +
    '  <meta property="og:locale" content="en_US">\n' +
    articleMetaHtml +
    (socialImageUrl ? ('  <meta property="og:image" content="' + escapeHtml(socialImageUrl) + '">\n') : '') +
    (socialImageUrl ? ('  <meta property="og:image:url" content="' + escapeHtml(socialImageUrl) + '">\n') : '') +
    (socialImageUrl ? ('  <meta property="og:image:secure_url" content="' + escapeHtml(socialImageUrl) + '">\n') : '') +
    (socialImageUrl ? ('  <meta property="og:image:alt" content="' + escapeHtml(featuredImageAlt) + '">\n') : '') +
    (socialImageUrl && featuredImageWidth  ? ('  <meta property="og:image:width" content="' + featuredImageWidth + '">\n') : '') +
    (socialImageUrl && featuredImageHeight ? ('  <meta property="og:image:height" content="' + featuredImageHeight + '">\n') : '') +
    (socialImageType ? ('  <meta property="og:image:type" content="' + socialImageType + '">\n') : '') +
    '  <meta name="twitter:card" content="' + (featuredImageUrl ? 'summary_large_image' : 'summary') + '">\n' +
    '  <meta name="twitter:title" content="' + escapeHtml(title) + ' — Umaru Biango">\n' +
    '  <meta name="twitter:description" content="' + escapeHtml(excerpt) + '">\n' +
    (socialImageUrl ? ('  <meta name="twitter:image" content="' + escapeHtml(socialImageUrl) + '">\n') : '') +
    '  <link rel="canonical" href="' + SITE_URL + '/notes/' + encodeURIComponent(slug) + '/">\n' +
    '  <link rel="stylesheet" href="../../assets/css/main.css">\n' +
    '  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/prismjs@1.29.0/themes/prism-tomorrow.min.css">\n' +
    '  <title>' + escapeHtml(title) + ' — Umaru Biango</title>\n' +
    '</head>\n' +
    '<body>\n' +
    '  <a href="#main" class="skip-link">Skip to content</a>\n' +
    '  <nav class="site-nav" aria-label="Main navigation">\n' +
    '    <div class="page-wrapper">\n' +
    '      <a href="../../index.html" class="nav-logo">ub://</a>\n' +
    '      <button class="nav-toggle" aria-expanded="false" aria-controls="nav-links" aria-label="Toggle navigation">\n' +
    '        <span></span><span></span><span></span>\n' +
    '      </button>\n' +
    '      <ul class="nav-links" id="nav-links" role="list">\n' +
    '        <li><a href="../../index.html">home</a></li>\n' +
    '        <li><a href="../../notes.html" aria-current="page">notes</a></li>\n' +
    '        <li><a href="../../how-i-think.html">how i think</a></li>\n' +
    '        <li><a href="../../now.html">now</a></li>\n' +
    '        <li><a href="../../contact.html">contact</a></li>\n' +
    '      </ul>\n' +
    '    </div>\n' +
    '  </nav>\n' +
    '  <main id="main" tabindex="-1">\n' +
    '    <div class="page-wrapper">\n' +
    '      <a class="note-view__back" aria-label="Back to notes list" href="../../notes.html">notes</a>\n' +
    '      <article>\n' +
    '        <header class="note-view__header">\n' +
    '          <h1 class="note-view__title">' + escapeHtml(title) + '</h1>\n' +
    '          <div class="note-view__meta">\n' +
    '            <span>' + escapeHtml(date) + '</span>\n' +
    '          </div>\n' +
    '        </header>\n' +
    featuredImageHtml +
    '        <div class="note-body">' + htmlBody + '</div>\n' +
    newsletterHtml +
    (tagsHtml ? ('        <div class="note-footer-tags"><span class="note-view__tags">' + tagsHtml + '</span></div>\n') : '') +
    shareHtml +
    postNavHtml +
    '      </article>\n' +
    '    </div>\n' +
    '  </main>\n' +
    '  <footer class="site-footer">\n' +
    '    <div class="page-wrapper">\n' +
    '      <a href="mailto:hello@umarubiango.com">hello@umarubiango.com</a>\n' +
    '      <div class="footer-social" aria-label="Social links" role="group">\n' +
    '        <a href="https://github.com/SUBiango" target="_blank" rel="noopener noreferrer" aria-label="GitHub">\n' +
    '          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 .5C5.648.5.5 5.648.5 12c0 5.084 3.292 9.395 7.863 10.916.575.106.787-.25.787-.556 0-.275-.012-1.188-.018-2.154-3.2.694-3.875-1.356-3.875-1.356-.525-1.337-1.281-1.694-1.281-1.694-1.05-.719.081-.706.081-.706 1.163.081 1.775 1.194 1.775 1.194 1.031 1.769 2.706 1.256 3.366.962.106-.75.406-1.256.737-1.544-2.556-.287-5.244-1.275-5.244-5.675 0-1.256.45-2.281 1.188-3.087-.119-.294-.519-1.475.112-3.075 0 0 .969-.313 3.175 1.181a11.067 11.067 0 0 1 5.775 0c2.206-1.494 3.175-1.181 3.175-1.181.631 1.6.231 2.781.112 3.075.738.806 1.188 1.831 1.188 3.087 0 4.412-2.694 5.381-5.263 5.662.419.363.794 1.075.794 2.169 0 1.569-.013 2.831-.013 3.213 0 .306.206.669.794.556A11.508 11.508 0 0 0 23.5 12c0-6.352-5.148-11.5-11.5-11.5Z"/></svg>\n' +
    '        </a>\n' +
    '        <a href="https://www.facebook.com/umaru.biango" target="_blank" rel="noopener noreferrer" aria-label="Facebook">\n' +
    '          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.5 21v-8.25h2.75L16.75 9h-3.25V6.75c0-1.031.281-1.75 1.75-1.75h1.75V2.125A23.74 23.74 0 0 0 14.438 2C11.719 2 9.75 3.656 9.75 6.688V9H7v3.75h2.75V21h3.75Z"/></svg>\n' +
    '        </a>\n' +
    '        <a href="https://www.instagram.com/umarubiango/" target="_blank" rel="noopener noreferrer" aria-label="Instagram">\n' +
    '          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7.75 2h8.5A5.756 5.756 0 0 1 22 7.75v8.5A5.756 5.756 0 0 1 16.25 22h-8.5A5.756 5.756 0 0 1 2 16.25v-8.5A5.756 5.756 0 0 1 7.75 2Zm8.5 1.75h-8.5A4.004 4.004 0 0 0 3.75 7.75v8.5a4.004 4.004 0 0 0 4 4h8.5a4.004 4.004 0 0 0 4-4v-8.5a4.004 4.004 0 0 0-4-4Zm-4.25 2.5A5.75 5.75 0 1 1 6.25 12 5.756 5.756 0 0 1 12 6.25Zm0 1.75A4 4 0 1 0 16 12a4.004 4.004 0 0 0-4-4Zm6-2.125a1.125 1.125 0 1 1-1.125 1.125A1.125 1.125 0 0 1 18 5.875Z"/></svg>\n' +
    '        </a>\n' +
    '      </div>\n' +
    '      <p>&copy; 2026 Umaru S. Biango</p>\n' +
    '    </div>\n' +
    '  </footer>\n' +
    '  <script src="https://cdn.jsdelivr.net/combine/npm/prismjs@1.29.0/prism.min.js,npm/prismjs@1.29.0/components/prism-javascript.min.js,npm/prismjs@1.29.0/components/prism-python.min.js,npm/prismjs@1.29.0/components/prism-markup.min.js,npm/prismjs@1.29.0/components/prism-css.min.js,npm/prismjs@1.29.0/components/prism-sql.min.js"></script>\n' +
    '  <script src="../../assets/js/terminal.js"></script>\n' +
    '  <script src="../../assets/js/note-page.js"></script>\n' +
    '</body>\n' +
    '</html>\n';

  var outputDir = path.join(NOTES_DIR, slug);
  fs.mkdirSync(outputDir, { recursive: true });
  fs.writeFileSync(path.join(outputDir, 'index.html'), pageHtml);
});

console.log('[generate:notes] Generated ' + markdownFiles.length + ' note page(s).');

function toExcerpt(markdown) {
  var text = String(markdown || '')
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`\[\]\(\)-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return text.slice(0, 160);
}

function formatDate(value) {
  if (!value) return '';
  var d = value instanceof Date ? value : new Date(String(value));
  if (isNaN(d.getTime())) return String(value);
  return d.toISOString().slice(0, 10);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function toAbsoluteUrl(url) {
  if (!url) return '';
  if (/^https?:\/\//i.test(url)) return url;
  return SITE_URL + (url.charAt(0) === '/' ? url : '/' + url);
}

function toSocialImageUrl(imageUrl) {
  if (!imageUrl) return '';
  var fallback = findSocialImageFallback(imageUrl);
  return toAbsoluteUrl(fallback || imageUrl);
}

function toSortTimestamp(value) {
  if (!value) return 0;
  var d = value instanceof Date ? value : new Date(String(value));
  return isNaN(d.getTime()) ? 0 : d.getTime();
}

function toIsoDateTime(value) {
  if (!value) return '';
  var d = value instanceof Date ? value : new Date(String(value));
  if (isNaN(d.getTime())) return '';
  return d.toISOString();
}

function buildArticleMetaHtml(fm, tags) {
  var lines = [];
  var publishedTime = toIsoDateTime(fm.date);

  if (publishedTime) {
    lines.push('  <meta property="article:published_time" content="' + escapeHtml(publishedTime) + '">');
  }

  lines.push('  <meta property="article:author" content="' + SITE_URL + '/">');
  lines.push('  <meta property="article:section" content="Notes">');

  tags.forEach(function(tag) {
    lines.push('  <meta property="article:tag" content="' + escapeHtml(tag) + '">');
  });

  return lines.length ? lines.join('\n') + '\n' : '';
}

function findSocialImageFallback(imageUrl) {
  if (!/\.webp(?:$|[?#])/i.test(imageUrl)) return '';
  if (/^https?:\/\//i.test(imageUrl)) return '';

  var cleanUrl = String(imageUrl).split(/[?#]/)[0];
  var normalized = cleanUrl.charAt(0) === '/' ? cleanUrl.slice(1) : cleanUrl;
  var basePath = path.join(ROOT, normalized).replace(/\.webp$/i, '');
  var candidates = [basePath + '.jpg', basePath + '.jpeg', basePath + '.png'];

  for (var i = 0; i < candidates.length; i++) {
    if (fs.existsSync(candidates[i])) {
      return '/' + path.relative(ROOT, candidates[i]).replace(/\\/g, '/');
    }
  }

  return '';
}

function toImageMimeType(url) {
  if (/\.png(?:$|[?#])/i.test(url)) return 'image/png';
  if (/\.gif(?:$|[?#])/i.test(url)) return 'image/gif';
  if (/\.webp(?:$|[?#])/i.test(url)) return 'image/webp';
  return 'image/jpeg';
}

function buildPostNavHtml(sorted, currentSlug) {
  var index = sorted.findIndex(function(note) { return note.slug === currentSlug; });
  if (index === -1) return '';

  var newer = index > 0 ? sorted[index - 1] : null;
  var older = index < sorted.length - 1 ? sorted[index + 1] : null;
  if (!newer && !older) return '';

  var html = '        <nav class="note-post-nav" aria-label="Post navigation">\n';
  if (older) {
    html += '          <a class="note-post-nav__prev" href="../' + encodeURIComponent(older.slug) + '/"><span class="note-post-nav__label">← previous post</span><span class="note-post-nav__title">' + escapeHtml(older.title || older.slug) + '</span></a>\n';
  }
  if (newer) {
    html += '          <a class="note-post-nav__next" href="../' + encodeURIComponent(newer.slug) + '/"><span class="note-post-nav__label">next post →</span><span class="note-post-nav__title">' + escapeHtml(newer.title || newer.slug) + '</span></a>\n';
  }
  html += '        </nav>\n';
  return html;
}
