# Warning

This is early alpha version of the next version, only use this if you're interested to see how far the project is coming!

## Installation

1. Edit config.json
   | Variable | Details |
   | :---: | --- |
   | `api` | The URL to the backend scripts |
   | `source` | The path to the old server...usefull for grabbing images, and also to be able to play videos |

2. Install NPM and then Yarn
3. Make sure the backend scripts are running, _scroll down for more info_
4. Run `yarn start` within the project
5. Open [http://localhost:3000](http://localhost:3000) on the browser, to open the app

## Backend scripts

> Backend scripts can be found in the **_releases_** section. The backend script version needs to match the version of the app, so if the app is **version 0.0.2** the backend version also needs to be **version 0.0.2**

1. Run the backend scripts on a separate web-path. Using WAPMP / LAMP / XAMP should work fine.
2. Make sure the previous branch (@v2) of this app is running in the background

3. The backend scripts uses uses the same database structure as the current version, and should work without issues.

## Features

Status of functionality can be found at [features.md](FEATURES.md)

## Special Requirements

This version has some special requirements (look above to see if there are any changes)

1.  video-thumbnails(WebVTT) to be generated, which can be done with the previous version.
2.  a folder must exist within the videos folder with the same name as the original file
    -   then the hls.files needs to be included in this folder with the exact name `playlist.m3u8`
