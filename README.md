# Eris

A Discord bot that lets server members choose their name color from 148 colors, grouped into 11 families. Built with NestJS and discord.js.

## Commands

| Command        | What it does                                                                    |
| -------------- | ------------------------------------------------------------------------------- |
| `/color-list`  | Browse the colors by group, see them as real swatches and pick one for yourself |
| `/color-reset` | Remove all of your color roles                                                  |
| `/help`        | Show all available commands                                                     |
| `/ping`        | Check that the bot is responding                                                |

`/color-list` and `/color-reset` only work in servers. All replies about colors are visible only to the person who used the command.

### Choosing a color

1. Run `/color-list`. It shows your current color, then choose a group from the dropdown.
2. Browse the group 6 colors at a time with ◀️ and ▶️. Each page shows the real colors with their names and hex codes.
3. Choose a color from the second dropdown. The menu closes and the bot reports each step:
   - checks whether a role for that color exists, and creates it if not
   - gives you the role
   - removes your other color roles
4. **🎲 Random** gives you a random color, using the same steps.
5. **Close** dismisses the menu without changing anything. The menu also closes after 5 minutes without use.

## Bot channel

If the server has a text channel named `colors`, the bot only answers commands there and in its threads. Anywhere else, it replies privately and points to that channel. Without a `colors` channel, the bot works in every channel.

## Setup

Requires Node.js 22.12 or newer.

1. Create an application in the [Discord Developer Portal](https://discord.com/developers/applications) and copy its bot token.
2. Invite the bot with the `bot` and `applications.commands` scopes and the **Manage Roles** permission:

   ```
   https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot+applications.commands&permissions=268435456
   ```

3. Create your environment file and fill it in:

   ```bash
   cp .env.example .env
   ```

   | Variable        | Description     |
   | --------------- | --------------- |
   | `DISCORD_TOKEN` | The bot's token |

4. Install and start:

   ```bash
   npm install
   npm run start:dev
   ```

The bot refuses to start if a required variable is missing. On startup it updates its slash commands, but only when they've changed.

## Roles

- Color roles are named `Color` plus the color, like `Color Red`, and are created the first time someone picks that color. They have no permissions.
- New color roles are moved just below the bot's role, so they show over other colored roles. If Discord refuses the move, the bot logs a warning and still gives the color.
- Roles are matched by name, so only roles named like `Color Red` count as color roles.
- The bot can only manage roles below its own role. Keep the bot's role above all color roles.
- A member's name uses the color of their highest colored role, so a colored role above the color roles overrides their pick.
- Discord allows 250 role creations per 48 hours. If that limit is reached, picking a new color fails until it resets. Colors that already have a role keep working.

## Docker

```bash
docker build -t eris .
docker run --env-file .env --restart unless-stopped eris
```

The image includes fonts because the color swatches need them to draw text.

## Running with pm2

Install [pm2](https://pm2.keymetrics.io/) globally first with `npm install -g pm2`, then run these from the project root so the bot finds `.env`:

| Command              | What it does                                                                |
| -------------------- | --------------------------------------------------------------------------- |
| `npm run pm2:deploy` | Builds the bot, then reloads it under pm2, or starts it if it's not running |
| `npm run pm2:start`  | Starts the already built bot under pm2 as `eris`                            |
| `npm run pm2:stop`   | Stops the bot                                                               |
| `npm run pm2:list`   | Shows the processes pm2 is managing                                         |

Use `pm2:deploy` after code changes, because `pm2:start` doesn't build. Only run one copy of the bot at a time, so stop `npm run start:dev` before using pm2. To start the bot again after the machine reboots, run `pm2 save` and `pm2 startup` once.

## Development

```bash
npm run build
npm run lint
npm run format
```

| Folder        | Contents                                                                       |
| ------------- | ------------------------------------------------------------------------------ |
| `src/discord` | Discord connection, command registration, routing and the #colors channel rule |
| `src/color`   | Color list, the color menu, swatch images and role changes                     |
| `src/ping`    | `/ping`                                                                        |
| `src/help`    | `/help`                                                                        |

Each feature service lists its own commands in a `commands` array, pairing each definition with its handler. To add a command, add an entry there, and register the service in `DiscordService` if it's new. `/help` picks it up automatically.

Colors are defined in `src/color/colors.ts`. To add one, put it in the right group, and it appears in `/color-list` after a restart.

## License

[MIT](LICENSE)
