<h1 align="center">Welcome to Maite Bot 👋</h1>
<p>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
</p>

> Discord bot that Retrieve recipe from spoontacular API then send daily meals to a discord channel

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy?template=https://github.com/patricelynde/DiscordMaiteBot)

## Installing dependencies

```
npm i
```

## Configuration

Create a `.env` file (or as environment variables) at the root of the repository with these keys from the discord API and the spoontacular API:
```
DISCORD_TOKEN=
SPOONTACULAR_TOKEN=
```

## Usage

```sh
npm run start
```

Once the bot is up and running, here is the discord commands:
```
$menu // Get a menu
ortolan // Mysterious command
```

## Dependencies

```
"dependencies": {
    "discord.io": "github:izy521/discord.io",
    "dotenv": "^6.2.0",
    "request": "^2.88.0"
}
```

## Author

👤 **Patrice Lynde**

* Github: [@patricelynde](https://github.com/patricelynde)
