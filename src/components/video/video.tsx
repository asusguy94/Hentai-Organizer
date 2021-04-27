import React, { Component, Fragment, useEffect, useState, useContext, createContext } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'
//@ts-ignore
import { PlyrComponent as Plyr } from 'plyr-react'
import Hls from 'hls.js'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import ReactTooltip from 'react-tooltip'
//@ts-ignore
import KeyboardEventHandler from 'react-keyboard-event-handler'
import Autosizeinput from 'react-input-autosize'

import Modal, { IModal } from '../modal/modal'
import Ribbon from '../ribbon/ribbon'
import { setFocus, useRefWithEffect } from '../../hooks'

import './video.scss'

import config from '../config.json'

import { IVideo, IAttribute, ICategory, IVideoStar as IStar, IBookmark, IKeyPress } from '../../interfaces'

const ModalContext = createContext({
	method: (...args: any): void => {},
	data: { visible: false, title: null, data: null, filter: false }
})
const UpdateContext = createContext({
	video: (video: any): void => {},
	stars: (stars: any[]): void => {},
	bookmarks: (bookmarks: any[]): void => {}
})

const starEventData = { id: 0, name: '', starID: 0, start: 0, active: false, attributes: [] }
const SetStarEventContext = createContext((...args: any): void => {})
const GetStarEventContext = createContext({
	event: false,
	data: starEventData
})

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
				stream: ''
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
		},
		stars: [],
		bookmarks: [],
		categories: [],
		attributes: [],
		modal: {
			visible: false,
			title: null,
			data: null,
			filter: false
		},
		addStarEvent: {
			event: false,
			data: starEventData
		}
	}

	handleKeyPress(key: string, e: IKeyPress) {
		e.preventDefault()

		switch (key) {
			case 'tab':
				window.location.href = this.state.video.nextID ? `${this.state.video.nextID}` : '/video'
				break
			default:
				console.log(`${key} was pressed`)
		}
	}

	handleModal(title = null, data = null, filter = false) {
		if (title !== null && data !== null && this.state.modal.visible) this.handleModal()

		this.setState(({ modal }: { modal: IModal }) => {
			modal.title = title
			modal.data = data
			modal.visible = !modal.visible
			modal.filter = filter

			return { modal }
		})
	}

	handleAddStarEvent(event: boolean, data: any = this.state.addStarEvent.data) {
		const preEvent = this.state.addStarEvent
		preEvent.event = event
		preEvent.data = data

		this.setState({ addStarEvent: preEvent })
	}

	render() {
		return (
			<div id='video-page' className='col-12 row'>
				<ModalContext.Provider
					value={{
						method: (title: any, data: any, filter: boolean) => this.handleModal(title, data, filter),
						data: this.state.modal
					}}
				>
					<UpdateContext.Provider
						value={{
							bookmarks: (bookmarks: IBookmark[]) => this.setState({ bookmarks }),
							video: (video: IVideo[]) => this.setState({ video }),
							stars: (stars: IStars[]) => this.setState({ stars })
						}}
					>
						<SetStarEventContext.Provider
							value={(event: boolean, data: any = this.state.addStarEvent.data) =>
								this.handleAddStarEvent(event, data)
							}
						>
							<GetStarEventContext.Provider value={this.state.addStarEvent}>
						<Section
							video={this.state.video}
							bookmarks={this.state.bookmarks}
							categories={this.state.categories}
							attributes={this.state.attributes}
							stars={this.state.stars}
									updateBookmarks={(bookmarks: IBookmark[]) => this.setState({ bookmarks })}
						/>

						<Sidebar
							video={this.state.video}
							stars={this.state.stars}
							bookmarks={this.state.bookmarks}
							attributes={this.state.attributes}
							categories={this.state.categories}
									updateBookmarks={(bookmarks: IBookmark[]) => this.setState({ bookmarks })}
						/>
							</GetStarEventContext.Provider>
						</SetStarEventContext.Provider>

						<Modal
							visible={this.state.modal.visible}
							title={this.state.modal.title}
							filter={this.state.modal.filter}
							onClose={() => this.handleModal()}
						>
							{this.state.modal.data}
						</Modal>

						<KeyboardEventHandler
							handleKeys={['tab']}
							onKeyEvent={(key: string, e: IKeyPress) => this.handleKeyPress(key, e)}
							handleFocusableElements={true}
						/>
					</UpdateContext.Provider>
				</ModalContext.Provider>
			</div>
		)
	}

	componentDidMount() {
		const props: any = this.props
		const { id } = props.match.params

		Axios.get(`${config.api}/video/${id}`).then(({ data: video }) => this.setState({ video }))

		Axios.get(`${config.api}/video/${id}/bookmark`).then(({ data: bookmarks }) => {
			bookmarks.map((bookmark: IBookmark) => (bookmark.active = false))

			this.setState({ bookmarks })
		})

		Axios.get(`${config.api}/video/${id}/star`).then(({ data: stars }) => this.setState({ stars }))
		Axios.get(`${config.api}/category`).then(({ data: categories }) => this.setState({ categories }))
		Axios.get(`${config.api}/attribute/video`).then(({ data: attributes }) => this.setState({ attributes }))
	}
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

	const setTime = (bookmarkID: number) => {
		const time = Math.round(getPlayer().currentTime)

		Axios.put(`${config.api}/bookmark/${bookmarkID}`, { time }).then(() => {
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
		<section className='col-9'>
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
		</section>
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
		<aside className='col-3'>
			<Franchise video={video} />

			<div id='stars' className='row justify-content-center'>
				<Stars
					video={video}
					stars={stars}
					bookmarks={bookmarks}
					attributes={attributes}
					categories={categories}
					clearActive={clearActive}
					updateBookmarks={updateBookmarks}
				/>

				<StarInput video={video} stars={stars} bookmarks={bookmarks} getAttributes={getAttributes} />
			</div>

			<Attributes
				bookmarks={bookmarks}
				clearActive={clearActive}
				update={updateBookmarks}
				getAttributes={getAttributes}
			/>
		</aside>
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

	let playAdded = false

	const getPlayer = () => playerValue?.player

	useEffect(() => {
		if (playerValue !== undefined) {
			if (Number(localStorage.video) === video.id) {
				setNewVideo(false)
			} else {
				setNewVideo(true)
			}
			setEvents(true)
		}
	}, [playerValue])

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

					Axios.put(`${config.api}/video/${video.id}`, { plays: 1 })
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

			if (Hls.isSupported() && config.hls.enabled) {
				const hls = new Hls({ autoStartLoad: false })
				hls.loadSource(`${config.source}/videos/${video.path.stream}`)
				hls.attachMedia(player.media)

				hls.on(Hls.Events.MANIFEST_PARSED, (e, data) => {
					const dataLevels = data['levels'].length - 1

					const levels: { [key: string]: number } = config.hls.levels
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
				hls.on(Hls.Events.LEVEL_LOADED, (e, data) => updateDuration(data.details.totalduration))
			} else {
				player.media.ondurationchange = (e: any) => updateDuration(e.target.duration)
			}
		}
	}, [events])

	const handleWheel = (e: React.WheelEvent) => (getPlayer().currentTime += 10 * Math.sign(e.deltaY) * -1)
	const copy = async () => await navigator.clipboard.writeText(video.path.file)

	const resetPlays = () => {
		Axios.put(`${config.api}/video/${video.id}`, { plays: 0 }).then(() => window.location.reload())
	}

	const deleteVideo = () => {
		Axios.delete(`${config.source}/video/${video.id}`).then(() => {
			window.location.href = '/video'
		})
	}

	const renameVideo = (path: string) => {
		Axios.put(`${config.source}/video/${video.id}`, { path }).then(() => window.location.reload())
	}

	const censorToggle = () => {
		Axios.put(`${config.api}/video/${video.id}`, { cen: !video.censored }).then(() => {
			video.censored = !video.censored

			update(video)
		})
	}

	const updateVideo = () => {
		Axios.put(`${config.source}/video/${video.id}`).then(() => window.location.reload())
	}

	const addBookmark = (category: ICategory) => {
		const time = Math.round(getPlayer().currentTime)
		if (time) {
			Axios.post(`${config.api}/video/${video.id}/bookmark`, {
				categoryID: category.id,
				time
			}).then(({ data }) => {
				let attributes = data.attributes
				if (typeof data.attributes === 'undefined') attributes = []

				bookmarks.push({
					id: data.id,
					name: category.name,
					start: time,
					starID: 0,
					attributes,
					active: false
				})
				bookmarks.sort((a, b) => a.start - b.start)

				updateBookmarks(bookmarks)
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
							hideControls: false,
							ratio: '21:9',
							keyboard: { focused: false, global: false }
						}}
						sources={{
							type: 'video',
							sources: [
								{
									src: `${config.source}/videos/${video.path.stream}`,
									type: 'application/x-mpegURL'
								},
								{
									src: `${config.source}/videos/${video.path.file}`,
									type: 'video/mp4'
								}
							]
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
									<div
										key={category.id}
										className='btn btn-sm btn-outline-primary d-block'
										onClick={() => {
											handleModal()
											addBookmark(category)
										}}
									>
										{category.name}
									</div>
								)
							}),
							true
						)
					}}
				>
					<i className={config.theme.icons.add} /> Add Bookmark
				</MenuItem>

				<MenuItem onClick={censorToggle}>
					{video.censored ? (
						<>
							<i className={config.theme.icons['toggle-yes']} /> UnCensor
						</>
					) : (
						<>
							<i className={config.theme.icons['toggle-no']} /> Censor
						</>
					)}
				</MenuItem>
				<MenuItem onClick={resetPlays}>
					<i className={config.theme.icons.trash} /> Remove Plays
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Rename Video',
							<Autosizeinput
								type='text'
								className='input__container--autosize'
								inputClassName='input--autosize'
								defaultValue={video.path.file}
								ref={setFocus}
								onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
									if (e.key === 'Enter') {
										e.preventDefault()

										handleModal()
										renameVideo(e.currentTarget.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={config.theme.icons.edit} /> Rename Video
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copy}>
					<i className={config.theme.icons.copy} /> Copy Filename
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={updateVideo}>
					<i className={config.theme.icons.edit} /> Update Video
				</MenuItem>

				<MenuItem divider />

				<MenuItem disabled={stars.length !== 0} onClick={deleteVideo}>
					<i className={config.theme.icons.trash} /> Delete Video
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
	setTime: (bookmarkID: number) => void
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

	if (duration && video.duration) {
		if (Math.abs(duration - video.duration) > 3) {
			alert('invalid video-duration')

			console.log('dur', duration)
			console.log('vDur', video.duration)

			console.log('Re-Transcode to fix this issue')
		}
	}

	const bookmarksArr: HTMLElement[] = []

	const isActive = (bookmark: IBookmark) => Boolean(bookmark.active)
	const hasStar = (bookmark: IBookmark) => Boolean(bookmark.starID)
	const attributesFromStar = (starID: number) =>
		stars.filter((star) => (star.id === starID ? star : null))[0]?.attributes
	const isStarAttribute = (starID: number, attributeID: number) =>
		attributesFromStar(starID)?.some((attr) => attr.id === attributeID)

	const removeBookmark = (id: number) => {
		Axios.delete(`${config.api}/bookmark/${id}`).then(() => {
			update(bookmarks.filter((bookmark) => bookmark.id !== id))
		})
	}

	const setCategory = (category: ICategory, bookmark: IBookmark) => {
		Axios.put(`${config.api}/bookmark/${bookmark.id}`, { categoryID: category.id }).then(() => {
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
		Axios.post(`${config.api}/bookmark/attribute/`, { bookmarkID: bookmark.id, attributeID: attribute.id }).then(
			() => {
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
			}
		)
	}

	const clearAttributes = (bookmark: IBookmark) => {
		Axios.delete(`${config.api}/bookmark/${bookmark.id}/attribute`).then(() => {
			update(
				bookmarks.map((item) => {
				if (item.id === bookmark.id) {
					const starID = bookmark.starID

					if (starID !== 0) {
						const attributes = attributesFromStar(starID)

						if (item.attributes.length > attributes.length) {
							item.attributes = item.attributes.filter((attribute) => {
								const match = attributes.some(
									(bookmarkAttribute) => bookmarkAttribute.name === attribute.name
								)

								return match ? attribute : null
							})
						}
					} else {
						// bookmark does not have a star
						item.attributes = []
					}
				}

				return item
			})
			)
		})
	}

	const removeStar = (bookmark: IBookmark) => {
		Axios.delete(`${config.api}/bookmark/${bookmark.id}/star`).then(() => {
			update(
				bookmarks.map((item) => {
				if (item.id === bookmark.id) {
					const attributes = attributesFromStar(bookmark.starID)

					if (item.attributes.length > attributes.length) {
						// Bookmark have at least 1 attribute not from star
						item.attributes = item.attributes.filter((attribute) => {
							const match = attributes.some((starAttribute) => starAttribute.name === attribute.name)

							if (!match) return attribute
							return null
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

		return !(a.x + a.width < b.x - config.timeline.spacing || a.x + config.timeline.spacing > b.x + b.width)
	}

	useEffect(() => {
		const LEVEL_MIN = 1
		const LEVEL_MAX = 10
		for (let i = 0, items = bookmarksArr, level = LEVEL_MIN; i < items.length; i++) {
			let collision = false

			const prev = items[i - 1]
			const current = items[i]

			if (collisionCheck(prev, current)) {
				collision = true
			}

			if (collision && level < LEVEL_MAX) {
				level++
			} else {
				level = LEVEL_MIN
			}

			current.setAttribute('data-level', `${level}`)
		}
	}, [bookmarksArr])

	return (
		<div className='col-12' id='timeline'>
			{video.id !== 0
				? bookmarks.map((bookmark, i) => (
						<Fragment key={bookmark.id}>
							<ContextMenuTrigger id={`bookmark-${bookmark.id}`}>
								<div
									className={`btn btn-sm ${
										isActive(bookmark)
											? 'btn-info'
											: hasStar(bookmark)
											? 'btn-outline-primary'
											: 'btn-outline-secondary'
									} bookmark`}
									style={{
										left: `${((bookmark.start * 100) / duration) * config.timeline.offset}%`
									}}
									onClick={() => playVideo(bookmark.start)}
									ref={(item: HTMLDivElement) => (bookmarksArr[i] = item)}
									data-level={1}
								>
									<div data-tip={true} data-for={`bookmark-info-${bookmark.id}`}>
										{bookmark.name}
									</div>

									{bookmark.starID !== 0 || bookmark.attributes.length > 0 ? (
										<ReactTooltip id={`bookmark-info-${bookmark.id}`} effect='solid'>
											{bookmark.starID !== 0 ? (
												<img
													alt='star'
													className='star__image'
													data-star-id={bookmark.starID}
													src={`${config.source}/images/stars/${bookmark.starID}.jpg`}
												/>
											) : null}

											{bookmark.attributes
												.sort((a, b) => {
													if (isStarAttribute(bookmark.starID, a.id)) return -1
													else if (isStarAttribute(bookmark.starID, b.id)) return 1

													return a.name.localeCompare(b.name)
												})
												.map((attribute) => (
													<div key={attribute.id} className='attribute btn btn-sm btn-light'>
														{attribute.name}
													</div>
												))}
										</ReactTooltip>
									) : null}
								</div>
							</ContextMenuTrigger>

							<ContextMenu id={`bookmark-${bookmark.id}`}>
								<MenuItem
									disabled={bookmark.starID !== 0 || (bookmark.starID === 0 && !stars.length)}
									onClick={() => setStarEvent(true, bookmark)}
								>
									<i className={config.theme.icons.add} /> Add Star
								</MenuItem>

								<MenuItem disabled={bookmark.starID === 0} onClick={() => removeStar(bookmark)}>
									<i className={config.theme.icons.trash} /> Remove Star
								</MenuItem>

								<MenuItem divider />

								<MenuItem
									onClick={() => {
										handleModal(
											'Add Attribute',
											attributes
												.filter((attribute) => {
													const match = bookmark.attributes.some(
														(bookmarkAttribute) => attribute.name === bookmarkAttribute.name
													)

													return !match ? attribute : null
												})
												.map((attribute) => (
													<div
														key={attribute.id}
														className='btn btn-sm btn-outline-primary d-block w-auto'
														onClick={() => {
															handleModal()
															addAttribute(attribute, bookmark)
														}}
													>
														{attribute.name}
													</div>
												)),
											true
										)
									}}
								>
									<i className={config.theme.icons.add} /> Add Attribute
								</MenuItem>

								<MenuItem
									disabled={bookmark.attributes.length === 0}
									onClick={() => clearAttributes(bookmark)}
								>
									<i className={config.theme.icons.trash} /> Clear Attributes
								</MenuItem>

								<MenuItem
									onClick={() => {
										handleModal(
											'Change Category',
											categories
												.filter((category) => category.name !== bookmark.name)
												.map((category) => (
													<div
														key={category.id}
														className='btn btn-outline-primary d-block w-auto'
														onClick={() => {
															handleModal()
															setCategory(category, bookmark)
														}}
													>
														{category.name}
													</div>
												)),
											true
										)
									}}
								>
									<i className={config.theme.icons.edit} /> Change Category
								</MenuItem>

								<MenuItem onClick={() => setTime(bookmark.id)}>
									<i className={config.theme.icons.clock} /> Change Time
								</MenuItem>

								<MenuItem onClick={() => removeBookmark(bookmark.id)}>
									<i className={config.theme.icons.trash} /> Delete
								</MenuItem>
							</ContextMenu>
						</Fragment>
				  ))
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
		Axios.delete(`${config.api}/video/${video.id}/star/${id}`).then(() => {
			update(stars.filter((star) => star.id !== id))
		})
	}

	return (
		<>
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
		</>
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
			Axios.post(`${config.api}/video/${video.id}/bookmark`, {
				categoryID: category.id,
				time,
				starID: star.id
			}).then(({ data }) => {
				let attributes = data.attributes
				if (typeof data.attributes === 'undefined') attributes = []

				bookmarks.push({
					id: data.id,
					name: category.name,
					start: time,
					starID: star.id,
					attributes,
					active: false
				})

				bookmarks.sort((a, b) => a.start - b.start)
				updateBookmarks(bookmarks)
			})
		}
	}

	const addAttribute = (star: IStar, attribute: IAttribute) => {
		Axios.post(`${config.api}/bookmark/attribute`, {
			videoID: video.id,
			starID: star.id,
			attributeID: attribute.id
		}).then(() => {
			window.location.reload()
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
		Axios.post(`${config.api}/bookmark/${bookmark.id}/star`, {
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
		<div
			className={`star col-4 ${border ? 'star--active' : ''}`}
			onClick={getStarEvent.event ? () => addStar(star) : () => {}}
			onMouseEnter={getStarEvent.event ? () => setBorder(true) : () => setActive(star)}
			onMouseLeave={getStarEvent.event ? () => setBorder(false) : clearActive}
		>
			<div className='card mb-2 ribbon-container'>
				<ContextMenuTrigger id={`star-${star.id}`}>
					<img
						className='star__image card-img-top'
						alt='star'
						src={`${config.source}/images/stars/${star.id}.jpg`}
					/>

					<Link to={`/star/${star.id}`} className='star__name d-block'>
						{star.name}
					</Link>

					{handleRibbon(star)}
				</ContextMenuTrigger>
			</div>

			<ContextMenu id={`star-${star.id}`}>
				<MenuItem
					onClick={() => {
						handleModal(
							'Add Bookmark',
							categories.map((category) => (
								<div
									key={category.id}
									className='btn btn-sm btn-outline-primary d-block w-auto'
									onClick={() => {
										handleModal()
										addBookmark(category, star)
									}}
								>
									{category.name}
								</div>
							)),
							true
						)
					}}
				>
					<i className={config.theme.icons.add} /> Add Bookmark
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
									<div
										key={attribute.id}
										className='btn btn-sm btn-outline-primary d-block w-auto'
										onClick={() => {
											handleModal()
											addAttribute(star, attribute)
										}}
									>
										{attribute.name}
									</div>
								)),
							true
						)
					}}
				>
					<i className={config.theme.icons.add} /> Add Attribute
				</MenuItem>

				<MenuItem
					disabled={bookmarks.some((bookmark) => bookmark.starID === star.id)}
					onClick={() => removeStar(star.id)}
				>
					<i className={config.theme.icons.trash} /> Remove
				</MenuItem>
			</ContextMenu>
		</div>
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

	const handleNoStar = (e: React.ChangeEvent<HTMLInputElement>) => {
		Axios.put(`${config.api}/video/${video.id}`, { noStar: e.target.checked }).then(({ data }) => {
			video.noStar = data.noStar

			updateVideo(video)
		})
	}

	const addStar = (name: string) => {
		Axios.post(`${config.api}/video/${video.id}/star`, { name }).then(({ data }) => {
			stars.push({ id: data.id, name, attributes: data.attributes })

			update(stars)
		})
	}

	return (
		<div className='col-12 mt-2'>
			{stars.length ? <hr className='mx-auto' /> : null}

			<div className='row justify-content-center align-items-center'>
				<label htmlFor='add-star' className='col-1 col-form-label'>
					Star
				</label>
				<div className='col-5'>
					<input
						type='text'
						id='add-star'
						className='form-control'
						onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
							if (e.key === 'Enter') {
								e.preventDefault()

								addStar(e.currentTarget.value)

								e.currentTarget.value = ''
							}
						}}
						disabled={video.noStar === 1}
					/>
				</div>

				<div className='form-check col-2'>
					<label htmlFor='no-star' className='form-check-label'>
						No Star
					</label>

					<input
						type='checkbox'
						name='no-star'
						id='no-star'
						className='form-check-input'
						onChange={handleNoStar}
						checked={video.noStar === 1}
						disabled={bookmarks.length > 0 || stars.length > 0}
					/>
				</div>
			</div>

			{getAttributes().length ? <hr className='mx-auto' /> : null}
		</div>
	)
}

const Franchise = ({ video }: { video: IVideo }) => (
	<div id='franchise'>
		{video.related.length > 1
			? <h2>Episodes</h2> &&
			  video.related.map((item) => (
					<a className='episode row' href={`/video/${item.id}`} key={item.id}>
						<span className='episode__plays col-2'>{item.plays} Plays</span>

						<img
							className='episode__thumbnail col-2'
							src={`${config.source}/images/videos/${item.id}-290.jpg`}
							alt='thumbnail'
						/>

						<span className='episode__title col-8'>
							{item.name.length > config.franchise.title.maxLength
								? item.name.slice(0, config.franchise.title.maxLength - 3) + '...'
								: item.name}
						</span>
					</a>
			  ))
			: null}
	</div>
)

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
		<div id='attributes' className='row col-12 justify-content-center'>
			{getAttributes().map((attribute) => (
				<div
					key={attribute.id}
					className='btn btn-outline-primary m-2 attribute w-auto'
					onMouseEnter={() => attribute_setActive(attribute)}
					onMouseLeave={clearActive}
				>
					{attribute.name}
				</div>
			))}
		</div>
	)
}

const Header = ({ video }: { video: IVideo }) => {
	const handleModal = useContext(ModalContext).method
	const update = useContext(UpdateContext).video

	const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>, callback: (value: string) => void) => {
		if (e.key === 'Enter') {
			e.preventDefault()

			handleModal()
			callback(e.currentTarget.value)
		}
	}

	return (
		<header className='header row'>
			<div className='col-11'>
				<HeaderTitle video={video} handleModal={handleModal} handleKeyPress={handleKeyPress} />

				<HeaderDate video={video} handleModal={handleModal} handleKeyPress={handleKeyPress} update={update} />

				<HeaderQuality video={video} />
			</div>

			<HeaderNext video={video} />
		</header>
	)
}

// ContainerItem
interface IHeaderTitle {
	video: IVideo
	handleModal: (title: any, data: any, filter?: any) => void
	handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, callback: (value: string) => void) => void
}
const HeaderTitle = ({ video, handleModal, handleKeyPress }: IHeaderTitle) => {
	const copyFranchise = async () => await navigator.clipboard.writeText(video.franchise)

	const renameFranchise = (value: string) => {
		Axios.put(`${config.api}/video/${video.id}`, { franchise: value }).then(() => {
			window.location.reload()
		})
	}

	const renameTitle = (value: string) => {
		Axios.put(`${config.api}/video/${video.id}`, { title: value }).then(() => {
			window.location.reload()
		})
	}

	return (
		<h1 className='header__title h2 align-middle'>
			<div className='d-inline-block align-middle'>
				<ContextMenuTrigger id='title'>{video.name}</ContextMenuTrigger>
			</div>

			<ContextMenu id='title'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Change Title',
							<Autosizeinput
								type='text'
								className='input__container--autosize'
								inputClassName='input--autosize'
								defaultValue={video.name}
								ref={setFocus}
								onKeyDown={(e) => handleKeyPress(e, renameTitle)}
							/>
						)
					}}
				>
					<i className={config.theme.icons.edit} /> Rename Title
				</MenuItem>

				<MenuItem
					onClick={() => {
						handleModal(
							'Change Franchise',
							<Autosizeinput
								type='text'
								className='input__container--autosize'
								inputClassName='input--autosize'
								defaultValue={video.franchise}
								ref={setFocus}
								onKeyDown={(e) => handleKeyPress(e, renameFranchise)}
							/>
						)
					}}
				>
					<i className={config.theme.icons.edit} /> Rename Franchise
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copyFranchise}>
					<i className={config.theme.icons.copy} /> Copy Franchise
				</MenuItem>
			</ContextMenu>

			<small className='header__censored text-muted'>
				{video.censored ? <span className='label'>Censored</span> : null}
			</small>
		</h1>
	)
}

interface IHeaderDate {
	video: IVideo
	handleModal: (title: string, data: React.ReactNode, filter?: boolean) => void
	handleKeyPress: (e: React.KeyboardEvent<HTMLInputElement>, callback: (value: string) => void) => void
	update: (video: IVideo) => void
}
const HeaderDate = ({ video, handleModal, handleKeyPress, update }: IHeaderDate) => {
	const handleDate = (value: string) => {
		Axios.put(`${config.api}/video/${video.id}`, { date: value }).then(({ data }) => {
			video.date.published = data.date_published

			update(video)
		})
	}

	return (
		<>
			<ContextMenuTrigger id='menu__date' renderTag='span'>
				<div className='header__date btn btn-sm btn-outline-primary'>
					<i className={config.theme.icons.calendar} />
					{video.date.published}
				</div>
			</ContextMenuTrigger>

			<ContextMenu id='menu__date'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Change Time',
							<input type='text' ref={setFocus} onKeyDown={(e) => handleKeyPress(e, handleDate)} />
						)
					}}
				>
					<i className={config.theme.icons.edit} />
					Edit Date
				</MenuItem>
			</ContextMenu>
		</>
	)
}

const HeaderNext = ({ video }: { video: IVideo }) => (
	<div className='col-1 header__next'>
		<a className='btn btn-sm btn-outline-primary float-end' id='next' href={`/video/${video.nextID}`}>
			Next
		</a>
	</div>
)

const HeaderQuality = ({ video }: { video: IVideo }) => (
	<div className='header__quality btn btn-sm btn-outline-primary'>
		<i className={config.theme.icons.film} />
		{video.quality}
	</div>
)

export default VideoPage
