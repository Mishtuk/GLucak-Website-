// Prints a password hash for EDITOR_USERS (name:<hash>,name:<hash>). No prompt.
//   echo 'the password' | node tools/hash-password.mjs     (stdin: stays out of shell history)
//   node tools/hash-password.mjs 'the password'
import { hashPassword, passwordProblem } from '../src/lib/auth.js';

let pw = process.argv[2];
if (pw == null) {
  const chunks = [];
  for await (const c of process.stdin) chunks.push(c);
  pw = Buffer.concat(chunks).toString('utf8').replace(/\r?\n$/, '');
}
const problem = passwordProblem(pw);
if (problem) { console.error(`Password ${problem}.`); process.exit(1); }
console.log(hashPassword(pw));
