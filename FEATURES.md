# Feature implementation status

## Priority Explanation

|  Priority  | Explanation                                                   |
| :--------: | ------------------------------------------------------------- |
|    HIGH    | Feature will be implemented as soon as possible               |
|    LOW     | Feature will take some time to implement, or might be removed |
| FUNCTIONAL | Feature is working, but not optimal                           |

## Issue Explanation

| Name               | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| VideoFileRename    | Solution breaks the VideoPlayer, so reloading is still the best solution |
| FranchiseVideoLink | Should use native link-tag instead of browser link-tag                   |
| ImportVideos       | Changes are not sent to the server, always uses the parsed data          |
| StarVideosHover    | Throws an error when hovering, still works though                        |

## :heavy_check_mark: Home Page

| Name           | Status             |
| -------------- | ------------------ |
| Recent Videos  | :heavy_check_mark: |
| Newest Videos  | :heavy_check_mark: |
| Popular Videos | :heavy_check_mark: |
| Random Videos  | :heavy_check_mark: |

## :x: Add Videos

| Name                | Status                                        |  Priority  |
| ------------------- | --------------------------------------------- | :--------: |
| Import Videos       | :heavy_check_mark: [Info](#issue-explanation) | FUNCTIONAL |
| Generate Thumbnails | :heavy_check_mark:                            |            |
| Generate WebVTT     | :x:                                           |    LOW     |

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
| Sort                 | :heavy_check_mark: |          |
| Category _CHECKBOX_  | :heavy_check_mark: |          |
| Attribute _CHECKBOX_ | :heavy_check_mark: |          |

## :heavy_check_mark: Star Search

### :heavy_check_mark: Main Section

| Name         | Status             |
| ------------ | ------------------ |
| Star         | :heavy_check_mark: |
| Star Counter | :heavy_check_mark: |

### :heavy_check_mark: Sidebar

| Name                  | Status             |
| --------------------- | ------------------ |
| Star Search _INPUT_   | :heavy_check_mark: |
| Breast _RADIO_        | :heavy_check_mark: |
| Haircolor _RADIO_     | :heavy_check_mark: |
| Hairstyle _RADIO_     | :heavy_check_mark: |
| Attributes _CHECKBOX_ | :heavy_check_mark: |

## :x: Video Page

### :heavy_check_mark: Heading

| Name             | Status             |
| ---------------- | ------------------ |
| Rename Title     | :heavy_check_mark: |
| Rename Franchise | :heavy_check_mark: |
| Copy Franchise   | :heavy_check_mark: |
| Edit Date        | :heavy_check_mark: |
| Next ID          | :heavy_check_mark: |

### :heavy_check_mark: Video

| Name            | Status                                        |  Priority  |
| --------------- | --------------------------------------------- | :--------: |
| Add Bookmark    | :heavy_check_mark:                            |            |
| UnCensor/Censor | :heavy_check_mark:                            |            |
| Remove Plays    | :heavy_check_mark:                            |            |
| Rename File     | :heavy_check_mark: [Info](#issue-explanation) | FUNCTIONAL |
| Copy Filename   | :heavy_check_mark:                            |            |
| Update Video    | :heavy_check_mark:                            |            |
| Delete Video    | :heavy_check_mark:                            |            |

### :x: Bookmark

| Name             | Status                 | Priority |
| ---------------- | ---------------------- | :------: |
| Add Star         | :heavy_check_mark:     |          |
| Remove Star      | :heavy_check_mark:     |          |
| Add Attribute    | :heavy_check_mark:     |          |
| Remove Attribute | :x: Remove 1 attribute |   HIGH   |
| Clear Attributes | :heavy_check_mark:     |          |
| Change Category  | :heavy_check_mark:     |          |
| Change Time      | :heavy_check_mark:     |          |
| Delete Bookmark  | :heavy_check_mark:     |          |
| [Hover]          | :heavy_check_mark:     |          |

### :heavy_check_mark: Other videos from same franchise

| Name      | Status                                        |  Priority  |
| --------- | --------------------------------------------- | :--------: |
| Plays     | :heavy_check_mark:                            |            |
| Thumbnail | :heavy_check_mark:                            |            |
| Title     | :heavy_check_mark:                            |            |
| Link      | :heavy_check_mark: [Info](#issue-explanation) | FUNCTIONAL |

### :heavy_check_mark: Stars

| Name          | Status             |
| ------------- | ------------------ |
| Add Bookmark  | :heavy_check_mark: |
| Add Attribute | :heavy_check_mark: |
| Remove Star   | :heavy_check_mark: |
| [Hover]       | :heavy_check_mark: |

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

## :heavy_check_mark: Star Page

### :heavy_check_mark: Dropbox

| Name         | Status             |
| ------------ | ------------------ |
| Drop Area    | :heavy_check_mark: |
| Delete Star  | :heavy_check_mark: |
| [ImageHover] | :heavy_check_mark: |

### :heavy_check_mark: Image

| Name         | Status             |
| ------------ | ------------------ |
| Delete Image | :heavy_check_mark: |

### :heavy_check_mark: Star Name

| Name   | Status             |
| ------ | ------------------ |
| Rename | :heavy_check_mark: |

### :heavy_check_mark: Input Fields

| Name               | Status             |
| ------------------ | ------------------ |
| Breast _INPUT_     | :heavy_check_mark: |
| Eye Color _INPUT_  | :heavy_check_mark: |
| Hair Color _INPUT_ | :heavy_check_mark: |
| Hair Style _INPUT_ | :heavy_check_mark: |

### :heavy_check_mark: Attribute input field

| Name             | Status             |
| ---------------- | ------------------ |
| Input            | :heavy_check_mark: |
| Attribute List   | :heavy_check_mark: |
| Remove Attribute | :heavy_check_mark: |

### :heavy_check_mark: Video list

| Name            | Status                                        |  Priority  |
| --------------- | --------------------------------------------- | :--------: |
| Video Thumbnail | :heavy_check_mark:                            |            |
| Video Title     | :heavy_check_mark:                            |            |
| [Hover]         | :heavy_check_mark: [Info](#issue-explanation) | FUNCTIONAL |
