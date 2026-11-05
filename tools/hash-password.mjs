// Prints a password hash for EDITOR_USERS (name:<hash>,name:<hash>).
//   node tools/hash-password.mjs               (asks for it; typing is not shown and never lands in shell history)
//   node tools/hash-password.mjs < pw.txt      (or piped from a password manager's CLI)
// Avoid `echo 'pw' | ...` and passing it as an argument: both put the password in shell history (bash skips a line
// that starts with a space only when HISTCONTROL=ignorespace is set).
import { hashPassword, passwordProblem } from '../src/lib/auth.js';

let pw = process.argv[2];
if (pw == null && process.stdin.isTTY) {
  process.stderr.write('Password (not shown): ');
  process.stdin.setRawMode(true);
  pw = '';
  read: for await (const c of process.stdin) {
    for (const ch of c.toString('utf8')) {
      if (ch === '\r' || ch === '\n') { process.stdin.setRawMode(false); break read; }
      if (ch === '\u0003') { process.stdin.setRawMode(false); process.exit(130); } // Ctrl+C
      pw = ch === '\u007f' || ch === '\b' ? pw.slice(0, -1) : pw + ch;
    }
  }
  process.stderr.write('\n');
} else if (pw == null) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  pw = Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/, '');
}
const problem = passwordProblem(pw);
if (problem) { console.error(`Password ${problem}.`); process.exit(1); }
console.log(hashPassword(pw));
