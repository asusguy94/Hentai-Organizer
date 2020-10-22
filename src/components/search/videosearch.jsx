import React, { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'

import Indeterminate from '../indeterminate/indeterminate'
import Ribbon from '../ribbon/ribbon'

import './search.scss'

import config from '../config.json'

class VideoSearchPage extends Component {
    constructor() {
        super()
        this.indeterminate = new Indeterminate()
    }

    state = {
        videos: [
            {
                id: 0,
                noStar: 0,
                cen: 0,
                quality: 360,
                franchise: '',
                name: '',
                published: '',
                plays: 0,
                categories: [],
                attribute: [],
                hidden: {
                    category: [],
                    notCategory: [],
                    attribute: [],
                    notAttribute: [],
                    titleSearch: false,
                    noCategory: false,
                    notNoCategory: false,
                },
            },
        ],

        categories: [
            {
                id: 0,
                name: '',
            },
        ],

        attributes: [
            {
                id: 0,
                name: '',
            },
        ],

        loaded: {
            videos: false,

            categories: false,
            attributes: false,
        },
    }

    getCount() {
        const obj = this.state.videos
        let count = obj.length

        obj.forEach(({ hidden }) => {
            let value = 0
            for (const prop in hidden) {
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
        for (const prop in hidden) {
            if (typeof hidden[prop] !== 'object') {
                value += Number(hidden[prop])
            } else {
                value += Number(hidden[prop].length > 0)
            }
        }

        return value
    }

    isValidDate(date) {
        return !!(Object.prototype.toString.call(date) === '[object Date]' && +date)
    }

    handleTitleSearch(e) {
        const searchValue = e.target.value.toLowerCase()

        const videos = this.state.videos.map((item) => {
            item.hidden.titleSearch = !item.name.toLowerCase().includes(searchValue)

            return item
        })

        this.setState({ videos })
    }

    handleCategoryFilter(e, target) {
        const videos = this.state.videos.map((video) => {
            if (target === null) {
                if (e.target.indeterminate) {
                    video.hidden.noCategory = false
                    video.hidden.notNoCategory = video.categories.length === 0
                } else if (!e.target.checked) {
                    video.hidden.notNoCategory = false
                } else {
                    video.hidden.noCategory = video.categories.length !== 0
                }
            } else {
                const targetLower = target.name.toLowerCase()

                if (e.target.indeterminate) {
                    const match = video.categories.some((category) => {
                        return category.toLowerCase() === targetLower
                    })

                    // INDETERMINATE
                    if (match) {
                        video.hidden.notCategory.push(targetLower)
                    } else {
                        // Remove checked-status from filtering
                        const index = video.hidden.category.indexOf(targetLower)
                        video.hidden.category.splice(index, 1)
                    }
                } else if (!e.target.checked) {
                    video.hidden.noCategory = false
                    const match = video.categories
                        .map((category) => {
                            return category.toLowerCase()
                        })
                        .includes(targetLower)

                    // NOT-CHECKED
                    if (match) {
                        // Remove checked-status from filtering
                        const index = video.hidden.notCategory.indexOf(targetLower)
                        video.hidden.notCategory.splice(index, 1)
                    }
                } else {
                    const match = !video.categories
                        .map((category) => {
                            return category.toLowerCase()
                        })
                        .includes(targetLower)

                    // CHECKED
                    if (match) {
                        video.hidden.category.push(targetLower)
                    }
                }
            }

            return video
        })

        this.setState({ videos })
    }

    handleAttributeFilter(e, target) {
        const targetLower = target.name.toLowerCase()

        const videos = this.state.videos.map((video) => {
            if (e.target.indeterminate) {
                const match = video.attributes.some((attribute) => {
                    return attribute.toLowerCase() === targetLower
                })

                // INDETERMINATE
                if (match) {
                    video.hidden.notAttribute.push(targetLower)
                } else {
                    // Remove checked-status from filtering
                    const index = video.hidden.attribute.indexOf(targetLower)
                    video.hidden.attribute.splice(index, 1)
                }
            } else if (!e.target.checked) {
                const match = video.attributes
                    .map((attribute) => {
                        return attribute.toLowerCase()
                    })
                    .includes(targetLower)

                // NOT-CHECKED
                if (match) {
                    // Remove indeterminate-status from filtering
                    const index = video.hidden.notAttribute.indexOf(targetLower)
                    video.hidden.notAttribute.splice(index, 1)
                }
            } else {
                const match = !video.attributes
                    .map((attribute) => {
                        return attribute.toLowerCase()
                    })
                    .includes(targetLower)

                // CHECKED
                if (match) {
                    video.hidden.attribute.push(targetLower)
                }
            }

            return video
        })

        this.setState({ videos })
    }

    sort_default_asc() {
        const { videos } = this.state
        videos.sort((a, b) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return String(valA).localeCompare(valB)
        })

        this.setState({ videos })
    }

    sort_default_desc() {
        const { videos } = this.state
        videos.sort((b, a) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return String(valA).localeCompare(valB)
        })

        this.setState({ videos })
    }

    sort_added_asc() {
        const { videos } = this.state
        videos.sort((a, b) => {
            let valA = a.id
            let valB = b.id

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_added_desc() {
        const { videos } = this.state
        videos.sort((b, a) => {
            let valA = a.id
            let valB = b.id

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_date_asc() {
        const { videos } = this.state
        videos.sort((a, b) => {
            let valA = new Date(a.published)
            let valB = new Date(b.published)

            if (!this.isValidDate(valA)) valA = new Date('2900-01-01')
            if (!this.isValidDate(valB)) valB = new Date('2900-01-01')

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_date_desc() {
        const { videos } = this.state
        videos.sort((b, a) => {
            let valA = new Date(a.published)
            let valB = new Date(b.published)

            if (!this.isValidDate(valA)) valA = new Date('1900-01-01')
            if (!this.isValidDate(valB)) valB = new Date('1900-01-01')

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_popular_asc() {
        const { videos } = this.state
        videos.sort((a, b) => {
            let valA = a.plays
            let valB = b.plays

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_popular_desc() {
        const { videos } = this.state
        videos.sort((b, a) => {
            let valA = a.plays
            let valB = b.plays

            return valA - valB
        })

        this.setState({ videos })
    }

    render() {
        return (
            <div className='search-page col-12 row'>
                <aside className='col-2'>
                    <div id='update' className='col btn btn-outline-primary d-none'>
                        Update Data
                    </div>

                    <div className='input-wrapper'>
                        <input type='text' placeholder='Title' autoFocus onChange={this.handleTitleSearch.bind(this)} />
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

                    <div className='input-wrapper'>
                        <input id='added_asc' type='radio' name='sort' onChange={this.sort_added_desc.bind(this)} />
                        <label htmlFor='added_asc'>New Upload</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='added_desc' type='radio' name='sort' onChange={this.sort_added_asc.bind(this)} />
                        <label htmlFor='added_desc'>Old Upload</label>
                    </div>

                    <div className='input-wrapper'>
                        <input id='date_asc' type='radio' name='sort' onChange={this.sort_date_desc.bind(this)} />
                        <label htmlFor='date_asc'>Newest</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='date_desc' type='radio' name='sort' onChange={this.sort_date_asc.bind(this)} />
                        <label htmlFor='date_desc'>Oldest</label>
                    </div>

                    <div className='input-wrapper'>
                        <input id='popularity_desc' type='radio' name='sort' onChange={this.sort_popular_desc.bind(this)} />
                        <label htmlFor='popularity_desc'>Most Popular</label>
                    </div>
                    <div className='input-wrapper'>
                        <input id='popularity_asc' type='radio' name='sort' onChange={this.sort_popular_asc.bind(this)} />
                        <label htmlFor='popularity_asc'>Least Popular</label>
                    </div>

                    <h2>Categories</h2>
                    <div id='categories'>
                        <div className='input-wrapper'>
                            <input
                                type='checkbox'
                                id='category_NULL'
                                onChange={(e) => {
                                    this.indeterminate.handleIndeterminate(e)
                                    this.handleCategoryFilter(e, null)
                                }}
                            />
                            <label htmlFor='category_NULL' className='global-category'>
                                NULL
                            </label>
                        </div>
                        {this.state.loaded.categories &&
                            this.state.categories.map((category, i) => (
                                <div className='input-wrapper' key={i}>
                                    <input
                                        type='checkbox'
                                        id={`category-${category.name}`}
                                        onChange={(e) => {
                                            this.indeterminate.handleIndeterminate(e)
                                            this.handleCategoryFilter(e, category)
                                        }}
                                    />
                                    <label htmlFor={`category-${category.name}`}>{category.name}</label>
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
                                        id={`attribute-${attribute.name}`}
                                        onChange={(e) => {
                                            this.indeterminate.handleIndeterminate(e)
                                            this.handleAttributeFilter(e, attribute)
                                        }}
                                    />
                                    <label htmlFor={`attribute-${attribute.name}`}>{attribute.name}</label>
                                </div>
                            ))}
                    </div>
                </aside>

                <section id='videos' className='col-10'>
                    {this.state.loaded.videos && (
                        <h2 className='text-center'>
                            <span className='count'>{this.getCount()}</span> Videos
                        </h2>
                    )}

                    <div className='row justify-content-center'>
                        {this.state.loaded.videos ? (
                            this.state.videos.map((video, i) => (
                                <a
                                    key={i}
                                    className={`video ribbon-container card ${this.isHidden(video) ? 'd-none' : ''}`}
                                    href={`/video/${video.id}`}
                                >
                                    <img className='card-img-top' src={`${config.source}/images/videos/${video.id}-290`} alt='video' />

                                    <span className='title card-title text-center'>{video.name}</span>

                                    <Ribbon label={video.quality} />
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

        document.title = 'Video Search'
    }

    getData() {
        Axios.get(`${config.api}/videosearch.php`).then(({ data: { videos } }) => {
            this.setState((prevState) => {
                videos = videos.map((item) => {
                    item.hidden = {
                        category: [],
                        notCategory: [],
                        attribute: [],
                        notAttribute: [],
                        titleSearch: false,
                        noCategory: false,
                        notNoCategory: false,
                    }

                    return item
                })

                const { loaded } = prevState
                loaded.videos = true

                return { videos, loaded }
            })
        })

        Axios.get(`${config.api}/categories.php`).then(({ data: categories }) => {
            this.setState((prevState) => {
                const { loaded } = prevState
                loaded.categories = true

                return { categories, loaded }
            })
        })

        Axios.get(`${config.api}/attributes.php`).then(({ data: attributes }) => {
            this.setState((prevState) => {
                const { loaded } = prevState
                loaded.attributes = true

                return { attributes, loaded }
            })
        })
    }
}

export default VideoSearchPage
