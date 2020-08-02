import React, { Component } from 'react'

import Axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'

import Modal from '../modal'

import '../styles/star.scss'

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
            let state = prevState
            state.src = prevState.dataSrc
            state.dataSrc = ''

            return state
        })
    }

    async unloadVideo() {
        this.setState((prevState) => {
            let state = prevState
            state.dataSrc = prevState.src
            state.src = ''

            return state
        })
    }

    playFrom(video, time = 0) {
        if (time) video.currentTime = Number(time)
        video.play()
    }

    startThumbnailPlayback(video) {
        video.playbackRate = 5
        this.playFrom(video, 120)
    }

    handleMouseEnter(e) {
        const { target } = e

        if (this.state.dataSrc.length && !this.state.src.length) {
            this.reloadVideo().then(() => {
                this.startThumbnailPlayback(target)
            })
        }
    }

    handleMouseLeave() {
        if (!this.state.dataSrc.length && this.state.src.length) {
            this.unloadVideo()
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
                {Object.keys(videos).map((i) => (
                    <StarVideo video={videos[i]} key={i} />
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
        let { value: inputValue, id: inputID } = e.target

        this.setState((prevState) => {
            let input = prevState.input
            input.id = inputID
            input.value = inputValue

            return { input }
        })
    }

    keyPress(e) {
        if (e.key === 'Enter') {
            let { id, value } = this.state.input
            if (id.length) {
                this.update(value, id)
            }
        }
    }

    isChanged() {
        let serverValue = (this.props.emptyByDefault ? '' : this.props.value).toLowerCase()
        let clientValue = (this.state.input.value || '').toLowerCase()

        return clientValue !== serverValue
    }

    render() {
        return (
            <div className='input-wrapper'>
                <label className={this.isChanged() ? 'bold' : ''} htmlFor={this.props.name.toLowerCase()}>
                    {this.props.name}
                </label>

                <input
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
        let { data, starData } = this.props

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
        return this.props.data.map((element, i) => (
            <span key={i}>
                <ContextMenuTrigger id={`attribute-${i}`} renderTag='span'>
                    <span className='attribute ml-2'>
                        <span className='btn btn-sm btn-outline-primary'>{element}</span>
                    </span>
                </ContextMenuTrigger>

                <ContextMenu id={`attribute-${i}`}>
                    <MenuItem onClick={() => this.remove(element)}>Remove</MenuItem>
                </ContextMenu>
            </span>
        ))
    }
}

class StarImageDropbox extends Component {
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

    handleDrop(e) {
        this.handleDefault(e)

        const image = e.dataTransfer.getData('text')
        this.addImage(image)
    }

    render() {
        let { star } = this.props

        if (star.image !== null) {
            return (
                <React.Fragment>
                    <ContextMenuTrigger id='star__image'>
                        <img className='star__image' src={`${config.source}/images/stars/${star.image}`} alt='star' />
                    </ContextMenuTrigger>

                    <ContextMenu id='star__image'>
                        <MenuItem onClick={this.removeImage}>Delete Image</MenuItem>
                    </ContextMenu>
                </React.Fragment>
            )
        } else {
            return (
                <React.Fragment>
                    <ContextMenuTrigger id='star__dropbox'>
                        <div
                            id='dropbox'
                            onDragEnter={this.handleDefault.bind(this)}
                            onDragExit={this.handleDefault.bind(this)}
                            onDragOver={this.handleDefault.bind(this)}
                            onDrop={this.handleDrop.bind(this)}
                        >
                            <div className='unselectable label'>Drop Image Here</div>
                        </div>
                    </ContextMenuTrigger>

                    <ContextMenu id='star__dropbox'>
                        <MenuItem onClick={this.removeStar}>Remove Star</MenuItem>
                    </ContextMenu>
                </React.Fragment>
            )
        }
    }
}

class StarPage extends Component {
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

    handleModal(title = null, data = null) {
        this.setState((prevState) => {
            let modal = prevState.modal
            modal.title = title
            modal.data = data
            modal.visible = !modal.visible

            return { modal }
        })
    }

    handleStar_updateInfo(value, label) {
        Axios.get(`${config.api}/changestarinfo.php?starID=${this.state.star.id}&label=${label}&value=${value}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let star = prevState.star
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
                    let star = prevState.star
                    star.info.attribute.push(value)

                    return { star }
                })
            }
        })
    }

    handleStar_removeAttribute(value) {
        Axios.get(`${config.api}/removestarattribute.php?starID=${this.state.star.id}&attribute=${value}`).then(({ data }) => {
            if (data.success) {
                window.location.reload()
                // TODO Map out what attribute should be removed
            }
        })
    }

    handleStar_rename() {
        console.log('open modal with input form')
    }

    handleStar_remove() {
        console.log(`remove star WHERE starID=${this.state.star.id}`)
    }

    handleStar_removeImage() {
        Axios.get(`${config.source}/ajax/remove_star_image.php?id=${this.state.star.id}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let star = prevState.star
                    star.image = null

                    return { star }
                })
            }
        })
    }

    addImage(image) {
        Axios.get(`${config.source}/ajax/add_star_image.php?id=${this.state.star.id}&image=${image}`).then(({ data }) => {
            if (data.success) {
                this.setState((prevState) => {
                    let star = prevState.star
                    star.image = `${this.state.star.id}.jpg`

                    return { star }
                })
            }
        })
    }

    render() {
        return (
            <div className='star-page col-12'>
                <div>
                    {this.state.loaded.star && (
                        <div id='star'>
                            <StarImageDropbox
                                star={this.state.star}
                                removeStar={() => this.handleStar_remove()}
                                removeImage={() => this.handleStar_removeImage()}
                                addImage={(image) => this.addImage(image)}
                            />

                            <ContextMenuTrigger id='title'>
                                <h2>{this.state.star.name}</h2>
                            </ContextMenuTrigger>

                            <ContextMenu id='title'>
                                <MenuItem disabled onClick={(e) => this.handleStar_rename(e)}>
                                    <i className='far fa-edit' /> Rename
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
                </div>

                <h3>Videos</h3>
                {this.state.loaded.videos && <StarVideos className='row col-12' videos={this.state.videos} />}

                <Modal visible={this.state.modal.visible} onClose={() => this.handleModal()} title={this.state.modal.title}>
                    {this.state.modal.data}
                </Modal>
            </div>
        )
    }

    componentDidMount() {
        this.getData()
    }

    getData() {
        let { id } = this.props.match.params

        Axios.get(`${config.api}/star.php?id=${id}`)
            .then(({ data: star }) => this.setState({ star }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.star = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/videos.php?starID=${id}`)
            .then(({ data: videos }) => this.setState({ videos }))
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.videos = true

                    return { loaded }
                })
            })

        Axios.get(`${config.api}/stardata.php`)
            .then(({ data: starData }) => {
                this.setState({ starData })
            })
            .then(() => {
                this.setState((prevState) => {
                    let loaded = prevState.loaded
                    loaded.starData = true

                    return { loaded }
                })
            })
    }
}

export default StarPage
