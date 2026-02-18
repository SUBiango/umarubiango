/**
 * notes.js — Notes page
 * Handles list view, full note rendering (Markdown via Marked.js),
 * hash-based routing, and newsletter form injection.
 */

'use strict';

var NOTES_INDEX = 'data/notes-index.json';
var NOTES = [];
var SELECTED_TAG = '';
var NOTES_PAGE_URL = new URL('/notes.html', window.location.origin).toString();
var DEFAULT_NOTES_TITLE = 'Notes — Umaru Biango';
var DEFAULT_NOTES_DESCRIPTION = 'Long-form notes on building in emerging markets.';
var TAG_ENRICH_CONCURRENCY = 4;

document.addEventListener('DOMContentLoaded', function() {
  initNav();
  SELECTED_TAG = getTagFromUrl();
  loadNotesList();

  // Handle browser back/forward
  window.addEventListener('hashchange', handleHash);
});

/* ============================================================
   LIST VIEW
   ============================================================ */
function loadNotesList() {
  var list = document.getElementById('notes-list');
  if (!list) return;

  fetch(NOTES_INDEX)
    .then(function(res) {
      if (!res.ok) throw new Error('Could not load notes index');
      return res.json();
    })
    .then(function(notes) {
      return enrichNotesWithLimit(notes, TAG_ENRICH_CONCURRENCY);
    })
    .then(function(notes) {
      notes.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      NOTES = notes;
      renderTagFilters();
      renderNotesList();

      // Check if we need to open a note from URL hash on load
      handleHash();
    })
    .catch(function() {
      list.innerHTML = '<li><span class="state-error u-mono">Could not load notes. Try again later.</span></li>';
    });
}

function enrichNoteWithTags(note) {
  if (note.tags && note.tags.length) return Promise.resolve(note);

  return fetch('notes/' + note.slug + '.md')
    .then(function(res) {
      if (!res.ok) throw new Error();
      return res.text();
    })
    .then(function(raw) {
      var parsed = parseFrontmatter(raw);
      note.tags = Array.isArray(parsed.frontmatter.tags) ? parsed.frontmatter.tags : [];
      return note;
    })
    .catch(function() {
      note.tags = [];
      return note;
    });
}

function enrichNotesWithLimit(notes, limit) {
  var enriched = [];
  var index = 0;
  var size = Math.max(1, limit || 1);

  function nextBatch() {
    if (index >= notes.length) return Promise.resolve(enriched);

    var batch = notes.slice(index, index + size);
    index += size;

    return Promise.all(batch.map(enrichNoteWithTags))
      .then(function(items) {
        Array.prototype.push.apply(enriched, items);
        return nextBatch();
      });
  }

  return nextBatch();
}

function renderTagFilters() {
  var filters = document.getElementById('notes-tag-filters');
  if (!filters) return;

  filters.innerHTML = '';

  var uniqueTags = {};
  NOTES.forEach(function(note) {
    (note.tags || []).forEach(function(tag) {
      uniqueTags[tag] = true;
    });
  });

  var tags = Object.keys(uniqueTags).sort();
  if (!tags.length) return;

  var allBtn = createTagButton('all', !SELECTED_TAG, function() {
    SELECTED_TAG = '';
    setTagInUrl('');
    window.location.hash = '';
    renderTagFilters();
    renderNotesList();
  });
  filters.appendChild(allBtn);

  tags.forEach(function(tag) {
    var btn = createTagButton(tag, SELECTED_TAG === tag, function() {
      SELECTED_TAG = tag;
      setTagInUrl(tag);
      renderTagFilters();
      renderNotesList();
      window.location.hash = '';
    });
    filters.appendChild(btn);
  });
}

function createTagButton(label, active, onClick) {
  var btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'notes-tag-btn' + (active ? ' is-active' : '');
  btn.textContent = label;
  btn.addEventListener('click', onClick);
  return btn;
}

function renderNotesList() {
  var list = document.getElementById('notes-list');
  if (!list) return;

  list.innerHTML = '';

  var filtered = NOTES.filter(function(note) {
    if (!SELECTED_TAG) return true;
    return (note.tags || []).indexOf(SELECTED_TAG) !== -1;
  });

  if (!filtered.length) {
    var empty = document.createElement('li');
    empty.className = 'u-text-muted u-mono';
    empty.style.fontSize = 'var(--font-size-sm)';
    empty.textContent = 'No notes for selected tag.';
    list.appendChild(empty);
    return;
  }

  filtered.forEach(function(note) {
    var li = document.createElement('li');
    var link = document.createElement('a');
    link.className = 'note-list-item';
    link.href = '#' + note.slug;
    link.setAttribute('data-slug', note.slug);

    var dateEl = document.createElement('span');
    dateEl.className = 'note-list-item__date';
    dateEl.textContent = formatDate(note.date);

    var titleEl = document.createElement('span');
    titleEl.className = 'note-list-item__title';
    titleEl.textContent = note.title;

    link.appendChild(dateEl);
    link.appendChild(titleEl);
    li.appendChild(link);
    list.appendChild(li);
  });
}

/* ============================================================
   HASH ROUTING
   ============================================================ */
function handleHash() {
  var hash = window.location.hash.slice(1); // strip #
  if (hash) {
    openNote(hash);
  } else {
    showList();
  }
}

function openNote(slug) {
  var noteFile = 'notes/' + slug + '.md';

  fetch(noteFile)
    .then(function(res) {
      if (!res.ok) throw new Error('Note not found');
      return res.text();
    })
    .then(function(raw) {
      var parsed = parseFrontmatter(raw);
      renderNote(slug, parsed.frontmatter, parsed.body);
      showNoteView();
      window.scrollTo(0, 0);
    })
    .catch(function() {
      showList();
      window.location.hash = '';
    });
}

/* ============================================================
   FRONTMATTER PARSER
   Strips YAML frontmatter from Markdown, returns { frontmatter, body }
   ============================================================ */
function parseFrontmatter(raw) {
  var frontmatter = {};
  var body = raw;

  var match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (match) {
    body = match[2];
    var lines = match[1].split('\n');
    lines.forEach(function(line) {
      var colonIdx = line.indexOf(':');
      if (colonIdx === -1) return;
      var key = line.slice(0, colonIdx).trim();
      var value = line.slice(colonIdx + 1).trim()
        .replace(/^"(.*)"$/, '$1')  // strip quotes
        .replace(/^'(.*)'$/, '$1');

      // Handle boolean-like values
      if (value === 'true')  { frontmatter[key] = true;  return; }
      if (value === 'false') { frontmatter[key] = false; return; }

      // Handle arrays like [tag1, tag2]
      if (value.startsWith('[') && value.endsWith(']')) {
        frontmatter[key] = value.slice(1, -1).split(',').map(function(t) {
          return t.trim().replace(/^["']|["']$/g, '');
        });
        return;
      }

      frontmatter[key] = value;
    });
  }

  return { frontmatter: frontmatter, body: body };
}

/* ============================================================
   RENDER NOTE
   ============================================================ */
function renderNote(slug, fm, body) {
  var article = document.getElementById('notes-article');
  if (!article) return;

  article.innerHTML = '';

  // Header
  var header = document.createElement('header');
  header.className = 'note-view__header';

  var titleEl = document.createElement('h1');
  titleEl.className = 'note-view__title';
  titleEl.textContent = fm.title || slug;
  header.appendChild(titleEl);

  var meta = document.createElement('div');
  meta.className = 'note-view__meta';

  if (fm.date) {
    var dateEl = document.createElement('span');
    dateEl.textContent = formatDate(fm.date);
    meta.appendChild(dateEl);
  }

  if (fm.tags && fm.tags.length) {
    var tagsEl = document.createElement('span');
    tagsEl.className = 'note-view__tags';
    fm.tags.forEach(function(tag) {
      var tagEl = document.createElement('span');
      tagEl.textContent = tag;
      tagsEl.appendChild(tagEl);
    });
    meta.appendChild(tagsEl);
  }

  header.appendChild(meta);
  article.appendChild(header);

  // Markdown body
  var bodyEl = document.createElement('div');
  bodyEl.className = 'note-body';

  if (window.marked) {
    marked.setOptions({ breaks: false, gfm: true });
    bodyEl.innerHTML = marked.parse(body);
  } else {
    // Fallback: plain text
    var pre = document.createElement('pre');
    pre.textContent = body;
    bodyEl.appendChild(pre);
  }

  // Lazy-load images
  bodyEl.querySelectorAll('img').forEach(function(img) {
    img.setAttribute('loading', 'lazy');
    img.style.maxWidth = '100%';
  });

  article.appendChild(bodyEl);

  // Syntax highlighting
  if (window.Prism) Prism.highlightAllUnder(bodyEl);

  // Newsletter form injection
  if (fm.send === true) {
    article.appendChild(renderNewsletterForm(slug));
  }

  // Update page title
  document.title = (fm.title || slug) + ' — Umaru Biango';
  updateSocialMeta({
    title: document.title,
    description: fm.excerpt || getTextExcerpt(body),
    url: NOTES_PAGE_URL + '#' + slug,
  });
}

/* ============================================================
   NEWSLETTER FORM
   ============================================================ */
function renderNewsletterForm(slug) {
  var wrap = document.createElement('div');
  wrap.className = 'newsletter-form';
  wrap.id = 'newsletter-wrap';

  wrap.innerHTML =
    '<div class="terminal-block" role="region" aria-label="Newsletter signup">' +
      '<span class="terminal-line">' +
        '<span class="t-prompt" aria-hidden="true">&gt;</span>' +
        ' <span class="t-cmd">want_more</span>' +
      '</span>' +
      '<span class="t-out">I send long-form reflections when they\'re worth reading.</span>' +
    '</div>' +
    '<form name="newsletter" method="POST" data-netlify="true" id="newsletter-form" novalidate>' +
      '<input type="hidden" name="form-name" value="newsletter">' +
      '<input type="hidden" name="form-type" value="newsletter">' +
      '<input type="hidden" name="note_slug" value="' + escapeHtml(slug) + '">' +
      '<div class="form-row">' +
        '<label for="newsletter-email" class="u-sr-only">Email address</label>' +
        '<input type="email" id="newsletter-email" name="email" placeholder="enter_email" required autocomplete="email">' +
        '<button type="submit" class="form-submit-inline">subscribe</button>' +
      '</div>' +
    '</form>' +
    '<div id="newsletter-success" aria-live="polite" style="display:none;">' +
      '<div class="terminal-block" role="region" aria-label="Subscription confirmed">' +
        '<span class="terminal-line">' +
          '<span class="t-prompt" aria-hidden="true">&gt;</span>' +
          ' <span class="t-cmd">subscribed</span>' +
        '</span>' +
        '<span class="t-out">you\'re in. I\'ll write when it\'s worth it.</span>' +
      '</div>' +
    '</div>' +
    '<div id="newsletter-error" aria-live="polite" style="display:none;">' +
      '<div class="terminal-block" role="region" aria-label="Subscription error">' +
        '<span class="terminal-line">' +
          '<span class="t-prompt" aria-hidden="true">&gt;</span>' +
          ' <span class="t-cmd">subscribe_failed</span>' +
        '</span>' +
        '<span class="t-out newsletter-error-message">Could not subscribe. Please try again.</span>' +
      '</div>' +
    '</div>';

  // Wire up form submission
  setTimeout(function() {
    var form = document.getElementById('newsletter-form');
    var successEl = document.getElementById('newsletter-success');
    var errorEl = document.getElementById('newsletter-error');
    if (!form) return;

    function showError(message) {
      if (!errorEl) return;
      var messageEl = errorEl.querySelector('.newsletter-error-message');
      if (messageEl) messageEl.textContent = message;
      errorEl.style.display = 'block';
    }

    form.addEventListener('submit', function(e) {
      e.preventDefault();
      if (errorEl) errorEl.style.display = 'none';
      var data = new FormData(form);
      fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data).toString(),
      })
        .then(function(res) {
          if (res.ok) {
            form.style.display = 'none';
            if (successEl) {
              successEl.style.display = 'block';
              successEl.focus();
            }
          } else {
            if (res.status === 404) {
              showError('Subscription endpoint not found. Deploy on Netlify with Forms enabled.');
              return;
            }
            showError('Could not subscribe. Please try again.');
          }
        })
        .catch(function() {
          showError('Could not subscribe. Please try again.');
        });
    });
  }, 0);

  return wrap;
}

/* ============================================================
   VIEW SWITCHING
   ============================================================ */
function showNoteView() {
  var listView = document.getElementById('notes-list-view');
  var noteView = document.getElementById('notes-note-view');
  if (listView) listView.classList.add('is-hidden');
  if (noteView) noteView.classList.add('is-visible');

  // Wire back button
  var backBtn = document.getElementById('notes-back-btn');
  if (backBtn) {
    backBtn.onclick = function() {
      window.location.hash = '';
    };
  }
}

function showList() {
  var listView = document.getElementById('notes-list-view');
  var noteView = document.getElementById('notes-note-view');
  if (listView) listView.classList.remove('is-hidden');
  if (noteView) noteView.classList.remove('is-visible');
  document.title = DEFAULT_NOTES_TITLE;
  updateSocialMeta({
    title: DEFAULT_NOTES_TITLE,
    description: DEFAULT_NOTES_DESCRIPTION,
    url: NOTES_PAGE_URL,
  });
}

/* ============================================================
   HELPERS
   ============================================================ */
function formatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toISOString().slice(0, 10); // YYYY-MM-DD
}

function getTagFromUrl() {
  var params = new URLSearchParams(window.location.search);
  return params.get('tag') || '';
}

function setTagInUrl(tag) {
  var params = new URLSearchParams(window.location.search);
  if (tag) {
    params.set('tag', tag);
  } else {
    params.delete('tag');
  }

  var query = params.toString();
  var next = window.location.pathname + (query ? '?' + query : '') + window.location.hash;
  window.history.replaceState(null, '', next);
}

function updateSocialMeta(meta) {
  setMeta('meta[property="og:title"]', meta.title);
  setMeta('meta[property="og:description"]', meta.description);
  setMeta('meta[property="og:url"]', meta.url);
  setMeta('meta[name="twitter:title"]', meta.title);
  setMeta('meta[name="twitter:description"]', meta.description);
}

function setMeta(selector, content) {
  var el = document.querySelector(selector);
  if (el) el.setAttribute('content', content);
}

function getTextExcerpt(markdown) {
  if (!markdown) return DEFAULT_NOTES_DESCRIPTION;

  var text = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#*_>`\[\]\(\)-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!text) return DEFAULT_NOTES_DESCRIPTION;

  var limit = 160;
  if (text.length <= limit) return text;

  var slice = text.slice(0, limit);
  var lastSpace = slice.lastIndexOf(' ');
  var fragment = lastSpace > 0 ? slice.slice(0, lastSpace) : slice;
  fragment = fragment.replace(/[\s\.,;:!?-]+$/g, '');

  return (fragment || slice).trim() + '…';
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
