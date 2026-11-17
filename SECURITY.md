# Security

## Reporting a vulnerability

Please report security problems in Daysli MCP, its sign-in (OAuth) or this repository privately by email to
**team@daysli.com** with "Security" in the subject. Do not open a public issue for a vulnerability.

Include what you found, how to reproduce it, and what an attacker could do with it. We will acknowledge your report
within three working days and keep you informed until it is resolved.

Please test only against your own Daysli account. Do not access other people's data, do not degrade the service,
and do not use automated scanning that sends large volumes of requests.

## What is in scope

- The MCP server at `https://daysli.com/mcp`
- The OAuth endpoints listed at `https://daysli.com/.well-known/oauth-authorization-server`
- The consent screen at `https://app.daysli.com/oauth/authorize`
- The code and configuration in this repository

## Design commitments you can test against

- The Daysli diary is not reachable through any MCP tool, scope or route.
- Every tool call is checked again in the database for the person, the permission granted and their plan.
- Tokens are short-lived, refreshable and revocable; disconnecting in Daysli stops the connection on its next request.
- Public clients only: no client secret exists, and PKCE with S256 is required.

If you find any of these not to hold, that is a vulnerability: please report it.

## Secrets

This repository contains no credentials and never will. Never paste an access token, refresh token or authorization
code into an issue, pull request or discussion.
