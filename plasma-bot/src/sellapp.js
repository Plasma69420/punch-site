import { env } from './config.js';

// Looks up an order via SellApp's API (GET /v2/orders/{order}). Needs an API key with the "invoice" ability.
export async function lookupOrder(orderId) {
  if (!env.SELLAPP_API_KEY) return { ok: false, reason: 'not_configured' };
  const headers = { Accept: 'application/json', Authorization: `Bearer ${env.SELLAPP_API_KEY}` };
  if (env.SELLAPP_STORE) headers['X-STORE'] = env.SELLAPP_STORE;
  let res;
  try { res = await fetch(`https://sell.app/api/v2/orders/${encodeURIComponent(orderId)}`, { headers }); }
  catch { return { ok: false, reason: 'network' }; }
  if (res.status === 404) return { ok: false, reason: 'not_found' };
  if (!res.ok) return { ok: false, reason: 'api_error', status: res.status };
  const { data } = await res.json();
  if (data.status !== 'COMPLETED') return { ok: false, reason: 'unpaid', status: data.status };
  return { ok: true, order: data };
}
