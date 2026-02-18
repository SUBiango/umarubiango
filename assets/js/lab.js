/**
 * lab.js — Lab page
 * Fetches all category JSON files in parallel and renders
 * collapsible terminal-style sections.
 */

'use strict';

var LAB_CATEGORIES = [
  { key: 'experiments',  label: 'experiments',  file: 'data/lab/experiments.json'  },
  { key: 'architecture', label: 'architecture',  file: 'data/lab/architecture.json' },
  { key: 'insights',     label: 'insights',      file: 'data/lab/insights.json'     },
  { key: 'failures',     label: 'failures',      file: 'data/lab/failures.json'     },
];

document.addEventListener('DOMContentLoaded', function() {
  initNav();
  loadLab();
});

function loadLab() {
  var container = document.getElementById('lab-content');
  if (!container) return;

  var fetches = LAB_CATEGORIES.map(function(cat) {
    return fetch(cat.file)
      .then(function(res) {
        if (!res.ok) throw new Error('Failed: ' + cat.file);
        return res.json();
      })
      .then(function(entries) {
        return { cat: cat, entries: entries };
      })
      .catch(function() {
        return { cat: cat, entries: null };
      });
  });

  Promise.all(fetches).then(function(results) {
    container.innerHTML = '';
    results.forEach(function(result) {
      container.appendChild(renderCategory(result.cat, result.entries));
    });
    // Syntax highlight any code blocks
    if (window.Prism) Prism.highlightAll();
  });
}

function renderCategory(cat, entries) {
  var section = document.createElement('section');
  section.className = 'lab-category';
  section.setAttribute('aria-labelledby', 'cat-' + cat.key);

  // Category header (collapsible)
  var header = document.createElement('div');
  header.className = 'lab-category__header';
  header.setAttribute('role', 'button');
  header.setAttribute('tabindex', '0');
  header.setAttribute('aria-expanded', 'true');
  header.setAttribute('aria-controls', 'cat-body-' + cat.key);

  var title = document.createElement('h2');
  title.id = 'cat-' + cat.key;
  title.innerHTML =
    '<span class="t-prompt" aria-hidden="true">&gt;</span> ' +
    'ls lab/' + escapeHtml(cat.label) + '/';

  var toggle = document.createElement('span');
  toggle.className = 'lab-category__toggle';
  toggle.setAttribute('aria-hidden', 'true');
  toggle.textContent = '[collapse]';

  header.appendChild(title);
  header.appendChild(toggle);
  section.appendChild(header);

  // Category body
  var body = document.createElement('div');
  body.id = 'cat-body-' + cat.key;

  if (!entries) {
    var errMsg = document.createElement('p');
    errMsg.className = 'state-error';
    errMsg.textContent = 'Could not load ' + cat.label + ' entries.';
    body.appendChild(errMsg);
  } else if (entries.length === 0) {
    var emptyMsg = document.createElement('p');
    emptyMsg.className = 'u-text-muted u-mono';
    emptyMsg.style.fontSize = 'var(--font-size-sm)';
    emptyMsg.textContent = 'No entries yet.';
    body.appendChild(emptyMsg);
  } else {
    entries.forEach(function(entry) {
      body.appendChild(renderEntry(entry));
    });
  }

  section.appendChild(body);

  // Toggle expand/collapse
  function toggleCategory() {
    var isExpanded = header.getAttribute('aria-expanded') === 'true';
    header.setAttribute('aria-expanded', isExpanded ? 'false' : 'true');
    body.style.display = isExpanded ? 'none' : '';
    toggle.textContent = isExpanded ? '[expand]' : '[collapse]';
  }

  header.addEventListener('click', toggleCategory);
  header.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleCategory();
    }
  });

  return section;
}

function renderEntry(entry) {
  var el = document.createElement('article');
  el.className = 'lab-entry';

  // Summary row (clickable)
  var summary = document.createElement('div');
  summary.className = 'lab-entry__summary';
  summary.setAttribute('role', 'button');
  summary.setAttribute('tabindex', '0');
  summary.setAttribute('aria-expanded', 'false');

  var titleEl = document.createElement('span');
  titleEl.className = 'lab-entry__title';
  titleEl.textContent = entry.title;

  var statusEl = document.createElement('span');
  statusEl.className = 'lab-entry__status lab-entry__status--' + (entry.status || 'archived');
  statusEl.textContent = entry.status || '';

  summary.appendChild(titleEl);
  summary.appendChild(statusEl);

  // Body (collapsed by default)
  var bodyEl = document.createElement('div');
  bodyEl.className = 'lab-entry__body';

  // Stack tags
  if (entry.stack && entry.stack.length) {
    var stackEl = document.createElement('div');
    stackEl.className = 'lab-entry__stack';
    entry.stack.forEach(function(tech) {
      var tag = document.createElement('span');
      tag.textContent = tech;
      stackEl.appendChild(tag);
    });
    bodyEl.appendChild(stackEl);
  }

  // Description (supports code blocks via Prism after render)
  if (entry.description) {
    var descEl = document.createElement('div');
    descEl.className = 'note-body';
    descEl.innerHTML = parseSimpleMarkdown(entry.description);
    bodyEl.appendChild(descEl);
  }

  // Lesson
  if (entry.lesson) {
    var lessonEl = document.createElement('p');
    lessonEl.className = 'lab-entry__lesson';
    lessonEl.textContent = 'lesson: ' + entry.lesson;
    bodyEl.appendChild(lessonEl);
  }

  el.appendChild(summary);
  el.appendChild(bodyEl);

  // Toggle expand/collapse
  function toggleEntry() {
    var isOpen = bodyEl.classList.toggle('is-open');
    summary.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    if (isOpen && window.Prism) Prism.highlightAllUnder(bodyEl);
  }

  summary.addEventListener('click', toggleEntry);
  summary.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleEntry();
    }
  });

  return el;
}

/**
 * Minimal Markdown → HTML for lab entry descriptions.
 * Handles: fenced code blocks, paragraphs.
 * Full Markdown (notes) uses Marked.js instead.
 */
function parseSimpleMarkdown(text) {
  // Fenced code blocks
  text = text.replace(/```(\w*)\n([\s\S]*?)```/g, function(_, lang, code) {
    var cls = lang ? ' class="language-' + lang + '"' : '';
    return '<pre><code' + cls + '>' + escapeHtml(code.trim()) + '</code></pre>';
  });

  // Paragraphs (double newline → <p>)
  text = text.split(/\n\n+/).map(function(p) {
    p = p.trim();
    if (p.startsWith('<pre>')) return p;
    return '<p>' + p.replace(/\n/g, '<br>') + '</p>';
  }).join('\n');

  return text;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
