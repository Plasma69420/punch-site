import http from 'node:http';
import crypto from 'node:crypto';
import { env, DEFAULT_STATUS, ALLOWED_ORIGINS, ALLOWED_VARIANTS, PAY_METHODS, SITE_PRODUCTS } from './config.js';
import fs from 'node:fs';
import { load, proofPath } from './store.js';
import { verifyLicense } from './licenses.js';

const SELL = 'https://sell.app/api/v2';
const sellHeaders = extra => ({
  Authorization: `Bearer ${env.SELLAPP_API_KEY}`, 'X-STORE': env.SELLAPP_STORE || 'plasmacheats',
  Accept: 'application/json', ...extra,
});

// tiny in-memory rate limiter: max N hits per minute per ip+route
const hits = new Map();
const limited = (ip, route, max) => {
  const k = ip + route, now = Date.now(), arr = (hits.get(k) || []).filter(t => now - t < 60000);
  arr.push(now); hits.set(k, arr);
  return arr.length > max;
};

const json = (res, code, body, origin) => {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    Vary: 'Origin', 'Cache-Control': 'no-store',
  };
  if (origin) headers['Access-Control-Allow-Origin'] = origin;
  res.writeHead(code, headers);
  res.end(code === 204 ? undefined : JSON.stringify(body));
};

const readBody = req => new Promise((resolve, reject) => {
  let s = '';
  req.on('data', c => { s += c; if (s.length > 20000) { reject(new Error('too large')); req.destroy(); } });
  req.on('end', () => { try { resolve(JSON.parse(s || '{}')); } catch { reject(new Error('bad json')); } });
});

async function discordUser(req) {
  const m = /^Bearer (.+)$/.exec(req.headers.authorization || '');
  if (!m) return null;
  const r = await fetch('https://discord.com/api/v10/users/@me', { headers: { Authorization: `Bearer ${m[1]}` } });
  return r.ok ? r.json() : null;
}

// order cache so the dashboard doesn't hammer SellApp
let orderCache = { at: 0, orders: [] };
async function allOrders() {
  if (Date.now() - orderCache.at < 30000) return orderCache.orders;
  const out = [];
  for (let page = 1; page <= 20; page++) {
    const r = await fetch(`${SELL}/orders?limit=100&page=${page}`, { headers: sellHeaders() });
    if (!r.ok) break;
    const j = await r.json();
    out.push(...j.data);
    if (page >= (j.meta?.last_page || 1)) break;
  }
  orderCache = { at: Date.now(), orders: out };
  return out;
}

const routes = {
  'GET /api/status': async () => {
    const states = load('status', {});
    const updated = load('statusMeta', {});
    const products = {};
    for (const [slug, p] of Object.entries(SITE_PRODUCTS)) {
      products[slug] = { status: states[p.statusKey] || DEFAULT_STATUS[p.statusKey] || 'undetected', updated: updated[p.statusKey] || null };
    }
    return [200, { products, checked: Date.now() }];
  },

  'GET /api/vouches': async () => {
    const d = load('vouches', { count: 0, list: [] });
    const list = (d.list || []).slice(-200).reverse();
    const total = list.length;
    const dist = [0, 0, 0, 0, 0, 0];
    let sum = 0;
    for (const v of list) { dist[v.stars]++; sum += v.stars; }
    const reviews = list.map(v => ({ ...v, proof: v.proof ? `/api/proof/${v.proof}` : undefined }));
    return [200, { total, average: total ? sum / total : 0, distribution: dist.slice(1), reviews }];
  },

  'POST /api/checkout': async (req, ip) => {
    if (!env.SELLAPP_API_KEY) return [503, { error: 'Checkout is not configured yet.' }];
    if (limited(ip, 'checkout', 8)) return [429, { error: 'Too many attempts. Try again in a minute.' }];
    const b = await readBody(req);
    const email = String(b.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 120) return [400, { error: 'Enter a valid email address.' }];
    if (!PAY_METHODS.includes(b.method)) return [400, { error: 'Choose a payment method.' }];
    const variants = {};
    for (const it of Array.isArray(b.items) ? b.items.slice(0, 20) : []) {
      const id = Number(it.variant), qty = Math.floor(Number(it.qty));
      if (!ALLOWED_VARIANTS.has(id) || !(qty >= 1 && qty <= 10)) return [400, { error: 'Your cart has an invalid item.' }];
      variants[id] = { quantity: Math.min(10, (variants[id]?.quantity || 0) + qty) };
    }
    if (!Object.keys(variants).length) return [400, { error: 'Your cart is empty.' }];

    const o = await fetch(`${SELL}/orders`, {
      method: 'POST', headers: sellHeaders({ 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }),
      body: JSON.stringify({ customer_email: email, payment_method: b.method, product_variants: variants }),
    });
    const oj = await o.json().catch(() => ({}));
    if (!o.ok) { console.error('order create failed', o.status, JSON.stringify(oj).slice(0, 300)); return [502, { error: oj.message || 'Could not create the order.' }]; }
    const orderId = oj.data.id;
    const c = await fetch(`${SELL}/orders/${orderId}/checkout`, {
      method: 'POST', headers: sellHeaders({ 'Content-Type': 'application/json', 'Idempotency-Key': crypto.randomUUID() }), body: '{}',
    });
    const cj = await c.json().catch(() => ({}));
    const url = cj.data?.payment?.checkout_url;
    if (!c.ok || !url) { console.error('checkout failed', c.status, JSON.stringify(cj).slice(0, 300)); return [502, { error: cj.message || 'Could not start payment.' }]; }
    return [200, { url, order: orderId }];
  },

  'POST /api/license/verify': async (req, ip) => {
    if (limited(ip, 'license', 30)) return [429, { valid: false, error: 'rate_limited' }];
    const b = await readBody(req);
    return [200, verifyLicense(b.key, b.hwid)];
  },

  'GET /api/orders': async req => {
    const u = await discordUser(req);
    if (!u) return [401, { error: 'Not signed in.' }];
    if (!u.email || !u.verified) return [200, { orders: [], note: 'Your Discord email is not verified.' }];
    const mine = (await allOrders()).filter(o => (o.customer?.email || '').toLowerCase() === u.email.toLowerCase());
    return [200, {
      orders: mine.map(o => ({
        id: o.id, status: o.status, created: o.created_at, total: (o.totals?.total_usd_cents ?? o.totals?.total_cents ?? 0) / 100,
        method: o.payment?.method, items: (o.line_items || []).map(l => ({ title: l.product_title, variant: l.variant_title, qty: l.quantity })),
      })),
    }];
  },
};

http.createServer(async (req, res) => {
  const origin = ALLOWED_ORIGINS.includes(req.headers.origin) ? req.headers.origin : null;
  if (req.method === 'OPTIONS') return json(res, 204, {}, origin);
  const path = (req.url || '').split('?')[0];
  if (path === '/' || path === '/health') return json(res, 200, { ok: true }, origin);
  // review pictures (saved when a customer attaches an image to /vouch)
  const pm = req.method === 'GET' && /^\/api\/proof\/(\d+\.(?:png|jpg|webp|gif))$/.exec(path);
  if (pm) {
    const types = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };
    const file = proofPath(pm[1]);
    if (!fs.existsSync(file)) return json(res, 404, { error: 'Not found' }, origin);
    res.writeHead(200, { 'Content-Type': types[pm[1].split('.').pop()], 'Cache-Control': 'public, max-age=86400', 'X-Content-Type-Options': 'nosniff', 'Cross-Origin-Resource-Policy': 'cross-origin' });
    return fs.createReadStream(file).pipe(res);
  }
  const handler = routes[`${req.method} ${path}`];
  if (!handler) return json(res, 404, { error: 'Not found' }, origin);
  // state-changing routes only accept browser calls from our own site
  if (req.method === 'POST' && !origin && path !== '/api/license/verify') return json(res, 403, { error: 'Forbidden' }, null);
  try {
    const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const [code, body] = await handler(req, ip);
    json(res, code, body, origin);
  } catch (e) {
    console.error('api error', e);
    json(res, 500, { error: 'Server error' }, origin);
  }
}).listen(process.env.PORT || 3000, () => console.log('API listening on', process.env.PORT || 3000));
