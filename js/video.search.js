const sort_radio = document.querySelectorAll('input[name="sort"]')

const cen_checkbox = document.querySelectorAll('input[name="cen"]')
const noStar_checkbox = document.querySelectorAll('input[name="nostar"]')
const quality_checkbox = document.querySelectorAll('input[name="quality"]')

const title_input = document.querySelector('input[name="title"]')
const attribute_checkbox = document.querySelectorAll('input[name^="attribute"]')
const category_checkbox = document.querySelectorAll('input[name^="category"]')

const existing_checkbox = document.querySelector('input[name="existing"]')

const loader = document.getElementById('loader')
const updateBtn = document.getElementById('update')

// Initialize PrevState for checkbox
$(category_checkbox).attr('data-state', 0)
$(attribute_checkbox).attr('data-state', 0)

const loadData = function () {
    fetch('json/video.search.php')
        .then(function (jsonData) {
            return jsonData.json()
        })
        .then(function (data) {
            // CREATE DOM
            const wrapper = document.getElementById('videos')

            const row = document.createElement('div')
            row.classList.add('row', 'justify-content-center')

            data['videos'].forEach((elem) => {
                let thumbnail = elem['thumbnail']

                let videoID = elem['videoID']
                let videoName = elem['videoName']
                let noStar = elem['noStar']
                let cen = elem['cen']
                let quality = elem['quality']
                let franchise = elem['franchise']

                let date_published = elem['datePublished']
                let plays = elem['plays']

                let attribute = elem['attribute']
                let category = elem['category']
                let alias = elem['alias']

                if (!category.length) category.push('0')
                if (!attribute.length) attribute.push('0')
                if (!alias.length) alias.push('0')

                let existing = elem['existing']

                let a = document.createElement('a')
                a.classList.add('video', 'card', 'ribbon-container')
                a.href = `video.php?id=${videoID}`
                a.setAttribute('data-id', videoID)
                a.setAttribute('data-nostar', noStar)
                a.setAttribute('data-cen', cen)
                a.setAttribute('data-quality', quality)
                a.setAttribute('data-franchise', franchise)
                a.setAttribute('data-date-published', date_published)
                a.setAttribute('data-plays', plays)
                a.setAttribute('data-title', videoName)
                a.setAttribute('data-alias', alias)
                a.setAttribute('data-attribute-name', `["${attribute}"]`)
                a.setAttribute('data-category-name', `["${category}"]`)
                a.setAttribute('data-existing', existing)

                let img = document.createElement('img')
                img.classList.add('lazy', 'data-img-top')
                img.setAttribute('data-src', thumbnail)

                let span = document.createElement('span')
                span.classList.add('title', 'card-title')
                span.textContent = videoName

                a.appendChild(img)
                a.appendChild(span)

                // Quality
                let ribbon = document.createElement('span')
                ribbon.classList.add('ribbon')
                ribbon.textContent = quality
                a.appendChild(ribbon)

                row.appendChild(a)
            })
            wrapper.appendChild(row)
        })
        .then(function () {
            loader.remove()

            window.videos = document.getElementsByClassName('video')
            window.$videos = $(videos)

            window.elementFocus = document.activeElement
        })
        .then(function () {
            setVideoCount(videos.length)

            // Class Change
            const observer = new MutationObserver(function (mutations) {
                mutations.forEach(function (mutation) {
                    if (mutation.attributeName === 'class') {
                        setVideoCount($('.video:visible').length)
                    }
                })
            })
            observer.observe($videos[0], { attributes: true })
        })
        .then(function () {
            /** Filter **/
            cen_checkbox.forEach((checkbox) => {
                checkbox.addEventListener('click', function () {
                    $(cen_checkbox).parent().removeClass('active')
                    this.parentNode.classList.add('active')

                    $('.video.hidden-cen').removeClass('hidden-cen')
                    switch (this.value) {
                        case 'cen':
                            $('.video[data-cen="0"]').addClass('hidden-cen')
                            break
                        case 'ucen':
                            $('.video[data-cen="1"]').addClass('hidden-cen')
                            break
                    }
                })
            })

            quality_checkbox.forEach((checkbox) => {
                checkbox.addEventListener('click', function () {
                    $(quality_checkbox).parent().removeClass('active')
                    this.parentNode.classList.add('active')

                    $('.video.hidden-quality').removeClass('hidden-quality')
                    switch (this.value) {
                        case '1080':
                            $('.video[data-quality!="1080"]').addClass(
                                'hidden-quality'
                            )
                            break
                        case '!1080':
                            $('.video[data-quality="1080"]').addClass(
                                'hidden-quality'
                            )
                            break
                    }
                })
            })

            noStar_checkbox.forEach((item) => {
                item.addEventListener('click', function () {
                    $(noStar_checkbox).parent().removeClass('active')
                    this.parentNode.classList.add('active')

                    $('.video.hidden-starcount').removeClass('hidden-starcount')
                    switch (this.value) {
                        case 'has-star':
                            $('.video[data-nostar="1"]').addClass(
                                'hidden-starcount'
                            )
                            break
                        case 'no-star':
                            $('.video[data-nostar="0"]').addClass(
                                'hidden-starcount'
                            )
                            break
                    }
                })
            })
            $(noStar_checkbox).filter('[value="has-star"]').click() // use hasStar as default filter method

            /* Title */
            title_input.addEventListener('keyup', titleSearch)

            function titleSearch() {
                let input = title_input.value.toLowerCase()
                $videos.removeClass('hidden-title')

                $videos
                    .not(function () {
                        return (
                            this.getAttribute('data-title')
                                .toLowerCase()
                                .includes(input) ||
                            this.getAttribute('data-alias')
                                .toLowerCase()
                                .includes(input)
                        )
                    })
                    .addClass('hidden-title')
            }

            /* Existing */
            existing_checkbox.addEventListener('change', function () {
                $videos.removeClass('hidden-existing')

                if (this.checked) {
                    for (const video of videos) {
                        if (video.getAttribute('data-existing') === '0') {
                            video.classList.add('hidden-existing')
                        }
                    }
                }
            })

            /* Category */
            category_checkbox.forEach((checkbox) => {
                checkbox.addEventListener('change', (e) => {
                    let target = e.target

                    indeterminateToggle(checkbox)

                    let category = target.name.split('category_').pop()
                    let category_class = category.replace(/ /g, '-')

                    Array.from(videos).forEach((video, index) => {
                        let category_arr = video
                            .getAttribute('data-category-name')
                            .slice(2, -2)
                            .split(',')

                        indeterminateHandler(
                            category_arr,
                            category,
                            target,
                            index,
                            true
                        )
                    })

                    $videos.removeClass(`hidden-category-${category_class}`)
                    if (target.checked || target.indeterminate)
                        $videos
                            .not('[data-tmp]')
                            .addClass(`hidden-category-${category_class}`)
                    $videos.removeAttr('data-tmp')
                })
            })

            /* Attributes */
            attribute_checkbox.forEach((checkbox) => {
                checkbox.addEventListener('change', (e) => {
                    let target = e.target

                    indeterminateToggle(checkbox)

                    let attribute = target.name.split('attribute_').pop()
                    let attribute_class = attribute.replace(/ /g, '-')

                    Array.from(videos).forEach((video, index) => {
                        let attribute_arr = video
                            .getAttribute('data-attribute-name')
                            .slice(2, -2)
                            .split(',')

                        indeterminateHandler(
                            attribute_arr,
                            attribute,
                            target,
                            index
                        )
                    })

                    $videos.removeClass(`hidden-attribute-${attribute_class}`)
                    if (target.checked || target.indeterminate)
                        $videos
                            .not('[data-tmp]')
                            .addClass(`hidden-attribute-${attribute_class}`)
                    $videos.removeAttr('data-tmp')
                })
            })

            /** Sort **/
            sort_radio.forEach((radio) => {
                radio.addEventListener('change', function (e) {
                    let target = e.target

                    $(sort_radio).parent().removeClass('selected')
                    radio.parentElement.classList.add('selected')

                    let label = target.id

                    let alphabetically = function (a, b) {
                        return a
                            .querySelector('span')
                            .innerHTML.toLowerCase()
                            .localeCompare(
                                b.querySelector('span').innerHTML.toLowerCase(),
                                'en'
                            )
                    }

                    let alphabetically_reverse = (a, b) => alphabetically(b, a)

                    let added = function (a, b) {
                        return (
                            a.getAttribute('data-id') -
                            b.getAttribute('data-id')
                        )
                    }

                    let added_reverse = (a, b) => added(b, a)

                    let plays = function (a, b) {
                        return (
                            a.getAttribute('data-plays') -
                            b.getAttribute('data-plays')
                        )
                    }

                    let plays_reverse = (a, b) => plays(b, a)

                    let video_date = function (a, b) {
                        let valA = new Date(
                            a.getAttribute('data-date-published')
                        )
                        let valB = new Date(
                            b.getAttribute('data-date-published')
                        )

                        if (!isValidDate(valA)) valA = new Date('2900-01-01')
                        if (!isValidDate(valB)) valB = new Date('2900-01-01')

                        return valA - valB
                    }

                    let video_date_reverse = function (a, b) {
                        let valA = new Date(
                            a.getAttribute('data-date-published')
                        )
                        let valB = new Date(
                            b.getAttribute('data-date-published')
                        )

                        if (!isValidDate(valA)) valA = new Date('1900-01-01')
                        if (!isValidDate(valB)) valB = new Date('1900-01-01')

                        return valB - valA
                    }

                    switch (label) {
                        case 'alphabetically':
                            $videos.sort(alphabetically)
                            break
                        case 'alphabetically_desc':
                            $videos.sort(alphabetically_reverse)
                            break
                        case 'added':
                            $videos.sort(added)
                            break
                        case 'added_desc':
                            $videos.sort(added_reverse)
                            break
                        case 'date':
                            $videos.sort(video_date)
                            break
                        case 'date_desc':
                            $videos.sort(video_date_reverse)
                            break
                        case 'plays':
                            $videos.sort(plays)
                            break
                        case 'plays_desc':
                            $videos.sort(plays_reverse)
                            break
                        default:
                            console.log(`No sort method for: ${label}`)
                    }

                    for (let i = 0; i < videos.length; i++) {
                        $videos[i].parentNode.appendChild($videos[i])
                    }
                })
            })
        })
        .then(function () {
            elementFocus.focus() // Force focus, initialization
        })
        .then(function () {
            new LazyLoad({
                elements_selector: '.lazy',
            })
        })
}

loadData()

updateBtn.addEventListener('click', function () {
    resetData()
    loadData()
})

function resetData() {
    $('.video').remove()
}

function isValidDate(date) {
    return !!(Object.prototype.toString.call(date) === '[object Date]' && +date)
}

function setVideoCount(length) {
    document.getElementById('video-count').textContent = length
}

function tmp(index) {
    videos[index].setAttribute('data-tmp', '')
}

function indeterminateToggle(el) {
    switch (el.getAttribute('data-state')) {
        case '0': // checked
            el.setAttribute('data-state', '1')
            el.indeterminate = false
            el.checked = true

            // Set Label Class
            el.parentElement.classList.add('selected')
            break
        case '1': // indeterminate
            el.setAttribute('data-state', '-1')
            el.indeterminate = true
            el.checked = false

            // Set Label Class
            el.parentElement.classList.add('not')

            // Remove Label Class
            el.parentElement.classList.remove('selected')
            break
        case '-1': // not-checked
            el.setAttribute('data-state', '0')
            el.indeterminate = false
            el.checked = false

            // Remove Label Classes
            el.parentElement.classList.remove('not')
            break
    }
}

function indeterminateHandler(arr, item, parent, index, test = false) {
    if (!test) {
        for (let k = 0, len = arr.length; k < len; k++) {
            if (
                (parent.checked && arr[k] === item) ||
                (parent.indeterminate && arr.indexOf(item) === -1)
            ) {
                tmp(index)
            }
        }
    } else {
        for (let k = 0, len = arr.length; k < len; k++) {
            if (parent.checked) {
                if (
                    (item === 'NULL' && len === 1 && arr[k] === '0') ||
                    arr[k] === item
                ) {
                    tmp(index)
                }
            } else if (parent.indeterminate) {
                if (item === 'NULL') {
                    if (arr.indexOf('0') === -1) {
                        tmp(index)
                    }
                } else if (arr.indexOf(item) === -1) {
                    tmp(index)
                }
            }
        }
    }
}
