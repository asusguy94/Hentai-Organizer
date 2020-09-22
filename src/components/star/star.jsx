import React, { Component } from 'react'

import Axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'
import { Helmet } from 'react-helmet-async'

import Modal, { handleModal } from '../modal/modal'

import './star.scss'

import config from '../config'

class StarVideo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dataSrc: `${config.source}/videos/${props.video.fname}`,
            src: '',
        }
    }

    async reloadVideo() {
        this.setState((prevState) => {
            const state = prevState
            state.src = prevState.dataSrc
            state.dataSrc = ''

            return state
        })
    }

    async unloadVideo() {
        this.setState((prevState) => {
            const state = prevState
            state.dataSrc = prevState.src
            state.src = ''

            return state
        })
    }

    playFrom(video, time = 0) {
        if (time) video.currentTime = Number(time)
        video.play()
    }

    stopFrom(video, time) {
        if (time) video.currentTime = Number(time)
        video.pause()
    }

    async startThumbnailPlayback(video) {
        let time = 100
        const offset = 60
        const duration = 1.5

        this.playFrom(video, time)
        this.thumbnail = setInterval(() => {
            time += offset
            if (time > video.duration) {
                this.stopThumbnailPlayback(video)
                this.startThumbnailPlayback(video)
            }
            this.playFrom(video, (time += offset))
        }, duration * 1000)
    }

    async stopThumbnailPlayback(video) {
        this.stopFrom(video)
        clearInterval(this.thumbnail)
    }

    handleMouseEnter(e) {
        const { target } = e

        if (this.state.dataSrc.length && !this.state.src.length) {
            this.reloadVideo().then(() => {
                this.startThumbnailPlayback(target)
            })
        }
    }

    handleMouseLeave(e) {
        const { target } = e

        if (!this.state.dataSrc.length && this.state.src.length) {
            this.stopThumbnailPlayback(target).then(() => {
                this.unloadVideo()
            })
        }
    }

    render() {
        const { video } = this.props

        return (
            <a className='video card' href={`/video/${video.id}`}>
                <video
                    className='card-img-top'
                    src={this.state.src}
                    data-src={this.state.dataSrc}
                    poster={`${config.source}/images/videos/${video.id}-290`}
                    preload='metadata'
                    muted
                    onMouseEnter={this.handleMouseEnter.bind(this)}
                    onMouseLeave={this.handleMouseLeave.bind(this)}
                />

                <span className='title card-title'>{video.name}</span>
            </a>
        )
    }
}

class StarVideos extends Component {
    render() {
        const { videos } = this.props

        return (
            <div id='videos' className={this.props.className}>
                {videos.map((video, i) => (
                    <StarVideo video={video} key={i} />
                ))}
            </div>
        )
    }
}

class StarInputForm extends Component {
    constructor(props) {
        super(props)

        this.state = {
            input: {
                id: '',
                value: props.emptyByDefault ? '' : props.value,
            },
        }

        this.update = this.props.update
    }

    updateValue(e) {
        const { value: inputValue, id: inputID } = e.target

        this.setState((prevState) => {
            const { input } = prevState
            input.id = inputID
            input.value = inputValue

            return { input }
        })
    }

    keyPress(e) {
        if (e.key === 'Enter') {
            const { id, value } = this.state.input
            if (id.length) {
                this.update(value, id)
            }

            if (this.props.emptyByDefault) {
                this.setState((prevState) => {
                    const { input } = prevState
                    input.value = ''

                    return { input }
                })

                this.input.value = ''
            }
        }
    }

    isChanged() {
        const serverValue = (this.props.emptyByDefault ? '' : this.props.value).toLowerCase()
        const clientValue = (this.state.input.value || '').toLowerCase()

        return clientValue !== serverValue
    }

    componentDidMount() {
        this.input = null
    }

    render() {
        return (
            <div className='input-wrapper'>
                <label className={this.isChanged() ? 'bold' : ''} htmlFor={this.props.name.toLowerCase()}>
                    {this.props.name}
                </label>

                <input
                    ref={(input) => (this.input = input)}
                    type={this.props.type}
                    id={this.props.name.toLowerCase()}
                    defaultValue={this.props.emptyByDefault ? '' : this.props.value}
                    onChange={(e) => this.updateValue(e)}
                    onKeyDown={(e) => this.keyPress(e)}
                    list={`${this.props.name.toLowerCase()}s`}
                />

                {this.props.list && (
                    <datalist id={`${this.props.name.toLowerCase()}s`}>
                        {this.props.list.map((item, i) => (
                            <option key={i} value={item} />
                        ))}
                    </datalist>
                )}

                {this.props.children}
            </div>
        )
    }
}

class StarForm extends Component {
    constructor(props) {
        super(props)
        this.update = (value, label) => props.update(value, label)
        this.addAttribute = (value, label) => props.addAttribute(value, label)
        this.removeAttribute = (value) => props.removeAttribute(value)
    }

    render() {
        const { data, starData } = this.props

        return (
            <React.Fragment>
                <StarInputForm update={this.update} name='Breast' value={data.breast} list={starData.breast} />
                <StarInputForm update={this.update} name='EyeColor' value={data.eyecolor} list={starData.eyecolor} />
                <StarInputForm update={this.update} name='HairColor' value={data.haircolor} list={starData.haircolor} />
                <StarInputForm update={this.update} name='HairStyle' value={data.hairstyle} list={starData.hairstyle} />
                <StarInputForm
                    update={this.addAttribute}
                    name='Attribute'
                    emptyByDefault
                    value={data.attribute}
                    list={starData.attribute}
                >
                    <StarAttributes data={data.attribute} remove={this.removeAttribute} />
                </StarInputForm>
            </React.Fragment>
        )
    }
}

class StarAttributes extends Component {
    constructor(props) {
        super(props)
        this.remove = (item) => props.remove(item)
    }

    render() {
        return this.props.data.map((attribute, i) => (
            <span key={i}>
                <ContextMenuTrigger id={`attribute-${i}`} renderTag='span'>
                    <span className='attribute ml-2'>
                        <span className='btn btn-sm btn-outline-primary'>{attribute}</span>
                    </span>
                </ContextMenuTrigger>

                <ContextMenu id={`attribute-${i}`}>
                    <MenuItem onClick={() => this.remove(attribute)}>Remove</MenuItem>
                </ContextMenu>
            </span>
        ))
    }
}

class StarImageDropbox extends Component {
    state = {
        hover: false,
    }

    constructor(props) {
        super(props)
        this.removeStar = props.removeStar
        this.removeImage = props.removeImage
        this.addImage = props.addImage
    }

    handleDefault(e) {
        e.stopPropagation()
        e.preventDefault()
    }

    handleEnter(e) {
        this.handleDefault(e)

        this.setHover()
    }

    handleLeave(e) {
        this.handleDefault(e)

        this.clearHover()
    }

    handleDrop(e) {
        this.handleDefault(e)

        const image = e.dataTransfer.getData('text')
        this.addImage(image)
    }

    isHover() {
        return this.state.hover
    }

    setHover() {
        this.setState({ hover: true })
    }

    clearHover() {
        this.setState({ hover: false })
    }

    render() {
        const { star } = this.props

        if (star.image !== null) {
            return (
                <React.Fragment>
                    <ContextMenuTrigger id='star__image'>
                        <img className='star__image' src={`${config.source}/images/stars/${star.image}`} alt='star' />
                    </ContextMenuTrigger>

                    <ContextMenu id='star__image'>
                        <MenuItem onClick={this.removeImage}>
                            <i className={`${config.theme.fa} fa-trash-alt`} /> Delete Image
                        </MenuItem>
                    </ContextMenu>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <ContextMenuTrigger id='star__dropbox'>
                        <div
                            id='dropbox'
                            className={`unselectable ${this.isHover() ? 'hover' : ''}`}
                            onDragEnter={this.handleEnter.bind(this)}
                            onDragOver={this.handleEnter.bind(this)}
                            onDragLeave={this.handleLeave.bind(this)}
                            onDrop={this.handleDrop.bind(this)}
                        >
                            <div className='label'>Drop Image Here</div>
                        </div>
                    </ContextMenuTrigger>

                    <ContextMenu id='star__dropbox'>
                        <MenuItem onClick={this.removeStar}>
                            <i className={`${config.theme.fa} fa-trash-alt`} /> Remove Star
                        </MenuItem>
                    </ContextMenu>
                </React.Fragment>
            )
        }
    }
}

class StarPage extends Component {
    constructor(props) {
        super(props)
        this.handleModal = handleModal
    }

    state = {
        star: {
            id: 0,
            name: '',
            image: '',
            info: {
                breast: '',
                eyecolor: '',
                haircolor: '',
                hairstyle: '',
                attribute: [],
            },
        },
        starData: {
            breast: [],
            eyecolor: [],
            haircolor: [],
            hairstyle: [],
            attribute: [],
        },
        videos: [
            {
                id: 0,
                name: '',
                fname: '',
            },
        ],
        loaded: {
            star: false,
            videos: false,
        },
        modal: {
            visible: false,
            data: null,
        },
    }

    handleStar_updateInfo(value, label) {
        Axios.get(`${config.api}/changestarinfo.php?starID=${this.state.star.id}&label=${label}&value=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    const { star } = prevState
                    star.info[label] = value

                    return { star }
                })
            }
        })
    }

    handleStar_addAttribute(value) {
        Axios.get(`${config.api}/addstarattribute.php?starID=${this.state.star.id}&attribute=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    const { star } = prevState
                    star.info.attribute.push(value)

                    return { star }
                })
            }
        })
    }

    handleStar_removeAttribute(value) {
        Axios.get(`${config.api}/removestarattribute.php?starID=${this.state.star.id}&attribute=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    const { star } = prevState
                    const { attribute: attributes } = prevState.star.info

                    star.info.attribute = attributes.filter((attribute) => {
                        if (attribute.toLowerCase() === value.toLowerCase()) return null

                        return attribute
                    })

                    return { star }
                })
            }
        })
    }

    handleStar_rename() {
        console.log('open modal with input form')
    }

    handleStar_remove() {
        const { star } = this.state

        Axios.get(`${config.api}/removestar.php?starID=${star.id}`).then(({ data }) => {
            if (data.success) {
                window.location.href = '/stars'
            }
        })
    }

    handleStar_removeImage() {
        Axios.get(`${config.source}/ajax/remove_star_image.php?id=${this.state.star.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    const { star } = prevState
                    star.image = null

                    return { star }
                })
            }
        })
    }

    handleStar_addImage(image) {
        Axios.get(`${config.source}/ajax/add_star_image.php?id=${this.state.star.id}&image=${image}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let star = prevState.star
                    star.image = `${this.state.star.id}.jpg?${Date.now()}`

                    return { star }
                })
            }
        })
    }

    render() {
        return (
            <div id='star-page' className='col-12 row'>
                <Helmet>
                    <title>{this.state.star.name}</title>
                </Helmet>

                <section className='col-7'>
                    {this.state.loaded.star && (
                        <div id='star'>
                            <StarImageDropbox
                                star={this.state.star}
                                removeStar={() => this.handleStar_remove()}
                                removeImage={() => this.handleStar_removeImage()}
                                addImage={(image) => this.handleStar_addImage(image)}
                            />

                            <ContextMenuTrigger id='title'>
                                <h2>{this.state.star.name}</h2>
                            </ContextMenuTrigger>

                            <ContextMenu id='title'>
                                <MenuItem disabled onClick={(e) => this.handleStar_rename(e)}>
                                    <i className={`${config.theme.fa} fa-edit`} /> Rename
                                </MenuItem>
                            </ContextMenu>

                            <StarForm
                                update={(label, value) => this.handleStar_updateInfo(label, value)}
                                addAttribute={(value) => this.handleStar_addAttribute(value)}
                                removeAttribute={(value) => this.handleStar_removeAttribute(value)}
                                data={this.state.star.info}
                                starData={this.state.starData}
                            />
                        </div>
                    )}

                    <h3>Videos</h3>
                    {this.state.loaded.videos && <StarVideos className='row' videos={this.state.videos} />}
                </section>

                <aside className='col-5'>
                    <div className='card'>
                        <h2 className='card-header text-center'>Star Relation</h2>
                        <div className='card-body'>
                            <div id='relations'></div>
                        </div>
                    </div>
                </aside>

                <Modal visible={this.state.modal.visible} title={this.state.modal.title} onClose={() => this.handleModal()}>
                    {this.state.modal.data}
                </Modal>
            </div>
        )
    }

    componentDidMount() {
        this.getData()
    }

    getData() {
        const { id } = this.props.match.params

        Axios.get(`${config.api}/star.php?id=${id}`).then(({ data: star }) => {
            this.setState((prevState) => {
                const { loaded } = prevState
                loaded.star = true

                return { star, loaded }
            })
        })

        Axios.get(`${config.api}/videos.php?starID=${id}`).then(({ data: videos }) => {
            this.setState((prevState) => {
                const { loaded } = prevState
                loaded.videos = true

                return { videos, loaded }
            })
        })

        Axios.get(`${config.api}/stardata.php`).then(({ data: starData }) => {
            this.setState((prevState) => {
                const { loaded } = prevState
                loaded.starData = true

                return { starData, loaded }
            })
        })
    }
}

export default StarPage
