// Email sign-up: POST /api/signup -> Kit API v4 (create the subscriber, then add them to the form).
// The browser never talks to Kit; the key lives only in the server's environment (KIT_API_KEY, KIT_FORM_ID).
// Result codes: 200 ok, 400 bad email, 403 cross-site post, 413 too big, 429 too many tries, 503 not set up / Kit down.

const EMAIL = /^[^\s@<>()[\]\\,;:"]{1,64}@[A-Za-z0-9.-]{1,253}\.[A-Za-z]{2,63}$/;
export const validEmail = (e) => typeof e === 'string' && e.length <= 254 && EMAIL.test(e) && !e.includes('..');

// ponytail: in-memory per-IP limit (5 tries / 10 min), resets on restart; one server process is all we run.
const WINDOW = 10 * 60 * 1000, MAX = 5;
const hits = new Map();
export function limited(ip, now = Date.now()) {
  const list = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  list.push(now);
  hits.set(ip, list);
  if (hits.size > 5000) for (const [k, v] of hits) if (now - v.at(-1) >= WINDOW) hits.delete(k);
  return list.length > MAX;
}

/** Same-origin check: a browser post from another site carries its own Origin (or Referer). */
export function sameOrigin(headers, host) {
  const o = headers.origin ?? headers.referer;
  if (!o) return true; // non-browser clients and some privacy setups send neither; the rate limit still applies
  try { return new URL(o).host === host; } catch { return false; }
}

/**
 * Handle one sign-up. Returns { status, body }. `fetchImpl` and `env` are injectable for tests.
 * `fields` is the parsed form: { email, website } where `website` is a honeypot humans never see.
 */
export async function signup(fields, { ip, headers, host, env = process.env, fetchImpl = fetch, now = Date.now() }) {
  if (!sameOrigin(headers, host)) return { status: 403, body: { ok: false } };
  if (limited(ip, now)) return { status: 429, body: { ok: false } };
  if (fields.website) return { status: 200, body: { ok: true } }; // a bot filled the hidden field: pretend it worked
  const email = String(fields.email ?? '').trim();
  if (!validEmail(email)) return { status: 400, body: { ok: false } };
  const { KIT_API_KEY: key, KIT_FORM_ID: form } = env;
  if (!key || !/^\d+$/.test(form ?? '')) return { status: 503, body: { ok: false } };
  const call = (path, body) => fetchImpl(`https://api.kit.com/v4/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Kit-Api-Key': key }, body: JSON.stringify(body),
    signal: AbortSignal.timeout(8000),
  });
  try {
    const a = await call('subscribers', { email_address: email });
    if (!a.ok && a.status !== 422) return { status: 503, body: { ok: false } };
    const b = await call(`forms/${form}/subscribers`, { email_address: email });
    if (b.status === 200 || b.status === 201) return { status: 200, body: { ok: true } };
    return { status: b.status === 422 ? 400 : 503, body: { ok: false } };
  } catch {
    return { status: 503, body: { ok: false } };
  }
}

export const _resetLimits = () => hits.clear(); // tests only
