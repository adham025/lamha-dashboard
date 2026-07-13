#!/usr/bin/env node
// Pre-commit secret guard. Blocks privileged Supabase JWTs (service_role),
// private-key blocks, provider secret keys, and real .env files — while
// ALLOWING the public anon key (role=anon), which is meant to ship.
import { execSync } from 'node:child_process'

const sh = (cmd) => execSync(cmd, { encoding: 'utf8' })
const problems = []

// 1) Block staged env files (allow .env.example only).
const files = sh('git diff --cached --name-only --diff-filter=ACM')
  .split('\n')
  .filter(Boolean)
for (const f of files) {
  const base = f.split('/').pop()
  if (/^\.env($|\.)/.test(base) && base !== '.env.example') {
    problems.push(`staged env file: ${f}`)
  }
}

// 2) Scan added lines.
let diff = ''
try {
  diff = sh('git diff --cached --unified=0 --no-color')
} catch {
  /* nothing staged */
}
const added = diff.split('\n').filter((l) => l.startsWith('+') && !l.startsWith('+++'))

const jwtRe = /eyJ[A-Za-z0-9_-]{8,}\.eyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g
function roleOf(token) {
  try {
    let p = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')
    while (p.length % 4) p += '='
    return JSON.parse(Buffer.from(p, 'base64').toString('utf8')).role
  } catch {
    return undefined
  }
}

for (const line of added) {
  for (const tok of line.match(jwtRe) || []) {
    const role = roleOf(tok)
    if (role && role !== 'anon') {
      problems.push(`privileged Supabase JWT (role=${role}) — service_role must never be committed`)
    }
  }
  if (/-----BEGIN (RSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/.test(line)) {
    problems.push('private key block')
  }
  if (/sb_secret_[A-Za-z0-9]/.test(line)) problems.push('Supabase secret key (sb_secret_…)')
  if (/\bAKIA[0-9A-Z]{16}\b/.test(line)) problems.push('AWS access key id')
}

if (problems.length) {
  console.error('\n❌  Commit blocked — possible secret detected:')
  for (const p of [...new Set(problems)]) console.error('   • ' + p)
  console.error(
    '\nThe public anon key (role=anon) is allowed. If this is truly a false\n' +
      'positive, bypass only when certain:  git commit --no-verify\n',
  )
  process.exit(1)
}
