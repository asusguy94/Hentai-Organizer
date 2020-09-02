import React, { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'

import './search.scss'

import config from '../config'

class StarSearchPage extends Component {
    state = {
        stars: [
            {
                id: 0,
                name: '',
                breast: '',
                eyecolor: '',
                haircolor: '',
                hairstyle: '',
                attributes: '',
                hidden: {
                    titleSearch: false,
                    breast: false,
                    eyecolor: false,
                    haircolor: false,
                    hairstyle: false,
                    attributes: [],
                },
            },
        ],

        breasts: [],
        eyecolors: [],
        haircolors: [],
        hairstyles: [],
        attributes: [],

        loaded: {
            stars: false,

            breasts: false,
            eyecolors: false,
            haircolors: false,
            hairstyles: false,
            attributes: false,
        },
    }

    getCount() {
        const obj = this.state.stars
        let count = obj.length

        obj.forEach(({ hidden }) => {
            let value = 0
            for (let prop in hidden) {
                if (typeof hidden[prop] !== 'object') {
                    value += Number(hidden[prop])
                } else {
                    value += Number(hidden[prop].length > 0)
                }
            }
            if (value) count--
        })
        return count
    }

    isHidden({ hidden }) {
        let value = 0
        for (var prop in hidden) {
            if (typeof hidden[prop] !== 'object') {
                value += Number(hidden[prop])
            } else {
                value += Number(hidden[prop].length > 0)
            }
        }

        return value
    }

    handleTitleSearch(e) {
        const searchValue = e.target.value.toLowerCase()

        let stars = this.state.stars.map((item) => {
            item.hidden.titleSearch = !item.name.toLowerCase().includes(searchValue)

            return item
        })

        this.setState({ stars })
    }

    handleBreastFilter(e, target) {
        let stars = this.state.stars.map((star) => {
            star.hidden.breast = false
            if (target === null) {
                star.hidden.noBreast = e.target.checked && star.breast.length
            } else {
                let match = star.breast.toLowerCase() !== target.toLowerCase()

                star.hidden.breast = match
            }

            return star
        })
        this.setState({ stars })
    }

    handleBreastFilter_ALL() {
        let stars = this.state.stars.map((star) => {
            star.hidden.breast = false
            star.hidden.noBreast = false

            return star
        })

        this.setState({ stars })
    }

    handleHaircolorFilter(target) {
        let stars = this.state.stars.map((star) => {
            star.hidden.haircolor = star.haircolor.toLowerCase() !== target.toLowerCase()

            return star
        })
        this.setState({ stars })
    }

    handleHaircolorFilter_ALL() {
        let stars = this.state.stars.map((star) => {
            star.hidden.haircolor = false

            return star
        })

        this.setState({ stars })
    }

    handleAttributeFilter(e, target) {
        let stars = this.state.stars.map((star) => {
            const targetLower = target.toLowerCase()

            if (!e.target.checked) {
                let match = !star.attributes
                    .map((attribute) => {
                        return attribute.toLowerCase()
                    })
                    .includes(targetLower)

                if (match) {
                    let index = star.hidden.attributes.indexOf(targetLower)
                    star.hidden.attributes.splice(index, 1)
                }
            } else {
                let match = !star.attributes
                    .map((attribute) => {
                        return attribute.toLowerCase()
                    })
                    .includes(targetLower)

                if (match && !star.hidden.attributes.includes(targetLower)) {
                    star.hidden.attributes.push(targetLower)
                }
            }

            return star
        })

        this.setState({ stars })
    }

    sort_default_asc() {
        let stars = this.state.stars
        stars.sort((a, b) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valA.localeCompare(valB, 'en')
        })

        this.setState({ stars })
    }

    sort_default_desc() {
        let stars = this.state.stars
        stars.sort((b, a) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return valA.localeCompare(valB, 'en')
        })

        this.setState({ stars })
    }

    render() {
        return (
            <div className='search-page col-12 row'>
                <aside className='col-2'>
                    <div id='update' className='col btn-outline-primary d-none'>
                        Update Data
                    </div>

                    <div className='input-wrapper'>
                        <input type='text' placeholder='Name' autoFocus onChange={this.handleTitleSearch.bind(this)} />
                    </div>

                    <h2>Sort</h2>
                    <div className='input-wrapper'>
                        <input id='alphabetically' type='radio' name='sort' onChange={this.sort_default_asc.bind(this)} defaultChecked />
                        <label htmlFor='alphabetically'>A-Z</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='alphabetically_desc' type='radio' name='sort' onChange={this.sort_default_desc.bind(this)} />
                        <label htmlFor='alphabetically_desc'>Z-A</label>
                    </div>

                    <h2>Breast</h2>
                    <div id='breasts'>
                        <div className='input-wrapper'>
                            <input
                                type='radio'
                                id='breast_ALL'
                                name='breast'
                                defaultChecked
                                onChange={() => this.handleBreastFilter_ALL()}
                            />
                            <label htmlFor='breast_ALL' className='global-category'>
                                All
                            </label>
                        </div>

                        {this.state.loaded.breasts &&
                            this.state.breasts.map((breast, i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='radio'
                                        name='breast'
                                        id={`category-${breast}`}
                                        onChange={(e) => this.handleBreastFilter(e, breast)}
                                    />
                                    <label htmlFor={`category-${breast}`}>{breast}</label>
                                </div>
                            ))}
                    </div>

                    <h2>Hair Color</h2>
                    <div id='haircolors'>
                        <div className='input-wrapper'>
                            <input
                                type='radio'
                                id='haircolor_ALL'
                                name='haircolor'
                                defaultChecked
                                onChange={() => this.handleHaircolorFilter_ALL()}
                            />
                            <label htmlFor='haircolor_ALL' className='global-category'>
                                All
                            </label>
                        </div>

                        {this.state.loaded.haircolors &&
                            this.state.haircolors.map((hairColor, i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='radio'
                                        name='haircolor'
                                        id={`haircolor-${hairColor}`}
                                        onChange={() => this.handleHaircolorFilter(hairColor)}
                                    />
                                    <label htmlFor={`haircolor-${hairColor}`}>{hairColor}</label>
                                </div>
                            ))}
                    </div>

                    <h2>Attributes</h2>
                    <div id='attributes'>
                        {this.state.loaded.attributes &&
                            this.state.attributes.map((attribute, i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='checkbox'
                                        id={`attribute-${attribute}`}
                                        onChange={(e) => this.handleAttributeFilter(e, attribute)}
                                    />
                                    <label htmlFor={`attribute-${attribute}`}>{attribute}</label>
                                </div>
                            ))}
                    </div>
                </aside>

                <section id='stars' className='col-10'>
                    {this.state.loaded.stars && (
                        <h2 className='text-center'>
                            <span className='count'>{this.getCount()}</span> Stars
                        </h2>
                    )}

                    <div className='row justify-content-center'>
                        {this.state.loaded.stars ? (
                            this.state.stars.map((star, i) => (
                                <a
                                    key={i}
                                    href={`/star/${star.id}`}
                                    className={`star ribbon-container card ${this.isHidden(star) ? 'd-none' : ''}`}
                                >
                                    <img className='card-img-top' src={`${config.source}/images/stars/${star.image}`} alt='star' />

                                    <span className='title card-title text-center'>{star.name}</span>
                                </a>
                            ))
                        ) : (
                            <div id='loader'></div>
                        )}
                    </div>
                </section>

                <ScrollToTop smooth />
            </div>
        )
    }

    componentDidMount() {
        this.getData()

        document.title = 'Star Search'
    }

    getData() {
        Axios.get(`${config.api}/starsearch.php`)
            .then(({ data: { stars } }) => {
                this.setState(() => {
                    stars = stars.map((item) => {
                        item.hidden = {
                            titleSearch: false,

                            breast: false,
                            eyecolor: false,
                            haircolor: false,
                            hairstyle: false,
                            attributes: [],
                        }

                        return item
                    })

                    return { stars }
                })
            })
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.stars = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/stardata.php`)
            .then(({ data }) => {
                const { breast: breasts, eyecolor: eyecolors, haircolor: haircolors, hairstyle: hairstyles, attribute: attributes } = data

                this.setState({ breasts, eyecolors, haircolors, hairstyles, attributes })
            })
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.breasts = true
                    loaded.eyecolors = true
                    loaded.haircolors = true
                    loaded.hairstyles = true
                    loaded.attributes = true
                })
            })
    }
}

export default StarSearchPage
