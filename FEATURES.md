# Feature implementation status

## :heavy_check_mark: Home Page

| Name           | Status             |
| -------------- | ------------------ |
| Recent Videos  | :heavy_check_mark: |
| Newest Videos  | :heavy_check_mark: |
| Popular Videos | :heavy_check_mark: |
| Random         | :heavy_check_mark: |

## :x: Add Videos

## :x: Video Search

## :heavy_check_mark: Videos

## :x: Star Search

## :x: Stars

## :x: Franchises

## :x:Generate Thumbnails

## :x:Generate WebVTT

## Video Page

### :heavy_check_mark: Heading

| Name             | Status             |             Priority              |
| ---------------- | ------------------ | :-------------------------------: |
| Rename Title     | :x:                |               HIGH                |
| Rename Franchise | :x:                |               HIGH                |
| Add Alias        | :x:                | LOW...might remove alias from app |
| Copy Franchise   | :heavy_check_mark: |                                   |
| Edit Date        | :heavy_check_mark: |                                   |

### :heavy_check_mark: Video

| Name             | Status                                  |         Priority          |
| ---------------- | --------------------------------------- | :-----------------------: |
| Add Bookmark     | :heavy_check_mark:                      |                           |
| Uncensor/Censor  | :heavy_check_mark:                      |                           |
| Create Thumbnail | :x:                                     | LOW...did not work before |
| Remove Plays     | :heavy_check_mark:                      |                           |
| Rename File      | :x:                                     |           HIGH            |
| Copy Filename    | :heavy_check_mark:                      |                           |
| Update Video     | :x: _replace existing data in database_ |           HIGH            |
| Update Bookmarks | :x: _offset bookmarks by 6 seconds_     |           HIGH            |
| Delete Video     | :x:                                     |           HIGH            |

### :x: Bookmark

-   Hover elements are broken

| Name              | Status             | Priority | Reason |
| ----------------- | ------------------ | :------: | ------ |
| Add Star          | :x:                |   HIGH   |
| Remove Star       | :x:                |   HIGH   |
| Add Attribute     | :heavy_check_mark: |          |
| Remove Attributes | :x:                |   HIGH   |
| Change Category   | :heavy_check_mark: |          |
| Change Time       | :heavy_check_mark: |          |
| Delete            | :heavy_check_mark: |          |

### :heavy_check_mark: Other videos from same franchise

| Name      | Status                                                   |         Priority         |
| --------- | -------------------------------------------------------- | :----------------------: |
| Plays     | :x:                                                      |           HIGH           |
| Thumbnail | :heavy_check_mark:                                       |                          |
| Title     | :heavy_check_mark:                                       |                          |
| Link      | :x: _currently links by `<a>` should link with `<Link>`_ | LOW...working fine as is |

### :heavy_check_mark: Stars

| Name                 | Status             | Priority |
| -------------------- | ------------------ | :------: |
| Add Bookmark         | :heavy_check_mark: |          |
| Add Global Attribute | :x:                |   HIGH   |
| Remove               | :heavy_check_mark: |          |

## :heavy_check_mark: Form

| Name             | Status                    |                   Priority                   |
| ---------------- | ------------------------- | :------------------------------------------: |
| Add Category     | :x: _create new category_ | LOW...might remove related database from app |
| Add Star         | :heavy_check_mark:        |                                              |
| Add NoStar-label | :heavy_check_mark:        |                                              |

### :x: Used Attributes

## Star Page

### :x: Dropbox

### :heavy_check_mark: Image

| Name         | Status | Priority |
| ------------ | ------ | :------: |
| Delete Image | :x:    |   HIGH   |
| Delete Star  | :x:    |   HIGH   |

### :heavy_check_mark: Title

| Name   | Status | Priority |
| ------ | ------ | :------: |
| Rename | :x:    |   HIGH   |

### :x: Input Fields

### :x: Attribute input field

### :x: Video list

_missing hover action_
_img instead of video_
