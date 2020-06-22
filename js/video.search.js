const sort_radio = document.querySelectorAll('input[name="sort"]')

    const noStar_checkbox = document.querySelector('input[name="no-star_0"]')
    const hasStar_checkbox = document.querySelector('input[name="no-star_1"]')

    const cen_checkbox = document.querySelector('input[name="cen"]')
    const ucen_checkbox = document.querySelector('input[name="ucen"]')

    const franchise_input = document.querySelector('input[name="franchise"]')
    const title_input = document.querySelector('input[name="title"]')
    const attribute_checkbox = document.querySelectorAll('input[name^="attribute"]')
    const category_checkbox = document.querySelectorAll('input[name^="category"]')

    const loader = document.getElementById('loader')


    const loadData = (function () {
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
                let franchise = elem[i]['franchise']

                let attribute = elem[i]['attribute']
                let category = elem[i]['category']
                let alias = elem[i]['alias']

                if (!category.length) category.push('0')
                if (!attribute.length) attribute.push('0')
                if (!alias.length) alias.push('0')

                let a = document.createElement('a')
                a.classList.add('video', 'card')
                a.href = `video.php?id=${videoID}`
                a.setAttribute('data-nostar', noStar)
                a.setAttribute('data-cen', cen)
                a.setAttribute('data-franchise', franchise)
                a.setAttribute('data-title', videoName)
                a.setAttribute('data-alias', alias)
                a.setAttribute('data-attribute-name', `["${attribute}"]`)
                a.setAttribute('data-category-name', `["${category}"]`)

                let img = document.createElement('img')
                img.classList.add('lazy', 'data-img-top')
                img.setAttribute('data-src', thumbnail)

                let span = document.createElement('span')
                span.classList.add('title', 'card-title')
                span.textContent = videoName

                a.appendChild(img)
                a.appendChild(span)

                row.appendChild(a)
            }
            wrapper.appendChild(row)
        }).then(function () {
            loader.remove()

            window.video = document.getElementsByClassName('video')
            window.videoLength = video.length
        }).then(function () {
            /** Label Click **/
            for (let i = 0; i < label_input.length; i++) {
                label_input[i].addEventListener('click', function () {
                    $(label_input[i].previousSibling).click()
                })
            }

            /** Filter **/
            /* noStar */
            noStar_checkbox.addEventListener('change', function () {
                if (this.checked) {
                    hasStar_checkbox.checked = false
                    $('.video[data-nostar="0"]').addClass('hidden-starcount')
                } else {
                    $('.video[data-nostar="0"].hidden-starcount').removeClass('hidden-starcount')
                }
            })
            hasStar_checkbox.addEventListener('change', function () {
                if (this.checked) {
                    noStar_checkbox.checked = false
                    $('.video[data-nostar="1"]').addClass('hidden-starcount')
                } else {
                    $('.video[data-nostar="1"].hidden-starcount').removeClass('hidden-starcount')
                }
            })
            hasStar_checkbox.click()

            /* Cen */
            cen_checkbox.addEventListener('change', function () {
                if (this.checked) {
                    ucen_checkbox.checked = false
                    $('.video[data-cen="0"]').addClass('hidden-cen')
                } else {
                    $('.video[data-cen="0"].hidden-cen').removeClass('hidden-cen')
                }
            })

            ucen_checkbox.addEventListener('change', function () {
                if (this.checked) {
                    cen_checkbox.checked = false
                    $('.video[data-cen="1"]').addClass('hidden-cen')
                } else {
                    $('.video[data-cen="1"].hidden-cen').removeClass('hidden-cen')
                }
            })

            /* Title */
            if (title_input != null) {
                title_input.addEventListener('keyup', function () {
                    let input = title_input.value.toLowerCase()
                    $(video).removeClass('hidden-title')

                    if (input !== '') {
                        $(video).not(function () {
                            return ((this.getAttribute('data-title').toLowerCase().indexOf(input) > -1) || (this.getAttribute('data-alias').toLowerCase().indexOf(input) > -1))
                        }).addClass('hidden-title')
                    }
                })
            }

            /* Franchise */
            if (franchise_input != null) {
                franchise_input.addEventListener('keyup', function () {
                    let input = franchise_input.value.toLowerCase()
                    $(video).removeClass('hidden-franchise')

                    if (input !== '') {
                        $(video).not(function () {
                            return (this.getAttribute('data-franchise').toLowerCase().indexOf(input) > -1)
                        }).addClass('hidden-franchise')
                    }
                })
            }

            /* Attributes */
            for (let i = 0, wrapperLen = attribute_checkbox.length; i < wrapperLen; i++) {
                attribute_checkbox[i].addEventListener('change', function () {
                    let attribute = this.name.split('attribute_').pop()
                    let attribute_class = attribute.replace(/ /g, '-')

                    for (let i = 0; i < videoLength; i++) {
                        let attribute_raw = video[i].getAttribute('data-attribute-name').slice(2, -2)
                        let attribute_arr = attribute_raw.split(',')

                        for (let j = 0, len = attribute_arr.length; j < len; j++) {
                            if (this.checked && (attribute_arr[j] === attribute)) {
                                video[i].classList.add('tmp')
                            }
                        }
                    }

                    if (this.checked) $('.video:not(.tmp)').addClass(`hidden-attribute-${attribute_class}`)
                    else $(video).removeClass(`hidden-attribute-${attribute_class}`)
                    $(video).removeClass('tmp') // remove leftover classes
                })
            }

            /* Category */
            for (let i = 0, wrapperLen = category_checkbox.length; i < wrapperLen; i++) {
                category_checkbox[i].addEventListener('change', function () {
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