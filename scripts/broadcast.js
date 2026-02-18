#!/usr/bin/env node
/**
 * broadcast.js — ConvertKit broadcast sender
 *
 * Reads all .md files in notes/, finds entries where:
 *   broadcast: true  AND  sent: false
 *
 * Sends a ConvertKit broadcast for each match.
 * Does NOT write sent: true back to the file — do that manually.
 *
 * Usage:
 *   node scripts/broadcast.js           (live run)
 *   DRY_RUN=1 node scripts/broadcast.js (dry run, no API calls)
 *
 * Requires:
 *   .env with CONVERTKIT_API_KEY and CONVERTKIT_BASE_URL (optional)
 *   npm install  (installs gray-matter)
 */

'use strict';

var fs   = require('fs');
var path = require('path');

// Load .env manually (no dotenv dependency needed)
loadDotenv();

var matter;
try {
  matter = require('gray-matter');
} catch (e) {
  console.error('[broadcast] gray-matter not found. Run: npm install');
  process.exit(1);
}

var API_KEY    = process.env.CONVERTKIT_API_KEY;
var BASE_URL   = process.env.CONVERTKIT_BASE_URL || 'https://umarubiango.dev';
var NOTES_DIR  = path.join(__dirname, '..', 'notes');
var DRY_RUN    = process.env.DRY_RUN === '1';
var CK_API     = 'https://api.convertkit.com/v3';

if (!API_KEY) {
  console.error('[broadcast] Missing CONVERTKIT_API_KEY in .env');
  process.exit(1);
}

if (DRY_RUN) {
  console.log('[broadcast] DRY RUN mode — no API calls will be made\n');
}

// Read all .md files
var files;
try {
  files = fs.readdirSync(NOTES_DIR)
    .filter(function(f) { return f.endsWith('.md'); })
    .map(function(f) { return path.join(NOTES_DIR, f); });
} catch (e) {
  console.error('[broadcast] Could not read notes/ directory:', e.message);
  process.exit(1);
}

if (files.length === 0) {
  console.log('[broadcast] No notes found in notes/');
  process.exit(0);
}

// Find notes ready for broadcast
var pending = [];

files.forEach(function(filePath) {
  var raw = fs.readFileSync(filePath, 'utf8');
  var parsed = matter(raw);
  var fm = parsed.data;
  var filename = path.basename(filePath);

  if (fm.broadcast === true && fm.sent !== true) {
    pending.push({
      file:    filename,
      slug:    fm.slug || slugFromFilename(filename),
      title:   fm.title || filename,
      excerpt: fm.excerpt || '',
      url:     BASE_URL + '/notes.html#' + (fm.slug || slugFromFilename(filename)),
    });
  } else {
    var reason = fm.sent === true ? 'already sent' : 'broadcast not set';
    console.log('[skipped] ' + filename + ' (' + reason + ')');
  }
});

if (pending.length === 0) {
  console.log('\n[broadcast] Nothing to send.');
  process.exit(0);
}

console.log('\n[broadcast] Found ' + pending.length + ' note(s) to send:\n');
pending.forEach(function(n) {
  console.log('  → ' + n.title + ' (' + n.slug + ')');
});
console.log('');

// Send each broadcast sequentially
sendNext(pending, 0);

function sendNext(queue, idx) {
  if (idx >= queue.length) {
    console.log('\n[broadcast] Done.');
    console.log('[broadcast] Remember to set sent: true in frontmatter for each note above, then git commit.');
    return;
  }

  var note = queue[idx];

  if (DRY_RUN) {
    console.log('[dry-run] Would send broadcast: "' + note.title + '"');
    console.log('  subject: ' + note.title);
    console.log('  url:     ' + note.url);
    console.log('  excerpt: ' + note.excerpt.slice(0, 80) + '...');
    console.log('');
    sendNext(queue, idx + 1);
    return;
  }

  var body = buildEmailBody(note);

  var payload = JSON.stringify({
    api_secret: API_KEY,
    subject:    note.title,
    content:    body,
    public:     false,
  });

  var https = require('https');
  var url   = require('url');
  var parsed = url.parse(CK_API + '/broadcasts');

  var options = {
    hostname: parsed.hostname,
    path:     parsed.path,
    method:   'POST',
    headers:  {
      'Content-Type':   'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  var req = https.request(options, function(res) {
    var data = '';
    res.on('data', function(chunk) { data += chunk; });
    res.on('end', function() {
      if (res.statusCode === 201 || res.statusCode === 200) {
        console.log('[sent] ' + note.title);
      } else {
        console.error('[error] ' + note.title + ' — HTTP ' + res.statusCode);
        try {
          var json = JSON.parse(data);
          console.error('  ', JSON.stringify(json));
        } catch (e) {
          console.error('  ', data.slice(0, 200));
        }
      }
      sendNext(queue, idx + 1);
    });
  });

  req.on('error', function(e) {
    console.error('[error] ' + note.title + ' — ' + e.message);
    sendNext(queue, idx + 1);
  });

  req.write(payload);
  req.end();
}

/* ============================================================
   HELPERS
   ============================================================ */
function buildEmailBody(note) {
  return [
    note.excerpt,
    '',
    'Read it here → ' + note.url,
    '',
    '—',
    'Umaru',
  ].join('\n');
}

function slugFromFilename(filename) {
  // "2026-02-18-my-note.md" → "my-note"
  return filename.replace(/^\d{4}-\d{2}-\d{2}-/, '').replace(/\.md$/, '');
}

function loadDotenv() {
  var envPath = path.join(__dirname, '..', '.env');
  if (!fs.existsSync(envPath)) return;
  var lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(function(line) {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    var eqIdx = line.indexOf('=');
    if (eqIdx === -1) return;
    var key = line.slice(0, eqIdx).trim();
    var val = line.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
    if (!process.env[key]) process.env[key] = val;
  });
}
