import React, { Component, Fragment, useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

import {
	Box,
	Grid,
	Card,
	CardActionArea,
	CardContent,
	CardMedia,
	Typography,
	Button,
	TextField
} from '@material-ui/core'

import { Autocomplete } from '@material-ui/lab'

import Axios from 'axios'
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu'

import Modal from '../modal/modal'
import Loader from '../loader/loader'

import './star.scss'

import config from '../config.json'

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
			title: null,
			data: null,
			filter: false
		}
	}

	handleModal(title = null, data = null, filter = false) {
		if (title !== null && data !== null && this.state.modal.visible) this.handleModal()

		this.setState(({ modal }: any) => {
			modal.title = title
			modal.data = data
			modal.visible = !modal.visible
			modal.filter = filter

			return { modal }
		})
	}

	render() {
		return (
			<Grid container justify='center' id='star-page'>
					{this.state.star.id !== 0 ? (
					<Grid item xs={12} id='star'>
							<StarImageDropbox star={this.state.star} update={(star: any) => this.setState({ star })} />

							<StarTitle
								star={this.state.star}
							handleModal={(title: any, data: any, filter: any) => this.handleModal(title, data, filter)}
								update={(star: any) => this.setState({ star })}
							/>

							<StarForm
								star={this.state.star}
								starData={this.state.starData}
								update={(star: any) => this.setState({ star })}
							/>

					{this.state.videos.length ? <StarVideos videos={this.state.videos} /> : null}
					</Grid>
				) : (
					<Loader />
				)}

				<Modal
					visible={this.state.modal.visible}
					title={this.state.modal.title}
					filter={this.state.modal.filter}
					onClose={() => this.handleModal()}
				>
					{this.state.modal.data}
				</Modal>
			</Grid>
		)
	}

	componentDidMount() {
		const props: any = this.props
		const { id } = props.match.params

		Axios.get(`${config.api}/star/${id}`).then(({ data: star }) => this.setState({ star }))
		Axios.get(`${config.api}/star/${id}/video`).then(({ data: videos }) => this.setState({ videos }))
		Axios.get(`${config.api}/star`).then(({ data: starData }) => this.setState({ starData }))
	}
}

// Wrapper
const StarVideos = ({ videos }: any) => (
	<Grid container>
		<h3>Videos</h3>

		<Grid container id='videos'>
			{videos.map((video: any) => (
				<StarVideo key={video.id} video={video} />
			))}
		</Grid>
	</Grid>
)

const StarForm = ({ star, starData, update }: any) => {
	const addAttribute = (name: any) => {
		Axios.put(`${config.api}/star/${star.id}/attribute`, { name }).then(() => {
			star.info.attribute.push(name)

			update(star)
		})
	}

	const removeAttribute = (name: any) => {
		Axios.put(`${config.api}/star/${star.id}/attribute`, { name, delete: true }).then(() => {
			star.info.attribute = star.info.attribute.filter((attribute: any) => {
				if (attribute.toLowerCase() === name.toLowerCase()) return null

				return attribute
			})

			update(star)
		})
	}

	const updateInfo = (value: any, label: any) => {
		Axios.put(`${config.api}/star/${star.id}`, { label, value }).then(() => {
			star.info[label] = value

			update(star)
		})
	}

	return (
		<>
			<StarInputForm update={updateInfo} name='Breast' value={star.info.breast} list={starData.breast} />
			<StarInputForm update={updateInfo} name='EyeColor' value={star.info.eyecolor} list={starData.eyecolor} />
			<StarInputForm update={updateInfo} name='HairColor' value={star.info.haircolor} list={starData.haircolor} />
			<StarInputForm update={updateInfo} name='HairStyle' value={star.info.hairstyle} list={starData.hairstyle} />
			<StarInputForm
				update={addAttribute}
				name='Attribute'
				emptyByDefault
				value={star.info.attribute}
				list={starData.attribute}
			>
				<StarAttributes data={star.info.attribute} remove={removeAttribute} />
			</StarInputForm>
		</>
	)
}

const StarImageDropbox = ({ star, update }: any) => {
	const [hover, setHover] = useState(false)

	const addImage = (image: any) => {
		Axios.post(`${config.source}/star/${star.id}/image`, { url: image }).then(() => {
			star.image = `${star.id}.jpg?${Date.now()}`

			update(star)
		})
	}

	const removeImage = () => {
		Axios.delete(`${config.source}/star/${star.id}/image`).then(() => {
			star.image = null

			update(star)
		})
	}

	const removeStar = () => {
		Axios.delete(`${config.api}/star/${star.id}`).then(() => {
			window.location.href = '/star'
		})
	}

	const handleDefault = (e: React.DragEvent) => {
		e.stopPropagation()
		e.preventDefault()
	}

	const handleEnter = (e: React.DragEvent) => {
		handleDefault(e)

		setHover(true)
	}

	const handleLeave = (e: React.DragEvent) => {
		handleDefault(e)

		setHover(false)
	}

	const handleDrop = (e: React.DragEvent) => {
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
						<i className={config.theme.icons.trash} /> Delete Image
					</MenuItem>
				</ContextMenu>
			</>
		)
	} else {
		return (
			<>
				<ContextMenuTrigger id='star__dropbox'>
					<Box
						id='dropbox'
						className={`unselectable ${hover ? 'hover' : ''}`}
						onDragEnter={handleEnter}
						onDragOver={handleEnter}
						onDragLeave={handleLeave}
						onDrop={handleDrop}
					>
						<Box className='label'>Drop Image Here</Box>
					</Box>
				</ContextMenuTrigger>

				<ContextMenu id='star__dropbox'>
					<MenuItem onClick={removeStar}>
						<i className={config.theme.icons.trash} /> Remove Star
					</MenuItem>
				</ContextMenu>
			</>
		)
	}
}

// Container
const StarVideo = ({ video }: any) => {
	const [src, setSrc] = useState('')
	const [dataSrc, setDataSrc] = useState(`${config.source}/videos/${video.fname}`)

	const thumbnail: any = useRef()

	const reload = async () => {
		setSrc(dataSrc)
		setDataSrc('')
	}

	const unload = () => {
		setDataSrc(src)
		setSrc('')
	}

	const playFrom = (video: any, time = 0) => {
		if (time) video.currentTime = time

		video.play()
	}

	const stopFrom = (video: any, time = 0) => {
		if (time) video.currentTime = time

		video.pause()
	}

	const startThumbnailPlayback = async (video: any) => {
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

	const stopThumbnailPlayback = async (video: any) => {
		stopFrom(video)

		clearInterval(thumbnail.current)
	}

	const handleMouseEnter = ({ target }: any) => {
		if (dataSrc.length && !src.length) {
			reload().then(() => startThumbnailPlayback(target))
		}
	}

	const handleMouseLeave = ({ target }: any) => {
		if (!dataSrc.length && src.length) {
			stopThumbnailPlayback(target).then(() => unload())
		}
	}

	return (
		<Link className='video' to={`/video/${video.id}`}>
			<Card>
				<CardActionArea>
					<CardMedia
						component='video'
				src={src}
				data-src={dataSrc}
				poster={`${config.source}/images/videos/${video.image}`}
				preload='metadata'
				muted
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
			/>

					<CardContent>
						<Typography className='video__title'>{video.name}</Typography>
					</CardContent>
				</CardActionArea>
			</Card>
		</Link>
	)
}

const StarInputForm = ({ value, emptyByDefault = false, update, name, list, children }: any) => {
	const [open, setOpen] = useState(false)
	const [inputValue, setInputValue] = useState('')

	const updateValue = (value: any) => {
		if (value === '') setOpen(false)

		setInputValue(value)
	}

	const handleKeyPress = (e: React.KeyboardEvent<any>) => {
		if (!open && e.key === 'Enter') {
			update(inputValue, name.toLowerCase())

			if (emptyByDefault) setInputValue('')
		}
	}

	const isChanged = () => inputValue.toLowerCase() !== (!emptyByDefault ? value : '').toLowerCase()

	useEffect(() => {
		if (!emptyByDefault && value.length) {
			setInputValue(value)
	}
	}, [value])

	// FIXME excluding an item from dropdown causes a warning
	return (
		<Grid container style={{ marginBottom: 4 }}>
			<Grid item xs={2}>
				<Autocomplete
					inputValue={inputValue}
					//
					// EVENTS
					onInputChange={(e, val, reason) => {
						if (reason === 'reset' && !open) return

						updateValue(val)
					}}
					onKeyPress={handleKeyPress}
					//
					// OPTIONS
					options={list.filter((item: any) => (emptyByDefault && value.includes(item) ? null : item))}
					renderInput={(params) => <TextField {...params} label={name} error={isChanged()} />}
					autoHighlight
					//
					// open/closed STATUS
					open={open}
					onOpen={() => setOpen(true)}
					onClose={() => setOpen(false)}
			/>
			</Grid>

			<Grid item style={{ marginTop: 14, marginLeft: 8 }}>
			{children}
			</Grid>
		</Grid>
	)
}

const StarAttributes = ({ remove, data }: any) => {
	return data.map((attribute: any, i: any) => (
		<Fragment key={attribute}>
			<ContextMenuTrigger id={`attribute-${i}`} renderTag='span'>
				<span className='attribute'>
					<Button size='small' variant='outlined' color='primary'>
						{attribute}
					</Button>
				</span>
			</ContextMenuTrigger>

			<ContextMenu id={`attribute-${i}`}>
				<MenuItem onClick={() => remove(attribute)}>
					<i className={config.theme.icons.trash} /> Remove
				</MenuItem>
			</ContextMenu>
		</Fragment>
	))
}

const StarTitle = ({ star, handleModal, update }: any) => {
	const renameStar = (name: any) => {
		Axios.put(`${config.api}/star/${star.id}`, { name }).then(() => {
			star.name = name

			update(star)
		})
	}

	return (
		<>
			<ContextMenuTrigger id='title'>
				<h2>{star.name}</h2>
			</ContextMenuTrigger>

			<ContextMenu id='title'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Rename',
							<TextField
								defaultValue={star.name}
								autoFocus
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement> | any) => {
									if (e.key === 'Enter') {
										e.preventDefault()

										handleModal()
										renameStar(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={config.theme.icons.edit} /> Rename
				</MenuItem>
			</ContextMenu>
		</>
	)
}

export default StarPage
