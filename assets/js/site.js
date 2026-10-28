/**
 * site.js — the only script on the site, and nothing you need to read a note
 * depends on it. Every page renders fully without JavaScript; the forms POST
 * normally to Netlify Forms if this file never loads.
 *
 * It does three things:
 *   1. submits the subscribe slip without a page reload
 *   2. validates and submits the contact form
 *   3. forwards legacy notes.html#slug links to notes/<slug>/
 */

'use strict';

(function() {
  var EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  document.addEventListener('DOMContentLoaded', function() {
    forwardLegacyNoteLinks();
    document.querySelectorAll('[data-subscribe]').forEach(initSubscribe);
    document.querySelectorAll('[data-contact]').forEach(initContact);
  });

  /* ---------------------------------------------------------------------- */

  function initSubscribe(form) {
    form.addEventListener('submit', function(event) {
      var email = form.querySelector('input[type="email"]');
      if (!email || !EMAIL.test(email.value.trim())) return; // let the browser complain

      event.preventDefault();
      setBusy(form, true);

      post(form).then(function(ok) {
        if (!ok) {
          setBusy(form, false);
          say(form, 'That did not send. Email hello@umarubiango.com instead?', true);
          return;
        }
        var slip = form.closest('.slip') || form.parentNode;
        form.remove();
        var done = document.createElement('p');
        done.className = 'form-done';
        done.setAttribute('role', 'status');
        done.textContent = "you're on the list. see you next month.";
        slip.appendChild(done);
      });
    });
  }

  /* ---------------------------------------------------------------------- */

  function initContact(form) {
    var fields = ['name', 'email', 'message'].map(function(id) {
      return form.querySelector('#' + id);
    }).filter(Boolean);

    fields.forEach(function(field) {
      field.addEventListener('blur', function() { validate(field); });
      field.addEventListener('input', function() { showError(field, true); });
    });

    form.addEventListener('submit', function(event) {
      event.preventDefault();

      var invalid = fields.filter(function(field) { return !validate(field); });
      if (invalid.length) {
        invalid[0].focus();
        return;
      }

      setBusy(form, true);
      post(form).then(function(ok) {
        if (!ok) {
          setBusy(form, false);
          say(form, 'That did not send. Email hello@umarubiango.com instead?', true);
          return;
        }
        var parent = form.parentNode;
        form.remove();
        var done = document.createElement('p');
        done.className = 'form-done';
        done.setAttribute('role', 'status');
        done.textContent = "got it. i'll be in touch.";
        parent.appendChild(done);
      });
    });
  }

  function validate(field) {
    var value = field.value.trim();
    var ok = field.type === 'email' ? EMAIL.test(value) : value !== '';
    showError(field, ok);
    return ok;
  }

  function showError(field, ok) {
    var error = document.getElementById(field.id + '-error');
    if (error) error.hidden = ok;
    field.setAttribute('aria-invalid', ok ? 'false' : 'true');
  }

  /* ---------------------------------------------------------------------- */

  /** Netlify Forms takes a urlencoded POST to the page's own path. */
  function post(form) {
    return fetch(form.getAttribute('action') || '/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams(new FormData(form)).toString(),
    }).then(function(response) {
      return response.ok;
    }).catch(function() {
      return false;
    });
  }

  function setBusy(form, busy) {
    var button = form.querySelector('button[type="submit"]');
    if (!button) return;
    button.disabled = busy;
    if (busy) {
      button.dataset.label = button.textContent;
      button.textContent = 'sending…';
    } else if (button.dataset.label) {
      button.textContent = button.dataset.label;
    }
  }

  function say(form, message, isError) {
    var existing = form.querySelector('.form-note');
    if (existing) existing.remove();

    var note = document.createElement('p');
    note.className = 'form-note' + (isError ? ' is-error' : '');
    note.setAttribute('role', 'status');
    note.textContent = message;
    form.appendChild(note);
  }

  /* ---------------------------------------------------------------------- */

  /** Notes used to live at notes.html#slug. Those links still work. */
  function forwardLegacyNoteLinks() {
    if (!/\/notes\.html$/.test(window.location.pathname)) return;

    var hash = window.location.hash.slice(1);
    if (!hash) return;

    var slug;
    try {
      slug = decodeURIComponent(hash);
    } catch (e) {
      slug = hash;
    }
    window.location.replace('/notes/' + encodeURIComponent(slug) + '/');
  }
})();
