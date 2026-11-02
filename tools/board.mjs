#!/usr/bin/env node
// Desktop/Laptop coordination board = GitHub issue #1. Node only (works on both machines, no gh/python needed).
//   node tools/board.mjs say "Desktop: message"     post a comment
//   node tools/board.mjs check Desktop              NEW_LAPTOP <text> | LAPTOP_SILENT <min> | OK | ERROR
//   node tools/board.mjs read [n]                   print the last n comments (default 5)
// Token: GH_TOKEN env, else `gh auth token`, else the git credential helper.
// ponytail: 45 min "silent" threshold hard-coded; make it an arg if the cadence changes.
import { execSync } from 'node:child_process';

const REPO = 'Mishtuk/GLucak-Website-', ISSUE = 1, API = `https://api.github.com/repos/${REPO}/issues/${ISSUE}/comments`;
const sh = (c, input) => { try { return execSync(c, { input, stdio: ['pipe', 'pipe', 'ignore'] }).toString().trim(); } catch { return ''; } };
const token = process.env.GH_TOKEN || sh('gh auth token') ||
  (sh('git credential fill', 'protocol=https\nhost=github.com\n\n').match(/^password=(.*)$/m) || [])[1];
if (!token) { console.log('ERROR no GitHub token (set GH_TOKEN, or log in with gh / git)'); process.exit(1); }
const gh = (url, opts = {}) => fetch(url, { ...opts, headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', ...opts.headers } });

async function all() {
  const out = [];
  for (let p = 1; ; p++) {
    const r = await gh(`${API}?per_page=100&page=${p}`);
    if (!r.ok) throw new Error(`GitHub ${r.status}`);
    const page = await r.json(); out.push(...page);
    if (page.length < 100) return out;
  }
}

const [cmd, arg] = process.argv.slice(2);
try {
  if (cmd === 'say') {
    if (!/^(Desktop|Laptop):/.test(arg || '')) throw new Error('message must start with "Desktop:" or "Laptop:"');
    const r = await gh(API, { method: 'POST', body: JSON.stringify({ body: arg }), headers: { 'Content-Type': 'application/json' } });
    if (!r.ok) throw new Error(`GitHub ${r.status}`);
    console.log((await r.json()).html_url);
  } else if (cmd === 'check') {
    const me = arg || 'Desktop', other = me === 'Desktop' ? 'Laptop' : 'Desktop';
    const rows = await all(), last = who => rows.filter(c => c.body.startsWith(who + ':')).at(-1);
    const them = last(other), mine = last(me), O = other.toUpperCase();
    if (them && (!mine || them.created_at > mine.created_at)) console.log(`NEW_${O}`, them.created_at, them.body.slice(0, 200).replace(/\n/g, ' '));
    else if (!mine) console.log('OK nothing posted yet');
    else {
      const min = Math.round((Date.now() - Date.parse(mine.created_at)) / 60000);
      console.log(min > 45 ? `${O}_SILENT ${min} min since your last post` : `OK last ${me} post ${min} min ago`);
    }
  } else if (cmd === 'read') {
    for (const c of (await all()).slice(-(Number(arg) || 5))) console.log(`--- ${c.created_at}\n${c.body}\n`);
  } else console.log('usage: board.mjs say "Desktop: ..." | check Desktop|Laptop | read [n]');
} catch (e) { console.log('ERROR', e.message); process.exit(1); }
