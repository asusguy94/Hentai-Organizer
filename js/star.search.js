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

        data['stars'].forEach(elem => {
            let starID = elem['starID']
            let starName = elem['starName']
            let starImg = elem['starImg']
            let breastSize = elem['breast']
            let eyeColor = elem['eye']
            let hairColor = elem['hair']
            let hairStyle = elem['hairstyle']
            let franchise = elem['franchise']

            let attribute = elem['attribute']
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
        })
    }).then(function () {
        window.stars = document.getElementsByClassName('star')
        window.$stars = $(stars)
    }).then(function () {
        /* Breast Radio Buttons */
        breast_radio.forEach(radio => {
            radio.addEventListener('change', e => {
                let target = e.target

                $stars.removeClass('hidden-breast')
                let selectedHair = target.id.split('breast_')[1]

                for (const star of stars) {
                    let hairStyle = star.getAttribute('data-breast')
                    if (hairStyle !== selectedHair) star.classList.add('hidden-breast')
                }
            })

            radio.oncontextmenu = () => {
                $stars.removeClass('hidden-breast')
                radio.checked = false

                return false
            }
        })

        /* Eye Radio Buttons */
        eye_radio.forEach(radio => {
            radio.addEventListener('change', e => {
                let target = e.target

                $stars.removeClass('hidden-eye')
                let selectedHair = target.id.split('eye_')[1]

                for (const star of stars) {
                    let hairStyle = star.getAttribute('data-eye')
                    if (hairStyle !== selectedHair) star.classList.add('hidden-eye')
                }
            })

            radio.oncontextmenu = () => {
                $stars.removeClass('hidden-eye')
                radio.checked = false

                return false
            }
        })

        /* Hair Radio Buttons */
        hair_radio.forEach(radio => {
            radio.addEventListener('change', e => {
                let target = e.target

                $stars.removeClass('hidden-hair')
                let selectedHair = target.id.split('hair_')[1]

                for (const star of stars) {
                    let hairStyle = star.getAttribute('data-hair')
                    if (hairStyle !== selectedHair) star.classList.add('hidden-hair')
                }
            })

            radio.oncontextmenu = () => {
                $stars.removeClass('hidden-hair')
                radio.checked = false

                return false
            }
        })

        /* HairStyle Radio Buttons */
        hairstyle_radio.forEach(radio => {
            radio.addEventListener('change', e => {
                let target = e.target

                $stars.removeClass('hidden-hairstyle')
                let selectedHair = target.id.split('hairstyle_')[1]

                for (const star of stars) {
                    let hairStyle = star.getAttribute('data-hairstyle')
                    if (hairStyle !== selectedHair) star.classList.add('hidden-hairstyle')
                }
            })

            radio.oncontextmenu = () => {
                $stars.removeClass('hidden-hairstyle')
                radio.checked = false

                return false
            }
        })

        /* Attribute Check Boxes */
        attribute_checkbox.forEach(checkbox => {
            checkbox.addEventListener('change', e => {
                let target = e.target

                indeterminateToggle(target)

                let attribute = target.name.split('attribute_').pop()
                let attribute_class = attribute.replace(/ /g, '-')

                Array.from(stars).forEach((star, index) => {
                    let attribute_arr = star.getAttribute('data-attribute-name').slice(2, -2).split(',')
                    indeterminateHandler(attribute_arr, attribute, target, index)
                })

                $stars.removeClass(`hidden-attribute-${attribute_class}`)
                if (target.checked || target.indeterminate) $stars.not('[data-tmp]').addClass(`hidden-attribute-${attribute_class}`)
                $stars.removeAttr('data-tmp')
            })
        })
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
    if (parent.checked) {
        arr.forEach(element => {
            if (element === item) tmp(index)
        })
    } else if (parent.indeterminate && !arr.includes(item)) {
        tmp(index)
    }
}