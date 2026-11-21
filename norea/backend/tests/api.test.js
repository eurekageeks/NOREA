import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import pool, { query } from '../src/config/db.js';

let server;
let baseUrl;

const req = async (path, { method = 'GET', body, cookie } = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  if (cookie) headers.Cookie = cookie;
  const res = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const setCookie = res.headers.getSetCookie?.()?.[0]?.split(';')[0] || '';
  const text = await res.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, json, cookie: setCookie };
};

test.before(async () => {
  server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(async () => {
  // Clean up test records
  await query("DELETE FROM enquiries WHERE email = 'test-learner@example.com'");
  await query("DELETE FROM users WHERE email = 'test-student@example.com'");
  await new Promise((resolve) => server.close(resolve));
  await pool.end();
});

test('GET /api/health returns ok', async () => {
  const r = await req('/api/health');
  assert.equal(r.status, 200);
  assert.equal(r.json.status, 'ok');
});

test('GET /api/programs returns 3 seeded NŌRÉA programs with topics', async () => {
  const r = await req('/api/programs');
  assert.equal(r.status, 200);
  assert.equal(r.json.data.length, 3);
  assert.ok(r.json.data[0].topics.length >= 5);
});

test('GET /api/programs/:slug returns program details', async () => {
  const r = await req('/api/programs/spoken-english-communication');
  assert.equal(r.status, 200);
  assert.equal(r.json.data.title, 'Spoken English & Communication');
});

test('POST /api/enquiries validates and prevents duplicate within 24h', async () => {
  const progs = (await req('/api/programs')).json.data;
  const payload = {
    full_name: 'Aarav Mehta',
    email: 'test-learner@example.com',
    phone: '+91 98765 43210',
    program_id: progs[0].id,
    learning_mode: 'online',
    message: 'Interested in the next weekend batch.',
  };
  const r1 = await req('/api/enquiries', { method: 'POST', body: payload });
  assert.equal(r1.status, 201);
  assert.match(r1.json.data.reference, /^NOR-\d{5}$/);

  const r2 = await req('/api/enquiries', { method: 'POST', body: payload });
  assert.equal(r2.status, 409);
});

test('Student registration, portal access, and RBAC block on admin APIs', async () => {
  const reg = await req('/api/auth/register', {
    method: 'POST',
    body: {
      full_name: 'Diya Sharma',
      email: 'test-student@example.com',
      phone: '+91 91234 56789',
      password: 'Password123',
    },
  });
  assert.equal(reg.status, 201);
  assert.ok(reg.cookie.startsWith('norea_token='));

  const me = await req('/api/auth/me', { cookie: reg.cookie });
  assert.equal(me.status, 200);
  assert.equal(me.json.user.role, 'student');

  const portal = await req('/api/portal/overview', { cookie: reg.cookie });
  assert.equal(portal.status, 200);

  // Students MUST be blocked from admin endpoints
  const adminStats = await req('/api/dashboard/stats', { cookie: reg.cookie });
  assert.equal(adminStats.status, 403);
  const adminEnq = await req('/api/enquiries', { cookie: reg.cookie });
  assert.equal(adminEnq.status, 403);
});

test('GET /sitemap.xml and /robots.txt return valid SEO files', async () => {
  const sm = await req('/sitemap.xml');
  assert.equal(sm.status, 200);
  assert.ok(String(sm.json).includes('/programs/spoken-english-communication'));
  const rb = await req('/robots.txt');
  assert.equal(rb.status, 200);
  assert.ok(String(rb.json).includes('Disallow: /admin'));
});
