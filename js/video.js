const videoWrapper = document.getElementById('video')
const videoPlayer = document.getElementsByTagName('video')[0]
const hlsSource = document.querySelector('source[data-type="hls"]')
const dashSource = document.querySelector('source[data-type="dash"]')
const videoID = new URL(location.href).searchParams.get('id')

    window.vtt_source = `vtt/${videoID}.vtt`
    window.bookmark = document.getElementsByClassName('bookmark')
    window.videoTitle = document.getElementById('video-name')

    onFocus(() => {
        videoStats()
        bookmarkCollision()
    })

    bookmarkTooltip()
    starTooltip()
    attributeTooltip()

    videoVolume(0.25)

    // Start Class
    if (videoSource && Hls.isSupported()) {
        const hls = new Hls({
            maxBufferLength: 180 /* 3x duration of hls_time */
        })
        hls.loadSource(videoSource.getAttribute('src'))
        hls.attachMedia(videoPlayer)
    }

    new Plyr(videoPlayer, {
        'controls': ['play-large', 'play', 'current-time', 'progress', 'duration', 'fullscreen'],
        'ratio': '21:9',
        'invertTime': false,
        'toggleInvert': false,
        'seekTime': window.seekTime,
        'volume': 1, // reset volume
        'muted': false,
        'previewThumbnails': {enabled: is_ValidURL(vtt_source), src: vtt_source},
        'hideControls': false // never hide controls
    })
    // END Class

    // START Listeners
    document.addEventListener('keydown', (e) => {
        if (e.keyCode === 9) {
            e.preventDefault()
            $('#next')[0].click()
        }
    })

    videoWrapper.addEventListener('wheel', (e) => {
        e.preventDefault()

        let speed = 10
        if (e.deltaY < 0) skip(speed)
        else rewind(speed)
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
                    rewind()
                    break
                case 39:
                    skip()
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

function videoVolume(level = 1) {
    if (level > 1) {
        let audioCtx = new AudioContext()
        let source = audioCtx.createMediaElementSource(videoPlayer)

        let gainNode = audioCtx.createGain()
        gainNode.gain.value = level

        source.connect(gainNode)
        gainNode.connect(audioCtx.destination)
    } else if (level >= 0) {
        videoPlayer.volume = level
    }
}

// END Video

// START Ajax
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

// START Context Menu
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
                        $("#dialog").append('<input type="text" value="' + $("#video > h2 #video-name").attr("data-franchise") + '" name="videoFranchise_edit" autofocus>')
                        let input = $('input[name="videoFranchise_edit"]')
                        let len = input.val().length
                        input[0].focus()
                        input[0].setSelectionRange(len, len)
                        document.querySelector('input[name="videoFranchise_edit"]').addEventListener("keydown", function (e) {
                            if (e.keyCode === 13) {
                                renameFranchise(this.value)
                            }
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
                            if (e.keyCode === 13) {
                                addAlias(this.value)
                            }
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
                        $("#dialog").append('<input type="text" name="videoAlias_edit" value="' + aliasText_current + '" autofocus>')
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
                name: "Censor",
                icon: "edit",
                callback: function () {
                    toggleCen()
                }, visible: !isCen()
            }, un_cen: {
                name: "Uncensor",
                icon: "edit",
                callback: function () {
                    toggleCen()
                }, visible: isCen()
            }, generate_thumbnail: {
                name: "Create Thumbnail",
                icon: "add",
                callback: function () {
                    generateThumbnail(videoPlayer.currentTime)
                }
            }, remove_plays: {
                name: "Remove Plays",
                icon: 'delete',
                callback: function () {
                    removePlays()
                }
            }, rename_file: {
                name: "Rename File",
                icon: "edit",
                callback: function () {
                    let videoPath_current = `${$(videoPlayer).find("source").first().attr("src").split("/")[1]}.mp4`
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
                            if (e.keyCode === 13) {
                                renameFile(this.value)
                            }
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
                        let selectedAttribute_query = $('.bookmark-info[data-bookmark-id="' + bookmarkID + '"] .btn[data-attribute-id]')
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
                            if (selectedAttribute.indexOf(attributeID) === -1) $("#dialog").append('<div class="btn" onclick="addBookmarkAttribute(' + bookmarkID + ", " + attributeID + ')">' + attributeName + "</div>")
                        }
                        searchData()
                    })
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
                            if (categoryName !== bookmarkName) $("#dialog").append('<div class="btn" onclick="bookmark_editCategory(' + bookmarkID + "," + categoryID + ')">' + categoryName + "</div>")
                        }
                        searchData()
                    })
                }
            }, edit_time: {
                name: "Change Time", icon: "edit", callback: function (itemKey, options) {
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
        selector: ".category",
        items: {
            add_bookmark: {
                name: "Add Bookmark", icon: "add", callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-category-id")
                    addBookmark(id, videoID)
                }
            }, remove: {
                name: "Remove", icon: "delete", callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-category-id")
                    removeVideoCategory(videoID, id)
                }
            }, delete: {
                name: "Delete", icon: "delete", callback: function (itemKey, options) {
                    let id = options.$trigger.attr("data-category-id")
                    removeCategory(id)
                }, visible: false
            }
        }
    })
})
$(function () {
    $.contextMenu({
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
                        for (let i = 0; i < $("#category_list > option").length; i++) {
                            let categoryID = $("#category_list > option").eq(i).attr("data-category-id")
                            let categoryName = $("#category_list > option").eq(i).attr("value")
                            $("#dialog").append('<div class="btn" onclick="addBookmark_and_star(' + categoryID + ", " + starID + ')">' + categoryName + "</div>")
                        }
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
                            $("#dialog").append('<div class="btn" onclick="addGlobal_starAttribute(' + starID + ", " + attributeID + ')">' + attributeName + "</div>")
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
// END Context Menu

// START Functions
function videoStats() {
    let seconds = videoPlayer.currentTime
    if (typeof localStorage.bookmark !== "undefined" && localStorage.video === videoID)
        seconds = parseInt(localStorage.bookmark)

    if (localStorage.video !== videoID) {
        localStorage.video = videoID
        localStorage.bookmark = seconds
        localStorage.playing = 0

        $(videoPlayer).one('play', function () {
            addPlay()
        })
    }

    if (seconds) videoPlayer.currentTime = seconds
    if (localStorage.playing === "1") {
        setTimeout(function () {
            videoPlayer.play()
        }, 100)
    }
}

function collisionCheck(firstElement, secondElement) {
    const distance_min = {
        x: 7,
        y: 35
    }

    let first = {
        dom: firstElement.getBoundingClientRect(),
        x: $(firstElement).offset().left,
        y: $(firstElement).offset().top
    }

    let second = {
        dom: secondElement.getBoundingClientRect(),
        x: $(secondElement).offset().left,
        y: $(secondElement).offset().top
    }

    let distance = {
        x: Math.abs((first.x + first.dom.width) - second.x),
        y: Math.abs(first.y - second.y)
    }

    return !(
        first.dom.right < second.dom.left ||
        first.dom.left > second.dom.right ||
        first.dom.bottom < second.dom.top ||
        first.dom.top > second.dom.bottom
    ) || (distance.x < distance_min.x && distance.y < distance_min.y)
}

function bookmarkCollision() {
    bookmarkSort()

    $(bookmark).attr('data-level', 1)
    for (let i = 1; i < bookmark.length; i++) {
        let level = $(bookmark).eq(i).attr('data-level')

        let first = bookmark[i - 1]
        let second = bookmark[i];

        (function addSpace() {
            setTimeout(function () {
                let collision = false
                if (collisionCheck(first, second)) {
                    collision = true
                } else {
                    for (let j = 1; j < i; j++) {
                        first = bookmark[j - 1]
                        if (collisionCheck(first, second)) collision = true
                    }
                }

                if (collision) {
                    if (level < 10) level++
                    else level = 1

                    $(bookmark).eq(i).attr('data-level', level)
                    addSpace()
                }
            }, 250)
        })()
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
    if (document.hasFocus()) {
        callback()
    } else {
        $(window).focus(function () {
            callback()
        })
    }
}

function bookmarkTooltip() {
    let bookmarks = document.getElementsByClassName("bookmark")

    function clearHover(index) {
        $(".bookmark-info[data-bookmark-id]").eq(index).removeClass("active")
    }

    for (let i = 0; i < bookmarks.length; i++) {
        bookmarks[i].addEventListener("mouseenter", function (e) {
            clearHover(i)
            let leftPos = e.clientX - 100
            let topPos = e.clientY + 25
            if (leftPos > getWidth() - 280) leftPos = getWidth() - 280
            let left = leftPos + "px"
            let top = topPos + "px"
            let categoryID = bookmarks[i].getAttribute("data-bookmark-id")
            if ($(`.bookmark-info[data-bookmark-id="${categoryID}"] > *`).length) {
                $(`.bookmark-info[data-bookmark-id="${categoryID}"]`).addClass("active")
                $(`.bookmark-info[data-bookmark-id="${categoryID}"]`).css({left: left, top: top})
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

function is_ValidURL(url) {
    let xhr = new XMLHttpRequest
    xhr.open("HEAD", url, false)
    xhr.send()
    return xhr.status !== 404
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
    const CHAR_BACKSPACE = 8
    const CHAR_SPACE = 32
    const CHAR_A = 65
    const CHAR_Z = 90

    let input = ''
    document.addEventListener('keydown', function (e) {
        if (((e.which === CHAR_BACKSPACE && input.length) || e.which === CHAR_SPACE) || (e.which >= CHAR_A && e.which <= CHAR_Z)) {
            e.preventDefault() // spacebar scroll

            if (e.which === 8) {
                updateLabel(input = input.slice(0, -1))
            } else {
                updateLabel(input += String.fromCharCode(e.which).toLowerCase())
            }

            $('#dialog .btn').removeClass('no-match').not(function () {
                return this.textContent.toLowerCase().indexOf(input) > -1
            }).addClass('no-match')
        }
    })

    function updateLabel(input) {
        if (document.querySelector('.search > .inner')) {
            document.querySelector('.search > .inner').textContent = input
        }
    }
}

// END Functions