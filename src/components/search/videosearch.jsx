import React, { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'

import './search.scss'

import config from '../config.json'

class VideoSearchPage extends Component {
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
                    attribute: [],
                    titleSearch: false,
                    noCategory: false,
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

    isValidDate(date) {
        return !!(Object.prototype.toString.call(date) === '[object Date]' && +date)
    }

    handleTitleSearch(e) {
        let searchValue = e.target.value.toLowerCase()

        let videos = this.state.videos.map((item) => {
            item.hidden.titleSearch = !item.name.toLowerCase().includes(searchValue)

            return item
        })

        this.setState({ videos })
    }

    handleCategoryFilter(e, target) {
        let videos = this.state.videos.map((video) => {
            if (target === null) {
                video.hidden.noCategory = e.target.checked && video.categories.length
            } else {
                const targetLower = target.name.toLowerCase()

                if (!e.target.checked) {
                    video.hidden.noCategory = false
                    let match = !video.categories
                        .map((category) => {
                            return category.toLowerCase()
                        })
                        .includes(targetLower)

                    if (match) {
                        let index = video.hidden.category.indexOf(targetLower)
                        video.hidden.category.splice(index, 1)
                    }
                } else {
                    let match = !video.categories
                        .map((category) => {
                            return category.toLowerCase()
                        })
                        .includes(targetLower)

                    if (match && !video.hidden.category.includes(targetLower)) {
                        video.hidden.category.push(targetLower)
                    }
                }
            }

            return video
        })

        this.setState({ videos })
    }

    handleAttributeFilter(e, target) {
        let videos = this.state.videos.map((video) => {
            if (target === null) {
                video.hidden.noCategory = e.target.checked && video.attributes.length
            } else {
                const targetLower = target.name.toLowerCase()

                if (!e.target.checked) {
                    let match = !video.attributes
                        .map((attribute) => {
                            return attribute.toLowerCase()
                        })
                        .includes(targetLower)

                    if (match) {
                        let index = video.hidden.attribute.indexOf(targetLower)
                        video.hidden.attribute.splice(index, 1)
                    }
                } else {
                    let match = !video.attributes
                        .map((attribute) => {
                            return attribute.toLowerCase()
                        })
                        .includes(targetLower)

                    if (match && !video.hidden.attribute.includes(targetLower)) {
                        video.hidden.attribute.push(targetLower)
                    }
                }
            }

            return video
        })

        this.setState({ videos })
    }

    sort_default_asc() {
        let videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return String(valA).localeCompare(valB)
        })

        this.setState({ videos })
    }

    sort_default_desc() {
        let videos = this.state.videos
        videos.sort((b, a) => {
            let valA = a.name.toLowerCase()
            let valB = b.name.toLowerCase()

            return String(valA).localeCompare(valB)
        })

        this.setState({ videos })
    }

    sort_added_asc() {
        let videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.id
            let valB = b.id

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_added_desc() {
        let videos = this.state.videos
        videos.sort((b, a) => {
            let valA = a.id
            let valB = b.id

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_date_asc() {
        let videos = this.state.videos
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
        let videos = this.state.videos
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
        let videos = this.state.videos
        videos.sort((a, b) => {
            let valA = a.plays
            let valB = b.plays

            return valA - valB
        })

        this.setState({ videos })
    }

    sort_popular_desc() {
        let videos = this.state.videos
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
                            <input type='checkbox' id='category_NULL' onChange={(e) => this.handleCategoryFilter(e, null)} />
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
                                        onChange={(e) => this.handleCategoryFilter(e, category)}
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
                                        onChange={(e) => this.handleAttributeFilter(e, attribute)}
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
                                    className={`video ribbon-container card ${this.isHidden(video) && 'd-none'}`}
                                    href={`/video/${video.id}`}
                                >
                                    <img className='card-img-top' src={`${config.source}/images/videos/${video.id}-290`} alt='video' />

                                    <span className='title card-title text-center'>{video.name}</span>

                                    <span className='ribbon'>{this.state.videos[i].quality}</span>
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
    }

    getData() {
        Axios.get(`${config.api}/videosearch.php`)
            .then(({ data: { videos } }) => {
                this.setState(() => {
                    videos = videos.map((item) => {
                        item.hidden = {
                            category: [],
                            attribute: [],
                            titleSearch: false,
                            noCategory: false,
                        }

                        return item
                    })

                    return { videos }
                })
            })
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.videos = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/categories.php`)
            .then(({ data: categories }) => this.setState({ categories }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.categories = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/attributes.php`)
            .then(({ data: attributes }) => this.setState({ attributes }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.attributes = true

                    return { loaded }
                })
            })
    }
}

export default VideoSearchPage
