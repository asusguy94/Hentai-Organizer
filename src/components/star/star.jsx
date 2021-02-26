import { Component, Fragment, useState, useRef } from 'react'

import Axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'

import Modal, { handleModal } from '../modal/modal'

import './star.scss'

import config from '../config.json'

// Wrapper
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
				attribute: []
			}
		},
		starData: {
			breast: [],
			eyecolor: [],
			haircolor: [],
			hairstyle: [],
			attribute: []
		},
		videos: [],
		modal: {
			visible: false,
			data: null,
			filter: false
		},
		input: {
			title: ''
		}
	}

	handleInput(e, field) {
		const inputValue = e.target.value

		this.setState(prevState => {
			const { input } = prevState
			input[field] = inputValue

			return { input }
		})
	}

	handleInput_reset(field) {
		this.setState(prevState => {
			const { input } = prevState
			input[field] = ''

			return { input }
		})
	}

	handleStar_updateInfo(value, label) {
		Axios.put(`${config.api}/star/${this.state.star.id}`, { label, value }).then(() => {
			this.setState(prevState => {
				const { star } = prevState
				star.info[label] = value

				return { star }
			})
		})
	}

	handleStar_addAttribute(value) {
		Axios.put(`${config.api}/star/${this.state.star.id}/attribute`, { name: value }).then(() => {
			this.setState(prevState => {
				const { star } = prevState
				star.info.attribute.push(value)

				return { star }
			})
		})
	}

	//TODO change .put() to .delete()
	handleStar_removeAttribute(value) {
		Axios.put(`${config.api}/star/${this.state.star.id}/attribute`, { name: value, delete: true }).then(() => {
			this.setState(prevState => {
				const { star } = prevState
				const { attribute: attributes } = prevState.star.info

				star.info.attribute = attributes.filter(attribute => {
					if (attribute.toLowerCase() === value.toLowerCase()) return null

					return attribute
				})

				return { star }
			})
		})
	}

	handleStar_rename() {
		const starRef = this.state.star
		const inputRef = this.state.input.title

		Axios.put(`${config.api}/star/${starRef.id}`, { name: inputRef }).then(() => {
			this.setState(prevState => {
				const { star } = prevState
				star.name = inputRef

				return { star }
			})
		})

		this.handleInput_reset('title')
	}

	handleStar_remove() {
		const { star } = this.state

		Axios.delete(`${config.api}/star/${star.id}`).then(() => {
			window.location.href = '/star'
		})
	}

	handleStar_removeImage() {
		Axios.delete(`${config.source}/star/${this.state.star.id}/image`).then(() => {
			this.setState(prevState => {
				const { star } = prevState
				star.image = null

				return { star }
			})
		})
	}

	handleStar_addImage(image) {
		Axios.post(`${config.source}/star/${this.state.star.id}/image`, { url: image }).then(() => {
			this.setState(prevState => {
				let star = prevState.star
				star.image = `${this.state.star.id}.jpg?${Date.now()}`

				return { star }
			})
		})
	}

	render() {
		return (
			<div id='star-page' className='col-12 row'>
				<section className='col-7'>
					{this.state.star.id !== 0 ? (
						<div id='star'>
							<StarImageDropbox
								star={this.state.star}
								removeStar={() => this.handleStar_remove()}
								removeImage={() => this.handleStar_removeImage()}
								addImage={image => this.handleStar_addImage(image)}
							/>

							<ContextMenuTrigger id='title'>
								<h2>{this.state.star.name}</h2>
							</ContextMenuTrigger>

							<ContextMenu id='title'>
								<MenuItem
									onClick={() => {
										this.handleModal(
											'Rename',
											<input
												type='text'
												defaultValue={this.state.star.name}
												onChange={e => this.handleInput(e, 'title')}
												ref={inp => inp && inp.focus()}
												onKeyDown={e => {
													if (e.key === 'Enter') {
														e.preventDefault()

														this.handleModal()
														this.handleStar_rename()
													}
												}}
											/>
										)
									}}
								>
									<i className={`${config.theme.fa} fa-edit`} /> Rename
								</MenuItem>
							</ContextMenu>

							<StarForm
								update={(label, value) => this.handleStar_updateInfo(label, value)}
								addAttribute={value => this.handleStar_addAttribute(value)}
								removeAttribute={value => this.handleStar_removeAttribute(value)}
								data={this.state.star.info}
								starData={this.state.starData}
							/>
						</div>
					) : null}

					{this.state.videos.length && <StarVideos videos={this.state.videos} />}
				</section>

				<Modal
					visible={this.state.modal.visible}
					title={this.state.modal.title}
					filter={this.state.modal.filter}
					onClose={() => this.handleModal()}
				>
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

		Axios.get(`${config.api}/star/${id}`).then(({ data: star }) => {
			this.setState(() => {
				return { star }
			})
		})

		Axios.get(`${config.api}/star/${id}/video`).then(({ data: videos }) => {
			this.setState(() => {
				return { videos }
			})
		})

		Axios.get(`${config.api}/star`).then(({ data: starData }) => {
			this.setState(() => {
				return { starData }
			})
		})
	}
}

// Container
const StarVideos = ({ videos }) => (
	<>
		<h3>Videos</h3>

		<div id='videos' className='row'>
			{videos.map(video => (
				<StarVideo key={video.id} video={video} />
			))}
		</div>
	</>
)

const StarForm = ({ update, addAttribute, removeAttribute, data, starData }) => (
	<>
		<StarInputForm update={update} name='Breast' value={data.breast} list={starData.breast} />
		<StarInputForm update={update} name='EyeColor' value={data.eyecolor} list={starData.eyecolor} />
		<StarInputForm update={update} name='HairColor' value={data.haircolor} list={starData.haircolor} />
		<StarInputForm update={update} name='HairStyle' value={data.hairstyle} list={starData.hairstyle} />
		<StarInputForm
			update={addAttribute}
			name='Attribute'
			emptyByDefault
			value={data.attribute}
			list={starData.attribute}
		>
			<StarAttributes data={data.attribute} remove={removeAttribute} />
		</StarInputForm>
	</>
)

const StarImageDropbox = ({ removeStar, removeImage, addImage, star }) => {
	const [hover, setHover] = useState(false)

	const handleDefault = e => {
		e.stopPropagation()
		e.preventDefault()
	}

	const handleEnter = e => {
		handleDefault(e)

		setHover(true)
	}

	const handleLeave = e => {
		handleDefault(e)

		setHover(false)
	}

	const handleDrop = e => {
		handleDefault(e)

		addImage(e.dataTransfer.getData('text'))
	}

	if (star.image !== null) {
		return (
			<>
				<ContextMenuTrigger id='star__image'>
					<img className='star__image' src={`${config.source}/images/stars/${star.image}`} alt='star' />
				</ContextMenuTrigger>

				<ContextMenu id='star__image'>
					<MenuItem onClick={removeImage}>
						<i className={`${config.theme.fa} fa-trash-alt`} /> Delete Image
					</MenuItem>
				</ContextMenu>
			</>
		)
	} else {
		return (
			<>
				<ContextMenuTrigger id='star__dropbox'>
					<div
						id='dropbox'
						className={`unselectable ${hover ? 'hover' : ''}`}
						onDragEnter={handleEnter}
						onDragOver={handleEnter}
						onDragLeave={handleLeave}
						onDrop={handleDrop}
					>
						<div className='label'>Drop Image Here</div>
					</div>
				</ContextMenuTrigger>

				<ContextMenu id='star__dropbox'>
					<MenuItem onClick={removeStar}>
						<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Star
					</MenuItem>
				</ContextMenu>
			</>
		)
	}
}

// ContainerItem
const StarVideo = ({ video }) => {
	const [src, setSrc] = useState('')
	const [dataSrc, setDataSrc] = useState(`${config.source}/videos/${video.fname}`)

	const thumbnail = useRef()

	const reload = async () => {
		setSrc(dataSrc)
		setDataSrc('')
	}

	const unload = () => {
		setDataSrc(src)
		setSrc('')
	}

	const playFrom = (video, time = 0) => {
		if (time) video.currentTime = time

		video.play()
	}

	const stopFrom = (video, time = 0) => {
		if (time) video.currentTime = time

		video.pause()
	}

	const startThumbnailPlayback = async video => {
		let time = 100
		const offset = 60
		const duration = 1.5

		playFrom(video)
		thumbnail.current = setInterval(() => {
			time += offset
			if (time > video.duration) {
				stopThumbnailPlayback(video).then(() => startThumbnailPlayback(video))
			}
			playFrom(video, (time += offset))
		}, duration * 1000)
	}

	const stopThumbnailPlayback = async video => {
		stopFrom(video)

		clearInterval(thumbnail.current)
	}

	const handleMouseEnter = ({ target }) => {
		if (dataSrc.length && !src.length) {
			reload().then(() => startThumbnailPlayback(target))
		}
	}

	const handleMouseLeave = ({ target }) => {
		if (!dataSrc.length && src.length) {
			stopThumbnailPlayback(target).then(() => unload())
		}
	}

	return (
		<a className='video  card' href={`/video/${video.id}`}>
			<video
				className='card-img-top'
				src={src}
				data-src={dataSrc}
				//TODO change video.id-290.jpg >> video.image
				poster={`${config.source}/images/videos/${video.id}-290.jpg`}
				preload='metadata'
				muted
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			/>

			<span className='title card-title'>{video.name}</span>
		</a>
	)
}

const StarInputForm = ({ value, emptyByDefault, update, name, type, list, children }) => {
	const [inputID, setInputID] = useState('')
	const [inputValue, setInputValue] = useState(emptyByDefault ? '' : value)

	const updateValue = e => {
		setInputID(e.target.id)
		setInputValue(e.target.value)
	}

	const handleKeyPress = e => {
		if (e.key === 'Enter') {
			if (inputID.length) update(inputValue, inputID)

			if (emptyByDefault) {
				setInputValue('')

				// Reset input-field
				e.target.value = ''
			}
		}
	}

	const isChanged = () => {
		const serverValue = (emptyByDefault ? '' : value).toLowerCase()
		const clientValue = (inputValue || '').toLowerCase()

		return clientValue !== serverValue
	}

	return (
		<div className='input-wrapper'>
			<label className={isChanged() ? 'bold' : ''} htmlFor={name.toLowerCase()}>
				{name}
			</label>

			<input
				type={type}
				id={name.toLowerCase()}
				defaultValue={emptyByDefault ? '' : value}
				onChange={e => updateValue(e)}
				onKeyDown={e => handleKeyPress(e)}
				list={`${name.toLowerCase()}s`}
			/>

			{list ? (
				<datalist id={`${name.toLowerCase()}s`}>
					{list.map(item => (
						<option key={item} value={item} />
					))}
				</datalist>
			) : null}

			{children}
		</div>
	)
}

const StarAttributes = ({ remove, data }) => {
	return data.map((attribute, i) => (
		<Fragment key={attribute}>
			<ContextMenuTrigger id={`attribute-${i}`} renderTag='span'>
				<span className='attribute ml-2'>
					<span className='btn btn-sm btn-outline-primary'>{attribute}</span>
				</span>
			</ContextMenuTrigger>

			<ContextMenu id={`attribute-${i}`}>
				<MenuItem onClick={() => remove(attribute)}>
					<i className={`${config.theme.fa} fa-trash-alt`} /> Remove
				</MenuItem>
			</ContextMenu>
		</Fragment>
	))
}

export default StarPage
