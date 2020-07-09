import React, { Component } from 'react'
import Axios from 'axios'

import { PlyrComponent } from 'plyr-react'
import Hls from 'hls.js'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import ReactTooltip from 'react-tooltip'

import Modal from '../modal'

import '../styles/video.scss'

import config from '../config'

class VideoPage extends Component {
    state = {
        video: {
            id: 0,
            nextID: 0,
            episode: 0,
            franchise: '',
            name: '',
            path: {
                file: '',
                stream: '',
            },
            duration: 0,
            date: {
                added: '',
                published: '',
            },
            quality: 0,
            censored: false,
            plays: 0,
            attributes: [
                // TODO get from bookmark-attributes_table and stars_table
                {
                    id: 0,
                    name: '',
                },
            ],
        },
        stars: [
            {
                id: 0,
                name: '',
                // TODO Should contain star-attributes
            },
        ],

        bookmarks: [
            {
                id: 0,
                name: '',
                start: 0,
                starID: 0,
                attributes: [
                    {
                        id: 0,
                        name: '',
                    },
                ],
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
            hls: false,
            video: false,
            bookmarks: false,
            stars: false,
            categories: false,
            attributes: false,

            videoEvents: false,
        },
        seekSpeed: {
            regular: 1,
            wheel: 10,
        },
        modal: {
            visible: false,
            data: null,
        },
        newVideo: false,
    }

    handleWheel(e) {
        this.player.player.currentTime += this.state.seekSpeed.wheel * Math.sign(e.deltaY) * -1
    }

    handleModal(title = null, data = null) {
        this.setState((prevState) => {
            let modal = prevState.modal
            modal.title = title
            modal.data = data
            modal.visible = !modal.visible

            return { modal }
        })
    }

    handleCensor_toggle() {
        Axios.get(`${config.api}/cen.php?id=${this.state.video.id}`).then(() => {
            this.setState((prevState) => {
                let video = prevState.video
                video.censored = !video.censored

                return { video }
            })
        })
    }

    async handleFname_copy() {
        await navigator.clipboard.writeText(this.state.video.path.file)
    }

    handleVideo_play(time) {
        this.player.player.currentTime = Number(time)
        this.player.player.play()
    }

    /* Bookmarks - own class? */
    handleBookmark_add(category, star = null) {
        let time = Math.round(this.player.player.currentTime)
        if (time) {
            if (star === null) {
                Axios.get(
                    `${config.api}/addbookmark.php?videoID=${this.state.video.id}&categoryID=${category.id}&time=${time}`
                ).then(({ data }) => success(data))
            } else {
                Axios.get(
                    `${config.api}/addbookmark.php?videoID=${this.state.video.id}&categoryID=${category.id}&time=${time}&starID=${star.id}`
                ).then(({ data }) => success(data, star.id))
            }
        }

        const success = (data, starID = 0) => {
            let attributes = data.attributes
            if (typeof data.attributes === 'undefined') attributes = [{ id: 0, name: '' }]

            this.setState((prevState) => {
                let bookmarks = prevState.bookmarks
                bookmarks.push({
                    id: data.id,
                    name: category.name,
                    start: time,
                    starID,
                    attributes,
                })

                return { bookmarks }
            })
        }
    }

    handleBookmark_time(id) {
        let time = Math.round(this.player.player.currentTime)

        Axios.get(`${config.api}/changebookmarktime.php?id=${id}&time=${time}`).then(({ data }) => {
            if (data.success) {
                let bookmarks = this.state.bookmarks

                let arr = Object.keys(bookmarks).map((i) => {
                    if (bookmarks[i].id === id) bookmarks[i].start = time

                    return bookmarks[i]
                })

                this.setState({ bookmarks: arr })
            }
        })
    }

    handleBookmark_remove(id) {
        Axios.get(`${config.api}/removebookmark.php?id=${id}`).then(() => {
            let bookmarks = this.state.bookmarks.filter((item) => {
                return item.id !== id
            })

            this.setState({ bookmarks })
        })
    }

    handleBookmark_category(category, bookmark) {
        Axios.get(`${config.api}/changebookmarkcategory.php?id=${bookmark.id}&categoryID=${category.id}`).then(() => {
            let bookmarks = this.state.bookmarks
            let obj = Object.keys(bookmarks).map((i) => {
                if (bookmarks[i].id === bookmark.id) {
                    let item = bookmarks[i]
                    item.name = category.name

                    return item
                }

                return bookmarks[i]
            })

            this.setState({ bookmarks: obj })
        })
    }

    handleBookmark_addAttribute(attribute, bookmark) {
        Axios.get(`${config.api}/addbookmarkattribute.php?bookmarkID=${bookmark.id}&attributeID=${attribute.id}`).then(() => {
            let bookmarks = this.state.bookmarks
            let obj = Object.keys(bookmarks).map((i) => {
                if (bookmarks[i].id === bookmark.id) {
                    let item = bookmarks[i]
                    let attributes = item.attributes
                    attributes = attributes.push({ id: attribute.id, name: attribute.name })

                    return item
                }

                return bookmarks[i]
            })

            this.setState({ bookmarks: obj })
        })
    }

    /* Franchise - own class? */
    async handleFranchise_copy() {
        await navigator.clipboard.writeText(this.state.video.franchise)
    }

    /* Star - own class? */
    handleStar_remove(id) {
        Axios.get(`${config.api}/removevideostar.php?videoID=${this.state.video.id}&starID=${id}`).then(() => {
            let stars = this.state.stars.filter((item) => {
                return item.id !== id
            })

            // TODO check if star has bookmarks
            this.setState({ stars })
        })
    }

    /* Plays - own class? */
    handlePlays_add() {
        Axios.get(`${config.api}/addplay.php?videoID=${this.state.video.id}`).then(() => {
            console.log('Play Added')
        })
    }

    handlePlays_reset() {
        Axios.get(`${config.api}/removeplays.php?videoID=${this.state.video.id}`).then(() => {
            this.setState((prevState) => {
                let video = prevState.video
                video.plays = 0

                return { video }
            })
        })
    }

    render() {
        return (
            <div className='video-page col-12 row'>
                <section className='col-9'>
                    <header className='header row'>
                        <div className='col-12'>
                            <h1 className='header__title h2 align-middle'>
                                <div className='d-inline-block align-middle'>
                                    <ContextMenuTrigger id='title'>{this.state.video.name}</ContextMenuTrigger>
                                </div>

                                <ContextMenu id='title'>
                                    <hr />

                                    <MenuItem onClick={() => this.handleFranchise_copy()}>
                                        <i className='far fa-copy' /> Copy Franchise
                                    </MenuItem>
                                </ContextMenu>

                                <small className='header__censored text-muted'>
                                    {this.state.video.censored && <span className='label'>Censored</span>}
                                </small>
                            </h1>

                            <div className='header__date btn btn-sm btn-outline-primary'>
                                <ContextMenuTrigger id='menu__date'>
                                    <i className='far fa-calendar-check' />
                                    {this.state.video.date.published}
                                </ContextMenuTrigger>

                                <ContextMenu id='menu__date'>
                                    <MenuItem disabled>
                                        <i className='far fa-edit' />
                                        Edit Date
                                    </MenuItem>
                                </ContextMenu>
                            </div>

                            <div className='header__quality btn btn-sm btn-outline-primary'>
                                <i className='far fa-film' />
                                {this.state.video.quality}
                            </div>

                            <a
                                className='header__next btn btn-sm btn-outline-primary float-right'
                                id='next'
                                href={`/video/${this.state.video.nextID}`}
                            >
                                Next
                            </a>
                        </div>
                    </header>

                    <div className='video-container' onWheel={this.handleWheel.bind(this)}>
                        <ContextMenuTrigger id='video'>
                            {this.state.loaded.video && (
                                <PlyrComponent
                                    ref={(player) => (this.player = player)}
                                    options={{
                                        controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'fullscreen'],
                                        hideControls: false,
                                        ratio: '21:9',
                                        keyboard: { global: true },
                                        seekTime: this.state.seekSpeed.regular,
                                        previewThumbnails: {
                                            enabled: true,
                                            src: `${config.source}/vtt/${this.state.video.id}.vtt`,
                                        },
                                    }}
                                    sources={{
                                        type: 'video',
                                        sources: [
                                            {
                                                src: `${config.source}/videos/${this.state.video.path.stream}`,
                                                type: 'application/x-mpegURL',
                                            },
                                            {
                                                src: `${config.source}/videos/${this.state.video.path.file}`,
                                                type: 'video/mp4',
                                            },
                                        ],
                                    }}
                                />
                            )}
                        </ContextMenuTrigger>

                        <ContextMenu id='video'>
                            <MenuItem
                                onClick={() => {
                                    this.handleModal(
                                        'Add Bookmark',
                                        Object.keys(this.state.categories).map((i) => {
                                            return (
                                                <div
                                                    key={i}
                                                    className='btn btn-sm btn-outline-primary d-block'
                                                    onClick={() => {
                                                        this.handleModal()
                                                        this.handleBookmark_add(this.state.categories[i])
                                                    }}
                                                >
                                                    {this.state.categories[i].name}
                                                </div>
                                            )
                                        })
                                    )
                                }}
                            >
                                <i className='far fa-plus' /> Add Bookmark
                            </MenuItem>

                            <MenuItem onClick={() => this.handleCensor_toggle()}>
                                {this.state.video.censored ? (
                                    <React.Fragment>
                                        <i className='far fa-check-circle' /> Uncensor
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>
                                        <i className='far fa-exclamation-circle' /> Censor
                                    </React.Fragment>
                                )}
                            </MenuItem>

                            <MenuItem onClick={() => this.handlePlays_reset()}>
                                <i className='far fa-trash-alt' /> Remove Plays
                            </MenuItem>

                            <hr />

                            <MenuItem onClick={() => this.handleFname_copy()}>
                                <i className='far fa-copy' /> Copy Filename
                            </MenuItem>
                        </ContextMenu>
                    </div>

                    <div className='col-12' id='timeline'>
                        {this.state.loaded.bookmarks &&
                            this.state.loaded.video &&
                            Object.keys(this.state.bookmarks).map((i) => (
                                <React.Fragment key={i}>
                                    <div
                                        className='btn btn-sm btn-outline-primary bookmark'
                                        style={{
                                            left: `${((this.state.bookmarks[i].start * 100) / this.state.video.duration) * 0.88}%`,
                                        }}
                                        onClick={() => this.handleVideo_play(this.state.bookmarks[i].start)}
                                        ref={(bookmark) => (this.bookmarks[i] = bookmark)}
                                        data-level={1}
                                    >
                                        <ContextMenuTrigger id={`bookmark-${i}`}>
                                            <div data-tip={true} data-for={`bookmark-info-${i}`}>
                                                {this.state.bookmarks[i].name}
                                            </div>
                                        </ContextMenuTrigger>

                                        <ReactTooltip id={`bookmark-info-${i}`} effect='solid'>
                                            {this.state.bookmarks[i].starID !== 0 && (
                                                <img
                                                    alt='star'
                                                    className='star__image'
                                                    data-star-id={this.state.bookmarks[i].starID}
                                                    src={`${config.source}/images/stars/${this.state.bookmarks[i].starID}`}
                                                />
                                            )}

                                            {Object.keys(this.state.bookmarks[i].attributes).map((bookmark_i) => (
                                                <div key={bookmark_i} className='attribute btn btn-sm btn-light'>
                                                    {this.state.bookmarks[i].attributes[bookmark_i].name}
                                                </div>
                                            ))}
                                        </ReactTooltip>
                                    </div>

                                    <ContextMenu id={`bookmark-${i}`}>
                                        <hr />

                                        <MenuItem
                                            onClick={() => {
                                                this.handleModal(
                                                    'Add Attribute',

                                                    Object.keys(this.state.attributes).map((attribute_i) => {
                                                        return (
                                                            <div
                                                                key={attribute_i}
                                                                className='btn btn-sm btn-outline-primary d-block w-auto'
                                                                onClick={() => {
                                                                    this.handleModal()
                                                                    this.handleBookmark_addAttribute(
                                                                        this.state.attributes[attribute_i],
                                                                        this.state.bookmarks[i]
                                                                    )
                                                                }}
                                                            >
                                                                {this.state.attributes[attribute_i].name}
                                                            </div>
                                                        )
                                                    })
                                                )
                                            }}
                                        >
                                            <i className='far fa-plus' /> Add Attribute
                                        </MenuItem>

                                        <MenuItem
                                            onClick={() => {
                                                this.handleModal(
                                                    'Change Category',

                                                    Object.keys(this.state.categories)
                                                        .filter((category_i) => {
                                                            return this.state.categories[category_i].name !== this.state.bookmarks[i].name
                                                        })
                                                        .map((category_i) => {
                                                            return (
                                                                <div
                                                                    key={category_i}
                                                                    className='btn btn-sm btn-outline-primary d-block w-auto'
                                                                    onClick={() => {
                                                                        this.handleModal()
                                                                        this.handleBookmark_category(
                                                                            this.state.categories[category_i],
                                                                            this.state.bookmarks[i]
                                                                        )
                                                                    }}
                                                                >
                                                                    {this.state.categories[category_i].name}
                                                                </div>
                                                            )
                                                        })
                                                )
                                            }}
                                        >
                                            <i className='far fa-edit' /> Change Category
                                        </MenuItem>

                                        <MenuItem onClick={() => this.handleBookmark_time(this.state.bookmarks[i].id)}>
                                            <i className='far fa-clock' /> Change Time
                                        </MenuItem>

                                        <MenuItem onClick={() => this.handleBookmark_remove(this.state.bookmarks[i].id)}>
                                            <i className='far fa-trash-alt' /> Delete
                                        </MenuItem>
                                    </ContextMenu>
                                </React.Fragment>
                            ))}
                    </div>
                </section>

                <aside className='col-3'>
                    <div id='stars' className='row justify-content-center'>
                        {this.state.loaded.stars &&
                            Object.keys(this.state.stars).map((key, i) => (
                                <React.Fragment key={i}>
                                    <div className='star col-4'>
                                        <ContextMenuTrigger id={`star-${i}`}>
                                            <img
                                                className='star__image w-100'
                                                alt='star'
                                                src={`${config.source}/images/stars/${this.state.stars[i].id}`}
                                            />
                                            <a
                                                href={`${config.source}/star.php?id=${this.state.stars[i].id}`}
                                                className='star__name d-block'
                                            >
                                                {this.state.stars[i].name}
                                            </a>
                                        </ContextMenuTrigger>
                                    </div>

                                    <ContextMenu id={`star-${i}`}>
                                        <MenuItem
                                            onClick={() => {
                                                this.handleModal(
                                                    'Add Bookmark',
                                                    Object.keys(this.state.categories).map((category_i) => {
                                                        return (
                                                            <div
                                                                key={category_i}
                                                                className='btn btn-sm btn-outline-primary d-block w-auto'
                                                                onClick={() => {
                                                                    this.handleModal()
                                                                    this.handleBookmark_add(
                                                                        this.state.categories[category_i],
                                                                        this.state.stars[i]
                                                                    )
                                                                }}
                                                            >
                                                                {this.state.categories[category_i].name}
                                                            </div>
                                                        )
                                                    })
                                                )
                                            }}
                                        >
                                            <i className='far fa-plus' /> Add Bookmark
                                        </MenuItem>

                                        <MenuItem disabled>
                                            <i className='far fa-plus' /> Add Global Attribute
                                        </MenuItem>

                                        <MenuItem onClick={() => this.handleStar_remove(this.state.stars[i].id)}>
                                            <i className='far fa-trash-alt' /> Remove
                                        </MenuItem>
                                    </ContextMenu>
                                </React.Fragment>
                            ))}
                    </div>
                </aside>

                <Modal visible={this.state.modal.visible} onClose={() => this.handleModal()} title={this.state.modal.title}>
                    {this.state.modal.data}
                </Modal>
            </div>
        )
    }

    componentDidMount() {
        this.bookmarks = []

        this.getData()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (this.state.loaded.video) {
            /* Events Handler */
            if (!this.state.loaded.videoEvents) {
                this.player.player.on('timeupdate', () => {
                    if (this.player.player.currentTime) {
                        localStorage.bookmark = Math.round(this.player.player.currentTime)
                    }
                })

                this.player.player.on('play', () => {
                    localStorage.playing = 1

                    if (this.state.newVideo) {
                        this.handlePlays_add()
                        this.setState({ newVideo: false })
                    }
                })

                this.player.player.on('pause', () => {
                    localStorage.playing = 0
                })

                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.videoEvents = true

                    return { loaded }
                })
            }

            /* HLS handler */
            if (!this.state.loaded.hls && Hls.isSupported()) {
                const hls = new Hls({ autoStartLoad: false })
                hls.loadSource(this.player.player.media.firstElementChild.getAttribute('src'))
                hls.attachMedia(this.player.player.media)

                hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
                    const dataLevels = data['levels'].length - 1

                    let levels = { 1080: 3, 720: 2, 480: 1, 360: 0 }
                    let maxLevel = levels[1080]
                    let maxStartLevel = levels[720]

                    // Default start level to maxLevel-1
                    let desiredStartLevel = maxLevel - 1
                    // Start level should never be above 720p
                    if (desiredStartLevel > maxStartLevel) desiredStartLevel = maxStartLevel
                    // Check if desiredStartLevel is too big
                    if (desiredStartLevel > dataLevels) desiredStartLevel = dataLevels - 1
                    // Check if desiredStartLevel is too small
                    if (desiredStartLevel < 0) desiredStartLevel = 0

                    hls.startLevel = desiredStartLevel
                    hls.autoLevelCapping = maxLevel

                    /* Improve this */
                    if (Number(localStorage.video) === this.state.video.id) {
                        hls.startLoad(Number(localStorage.bookmark))

                        if (Boolean(Number(localStorage.playing))) this.handleVideo_play(localStorage.bookmark)

                        this.setState({ newVideo: false })
                    } else {
                        localStorage.video = this.state.video.id
                        localStorage.bookmark = 0

                        this.setState({ newVideo: false })

                        hls.startLoad()
                    }
                })

                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.hls = true

                    return { loaded }
                })
            }
        }

        /* Collision Check */
        const collisionCheck = (a, b) => {
            if (typeof a === 'undefined' || typeof b === 'undefined') return false
            if (a === null || b === null) return false

            a = a.getBoundingClientRect()
            b = b.getBoundingClientRect()

            return !(a.x + a.width < b.x || a.x > b.x + b.width)
        }

        for (let i = 1, items = this.bookmarks, LEVEL_MIN = 1, LEVEL_MAX = 10, level = LEVEL_MIN; i < items.length; i++) {
            let collision = false

            let first = items[i - 1]
            let second = items[i]

            if (first === null || second === null) continue // skip if error

            if (collisionCheck(first, second)) {
                collision = true
            } else {
                collision = false

                for (let j = 1; j < i; j++) {
                    if (collisionCheck(items[j], second)) collision = true
                }
            }

            if (collision && level < LEVEL_MAX) {
                level++
            } else {
                level = LEVEL_MIN
            }

            second.setAttribute('data-level', level)
        }
    }

    getData() {
        let { id } = this.props.match.params

        Axios.get(`${config.api}/video.php?id=${id}`)
            .then(({ data: video }) => this.setState({ video }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.video = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/bookmarks.php?id=${id}`)
            .then(({ data: bookmarks }) => this.setState({ bookmarks }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.bookmarks = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/stars.php?id=${id}`)
            .then(({ data: stars }) => this.setState({ stars }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.stars = true

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

export default VideoPage
