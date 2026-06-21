'use strict';

var https = require('https');
var crypto = require('crypto');

exports.handler = async function(event) {
  if (event.httpMethod !== 'POST') {
    return response(405, { error: 'Method not allowed' });
  }

  var expectedSecret = process.env.NETLIFY_SYNC_SECRET;
  if (expectedSecret) {
    var receivedSecret = event.headers['x-webhook-secret'] || event.headers['X-Webhook-Secret'];
    if (!timingSafeEqual(receivedSecret, expectedSecret)) {
      return response(401, { error: 'Unauthorized' });
    }
  }

  var apiKey = process.env.CONVERTKIT_API_KEY;
  var formId = process.env.CONVERTKIT_FORM_ID;

  if (!apiKey || !formId) {
    return response(500, { error: 'Missing CONVERTKIT_API_KEY or CONVERTKIT_FORM_ID' });
  }

  var body = parseBody(event.body, event.headers['content-type'] || event.headers['Content-Type'] || '');
  var payload = body && body.payload ? body.payload : body || {};
  var data = payload.data || body.data || {};

  var formName = payload.form_name || body.form_name || data.form_name || '';
  if (formName && formName !== 'newsletter') {
    return response(200, { status: 'ignored', reason: 'not-newsletter-form' });
  }

  var email = payload.email || body.email || data.email || '';
  if (!email) {
    return response(400, { error: 'Missing email' });
  }

  try {
    await subscribeToConvertKit(apiKey, formId, email);
    return response(200, { status: 'subscribed', email: email });
  } catch (err) {
    return response(502, { error: 'ConvertKit subscribe failed', details: err.message });
  }
};

function parseBody(raw, contentType) {
  if (!raw) return {};

  if (contentType.indexOf('application/json') !== -1) {
    try { return JSON.parse(raw); } catch (e) { return {}; }
  }

  if (contentType.indexOf('application/x-www-form-urlencoded') !== -1) {
    var params = new URLSearchParams(raw);
    var out = {};
    params.forEach(function(value, key) { out[key] = value; });
    return out;
  }

  try { return JSON.parse(raw); } catch (e) { return {}; }
}

function subscribeToConvertKit(apiKey, formId, email) {
  return new Promise(function(resolve, reject) {
    var REQUEST_TIMEOUT_MS = 10000;
    var payload = JSON.stringify({
      api_key: apiKey,
      email: email,
    });

    var req = https.request({
      hostname: 'api.convertkit.com',
      path: '/v3/forms/' + encodeURIComponent(formId) + '/subscribe',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
      timeout: REQUEST_TIMEOUT_MS,
    }, function(res) {
      var data = '';
      res.on('data', function(chunk) { data += chunk; });
      res.on('end', function() {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
          return;
        }
        reject(new Error('HTTP ' + res.statusCode + ' ' + data.slice(0, 300)));
      });
    });

    req.on('timeout', function() {
      req.destroy(new Error('Request timed out after ' + REQUEST_TIMEOUT_MS + 'ms'));
    });

    req.on('error', function(err) {
      reject(err);
    });
    req.write(payload);
    req.end();
  });
}

function response(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  };
}

function timingSafeEqual(left, right) {
  var a = Buffer.from(String(left || ''), 'utf8');
  var b = Buffer.from(String(right || ''), 'utf8');

  if (a.length !== b.length) {
    var maxLen = Math.max(a.length, b.length, 1);
    var paddedA = Buffer.alloc(maxLen);
    var paddedB = Buffer.alloc(maxLen);
    a.copy(paddedA);
    b.copy(paddedB);
    crypto.timingSafeEqual(paddedA, paddedB);
    return false;
  }

  return crypto.timingSafeEqual(a, b);
}
