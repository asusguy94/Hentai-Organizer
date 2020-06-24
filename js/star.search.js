const breast_radio = document.querySelectorAll('input[name="breast"]')
const eye_radio = document.querySelectorAll('input[name="eye"]')
const hair_radio = document.querySelectorAll('input[name="hair"]')
const hairstyle_radio = document.querySelectorAll('input[name="hairstyle"]')
const attribute_checkbox = document.querySelectorAll('input[name^="attribute"]')

// Initialize PrevState for checkbox
$(attribute_checkbox).attr('data-state', 0)

// Pretty DropDown
$('select.pretty').prettyDropdown({
    height: 30,
    classic: true,
    hoverIntent: -1
});

(function () {
    fetch('json/star.search.php').then(function (result) {
        return result.json()
    }).then(function (data) {
        let wrapper = document.getElementById('stars')
        let elem = data['stars']

        for (let i = 0; i < elem.length; i++) {
            let starID = elem[i]['starID']
            let starName = elem[i]['starName']
            let starImg = elem[i]['starImg']
            let breastSize = elem[i]['breast']
            let eyeColor = elem[i]['eye']
            let hairColor = elem[i]['hair']
            let hairStyle = elem[i]['hairstyle']
            let franchise = elem[i]['franchise']

            let attribute = elem[i]['attribute']
            if (!attribute.length) attribute = ["0"]

            let a = document.createElement('a')
            a.classList.add('star', 'card')
            a.href = `star.php?id=${starID}`
            a.style.display = 'inline-block'
            a.setAttribute('data-breast', breastSize)
            a.setAttribute('data-eye', eyeColor)
            a.setAttribute('data-hair', hairColor)
            a.setAttribute('data-hairstyle', hairStyle)
            a.setAttribute('data-franchise', franchise)
            a.setAttribute('data-attribute-name', '["' + attribute + '"]')

            let img = document.createElement('img')
            img.setAttribute('data-src', `images/stars/${starImg}`)
            img.classList.add('lazy', 'card-img-top')
            img.style.width = '200px'
            img.style.height = '275px'

            let span = document.createElement('span')
            span.classList.add('name', 'card-title')
            span.textContent = starName

            a.appendChild(img)
            a.appendChild(span)
            wrapper.appendChild(a)
        }
    }).then(function () {
        window.stars = document.getElementsByClassName('star')
        window.starLength = stars.length

        window.$stars = $(stars)
    }).then(function () {
        /* Breast Radio Buttons */
        for (let i = 0, wrapperLen = breast_radio.length; i < wrapperLen; i++) {
            breast_radio[i].addEventListener('change', function () {
                $stars.removeClass('hidden-breast')
                let selectedBreast = $('#breasts label').eq(i).text()

                for (let j = 0; j < starLength; j++) {
                    let breast = stars[j].getAttribute('data-breast')
                    if (breast !== selectedBreast) {
                        stars[j].classList.add('hidden-breast')
                    }
                }
            })

            breast_radio[i].oncontextmenu = function () {
                $stars.removeClass('hidden-breast')
                for (let j = 0; j < wrapperLen; j++) {
                    breast_radio[j].checked = false
                }
                return false
            }
        }

        /* Eye Radio Buttons */
        for (let i = 0, wrapperLen = eye_radio.length; i < wrapperLen; i++) {
            eye_radio[i].addEventListener('change', function () {
                $stars.removeClass('hidden-eye')
                let selectedEye = $('#eye label').eq(i).text()

                for (let j = 0; j < starLength; j++) {
                    let hair = stars[j].getAttribute('data-eye')
                    if (hair !== selectedEye) {
                        stars[j].classList.add('hidden-eye')
                    }
                }
            })

            eye_radio[i].oncontextmenu = function () {
                $stars.removeClass('hidden-eye')
                for (let j = 0; j < wrapperLen; j++) {
                    eye_radio[j].checked = false
                }
                return false
            }
        }

        /* Hair Radio Buttons */
        for (let i = 0, wrapperLen = hair_radio.length; i < wrapperLen; i++) {
            hair_radio[i].addEventListener('change', function () {
                $stars.removeClass('hidden-hair')
                let selectedHair = $('#hair label').eq(i).text()

                for (let j = 0; j < starLength; j++) {
                    let hair = stars[j].getAttribute('data-hair')
                    if (hair !== selectedHair) {
                        stars[j].classList.add('hidden-hair')
                    }
                }
            })

            hair_radio[i].oncontextmenu = function () {
                $stars.removeClass('hidden-hair')
                for (let j = 0; j < wrapperLen; j++) {
                    hair_radio[j].checked = false
                }
                return false
            }
        }

        /* HairStyle Radio Buttons */
        for (let i = 0, wrapperLen = hairstyle_radio.length; i < wrapperLen; i++) {
            hairstyle_radio[i].addEventListener('change', function () {
                $stars.removeClass('hidden-hairstyle')
                let selectedHair = $('#hairstyle label').eq(i).text()

                for (let j = 0; j < starLength; j++) {
                    let hairStyle = stars[j].getAttribute('data-hairstyle')
                    if (hairStyle !== selectedHair) {
                        stars[j].classList.add('hidden-hairstyle')
                    }
                }
            })

            hairstyle_radio[i].oncontextmenu = function () {
                $stars.removeClass('hidden-hairstyle')
                for (let j = 0; j < wrapperLen; j++) {
                    hairstyle_radio[j].checked = false
                }
                return false
            }
        }

        /* Attribute Check Boxes */
        for (let i = 0, wrapperLen = attribute_checkbox.length; i < wrapperLen; i++) {
            attribute_checkbox[i].addEventListener('change', function () {
                indeterminateToggle(attribute_checkbox[i])

                let attribute = this.name.split('attribute_').pop()
                let attribute_class = attribute.replace(/ /g, '-')

                for (let j = 0; j < starLength; j++) {
                    let attribute_arr = stars[j].getAttribute('data-attribute-name').slice(2, -2).split(',')

                    indeterminateHandler(attribute_arr, attribute, this, j)
                }

                $stars.removeClass(`hidden-attribute-${attribute_class}`)
                if (this.checked || this.indeterminate) $stars.not('[data-tmp]').addClass(`hidden-attribute-${attribute_class}`)
                $stars.removeAttr('data-tmp')
            })
        }
    }).then(function () {
        new LazyLoad({
            elements_selector: ".lazy",
            threshold: 1500
        })
    })
})()

function tmp(index) {
    stars[index].setAttribute('data-tmp', '')
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

function indeterminateHandler(arr, item, parent, index) {
    for (let k = 0, len = arr.length; k < len; k++) {
        if ((parent.checked && (arr[k] === item)) || (parent.indeterminate && arr[k].indexOf(item) === -1)) {
            tmp(index)
            break
        }
    }
}