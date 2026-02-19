/**
 * index.js — Homepage
 * Handles typewriter hero animation, Now preview, and Lab preview.
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
  initNav();
  runHero();
  loadNowPreview();
  loadLabPreview();
  loadNotesPreview();
});

/* ============================================================
   HERO TYPEWRITER
   ============================================================ */
function runHero() {
  var el = document.getElementById('hero-terminal');
  if (!el) return;

  var lines = [
    {
      cmd: 'whoami',
      output: 'Umaru S. Biango',
    },
    {
      cmd: 'role',
      output: 'Emerging markets product builder',
    },
    {
      cmd: 'thesis',
      output: 'Practical software products for hard markets, built in public',
    },
  ];

  typewriter(el, lines, {
    charSpeed: 45,
    lineDelay: 180,
    blockDelay: 350,
    onDone: function() {
      // Add blinking cursor at the end
      var lastLine = document.createElement('span');
      lastLine.className = 'terminal-line';
      lastLine.innerHTML =
        '<span class="t-prompt" aria-hidden="true">&gt;</span> ';
      terminalCursor(lastLine);
      el.appendChild(lastLine);
    },
  });
}

/* ============================================================
   NOW PREVIEW
   ============================================================ */
function loadNowPreview() {
  var container = document.getElementById('now-preview');
  if (!container) return;

  fetch('data/now.json')
    .then(function(res) {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(function(data) {
      renderTerminalBlock(container, [
        {
          cmd: 'currently',
          output: [
            'building:   ' + data.building,
            'learning:   ' + data.learning,
            'optimizing: ' + data.optimizing,
          ],
        },
      ]);
    })
    .catch(function() {
      container.innerHTML = '';
      var err = document.createElement('span');
      err.className = 'state-error u-mono';
      err.textContent = 'Could not load status.';
      container.appendChild(err);
    });
}

/* ============================================================
   LAB PREVIEW
   ============================================================ */
function loadLabPreview() {
  var container = document.getElementById('lab-preview');
  if (!container) return;

  // Fetch experiments first; fall back gracefully
  fetch('data/lab/experiments.json')
    .then(function(res) {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(function(entries) {
      container.innerHTML = '';

      var recent = entries.slice(0, 2);
      if (!recent.length) return;

      var list = document.createElement('div');
      list.className = 'preview-list';

      recent.forEach(function(entry) {
        var item = document.createElement('div');
        item.className = 'preview-item';

        var title = document.createElement('div');
        title.className = 'preview-item__title';
        title.textContent = entry.title;

        var meta = document.createElement('div');
        meta.className = 'preview-item__meta';
        meta.textContent = 'experiments — ' + (entry.status || '') + ' — ' + entry.date;

        item.appendChild(title);
        item.appendChild(meta);
        list.appendChild(item);
      });

      container.appendChild(list);
    })
    .catch(function() {
      container.innerHTML = '';
      var err = document.createElement('span');
      err.className = 'state-error u-mono';
      err.style.fontSize = 'var(--font-size-sm)';
      err.textContent = 'Could not load lab preview.';
      container.appendChild(err);
    });
}

/* ============================================================
   NOTES PREVIEW
   ============================================================ */
function loadNotesPreview() {
  var container = document.getElementById('notes-preview');
  if (!container) return;

  fetch('data/notes-index.json')
    .then(function(res) {
      if (!res.ok) throw new Error();
      return res.json();
    })
    .then(function(entries) {
      container.innerHTML = '';

      entries.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      var recent = entries.slice(0, 2);
      if (!recent.length) return;

      var list = document.createElement('div');
      list.className = 'preview-list';

      recent.forEach(function(entry) {
        var item = document.createElement('a');
        item.className = 'preview-item preview-item--link';
        item.href = 'notes/' + entry.slug + '/';

        var title = document.createElement('div');
        title.className = 'preview-item__title';
        title.textContent = entry.title;

        var meta = document.createElement('div');
        meta.className = 'preview-item__meta';
        meta.textContent = 'notes — ' + entry.date;

        item.appendChild(title);
        item.appendChild(meta);
        list.appendChild(item);
      });

      container.appendChild(list);
    })
    .catch(function() {
      container.innerHTML = '';
      var err = document.createElement('span');
      err.className = 'state-error u-mono';
      err.style.fontSize = 'var(--font-size-sm)';
      err.textContent = 'Could not load notes preview.';
      container.appendChild(err);
    });
}
