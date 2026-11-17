#!/usr/bin/env node
// Checks that Daysli MCP is reachable and asks for sign-in the way MCP clients expect. Reads public documents only:
// it never signs in, never registers a client and sends no personal data. No dependencies (Node.js 20+).
//
//   node scripts/verify.mjs            check https://daysli.com/mcp
//   node scripts/verify.mjs <url>      check another MCP address (for example a staging server)

import { pathToFileURL } from 'node:url';

export const DEFAULT_SERVER = 'https://daysli.com/mcp';

/** Anything that would let an assistant near the diary. None may exist. */
const DIARY = /diary|journal/i;

/**
 * Runs every check and returns [{name, ok, detail}]. `fetchImpl` is injectable so the tests run offline.
 * @param {string} server
 * @param {typeof fetch} fetchImpl
 */
export async function verify(server = DEFAULT_SERVER, fetchImpl = fetch) {
  const results = [];
  const check = (name, ok, detail = '') => results.push({ name, ok: Boolean(ok), detail });
  const origin = new URL(server).origin;
  const getJson = async (url) => {
    const r = await fetchImpl(url, { headers: { accept: 'application/json' } });
    if (!r.ok) throw new Error(`${url} answered ${r.status}`);
    return r.json();
  };

  // 1. Without a token the server must refuse and point to its protected-resource metadata (RFC 9728).
  let metadataUrl = `${origin}/.well-known/oauth-protected-resource`;
  try {
    const r = await fetchImpl(server, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json, text/event-stream' },
      body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'initialize', params: {
        protocolVersion: '2025-06-18', capabilities: {}, clientInfo: { name: 'daysli-agent-connect-verify', version: '1.0.0' } } }),
    });
    const challenge = r.headers.get('www-authenticate') ?? '';
    check('Server asks for sign-in', r.status === 401, `HTTP ${r.status}`);
    const m = /resource_metadata="([^"]+)"/.exec(challenge);
    check('Sign-in challenge names its metadata', m, m ? m[1] : 'no resource_metadata in WWW-Authenticate');
    if (m) metadataUrl = m[1];
    if (/scope="([^"]*)"/.exec(challenge)?.[1]?.match(DIARY)) check('No diary permission in challenge', false, challenge);
  } catch (e) {
    check('Server reachable', false, e.message);
    return results;
  }

  // 2. Protected-resource metadata.
  let resource;
  try {
    resource = await getJson(metadataUrl);
    check('Protected-resource metadata', resource.resource === server, `resource = ${resource.resource}`);
  } catch (e) {
    check('Protected-resource metadata', false, e.message);
    return results;
  }

  // 3. Authorization-server metadata (RFC 8414).
  const issuer = resource.authorization_servers?.[0];
  if (!issuer) {
    check('Authorization server named', false, 'authorization_servers is empty');
    return results;
  }
  let as;
  try {
    as = await getJson(`${issuer.replace(/\/$/, '')}/.well-known/oauth-authorization-server`);
    check('Authorization-server metadata', as.issuer === issuer, `issuer = ${as.issuer}`);
  } catch (e) {
    check('Authorization-server metadata', false, e.message);
    return results;
  }

  check('PKCE with S256 required', (as.code_challenge_methods_supported ?? []).includes('S256') &&
    !(as.code_challenge_methods_supported ?? []).includes('plain'), String(as.code_challenge_methods_supported));
  check('Public clients only (no client secret)', JSON.stringify(as.token_endpoint_auth_methods_supported) === '["none"]',
    String(as.token_endpoint_auth_methods_supported));
  check('Dynamic client registration offered', typeof as.registration_endpoint === 'string', as.registration_endpoint ?? 'missing');
  check('Tokens can be revoked', typeof as.revocation_endpoint === 'string', as.revocation_endpoint ?? 'missing');
  check('Authorization code flow only', JSON.stringify(as.response_types_supported) === '["code"]',
    String(as.response_types_supported));
  for (const key of ['authorization_endpoint', 'token_endpoint', 'registration_endpoint', 'revocation_endpoint']) {
    if (as[key] && !String(as[key]).startsWith('https://')) check(`${key} uses HTTPS`, false, as[key]);
  }
  const scopes = [...(resource.scopes_supported ?? []), ...(as.scopes_supported ?? [])];
  const diary = scopes.filter((s) => DIARY.test(s));
  check('No diary permission exists', diary.length === 0, diary.length ? diary.join(', ') : `${new Set(scopes).size} scopes, none for the diary`);
  return results;
}

async function main() {
  const server = process.argv[2] ?? DEFAULT_SERVER;
  console.log(`Checking ${server}\n`);
  const results = await verify(server);
  for (const r of results) console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.detail ? `  (${r.detail})` : ''}`);
  const failed = results.filter((r) => !r.ok).length;
  console.log(failed ? `\n${failed} check(s) failed.` : '\nAll checks passed. Add the address to your assistant and sign in on Daysli.');
  process.exitCode = failed ? 1 : 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) await main();
