# Hentai NextJS

## Requirements

1. Modern Web Browser
2. Browser resolution set to 1920x1010 (not a hard requirement, but some stuff might be visually bugged otherwise)
3. Yarn package manger
4. Database (preferable mariaDB)
   - host
   - username
   - password
   - database
5. Docker application (eg. Docker Desktop) (optional)

## Installation

Any setting ending with `*` is required

### List of settings

| Keyword                        | Description                                                                                        |
| ------------------------------ | -------------------------------------------------------------------------------------------------- |
| DATABASE_URL\*                 | The database URL for your chosen database                                                          |
| NEXT_PUBLIC_PLAYER_QUALITY_MAX | The max quality to use (default=`1080`)                                                            |
| NEXT_PUBLIC_PLAYER_THUMBNAILS  | Weather generated thumbnails should be used (default=`false`)                                      |
| PORT\*                         | _Only required for docker._ The port used for the application (default=`3000`)                     |
| PATH\*                         | _Only docker._ The path to map to `app/media` (this directory should contain a `videos`-directory) |

### With Docker

Since variables are saved when the program is built, there is currently no easy way to change settings.

#### Variables that starts with NEXT_PUBLIC\_

The following workaround is only required for settings that starts with `NEXT_PUBLIC_`.
While I work on a solution, you can open the devtools (on one of the pages of the running app) in your browser and go to `console`, and then write the following command

```js
localStorage['NEXT_PUBLIC_QUALITY_MAX'] = '720'
```

This will set the variable `NEXT_PUBLIC_QUALITY_MAX` to `720`

#### Other Variables

Map the required path, port, and variables, [see the table above](#list-of-settings)

### Without Docker

Add a `videos`-directory inside a `media`-directory in the `root`-directory, and place all your videos within the `videos`-directory

`sample.env` can be found in the root-directory, just rename it to `.env`, and change the data of the file.

Change any required/optional variables [see the table above](#list-of-settings)

Run the following command to generate your database structure

```bash
   yarn prisma db push
```

## Starting the app

### Starting the app with docker

Start the docker container

### Starting the app without docker

Run the following command

```bash
yarn build && yarn start
```

## Features

Status of functionality can be found at [features.md](FEATURES.md)
