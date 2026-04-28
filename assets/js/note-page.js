'use strict';

document.addEventListener('DOMContentLoaded', function() {
  if (typeof initNav === 'function') {
    initNav();
  }

  if (typeof insertReadTime === 'function') {
    insertReadTime(
      document.querySelector('.note-body'),
      document.querySelector('.note-view__meta')
    );
  }

  if (typeof initShareButtons === 'function') {
    initShareButtons();
  }

  if (window.Prism) {
    Prism.highlightAll();
  }
});
