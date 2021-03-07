import { Component, Fragment, useEffect, useState, useContext, createContext } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'
import { PlyrComponent as Plyr } from 'plyr-react'
import Hls from 'hls.js'
import { ContextMenu, ContextMenuTrigger, MenuItem } from 'react-contextmenu'
import ReactTooltip from 'react-tooltip'
import KeyboardEventHandler from 'react-keyboard-event-handler'
import Autosizeinput from 'react-input-autosize'

import Modal from '../modal/modal'
import Ribbon from '../ribbon/ribbon'
import { setFocus, useRefWithEffect } from '../../hooks'

import './video.scss'

import config from '../config.json'

const ModalContext = createContext(null)
const UpdateContext = createContext({})

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
		}
	}

	handleKeyPress(key, e) {
		if (e.target.tagName === 'INPUT') return
		e.preventDefault()

		switch (key) {
			case 'tab':
				// TODO use state instead of window
				window.location.href = this.state.video.nextID ? this.state.video.nextID : '/video'
				break
			default:
				console.log(`${key} was pressed`)
		}
	}

	handleModal(title = null, data = null, filter = false) {
		if (title !== null && data !== null && this.state.modal.visible) this.handleModal()

		this.setState(({ modal }) => {
			modal.title = title
			modal.data = data
			modal.visible = !modal.visible
			modal.filter = filter

			return { modal }
		})
	}

	render() {
		return (
			<div id='video-page' className='col-12 row'>
				<ModalContext.Provider value={(title, data, filter) => this.handleModal(title, data, filter)}>
					<UpdateContext.Provider
						value={{
							bookmarks: bookmarks => this.setState({ bookmarks }),
							video: video => this.setState({ video }),
							stars: stars => this.setState({ stars })
						}}
					>
						<Section
							video={this.state.video}
							bookmarks={this.state.bookmarks}
							categories={this.state.categories}
							attributes={this.state.attributes}
							stars={this.state.stars}
							updateBookmarks={bookmarks => this.setState({ bookmarks })}
						/>

						<Sidebar
							video={this.state.video}
							stars={this.state.stars}
							bookmarks={this.state.bookmarks}
							attributes={this.state.attributes}
							categories={this.state.categories}
							updateBookmarks={bookmarks => this.setState({ bookmarks })}
						/>

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
							onKeyEvent={(key, e) => this.handleKeyPress(key, e)}
							handleFocusableElements={true}
						/>
					</UpdateContext.Provider>
				</ModalContext.Provider>
			</div>
		)
	}

	componentDidMount() {
		const { id } = this.props.match.params

		Axios.get(`${config.api}/video/${id}`).then(({ data: video }) => this.setState({ video }))

		Axios.get(`${config.api}/video/${id}/bookmark`).then(({ data: bookmarks }) => {
			bookmarks.map(bookmark => (bookmark.active = false))

			this.setState({ bookmarks })
		})

		Axios.get(`${config.api}/video/${id}/star`).then(({ data: stars }) => this.setState({ stars }))
		Axios.get(`${config.api}/category`).then(({ data: categories }) => this.setState({ categories }))
		Axios.get(`${config.api}/attribute/video`).then(({ data: attributes }) => this.setState({ attributes }))
	}
}

// Wrapper
const Section = ({ video, bookmarks, categories, attributes, stars, updateBookmarks }) => {
	const [playerRef, ref] = useRefWithEffect()

	// Helper script for getting the player
	const getPlayer = () => ref.player

	const playVideo = (time = null) => {
		const player = getPlayer()

		if (time === null) time = player.currentTime
		player.currentTime = Number(time)
		player.play()
	}

	const setTime = bookmarkID => {
		const time = Math.round(getPlayer().currentTime)

		Axios.put(`${config.api}/bookmark/${bookmarkID}`, { time }).then(() => {
			bookmarks = bookmarks
				.map(bookmark => {
					if (bookmark.id === bookmarkID) bookmark.start = time

					return bookmark
				})
				.sort((a, b) => a.start - b.start)

			updateBookmarks(bookmarks)
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
			/>
		</section>
	)
}

const Sidebar = ({ video, stars, bookmarks, attributes, categories, updateBookmarks }) => {
	const clearActive = () => {
		bookmarks = bookmarks.map(bookmark => {
			bookmark.active = false

			return bookmark
		})

		updateBookmarks(bookmarks)
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

				<StarInput video={video} stars={stars} bookmarks={bookmarks} />
			</div>

			<Attributes bookmarks={bookmarks} clearActive={clearActive} update={updateBookmarks} />
		</aside>
	)
}

// Container
const VideoPlayer = ({ video, bookmarks, categories, stars, updateBookmarks, playerRef, playerValue }) => {
	const [newVideo, setNewVideo] = useState()
	const [events, setEvents] = useState(false)

	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).video

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

				if (newVideo) {
					Axios.put(`${config.api}/video/${video.id}`, { plays: 1 }).then(() => {
						console.log('Play Added')
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
			}
		}
	}, [events])

	const handleWheel = e => (getPlayer().currentTime += 10 * Math.sign(e.deltaY) * -1)
	const copy = async () => await navigator.clipboard.writeText(video.path.file)

	const resetPlays = () => {
		Axios.put(`${config.api}/video/${video.id}`, { plays: 0 }).then(() => window.location.reload())
	}

	const deleteVideo = () => {
		Axios.delete(`${config.source}/video/${video.id}`).then(() => {
			window.location.href = '/video'
		})
	}

	const renameVideo = path => {
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

	const addBookmark = category => {
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

	const handleKeyPress = (key, e) => {
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
							controls: ['play-large', 'play', 'current-time', 'progress', 'duration', 'fullscreen'],
							hideControls: false,
							ratio: '21:9',
							keyboard: { focused: false }
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
							categories.map(category => {
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
					<i className={`${config.theme.fa} fa-plus`} /> Add Bookmark
				</MenuItem>

				<MenuItem onClick={censorToggle}>
					{video.censored ? (
						<>
							<i className={`${config.theme.fa} fa-check-circle`} /> UnCensor
						</>
					) : (
						<>
							<i className={`${config.theme.fa} fa-exclamation-circle`} /> Censor
						</>
					)}
				</MenuItem>
				<MenuItem onClick={resetPlays}>
					<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Plays
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
								onKeyDown={e => {
									if (e.key === 'Enter') {
										e.preventDefault()

										handleModal()
										renameVideo(e.target.value)
									}
								}}
							/>
						)
					}}
				>
					<i className={`${config.theme.fa} fa-edit`} /> Rename Video
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copy}>
					<i className={`${config.theme.fa} fa-copy`} /> Copy Filename
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={updateVideo}>
					<i className={`${config.theme.fa} fa-edit`} /> Update Video
				</MenuItem>

				<MenuItem divider />

				<MenuItem disabled={stars.length !== 0} onClick={deleteVideo}>
					<i className={`${config.theme.fa} fa-trash-alt`} /> Delete Video
				</MenuItem>
			</ContextMenu>

			<KeyboardEventHandler
				handleKeys={['left', 'right', 'space']}
				onKeyEvent={(key, e) => handleKeyPress(key, e)}
				handleFocusableElements={true}
			/>
		</div>
	)
}

const Timeline = ({ video, bookmarks, stars, attributes, categories, playVideo, setTime, update }) => {
	const handleModal = useContext(ModalContext)

	const bookmarksArr = []

	const isActive = bookmark => Boolean(bookmark.active)
	const hasStar = bookmark => Boolean(bookmark.starID)
	const attributesFromStar = starID => stars.filter(star => (star.id === starID ? star : null))[0].attributes

	const addStar = (bookmark, star) => {
		Axios.post(`${config.api}/bookmark/${bookmark.id}/star`, { starID: star.id }).then(() => {
			window.location.reload()
		})
	}

	const removeBookmark = id => {
		Axios.delete(`${config.api}/bookmark/${id}`).then(() => {
			update(bookmarks.filter(bookmark => bookmark.id !== id))
		})
	}

	const setCategory = (category, bookmark) => {
		Axios.put(`${config.api}/bookmark/${bookmark.id}`, { categoryID: category.id }).then(() => {
			bookmarks = bookmarks.map(bookmarkItem => {
				if (bookmarkItem.id === bookmark.id) {
					bookmarkItem.name = category.name
				}

				return bookmarkItem
			})

			update(bookmarks)
		})
	}

	const addAttribute = (attribute, bookmark) => {
		Axios.post(`${config.api}/bookmark/attribute/`, { bookmarkID: bookmark.id, attributeID: attribute.id }).then(
			() => {
				update(
					bookmarks.map(bookmarkItem => {
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

	const clearAttributes = bookmark => {
		Axios.delete(`${config.api}/bookmark/${bookmark.id}/attribute`).then(() => {
			bookmarks = bookmarks.map(item => {
				if (item.id === bookmark.id) {
					const starID = bookmark.starID

					if (starID !== 0) {
						const attributes = attributesFromStar(starID)

						if (item.attributes.length > attributes.length) {
							item.attributes = item.attributes.filter(attribute => {
								const match = attributes.some(
									bookmarkAttribute => bookmarkAttribute.name === attribute.name
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

			update(bookmarks)
		})
	}

	const removeStar = bookmark => {
		Axios.delete(`${config.api}/bookmark/${bookmark.id}/star`).then(() => {
			bookmarks = bookmarks.map(item => {
				if (item.id === bookmark.id) {
					const starID = bookmark.starID

					const attributes = attributesFromStar(starID)

					if (item.attributes.length > attributes.length) {
						// Bookmark have at least 1 attribute not from star
						item.attributes = item.attributes.filter(attribute => {
							const match = attributes.some(starAttribute => starAttribute.name === attribute.name)

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

			update(bookmarks)
		})
	}

	const collisionCheck = (a, b) => {
		if (typeof a === 'undefined' || typeof b === 'undefined') return false
		if (a === null || b === null) return false

		a = a.getBoundingClientRect()
		b = b.getBoundingClientRect()

		return !(a.x + a.width < b.x - config.timeline.spacing || a.x + config.timeline.spacing > b.x + b.width)
	}

	useEffect(() => {
		//DEBUG console.log('#timeline UPDATED')

		for (let i = 1, items = bookmarksArr, LEVEL_MIN = 1, LEVEL_MAX = 10, level = LEVEL_MIN; i < items.length; i++) {
			let collision = false

			const first = items[i - 1]
			const second = items[i]

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
										left: `${((bookmark.start * 100) / video.duration) * config.timeline.offset}%`
									}}
									onClick={() => playVideo(bookmark.start)}
									ref={item => (bookmarksArr[i] = item)}
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

											{bookmark.attributes.map(attribute => (
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
									onClick={() => {
										if (stars.length > 1) {
											const starEl = document.getElementsByClassName('star')

											// Define arrays for listeners
											for (let i = 0; i < starEl.length; i++) {
												const star = starEl[i]

												// Define Listeners
												const listenerEnter = () => star.classList.add('star--active')
												const listenerLeave = () => star.classList.remove('star--active')
												const listenerClick = () => addStar(bookmark, stars[i])

												// Mount Listeners
												star.addEventListener('mouseenter', listenerEnter)
												star.addEventListener('mouseleave', listenerLeave)
												star.addEventListener('click', listenerClick)
											}
										} else {
											addStar(bookmark, stars[0])
										}
									}}
								>
									<i className={`${config.theme.fa} fa-plus`} /> Add Star
								</MenuItem>

								<MenuItem disabled={bookmark.starID === 0} onClick={() => removeStar(bookmark)}>
									<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Star
								</MenuItem>

								<MenuItem divider />

								<MenuItem
									onClick={() => {
										handleModal(
											'Add Attribute',
											attributes
												.filter(attribute => {
													const match = bookmark.attributes.some(
														bookmarkAttribute => attribute.name === bookmarkAttribute.name
													)

													if (!match) return attribute
													return null
												})
												.map(attribute => (
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
									<i className={`${config.theme.fa} fa-plus`} /> Add Attribute
								</MenuItem>

								<MenuItem
									disabled={bookmark.attributes.length === 0}
									onClick={() => clearAttributes(bookmark)}
								>
									<i className={`${config.theme.fa} fa-trash-alt`} /> Clear Attributes
								</MenuItem>

								<MenuItem
									onClick={() => {
										handleModal(
											'Change Category',
											categories
												.filter(category => category.name !== bookmark.name)
												.map(category => (
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
									<i className={`${config.theme.fa} fa-edit`} /> Change Category
								</MenuItem>

								<MenuItem onClick={() => setTime(bookmark.id)}>
									<i className={`${config.theme.fa} fa-clock`} /> Change Time
								</MenuItem>

								<MenuItem onClick={() => removeBookmark(bookmark.id)}>
									<i className={`${config.theme.fa} fa-trash-alt`} /> Delete
								</MenuItem>
							</ContextMenu>
						</Fragment>
				  ))
				: null}
		</div>
	)
}

const Stars = ({ video, stars, bookmarks, attributes, categories, clearActive, updateBookmarks }) => {
	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).stars

	const attributesFromStar = starID => stars.filter(star => (star.id === starID ? star : null))[0].attributes

	const handleRibbon = star => {
		const hasBookmark = bookmarks.some(bookmark => bookmark.starID === star.id)

		if (!hasBookmark) return <Ribbon label='NEW' />
	}

	const addBookmark = (category, star) => {
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

	const addAttribute = (star, attribute) => {
		Axios.post(`${config.api}/bookmark/attribute`, {
			videoID: video.id,
			starID: star.id,
			attributeID: attribute.id
		}).then(() => {
			window.location.reload()
		})
	}

	const removeStar = id => {
		Axios.delete(`${config.api}/video/${video.id}/star/${id}`).then(() => {
			update(stars.filter(star => star.id !== id))
		})
	}

	const setActive = star => {
		updateBookmarks(
			bookmarks.map(bookmark => {
				if (bookmark.starID === star.id) bookmark.active = true

				return bookmark
			})
		)
	}

	return stars.map(star => (
		<div key={star.id} className='star col-4' onMouseEnter={() => setActive(star)} onMouseLeave={clearActive}>
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
							categories.map(category => (
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
					<i className={`${config.theme.fa} fa-plus`} /> Add Bookmark
				</MenuItem>

				<MenuItem
					disabled={!bookmarks.some(bookmark => bookmark.starID === star.id)}
					onClick={() => {
						handleModal(
							'Add Attribute',
							attributes
								.filter(attribute => {
									const match = attributesFromStar(star.id).some(attr => attr.id === attribute.id)

									return !match ? attribute : null
								})
								.map(attribute => (
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
					<i className={`${config.theme.fa} fa-plus`} /> Add Attribute
				</MenuItem>

				<MenuItem
					disabled={bookmarks.some(bookmark => bookmark.starID === star.id)}
					onClick={() => removeStar(star.id)}
				>
					<i className={`${config.theme.fa} fa-trash-alt`} /> Remove
				</MenuItem>
			</ContextMenu>
		</div>
	))
}

const StarInput = ({ video, stars, bookmarks }) => {
	const updateVideo = useContext(UpdateContext).video
	const update = useContext(UpdateContext).stars

	const handleNoStar = e => {
		Axios.put(`${config.api}/video/${video.id}`, { noStar: e.target.checked }).then(({ data }) => {
			video.noStar = data.noStar

			updateVideo(video)
		})
	}

	const addStar = name => {
		Axios.post(`${config.api}/video/${video.id}/star`, { name }).then(({ data }) => {
			stars.push({ id: data.id, name, attributes: data.attributes })

			update(stars)
		})
	}

	return (
		<div className='col-12 mt-2'>
			{stars.length ? <hr /> : null}

			<div className='form-inline justify-content-center'>
				<div className='form-group mr-2'>
					<label htmlFor='add-star' className='mr-1'>
						Star
					</label>
					<input
						type='text'
						id='add-star'
						className='form-control'
						onKeyDown={e => {
							if (e.key === 'Enter') {
								e.preventDefault()

								addStar(e.target.value)

								e.target.value = ''
							}
						}}
						disabled={video.noStar === 1}
					/>
				</div>

				<div className='form-check'>
					<input
						type='checkbox'
						name='no-star'
						id='no-star'
						className='form-check-input mr-1'
						onChange={handleNoStar}
						checked={video.noStar === 1}
						disabled={bookmarks.length || stars.length}
					/>
					<label htmlFor='no-star' className='form-check-label'>
						No Star
					</label>
				</div>
			</div>

			{bookmarks.length ? <hr className='pt-2' /> : null}
		</div>
	)
}

const Franchise = ({ video }) => (
	<div id='franchise'>
		{video.related.length > 1
			? <h2>Episodes</h2> &&
			  video.related.map(item => (
					<a className='episode row' href={`/video/${item.id}`} key={item.id}>
						<span className='episode__plays col-2'>{item.plays} Plays</span>

						<img
							className='episode__thumbnail'
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

const Attributes = ({ bookmarks, clearActive, update }) => {
	const getAttributes = () => {
		const attributeArr = []

		bookmarks.forEach(({ attributes }) => {
			attributes.forEach(attribute => {
				if (!attributeArr.some(e => e.id === attribute.id)) attributeArr.push(attribute)
			})
		})

		return attributeArr
	}

	const attribute_setActive = attribute => {
		bookmarks = bookmarks.map(bookmark => {
			if (bookmark.attributes.some(bookmarkAttribute => bookmarkAttribute.id === attribute.id))
				bookmark.active = true

			return bookmark
		})

		update(bookmarks)
	}

	return (
		<div id='attributes' className='row col-12 justify-content-center'>
			{getAttributes().map(attribute => (
				<div
					key={attribute.id}
					className='btn btn-outline-primary m-2 attribute'
					onMouseEnter={() => attribute_setActive(attribute)}
					onMouseLeave={clearActive}
				>
					{attribute.name}
				</div>
			))}
		</div>
	)
}

const Header = ({ video }) => {
	const handleModal = useContext(ModalContext)
	const update = useContext(UpdateContext).video

	const handleKeyPress = (e, callback) => {
		if (e.key === 'Enter') {
			e.preventDefault()

			handleModal()
			callback(e.target.value)
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
const HeaderTitle = ({ video, handleModal, handleKeyPress }) => {
	const copyFranchise = async () => await navigator.clipboard.writeText(video.franchise)

	const renameFranchise = value => {
		Axios.put(`${config.api}/video/${video.id}`, { franchise: value }).then(() => {
			window.location.reload()
		})
	}

	const renameTitle = value => {
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
								onKeyDown={e => handleKeyPress(e, renameTitle)}
							/>
						)
					}}
				>
					<i className={`${config.theme.fa} fa-edit`} /> Rename Title
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
								onKeyDown={e => handleKeyPress(e, renameFranchise)}
							/>
						)
					}}
				>
					<i className={`${config.theme.fa} fa-edit`} /> Rename Franchise
				</MenuItem>

				<MenuItem divider />

				<MenuItem onClick={copyFranchise}>
					<i className={`${config.theme.fa} fa-copy`} /> Copy Franchise
				</MenuItem>
			</ContextMenu>

			<small className='header__censored text-muted'>
				{video.censored ? <span className='label'>Censored</span> : null}
			</small>
		</h1>
	)
}

const HeaderDate = ({ video, handleModal, handleKeyPress, update }) => {
	const handleDate = value => {
		Axios.put(`${config.api}/video/${video.id}`, { date: value }).then(({ data }) => {
			video.date.published = data.date_published

			update(video)
		})
	}

	return (
		<>
			<ContextMenuTrigger id='menu__date' renderTag='span'>
				<div className='header__date btn btn-sm btn-outline-primary'>
					<i className={`${config.theme.fa} fa-calendar-check`} />
					{video.date.published}
				</div>
			</ContextMenuTrigger>

			<ContextMenu id='menu__date'>
				<MenuItem
					onClick={() => {
						handleModal(
							'Change Time',
							<input type='text' ref={setFocus} onKeyDown={e => handleKeyPress(e, handleDate)} />
						)
					}}
				>
					<i className={`${config.theme.fa} fa-edit`} />
					Edit Date
				</MenuItem>
			</ContextMenu>
		</>
	)
}

const HeaderNext = ({ video }) => (
	<div className='col-1 header__next'>
		<a className='btn btn-sm btn-outline-primary float-right' id='next' href={`/video/${video.nextID}`}>
			Next
		</a>
	</div>
)

const HeaderQuality = ({ video }) => (
	<div className='header__quality btn btn-sm btn-outline-primary'>
		<i className={`${config.theme.fa} fa-film`} />
		{video.quality}
	</div>
)

export default VideoPage
