# Feature implementation status

|  Priority  | Explanation                                                                  |
| :--------: | ---------------------------------------------------------------------------- |
|    HIGH    | Feature will be implemented as soon as possible                              |
|    LOW     | Feature will take some time to implement, or might be removed                |
| FUNCTIONAL | The functionality of the feature is implemented, but might be improved later |

## :heavy_check_mark: Home Page

| Name           | Status             |
| -------------- | ------------------ |
| Recent Videos  | :heavy_check_mark: |
| Newest Videos  | :heavy_check_mark: |
| Popular Videos | :heavy_check_mark: |
| Random Videos  | :heavy_check_mark: |

## :x: Add Videos

## :x: Video Search

### :heavy_check_mark: Main Section

| Name          | Status             |
| ------------- | ------------------ |
| Video         | :heavy_check_mark: |
| Video Ribbon  | :heavy_check_mark: |
| Video Counter | :heavy_check_mark: |

### :x: Sidebar

| Name                 | Status             | Priority |
| -------------------- | ------------------ | :------: |
| Censored _TOGGLE_    | :x:                |   HIGH   |
| Star _TOGGLE_        | :x:                |   HIGH   |
| Quality _TOGGLE_     | :x:                |   HIGH   |
| Title Search _INPUT_ | :heavy_check_mark: |          |
| Existing _TOGGLE_    | :x:                |   LOW    |
| Sort                 | :heavy_check_mark: |          |
| Category _CHECKBOX_  | :heavy_check_mark: |          |
| Attribute _CHECKBOX_ | :heavy_check_mark: |          |

## :x: Star Search

### :heavy_check_mark: Main Section

| Name         | Status             |
| ------------ | ------------------ |
| Star         | :heavy_check_mark: |
| Star Counter | :heavy_check_mark: |

### :x: Sidebar

| Name                  | Status             | Priority |
| --------------------- | ------------------ | :------: |
| Star Search _INPUT_   | :heavy_check_mark: |          |
| Breast _RADIO_        | :heavy_check_mark: |          |
| Eyecolor _RADIO_      | :x:                |   LOW    |
| Haircolor _RADIO_     | :heavy_check_mark: |          |
| Hairstyle _RADIO_     | :x:                |   HIGH   |
| Attributes _CHECKBOX_ | :heavy_check_mark: |          |

## :x: Stars

## :x:Generate Thumbnails

## :x:Generate WebVTT

## :x: Video Page

### :heavy_check_mark: Heading

| Name             | Status                         |  Priority  |
| ---------------- | ------------------------------ | :--------: |
| Rename Title     | :heavy_check_mark: Page reload | FUNCTIONAL |
| Rename Franchise | :heavy_check_mark: Page reload | FUNCTIONAL |
| Copy Franchise   | :heavy_check_mark:             |            |
| Edit Date        | :heavy_check_mark:             |            |
| Next ID          | :heavy_check_mark:             |            |

### :x: Video

| Name             | Status                                |  Priority  |
| ---------------- | ------------------------------------- | :--------: |
| Add Bookmark     | :heavy_check_mark:                    |            |
| UnCensor/Censor  | :heavy_check_mark:                    |            |
| Remove Plays     | :heavy_check_mark:                    |            |
| Rename File      | :heavy_check_mark: Page reload        | FUNCTIONAL |
| Copy Filename    | :heavy_check_mark:                    |            |
| Update Video     | :x: replace existing data in database |    HIGH    |
| Update Bookmarks | :x: offset bookmarks by 6 seconds     |    HIGH    |
| Delete Video     | :x:                                   |    HIGH    |

### :x: Bookmark

| Name              | Status             | Priority |
| ----------------- | ------------------ | :------: |
| Add Star          | :x:                |   HIGH   |
| Remove Star       | :heavy_check_mark: |          |
| Add Attribute     | :heavy_check_mark: |          |
| Remove Attributes | :heavy_check_mark: |          |
| Change Category   | :heavy_check_mark: |          |
| Change Time       | :heavy_check_mark: |          |
| Delete Bookmark   | :heavy_check_mark: |          |
| [Hover]           | :heavy_check_mark: |          |

### :heavy_check_mark: Other videos from same franchise

| Name      | Status                                            |  Priority  |
| --------- | ------------------------------------------------- | :--------: |
| Plays     | :heavy_check_mark: user-reload to refresh         | FUNCTIONAL |
| Thumbnail | :heavy_check_mark:                                |            |
| Title     | :heavy_check_mark:                                |            |
| Link      | :heavy_check_mark: uses `<a>` should use `<Link>` | FUNCTIONAL |

### :heavy_check_mark: Stars

| Name                 | Status                         |  Priority  |
| -------------------- | ------------------------------ | :--------: |
| Add Bookmark         | :heavy_check_mark:             |            |
| Add Global Attribute | :heavy_check_mark: Page reload | FUNCTIONAL |
| Remove Star          | :heavy_check_mark:             |            |
| [Hover]              | :heavy_check_mark:             |            |

## :heavy_check_mark: Form

| Name             | Status             |
| ---------------- | ------------------ |
| Add Star _INPUT_ | :heavy_check_mark: |
| Add NoStar-label | :heavy_check_mark: |

## :heavy_check_mark: Used Attributes

| Name       | Status             |
| ---------- | ------------------ |
| Attributes | :heavy_check_mark: |
| [Hover]    | :heavy_check_mark: |

## :x: Star Page

### :x: Dropbox

| Name        | Status             | Priority |
| ----------- | ------------------ | :------: |
| Drop Area   | :heavy_check_mark: |          |
| Delete Star | :x:                |   HIGH   |

### :x: Image

| Name         | Status             | Priority |
| ------------ | ------------------ | :------: |
| Delete Image | :heavy_check_mark: |          |
| Delete Star  | :x:                |   HIGH   |

### :x: Star Name

| Name   | Status | Priority |
| ------ | ------ | :------: |
| Rename | :x:    |   HIGH   |

### :heavy_check_mark: Input Fields

| Name               | Status             |
| ------------------ | ------------------ |
| Breast _INPUT_     | :heavy_check_mark: |
| Eye Color _INPUT_  | :heavy_check_mark: |
| Hair Color _INPUT_ | :heavy_check_mark: |
| Hair Style _INPUT_ | :heavy_check_mark: |

### :heavy_check_mark: Attribute input field

| Name             | Status                         |  Priority  |
| ---------------- | ------------------------------ | :--------: |
| Input            | :heavy_check_mark:             |            |
| Attribute List   | :heavy_check_mark:             |            |
| Remove Attribute | :heavy_check_mark: Page reload | FUNCTIONAL |

### :heavy_check_mark: Video list
