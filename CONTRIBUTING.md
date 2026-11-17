# Contributing

Thank you for helping other people connect their assistants to Daysli.

## Good contributions

- A configuration example for an MCP client that is not covered yet, tested by you against `https://daysli.com/mcp`.
- Corrections when an assistant changes where connectors are added.
- Clearer wording in the documentation.
- Improvements to `scripts/verify.mjs` that keep it dependency-free.

## Rules

- No secrets, tokens, authorization codes or personal data in any file, screenshot, issue or pull request.
- No new runtime dependencies. The checker runs on plain Node.js 20.
- Document only what the server does today. Planned features are not listed until they work.
- Nothing may suggest that an assistant can reach the Daysli diary. It cannot.

## Before you open a pull request

```sh
npm test
```

The tests run offline. `node scripts/verify.mjs` additionally checks the live server.

By contributing you agree that your contribution is licensed under the MIT License in [LICENSE](LICENSE).

Questions about your Daysli account belong with Daysli Care at <https://daysli.com/help?ref=gh-agent-connect>, not in this repository.
