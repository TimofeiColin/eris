# Eris

A Discord bot that lets server members choose their name color from 148 colors, grouped into 11 families. Built with NestJS and discord.js. It also runs an HTTP API for managing the colors, see [API](#api).

## Commands

| Command         | What it does                                                                    |
| --------------- | ------------------------------------------------------------------------------- |
| `/color-list`   | Browse the colors by group, see them as real swatches and pick one for yourself |
| `/color-create` | Browse the colors and create roles for them, without assigning them             |
| `/color-reset`  | Remove all of your color roles                                                  |
| `/help`         | Show all available commands                                                     |
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

If the server has a text channel named `colors`, the bot only answers commands there and in its threads. Anywhere else, it replies privately and points to that channel. Without a `colors` channel, the bot works in every channel. You can change the channel name with `BOT_CHANNEL_NAME`, or turn the rule off by leaving it empty.

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

| Endpoint                       | What it does                                                                                          |
| ------------------------------ | ----------------------------------------------------------------------------------------------------- |
| `GET /api/dashboard-stats`     | Number of color groups and colors                                                                     |
| `GET /api/color-groups`        | Color groups with their `_id`, `name` and `colorsCount`, 6 per page. Query: `page` (1 to 100), `name` |
| `GET /api/color-group`         | `{ "exists": true }` if a group has exactly that name, in any case. Query: `name`                     |
| `POST /api/color-groups`       | Creates a group. Body: `{ "name": "Neon" }`. `409` if the name is taken, in any case                  |
| `PATCH /api/color-groups/:id`  | Renames a group. Body: `{ "name": "Neon" }`. `409` if another group has that name, in any case        |
| `DELETE /api/color-groups/:id` | Deletes a group. `409` while the group still has colors                                               |
| `GET /api/colors-by-group`     | The `_id` and `name` of every color in a group. Query: `groupId`                                      |

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

Creating, renaming and deleting return `{ "message": "ok" }`. Invalid input returns `400` with a list of what's wrong, and an unknown group id returns `404`.

Browser apps on other origins can call the API, because CORS is enabled for all origins. The API key still protects every route.

## Roles

- Color roles are named `Color` plus the color, like `Color Red`, and are created the first time someone picks that color. They have no permissions.
- New color roles are moved just below the bot's role, so they show over other colored roles. If Discord refuses the move, the bot logs a warning and still gives the color.
- Roles are matched by name, so only roles named like `Color Red` count as color roles.
- The bot can only manage roles below its own role. Keep the bot's role above all color roles.
- A member's name uses the color of their highest colored role, so a colored role above the color roles overrides their pick.
- Discord allows 250 role creations per 48 hours. If that limit is reached, picking a new color fails until it resets. Colors that already have a role keep working.

## Database

Migrations and seeds are run with [umzug](https://github.com/sequelize/umzug). Indexes are created by migrations only, so the bot doesn't build them on startup. Each one runs only once: the database records what has run in the `migrations` and `seeds` collections.

| Command                | What it does                                                              |
| ---------------------- | ------------------------------------------------------------------------- |
| `npm run migrate`      | Runs pending migrations                                                   |
| `npm run migrate:down` | Undoes the last migration                                                 |
| `npm run seed`         | Runs pending migrations, then pending seeds (the color groups and colors) |
| `npm run seed:down`    | Undoes the last seed                                                      |

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

| Folder            | Contents                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `src/bot/discord` | Discord connection, command registration, routing and the #colors channel rule                                                  |
| `src/bot/color`   | The color commands and menu, with `render/` for images and menu layout, `helpers/` for role names and `types/` for shared types |
| `src/bot/ping`    | `/ping`                                                                                                                         |
| `src/bot/help`    | `/help`                                                                                                                         |
| `src/api`         | The HTTP API, one folder per area with its controller, service, `dto/` for inputs and `api-responses/` for Swagger examples     |
| `src/api/guards`  | The API key guard                                                                                                               |
| `src/api/utils`   | Pagination helpers for building responses                                                                                       |
| `src/database`    | MongoDB connection, schemas, repositories, migrations and seeds, with `utils/` for pagination queries                           |
| `src/common`      | Small shared helpers                                                                                                            |

Each feature service lists its own commands in a `commands` array, pairing each definition with its handler. To add a command, add an entry there, and register the service in `DiscordService` if it's new. `/help` picks it up automatically.

Colors live in MongoDB, in the `color_groups` and `colors` collections. The bot reads them each time a color command runs, so changes show up without a restart. Each group needs a name, and each color a name, a hex code like `#FF0000` and its group's `_id`. Hex codes in any case are accepted and saved in uppercase. To add colors in a way that's repeatable, write a new seed.

## License

[MIT](LICENSE)
