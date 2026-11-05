// Editor sign-in for Gabe's edit screen. Copied and trimmed from Riverside's src/auth.js (proven there):
// HMAC-signed session cookie, scrypt passwords, in-memory rate limit and lockout, strict Origin check. Node built-ins only.
import { createHash, createHmac, randomBytes, scrypt, scryptSync, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

export const COOKIE = 'gl_edit';
export const SESSION_DAYS = 7;

const b64u = (b) => Buffer.from(b).toString('base64url');
const mac = (secret, data) => createHmac('sha256', secret).update(data).digest();
/** Session version from the stored hash: a new password in EDITOR_USERS ends that editor's old sessions. */
const versionOf = (hash) => createHash('sha256').update(String(hash)).digest('hex').slice(0, 12);

/** Cookie value: base64url("name.exp.version") + "." + base64url(HMAC). exp in ms. */
export const signSession = (name, exp, secret, hash = '') => {
  const data = b64u(`${name}.${exp}.${versionOf(hash)}`);
  return `${data}.${b64u(mac(secret, data))}`;
};

/** The signed-in name, or null if the cookie is missing, forged, expired, from an old password, or the editor was removed.
 *  `users`: Map name -> stored hash (from parseEditors). */
export function verifySession(value, secret, users, now = Date.now()) {
  const [data, sig, extra] = String(value ?? '').split('.');
  if (!data || !sig || extra !== undefined || !secret) return null;
  const want = mac(secret, data);
  const got = Buffer.from(sig, 'base64url');
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  const parts = Buffer.from(data, 'base64url').toString().split('.');
  const version = parts.pop();
  const exp = Number(parts.pop());
  const name = parts.join('.');
  if (!(exp > now) || !users.has(name)) return null;
  return version === versionOf(users.get(name)) ? name : null;
}

/** Path=/edit: the cookie never rides along on public pages. SameSite=Strict: never sent from another site. */
export const cookieHeader = (value, { secure, maxAge = SESSION_DAYS * 86400 }) =>
  `${COOKIE}=${value}; Path=/edit; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${secure ? '; Secure' : ''}`;
export const readCookie = (header) => header?.split(/;\s*/).find((c) => c.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1) ?? null;

// ---------- Passwords: scrypt with a per-password salt, stored as "<salt hex>.<hash hex>" ----------
const SCRYPT = { N: 16384, r: 8, p: 1 };
export const USERNAME = /^[a-z0-9_-]{1,32}$/;
export const hashPassword = (pw, salt = randomBytes(16)) => `${salt.toString('hex')}.${scryptSync(String(pw), salt, 64, SCRYPT).toString('hex')}`;
const scryptAsync = promisify(scrypt);
/** Async (libuv thread pool), so a burst of sign-ins never blocks the event loop serving the public site. */
export async function verifyPassword(pw, stored) {
  const [salt, hash] = String(stored ?? '').split('.');
  if (!/^[0-9a-f]{32}$/.test(salt ?? '') || !/^[0-9a-f]{128}$/.test(hash ?? '')) return false;
  const got = await scryptAsync(String(pw), Buffer.from(salt, 'hex'), 64, SCRYPT);
  return timingSafeEqual(got, Buffer.from(hash, 'hex'));
}
const DUMMY = hashPassword('no-such-editor-placeholder');

/** EDITOR_USERS="gabe:<hash>,alex:<hash>" -> Map. Bad entries are skipped with a warning (never logged in full). */
export function parseEditors(value, warn = console.warn) {
  const users = new Map();
  for (const entry of String(value ?? '').split(',').map((s) => s.trim()).filter(Boolean)) {
    const i = entry.indexOf(':');
    const name = entry.slice(0, i).trim().toLowerCase(), hash = entry.slice(i + 1).trim();
    if (i < 1 || !USERNAME.test(name) || !/^[0-9a-f]{32}\.[0-9a-f]{128}$/.test(hash)) { warn(`EDITOR_USERS: skipped a bad entry${i > 0 ? ` (${name})` : ''}`); continue; }
    users.set(name, hash);
  }
  return users;
}

/** The editor's name if the password matches, else null. Same scrypt work for unknown names, so timing reveals nothing. */
export async function checkLogin(users, username, pw) {
  const name = String(username ?? '').trim().toLowerCase();
  const stored = users.get(name);
  const ok = await verifyPassword(String(pw ?? '').slice(0, 200), stored ?? DUMMY);
  return stored && ok ? name : null;
}

/** null if acceptable, else a short reason (used by tools/hash-password.mjs). */
export const passwordProblem = (pw) => (typeof pw !== 'string' || pw.length < 12 ? 'too short (12 characters or more)' : pw.length > 200 ? 'too long' : null);

// ---------- Rate limit and lockout ----------
// ponytail: in memory, resets on restart; fine for one server process and a couple of editors.
const hits = new Map();
/** True if `key` has used fewer than `max` tries in the last `windowMs` (and records this try). */
export function allow(key, max, windowMs, now = Date.now()) {
  const recent = (hits.get(key) ?? []).filter((t) => t > now - windowMs);
  if (recent.length >= max) { hits.set(key, recent); return false; }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (v.at(-1) <= now - windowMs) hits.delete(k);
  return true;
}

// Lockout: 5 failed sign-ins for a key (server.js: name + IP), then 15 minutes of refusals.
// USER_LOCK is the looser cap on the name alone, so one stranger can't keep Gabe locked out.
export const LOCK = { max: 5, ms: 15 * 60e3 };
export const USER_LOCK = { max: 50, ms: 60 * 60e3 };
const fails = new Map();
export const locked = (key, now = Date.now()) => (fails.get(key)?.until ?? 0) > now;
export function recordFailure(key, now = Date.now(), lock = LOCK) {
  const f = fails.get(key) ?? { n: 0, first: now, until: 0 };
  if (now - f.first > lock.ms) Object.assign(f, { n: 0, first: now });
  if (++f.n >= lock.max) f.until = now + lock.ms;
  fails.set(key, f);
  if (fails.size > 5000) for (const [k, v] of fails) if (v.until <= now && now - v.first > USER_LOCK.ms) fails.delete(k);
}
export const clearFailures = (key) => fails.delete(key);
export const _resetLimits = () => { hits.clear(); fails.clear(); }; // tests only

/** Writes must come from our own pages: the Origin header must be present and name this host. */
export function sameOrigin(headers) {
  const o = headers.origin;
  if (!o || !headers.host) return false;
  try { return new URL(o).host === headers.host; } catch { return false; }
}
