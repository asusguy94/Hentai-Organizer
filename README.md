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

| Keyword                         | Description                                                                                        |
| ------------------------------- | -------------------------------------------------------------------------------------------------- |
| DATABASE_URL\*                  | The database URL for your chosen database                                                          |
| NEXT_PUBLIC_DB_ADMIN            | The url for the DB-link in the navbar _(default=`/db`)_                                            |
| NEXT_PUBLIC_TIMELINE_OFFSET     | The left offset of the timeline (default=`1`)                                                      |
| NEXT_PUBLIC_TIMELINE_SPACING    | The max allowed horizontal spacing between bookmarks (default=`0`)                                 |
| NEXT_PUBLIC_PLAYER_DURATIONDIFF | The max allowed difference of a video's duration and the reported duration (default=`1`)           |
| NEXT_PUBLIC_PLAYER_THUMBNAILS   | Weather generated thumbnails should be used (default=`false`)                                      |
| THUMBNAIL_RES                   | The height used for thumbnails (default=`290`)                                                     |
| PORT\*                          | _Only required for docker._ The port used for the application (default=`3000`)                     |
| PATH\*                          | _Only docker._ The path to map to `app/media` (this directory should contain a `videos`-directory) |

### With Docker

Since variables are saved when the program is built, there is currently no easy way to change settings.

#### Variables that starts with NEXT_PUBLIC\_

The following workaround is only required for settings that starts with `NEXT_PUBLIC_`.
While I work on a solution, you can open the devtools (on one of the pages of the running app) in your browser and go to `console`, and then write the following command

```js
localStorage['NEXT_PUBLIC_TIMELINE_OFFSET'] = '4'
```

This will set the variable `NEXT_PUBLIC_TIMELINE_OFFSET` to `4`

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
