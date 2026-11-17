# Claude Code

```sh
claude mcp add --transport http daysli https://daysli.com/mcp
```

Then, inside Claude Code, run `/mcp`, choose `daysli` and **Authenticate**. Your browser opens Daysli's sign-in;
approve the permissions you want and return to the terminal.

To share the server with a project, add it to the project's `.mcp.json` instead:

```json
{
  "mcpServers": {
    "daysli": {
      "type": "http",
      "url": "https://daysli.com/mcp"
    }
  }
}
```

No token goes in the file: each person signs in with their own Daysli account.
