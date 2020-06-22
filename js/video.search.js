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
// TODO use jQuery.data() instead of JS.setAttribute()/JQuery.attr()
// TODO checkbox style: https://stackoverflow.com/questions/10270987/change-checkbox-check-image-to-custom-image

const loadData = function () {
    fetch('json/video.search.php').then(function (jsonData) {
        return jsonData.json()
    }).then(function (data) { // CREATE DOM
        const wrapper = document.getElementById('videos')

        const row = document.createElement('div')
        row.classList.add('row', 'justify-content-center')

        for (let i = 0, elem = data['videos']; i < elem.length; i++) {
            let thumbnail = elem[i]['thumbnail']

            let videoID = elem[i]['videoID']
            let videoName = elem[i]['videoName']
            let noStar = elem[i]['noStar']
            let cen = elem[i]['cen']
            let quality = elem[i]['quality']
            let franchise = elem[i]['franchise']

            let date_published = elem[i]['datePublished']

            let attribute = elem[i]['attribute']
            let category = elem[i]['category']
            let alias = elem[i]['alias']

            if (!category.length) category.push('0')
            if (!attribute.length) attribute.push('0')
            if (!alias.length) alias.push('0')

            let existing = elem[i]['existing']

            let a = document.createElement('a')
            a.classList.add('video', 'card', 'ribbon-container')
            a.href = `video.php?id=${videoID}`
            a.setAttribute('data-id', videoID)
            a.setAttribute('data-nostar', noStar)
            a.setAttribute('data-cen', cen)
            a.setAttribute('data-quality', quality)
            a.setAttribute('data-franchise', franchise)
            a.setAttribute('data-date-published', date_published)
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
        }
        wrapper.appendChild(row)
    }).then(function () {
        loader.remove()

        window.video = document.getElementsByClassName('video')
        window.videoLength = video.length

        window.$video = $(video)
    }).then(function () {
        setVideoCount(videoLength) // TODO StarCount-checkbox is incompatible with this -> change StarCount-checkbox

        // Class Change
        const observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === 'class') {
                    setVideoCount($('.video:visible').length)
                }
            })
        })
        observer.observe($video[0], {attributes: true})
    }).then(function () {
        /** Filter **/
        cen_checkbox.forEach(item => {
            item.addEventListener('click', function () {
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

        quality_checkbox.forEach(item => {
            item.addEventListener('click', function () {
                $(quality_checkbox).parent().removeClass('active')
                this.parentNode.classList.add('active')

                $('.video.hidden-quality').removeClass('hidden-quality')
                switch (this.value) {
                    case '1080':
                        $('.video[data-quality!="1080"]').addClass('hidden-quality')
                        break
                    case '!1080':
                        $('.video[data-quality="1080"]').addClass('hidden-quality')
                        break
                }
            })
        })

        noStar_checkbox.forEach(item => {
            item.addEventListener('click', function () {
                $(noStar_checkbox).parent().removeClass('active')
                this.parentNode.classList.add('active')

                $('.video.hidden-starcount').removeClass('hidden-starcount')
                switch (this.value) {
                    case 'has-star':
                        $('.video[data-nostar="1"]').addClass('hidden-starcount')
                        break
                    case 'no-star':
                        $('.video[data-nostar="0"]').addClass('hidden-starcount')
                        break
                }
            })
        })
        $(noStar_checkbox).filter('[value="has-star"]').click() // use hasStar as default filter method

        /* Title */
        title_input.addEventListener('keyup', titleSearch)

        function titleSearch() {
            let input = title_input.value.toLowerCase()
            $video.removeClass('hidden-title')

            $video.not(function () {
                return ((this.getAttribute('data-title').toLowerCase().indexOf(input) > -1) || (this.getAttribute('data-alias').toLowerCase().indexOf(input) > -1))
            }).addClass('hidden-title')
        }

        /* Existing */
        existing_checkbox.addEventListener('change', function () {
            $video.removeClass('hidden-existing')

            if (this.checked) {
                for (let i = 0; i < videoLength; i++) {
                    if (video[i].getAttribute('data-existing') === '0') {
                        video[i].classList.add('hidden-existing')
                    }
                }
            }
        })

        /* Category */
        for (let i = 0, wrapperLen = category_checkbox.length; i < wrapperLen; i++) {
            category_checkbox[i].addEventListener('change', function () {
                indeterminateToggle(category_checkbox[i])

                let category = this.name.split('category_').pop()
                let category_class = category.replace(/ /g, '-')

                for (let j = 0; j < videoLength; j++) {
                    let category_arr = video[j].getAttribute('data-category-name').slice(2, -2).split(',')

                    indeterminateHandler(category_arr, category, this, j, true)
                }

                $video.removeClass(`hidden-category-${category_class}`)
                if (this.checked || this.indeterminate) $video.not('[data-tmp]').addClass(`hidden-category-${category_class}`)
                $video.removeAttr('data-tmp')
            })
        }

        /* Attributes */
        for (let i = 0, wrapperLen = attribute_checkbox.length; i < wrapperLen; i++) {
            attribute_checkbox[i].addEventListener('change', function () {
                indeterminateToggle(attribute_checkbox[i])

                let attribute = this.name.split('attribute_').pop()
                let attribute_class = attribute.replace(/ /g, '-')

                for (let j = 0; j < videoLength; j++) {
                    let attribute_arr = video[j].getAttribute('data-attribute-name').slice(2, -2).split(',')

                    indeterminateHandler(attribute_arr, attribute, this, j)
                }

                $video.removeClass(`hidden-attribute-${attribute_class}`)
                if (this.checked || this.indeterminate) $video.not('[data-tmp]').addClass(`hidden-attribute-${attribute_class}`)
                $video.removeAttr('data-tmp')
            })
        }

        /** Sort **/
        for (let i = 0; i < sort_radio.length; i++) {
            sort_radio[i].addEventListener('change', function () {
                $(sort_radio).parent().removeClass('selected')
                sort_radio[i].parentElement.classList.add('selected')

                let label = this.id

                let alphabetically = function (a, b) {
                    return a.querySelector('span').innerHTML.toLowerCase().localeCompare(b.querySelector('span').innerHTML.toLowerCase(), 'en')
                }

                let alphabetically_reverse = (a, b) => alphabetically(b, a)

                let added = function (a, b) {
                    return a.getAttribute('data-id') - b.getAttribute('data-id')
                }

                let added_reverse = (a, b) => added(b, a)

                let video_date = function (a, b) {
                    let valA = new Date(a.getAttribute('data-date-published'))
                    let valB = new Date(b.getAttribute('data-date-published'))

                    if (!isValidDate(valA)) valA = new Date('2900-01-01')
                    if (!isValidDate(valB)) valB = new Date('2900-01-01')

                    return valA - valB
                }

                let video_date_reverse = function (a, b) {
                    let valA = new Date(a.getAttribute('data-date-published'))
                    let valB = new Date(b.getAttribute('data-date-published'))

                    if (!isValidDate(valA)) valA = new Date('1900-01-01')
                    if (!isValidDate(valB)) valB = new Date('1900-01-01')

                    return valB - valA
                }

                switch (label) {
                    case 'alphabetically':
                        $video.sort(alphabetically)
                        break
                    case 'alphabetically_desc':
                        $video.sort(alphabetically_reverse)
                        break
                    case 'added':
                        $video.sort(added)
                        break
                    case 'added_desc':
                        $video.sort(added_reverse)
                        break
                    case 'date':
                        $video.sort(video_date)
                        break
                    case 'date_desc':
                        $video.sort(video_date_reverse)
                        break
                    default:
                        console.log(`No sort method for: ${label}`)
                }

                for (let i = 0; i < videoLength; i++) {
                    $video[i].parentNode.appendChild($video[i])
                }
            })
        }
    }).then(function () {
        new LazyLoad({
            elements_selector: ".lazy"
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
    return !!(Object.prototype.toString.call(date) === "[object Date]" && +date)
}

function setVideoCount(length) {
    document.getElementById('video-count').textContent = length
}

function tmp(index) {
    video[index].setAttribute('data-tmp', '')
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
            if ((parent.checked && (arr[k] === item)) || (parent.indeterminate && arr[k].indexOf(item) === -1)) {
                tmp(index)
                break
            }
        }
    } else {
        for (let k = 0, len = arr.length; k < len; k++) {
            if (parent.checked) {
                if ((item === 'NULL' && len === 1 && arr[k] === '0') || (arr[k] === item)) {
                    tmp(index)
                    break
                }
            } else if (parent.indeterminate) {
                if (item === 'NULL') {
                    if (arr.indexOf("0") === -1) {
                        tmp(index)
                        break
                    }
                } else if (arr.indexOf(item) === -1) {
                    tmp(index)
                    break
                }
            }
        }
    }
}