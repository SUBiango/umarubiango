/**
 * now.js — Now page
 * Fetches data/now.json and renders terminal-style output.
 */

'use strict';

document.addEventListener('DOMContentLoaded', function() {
  initNav();
  loadNow();
});

function loadNow() {
  var terminal = document.getElementById('now-terminal');
  if (!terminal) return;

  fetch('data/now.json')
    .then(function(res) {
      if (!res.ok) throw new Error('Failed to load now.json');
      return res.json();
    })
    .then(function(data) {
      renderTerminalBlock(terminal, [
        {
          cmd: 'currently',
          output: [
            { key: 'working on', value: data.working_on },
            { key: 'learning',   value: data.learning },
            { key: 'reading',    value: data.reading },
          ],
        },
        {
          cmd: 'last_updated',
          output: [data.updated],
        },
      ]);
    })
    .catch(function() {
      terminal.innerHTML = '';
      var err = document.createElement('span');
      err.className = 'state-error u-mono';
      err.textContent = '> error: could not load status. check back soon.';
      terminal.appendChild(err);
    });
}
