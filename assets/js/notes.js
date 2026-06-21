/**
 * notes.js — Notes index page
 * Fetches data/notes-index.json, renders the filterable list, and
 * redirects legacy hash URLs (#slug) to the generated static page at notes/<slug>/.
 */

'use strict';

var NOTES_INDEX = 'data/notes-index.json';
var NOTES = [];
var SELECTED_TAG = '';

document.addEventListener('DOMContentLoaded', function() {
  initNav();
  SELECTED_TAG = getTagFromUrl();
  loadNotesList();

  window.addEventListener('hashchange', handleHash);
});

function loadNotesList() {
  var list = document.getElementById('notes-list');
  if (!list) return;

  fetch(NOTES_INDEX)
    .then(function(res) {
      if (!res.ok) throw new Error('Could not load notes index');
      return res.json();
    })
    .then(function(notes) {
      notes.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });

      NOTES = notes;
      renderTagFilters();
      renderNotesList();
      handleHash();
    })
    .catch(function() {
      list.innerHTML = '<li><span class="state-error u-mono">Could not load notes. Try again later.</span></li>';
    });
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
    link.href = getCanonicalNotePath(note.slug);
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

/* Legacy: redirect notes.html#slug → notes/slug/ */
function handleHash() {
  var hash = window.location.hash.slice(1);
  if (!hash) return;

  var slug = hash;
  try {
    slug = decodeURIComponent(hash);
  } catch (e) {
    slug = hash;
  }
  window.location.replace(getCanonicalNotePath(slug));
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  var d = new Date(dateStr + 'T00:00:00');
  return d.toISOString().slice(0, 10);
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

function getCanonicalNotePath(slug) {
  return 'notes/' + encodeURIComponent(slug) + '/';
}
