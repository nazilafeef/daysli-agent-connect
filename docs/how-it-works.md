# How it works

For people building or configuring an MCP client.

## Transport

- Endpoint: `https://daysli.com/mcp`
- MCP over streamable HTTP: JSON-RPC 2.0 messages in `POST` requests.
- A browser opening the same address gets the human-readable page instead.

## Sign-in

Daysli uses OAuth 2.1 as described by the MCP authorization specification.

1. An unauthenticated request receives `401` with
   `WWW-Authenticate: Bearer resource_metadata="https://daysli.com/.well-known/oauth-protected-resource/mcp", scope="..."`.
2. The protected-resource metadata (RFC 9728) names the authorization server `https://daysli.com`.
3. The authorization-server metadata (RFC 8414) is at `https://daysli.com/.well-known/oauth-authorization-server`.
4. The client registers itself (RFC 7591) at the `registration_endpoint`. Public clients only:
   `token_endpoint_auth_method` is `none`; no client secret exists.
5. The person signs in and approves on `https://app.daysli.com/oauth/authorize`. PKCE with `S256` is required.
6. The client exchanges the code at the `token_endpoint` and refreshes with `refresh_token`.
7. Tokens are revoked at the `revocation_endpoint`, or by the person disconnecting in Daysli.

Read the live values with:

```sh
curl -s https://daysli.com/.well-known/oauth-protected-resource/mcp
curl -s https://daysli.com/.well-known/oauth-authorization-server
```

or run `node scripts/verify.mjs`, which checks them for you.

## Errors you may see

| Situation | What happens |
| --- | --- |
| No token or an expired token | `401` with the challenge above; the client should refresh or sign in again |
| A permission was not granted | The tool explains which permission is missing |
| The trial or plan has ended | Reading tools work; changing tools explain that a plan is needed |
| The person disconnected | `401`; the client must sign in again |

## The REST API is separate

To build your own software for your own Daysli account, use the REST API with a personal token instead:
<https://daysli.com/developers?ref=gh-agent-connect>.
