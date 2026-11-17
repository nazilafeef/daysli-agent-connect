# Daysli Agent Connect

Connect ChatGPT, Claude or any assistant that speaks the Model Context Protocol (MCP) to your Daysli account.

Daysli runs the MCP server for you at **https://daysli.com/mcp**. There is nothing to install and no key to copy:
you add the address to your assistant, sign in on Daysli, and approve exactly what the assistant may do.

This repository holds the copy-ready client configurations, the documentation, and a small checker that confirms the
server and its sign-in are reachable from your network. It contains no server code and no secrets.

> **Your diary is never reachable.** No tool, permission or route gives an assistant access to the Daysli diary,
> now or later. See [docs/permissions.md](docs/permissions.md).

## What an assistant can do

| Area | What it does | When it changes something |
| --- | --- | --- |
| Professional page | Prepares your page, card, bookable hours and a meeting type | Only after you review and say yes |
| Page design | Reads the design, prepares a new look with a preview link, restores an earlier version | Only after you say yes |
| Calendar and to-dos | Reads your coming days, adds and moves your own events, adds and completes to-dos | When you ask; it invites nobody and deletes nothing |
| Meeting people | Finds members who chose to be found, proposes introductions, asks for a time | The other person always accepts or declines in Daysli |

The full list of 20 tools is in [docs/tools.md](docs/tools.md).

## Connect in two minutes

Server address: `https://daysli.com/mcp`

| Assistant | How |
| --- | --- |
| Claude (claude.ai, desktop) | Customize -> Connectors -> Add custom connector, paste the address. [Guide](examples/claude.md) |
| Claude Code | `claude mcp add --transport http daysli https://daysli.com/mcp` [Guide](examples/claude-code.md) |
| ChatGPT | chatgpt.com/plugins -> Add custom MCP server, choose OAuth. [Guide](examples/chatgpt.md) |
| VS Code (Copilot agent mode) | [examples/vscode/mcp.json](examples/vscode/mcp.json) |
| Cursor | [examples/cursor/mcp.json](examples/cursor/mcp.json) |
| Any MCP client | Streamable HTTP + OAuth 2.1. [docs/how-it-works.md](docs/how-it-works.md) |

The first time the assistant uses Daysli, Daysli's own sign-in opens. You see each permission the assistant asks for
and choose Allow. The assistant never sees your password.

You need a Daysli account on the free trial or a paid plan. Start at
[daysli.com/mcp](https://daysli.com/mcp?ref=gh-agent-connect). When a trial or plan has ended an assistant can still
read, but cannot change anything, exactly as in the Daysli app.

## Check the connection

Node.js 20 or later, no dependencies:

```sh
node scripts/verify.mjs       # the server, its sign-in and its permissions
node scripts/check-docs.mjs   # docs/tools.md matches the tools daysli.com/mcp lists today
```

It reads the public discovery documents, confirms that the server asks for sign-in, that PKCE (S256) is required,
and that no diary permission exists. It never signs in and sends no personal data.

## Stop at any time

Disconnect an assistant in Daysli under [Your assistants](https://app.daysli.com/assistants?ref=gh-agent-connect). The connection stops on
its next request.

## Links

- Daysli MCP: <https://daysli.com/mcp?ref=gh-agent-connect>
- Step-by-step connection guide: <https://daysli.com/assistant?ref=gh-agent-connect>
- Building your own software instead (REST API with personal tokens): <https://daysli.com/developers?ref=gh-agent-connect>
- Privacy: <https://daysli.com/privacy?ref=gh-agent-connect> - Terms: <https://daysli.com/terms?ref=gh-agent-connect>
- Security reports: [SECURITY.md](SECURITY.md)

## License

[MIT](LICENSE). This licence covers the files in this repository only. Use of the Daysli service is governed by the
[Daysli Terms](https://daysli.com/terms?ref=gh-agent-connect).
