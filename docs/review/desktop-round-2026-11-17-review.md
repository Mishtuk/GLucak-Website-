# Boss review: Desktop round 2026-11-17, local commits origin/main..HEAD

**Task:** review slices 1, 3-8 against `desktop-round-2026-11-17.md` (Files, Done when, OUT) before they are pushed.
**Done when:** each slice has a verdict; nothing is pushed with a security hole or edits outside its files.

**Overall: APPROVED, all 7. No FIX items.** Safe to push. `npm test` 232/231, the only red is ig6 (slice 2).
Line endings: the index is LF in every file, the diff has 0 CR characters, stat is 12 files +173/-20 (no whole-file churn).
Author is Alex Mishtuk on all 7, no AI line.

| Slice | Commit | Verdict | Notes |
|---|---|---|---|
| 1 Who I Am date-proof | 7a08a20 | APPROVED | Only build.test.js. Reads releases.json, NY day (same as content.js/shows.js), no title hard-coded, released never coming. Pre-save only asserted for lnk.to links (correct: Welcome Home is coming with a Spotify link until slice 2). Nit: subject says "S1 test:", should say "Slice 1" (S1 is the security item). Reword only if it's cheap. |
| 3 S1 signup crash | ad2e8de | APPROVED | The diff matches `patches/s1-signup-crash.diff` line for line (CR stripped). HANDOFF.md:30 is in scope (plan: "Tick S1 in HANDOFF"). Checklist item 5 untouched, as planned. |
| 4 S7 redirect | 17dd73d | APPROVED | server.js:311 is the planned Location. The test uses /shows paths where the plan said /music and /about (the test fixture dist only has /shows). Fine: I checked the plan's paths on the real build. |
| 5 sign-in log | 829a500 | APPROVED | server.js:169/219/221. Logs ISO time, clientIp and JSON.stringify(username). The password is never passed in. The test checks `\n` and `"` come out escaped and that 'hunter2' is absent. |
| 6 Shop. -> Shop | 61d6ca9 | APPROVED | products.js:118 + products.test.js:119. shop.test.js:58 is the accepted widening. global.css:702 untouched (Laptop). |
| 7 poster | ceb38a9 | APPROVED | shows.js:76-80, 93. Poster = first `type:'show'`, limit counts it, not repeated, none -> no poster. Output still goes only through posterHtml/rowHtml (escaped), XSS rows green. Ceiling: `limit: 0` with a show gives slice(0,-1). Nobody calls it with 0, so leave it. |
| 8 Dependabot | 58aa78a | APPROVED | Valid v2. github-actions went in before slice 9 (the plan said "once slice 9 exists"). Harmless, but Dependabot may show "no workflow files" until 9a lands. Push 9a soon. "Shown under Insights" can only be checked after the push. |

## Security checks I ran (node server.js on :4791/:4792 against the real dist, killed afterwards)
- **S1:** POST /api/signup with `null`, `[]`, `"x"`, `5`, `{bad`, `{"email":null}` and `__proto__` all answer 400 (5 alone gives 429 without TRUST_PROXY).
  A real exception inside the handler (`{"email":{"toString":1}}` makes String() throw in signup.js:34) answers **500**: `{"ok":false}` for
  JSON, "Something went wrong." for HTML. One log line, no error details sent to the client, and GET / still answers 200 afterwards. Sync throws in
  handle() are caught by the createServer wrapper (server.js:327). handleEdit already had its own .catch.
- **S7:** `/music`, `/a/..//music`, `/shows/..//shows`, `/%2e%2e//about`, `/.//music`, `/a/..\\music` all give `Location: /x/`.
  `/%5Cmusic` gives `/%5Cmusic/` and `/%2F%2Fmusic` gives `/%2F%2Fmusic/` (encoded, so these are paths, not hosts). `//music` and `/\music` give 200 (the URL parser reads them as
  host "music" and serves home), so no redirect. No Location starts with `//` or `/\`.
- **Log line:** only the username goes in, through JSON.stringify (newlines and quotes escaped, capped at 64). IP is the socket address, or the proxy's rightmost XFF.

## Next (main session)
- Push the 7, then the HANDOFF line + board post (hash + one line per commit).
- HANDOFF:16/39 now says the owner **released** the Laptop's claim (Desktop holds all files). So slice 2 doesn't have to wait for the
  Laptop any more. It can go next: coder, `src/data/releases.json:4` + `test/ig6.test.js:87-95`, done-when as in the plan.
- Then slice 9a (daily.yml). 9b still waits for the owner's OK.
