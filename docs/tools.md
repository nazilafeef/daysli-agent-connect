# Tools

These are the tools Daysli MCP offers today, in the order a person usually meets them. Each call is checked again
by the database for the person, the permission they granted, and their plan.

Kinds:

- **Reads**: changes nothing.
- **Prepares**: makes a draft for you to review; changes nothing yet.
- **Acts on your yes**: does something others may see, only after you confirm.
- **Changes when you ask**: changes your own calendar, to-dos or settings.

| Tool | What it does | Kind |
| --- | --- | --- |
| `get_started` | See what is set up: name, address, page, card, booking, discovery, and what is still to do. | Reads |
| `check_username` | Check whether a page address is free. | Reads |
| `prepare_setup` | Prepare a page, card, bookable hours and a meeting type for you to review. | Prepares |
| `apply_setup` | Apply the setup you reviewed. | Acts on your yes |
| `get_my_week` | Read your coming days: events, busy time from other calendars (without titles) and open to-dos. | Reads |
| `add_event` | Add a private event to your calendar. It invites nobody. | Changes when you ask |
| `update_event` | Move or rename your own event. | Changes when you ask |
| `add_todo` | Add a to-do. | Changes when you ask |
| `update_todo` | Rename, reschedule or complete a to-do. | Changes when you ask |
| `find_times` | After an accepted introduction: the times the other person offers on their page, yours first where you are free too. | Reads |
| `request_time` | Ask for one of those times; the other person accepts or declines in Daysli. | Acts on your yes |
| `get_page_design` | Read how your page looks: its design, sections and earlier versions. | Reads |
| `propose_page_design` | Prepare a new look for your page, with a preview link. | Prepares |
| `publish_page_design` | Publish the design you reviewed. | Acts on your yes |
| `restore_page_design` | Bring back an earlier version of your page's design. | Acts on your yes |
| `set_discovery` | Turn your opportunity profile on, pause it, or remove it (removing deletes it). | Changes when you ask |
| `find_opportunities` | Find members whose needs and offers match yours, if you chose to be found. | Reads |
| `propose_introduction` | Propose an introduction; the other person accepts or declines. | Acts on your yes |
| `list_introductions` | See introductions to and from you. | Reads |
| `respond_to_introduction` | Accept or decline an introduction sent to you. | Acts on your yes |

## Not available to assistants

- **The diary, never.** No tool, permission or route reaches it. The database role assistants run as cannot read a
  single diary table, and the diary is end-to-end encrypted besides.
- **Private conversations:** Ring messages and calls, Daysli Mail, notes on people and contacts.
- **Sensitive account matters:** plan and payments, sign-in and security, deleting the account.
- **Not yet:** company and vessel pages, Opportunities listings, Photos and Moments. They will be listed here only once
  they work.

The live list is always at <https://daysli.com/mcp?ref=gh-agent-connect#developers-h>.
