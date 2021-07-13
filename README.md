# HentaiJS

## Frontend Requirements

1. NodeJS
2. Modern Web Browser
3. Browser resolution set to 1920x1080 (not a hard requirement, but some stuff might be visually bugged otherwise)

## Backend Requirements (API & SERVER)

1. NodeJS
2. Database (preferable mariaDB) with known _port_, _username_, _password_, _Database Name_
3. FFMPEG and FFPROBE (one of the following) ([more info](https://github.com/fluent-ffmpeg/node-fluent-ffmpeg#prerequisites))
    1. Installed to the server-computer and added to path
    2. Installed to the server-computer and added to ENV
    3. Installed to the server-computer in the root folder of the SERVER-project

## Installation

1. Edit `config/server.ts`
   | Variable | Details |
   | :---: | --- |
   | `api` | The URL to the backend scripts |
   | `source` | The path to the old server...useful for grabbing images, and also to be able to play videos |
   | `db` | The root path for phpMyAdmin, it can usually be set to the same as `source` |

2. Edit `config/settings.ts`
   | Variable | Details |
   | :---: | --- |
   |`hls`|`enable`: Enable HLS playback (requires special files)<br/>`maxLevel`: Highest quality allowed by HLS<br/>`maxStartLevel`: Highest initial quality allowed by HLS |

3. Install NPM and then Yarn
4. Make sure the backend scripts are running, _scroll down for more info_

## Backend START

1. Navigate to the backend-scripts folder (where _app.js_ is located)
2. Run `npm i` to install the packages
3. Run `node app.js` to start the backend-scripts

## Frontend START

1. Navigate to the scripts folder (where _app.js_ is located)
2. Run `yarn` to install the packages
3. Run `yarn build` to build the scripts
4. Run `yarn server` to start the app

## Features

Status of functionality can be found at [features.md](FEATURES.md)

### Customization

You can easily change some functionality by altering some of the variables in `config/`

#### `server.ts`

Change this if your server has changed network address

#### `settings.ts`

Change this if you want to alter the functionality of the app app

#### `theme.ts`

Change this if you want a different look/feel of the app
