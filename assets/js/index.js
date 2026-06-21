/**
 * index.js — Homepage
 * Handles typewriter hero animation, Now preview, and Notes preview.
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
  initNav();
  runHero();
  loadNowPreview();
  loadNotesPreview();
  initScrollAnimations();
});

/* ============================================================
   HERO TYPEWRITER
   ============================================================ */
function runHero() {
  var el = document.getElementById('hero-terminal');
  if (!el) return;

  // Check if user has seen the animation before
  var hasSeenAnimation = false;
  try {
    hasSeenAnimation = localStorage.getItem('ub-hero-seen');
  } catch (e) {
    // Ignore storage errors
  }
  
  var lines = [
    {
      cmd: 'whoami',
      output: 'Umaru S. Biango',
    },
    {
      cmd: 'role',
      output: 'Developer. Product Builder.',
    },
    {
      cmd: 'thesis',
      output: 'Useful, reliable software for emerging markets.',
    },
  ];

  // Speed up animation for returning visitors
  var speed = hasSeenAnimation ? { charSpeed: 15, lineDelay: 80, blockDelay: 150 } : { charSpeed: 45, lineDelay: 180, blockDelay: 350 };

  typewriter(el, lines, {
    charSpeed: speed.charSpeed,
    lineDelay: speed.lineDelay,
    blockDelay: speed.blockDelay,
    onDone: function() {
      // Add blinking cursor at the end
      var lastLine = document.createElement('span');
      lastLine.className = 'terminal-line';
      lastLine.innerHTML =
        '<span class="t-prompt" aria-hidden="true">&gt;</span>';
      terminalCursor(lastLine);
      el.appendChild(lastLine);
      
      // Mark as seen
      try {
        localStorage.setItem('ub-hero-seen', 'true');
      } catch (e) {
        // Ignore storage errors
      }
    },
  });
}

/* ============================================================
   NOW PREVIEW
   ============================================================ */
function loadNowPreview() {
  var container = document.getElementById('now-preview');
  if (!container) return;

  fetchWithRetry('data/now.json', 2)
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to load');
      return res.json();
    })
    .then(function(data) {
      renderTerminalBlock(container, [
        {
          cmd: 'currently',
          output: [
            { key: 'working on', value: data.working_on },
            { key: 'learning',   value: data.learning },
            { key: 'reading',    value: data.reading },
          ],
        },
      ]);
    })
    .catch(function(err) {
      container.innerHTML = '';
      var errEl = document.createElement('span');
      errEl.className = 'state-error u-mono';
      errEl.textContent = 'Could not load status.';
      container.appendChild(errEl);
      if (console && console.error) console.error('Now preview error:', err);
    });
}

/* ============================================================
   NOTES PREVIEW
   ============================================================ */
function loadNotesPreview() {
  var container = document.getElementById('notes-preview');
  if (!container) return;

  fetchWithRetry('data/notes-index.json', 2)
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to load');
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

        if (entry.excerpt) {
          var excerpt = document.createElement('div');
          excerpt.className = 'preview-item__excerpt';
          excerpt.textContent = entry.excerpt;
          item.appendChild(excerpt);
        }

        list.appendChild(item);
      });

      container.appendChild(list);
    })
    .catch(function(err) {
      container.innerHTML = '';
      var errEl = document.createElement('span');
      errEl.className = 'state-error u-mono';
      errEl.style.fontSize = 'var(--font-size-sm)';
      errEl.textContent = 'Could not load notes preview.';
      container.appendChild(errEl);
      if (console && console.error) console.error('Notes preview error:', err);
    });
}

/* ============================================================
   FETCH WITH RETRY
   ============================================================ */
function fetchWithRetry(url, retries) {
  return fetch(url).catch(function(err) {
    if (retries > 0) {
      return new Promise(function(resolve) {
        setTimeout(function() {
          resolve(fetchWithRetry(url, retries - 1));
        }, 1000);
      });
    }
    throw err;
  });
}

/* ============================================================
   SCROLL ENTRANCE ANIMATIONS
   Stagger-fades .home-section elements as they enter the viewport.
   Skipped entirely when prefers-reduced-motion is set.
   ============================================================ */
function initScrollAnimations() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  var sections = document.querySelectorAll('.home-section');
  if (!sections.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  sections.forEach(function(section) {
    section.classList.add('will-animate');
    observer.observe(section);
  });
}
