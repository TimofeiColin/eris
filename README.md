# Eris

A Discord bot that lets server members choose their name color from 148 colors, grouped into 11 families, and replies to chat messages with responses you set up, see [Bot responses](#bot-responses). Built with NestJS and discord.js. It also runs an HTTP API for managing the colors and bot responses, see [API](#api).

## Commands

| Command         | What it does                                                                    |
| --------------- | ------------------------------------------------------------------------------- |
| `/color-list`   | Browse the colors by group, see them as real swatches and pick one for yourself |
| `/color-create` | Browse the colors and create roles for them, without assigning them             |
| `/color-reset`  | Remove all of your color roles                                                  |
| `/help`         | Show all available commands                                                     |
| `/responses`    | Show the messages the bot replies to                                            |
| `/fun`          | Show the fun commands                                                           |
| `/ping`         | Check that the bot is responding                                                |

The color commands only work in servers. All replies about colors are visible only to the person who used the command.

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

If the server has a text channel named `colors`, the bot only answers slash commands there and in its threads. Anywhere else, it replies privately and points to that channel. Without a `colors` channel, the bot works in every channel. You can change the channel name with `BOT_CHANNEL_NAME`, or turn the rule off by leaving it empty. [Bot responses](#bot-responses) aren't limited by this rule.

## Bot responses

The bot reads messages in every channel it can see and replies when a whole message is `!!` followed by one of the stored commands, like `!!good morning`. Each command has a list of responses, and the bot picks one at random.

- Matching ignores case and spaces around the message, so `!!Good Morning` matches `good morning`.
- The message must be only `!!` and the command: `!!hi` matches `hi`, and so does `!! hi`, but `hi`, `!!!hi`, `well, !!hi`, `!!I said hi` and `!!hi!` don't.
- A response that is only an `https` link to a `.png`, `.jpg`, `.gif` or `.webp` image is downloaded and uploaded as an image, up to 10 MB, so it shows even when Discord doesn't preview the link. If the download fails, the bot sends the link. The bot needs the Attach Files permission for this.
- The bot ignores other bots and itself, and never pings anyone from a response, even if it contains `@everyone`.

Use `/responses` to see the commands in Discord, and manage them with the [API](#endpoints) or the [MCP](#mcp) tools. `npm run seed` adds a few to start with. The bot keeps them in memory and reloads them whenever they change through the API, so edits take effect right away. Changes made directly in MongoDB or by a seed show up after the bot restarts.

## Fun commands

Send one of these as its own message, in any case, and the bot replies in that channel:

| Message      | Reply                                                                                               | Source                                        | API limit      |
| ------------ | --------------------------------------------------------------------------------------------------- | --------------------------------------------- | -------------- |
| `!!!neko`    | A random neko picture, uploaded in an embed                                                         | [nekos.best](https://nekos.best)              | 200 a minute   |
| `!!!joke`    | A one-line joke. Safe mode leaves out NSFW, religious, political, racist, sexist and explicit jokes | [JokeAPI](https://v2.jokeapi.dev)             | 120 a minute   |
| `!!!funfact` | A random fun fact                                                                                   | [Useless Facts](https://uselessfacts.jsph.pl) | None published |

The bot fetches nekos 20 at a time and jokes 10 at a time and uses them one by one, so it stays well under the limits. Fun facts are fetched one per message, since that API has no batches. If a source can't be reached, the bot says to try again later. These live in `src/bot/fun`: `FunService` gets every message and passes it to the service whose command matches.

## Setup

Requires Node.js 22.12 or newer.

1. Create an application in the [Discord Developer Portal](https://discord.com/developers/applications) and copy its bot token. On the **Bot** page, turn on **Message Content Intent**, which the bot needs to read messages for bot responses. Without it, the bot can't log in.
2. Invite the bot with the `bot` and `applications.commands` scopes and the **Manage Roles**, **View Channels**, **Send Messages** and **Read Message History** permissions:

   ```
   https://discord.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&scope=bot+applications.commands&permissions=268504064
   ```

3. Create your environment file and fill it in:

   ```bash
   cp .env.example .env
   ```

   | Variable                     | Description                                                                                                       |
   | ---------------------------- | ----------------------------------------------------------------------------------------------------------------- |
   | `DISCORD_TOKEN`              | The bot's token                                                                                                   |
   | `MONGODB_URI`                | MongoDB connection string, e.g. `mongodb://localhost:27017/eris`                                                  |
   | `API_KEY`                    | Secret key for the API, sent as a Bearer token. Generate one with `openssl rand -hex 32`                          |
   | `PORT`                       | Optional. Port the API listens on, from 1 to 65535, default `3000`                                                |
   | `API_PREFIX`                 | Optional. Path every API route starts with, default `api`                                                         |
   | `BOT_CHANNEL_NAME`           | Optional. The channel the bot answers in, default `colors`. Leave it empty to answer everywhere                   |
   | `COLOR_ROLE_PREFIX`          | Optional. Start of every color role's name, default `Color `. Keep the quotes when it ends in a space: `"Color "` |
   | `COLORS_PER_PAGE`            | Optional. Colors on each menu page, from 1 to 25, default `6`                                                     |
   | `COLOR_MENU_TIMEOUT_SECONDS` | Optional. How long the color menu stays open without use, from 10 to 840, default `300`                           |

4. Install, fill the database and start:

   ```bash
   npm install
   npm run seed
   npm run start:dev
   ```

The bot refuses to start if a required variable is missing. On startup it updates its slash commands, but only when they've changed.

## API

Alongside the Discord bot, Eris runs an HTTP API on `PORT` (default `3000`). Every route starts with `API_PREFIX` (default `api`), and the server accepts connections from your local network, not only from `localhost`.

### Docs

While you run `npm run start:dev`, interactive docs are at **http://localhost:3000/api/docs**, and the raw OpenAPI JSON at `/api/docs-json`. Click **Authorize**, paste your `API_KEY`, and you can try every route from the browser. The docs are only served when `NODE_ENV` is `development`, so they're off under Docker, pm2 and `npm run start`.

### Authentication

Every route needs your `API_KEY` as a Bearer token. A missing or wrong key returns `401`.

```bash
curl -H "Authorization: Bearer YOUR_API_KEY" http://localhost:3000/api/dashboard-stats
```

### Endpoints

| Endpoint                        | What it does                                                                                                                                                                         |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GET /api/dashboard-stats`      | Number of color groups, colors and bot responses                                                                                                                                     |
| `GET /api/color-groups`         | Color groups with their `_id`, `name` and `colorsCount`, 6 per page. Query: `page` (1 to 100), `name`                                                                                |
| `GET /api/color-groups-names`   | The `_id` and `name` of every color group, not paginated                                                                                                                             |
| `GET /api/color-group`          | One group's `_id` and `name`. Query: either `id` or `name` (exact, any case). `404` if none matches                                                                                  |
| `POST /api/color-groups`        | Creates a group. Body: `{ "name": "Neon" }`. `409` if the name is taken, in any case                                                                                                 |
| `PATCH /api/color-groups/:id`   | Renames a group. Body: `{ "name": "Neon" }`. `409` if another group has that name, in any case                                                                                       |
| `DELETE /api/color-groups/:id`  | Deletes a group. `409` while the group still has colors                                                                                                                              |
| `GET /api/color`                | One color's `_id`, `name`, `hex` and `group`. Query: either `id` or `name` (exact, any case). `404` if none matches                                                                  |
| `GET /api/colors`               | Colors with their `_id`, `name`, `hex`, `group` and `groupName`, 6 per page. Query: `page` (1 to 100), `name` (part of the name, any case), `groupId`                                |
| `GET /api/colors-names`         | The `_id` and `name` of every color in a group. Query: `groupId`                                                                                                                     |
| `POST /api/colors`              | Creates a color. Body: `{ "name": "Neon Green", "hex": "#39FF14", "groupId": 4 }`, all required. `404` if the group doesn't exist, `409` if the name is taken, in any case           |
| `PATCH /api/colors/:id`         | Edits a color. Same body as create, all required. `409` if another color has that name, in any case                                                                                  |
| `DELETE /api/colors/:id`        | Deletes a color                                                                                                                                                                      |
| `GET /api/bot-responses`        | Bot responses with their `_id`, `command` and `responses`, 6 per page. Query: `page` (1 to 100), `command` and `response` (part of the text, any case)                               |
| `POST /api/bot-responses`       | Creates a bot response. Returns the saved entry. Body: `{ "command": "good morning", "responses": ["Good morning! ☀️"] }`, both required. `409` if the command is taken, in any case |
| `PATCH /api/bot-responses/:id`  | Edits a bot response. Returns the saved entry. Same body as create, both required. `409` if another entry has that command, in any case                                              |
| `DELETE /api/bot-responses/:id` | Deletes a bot response                                                                                                                                                               |

`name` on `GET /api/color-groups` matches part of a name in any case, so `re` finds Red and Green. Its response is paginated:

```json
{
  "page": 1,
  "totalPages": 2,
  "hasNextPage": true,
  "hasPreviousPage": false,
  "items": [{ "_id": 1, "name": "Red", "colorsCount": 9 }]
}
```

Creating returns `201` and editing or deleting returns `200`, all with `{ "message": "ok" }`, except creating and editing bot responses, which return the saved entry. Invalid input returns `400` with what's wrong. A group or color that doesn't exist returns `404`.

Group names and color names are unique in any case, so `Red` and `red` can't both exist. The database enforces this too. Color names can be up to 90 characters, so they still fit in a Discord role name with the `Color ` prefix, and hex codes are saved in uppercase.

Renaming or deleting a color through the API doesn't touch Discord. Members keep the role with the old name, and the bot no longer counts it as a color role. A deleted color's role stays in the server until you remove it.

Browser apps on other origins can call the API, because CORS is enabled for all origins. The API key still protects every route.

## MCP

Eris also runs an [MCP](https://modelcontextprotocol.io) server, so AI assistants and other MCP clients can read and add bot responses. It's at `http://localhost:3000/mcp` (outside `API_PREFIX`), uses the Streamable HTTP transport, and needs the same `API_KEY` as a Bearer token.

| Tool                   | What it does                                                                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `get_bot_responses`    | Lists every bot response as `{ "id", "command", "replies" }`. Read only                                                                                             |
| `create_bot_responses` | Creates bot responses from a list of `{ "command", "replies" }`. Commands that already exist, in any case, are skipped and reported, and the rest are still created |

For a client that's configured with a JSON file, the entry looks like this:

```json
{
  "mcpServers": {
    "eris": {
      "type": "http",
      "url": "http://localhost:3000/mcp",
      "headers": { "Authorization": "Bearer YOUR_API_KEY" }
    }
  }
}
```

## Roles

- Color roles are named `Color` plus the color, like `Color Red`, and are created the first time someone picks that color. They have no permissions.
- New color roles are moved just below the bot's role, so they show over other colored roles. If Discord refuses the move, the bot logs a warning and still gives the color.
- Roles are matched by name, so only roles named like `Color Red` count as color roles.
- The bot can only manage roles below its own role. Keep the bot's role above all color roles.
- A member's name uses the color of their highest colored role, so a colored role above the color roles overrides their pick.
- Discord allows 250 role creations per 48 hours. If that limit is reached, picking a new color fails until it resets. Colors that already have a role keep working.

## Database

Migrations and seeds are run with [umzug](https://github.com/sequelize/umzug). Indexes are created by migrations only, so the bot doesn't build them on startup. Each one runs only once: the database records what has run in the `migrations` and `seeds` collections.

| Command                | What it does                                                                                     |
| ---------------------- | ------------------------------------------------------------------------------------------------ |
| `npm run migrate`      | Runs pending migrations                                                                          |
| `npm run migrate:down` | Undoes the last migration                                                                        |
| `npm run seed`         | Runs pending migrations, then pending seeds (the color groups, colors and starter bot responses) |
| `npm run seed:down`    | Undoes the last seed                                                                             |

After pulling changes, run `npm run migrate` so existing databases get new migrations. Migrations 002 and 003 make group and color names unique in any case, and 004 creates the `bot_responses` collection.

To add one, create a file in `src/database/migrations/` or `src/database/seeds/` and add it to the list in that folder's `index.ts`. These commands need the dev dependencies. From a built copy, such as the Docker image, run `node dist/database/cli seed` instead.

## Docker

`docker-compose.yml` runs the bot together with its own MongoDB, so you only need `DISCORD_TOKEN` and `API_KEY` in `.env`:

```bash
docker compose up -d mongo
docker compose run --rm bot node dist/database/cli seed
docker compose up -d
```

The first two commands start the database and fill it with the colors, which you only need to do once. The last one starts the bot. Its API is published on the `PORT` from `.env`, default `3000`, at `http://localhost:3000/api`. After pulling code changes, rebuild with `docker compose up -d --build`.

These commands use Docker Compose v2, which comes with current Docker installs. If you have the older standalone version instead, write `docker-compose` with a hyphen, for example `docker-compose up -d`. Run `docker compose version` to check which you have. The database is kept in the `mongo-data` volume and isn't reachable from outside Docker, so it doesn't clash with a MongoDB already running on your machine.

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

| Folder             | Contents                                                                                                                          |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `src/bot/discord`  | Discord connection, command registration, routing and the #colors channel rule                                                    |
| `src/bot/color`    | The color commands and menu, with `render/` for images and menu layout, `helpers/` for role names and `types/` for shared types   |
| `src/bot/ping`     | `/ping`                                                                                                                           |
| `src/bot/help`     | `/help`                                                                                                                           |
| `src/bot/response` | Replies to `!!` plus a stored command                                                                                             |
| `src/bot/fun`      | `!!!neko`, `!!!joke` and `!!!funfact`, routed by `FunService`                                                                     |
| `src/api`          | The HTTP API, one folder per area with its controller, service, `dto/` for inputs and `api-responses/` for its Swagger examples   |
| `src/api/swagger`  | Swagger examples used by more than one area, like `{ "message": "ok" }`                                                           |
| `src/api/guards`   | The API key guard and the `@ApiKeyAuth()` decorator that adds it to a controller                                                  |
| `src/api/dto`      | Base DTOs shared by the API areas: `PaginationQueryDto` and `IdOrNameQueryDto`                                                    |
| `src/api/utils`    | Shared API code: pagination helpers and page sizes, error helpers, and input helpers like `trimString`, `toNumber` and `@IsHex()` |
| `src/database`     | MongoDB connection, schemas, repositories, migrations and seeds, with `utils/` for query helpers like `escapeRegex`               |
| `src/cache`        | In-memory cache of bot responses, reloaded when they change                                                                       |
| `src/mcp`          | The MCP server, with one folder per area for its tools, like `bot-responses/`                                                     |
| `src/bot/utils`    | Small helpers for the bot, like the error logger                                                                                  |

Each feature service lists its own commands in a `commands` array, pairing each definition with its handler. To add a command, add an entry there, and register the service in `DiscordService` if it's new. `/help` picks it up automatically.

Colors live in MongoDB, in the `color_groups` and `colors` collections. The bot reads them each time a color command runs, so changes show up without a restart. Each group needs a name, and each color a name, a hex code like `#FF0000` and its group's `_id`. Hex codes in any case are accepted and saved in uppercase. To add colors in a way that's repeatable, write a new seed.

## License

[MIT](LICENSE)
