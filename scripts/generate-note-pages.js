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

markdownFiles.forEach(function(filename) {
  var sourcePath = path.join(NOTES_DIR, filename);
  var raw = fs.readFileSync(sourcePath, 'utf8');
  var parsed = matter(raw);
  var fm = parsed.data || {};
  var slug = fm.slug || filename.replace(/\.md$/, '');
  var title = fm.title || slug;
  var excerpt = fm.excerpt || toExcerpt(parsed.content);
  var date = formatDate(fm.date);
  var tags = Array.isArray(fm.tags) ? fm.tags : [];

  var htmlBody = marked.parse(parsed.content);
  htmlBody = htmlBody.replace(/^\s*<h1\b[^>]*>[\s\S]*?<\/h1>\s*/i, '');
  var tagsHtml = tags.map(function(tag) {
    return '<span>' + escapeHtml(tag) + '</span>';
  }).join('');

  var pageHtml = '<!DOCTYPE html>\n' +
    '<html lang="en">\n' +
    '<head>\n' +
    '  <meta charset="UTF-8">\n' +
    '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n' +
    '  <meta name="description" content="' + escapeHtml(excerpt) + '">\n' +
    '  <meta property="og:title" content="' + escapeHtml(title) + ' — Umaru Biango">\n' +
    '  <meta property="og:description" content="' + escapeHtml(excerpt) + '">\n' +
    '  <meta property="og:type" content="article">\n' +
    '  <meta property="og:url" content="' + SITE_URL + '/notes/' + encodeURIComponent(slug) + '/">\n' +
    '  <meta property="og:site_name" content="Umaru Biango">\n' +
    '  <meta name="twitter:card" content="summary">\n' +
    '  <meta name="twitter:title" content="' + escapeHtml(title) + ' — Umaru Biango">\n' +
    '  <meta name="twitter:description" content="' + escapeHtml(excerpt) + '">\n' +
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
    '        <li><a href="../../lab.html">lab</a></li>\n' +
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
    (tagsHtml ? ('            <span class="note-view__tags">' + tagsHtml + '</span>\n') : '') +
    '          </div>\n' +
    '        </header>\n' +
    '        <div class="note-body">' + htmlBody + '</div>\n' +
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
    '  <script>document.addEventListener("DOMContentLoaded",function(){initNav();if(window.Prism){Prism.highlightAll();}});</script>\n' +
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
