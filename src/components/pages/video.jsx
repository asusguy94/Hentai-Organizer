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
            attributes: [
                // TODO get from bookmark-attributes_table and stars_table - for add_attribute
                {
                    id: 0,
                    name: '',
                },
            ],
            related: [
                {
                    id: 0,
                    name: 0,
                    plays: 0,
                },
            ],
            noStar: 0,
        },
        stars: [
            {
                id: 0,
                name: '',
                attributes: [
                    {
                        id: 0,
                        name: '',
                    },
                ],
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
        input: {
            star: '',
            date: '',
        },
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
        Axios.get(`${config.api}/cen.php?id=${this.state.video.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let video = prevState.video
                    video.censored = !video.censored

                    return { video }
                })
            }
        })
    }

    async handleFname_copy() {
        await navigator.clipboard.writeText(this.state.video.path.file)
    }

    handleVideo_play(time) {
        const { player } = this.player

        player.currentTime = Number(time)
        player.play()
    }

    handleRibbon(star) {
        let hasBookmark = false

        this.state.bookmarks.forEach((bookmark) => {
            if (!hasBookmark && bookmark.starID === star.id) hasBookmark = true
        })

        if (!hasBookmark) return <span className='ribbon'>NEW</span>
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
            if (data.success) {
                let attributes = data.attributes
                if (typeof data.attributes === 'undefined') attributes = []

                this.setState((prevState) => {
                    let bookmarks = prevState.bookmarks
                    bookmarks.push({
                        id: data.id,
                        name: category.name,
                        start: time,
                        starID,
                        attributes,
                    })

                    bookmarks.sort((a, b) => {
                        let valA = a.start
                        let valB = b.start

                        return valA - valB
                    })

                    return { bookmarks }
                })
            }
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

                bookmarks.sort((a, b) => {
                    let valA = a.start
                    let valB = b.start

                    return valA - valB
                })

                this.setState({ bookmarks: arr })
            }
        })
    }

    handleBookmark_remove(id) {
        Axios.get(`${config.api}/removebookmark.php?id=${id}`).then(({ data }) => {
            if (data.success) {
                let bookmarks = this.state.bookmarks.filter((item) => {
                    return item.id !== id
                })

                this.setState({ bookmarks })
            }
        })
    }

    handleBookmark_category(category, bookmark) {
        Axios.get(`${config.api}/changebookmarkcategory.php?id=${bookmark.id}&categoryID=${category.id}`).then(({ data }) => {
            if (data.success) {
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
            }
        })
    }

    handleBookmark_addAttribute(attribute, bookmark) {
        Axios.get(`${config.api}/addbookmarkattribute.php?bookmarkID=${bookmark.id}&attributeID=${attribute.id}`).then(({ data }) => {
            if (data.success) {
                let bookmarks = this.state.bookmarks
                let obj = Object.keys(bookmarks).map((i) => {
                    if (bookmarks[i].id === bookmark.id) {
                        let item = bookmarks[i]
                        let attributes = item.attributes
                        attributes.push({ id: attribute.id, name: attribute.name })

                        return item
                    }

                    return bookmarks[i]
                })

                this.setState({ bookmarks: obj })
            }
        })
    }

    handleBookmark_clearAttributes(bookmark) {
        Axios.get(`${config.api}/removebookmarkattributes.php?bookmarkID=${bookmark.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let bookmarks = prevState.bookmarks
                    bookmarks.map((item) => {
                        if (item.id === bookmark.id) {
                            let starID = bookmark.starID

                            if (starID !== 0) {
                                let attributes = this.attributesFromStar(starID)

                                if (item.attributes.length > attributes.length) {
                                    // Bookmark have at least 1 attribute not from star
                                    item.attributes = item.attributes.filter((attribute) => {
                                        let match = false
                                        attributes.forEach((attributeItem) => {
                                            if (attribute.id === attributeItem.id) match = true
                                        })
                                        if (match) return attribute
                                        return null
                                    })
                                }
                            } else {
                                // bookmark does not have a star
                                item.attributes = []
                            }
                        }

                        return item
                    })

                    return { bookmarks }
                })
            }
        })
    }

    attributesFromStar(starID) {
        return this.state.stars.filter((star) => {
            if (star.id === starID) {
                return star
            }
            return null
        })[0].attributes
    }

    handleBookmark_removeStar(bookmark) {
        Axios.get(`${config.api}/removebookmarkstar.php?bookmarkID=${bookmark.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let bookmarks = prevState.bookmarks
                    bookmarks.map((item) => {
                        if (item.id === bookmark.id) {
                            let starID = bookmark.starID

                            let attributes = this.attributesFromStar(starID)

                            if (item.attributes.length > attributes.length) {
                                // Bookmark have at least 1 attribute not from star
                                item.attributes = item.attributes.filter((attribute) => {
                                    let match = false
                                    attributes.forEach((attributeItem) => {
                                        if (attribute.id === attributeItem.id) {
                                            match = true
                                        }
                                    })
                                    if (!match) return attribute
                                    return null
                                })
                            } else {
                                // Bookmark has only attributes from star
                                item.attributes = []
                            }

                            item.starID = 0
                        }

                        return item
                    })

                    return { bookmarks }
                })
            }
        })
    }

    /* Franchise - own class? */
    async handleFranchise_copy() {
        await navigator.clipboard.writeText(this.state.video.franchise)
    }

    /* Date - own class */
    handleDate() {
        Axios.get(`${config.api}/setdate.php?videoID=${this.state.video.id}&date=${this.state.input.date}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let date = prevState.video.date
                    date.published = data.date

                    return { date }
                })
            }

            this.handleInput_reset('date')
        })
    }

    handleInput(e, field) {
        let inputValue = e.target.value

        this.setState((prevState) => {
            let input = prevState.input
            input[field] = inputValue

            return { input }
        })
    }

    handleInput_reset(field) {
        this.setState((prevState) => {
            let input = prevState.input
            input[field] = ''

            return { input }
        })
    }

    handleNoStar(e) {
        let status = Number(e.target.checked)

        Axios.get(`${config.api}/nostar.php?videoID=${this.state.video.id}&status=${status}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let video = prevState.video
                    video.noStar = status

                    return { video }
                })
            }
        })
    }

    /* Star - own class? */
    handleStar_add(name) {
        Axios.get(`${config.api}/addstar.php?name=${name}&videoID=${this.state.video.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let stars = prevState.stars
                    stars.push({ id: data.starID, name, attributes: data.attributes })

                    return { stars }
                })
            }

            this.handleInput_reset('star')
        })
    }

    handleStar_remove(id) {
        Axios.get(`${config.api}/removevideostar.php?videoID=${this.state.video.id}&starID=${id}`).then(({ data }) => {
            if (data.success) {
                let stars = this.state.stars.filter((item) => {
                    return item.id !== id
                })

                // TODO check if star has bookmarks - evaluate if this is required, was not a feature before
                this.setState({ stars })
            }
        })
    }

    /* Plays - own class? */
    handlePlays_add() {
        Axios.get(`${config.api}/addplay.php?videoID=${this.state.video.id}`).then(() => {
            console.log('Play Added')
        })
    }

    handlePlays_reset() {
        Axios.get(`${config.api}/removeplays.php?videoID=${this.state.video.id}`)
    }

    render() {
        return (
            <div className='video-page col-12 row'>
                <section className='col-9'>
                    <header className='header row'>
                        <div className='col-11'>
                            <h1 className='header__title h2 align-middle'>
                                <div className='d-inline-block align-middle'>
                                    <ContextMenuTrigger id='title'>{this.state.video.name}</ContextMenuTrigger>
                                </div>

                                <ContextMenu id='title'>
                                    <MenuItem disabled>
                                        <i className='far fa-edit' /> Rename Title
                                    </MenuItem>

                                    <MenuItem disabled>
                                        <i className='far fa-edit' /> Rename Franchise
                                    </MenuItem>

                                    <MenuItem divider />

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
                                    <MenuItem
                                        onClick={() => {
                                            this.handleModal(
                                                'Change Time',
                                                <input
                                                    type='text'
                                                    className='text-center'
                                                    onChange={(e) => this.handleInput(e, 'date')}
                                                    ref={(input) => input && input.focus()}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault()

                                                            this.handleModal()
                                                            this.handleDate()
                                                        }
                                                    }}
                                                />
                                            )
                                        }}
                                    >
                                        <i className='far fa-edit' />
                                        Edit Date
                                    </MenuItem>
                                </ContextMenu>
                            </div>

                            <div className='header__quality btn btn-sm btn-outline-primary'>
                                <i className='far fa-film' />
                                {this.state.video.quality}
                            </div>
                        </div>

                        <div className='col-1 header__next'>
                            <a
                                className='btn btn-sm btn-outline-primary float-right'
                                id='next'
                                href={`/video/${this.state.video.nextID}`}
                            >
                                Next
                            </a>
                        </div>
                    </header>

                    <div className='video-container' onWheel={(e) => this.handleWheel(e)}>
                        <ContextMenuTrigger id='video'>
                            {this.state.loaded.video && (
                                <PlyrComponent
                                    ref={(player) => (this.player = player)}
                                    options={{
                                        controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'fullscreen'],
                                        hideControls: false,
                                        ratio: '21:9',
                                        keyboard: { global: true }, // TODO Create own keyboard shortcuts/commands
                                        seekTime: this.state.seekSpeed.regular,
                                        previewThumbnails: {
                                            enabled: true, // TODO Check if this should be enabled...perhaps from config.source, or config.api later
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
                                disabled={this.state.video.noStar === 1}
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
                                        <i className='far fa-check-circle' /> UnCensor
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

                            <MenuItem divider />

                            <MenuItem onClick={() => this.handleFname_copy()}>
                                <i className='far fa-copy' /> Copy Filename
                            </MenuItem>

                            <MenuItem divider />

                            <MenuItem disabled>
                                <i className='far fa-edit' /> Update Video
                            </MenuItem>

                            <MenuItem disabled>
                                <i className='far fa-edit' /> Update Bookmarks
                            </MenuItem>

                            <MenuItem divider />

                            <MenuItem disabled>
                                <i className='far fa-trash-alt' /> Delete Video
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
                                            left: `${
                                                ((this.state.bookmarks[i].start * 100) / this.state.video.duration) *
                                                config.timeline.offset
                                            }%`,
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

                                        {(this.state.bookmarks[i].starID !== 0 || this.state.bookmarks[i].attributes.length > 0) && (
                                            <ReactTooltip id={`bookmark-info-${i}`} effect='solid'>
                                                {this.state.bookmarks[i].starID !== 0 && (
                                                    <img
                                                        alt='star'
                                                        className='star__image'
                                                        data-star-id={this.state.bookmarks[i].starID}
                                                        src={`${config.source}/images/stars/${this.state.bookmarks[i].starID}`}
                                                    />
                                                )}

                                                {Object.keys(this.state.bookmarks[i].attributes).map((bookmark_i) => [
                                                    this.state.bookmarks[i].attributes[bookmark_i].id !== 0 && (
                                                        <div key={bookmark_i} className='attribute btn btn-sm btn-light'>
                                                            {this.state.bookmarks[i].attributes[bookmark_i].name}
                                                        </div>
                                                    ),
                                                ])}
                                            </ReactTooltip>
                                        )}
                                    </div>

                                    <ContextMenu id={`bookmark-${i}`}>
                                        <MenuItem disabled>
                                            <i className='far fa-plus' /> Add Star
                                        </MenuItem>

                                        <MenuItem
                                            disabled={this.state.bookmarks[i].starID === 0}
                                            onClick={() => this.handleBookmark_removeStar(this.state.bookmarks[i])}
                                        >
                                            <i className='far fa-trash-alt' /> Remove Star
                                        </MenuItem>

                                        <MenuItem divider />

                                        <MenuItem
                                            onClick={() => {
                                                this.handleModal(
                                                    'Add Attribute',
                                                    // TODO filter out existing data
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
                                            disabled={this.state.bookmarks[i].attributes.length === 0}
                                            onClick={() => this.handleBookmark_clearAttributes(this.state.bookmarks[i])}
                                        >
                                            <i className='far fa-trash-alt' /> Remove Attributes
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
                    <Franchise video={this.state.video} />

                    <div id='stars' className='row justify-content-center'>
                        {this.state.loaded.stars &&
                            Object.keys(this.state.stars).map((i) => (
                                <div key={i} className='star col-4'>
                                    <div className='card mb-2 ribbon-container'>
                                        <ContextMenuTrigger id={`star-${i}`}>
                                            <img
                                                className='star__image card-img-top'
                                                alt='star'
                                                src={`${config.source}/images/stars/${this.state.stars[i].id}`}
                                            />
                                            <a
                                                href={`${config.source}/star.php?id=${this.state.stars[i].id}`}
                                                className='star__name d-block'
                                            >
                                                {this.state.stars[i].name}
                                            </a>

                                            {this.handleRibbon(this.state.stars[i])}
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
                                </div>
                            ))}
                        <div className='col-12 mt-2'>
                            <hr />

                            {this.state.loaded.video && (
                                <div className='form-inline justify-content-center'>
                                    <div className='form-group mr-2'>
                                        <label htmlFor='add-star' className='mr-1'>
                                            Star
                                        </label>
                                        <input
                                            type='text'
                                            id='add-star'
                                            className='form-control'
                                            value={this.state.input.star}
                                            onChange={(e) => this.handleInput(e, 'star')}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault()

                                                    this.handleStar_add(e.target.value)
                                                }
                                            }}
                                            disabled={this.state.video.noStar === 1}
                                        />
                                    </div>

                                    <div className='form-check'>
                                        <input
                                            type='checkbox'
                                            name='no-star'
                                            id='no-star'
                                            className='form-check-input mr-1'
                                            onChange={(e) => this.handleNoStar(e)}
                                            defaultChecked={this.state.video.noStar === 1}
                                            disabled={this.state.bookmarks.length || this.state.stars.length}
                                        />
                                        <label htmlFor='no-star' className='form-check-label'>
                                            No Star
                                        </label>
                                    </div>
                                </div>
                            )}
                        </div>
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
            if (!this.state.loaded.hls && Hls.isSupported() && config.hls.enabled) {
                const hls = new Hls({ autoStartLoad: false })
                hls.loadSource(this.player.player.media.firstElementChild.getAttribute('src'))
                hls.attachMedia(this.player.player.media)

                hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
                    const dataLevels = data['levels'].length - 1

                    const levels = config.hls.levels
                    const maxLevel = levels[config.hls.maxLevel]
                    const maxStartLevel = levels[config.hls.maxStartLevel]

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

                        this.setState({ newVideo: true })

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

        Axios.get(`${config.api}/attributes.php?method=video`)
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

class Franchise extends Component {
    render() {
        return (
            <div id='franchise'>
                {this.props.video.related.length > 1 && [
                    <h2>Episodes</h2> &&
                        this.props.video.related.map((item, i) => (
                            <a className='episode row' href={`/video/${item.id}`} key={i}>
                                <span className='episode__plays col-2'>{item.plays} Plays</span>

                                <img
                                    className='episode__thumbnail'
                                    src={`${config.source}/images/videos/${item.id}-290`}
                                    alt='thumbnail'
                                />

                                <span className='episode__title col-8'>
                                    {item.name.length > config.franchise.title.maxLength
                                        ? item.name.slice(0, config.franchise.title.maxLength - 3) + '...'
                                        : item.name}
                                </span>
                            </a>
                        )),
                ]}
            </div>
        )
    }
}

export default VideoPage
