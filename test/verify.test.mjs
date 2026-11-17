// Offline tests for scripts/verify.mjs: a fake server shaped like Daysli MCP passes, and each way it could go wrong
// (no sign-in, a diary scope, PKCE optional, a client secret) fails.
import assert from 'node:assert/strict';
import { test } from 'node:test';

import { verify } from '../scripts/verify.mjs';

const SERVER = 'https://daysli.example.test/mcp';
const ORIGIN = 'https://daysli.example.test';

function fake(over = {}) {
  const resource = {
    resource: SERVER,
    authorization_servers: [ORIGIN],
    scopes_supported: ['profile:read', 'events:read', 'tasks:read', 'events:write'],
    ...over.resource,
  };
  const as = {
    issuer: ORIGIN,
    authorization_endpoint: 'https://app.daysli.example.test/oauth/authorize',
    token_endpoint: `${ORIGIN}/oauth/v1/token`,
    registration_endpoint: `${ORIGIN}/oauth/v1/register`,
    revocation_endpoint: `${ORIGIN}/oauth/v1/revoke`,
    scopes_supported: resource.scopes_supported,
    response_types_supported: ['code'],
    code_challenge_methods_supported: ['S256'],
    token_endpoint_auth_methods_supported: ['none'],
    ...over.as,
  };
  const status = over.status ?? 401;
  return async (url, init = {}) => {
    const u = String(url);
    if (u === SERVER && init.method === 'POST') {
      const headers = status === 401
        ? { 'www-authenticate': `Bearer resource_metadata="${ORIGIN}/.well-known/oauth-protected-resource/mcp", scope="${(over.challengeScope ?? 'profile:read')}"` }
        : {};
      return new Response('{}', { status, headers });
    }
    if (u === `${ORIGIN}/.well-known/oauth-protected-resource/mcp`) return Response.json(resource);
    if (u === `${ORIGIN}/.well-known/oauth-authorization-server`) return Response.json(as);
    return new Response('not found', { status: 404 });
  };
}

const failures = async (f) => (await verify(SERVER, f)).filter((r) => !r.ok).map((r) => r.name);

test('a server shaped like Daysli MCP passes every check', async () => {
  assert.deepEqual(await failures(fake()), []);
});

test('a server that does not ask for sign-in fails', async () => {
  assert.ok((await failures(fake({ status: 200 }))).includes('Server asks for sign-in'));
});

test('any diary permission fails, in metadata or in the challenge', async () => {
  assert.ok((await failures(fake({ resource: { scopes_supported: ['profile:read', 'diary:read'] } }))).includes('No diary permission exists'));
  assert.ok((await failures(fake({ challengeScope: 'profile:read journal:read' }))).includes('No diary permission in challenge'));
});

test('PKCE must be S256 and only S256', async () => {
  assert.ok((await failures(fake({ as: { code_challenge_methods_supported: ['plain', 'S256'] } }))).includes('PKCE with S256 required'));
  assert.ok((await failures(fake({ as: { code_challenge_methods_supported: [] } }))).includes('PKCE with S256 required'));
});

test('a client secret method fails (public clients only)', async () => {
  assert.ok((await failures(fake({ as: { token_endpoint_auth_methods_supported: ['client_secret_post'] } }))).includes('Public clients only (no client secret)'));
});

test('an unreachable server is reported, not thrown', async () => {
  const r = await verify(SERVER, async () => { throw new Error('offline'); });
  assert.deepEqual(r.map((x) => [x.name, x.ok]), [['Server reachable', false]]);
});

test('the documented tool list has 20 tools and none for the diary', async () => {
  const { readFile } = await import('node:fs/promises');
  const doc = await readFile(new URL('../docs/tools.md', import.meta.url), 'utf8');
  const tools = [...doc.matchAll(/^\| `([a-z_]+)` \|/gm)].map((m) => m[1]);
  assert.equal(tools.length, 20);
  assert.equal(new Set(tools).size, 20);
  assert.ok(!tools.some((t) => /diary|journal/.test(t)));
});

test('no file in the repository looks like a secret', async () => {
  const { readdir, readFile } = await import('node:fs/promises');
  const root = new URL('../', import.meta.url);
  const files = (await readdir(root, { recursive: true })).filter((f) => !/^(\.git|node_modules)[\\/]|^\.git$/.test(f));
  const SECRET = /(sk-[A-Za-z0-9]{20,}|ghp_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY-----|eyJ[A-Za-z0-9_-]{20,}\.[A-Za-z0-9_-]{20,}\.)/;
  for (const f of files) {
    let text;
    try { text = await readFile(new URL(f.replace(/\\/g, '/'), root), 'utf8'); } catch { continue; }
    assert.ok(!SECRET.test(text), `possible secret in ${f}`);
  }
});

test('every link back to Daysli carries the gh-agent-connect tag', async () => {
  const { readdir, readFile } = await import('node:fs/promises');
  const root = new URL('../', import.meta.url);
  const files = (await readdir(root, { recursive: true })).filter((f) => f.endsWith('.md') && !/node_modules/.test(f));
  for (const f of files) {
    const text = await readFile(new URL(f.replace(/\\/g, '/'), root), 'utf8');
    for (const m of text.matchAll(/(?:\]\(|<)(https:\/\/(?:app\.)?daysli\.com\/[^)>\s]*)/g)) {
      assert.match(m[1], /[?&]ref=gh-agent-connect(#|$)/, `${f}: ${m[1]}`);
    }
  }
});

test('the docs check compares tool lists both ways', async () => {
  const { compare, documented, published } = await import('../scripts/check-docs.mjs');
  assert.deepEqual(documented('| `a_b` | x | Reads |\n| `c` | y | Reads |'), ['a_b', 'c']);
  assert.deepEqual(published('<th scope="row"><code>a_b</code></th><th scope="row"><code>c</code></th>'), ['a_b', 'c']);
  assert.equal(compare(['a', 'b'], ['a', 'b']).ok, true);
  assert.deepEqual(compare(['a'], ['a', 'b']).missing, ['b']);
  assert.deepEqual(compare(['a', 'b'], ['a']).extra, ['b']);
  assert.equal(compare([], []).ok, false);
});
