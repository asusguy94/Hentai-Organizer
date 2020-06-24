const starID = window.location.href.split('id=')[1]
const video = document.getElementsByTagName('video')
const addRel_btn = document.getElementById('relation-add')

const startTime = 100

dropbox()
autoComplete()

let form = document.getElementsByTagName('form')
for (let i = 0; i < form.length; i++) {
    form[i].addEventListener('keydown', function (e) {
        switch (e.keyCode) {
            case 13:
                form[i].submit()
                break
            case 9:
                e.preventDefault()

                if (i < form.length - 1) $('form').eq(i + 1).find('input')[0].focus()
                else $('#next')[0].click()
                break
        }
    })
}

setFocus()
videoHover()

addRel_btn.addEventListener('click', function () {
    $('body').append('<div id="dialog" title="Add Relation"></div>')

    $(function () {
        $('#dialog').dialog({
            close: function () {
                $('#dialog').remove()
            },
            width: 250
        })

        $('#dialog').append(
            '<input type="text" name="relationName" autofocus placeholder="Title">' +
            '<input type="number" name="relationID" placeholder="ID">' +
            '<input type="button" id="relationAdd_confirm" class="btn btn-primary" value="Add">'
        )

        document.querySelector('input#relationAdd_confirm').addEventListener('click', function () {
            let title = $('[name="relationName"]').val().trim()
            let id = $('[name="relationID"]').val().trim()

            addRelation(id, title)
        })
    })
})

for (let i = 0; i < document.querySelectorAll('.relation-add').length; i++) {
    document.querySelectorAll('.relation-add')[i].addEventListener('click', function () {
        let el = $(this).parent().prev()
        let otherID = el.attr('data-starID')
        let title = el.find('.card-title').text()

        $('body').append('<div id="dialog" title="Add Relation"></div>')

        $(function () {
            $('#dialog').dialog({
                close: function () {
                    $('#dialog').remove()
                },
                width: 250
            })

            $('#dialog').append(
                `<input type="text" name="relationName" autofocus value="${title}">` +
                `<input type="number" name="relationID" value="${otherID}" placeholder="ID">` +
                `<input type="button" id="relationAdd_confirm" class="btn btn-primary" value="Save">`
            )

            document.querySelector('input#relationAdd_confirm').addEventListener('click', function () {
                let title = $('[name="relationName"]').val().trim()
                let id = $('[name="relationID"]').val().trim()

                addRelation(id, title)
            })
        })
    })
}

function addRelation(otherID, title) {
    ajax('ajax/star_add_relation.php', `starID=${starID}&otherID=${otherID}&title=${title}`)
}

function editRelation(otherID, title, ref_id) {
    ajax('ajax/star_edit_relation.php', `starID=${starID}&otherID=${otherID}&title=${title}&refID=${ref_id}`)
}

function removeRelation(ref_id) {
    ajax('ajax/star_remove_relation.php', `refID=${ref_id}`)
}

function addStarImage(id, url) {
    ajax('ajax/add_star_image.php', `id=${id}&image=${url}`)
}

function addStarImage_db() {
    ajax('ajax/add_star_image_manual.php', `id=${starID}`)
}

function removeStarImage(id) {
    ajax('ajax/remove_star_image.php', `id=${id}`)
}

function removeStarAttribute(starID, attributeID) {
    ajax('ajax/remove_star_attribute.php', `starID=${starID}&attributeID=${attributeID}`)
}

function deleteStar(starID) {
    ajax('ajax/remove_star.php', `starID=${starID}`)
}

function renameStar(starID, starName) {
    ajax('ajax/rename_star.php', `starID=${starID}&starName=${starName}`)
}

function ajax(page, params, callback = function () {
    location.href = `${location.href}`
}) {
    let url = `${page}?${params}`

    let xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.send()
    xhr.onreadystatechange = function () {
        if (this.readyState === 4 && this.status === 200)
            callback()
    }
}

/* Context Menu */
/* Image */
$(function () {
    $.contextMenu({
        selector: '#star > img',
        items: {
            "delete_image": {
                name: "Delete Image",
                icon: "delete",
                callback: function () {
                    removeStarImage(starID)
                }
            },
            "delete_star": {
                name: "Delete Star",
                icon: "delete",
                callback: function () {
                    deleteStar(starID)
                },
                disabled: !hasNoVideos()
            }
        }
    })
})
/* Dropbox */
$(function () {
    $.contextMenu({
        selector: '#dropbox',
        items: {
            "delete_star": {
                name: "Delete Star",
                icon: "delete",
                callback: function () {
                    deleteStar(starID)
                },
                disabled: !hasNoVideos()
            }, "add_image": {
                name: "Manual Add JPG",
                icon: 'add',
                callback: function () {
                    addStarImage_db()
                }
            }
        }
    })
})
/* Attribute */
$(function () {
    $.contextMenu({
        selector: '#star .attribute',
        items: {
            "remove": {
                name: "Remove",
                icon: "delete",
                callback: function (itemKey, options) {
                    let id = options.$trigger.attr('data-attribute-id')
                    removeStarAttribute(starID, id)
                }
            }
        }
    })
})
/* Title */
$(function () {
    $.contextMenu({
        selector: '#star > h2',
        zIndex: 2,
        items: {
            "rename": {
                name: "Rename",
                icon: "edit",
                callback: function () {

                    $('body').append('<div id="dialog" title="Edit Star"></div>')

                    $(function () {
                        $('#dialog').dialog({
                            close: function () {
                                $('#dialog').remove()
                            },
                            width: 250
                        })

                        $('#dialog').append('<input type="text" name="starName_edit" value="' + $('#star > h2').text() + '" autofocus>')
                        let input = $('input[name="starName_edit"]')
                        let len = input.val().length
                        input[0].focus()
                        input[0].setSelectionRange(len, len)

                        document.querySelector('input[name="starName_edit"]').addEventListener('keydown', function (e) {
                            if (e.keyCode === 13) {
                                renameStar(starID, this.value)
                            }
                        })
                    })
                }
            }
        }
    })
})
/* Relation */
$(function () {
    $.contextMenu({
        selector: '#relations > .relation',
        zIndex: 2,
        items: {
            "rename": {
                name: "Edit",
                icon: "edit",
                callback: function (itemKey, options) {
                    let name = options.$trigger.find('h3.card-title').text()
                    let otherstarID = options.$trigger.attr('data-starID')
                    let ref_id = options.$trigger.attr('data-id')

                    $('body').append('<div id="dialog" title="Edit Star"></div>')

                    $(function () {
                        $('#dialog').dialog({
                            close: function () {
                                $('#dialog').remove()
                            },
                            width: 250
                        })

                        $('#dialog').append(
                            `<input type="text" name="relationName" value="${name}" autofocus placeholder="Title">` +
                            `<input type="number" name="relationID" value="${otherstarID}" placeholder="ID">` +
                            `<input type="button" id="relationEdit_confirm" class="btn btn-primary" value="Save">`
                        )

                        document.querySelector('input#relationEdit_confirm').addEventListener('click', function () {
                            let title = $('[name="relationName"]').val().trim()
                            let id = $('[name="relationID"]').val().trim()

                            editRelation(id, title, ref_id)
                        })
                    })
                }
            }, "remove": {
                name: "Remove",
                icon: "delete",
                callback: function (itemKey, options) {
                    let ref_id = options.$trigger.attr('data-id')

                    removeRelation(ref_id)
                }
            }
        }
    })
})

/* Drag'n'Drop */
function dropbox() {
    let dropbox = document.getElementById('dropbox')
    if (!!dropbox) {
        dropbox.addEventListener('dragenter', dropboxDefault, false)
        dropbox.addEventListener('dragexit', dropboxDefault, false)
        dropbox.addEventListener('dragover', dropboxDefault, false)
        dropbox.addEventListener('drop', drop, false)

        function dropboxDefault(evt) {
            evt.stopPropagation()
            evt.preventDefault()
        }

        function drop(evt) {
            let image = evt.dataTransfer.getData('text')
            dropboxDefault(evt)
            addStarImage(starID, image)
        }
    }
}

function hasNoVideos() {
    return !$('.video').length
}

function autoComplete() {
    function changeOrder(items, array) {
        let index_one = array.indexOf(items[0])
        let index_two = array.indexOf(items[1])
        if (index_one >= 0 && index_two >= 0) {
            let tmp = array[index_one]

            array[index_one] = array[index_two]
            array[index_two] = tmp
        }
    }

    function removeDuplicate() {
        for (let i = 0; i < $('.attribute > .btn').length; i++) {
            $('#attributes > .attribute').filter(function () {
                return ($(this).text() === $('.attribute > .btn').eq(i).text())
            }).remove()
        }
    }

    removeDuplicate()

    let breasts = [],
        eyeColors = [],
        hairColors = [],
        hairLengths = [],
        hairStyles = [],
        attributes = []
    for (let i = 0, $this = $('.breast'); i < $this.length; i++) breasts.push($this.eq(i).text())
    for (let i = 0, $this = $('.eyecolor'); i < $this.length; i++) eyeColors.push($this.eq(i).text())
    for (let i = 0, $this = $('.haircolor'); i < $this.length; i++) hairColors.push($this.eq(i).text())
    for (let i = 0, $this = $('.hairstyle'); i < $this.length; i++) hairStyles.push($this.eq(i).text())
    for (let i = 0, $this = $('#attributes > .attribute'); i < $this.length; i++) attributes.push($this.eq(i).text())

    //changeOrder(['Elf', 'Angel'], attributes)

    $('input[name="breast"]').autocomplete({source: [breasts]})
    $('input[name="eyecolor"]').autocomplete({source: [eyeColors]})
    $('input[name="haircolor"]').autocomplete({source: [hairColors]})
    $('input[name="hairlength"]').autocomplete({source: [hairLengths]})
    $('input[name="hairstyle"]').autocomplete({source: [hairStyles]})
    $('input[name="attribute"]').autocomplete({source: [attributes]})
}

function setFocus() {
    for (let $this = $('form'), i = $this.length - 1; i >= 0; i--) {
        let value = $this.eq(i).find('input')[0].value

        if (i === $this.length - 1) {
            if ($('.attribute > .btn').length) {
                $('form').eq(i).find('input')[0].focus()
                break
            }
        } else if (value !== '') {
            $this.eq(i + 1).find('input')[0].focus()
            break
        } else if (i === 0) {
            $this.eq(i).find('input')[0].focus()
            break
        }
    }
}

/* Video */
function isPlaying(index = 0) {
    return !video[index].paused
}

function goToAndStop(index, time = startTime) {
    video[index].currentTime = time
    if (isPlaying(index)) video[index].pause()
}

function goToAndPlay(index, time = startTime) {
    video[index].currentTime = time
    if (!isPlaying(index)) video[index].play()
}


function videoHover() {
    let thumbnail = undefined
    for (let i = 0; i < video.length; i++) {
        let $this = $(video[i])

        $this.currentTime = startTime
        $this.hover(() => startThumbnailPlayback(i), () => stopThumbnailPlayback(i))
    }

    function startThumbnailPlayback(index) {
        let time = 120 // first thumbnail image
        let offset = 60 // next thumbnail images
        let duration = 1.5

        goToAndPlay(index, time += startTime)
        thumbnail = setInterval(function () {
            time += offset
            if (time > video[index].duration) {
                clearInterval(thumbnail)
                startThumbnailPlayback(index)
            }
            goToAndPlay(index, time)
        }, duration * 1000)
    }

    function stopThumbnailPlayback(index) {
        goToAndStop(index)
        clearInterval(thumbnail)
    }
}

