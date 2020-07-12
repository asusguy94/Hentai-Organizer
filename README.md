# Warning

This is early alpha version of the next version, only use this if you're interested to see how far the project is coming!

## ~~Installation~~

1. Install NPM and then Yarn
2. Run `yarn start` within the project
3. Open [http://localhost:3000](http://localhost:3000) on the browser, to open the app
4. Make sure the backend scripts are running

## Backend scripts

Backend scripts are currently **not** available. It uses the same database structure as the current version,
and should work flawlessly.

## Features

Status of features can be found here [features.md](FEATURES.md)

## Special Requirements

This version has some special requirements (look above to see if there are any changes)

1.  video-thumbnails(WebVTT) to be generated, which can be done with the previous version.
2.  a folder must exist within the videos folder with the same name as the original file
    -   then the hls.files needs to be included in this folder with the exact name `playlist.m3u8`
