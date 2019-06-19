<h1 align="center">Welcome to Maite Bot 👋</h1>
<p>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
</p>

> Discord bot that scrapes recipe from the website prochedemalade.com then send a daily meal to a discord channel

## Installing dependencies

```
npm i
```

## Configuration

- replace {{POSTGREUSERNAME}} by your postgresql username in the schema.psql file
- run the schema.psql file to create the tables in your postgresql database

Create a `.env` file (or as environment variables) at the root of the repository with these keys from the discord API and the POSTGRESQL database url:
```
DISCORD_TOKEN=
DATABASE_URL=
```

## Usage

```sh
npm run start
```

Once the bot is up and running, here is the discord commands:
```
!menu // Get a menu
ortolan // Misterious command
```

## Dependencies

```
"dependencies": {
    "async": "^2.6.2",
    "cheerio": "^1.0.0-rc.2",
    "discord.io": "github:izy521/discord.io",
    "dotenv": "^6.2.0",
    "express": "^4.16.4",
    "pg": "^7.10.0",
    "q": "^1.5.1",
    "request": "^2.88.0"
  }
```

## Author

👤 **Patrice Lynde**

* Github: [@patricelynde](https://github.com/patricelynde)
