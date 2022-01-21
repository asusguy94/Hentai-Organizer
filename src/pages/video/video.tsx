import React, { Fragment, useEffect, useState, useContext, createContext } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import {
	Grid,
	Button,
	Card,
	CardMedia,
	CardContent,
	Box,
	Typography,
	TextField,
	Checkbox,
	Divider,
	FormGroup,
	FormControlLabel
} from '@mui/material'

import Axios from 'axios'
//@ts-ignore
import { PlyrComponent as Plyr } from 'plyr-react'
import HlsJS from 'hls.js'
import DashJS from 'dashjs'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import ReactTooltip from 'react-tooltip'
import { Flipper, Flipped } from 'react-flip-toolkit'
//@ts-ignore
import KeyboardEventHandler from 'react-keyboard-event-handler'

import Modal from '@components/modal/modal'
import Ribbon from '@components/ribbon/ribbon'
import { timeToSeconds } from '@/time'
import { useRefWithEffect, useWindowSize, usePrevious } from '@/hooks'

import './video.scss'

import { server as serverConfig, settings as settingsConfig, theme as themeConfig } from '@/config'

import { IVideo, IAttribute, ICategory, IVideoStar as IStar, IBookmark, IKeyPress } from '@/interfaces'

const ModalContext = createContext({
	method: (...args: any): void => {},
	data: { visible: false, title: null, data: null, filter: false }
})
const UpdateContext = createContext({
	video: (...args: any): void => {},
	stars: (...args: any[]): void => {},
	bookmarks: (...args: any[]): void => {}
})

const starEventData = { id: 0, name: '', starID: 0, start: 0, active: false, attributes: [] }
const SetStarEventContext = createContext((...args: any): void => {})
const GetStarEventContext = createContext({ event: false, data: starEventData })

const VideoPage = () => {
	const { id } = useParams()

	const [video, setVideo] = useState({
		id: 0,
		nextID: 0,
		episode: 0,
		franchise: '',
		brand: '',
		name: '',
		path: {
			file: '',
			stream: '',
			dash: ''
		},
		duration: 0,
		date: {
			added: '',
			published: ''
		},
		quality: 0,
		censored: false,
		attributes: [],
		related: [],
		noStar: 0
	})

	const [stars, setStars] = useState([])
	const [bookmarks, setBookmarks] = useState([])
	const [categories, setCategories] = useState([])
	const [attributes, setAttributes] = useState([])

	const [modal, setModal] = useState({
		visible: false,
		title: null,
		data: null,
		filter: false
	})

	const [addStarEvent, setAddStarEvent] = useState({
		event: false,
		data: starEventData
	})

	const history = useNavigate()
	const handleKeyPress = (key: string, e: IKeyPress) => {
		e.preventDefault()

		switch (key) {
			case 'tab':
				if (video.nextID) {
					window.location.href = `${video.nextID}`
				} else {
					history('/video')
				}
				break
			default:
				console.log(`${key} was pressed`)
		}
	}

	const handleModal = (title = null, data = null, filter = false) => {
		setModal((prevModal) => ({ title, data, visible: !prevModal.visible, filter }))
	}

	const handleAddStarEvent = (event: boolean, data: any = addStarEvent.data) => {
		setAddStarEvent({ event, data })
	}

	useEffect(() => {
		Axios.get(`${serverConfig.api}/video/${id}`).then(({ data: video }) => setVideo(video))

		Axios.get(`${serverConfig.api}/video/${id}/star`)
			.then(({ data: stars }) => setStars(stars))
			.finally(() => {
				// Only get bookmarks after /star has been loaded
				Axios.get(`${serverConfig.api}/video/${id}/bookmark`).then(({ data: bookmarks }) => {
					bookmarks.map((bookmark: IBookmark) => (bookmark.active = false))

					setBookmarks(bookmarks)
				})
			})

		Axios.get(`${serverConfig.api}/category`).then(({ data: categories }) => setCategories(categories))
		Axios.get(`${serverConfig.api}/attribute/video`).then(({ data: attributes }) => setAttributes(attributes))
	}, [id])

	return (
		<Grid container id='video-page'>
			<ModalContext.Provider
				value={{
					method: (title: any, data: any, filter: boolean) => handleModal(title, data, filter),
					data: modal
				}}
			>
				<UpdateContext.Provider value={{ bookmarks: setBookmarks, video: setVideo, stars: setStars }}>
					<SetStarEventContext.Provider
						value={(event: boolean, data: any = addStarEvent.data) => handleAddStarEvent(event, data)}
					>
						<GetStarEventContext.Provider value={addStarEvent}>
							<Section
								video={video}
								bookmarks={bookmarks}
								categories={categories}
								attributes={attributes}
								stars={stars}
								updateBookmarks={(bookmarks: any) => setBookmarks(bookmarks)}
							/>

							<Sidebar
								video={video}
								stars={stars}
								bookmarks={bookmarks}
								attributes={attributes}
								categories={categories}
								updateBookmarks={(bookmarks: any) => setBookmarks(bookmarks)}
							/>
						</GetStarEventContext.Provider>
					</SetStarEventContext.Provider>

					<Modal visible={modal.visible} title={modal.title} filter={modal.filter} onClose={handleModal}>
						{modal.data}
					</Modal>

					<KeyboardEventHandler
						handleKeys={['tab']}
						onKeyEvent={(key: string, e: IKeyPress) => handleKeyPress(key, e)}
						handleFocusableElements={true}
					/>
				</UpdateContext.Provider>
			</ModalContext.Provider>
		</Grid>
	)
}

// Wrapper
interface ISection {
	video: IVideo
	bookmarks: IBookmark[]
	categories: ICategory[]
	attributes: IAttribute[]
	stars: IStar[]
	updateBookmarks: (bookmarks: IBookmark[]) => void
}
const Section = ({ video, bookmarks, categories, attributes, stars, updateBookmarks }: ISection) => {
	const [playerRef, ref] = useRefWithEffect()
	const [duration, setDuration] = useState(0)

	// Helper script for getting the player
	//@ts-ignore
	const getPlayer = () => ref.player

	const playVideo = (time = null) => {
		const player = getPlayer()

		if (time === null) time = player.currentTime
		player.currentTime = Number(time)
		player.play()
	}

	const setTime = (bookmarkID: number, time = Math.round(getPlayer().currentTime)) => {
		Axios.put(`${serverConfig.api}/bookmark/${bookmarkID}`, { time }).then(() => {
			updateBookmarks(
				bookmarks
					.map((bookmark) => {
						if (bookmark.id === bookmarkID) bookmark.start = time

						return bookmark
					})
					.sort((a, b) => a.start - b.start)
			)
		})
	}

	return (
		<Grid item xs={9}>
			<Header video={video} />

			<VideoPlayer
				playerRef={playerRef}
				playerValue={ref}
				video={video}
				bookmarks={bookmarks}
				categories={categories}
				stars={stars}
				updateBookmarks={updateBookmarks}
				updateDuration={setDuration}
			/>

			<Timeline
				video={video}
				bookmarks={bookmarks}
				stars={stars}
				attributes={attributes}
				categories={categories}
				playVideo={playVideo}
				setTime={setTime}
				update={updateBookmarks}
				duration={duration}
			/>
		</Grid>
	)
}

interface ISidebar {
	video: IVideo
	stars: IStar[]
	bookmarks: IBookmark[]
	attributes: IAttribute[]
	categories: ICategory[]
	updateBookmarks: (bookmarks: IBookmark[]) => void
}
const Sidebar = ({ video, stars, bookmarks, attributes, categories, updateBookmarks }: ISidebar) => {
	// const update = useContext(UpdateContext).video

	const clearActive = () => {
		updateBookmarks(
			bookmarks.map((bookmark) => {
				bookmark.active = false

				return bookmark
			})
		)
	}

	const getAttributes = () => {
		const attributeArr: IAttribute[] = []
		bookmarks.forEach(({ attributes }) => {
			attributes
				.sort((a, b) => a.name.localeCompare(b.name))
				.forEach((attribute) => {
					if (!attributeArr.some((attr) => attr.id === attribute.id)) attributeArr.push(attribute)
				})
		})

		return attributeArr
	}

	return (
		<Grid item xs={3} id='sidebar'>
			<Grid container justifyContent='center' style={{ marginTop: 6, marginBottom: 18 }}>
				{/* <HeaderNetwork video={video} update={update} /> */}

				<div style={{ height: 30 }}></div>
			</Grid>

			<Franchise video={video} />

			<Flipper flipKey={stars}>
				<Grid container justifyContent='center' id='stars_section'>
					<Stars
						video={video}
						stars={stars}
						bookmarks={bookmarks}
						attributes={attributes}
						categories={categories}
						clearActive={clearActive}
						updateBookmarks={updateBookmarks}
					/>
				</Grid>
			</Flipper>

			<StarInput video={video} stars={stars} bookmarks={bookmarks} getAttributes={getAttributes} />

			<Attributes
				bookmarks={bookmarks}
				clearActive={clearActive}
				update={updateBookmarks}
				getAttributes={getAttributes}
			/>
		</Grid>
	)
}

// Container
interface IVideoPlayer {
	video: IVideo
	bookmarks: IBookmark[]
	categories: ICategory[]
	stars: IStar[]
	updateBookmarks: (bookmarks: IBookmark[]) => void
	updateDuration: (duration: number) => void
	playerRef: any
	playerValue: any
}
const VideoPlayer = ({
	video,
	bookmarks,
	categories,
	stars,
	updateBookmarks,
	updateDuration,
	playerRef,
	playerValue
}: IVideoPlayer) => {
	const handleModal = useContext(ModalContext).method
	const modalData = useContext(ModalContext).data

	const update = useContext(UpdateContext).video

	const [newVideo, setNewVideo] = useState<boolean>()
	const [events, setEvents] = useState(false)

	const prevID = usePrevious(video.id)

	let playAdded = false

	const getPlayer = () => playerValue?.player

	//FIXME the poster is not updated when on soft-link change

	useEffect(() => {
		if (prevID > 0) {
			setEvents(false)
		}
	}, [video.id])

	useEffect(() => {
		if (playerValue !== undefined && !events) {
			if (Number(localStorage.video) === video.id) {
				setNewVideo(false)
			} else {
				setNewVideo(true)
			}
			setEvents(true)
		}
	}, [playerValue, events])

	useEffect(() => {
		if (events) {
			const player = getPlayer()

			if (Number(localStorage.video) !== video.id) localStorage.playing = 0

			player.on('timeupdate', () => {
				if (player.currentTime) localStorage.bookmark = Math.round(player.currentTime)
			})
			player.on('play', () => {
				localStorage.playing = 1

				if (newVideo && !playAdded) {
					playAdded = true

					Axios.put(`${serverConfig.api}/video/${video.id}`, { plays: 1 })
						.then(() => {
							console.log('Play Added')
							playAdded = true
						})
						.catch(() => {
							playAdded = false
						})
				}
			})
			player.on('pause', () => (localStorage.playing = 0))
		}
	}, [events])

	useEffect(() => {
		if (events) {
			const player = getPlayer()

			if (HlsJS.isSupported() && settingsConfig.hls.enabled) {
				const hls = new HlsJS({
					//maxBufferLength: timeToSeconds(2),
					//maxMaxBufferLength: timeToSeconds(2),
					autoStartLoad: false
				})

				hls.loadSource(`${serverConfig.source}/videos_hls/${video.path.stream}`)
				hls.attachMedia(player.media)

				hls.on(HlsJS.Events.MANIFEST_PARSED, (e, data) => {
					const dataLevels = data['levels'].length - 1

					const levels: { [key: string]: number } = settingsConfig.hls.levels
					const maxLevel = levels[settingsConfig.hls.maxLevel]
					const maxStartLevel = levels[settingsConfig.hls.maxStartLevel]

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

					if (!newVideo) {
						hls.startLoad(Number(localStorage.bookmark))

						if (Number(localStorage.playing)) player.play()
					} else {
						localStorage.video = video.id
						localStorage.bookmark = 0

						hls.startLoad()
						player.pause()
					}
				})
				hls.on(HlsJS.Events.LEVEL_LOADED, (e, data) => updateDuration(data.details.totalduration))
			} else if (DashJS.supportsMediaSource() && settingsConfig.dash.enabled) {
				const dash = DashJS.MediaPlayer().create()

				// Initial settings
				dash.updateSettings({
					streaming: {
						buffer: {
							bufferTimeAtTopQuality: timeToSeconds(5),
							bufferTimeAtTopQualityLongForm: timeToSeconds(5),
							bufferToKeep: timeToSeconds(10)
						}
					}
				})

				dash.on(DashJS.MediaPlayer.events.MANIFEST_LOADED, ({ data }: any) => {
					const qualityArr = data['Period']['AdaptationSet'][0]['Representation']
					const dataLevels = qualityArr.length

					const levels: { [key: string]: number } = settingsConfig.dash.levels
					const maxLevel = levels[settingsConfig.dash.maxLevel]
					const maxStartLevel = levels[settingsConfig.dash.maxStartLevel]

					// StartLevel
					let desiredStartLevel = maxLevel - 1
					if (desiredStartLevel > maxStartLevel) desiredStartLevel = maxStartLevel
					if (desiredStartLevel > dataLevels) desiredStartLevel = dataLevels - 1
					if (desiredStartLevel < 0) desiredStartLevel = 0

					// MaxLevel
					let desiredBitrate = -1

					let currentQuality = 0
					for (let obj of qualityArr) {
						if (obj.height <= settingsConfig.dash.maxLevel && obj.height > currentQuality) {
							currentQuality = obj.height

							desiredBitrate = Math.ceil(obj.bandwidth / 1000)
						}
					}

					dash.updateSettings({
						streaming: {
							buffer: {
								initialBufferLevel: desiredStartLevel
							},
							abr: {
								maxBitrate: {
									video: desiredBitrate
								}
							}
						}
					})

					//TODO add start-time
				})

				// Required, otherwise crashes component
				dash.initialize()
				dash.setAutoPlay(false)
				dash.attachSource(`${serverConfig.source}/videos/${video.path.dash}`)
				dash.attachView(player.media)

				let triggered = false
				dash.on(DashJS.MediaPlayer.events.CAN_PLAY, () => {
					if (!triggered) {
						triggered = true

						if (!newVideo) {
							dash.seek(Number(localStorage.bookmark))

							if (Number(localStorage.playing)) dash.play()
						} else {
							localStorage.video = video.id
							localStorage.bookmark = 0

							dash.pause()
						}

						updateDuration(dash.duration())
					}
				})
			} else {
				player.media.ondurationchange = (e: any) => updateDuration(e.target.duration)
			}
		}
	}, [events])

	const handleWheel = (e: React.WheelEvent) => {
		const multiplier = 10

		getPlayer().currentTime += multiplier * Math.sign(e.deltaY) * -1
	}
	const copy = async () => await navigator.clipboard.writeText(video.path.file)

	const resetPlays = () => {
		Axios.put(`${serverConfig.api}/video/${video.id}`, { plays: 0 }).then(() => {
			window.location.reload()

			//TODO use stateObj instead
		})
	}

	const deleteVideo = () => {
		Axios.delete(`${serverConfig.source}/video/${video.id}`).then(() => {
			window.location.href = '/video'

			//TODO use stateObj instead
		})
	}

	const renameVideo = (path: string) => {
		Axios.put(`${serverConfig.source}/video/${video.id}`, { path }).then(() => {
			window.location.reload()

			//TODO use stateObj instead
		})
	}

	const censorToggle = () => {
		Axios.put(`${serverConfig.api}/video/${video.id}`, { cen: !video.censored }).then(() => {
			update({ ...video, censored: !video.censored })
		})
	}

	const updateVideo = () => {
		Axios.put(`${serverConfig.source}/video/${video.id}`).then(() => {
			window.location.reload()

			//TODO use stateObj instead
		})
	}

	const addBookmark = (category: ICategory) => {
		const time = Math.round(getPlayer().currentTime)
		if (time) {
			Axios.post(`${serverConfig.api}/video/${video.id}/bookmark`, {
				categoryID: category.id,
				time
			}).then(({ data }) => {
				let attributes = data.attributes
				if (typeof data.attributes === 'undefined') attributes = []

				updateBookmarks(
					[
						...bookmarks,
						{
							id: data.id,
							name: category.name,
							start: time,
							starID: 0,
							attributes,
							active: false
						}
					].sort((a, b) => a.start - b.start)
				)
			})
		}
	}

	const handleKeyPress = (key: string, e: IKeyPress) => {
		if (e.target.tagName === 'INPUT') return
		e.preventDefault()

		const player = getPlayer()

		switch (key) {
			case 'left':
				player.currentTime -= 1
				break
			case 'right':
				player.currentTime += 1
				break
			case 'space':
				if (player.playing) player.pause()
				else player.play()
				break
			case 'm':
				player.muted = !player.muted
				break
			case 'up':
				player.volume = Math.ceil((player.volume + 0.1) * 10) / 10
				break
			case 'down':
				player.volume = Math.floor((player.volume - 0.1) * 10) / 10
				break
			default:
				console.log(`${key} was pressed`)
		}
	}

	return (
		<div className='video-container' onWheel={handleWheel}>
			<ContextMenuTrigger id='video' holdToDisplay={-1}>
				{video.id !== 0 && (
					<Plyr
						ref={playerRef}
						options={{
							controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'settings'],
							fullscreen: { enabled: false },
							settings: ['speed'],
							ratio: '21:9',
							hideControls: false,
							keyboard: { focused: false, global: false }
						}}
						sources={{
							type: 'video',
							sources: [
								{
									src: `${serverConfig.source}/videos/${video.path.file}`,
									type: 'video/mp4'
								}
							],
							poster: `${serverConfig.source}/video/${video.id}`
						}}
					/>
				)}
			</ContextMenuTrigger>

			<ContextMenu id='video'>
				<MenuItem
					disabled={video.noStar === 1}
					onClick={() => {
						handleModal(
							'Add Bookmark',
							categories.map((category) => {
								return (
									<Button
										variant='outlined'
										color='primary'
										key={category.id}
										onClick={() => {
											handleModal()
											addBookmark(category)
										}}
									>
										{category.name}
									</Button>
								)
							}),
							true
						)
					}}
				>
					<i className={themeConfig.icons.add} /> Add Bookmark
				</MenuItem>

				<MenuItem onClick={censorToggle}>
					{video.censored ? (
						<>
							<i className={themeConfig.icons['toggle-yes']} /> UnCensor
						</>
					) : (
						<>
							<i className={themeConfig.icons['toggle-no']} /> Censor
						</>
					)}
				</MenuItem>
				<MenuItem onClick={resetPlays}>
					<i className={themeConfig.icons.trash} /> Remove Plays
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Rename Video',
							<TextField
								defaultValue={video.path.file}
								autoFocus
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
									if (e.key === 'Enter') {
										handleModal()

										//@ts-ignore
										renameVideo(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={themeConfig.icons.edit} /> Rename Video
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copy}>
					<i className={themeConfig.icons.copy} /> Copy Filename
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={updateVideo}>
					<i className={themeConfig.icons.edit} /> Update Video
				</MenuItem>

				<MenuItem divider />

				<MenuItem disabled={stars.length !== 0} onClick={deleteVideo}>
					<i className={themeConfig.icons.trash} /> Delete Video
				</MenuItem>
			</ContextMenu>

			<KeyboardEventHandler
				handleKeys={['left', 'right', 'space', 'm', 'up', 'down']}
				onKeyEvent={handleKeyPress}
				handleFocusableElements={true}
				isDisabled={modalData.visible}
			/>
		</div>
	)
}

interface ITimeline {
	video: IVideo
	bookmarks: IBookmark[]
	stars: IStar[]
	attributes: IAttribute[]
	categories: ICategory[]
	playVideo: (time?: any) => void
	setTime: (bookmarkID: number, time?: number) => void
	update: (bookmarks: IBookmark[]) => void
	duration: number
}
const Timeline = ({
	video,
	bookmarks,
	stars,
	attributes,
	categories,
	playVideo,
	setTime,
	update,
	duration
}: ITimeline) => {
	const setStarEvent = useContext(SetStarEventContext)
	const handleModal = useContext(ModalContext).method

	useEffect(() => {
		if (duration && video.duration) {
			if (Math.abs(duration - video.duration) > settingsConfig.maxDurationDiff) {
				alert('invalid video-duration')

				console.log('vDur', duration)
				console.log('dbDur', video.duration)

				console.log('Re-Transcode to fix this issue')
			}
		}
	}, [duration, video.duration])

	const bookmarksArr: HTMLElement[] = []

	const isActive = (bookmark: IBookmark) => Boolean(bookmark.active)
	const hasStar = (bookmark: IBookmark) => Boolean(bookmark.starID)
	const attributesFromStar = (starID: number) =>
		stars.filter((star) => (star.id === starID ? star : null))[0]?.attributes || []
	const isStarAttribute = (starID: number, attributeID: number) =>
		attributesFromStar(starID)?.some((attr) => attr.id === attributeID)

	const removeBookmark = (id: number) => {
		Axios.delete(`${serverConfig.api}/bookmark/${id}`).then(() => {
			update(bookmarks.filter((bookmark) => bookmark.id !== id))
		})
	}

	const setCategory = (category: ICategory, bookmark: IBookmark) => {
		Axios.put(`${serverConfig.api}/bookmark/${bookmark.id}`, { categoryID: category.id }).then(() => {
			update(
				bookmarks.map((bookmarkItem) => {
					if (bookmarkItem.id === bookmark.id) {
						bookmarkItem.name = category.name
					}

					return bookmarkItem
				})
			)
		})
	}

	const addAttribute = (attribute: IAttribute, bookmark: IBookmark) => {
		Axios.post(`${serverConfig.api}/bookmark/attribute`, {
			bookmarkID: bookmark.id,
			attributeID: attribute.id
		}).then(() => {
			update(
				bookmarks.map((bookmarkItem) => {
					if (bookmarkItem.id === bookmark.id) {
						bookmarkItem.attributes.push({
							id: attribute.id,
							name: attribute.name
						})
					}

					return bookmarkItem
				})
			)
		})
	}

	const removeAttribute = (bookmark: IBookmark, attribute: IAttribute) => {
		Axios.delete(`${serverConfig.api}/bookmark/${bookmark.id}/attribute/${attribute.id}`).then(() => {
			update(
				bookmarks.map((item) => {
					if (item.id === bookmark.id) {
						item.attributes = item.attributes.filter((itemAttribute) =>
							itemAttribute.id === attribute.id ? null : itemAttribute
						)
					}

					return item
				})
			)
		})
	}

	const clearAttributes = (bookmark: IBookmark) => {
		Axios.delete(`${serverConfig.api}/bookmark/${bookmark.id}/attribute`).then(() => {
			update(
				bookmarks.map((bookmarkItem) => {
					if (bookmarkItem.id === bookmark.id) {
						const starID = bookmark.starID

						if (starID !== 0) {
							const starAttribute = attributesFromStar(starID)

							bookmarkItem.attributes = bookmarkItem.attributes.filter((bookmarkAttribute) => {
								const match = starAttribute.some(
									(starAttribute) => starAttribute.name === bookmarkAttribute.name
								)

								return match ? bookmarkAttribute : null
							})
						} else {
							// Bookmark does not have a star
							bookmarkItem.attributes = []
						}
					}

					return bookmarkItem
				})
			)
		})
	}

	const removeStar = (bookmark: IBookmark) => {
		Axios.delete(`${serverConfig.api}/bookmark/${bookmark.id}/star`).then(() => {
			update(
				bookmarks.map((item) => {
					if (item.id === bookmark.id) {
						const attributes = attributesFromStar(bookmark.starID)

						if (item.attributes.length > attributes.length) {
							// Bookmark have at least 1 attribute not from star
							item.attributes = item.attributes.filter((attribute) => {
								const match = attributes.some((starAttribute) => starAttribute.name === attribute.name)

								return !match ? attribute : null
							})
						} else {
							// Bookmark has only attributes from star
							item.attributes = []
						}

						// RESET starID
						item.starID = 0
					}

					return item
				})
			)
		})
	}

	const collisionCheck = (a: any, b: any) => {
		if (typeof a === 'undefined' || typeof b === 'undefined') return false
		if (a === null || b === null) return false

		a = a.getBoundingClientRect()
		b = b.getBoundingClientRect()

		return !(
			a.x + a.width < b.x - settingsConfig.timeline.spacing ||
			a.x + settingsConfig.timeline.spacing > b.x + b.width
		)
	}

	useEffect(() => {
		const LEVEL_MIN = 1
		const LEVEL_MAX = 13
		for (let i = 0, items = bookmarksArr, level = LEVEL_MIN; i < items.length; i++) {
			const prevPrev = items[i - 2]
			const prev = items[i - 1]
			const current = items[i]

			let collision = false
			if (collisionCheck(prev, current)) {
				collision = true
			} else {
				// Check if bookmarks collide with previous items
				//> not doing this check, causes collision of level-1 items
				// j<i-1    >> EXPLANATION
				// j<i      >> Collision of previous element, caught by previous block
				// j<i-1    >> Collision of element before previous
				/*for (let j = 0; j < i - 1; j++) {
					if (collisionCheck(items[j], current)) {
						collision = true
					}
				}*/
				// this is faster, and can also be run in one loop
				// if run in one loop, it can also be combined with the next section, to make it even shorter
				if (collisionCheck(prevPrev, current)) collision = true
			}

			if (collision && level < LEVEL_MAX) {
				level++
			} else {
				level = LEVEL_MIN
			}

			current.setAttribute('data-level', `${level}`)
		}
	}, [bookmarksArr, useWindowSize().width])

	return (
		<div className='col-12' id='timeline'>
			{video.id !== 0
				? bookmarks.map((bookmark, i) => {
						const tooltip = bookmark.starID !== 0 || bookmark.attributes.length > 0

						return (
							<Fragment key={bookmark.id}>
								<ContextMenuTrigger id={`bookmark-${bookmark.id}`} holdToDisplay={-1}>
									<Button
										size='small'
										variant={isActive(bookmark) ? 'contained' : 'outlined'}
										color={hasStar(bookmark) ? 'primary' : 'secondary'}
										className='bookmark'
										style={{
											left: `${
												((bookmark.start * 100) / duration) * settingsConfig.timeline.offset
											}%`
										}}
										onClick={() => playVideo(bookmark.start)}
										ref={(item: HTMLButtonElement) => (bookmarksArr[i] = item)}
										data-level={1}
									>
										<div data-tip={tooltip} data-for={`bookmark-info-${bookmark.id}`}>
											{bookmark.name}
										</div>

										{tooltip ? (
											<ReactTooltip id={`bookmark-info-${bookmark.id}`} effect='solid'>
												{bookmark.starID !== 0 ? (
													<img
														alt='star'
														className='star__image'
														data-star-id={bookmark.starID}
														src={`${serverConfig.source}/star/${bookmark.starID}`}
													/>
												) : null}

												{bookmark.attributes
													.sort((a, b) => {
														if (isStarAttribute(bookmark.starID, a.id)) return -1
														else if (isStarAttribute(bookmark.starID, b.id)) return 1

														return a.name.localeCompare(b.name)
													})
													.map((attribute) => (
														<Button
															key={attribute.id}
															color='info'
															size='small'
															variant='contained'
															component='div'
															className='attribute btn'
														>
															{attribute.name}
														</Button>
													))}
											</ReactTooltip>
										) : null}
									</Button>
								</ContextMenuTrigger>

								<ContextMenu id={`bookmark-${bookmark.id}`}>
									<MenuItem
										disabled={bookmark.starID !== 0 || (bookmark.starID === 0 && !stars.length)}
										onClick={() => setStarEvent(true, bookmark)}
									>
										<i className={themeConfig.icons.add} /> Add Star
									</MenuItem>

									<MenuItem disabled={bookmark.starID === 0} onClick={() => removeStar(bookmark)}>
										<i className={themeConfig.icons.trash} /> Remove Star
									</MenuItem>

									<MenuItem divider />

									<MenuItem
										onClick={() => {
											handleModal(
												'Add Attribute',
												attributes
													.filter((attribute) => {
														const match = bookmark.attributes.some(
															(bookmarkAttribute) =>
																attribute.name === bookmarkAttribute.name
														)

														return !match ? attribute : null
													})
													.map((attribute) => (
														<Button
															key={attribute.id}
															variant='outlined'
															color='primary'
															onClick={() => {
																handleModal()
																addAttribute(attribute, bookmark)
															}}
														>
															{attribute.name}
														</Button>
													)),
												true
											)
										}}
									>
										<i className={themeConfig.icons.add} /> Add Attribute
									</MenuItem>

									<MenuItem
										disabled={
											attributesFromStar(bookmark.starID).length >= bookmark.attributes.length
										}
										onClick={() => {
											handleModal(
												'Remove Attribute',
												bookmark.attributes
													.filter((attribute) => {
														// only show attribute, if not from star
														if (isStarAttribute(bookmark.starID, attribute.id)) return null

														return attribute
													})
													.map((attribute) => (
														<Button
															key={attribute.id}
															variant='outlined'
															color='primary'
															onClick={() => {
																handleModal()
																removeAttribute(bookmark, attribute)
															}}
														>
															{attribute.name}
														</Button>
													)),
												true
											)
										}}
									>
										<i className={themeConfig.icons.trash} /> Remove Attribute
									</MenuItem>

									<MenuItem
										disabled={
											attributesFromStar(bookmark.starID).length >= bookmark.attributes.length
										}
										onClick={() => clearAttributes(bookmark)}
									>
										<i className={themeConfig.icons.trash} /> Clear Attributes
									</MenuItem>

									<MenuItem
										onClick={() => {
											handleModal(
												'Change Category',
												categories
													.filter((category) => category.name !== bookmark.name)
													.map((category) => (
														<Button
															key={category.id}
															variant='outlined'
															color='primary'
															onClick={() => {
																handleModal()
																setCategory(category, bookmark)
															}}
														>
															{category.name}
														</Button>
													)),
												true
											)
										}}
									>
										<i className={themeConfig.icons.edit} /> Change Category
									</MenuItem>

									<MenuItem onClick={() => setTime(bookmark.id)}>
										<i className={themeConfig.icons.clock} /> Change Time
									</MenuItem>

									<MenuItem onClick={() => removeBookmark(bookmark.id)}>
										<i className={themeConfig.icons.trash} /> Delete
									</MenuItem>
								</ContextMenu>
							</Fragment>
						)
				  })
				: null}
		</div>
	)
}

interface IStars {
	video: IVideo
	stars: IStar[]
	bookmarks: IBookmark[]
	attributes: IAttribute[]
	categories: ICategory[]
	clearActive: () => void
	updateBookmarks: (bookmarks: IBookmark[]) => void
}
const Stars = ({ video, stars, bookmarks, attributes, categories, clearActive, updateBookmarks }: IStars) => {
	const update = useContext(UpdateContext).stars

	const removeStar = (id: number) => {
		Axios.delete(`${serverConfig.api}/video/${video.id}/star/${id}`).then(() => {
			update([...stars].filter((star) => star.id !== id))
		})
	}

	useEffect(() => {
		update(
			[...stars].sort((a, b) => {
				const bookmarkTime = (star: IStar) =>
					bookmarks.find((bookmark) => bookmark.starID === star.id)?.start || Infinity

				return bookmarkTime(a) - bookmarkTime(b)
			})
		)
	}, [bookmarks])

	return (
		<Grid container justifyContent='center' id='stars'>
			{stars.map((star) => (
				<Star
					key={star.id}
					video={video}
					star={star}
					bookmarks={bookmarks}
					attributes={attributes}
					categories={categories}
					clearActive={clearActive}
					updateBookmarks={updateBookmarks}
					removeStar={removeStar}
				/>
			))}
		</Grid>
	)
}

const Star = ({
	video,
	star,
	bookmarks,
	attributes,
	categories,
	clearActive,
	updateBookmarks,
	removeStar
}: {
	video: IVideo
	star: IStar
	bookmarks: IBookmark[]
	attributes: IAttribute[]
	categories: ICategory[]
	clearActive: () => void
	updateBookmarks: (bookmarks: IBookmark[]) => void
	removeStar: any
}) => {
	const getStarEvent = useContext(GetStarEventContext)
	const setStarEvent = useContext(SetStarEventContext)

	const handleModal = useContext(ModalContext).method

	const [border, setBorder] = useState(false)

	const handleRibbon = (star: IStar) => {
		const hasBookmark = bookmarks.some((bookmark) => bookmark.starID === star.id)

		if (!hasBookmark) return <Ribbon label='NEW' />
	}

	const addBookmark = (category: ICategory, star: IStar) => {
		const player = document.getElementsByTagName('video')[0]

		const time = Math.round(player.currentTime)
		if (time) {
			Axios.post(`${serverConfig.api}/video/${video.id}/bookmark`, {
				categoryID: category.id,
				time,
				starID: star.id
			}).then(({ data }) => {
				let attributes = data.attributes
				if (typeof data.attributes === 'undefined') attributes = []

				updateBookmarks(
					[
						...bookmarks,
						{
							id: data.id,
							name: category.name,
							start: time,
							starID: star.id,
							attributes,
							active: false
						}
					].sort((a, b) => a.start - b.start)
				)
			})
		}
	}

	const addAttribute = (star: IStar, attribute: IAttribute) => {
		Axios.post(`${serverConfig.api}/bookmark/attribute`, {
			videoID: video.id,
			starID: star.id,
			attributeID: attribute.id
		}).then(() => {
			updateBookmarks(
				bookmarks.map((bookmark) => {
					if (bookmark.starID === star.id) {
						if (!bookmark.attributes.some((attr) => attr.id === attribute.id)) {
							bookmark.attributes.push(attribute)
						}
					}

					return bookmark
				})
			)
		})
	}

	const setActive = (star: IStar) => {
		updateBookmarks(
			bookmarks.map((bookmark) => {
				if (bookmark.starID === star.id) bookmark.active = true

				return bookmark
			})
		)
	}

	// TODO auto-run if only 1 star
	const addStar = (star: IStar) => {
		const bookmark = getStarEvent.data

		// Remove Border
		setBorder(false)
		setStarEvent(false, starEventData)

		// Check if bookmark already contains one of the attributes from the star
		bookmarks.forEach((item) => {
			if (item.id === bookmark.id) {
				const overlappingAttributes = item.attributes.some((bookmarkAttr) =>
					star.attributes.some((starAttr) => starAttr.id === bookmarkAttr.id)
				)

				// Bookmark has ZERO Overlapping Attributes
				if (!overlappingAttributes) {
					// Request Bookmark Update
					Axios.post(`${serverConfig.api}/bookmark/${bookmark.id}/star`, {
						starID: star.id
					}).then(() => {
						updateBookmarks(
							bookmarks.map((item) => {
								if (item.id === bookmark.id) {
									// MERGE bookmark-attributes with star-attributes
									item.attributes = item.attributes.concat(star.attributes)

									// SET starID
									item.starID = star.id
								}

								return item
							})
						)
					})
				}
			}
		})
	}

	return (
		<Flipped key={star.id} flipId={star.id}>
			<Grid
				item
				xs={4}
				onClick={getStarEvent.event ? () => addStar(star) : () => {}}
				onMouseEnter={getStarEvent.event ? () => setBorder(true) : () => setActive(star)}
				onMouseLeave={getStarEvent.event ? () => setBorder(false) : clearActive}
			>
				<ContextMenuTrigger id={`star-${star.id}`} holdToDisplay={-1}>
					<Card className={`ribbon-container star ${border ? 'star--active' : ''}`}>
						<CardMedia
							component='img'
							src={`${serverConfig.source}/images/stars/${star.id}.jpg`}
							alt='star'
							className='star__image'
						/>

						<Link to={`/star/${star.id}`} className='star__name'>
							<Typography>{star.name}</Typography>
						</Link>

						{handleRibbon(star)}
					</Card>
				</ContextMenuTrigger>

				<ContextMenu id={`star-${star.id}`}>
					<MenuItem
						onClick={() => {
							handleModal(
								'Add Bookmark',
								categories.map((category) => (
									<Button
										key={category.id}
										variant='outlined'
										color='primary'
										onClick={() => {
											handleModal()
											addBookmark(category, star)
										}}
									>
										{category.name}
									</Button>
								)),
								true
							)
						}}
					>
						<i className={themeConfig.icons.add} /> Add Bookmark
					</MenuItem>

					<MenuItem
						disabled={!bookmarks.some((bookmark) => bookmark.starID === star.id)}
						onClick={() => {
							handleModal(
								'Add Attribute',
								attributes
									.filter((attribute) => {
										const match = star.attributes.some((attr) => attr.id === attribute.id)

										return !match ? attribute : null
									})
									.map((attribute) => (
										<Button
											key={attribute.id}
											variant='outlined'
											color='primary'
											onClick={() => {
												handleModal()
												addAttribute(star, attribute)
											}}
										>
											{attribute.name}
										</Button>
									)),
								true
							)
						}}
					>
						<i className={themeConfig.icons.add} /> Add Attribute
					</MenuItem>

					<MenuItem
						disabled={bookmarks.some((bookmark) => bookmark.starID === star.id)}
						onClick={() => removeStar(star.id)}
					>
						<i className={themeConfig.icons.trash} /> Remove
					</MenuItem>
				</ContextMenu>
			</Grid>
		</Flipped>
	)
}

interface IStarInput {
	video: IVideo
	stars: IStar[]
	bookmarks: IBookmark[]
	getAttributes: () => IAttribute[]
}
const StarInput = ({ video, stars, bookmarks, getAttributes }: IStarInput) => {
	const updateVideo = useContext(UpdateContext).video
	const update = useContext(UpdateContext).stars

	const [input, setInput] = useState('')
	const [noStarToggle, setNoStarToggle] = useState(false)

	const handleNoStar = (checked: boolean) => {
		Axios.put(`${serverConfig.api}/video/${video.id}`, { noStar: checked }).then(({ data }) => {
			updateVideo({ ...video, noStar: data.noStar })
		})
	}

	const addStar = (name: string) => {
		if (input.length) {
			Axios.post(`${serverConfig.api}/video/${video.id}/star`, { name }).then(({ data }) => {
				update([...stars, { id: data.id, name, attributes: data.attributes }])
			})
		}
	}

	// if 'noStar' is updated outside this component
	useEffect(() => {
		if (video.noStar) setNoStarToggle(true)
	}, [video.noStar])

	return (
		<Grid container justifyContent='center'>
			{stars.length ? <Divider light /> : null}

			<Box id='stars-input'>
				<FormGroup row>
					<TextField
						className='form-group__item'
						variant='outlined'
						label='Star'
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
							if (e.key === 'Enter') {
								addStar(input)

								// Reset Input
								setInput('')

								// Reset focused state
								//@ts-ignore
								e.target.blur()
							}
						}}
						disabled={video.noStar === 1}
					/>

					<FormControlLabel
						className='form-group__item'
						label='No Star'
						control={
							<Checkbox
								checked={noStarToggle}
								onChange={(e, checked) => {
									// Update checked status
									setNoStarToggle(checked)

									handleNoStar(checked)
								}}
							/>
						}
						disabled={bookmarks.length > 0 || stars.length > 0}
					/>
				</FormGroup>
			</Box>

			<AddRelatedStars
				video={video}
				stars={stars}
				disabled={bookmarks.length > 0 || stars.length > 0 || noStarToggle}
			/>

			{getAttributes().length ? <Divider light /> : null}
		</Grid>
	)
}

const AddRelatedStars = ({ video, stars, disabled }: any) => {
	const update = useContext(UpdateContext).stars

	const [relatedStars, setRelatedStars] = useState<any>([])

	useEffect(() => {
		if (video.id !== 0) {
			Axios.get(`${serverConfig.api}/video/${video.id}/related/star`).then(({ data }) => {
				setRelatedStars(data)
			})
		}
	}, [video])

	if (disabled || relatedStars.length === 0) return null

	const addStar = async (name: string) => {
		return new Promise((resolve) => {
			Axios.post(`${serverConfig.api}/video/${video.id}/star`, { name }).then(({ data }) => {
				resolve({ id: data.id, name, attributes: data.attributes })
			})
		})
	}

	const handleClick = async () => {
		for (let star of relatedStars) {
			stars = [...stars, await addStar(star.name)]
		}

		update(stars)
	}

	return (
		<div style={{ width: '100%' }} className='text-center'>
			<Button size='small' variant='outlined' color='primary' onClick={handleClick}>
				Add Related Stars ({relatedStars.length})
			</Button>
		</div>
	)
}

const Franchise = ({ video }: { video: IVideo }) => {
	const shortenTitle = (title: string) => {
		//TODO use franchise as well, to only trim the franchise-part and not the episode-part

		if (title.length > settingsConfig.franchise.title.maxLength) {
			return title.slice(0, settingsConfig.franchise.title.maxLength - 3) + '...'
		}

		return title
	}

	return (
		<Box id='franchise'>
			{video.related.length > 1
				? video.related.map((item) => (
						<a href={`${item.id}`} key={item.id}>
							<Grid container component={Card} className='episode'>
								<Grid component={CardContent} className='episode__plays'>
									<Typography>{item.plays} plays</Typography>
								</Grid>

								<Grid item xs={2} className='episode__thumbnail'>
									<CardMedia
										component='img'
											src={`${serverConfig.source}/video/${item.id}/thumb`}
									/>
								</Grid>

								<Grid className='episode__title'>{shortenTitle(item.name)}</Grid>
							</Grid>
						</a>
				  ))
				: null}
		</Box>
	)
}

interface IAttributes {
	bookmarks: IBookmark[]
	clearActive: () => void
	update: (bookmarks: IBookmark[]) => void
	getAttributes: () => IAttribute[]
}
const Attributes = ({ bookmarks, clearActive, update, getAttributes }: IAttributes) => {
	const attribute_setActive = (attribute: IAttribute) => {
		update(
			bookmarks.map((bookmark) => {
				if (bookmark.attributes.some((bookmarkAttribute) => bookmarkAttribute.id === attribute.id))
					bookmark.active = true

				return bookmark
			})
		)
	}

	return (
		<Grid container justifyContent='center' id='attributes'>
			{getAttributes().map((attribute) => (
				<Button
					key={attribute.id}
					size='small'
					variant='outlined'
					color='primary'
					className='attribute'
					onMouseEnter={() => attribute_setActive(attribute)}
					onMouseLeave={clearActive}
				>
					{attribute.name}
				</Button>
			))}
		</Grid>
	)
}

const Header = ({ video }: { video: IVideo }) => {
	const update = useContext(UpdateContext).video

	return (
		<Grid container component='header' id='header'>
			<Grid item xs={11}>
				<HeaderTitle video={video} />

				<HeaderDate video={video} update={update} />
				<HeaderNetwork video={video} update={update} />

				<HeaderQuality video={video} />
			</Grid>

			<Grid item xs={1}>
				<HeaderNext video={video} />
			</Grid>
		</Grid>
	)
}

// ContainerItem
const HeaderTitle = ({ video }: { video: IVideo }) => {
	const handleModal = useContext(ModalContext).method

	const copyFranchise = async () => await navigator.clipboard.writeText(video.franchise)

	const renameFranchise = (value: string) => {
		Axios.put(`${serverConfig.api}/video/${video.id}`, { franchise: value }).then(() => {
			window.location.reload()

			//TODO use stateObj instead
		})
	}

	const renameTitle = (value: string) => {
		Axios.put(`${serverConfig.api}/video/${video.id}`, { title: value }).then(() => {
			window.location.reload()

			//TODO use stateObj instead
		})
	}

	return (
		<Typography variant='h4' id='header__title'>
			<div className='d-inline-block'>
				<ContextMenuTrigger id='title' holdToDisplay={-1}>
					{video.name}
				</ContextMenuTrigger>
			</div>

			<ContextMenu id='title'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Change Title',
							<TextField
								defaultValue={video.name}
								autoFocus
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleModal()

										//@ts-ignore
										renameTitle(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={themeConfig.icons.edit} /> Rename Title
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Change Franchise',
							<TextField
								defaultValue={video.franchise}
								autoFocus
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleModal()

										//@ts-ignore
										renameFranchise(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={themeConfig.icons.edit} /> Rename Franchise
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copyFranchise}>
					<i className={themeConfig.icons.copy} /> Copy Franchise
				</MenuItem>
			</ContextMenu>

			<span id='header__censored'>
				{video.censored ? (
					<>
						<span id='divider'>-</span>
						<span className='label'>Censored</span>
					</>
				) : null}
			</span>
		</Typography>
	)
}

interface IHeaderDate {
	video: IVideo
	update: (video: IVideo) => void
}
const HeaderDate = ({ video, update }: IHeaderDate) => {
	const handleModal = useContext(ModalContext).method

	const handleDate = (value: string) => {
		Axios.put(`${serverConfig.api}/video/${video.id}`, { date: value }).then(({ data }) => {
			update({ ...video, date: { ...video.date, published: data.date_published } })
		})
	}

	return (
		<>
			<ContextMenuTrigger id='menu__date' renderTag='span' holdToDisplay={-1}>
				<Button size='small' variant='outlined' id='header__date'>
					<i className={themeConfig.icons.calendar} />
					<span className={video.date.published ? '' : 'no-label'}>{video.date.published}</span>
				</Button>
			</ContextMenuTrigger>

			<ContextMenu id='menu__date'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Change Date',
							<TextField
								autoFocus
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleModal()

										//@ts-ignore
										handleDate(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={themeConfig.icons.edit} /> Edit Date
				</MenuItem>
			</ContextMenu>
		</>
	)
}

interface IHeaderNetwork {
	video: IVideo
	update: (video: IVideo) => void
}
const HeaderNetwork = ({ video, update }: IHeaderNetwork) => {
	const handleModal = useContext(ModalContext).method

	const handleNetwork = (value: string) => {
		Axios.put(`${serverConfig.api}/video/${video.id}`, { brand: value }).then(() => {
			update({ ...video, brand: value })
		})
	}

	return (
		<>
			<ContextMenuTrigger id='menu_network' renderTag='span' holdToDisplay={-1}>
				<Button size='small' variant='outlined' id='header__network'>
					<i className={themeConfig.icons.brand} />
					<span className={video.brand ? '' : 'no-label'}>{video.brand}</span>
				</Button>
			</ContextMenuTrigger>

			<ContextMenu id='menu_network'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Change Network',
							<TextField
								autoFocus
								defaultValue={video.brand}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										handleModal()

										//@ts-ignore
										handleNetwork(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={themeConfig.icons.edit} /> Edit Network
				</MenuItem>
			</ContextMenu>
		</>
	)
}

const HeaderNext = ({ video }: { video: IVideo }) => (
	<Box id='header__next'>
		<a id='next' href={`${video.nextID}`}>
			<Button size='small' variant='outlined'>
				Next
			</Button>
		</a>
	</Box>
)

const HeaderQuality = ({ video }: { video: IVideo }) => (
	<Button size='small' variant='outlined' id='header__quality'>
		<i className={themeConfig.icons.film} />
		{video.quality}
	</Button>
)

export default VideoPage
