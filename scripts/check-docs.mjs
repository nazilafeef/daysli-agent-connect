#!/usr/bin/env node
// Checks that docs/tools.md lists exactly the tools daysli.com/mcp lists today (that page is generated from the
// server's own tool list and tested against it). Reads one public page; no sign-in. Node.js 20+, no dependencies.
import { readFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';

export const documented = (md) => [...md.matchAll(/^\| `([a-z_]+)` \|/gm)].map((m) => m[1]);
export const published = (html) => [...new Set([...html.matchAll(/<th scope="row"><code>([a-z_]+)<\/code><\/th>/g)].map((m) => m[1]))];

export function compare(docs, live) {
  const missing = live.filter((t) => !docs.includes(t));
  const extra = docs.filter((t) => !live.includes(t));
  return { ok: live.length > 0 && !missing.length && !extra.length, missing, extra };
}

async function main() {
  const md = await readFile(new URL('../docs/tools.md', import.meta.url), 'utf8');
  const r = await fetch('https://daysli.com/mcp', { headers: { accept: 'text/html' } });
  const live = published(await r.text());
  const docs = documented(md);
  const c = compare(docs, live);
  console.log(`${c.ok ? 'PASS' : 'FAIL'}  docs/tools.md matches daysli.com/mcp  (${docs.length} documented, ${live.length} live)`);
  if (c.missing.length) console.log(`  missing from docs: ${c.missing.join(', ')}`);
  if (c.extra.length) console.log(`  not offered by the server: ${c.extra.join(', ')}`);
  process.exitCode = c.ok ? 0 : 1;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
