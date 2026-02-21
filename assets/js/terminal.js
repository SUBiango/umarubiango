/**
 * terminal.js — Shared terminal UI utilities
 * Used across all pages. No dependencies. No module bundler.
 *
 * Functions:
 *   typewriter(element, lines, opts)
 *   terminalCursor(element)
 *   renderTerminalBlock(container, commands)
 *   initNav()
 */

'use strict';

/* ============================================================
   REDUCED MOTION CHECK
   ============================================================ */
function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/* ============================================================
   TYPEWRITER
   Types an array of { cmd, output } objects into an element,
   one character at a time. Skips animation if reduced motion.

   @param {HTMLElement} element  - container to type into
   @param {Array}       lines    - [{ cmd: string, output: string|string[] }]
   @param {Object}      opts
     @param {number}    opts.charSpeed  - ms per character (default 40)
     @param {number}    opts.lineDelay  - ms pause after each cmd before output (default 200)
     @param {number}    opts.blockDelay - ms pause between blocks (default 400)
     @param {Function}  opts.onDone     - callback when all lines are done
   ============================================================ */
function typewriter(element, lines, opts) {
  const config = Object.assign({
    charSpeed:  40,
    lineDelay:  200,
    blockDelay: 400,
    onDone:     null,
  }, opts || {});

  // Reduced motion: render everything immediately
  if (prefersReducedMotion()) {
    element.innerHTML = '';
    lines.forEach(function(block) {
      const promptLine = document.createElement('span');
      promptLine.className = 'terminal-line';
      promptLine.innerHTML =
        '<span class="t-prompt" aria-hidden="true">&gt;</span>' +
        '<span class="t-cmd">' + escapeHtml(block.cmd) + '</span>';
      element.appendChild(promptLine);

      const outputs = Array.isArray(block.output) ? block.output : [block.output];
      outputs.forEach(function(line) {
        if (line === '') {
          element.appendChild(spacer());
        } else {
          element.appendChild(renderOutputLine(line));
        }
      });
      element.appendChild(spacer());
    });
    if (config.onDone) config.onDone();
    return;
  }

  // Animated path
  element.innerHTML = '';
  let blockIndex = 0;

  function typeBlock() {
    if (blockIndex >= lines.length) {
      if (config.onDone) config.onDone();
      return;
    }

    const block = lines[blockIndex];
    blockIndex++;

    // Render prompt line
    const promptLine = document.createElement('span');
    promptLine.className = 'terminal-line';
    element.appendChild(promptLine);

    const promptSpan = document.createElement('span');
    promptSpan.className = 't-prompt';
    promptSpan.setAttribute('aria-hidden', 'true');
    promptSpan.textContent = '>'; // Removed trailing space
    
    // Create a text node for the space to match static rendering
    // BUT since we use absolute positioning for prompt + padding for line, 
    // we don't need this space node anymore if we want perfect alignment
    // or we need to account for it. Let's remove it for now to test alignment.
    // const spaceNode = document.createTextNode(' '); 

    const cmdSpan = document.createElement('span');
    cmdSpan.className = 't-cmd';

    promptLine.appendChild(promptSpan);
    // promptLine.appendChild(spaceNode); 
    promptLine.appendChild(cmdSpan);

    // Type the command
    let charIndex = 0;
    const cmd = block.cmd;

    function typeChar() {
      if (charIndex < cmd.length) {
        cmdSpan.textContent += cmd[charIndex];
        charIndex++;
        setTimeout(typeChar, config.charSpeed);
      } else {
        // Command done — wait, then show output
        setTimeout(function() {
          const outputs = Array.isArray(block.output) ? block.output : [block.output];
          outputs.forEach(function(line) {
            if (line === '') {
              element.appendChild(spacer());
            } else {
              element.appendChild(renderOutputLine(line));
            }
          });
          element.appendChild(spacer());

          // Next block
          setTimeout(typeBlock, config.blockDelay);
        }, config.lineDelay);
      }
    }

    typeChar();
  }

  typeBlock();
}

/* ============================================================
   TERMINAL CURSOR
   Appends a blinking cursor span to an element.
   Respects prefers-reduced-motion (cursor shown static).

   @param {HTMLElement} element - element to append cursor to
   @returns {HTMLElement} the cursor span (so caller can remove it)
   ============================================================ */
function terminalCursor(element) {
  const cursor = document.createElement('span');
  cursor.className = 't-cursor';
  cursor.setAttribute('aria-hidden', 'true');
  element.appendChild(cursor);
  return cursor;
}

/* ============================================================
   RENDER TERMINAL BLOCK (static, no animation)
   Builds terminal HTML from a commands array and injects it
   into a container. Use for Now, Lab, static pages.

   @param {HTMLElement} container - target element (cleared first)
   @param {Array}       commands  - [{ cmd: string, output: string|string[] }]
   ============================================================ */
function renderTerminalBlock(container, commands) {
  container.innerHTML = '';

  commands.forEach(function(block) {
    const promptLine = document.createElement('span');
    promptLine.className = 'terminal-line';
    promptLine.innerHTML =
      '<span class="t-prompt" aria-hidden="true">&gt;</span>' +
      '<span class="t-cmd">' + escapeHtml(block.cmd) + '</span>'; // No space char here
    container.appendChild(promptLine);

    const outputs = Array.isArray(block.output) ? block.output : [block.output];
    outputs.forEach(function(line) {
      if (line === '') {
        container.appendChild(spacer());
      } else {
        container.appendChild(renderOutputLine(line));
      }
    });

    container.appendChild(spacer());
  });
}

/* ============================================================
   INIT NAV
   Handles mobile hamburger toggle.
   Call once on DOMContentLoaded on every page.
   ============================================================ */
function initNav() {
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (!toggle || !navLinks) return;

  toggle.addEventListener('click', function() {
    const isOpen = navLinks.classList.toggle('is-open');
    toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  });

  // Close nav when a link is clicked (mobile)
  navLinks.querySelectorAll('a').forEach(function(link) {
    link.addEventListener('click', function() {
      navLinks.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

/* ============================================================
   HELPERS (internal)
   ============================================================ */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function spacer() {
  const s = document.createElement('span');
  s.className = 't-spacer';
  s.setAttribute('aria-hidden', 'true');
  return s;
}

function renderOutputLine(line) {
  const outLine = document.createElement('span');
  outLine.className = 't-out';
  if (line && typeof line === 'object' && 'key' in line) {
    const keySpan = document.createElement('span');
    keySpan.className = 't-key';
    keySpan.textContent = escapeHtml(line.key) + ':';
    const valSpan = document.createElement('span');
    valSpan.className = 't-val';
    valSpan.textContent = line.value != null ? String(line.value) : '';
    outLine.appendChild(keySpan);
    outLine.appendChild(valSpan);
  } else {
    outLine.textContent = line != null ? String(line) : '';
  }
  return outLine;
}
