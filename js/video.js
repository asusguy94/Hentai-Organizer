const videoWrapper = document.getElementById('video')
const videoPlayer = document.getElementsByTagName('video')[0]
const hlsSource = document.querySelector('source[data-type="hls"]')
const dashSource = document.querySelector('source[data-type="dash"]')
const videoID = new URL(location.href).searchParams.get('id')

const vtt_source = `vtt/${videoID}.vtt`
const bookmark = document.getElementsByClassName('bookmark')

onFocus(videoStats)

bookmarkCollision()
bookmarkTooltip()
starTooltip()
attributeTooltip()

const plyrPlayer = new Plyr(videoPlayer, {
    'controls': ['play-large', 'play', 'current-time', 'progress', 'duration', 'fullscreen'],
    'ratio': '21:9',
    'invertTime': false,
    'toggleInvert': false,
    'seekTime': 1,
    'previewThumbnails': {enabled: $('#vtt').length, src: vtt_source},
    'hideControls': false // never hide controls
})

if (dashSource) {
    const dash = dashjs.MediaPlayer().create()
    const url = dashSource.getAttribute('src')
    dash.initialize(videoPlayer, url, false)
} else if (hlsSource && Hls.isSupported()) {
    const hls = new Hls({autoStartLoad: false})
    hls.loadSource(hlsSource.getAttribute('src'))
    hls.attachMedia(videoPlayer)

    hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
        const dataLevels = data['levels'].length - 1

        let levels = {360: 0, 480: 1, 720: 2, 1080: 3}
        let maxStartLevel = levels[720]
        let maxLevel = levels[1080]

        let desiredStartLevel = maxLevel - 1
        if (desiredStartLevel > maxStartLevel) desiredStartLevel = maxStartLevel
        if (desiredStartLevel > dataLevels) desiredStartLevel = dataLevels - 1
        if (desiredStartLevel < 0) desiredStartLevel = 0

        hls.startLevel = desiredStartLevel
        hls.startLoad(getTime())
    })
}

document.addEventListener('keydown', e => {
    if (e.keyCode === 9) {
        e.preventDefault()
        $('#next')[0].click()
    }
})

videoWrapper.addEventListener('wheel', e => {
    e.preventDefault()

    let speed = 10
    if (e.deltaY < 0) plyrPlayer.forward(speed)
    else plyrPlayer.rewind(speed)
})

videoPlayer.addEventListener('timeupdate', () => {
    localStorage.bookmark = Math.round(videoPlayer.currentTime)
})

videoPlayer.addEventListener('playing', () => {
    localStorage.playing = 1
})

videoPlayer.addEventListener('pause', () => {
    localStorage.playing = 0
})

$(bookmark).on('click', function () {
    playFrom(this.getAttribute('data-bookmark-time'))
})

document.onkeydown = (e) => {
    e = e || window.event

    if (!$('input').is(':focus')) {
        switch (e.keyCode) {
            case 37:
                plyrPlayer.rewind()
                break
            case 39:
                plyrPlayer.forward()
                break
            case 32:
                playPause()
                break
        }
    }
}

function isPlaying() {
    return !videoPlayer.paused
}

function playPause() {
    if (!isPlaying()) videoPlayer.play()
    else videoPlayer.pause()
}

function playFrom(seconds) {
    videoPlayer.currentTime = seconds
    videoPlayer.play()
}

function isCen() {
    return videoPlayer.getAttribute("data-cen") === "1"
}

function addPlay() {
    ajax_post("ajax/video_addplay.php", [
        {'videoID': videoID}
    ], function () {
        console.log('play added')
    })
}

function removePlays() {
    ajax_post("ajax/video_removeplays.php", [
        {'videoID': videoID}
    ], function () {
        console.log('plays reset')
    })
}

function addAlias(aliasName) {
    ajax_post("ajax/video_addalias.php", [
        {'videoID': videoID},
        {'aliasName': aliasName}
    ])
}

function renameAlias(aliasID, aliasName) {
    ajax_post("ajax/video_renamealias.php", [
        {'videoID': videoID},
        {'aliasID': aliasID},
        {'aliasName': aliasName}
    ])
}

function removeAlias(aliasID) {
    ajax("ajax/video_removealias.php", `videoID=${videoID}&aliasID=${aliasID}`)
}

function renameVideo(videoName) {
    ajax("ajax/rename_video.php", `videoID=${videoID}&videoName=${encodeURIComponent(videoName)}`)
}

function renameFranchise(franchiseName) {
    ajax("ajax/rename_franchise.php", `videoID=${videoID}&franchiseName=${encodeURIComponent(franchiseName)}`)
}

function addBookmark(categoryID, videoID) {
    let seconds = Math.round(videoPlayer.currentTime)
    localStorage.bookmark = seconds
    ajax("ajax/add_bookmark.php", `seconds=${seconds}&categoryID=${categoryID}&videoID=${videoID}`)
}

function bookmark_editCategory(bookmarkID, categoryID) {
    ajax("ajax/bookmark_editCategory.php", `bookmarkID=${bookmarkID}&categoryID=${categoryID}`)
}

function bookmark_editTime(bookmarkID) {
    let seconds = Math.round(videoPlayer.currentTime)
    localStorage.bookmark = seconds
    ajax("ajax/bookmark_editTime.php", `bookmarkID=${bookmarkID}&seconds=${seconds}`)
}

function removeBookmark(id) {
    ajax("ajax/remove_bookmark.php", `id=${id}`)
}

function removeCategory(id) {
    ajax("ajax/remove_category.php", `id=${id}`)
}

function removeVideoCategory(videoID, categoryID) {
    ajax("ajax/remove_videocategory.php", `videoID=${videoID}&categoryID=${categoryID}`)
}

function removeVideoStar(videoID, starID) {
    ajax("ajax/remove_videostar.php", `videoID=${videoID}&starID=${starID}`)
}

function addBookmarkStar(bookmarkID, starID) {
    ajax("ajax/add_bookmark_star.php", `bookmarkID=${bookmarkID}&starID=${starID}`)
}

function removeBookmarkStar(bookmarkID, starID) {
    ajax("ajax/bookmark_removeStar.php", `bookmarkID=${bookmarkID}&starID=${starID}`)
}

function addBookmark_and_star(categoryID, starID) {
    let seconds = Math.round(videoPlayer.currentTime)
    localStorage.bookmark = seconds
    ajax("ajax/add_bookmark_and_star.php", `categoryID=${categoryID}&starID=${starID}&seconds=${seconds}&videoID=${videoID}`)
}

function addGlobal_starAttribute(starID, attributeID) {
    ajax("ajax/video_add_starattribute.php", `videoID=${videoID}&starID=${starID}&attributeID=${attributeID}`)
}

function removeBookmarkAttributes(bookmarkID) {
    ajax_post('ajax/remove_bookmark_attributes.php', [
        {'bookmarkID': bookmarkID}
    ])
}

function addBookmarkAttribute(bookmarkID, attributeID) {
    ajax("ajax/add_bookmark_attribute.php", `bookmarkID=${bookmarkID}&attributeID=${attributeID}`)
}

function generateThumbnail(seconds) {
    ajax("ajax/video_generatethumbnail.php", `videoID=${videoID}&seconds=${Math.round(seconds)}`)
}

function fixVideo() {
    ajax("ajax/video_fix.php", `videoID=${videoID}`)
}

function removeVideo() {
    ajax("ajax/remove_video.php", `videoID=${videoID}`)
}

function fixBookmarks() {
    ajax("ajax/bookmarks_fix.php", `videoID=${videoID}`)
}

function editDate($date) {
    ajax_post('ajax/video_setdate.php', [
        {'videoID': videoID},
        {'date': $date}
    ])
}

function toggleCen() {
    ajax("ajax/video_cen.php", `videoID=${videoID}`)
}

function renameFile(newPath) {
    ajax("ajax/file_rename.php", `videoID=${videoID}&videoPath=${newPath}`)
}

function ajax(page, params, callback = function () {
    location.reload()
}) {
    let url = `${page}?${params}`
    let xhr = new XMLHttpRequest
    xhr.open("GET", url)
    xhr.send()
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200) {
            callback()
        }
    }
}

function ajax_post(url, params, callback = () => {
    location.href = `${location.href}`
}) {
    let xhr = new XMLHttpRequest()
    xhr.open('POST', url)

    if (params.length) {
        let data = new FormData()
        for (let i = 0; i < params.length; i++) {
            let param = params[i]

            let key = Object.keys(param)[0]
            let val = param[key]
            data.append(key, val)
        }
        xhr.send(data)
    } else {
        xhr.send()
    }

    xhr.onload = function () {
        callback(this.responseText)
    }
}


$(function () {
    $.contextMenu({
        selector: "#video > h2 #video-name",
        items: {
            rename_title: {
                name: "Rename Title", icon: "edit", callback: function () {
                    $("body").append('<div id="dialog" title="Edit Video"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $("#dialog").remove()
                            }, width: 350
                        })
                        $("#dialog").append('<input type="text" name="videoName_edit" value="' + $("#video > h2 #video-name").text() + '" autofocus>')
                        let input = $('input[name="videoName_edit"]')
                        let len = input.val().length
                        input[0].focus()
                        input[0].setSelectionRange(len, len)
                        document.querySelector('input[name="videoName_edit"]').addEventListener("keydown", function (e) {
                            if (e.keyCode === 13) {
                                renameVideo(this.value)
                            }
                        })
                    })
                }
            }, rename_framchise: {
                name: "Rename Franchise", icon: "edit", callback: function () {
                    $("body").append('<div id="dialog" title="Edit Franchise"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $("#dialog").remove()
                            }, width: 350
                        })
                        $("#dialog").append(`<input type="text" value="${$("#video > h2 #video-name").attr("data-franchise")}" name="videoFranchise_edit" autofocus>`)
                        let input = $('input[name="videoFranchise_edit"]')
                        let len = input.val().length
                        input[0].focus()
                        input[0].setSelectionRange(len, len)
                        document.querySelector('input[name="videoFranchise_edit"]').addEventListener("keydown", function (e) {
                            if (e.keyCode === 13) renameFranchise(this.value)
                        })
                    })
                }
            }, add_alias: {
                name: "Add Alias", icon: "add", callback: function () {
                    $("body").append('<div id="dialog" title="Add Alias"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $("#dialog").remove()
                            }, width: 350
                        })
                        $("#dialog").append('<input type="text" name="videoAlias_add" autofocus>')
                        $('input[name="videoAlias_add"]')[0].focus()
                        document.querySelector('input[name="videoAlias_add"]').addEventListener("keydown", function (e) {
                            if (e.keyCode === 13) addAlias(this.value)
                        })
                    })
                }
            }, sep1: "", copy_franchise: {
                name: "Copy Franchise", icon: "copy", callback: function (itemKey, options) {
                    let franchise = options.$trigger.attr("data-franchise")
                    setClipboard(franchise)
                }
            }
        }
    })
})
$(function () {
    $.contextMenu({
        selector: "#video > h2 .alias",
        items: {
            rename_alias: {
                name: "Rename Alias", icon: "edit", callback: function (itemKey, options) {
                    let aliasID = options.$trigger.attr("data-alias-id")
                    let aliasText_current = options.$trigger.text()
                    $("body").append('<div id="dialog" title="Edit Alias"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $("#dialog").remove()
                            }, width: 350
                        })
                        $("#dialog").append(`<input type="text" name="videoAlias_edit" value="${aliasText_current}" autofocus>`)
                        let input = $('input[name="videoAlias_edit"]')
                        let len = input.val().length
                        input[0].focus()
                        input[0].setSelectionRange(len, len)
                        document.querySelector('input[name="videoAlias_edit"]').addEventListener("keydown", function (e) {
                            if (e.keyCode === 13) {
                                renameAlias(aliasID, this.value)
                            }
                        })
                    })
                }
            }, remove_alias: {
                name: "Remove Alias", icon: "delete", callback: function (itemKey, options) {
                    let aliasID = options.$trigger.attr("data-alias-id")
                    removeAlias(aliasID)
                }
            }
        }
    })
})
$(function () {
    $.contextMenu({
        zIndex: 3,
        selector: "video, .plyr",
        items: {
            cen: {
                name: "Censor", icon: "edit", callback: function () {
                    toggleCen()
                }, visible: !isCen()
            }, un_cen: {
                name: "Uncensor", icon: "edit", callback: function () {
                    toggleCen()
                }, visible: isCen()
            }, generate_thumbnail: {
                name: "Create Thumbnail", icon: "add", callback: function () {
                    generateThumbnail(videoPlayer.currentTime)
                }
            }, remove_plays: {
                name: "Remove Plays", icon: 'delete', callback: function () {
                    removePlays()
                }
            }, rename_file: {
                name: "Rename File", icon: "edit", callback: function () {
                    let videoPath_current = `${$(videoPlayer).find("source").last().attr("src").split("/")[1]}`
                    $("body").append('<div id="dialog" title="Edit File"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $("#dialog").remove()
                            }, width: 350
                        })
                        $("#dialog").append('<input type="text" name="videoFile_edit" value="' + videoPath_current + '" autofocus>')
                        let input = $('input[name="videoFile_edit"]')
                        let len = input.val().length
                        input[0].focus()
                        input[0].setSelectionRange(len, len)
                        document.querySelector('input[name="videoFile_edit"]').addEventListener("keydown", function (e) {
                            if (e.keyCode === 13) renameFile(this.value)
                        })
                    })
                }
            }, divider1: "---", copy_filename: {
                name: "Copy FileName", icon: "copy", callback: function () {
                    let videoPath_current = $(videoPlayer).find("source").first().attr("src").split("/")[1].split(".mp4")[0]
                    setClipboard(videoPath_current)
                }
            }, fix_video: {
                name: "Update Video", icon: "edit", callback: function () {
                    fixVideo()
                }
            }, divider2: "---", fix_bookmarks: {
                name: "Update Bookmarks", icon: "edit", callback: function () {
                    fixBookmarks()
                }
            }, divider3: "---", remove_video: {
                name: "Delete Video", icon: "delete", callback: function () {
                    removeVideo()
                }
            }
        }
    })
})
$(function () {
    $.contextMenu({
        zIndex: 3,
        selector: ".bookmark",
        items: {
            add_star: {
                name: "Add Star", icon: "add", callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-bookmark-id")
                    let star = $(".star")
                    if ($(star).length === 1) {
                        let starID = $(star).first().attr("data-star-id")
                        addBookmarkStar(id, starID)
                    } else {
                        $(star).on("mouseenter mouseleave", function () {
                            $(this).toggleClass("active")
                            $(this).on("click", function () {
                                $(this).addClass("selected")
                                let starID = $(this).attr("data-star-id")
                                addBookmarkStar(id, starID)
                            })
                        })
                    }
                }
            }, remove_star: {
                name: "Remove Star", icon: "delete", callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-bookmark-id")
                    let starID = $(`.bookmark-info[data-bookmark-id="${id}"] > .star-image`).attr("data-star-id")
                    removeBookmarkStar(id, starID)
                }
            }, divider1: "---", add_attribute: {
                name: "Add Attribute", icon: "add", callback: function (itemKey, options) {
                    let bookmarkID = options.$trigger.attr("data-bookmark-id")
                    $("body").append('<div id="dialog" title="Add Attribute"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $(this).remove()
                            }, width: 250, maxHeight: $(window).height() - 55, position: {my: "top", at: "top+50"}
                        })
                        let selectedAttribute_query = $(`.bookmark-info[data-bookmark-id="${bookmarkID}"] .btn[data-attribute-id]`)
                        let selectedAttribute = []
                        for (let i = 0; i < selectedAttribute_query.length; i++) {
                            let name = $(selectedAttribute_query).eq(i).attr("data-attribute-id")
                            selectedAttribute.push(name)
                        }

                        searchField()
                        let attribute_query = $("#attributes > .attribute")
                        for (let i = 0; i < attribute_query.length; i++) {
                            let attributeID = $(attribute_query).eq(i).attr("data-attribute-id")
                            let attributeName = $(attribute_query).eq(i).text()

                            if (selectedAttribute.indexOf(attributeID) === -1) $("#dialog").append(`<div class="btn unselectable" onclick="addBookmarkAttribute(${bookmarkID}, ${attributeID})">${attributeName}</div>`)
                        }
                        searchData()
                    })
                }
            }, remove_attribute: {
                name: 'Remove Attributes', icon: 'delete', callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-bookmark-id")
                    removeBookmarkAttributes(id)
                }
            }, edit: {
                name: "Change Category", icon: "edit", callback: function (itemKey, options) {
                    let bookmarkID = options.$trigger.attr("data-bookmark-id")
                    let bookmarkName = options.$trigger.text().trim()
                    $("body").append('<div id="dialog" title="Change Category"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $("#dialog").remove()
                            }, width: 250, position: {my: "top", at: "top+150"}
                        })

                        searchField()
                        for (let i = 0; i < $("#category_list > option").length; i++) {
                            let category = $("#category_list > option").eq(i)
                            let categoryID = category.attr("data-category-id")
                            let categoryName = category.attr("value")
                            if (categoryName !== bookmarkName) $("#dialog").append(`<div class="btn unselectable" onclick="bookmark_editCategory(${bookmarkID},${categoryID})">${categoryName}</div>`)
                        }
                        searchData()
                    })
                }
            }, edit_time: {
                name: "Change Time", icon: "far fa-clock", callback: function (itemKey, options) {
                    bookmark_editTime(options.$trigger.attr("data-bookmark-id"))
                }
            }, delete: {
                name: "Delete", icon: "delete", callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-bookmark-id")
                    removeBookmark(id)
                }
            }
        }
    })
})
$(function () {
    $.contextMenu({
        zIndex: 3,
        selector: ".category",
        items: {
            add_bookmark: {
                name: "Add Bookmark", icon: "add", callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-category-id")
                    addBookmark(id, videoID)
                }
            }, remove: {
                name: "Remove",
                icon: "delete",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-category-id")
                    removeVideoCategory(videoID, id)
                }
            }, delete: {
                name: "Delete",
                icon: "delete",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-category-id")
                    removeCategory(id)
                }, visible: false
            }
        }
    })
})
$(function () {
    $.contextMenu({
        zIndex: 3,
        selector: ".star[data-star-id]",
        items: {
            add_bookmark: {
                name: "Add Bookmark", icon: "add", callback: function (itemKey, options) {
                    let starID = options.$trigger.attr("data-star-id")
                    $("body").append('<div id="dialog" title="Add Bookmark"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $("#dialog").remove()
                            }, width: 250, position: {my: "right top", at: "right-110 top+250"}
                        })

                        searchField()
                        for (let i = 0; i < $("#category_list > option").length; i++) {
                            let categoryID = $("#category_list > option").eq(i).attr("data-category-id")
                            let categoryName = $("#category_list > option").eq(i).attr("value")
                            $("#dialog").append(`<div class="btn unselectable" onclick="addBookmark_and_star(${categoryID}, ${starID})">${categoryName}</div>`)
                        }
                        searchData()
                    })
                }
            }, add_global_attribute: {
                name: "Add Global Attribute", icon: "add", callback: function (itemKey, options) {
                    let starID = options.$trigger.attr("data-star-id")
                    $("body").append('<div id="dialog" title="Add Attribute"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $(this).remove()
                            }, width: 250, maxHeight: $(window).height() - 55, position: {my: "top", at: "top+50"}
                        })
                        searchField()
                        let attribute_query = $("#attributes > .attribute")
                        for (let i = 0; i < attribute_query.length; i++) {
                            let attributeID = $(attribute_query).eq(i).attr("data-attribute-id")
                            let attributeName = $(attribute_query).eq(i).text()
                            $("#dialog").append(`<div class="btn unselectable" onclick="addGlobal_starAttribute(${starID}, ${attributeID})">${attributeName}</div>`)
                        }
                        searchData()
                    })
                }
            }, remove: {
                name: "Remove", icon: "delete", callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-star-id")
                    removeVideoStar(videoID, id)
                }
            }
        }
    })
})

$(function () {
    $.contextMenu({
        selector: '#video .date',
        items: {
            'edit_date': {
                name: 'Edit Date', icon: 'edit', callback: function () {
                    let date_current = $('.date').not('.no-date').text().trim()
                    if (date_current.length && date_current.split(' ').length > 2) {
                        let date_arr = date_current.split(' ')
                        let date_d = date_arr[0]
                        let date_m = date_arr[1]
                        let date_y = date_arr[2]

                        if (date_m.length > 2) date_m = date_m.substring(0, 3)
                        if (date_y.length > 2) date_y = date_y.substring(2, 4)

                        date_current = `${date_d} ${date_m} ${date_y}`
                    }

                    $("body").append('<div id="dialog" title="Edit Date"></div>')
                    $(function () {
                        $("#dialog").dialog({
                            close: function () {
                                $("#dialog").remove()
                            }, width: 350
                        })
                        $("#dialog").append(`<input type="text" name="date_edit" value="${date_current}" autofocus>`)
                        let input = $('input[name="date_edit"]')
                        let len = input.val().length
                        input[0].focus()
                        input[0].setSelectionRange(len, len)
                        document.querySelector('input[name="date_edit"]').addEventListener("keydown", function (e) {
                            if (e.keyCode === 13) editDate(this.value)
                        })
                    })
                }
            }
        }
    })
})

function getTime() {
    let seconds = videoPlayer.currentTime
    if (typeof localStorage.bookmark !== "undefined" && localStorage.video === videoID) {
        seconds = Number(localStorage.bookmark)
    }

    return seconds
}

function videoStats() {
    let seconds = getTime()

    if (localStorage.video !== videoID) {
        localStorage.video = videoID
        localStorage.bookmark = seconds
        localStorage.playing = 0

        $(videoPlayer).one('play', () => addPlay())
    }

    if (seconds) videoPlayer.currentTime = seconds
    if (localStorage.playing === "1") {
        setTimeout(function () {
            videoPlayer.play()
        }, 100)
    }
}

function collisionCheck(a, b) {
    const distance_min = {
        x: 7,
    }

    if (typeof a === "undefined" || typeof b === "undefined") return false

    a = a.getBoundingClientRect()
    b = b.getBoundingClientRect()

    return !((a.x + a.width) < b.x - distance_min.x) || (a.x - distance_min.x > (b.x + b.width))
}

function bookmarkCollision() {
    bookmarkSort()

    $(bookmark).attr('data-level', 1)
    for (let i = 1, items = bookmark, LEVEL_MIN = 1, LEVEL_MAX = 12, level = LEVEL_MIN; i < items.length; i++) {
        let collision = false

        let first = items[i - 1]
        let second = items[i]

        if (collisionCheck(first, second)) {
            collision = true
        } else {
            collision = false

            for (let j = 1; j < i; j++) {
                if (collisionCheck(items[j], second)) collision = true
            }
        }

        if (collision && level < LEVEL_MAX) {
            if (level < LEVEL_MAX) level++
            second.setAttribute('data-level', level)
        } else {
            level = LEVEL_MIN
        }
    }
}

function bookmarkSort() {
    $(bookmark).sort(function (a, b) {
        let valA = a.getAttribute('data-bookmark-time')
        let valB = b.getAttribute('data-bookmark-time')

        return valA - valB
    })

    $(bookmark).parent().append($(bookmark))
}

function onFocus(callback) {
    if (document.hasFocus()) callback()

    window.addEventListener('focus', function () {
        callback()
    })
}

function bookmarkTooltip() {
    let bookmarks = document.getElementsByClassName("bookmark")

    function clearHover(index) {
        $(".bookmark-info[data-bookmark-id]").eq(index).removeClass("active")
    }

    function setPos(categoryID, left, top) {
        if ($(`.bookmark-info[data-bookmark-id="${categoryID}"] > *`).length) {
            $(`.bookmark-info[data-bookmark-id="${categoryID}"]`)
                .addClass("active")
                .css({left: left, top: top})
        }
    }

    for (let i = 0; i < bookmarks.length; i++) {
        bookmarks[i].addEventListener("mouseenter", function (e) {
            clearHover(i)

            let leftPos = e.clientX - 100
            let topPos = e.clientY + 25
            if (leftPos > getWidth() - 280) leftPos = getWidth() - 280
            let left = `${leftPos}px`
            let top = `${topPos}px`

            let categoryID = bookmarks[i].getAttribute("data-bookmark-id")
            setPos(categoryID, left, top)


            let bounding = $(`.bookmark-info[data-bookmark-id="${categoryID}"]`)[0].getBoundingClientRect()
            if (bounding.bottom > (window.innerHeight || document.documentElement.clientHeight)) {
                topPos = bounding.top - bounding.height - (25 * 2)
                top = `${topPos}px`

                setPos(categoryID, left, top)
            }
        })
        bookmarks[i].addEventListener("mouseleave", function () {
            clearHover(i)
        })
    }
}

function starTooltip() {
    let starClass = document.getElementsByClassName("star")
    for (let i = 0; i < starClass.length; i++) {
        starClass[i].addEventListener("mouseenter", function () {
            let starID = starClass[i].getAttribute("data-star-id")
            for (let j = 0; j < $(`.bookmark-info > .star-image[data-star-id="${starID}"]`).length; j++) {
                let bookmarkID = $(`.bookmark-info > .star-image[data-star-id="${starID}"]`).eq(j).parent().attr("data-bookmark-id")
                $(`.bookmark[data-bookmark-id="${bookmarkID}"]`).css({
                    "color": "red",
                    "font-weight": "bold",
                    "border-width": "2px"
                })
            }
        })
        starClass[i].addEventListener("mouseleave", function () {
            $(bookmark).css({
                "color": "inherit",
                "font-weight": "inherit",
                "border-width": "1px"
            })
        })
    }
}

function attributeTooltip() {
    let attributeClass = document.getElementsByClassName("video-attribute")
    for (let i = 0; i < attributeClass.length; i++) {
        attributeClass[i].addEventListener("mouseenter", function () {
            let attributeID = attributeClass[i].getAttribute("data-attribute-id")
            for (let j = 0; j < $(`.bookmark-info > [data-attribute-id="${attributeID}"]`).length; j++) {
                let bookmarkID = $(`.bookmark-info > [data-attribute-id="${attributeID}"]`).eq(j).parent().attr("data-bookmark-id")
                $(`.bookmark[data-bookmark-id="${bookmarkID}"]`).css({
                    "color": "red",
                    "font-weight": "bold",
                    "border-width": "2px"
                })
            }
        })
        attributeClass[i].addEventListener("mouseleave", function () {
            $(bookmark).css({
                "color": "inherit",
                "font-weight": "inherit",
                "border-width": "1px"
            })
        })
    }
}

function getWidth() {
    return Math.min(
        document.body.scrollWidth,
        document.documentElement.scrollWidth,
        document.body.offsetWidth,
        document.documentElement.offsetWidth,
        document.documentElement.clientWidth
    )
}

function setClipboard(data) {
    const el = document.createElement("textarea")

    el.value = data
    el.setAttribute("readonly", "")
    el.style.position = "absolute"
    el.style.left = "-9999px"

    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
}

function searchField(dialogQuery = $('#dialog')) {
    const searchWrapper = document.createElement('span')
    searchWrapper.classList.add('search')
    const searchInner = document.createElement('span')
    searchInner.classList.add('inner')

    searchWrapper.appendChild(searchInner)
    dialogQuery.append(searchWrapper)
}

function searchData() {
    const CHAR_UP = 38
    const CHAR_DOWN = 40

    const CHAR_BACKSPACE = 8
    const CHAR_ENTER = 13
    const CHAR_SPACE = 32

    const CHAR_A = 65
    const CHAR_Z = 90

    let input = ''
    $('#dialog .btn:visible').first().addClass('selected')
    document.addEventListener('keydown', e => {
        if (((e.which === CHAR_BACKSPACE && input.length) || e.which === CHAR_SPACE) || (e.which >= CHAR_A && e.which <= CHAR_Z)) {
            e.preventDefault() // SPACEBAR

            if (e.which === CHAR_BACKSPACE) {
                updateLabel(input = input.slice(0, -1))
            } else {
                updateLabel(input += String.fromCharCode(e.which).toLowerCase())
            }

            $('#dialog .btn').removeClass('no-match').not(function () {
                return this.textContent.toLowerCase().indexOf(input) > -1
            }).addClass('no-match')

            $('#dialog .btn.selected').removeClass('selected')
            $('#dialog .btn:visible').first().addClass('selected')
        } else {
            if (e.which === CHAR_ENTER || e.which === CHAR_UP || e.which === CHAR_DOWN) {
                e.preventDefault() // UP & DOWN

                if (e.which === CHAR_ENTER) {
                    $('#dialog .btn.selected')[0].click()
                } else {
                    let $currentItem = $('#dialog .btn.selected')
                    let $items = $('#dialog .btn:visible')
                    if (e.which === CHAR_DOWN) {
                        let $selectedItem
                        for (let i = $items.length - 1; i >= 0; i--) {
                            if (!$items.eq(i).hasClass('selected')) $selectedItem = $items.eq(i)
                            else break
                        }

                        if ($selectedItem !== undefined) {
                            $currentItem.removeClass('selected')
                            $selectedItem.addClass('selected')
                        }
                    } else if (e.which === CHAR_UP) {
                        let $selectedItem
                        for (let i = 0; i < $items.length; i++) {
                            if (!$items.eq(i).hasClass('selected')) $selectedItem = $items.eq(i)
                            else break
                        }

                        if ($selectedItem !== undefined) {
                            $currentItem.removeClass('selected')
                            $selectedItem.addClass('selected')
                        }
                    }
                }
            }
        }
    })

    function updateLabel(input) {
        if (document.querySelector('.search > .inner')) {
            document.querySelector('.search > .inner').textContent = input
        }
    }
}