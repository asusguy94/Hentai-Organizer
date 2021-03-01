import { Component, Fragment, createRef } from 'react'
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
import { setFocus } from '../../hooks'

import './video.scss'

import config from '../config.json'

class VideoPage extends Component {
	constructor() {
		super()
		this.handleModal = handleModal
		this.handleOverlay = handleOverlay

		this.playerRef = createRef(null)
	}

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
			attributes: [
				{
					id: 0,
					name: ''
				}
			],
			related: [],
			noStar: 0
		},
		stars: [],

		bookmarks: [
			{
				id: 0,
				name: '',
				start: 0,
				starID: 0,
				attributes: [
					{
						id: 0,
						name: ''
					}
				],

				active: false
			}
		],

		categories: [],
		attributes: [],

		loaded: {
			hls: false,
			video: false,
			bookmarks: false,
			stars: false,
			categories: false,
			attributes: false,

			videoEvents: false,
			videoReload: false
		},
		seekSpeed: {
			regular: 1,
			wheel: 10
		},
		modal: {
			visible: false,
			data: null,
			filter: false
		},
		overlay: {
			visible: false,
			data: null
		},
		newVideo: false
		}

	//useRef
	handleWheel(e) {
		const { player } = this.playerRef.current
		player.currentTime += this.state.seekSpeed.wheel * Math.sign(e.deltaY) * -1
	}

	//useState
	handleCensor_toggle() {
		Axios.put(`${config.api}/video/${this.state.video.id}`, { cen: !this.state.video.censored }).then(() => {
			this.setState(prevState => {
				const { video } = prevState
				video.censored = !video.censored

				return { video }
			})
		})
	}

	//simple
	async handleFname_copy() {
		await navigator.clipboard.writeText(this.state.video.path.file)
	}

	//useRef
	handleVideo_isPlaying() {
		const { player } = this.playerRef.current

		return player.playing
	}

	//useRef
	handleVideo_pause() {
		const { player } = this.playerRef.current

		player.pause()
	}

	//useRef
	handleVideo_play(time = null) {
		const { player } = this.playerRef.current

		if (time === null) time = player.currentTime
		player.currentTime = Number(time)
		player.play()
	}

	//useRef
	handleVideo_playpause() {
		if (this.handleVideo_isPlaying()) this.handleVideo_pause()
		else this.handleVideo_play()
	}

	//useRef
	handleVideo_forward(time = this.state.seekSpeed.regular) {
		const { player } = this.playerRef.current

		player.currentTime += Number(time)
	}

	//useRef
	handleVideo_rewind(time = this.state.seekSpeed.regular) {
		const { player } = this.playerRef.current

		player.currentTime -= Number(time)
	}

	//simple
	handleVideo_rename(path) {
		Axios.put(`${config.source}/video/${this.state.video.id}`, { path }).then(() => {
			window.location.reload()
		})
	}

	//simple
	handleVideo_delete() {
		Axios.delete(`${config.source}/video/${this.state.video.id}`).then(() => {
			window.location.href = '/video'
		})
	}

	//useState
	handleBookmark_add(category, star = null) {
		const { player } = this.playerRef.current
		const time = Math.round(player.currentTime)
		if (time) {
			if (star === null) {
				Axios.post(`${config.api}/video/${this.state.video.id}/bookmark`, {
					categoryID: category.id,
					time
				}).then(({ data }) => success(data))
			} else {
				Axios.post(`${config.api}/video/${this.state.video.id}/bookmark`, {
					categoryID: category.id,
					time,
					starID: star.id
				}).then(({ data }) => success(data, star.id))
			}
		}

		const success = (data, starID = 0) => {
			let attributes = data.attributes
			if (typeof data.attributes === 'undefined') attributes = []

			this.setState(prevState => {
				const { bookmarks } = prevState

				bookmarks.push({
					id: data.id,
					name: category.name,
					start: time,
					starID,
					attributes,
					active: false
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

	//useState + sort(might not work with f-components)
	handleBookmark_time(id) {
		const { player } = this.playerRef.current
		const time = Math.round(player.currentTime)

		Axios.put(`${config.api}/bookmark/${id}`, { time }).then(() => {
			const bookmarks = this.state.bookmarks
				.map(bookmark => {
					if (bookmark.id === id) bookmark.start = time

					return bookmark
				})
				.sort((a, b) => {
					let valA = a.start
					let valB = b.start

					return valA - valB
				})

			this.setState({ bookmarks })
		})
	}

	//useState
	handleBookmark_remove(id) {
		Axios.delete(`${config.api}/bookmark/${id}`).then(() => {
			const bookmarks = this.state.bookmarks.filter(item => item.id !== id)

			this.setState({ bookmarks })
		})
	}

	//useState
	handleBookmark_category(category, bookmark) {
		Axios.put(`${config.api}/bookmark/${bookmark.id}`, { categoryID: category.id }).then(() => {
			this.handleOverlay(config.overlay.success)

			const bookmarks = this.state.bookmarks.map(bookmarkItem => {
				if (bookmarkItem.id === bookmark.id) {
					bookmarkItem.name = category.name
				}

				return bookmarkItem
			})

			this.setState({ bookmarks })
		})
	}

	//useState
	handleBookmark_addAttribute(attribute, bookmark) {
		Axios.post(`${config.api}/bookmark/attribute/`, { bookmarkID: bookmark.id, attributeID: attribute.id }).then(
			() => {
				this.handleOverlay(config.overlay.success)

				const bookmarks = this.state.bookmarks.map(bookmarkItem => {
					if (bookmarkItem.id === bookmark.id) {
						bookmarkItem.attributes.push({
							id: attribute.id,
							name: attribute.name
						})
					}

					return bookmarkItem
				})

				this.setState({ bookmarks })
			}
		)
	}

	//useState
	handleBookmark_clearAttributes(bookmark) {
		Axios.delete(`${config.api}/bookmark/${bookmark.id}/attribute`).then(() => {
			this.setState(prevState => {
				const bookmarks = prevState.bookmarks.map(item => {
					if (item.id === bookmark.id) {
						const starID = bookmark.starID

						if (starID !== 0) {
							const attributes = this.attributesFromStar(starID)

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

				return { bookmarks }
			})
		})
	}

	//simple
	attributesFromStar(starID) {
		return this.state.stars.filter(star => {
			if (star.id === starID) {
				return star
			}
			return null
		})[0].attributes
	}

	//useState
	handleBookmark_addStar(bookmark, star, elements = null) {
		Axios.post(`${config.api}/bookmark/${bookmark.id}/star`, { starID: star.id }).then(() => {
			success()

			if (elements !== null) {
				for (let i = 0; i < elements.length; i++) {
					// Unload listeners
					elements[i].removeEventListener('mouseenter', this.listenerEnter[i])
					elements[i].removeEventListener('mouseleave', this.listenerLeave[i])
					elements[i].removeEventListener('click', this.listenerClick[i])

					// Remove unused classes
					this.listenerLeave[i]()
				}
			}
		})

		const success = () => {
			this.handleOverlay(config.overlay.success)

			this.setState(prevState => {
				const bookmarks = prevState.bookmarks.map(bookmarkItem => {
					if (bookmarkItem === bookmark) {
						bookmarkItem.starID = star.id

						bookmark.attributes = star.attributes.concat(bookmark.attributes)
					}

					return bookmarkItem
				})

				return { bookmarks }
			})
		}
	}

	//useState
	handleBookmark_removeStar(bookmark) {
		Axios.delete(`${config.api}/bookmark/${bookmark.id}/star`).then(() => {
			this.setState(prevState => {
				const bookmarks = prevState.bookmarks.map(item => {
					if (item.id === bookmark.id) {
						const starID = bookmark.starID

						const attributes = this.attributesFromStar(starID)

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

				return { bookmarks }
			})
		})
	}

	//useState
	handleTitle_rename(value) {
		Axios.put(`${config.api}/video/${this.state.video.id}`, { title: value }).then(() => {
			this.handleOverlay(config.overlay.success)

			this.reloadVideo().then(this.getData())
		})
	}

	//useState
	handleFranchise_rename(value) {
		Axios.put(`${config.api}/video/${this.state.video.id}`, { franchise: value }).then(() => {
			this.handleOverlay(config.overlay.success)

			this.reloadVideo().then(this.getData())
		})
	}

	//useState
	handleDate(value) {
		Axios.put(`${config.api}/video/${this.state.video.id}`, { date: value }).then(({ data }) => {
			this.setState(prevState => {
				const { date } = prevState.video
				date.published = data.date_published

				return { date }
			})
		})
	}

	// useState
	handleNoStar(e) {
		Axios.put(`${config.api}/video/${this.state.video.id}`, { noStar: e.target.checked }).then(({ data }) => {
			this.setState(prevState => {
				const { video } = prevState
				video.noStar = Number(data.noStar)

				return { video }
			})
		})
	}

	//useState
	handleStar_add(name) {
		Axios.post(`${config.api}/video/${this.state.video.id}/star`, { name }).then(({ data }) => {
			this.setState(prevState => {
				const { stars } = prevState
				stars.push({ id: data.id, name, attributes: data.attributes })

				return { stars }
			})
		})
	}

	//useState
	handleStar_remove(id) {
		Axios.delete(`${config.api}/video/${this.state.video.id}/star/${id}`).then(() => {
			const stars = this.state.stars.filter(item => item.id !== id)

			this.setState({ stars })
		})
	}

	//useState
	handleStar_addAttribute(star, attribute) {
		Axios.post(`${config.api}/bookmark/attribute`, {
			videoID: this.state.video.id,
			starID: star.id,
			attributeID: attribute.id
		}).then(() => {
			this.handleOverlay(config.overlay.success)

			this.reset('bookmarks').then(this.getData())
		})
	}

	//simple
	handlePlays_add() {
		Axios.put(`${config.api}/video/${this.state.video.id}`, { plays: 1 }).then(() => {
			console.log('Play Added')
		})
	}

	//useState
	handlePlays_reset() {
		Axios.put(`${config.api}/video/${this.state.video.id}`, { plays: 0 }).then(() => {
			this.handleOverlay(config.overlay.success)

			this.reloadVideo().then(this.getData())
		})
	}

	bookmark_hasStar(bookmark) {
		return Boolean(bookmark.starID)
	}

	bookmark_isActive(bookmark) {
		return Boolean(bookmark.active)
	}

	//useState
	bookmark_setActive(star) {
		this.bookmark_clearActive()

		const starID = star.id
		this.setState(prevState => {
			const bookmarks = prevState.bookmarks.map(bookmark => {
				if (bookmark.starID === starID) bookmark.active = true

				return bookmark
			})

			return { bookmarks }
		})
	}

	//useState
	bookmark_clearActive() {
		this.setState(prevState => {
			const bookmarks = prevState.bookmarks.map(item => {
				item.active = false

				return item
			})

			return { bookmarks }
		})
	}

	//useState
	attribute_setActive(attribute) {
		this.bookmark_clearActive()

		this.setState(prevState => {
			const bookmarks = prevState.bookmarks.map(bookmark => {
				if (bookmark.attributes.some(bookmarkAttribute => bookmarkAttribute.id === attribute.id))
					bookmark.active = true

				return bookmark
			})

			return { bookmarks }
		})
	}

	async reset(type) {
		this.setState(prevState => {
			const { loaded } = prevState
			loaded[type] = false

			return { loaded }
		})
	}

	async reloadVideo() {
		this.setState(prevState => {
			const { loaded } = prevState
			loaded.videoReload = true

			return { loaded }
		})
	}

	//useRef
	handleKeyPress(key, e) {
		if (e.target.tagName === 'INPUT') return
		e.preventDefault()

		switch (key) {
			case 'left':
				this.handleVideo_rewind()
				break
			case 'right':
				this.handleVideo_forward()
				break
			case 'space':
				this.handleVideo_playpause()
				break
			case 'tab':
				// TODO use state instead of window
				window.location.href = this.state.video.nextID ? this.state.video.nextID : '/video'
				break
			default:
				console.log(`${key} was pressed`)
		}
	}

	render() {
		return (
			<div id='video-page' className='col-12 row'>
				<section className='col-9'>
					<Header
						video={this.state.video}
						handleModal={(title, data, filter) => this.handleModal(title, data, filter)}
						handleTitle_rename={value => this.handleTitle_rename(value)}
						handleFranchise_rename={value => this.handleFranchise_rename(value)}
						handleDate={value => this.handleDate(value)}
					/>

					<div className='video-container' onWheel={e => this.handleWheel(e)}>
						<ContextMenuTrigger id='video' holdToDisplay={-1}>
							{this.state.video.id !== 0 && (
								<Plyr
									ref={this.playerRef}
									options={{
										controls: [
											'play-large',
											'play',
											'current-time',
											'progress',
											'duration',
											'fullscreen'
										],
										hideControls: false,
										ratio: '21:9',
										keyboard: { focused: false }
									}}
									sources={{
										type: 'video',
										sources: [
											{
												src: `${config.source}/videos/${this.state.video.path.stream}`,
												type: 'application/x-mpegURL'
											},
											{
												src: `${config.source}/videos/${this.state.video.path.file}`,
												type: 'video/mp4'
											}
										]
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
										this.state.categories.map((category, i) => {
											return (
												<div
													key={category.id}
													className='btn btn-sm btn-outline-primary d-block'
													onClick={() => {
														this.handleModal()
														this.handleBookmark_add(category)
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

							<MenuItem onClick={() => this.handleCensor_toggle()}>
								{this.state.video.censored ? (
									<>
										<i className={`${config.theme.fa} fa-check-circle`} /> UnCensor
									</>
								) : (
									<>
										<i className={`${config.theme.fa} fa-exclamation-circle`} /> Censor
									</>
								)}
							</MenuItem>

							<MenuItem onClick={() => this.handlePlays_reset()}>
								<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Plays
							</MenuItem>

							<MenuItem
								onClick={() => {
									this.handleModal(
										'Rename Video',
										<Autosizeinput
											type='text'
											className='input__container--autosize'
											inputClassName='input--autosize'
											defaultValue={this.state.video.path.file}
											ref={input => input && input.focus()}
											onKeyDown={e => {
												if (e.key === 'Enter') {
													e.preventDefault()

													this.handleModal()
													this.handleVideo_rename(e.target.value)
												}
											}}
										/>
									)
								}}
							>
								<i className={`${config.theme.fa} fa-edit`} /> Rename Video
							</MenuItem>

							<MenuItem divider />

							<MenuItem onClick={() => this.handleFname_copy()}>
								<i className={`${config.theme.fa} fa-copy`} /> Copy Filename
							</MenuItem>

							<MenuItem divider />

							<MenuItem disabled>
								<i className={`${config.theme.fa} fa-edit`} /> Update Video
							</MenuItem>

							<MenuItem disabled>
								<i className={`${config.theme.fa} fa-edit`} /> Update Bookmarks
							</MenuItem>

							<MenuItem divider />

							<MenuItem
								disabled={this.state.stars.length !== 0}
								onClick={() => this.handleVideo_delete()}
							>
								<i className={`${config.theme.fa} fa-trash-alt`} /> Delete Video
							</MenuItem>
						</ContextMenu>
					</div>

					<div className='col-12' id='timeline'>
						{this.state.video.id !== 0
							? this.state.bookmarks.map((bookmark, i) => (
								<Fragment key={bookmark.id}>
									<ContextMenuTrigger id={`bookmark-${i}`}>
										<div
											className={`btn btn-sm ${
												this.bookmark_isActive(bookmark)
													? 'btn-info'
													: this.bookmark_hasStar(bookmark)
													? 'btn-outline-primary'
													: 'btn-outline-secondary'
											} bookmark`}
											style={{
												left: `${
													((bookmark.start * 100) / this.state.video.duration) *
													config.timeline.offset
												}%`
											}}
											onClick={() => this.handleVideo_play(bookmark.start)}
											ref={bookmark => (this.bookmarks[i] = bookmark)}
											data-level={1}
										>
											<div data-tip={true} data-for={`bookmark-info-${i}`}>
												{bookmark.name}
											</div>

											{(bookmark.starID !== 0 || bookmark.attributes.length > 0) && (
												<ReactTooltip id={`bookmark-info-${i}`} effect='solid'>
													{bookmark.starID !== 0 && (
														<img
															alt='star'
															className='star__image'
															data-star-id={bookmark.starID}
															src={`${config.source}/images/stars/${bookmark.starID}.jpg`}
														/>
													)}

													{bookmark.attributes.map((attribute, attribute_i) => [
														attribute.id !== 0 && (
															<div
																key={attribute_i}
																className='attribute btn btn-sm btn-light'
															>
																{attribute.name}
															</div>
														)
													])}
												</ReactTooltip>
											)}
										</div>
									</ContextMenuTrigger>

									<ContextMenu id={`bookmark-${i}`}>
										<MenuItem
											disabled={
												bookmark.starID !== 0 ||
												(bookmark.starID === 0 && !this.state.stars.length)
											}
											onClick={() => {
												if (this.state.stars.length > 1) {
													const stars = document.getElementsByClassName('star')

													// Define arrays for listeners
													this.listenerEnter = []
													this.listenerLeave = []
													this.listenerClick = []
													for (let i = 0; i < stars.length; i++) {
														// Define Listeners
														this.listenerEnter[i] = () =>
															stars[i].classList.add('star--active')
														this.listenerLeave[i] = () =>
															stars[i].classList.remove('star--active')
														this.listenerClick[i] = () => {
															const star = this.state.stars[i]
															this.handleBookmark_addStar(bookmark, star, stars)
														}

														// Mount Listeners
														stars[i].addEventListener('mouseenter', this.listenerEnter[i])
														stars[i].addEventListener('mouseleave', this.listenerLeave[i])
														stars[i].addEventListener('click', this.listenerClick[i])
													}
												} else {
													this.handleBookmark_addStar(bookmark, this.state.stars[0])
												}
											}}
										>
											<i className={`${config.theme.fa} fa-plus`} /> Add Star
										</MenuItem>

										<MenuItem
											disabled={bookmark.starID === 0}
											onClick={() => this.handleBookmark_removeStar(bookmark)}
										>
											<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Star
										</MenuItem>

										<MenuItem divider />

										<MenuItem
											onClick={() => {
												this.handleModal(
													'Add Attribute',
													this.state.attributes
														.filter(attributeItem => {
															const match = bookmark.attributes.some(
																bookmarkAttribute =>
																	attributeItem.name === bookmarkAttribute.name
															)

															if (!match) return attributeItem
															return null
														})
														.map((attributeItem, attribute_i) => {
															return (
																<div
																	key={attribute_i}
																	className='btn btn-sm btn-outline-primary d-block w-auto'
																	onClick={() => {
																		this.handleModal()
																		this.handleBookmark_addAttribute(
																			attributeItem,
																			bookmark
																		)
																	}}
																>
																	{attributeItem.name}
																</div>
															)
														}),
													true
												)
											}}
										>
											<i className={`${config.theme.fa} fa-plus`} /> Add Attribute
										</MenuItem>

										<MenuItem
											disabled={bookmark.attributes.length === 0}
											onClick={() => this.handleBookmark_clearAttributes(this.state.bookmarks[i])}
										>
											<i className={`${config.theme.fa} fa-trash-alt`} /> Remove Attributes
										</MenuItem>

										<MenuItem
											onClick={() => {
												this.handleModal(
													'Change Category',
													this.state.categories
														.filter(category => category.name !== bookmark.name)
														.map((category, category_i) => (
															<div
																key={category_i}
																className='btn btn-outline-primary d-block w-auto'
																onClick={() => {
																	this.handleModal()
																	this.handleBookmark_category(category, bookmark)
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

										<MenuItem onClick={() => this.handleBookmark_time(this.state.bookmarks[i].id)}>
											<i className={`${config.theme.fa} fa-clock`} /> Change Time
										</MenuItem>

										<MenuItem
											onClick={() => this.handleBookmark_remove(this.state.bookmarks[i].id)}
										>
											<i className={`${config.theme.fa} fa-trash-alt`} /> Delete
										</MenuItem>
									</ContextMenu>
								</Fragment>
							  ))
							: null}
					</div>
				</section>

				<aside className='col-3'>
					<Franchise video={this.state.video} />

					<div id='stars' className='row justify-content-center'>
						<Stars
							stars={this.state.stars}
							bookmarks={this.state.bookmarks}
							attributes={this.state.bookmarks}
							categories={this.state.categories}
							handleModal={(title, data, filter) => this.handleModal(title, data, filter)}
							setActive={star => this.bookmark_setActive(star)}
							clearActive={() => this.bookmark_clearActive()}
							addAttribute={(star, attribute) => this.handleStar_addAttribute(star, attribute)}
							removeStar={starID => this.handleStar_remove(starID)}
							addBookmark={(category, star) => this.handleBookmark_add(category, star)}
												/>

						<StarInput
							video={this.state.video}
							stars={this.state.stars}
							bookmarks={this.state.bookmarks}
							handleNoStar={e => this.handleNoStar(e)}
							addStar={name => this.handleStar_add(name)}
										/>
					</div>

					<Attributes
						bookmarks={this.state.bookmarks}
						attribute_setActive={attribute => this.attribute_setActive(attribute)}
						bookmark_clearActive={() => this.bookmark_clearActive()}
					/>
				</aside>

				<Modal
					visible={this.state.modal.visible}
					title={this.state.modal.title}
					filter={this.state.modal.filter}
					onClose={() => this.handleModal()}
				>
					{this.state.modal.data}
				</Modal>

				<Overlay visible={this.state.overlay.visible}>{this.state.overlay.data}</Overlay>

				<KeyboardEventHandler
					handleKeys={['left', 'right', 'space', 'tab']}
					onKeyEvent={(key, e) => this.handleKeyPress(key, e)}
					handleFocusableElements={true}
					isDisabled={this.state.modal.visible}
				/>
			</div>
		)
	}

	componentDidMount() {
		this.bookmarks = []

		this.getData()
	}

	componentDidUpdate() {
		if (this.state.video.id !== 0) {
			/* Events Handler */
			if (!this.state.loaded.videoEvents) {
				const { player } = this.playerRef.current

				if (Number(localStorage.video) !== this.state.video.id) {
					localStorage.playing = 0
				}

				player.on('timeupdate', () => {
					if (player.currentTime) localStorage.bookmark = Math.round(player.currentTime)
				})

				player.on('play', () => {
					localStorage.playing = 1

					if (this.state.newVideo) {
						this.handlePlays_add()
						this.setState({ newVideo: false })
					}
				})

				player.on('pause', () => (localStorage.playing = 0))

				this.setState(prevState => {
					const { loaded } = prevState
					loaded.videoEvents = true

					return { loaded }
				})
			}
		}

		// HLS handler
		if (this.state.loaded.videoEvents && !this.state.loaded.hls && Hls.isSupported() && config.hls.enabled) {
			const { player } = this.playerRef.current
			const hls = new Hls({ autoStartLoad: false })
			hls.loadSource(player.media.firstElementChild.getAttribute('src'))
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

				/* Improve this */
				if (Number(localStorage.video) === this.state.video.id) {
					hls.startLoad(Number(localStorage.bookmark))
					if (Number(localStorage.playing)) this.handleVideo_play(localStorage.bookmark)

					this.setState({ newVideo: false })
				} else {
					localStorage.video = this.state.video.id
					localStorage.bookmark = 0

					hls.startLoad()
					this.handleVideo_pause()

					this.setState({ newVideo: true })
				}
			})

			this.setState(prevState => {
				const { loaded } = prevState
				loaded.hls = true

				return { loaded }
			})
		}

		/* Collision Check */
		const collisionCheck = (a, b) => {
			if (typeof a === 'undefined' || typeof b === 'undefined') return false
			if (a === null || b === null) return false

			a = a.getBoundingClientRect()
			b = b.getBoundingClientRect()

			return !(a.x + a.width < b.x - config.timeline.spacing || a.x + config.timeline.spacing > b.x + b.width)
		}

		for (
			let i = 1, items = this.bookmarks, LEVEL_MIN = 1, LEVEL_MAX = 10, level = LEVEL_MIN;
			i < items.length;
			i++
		) {
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
	}

	getData(videoID = null) {
		const id = videoID || this.props.match.params.id
		const { loaded } = this.state

		if (!loaded.video || loaded.videoReload) {
			Axios.get(`${config.api}/video/${id}`).then(({ data: video }) =>
				this.setState(prevState => {
					const { loaded } = prevState
					loaded.video = true
					loaded.videoReload = false

					return { video, loaded }
				})
			)
		}

		if (!loaded.bookmarks) {
			Axios.get(`${config.api}/video/${id}/bookmark`).then(({ data }) => {
				this.setState(prevState => {
					const bookmarks = data.map(item => {
						item.active = false

						return item
					})

					const { loaded } = prevState
					loaded.bookmarks = true

					return { bookmarks, loaded }
				})
			})
		}

		if (!loaded.stars) {
			Axios.get(`${config.api}/video/${id}/star`).then(({ data: stars }) => {
				this.setState(prevState => {
					const { loaded } = prevState
					loaded.stars = true

					return { stars, loaded }
				})
			})
		}

		if (!loaded.categories) {
			Axios.get(`${config.api}/category`).then(({ data: categories }) => {
				this.setState(prevState => {
					const { loaded } = prevState
					loaded.categories = true

					return { categories, loaded }
				})
			})
		}

		if (!loaded.attributes) {
			Axios.get(`${config.api}/attribute/video`).then(({ data: attributes }) => {
				this.setState(prevState => {
					const { loaded } = prevState
					loaded.attributes = true

					return { attributes, loaded }
				})
			})
		}
	}
}

const Stars = ({
	stars,
	bookmarks,
	attributes,
	categories,
	handleModal,
	setActive,
	clearActive,
	addAttribute,
	removeStar,
	addBookmark
}) => {
	const handleRibbon = star => {
		const hasBookmark = bookmarks.some(bookmark => bookmark.starID === star.id)

		if (!hasBookmark) return <Ribbon label='NEW' />
	}

	return stars.map((starItem, i) => (
		<div
			key={starItem.id}
			className='star col-4'
			onMouseEnter={() => setActive(starItem)}
			onMouseLeave={() => clearActive()}
		>
			<div className='card mb-2 ribbon-container'>
				<ContextMenuTrigger id={`star-${i}`}>
					<img
						className='star__image card-img-top'
						alt='star'
						src={`${config.source}/images/stars/${starItem.id}.jpg`}
					/>

					<Link to={`/star/${starItem.id}`} className='star__name d-block'>
						{starItem.name}
					</Link>

					{handleRibbon(starItem)}
				</ContextMenuTrigger>
			</div>

			<ContextMenu id={`star-${i}`}>
				<MenuItem
					onClick={() => {
						handleModal(
							'Add Bookmark',
							categories.map((categoryItem, category_i) => {
								return (
									<div
										key={category_i}
										className='btn btn-sm btn-outline-primary d-block w-auto'
										onClick={() => {
											handleModal()
											addBookmark(categoryItem, starItem)
										}}
									>
										{categoryItem.name}
									</div>
								)
							}),
							true
						)
					}}
				>
					<i className={`${config.theme.fa} fa-plus`} /> Add Bookmark
				</MenuItem>

				<MenuItem
					onClick={() => {
						// TODO disabled->if no bookmarks from star
						handleModal(
							'Add Global Attribute',
							attributes.map((attributeItem, attribute_i) => {
								return (
									<div
										key={attribute_i}
										className='btn btn-sm btn-outline-primary d-block w-auto'
										onClick={() => {
											handleModal()
											addAttribute(starItem, attributeItem)
										}}
									>
										{attributeItem.name}
									</div>
								)
							}),
							true
						)
					}}
				>
					<i className={`${config.theme.fa} fa-plus`} /> Add Global Attribute
				</MenuItem>

				<MenuItem
					disabled={bookmarks.some(bookmark => bookmark.starID === starItem.id)}
					onClick={() => removeStar(starItem.id)}
				>
					<i className={`${config.theme.fa} fa-trash-alt`} /> Remove
				</MenuItem>
			</ContextMenu>
		</div>
	))
}

const StarInput = ({ video, stars, bookmarks, handleNoStar, addStar }) => {
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
						onChange={e => handleNoStar(e)}
						defaultChecked={video.noStar === 1}
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

const Franchise = ({ video }) => {
	return (
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
}

const Attributes = ({ bookmarks, attribute_setActive, bookmark_clearActive }) => {
	const getAttributes = () => {
		const attributeArr = []

		bookmarks.forEach(({ attributes }) => {
			attributes.forEach(attribute => {
				if (!attributeArr.some(e => e.id === attribute.id)) attributeArr.push(attribute)
			})
		})

		return attributeArr
	}

	return (
		<div id='attributes' className='row col-12 justify-content-center'>
			{getAttributes().map(attribute => (
						<div
							key={attribute.id}
							className='btn btn-outline-primary m-2 attribute'
							onMouseEnter={() => attribute_setActive(attribute)}
							onMouseLeave={() => bookmark_clearActive()}
						>
							{attribute.name}
						</div>
			))}
		</div>
	)
}

const Header = ({ video, handleModal, handleTitle_rename, handleFranchise_rename, handleDate }) => {
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
				<HeaderTitle
					video={video}
					handleModal={handleModal}
					renameTitle={handleTitle_rename}
					renameFranchise={handleFranchise_rename}
					handleKeyPress={handleKeyPress}
				/>

				<HeaderDate
					date={video.date}
					handleModal={handleModal}
					handleDate={handleDate}
					handleKeyPress={handleKeyPress}
				/>

				<HeaderQuality video={video} />
			</div>

			<HeaderNext video={video} />
		</header>
	)
}

const HeaderTitle = ({ video, handleModal, renameTitle, renameFranchise, handleKeyPress }) => {
	const copyFranchise = async () => await navigator.clipboard.writeText(video.franchise)

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
								ref={input => input && input.focus()}
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
								ref={input => input && input.focus()}
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

const HeaderDate = ({ date, handleModal, handleDate, handleKeyPress }) => (
	<>
		<ContextMenuTrigger id='menu__date' renderTag='span'>
			<div className='header__date btn btn-sm btn-outline-primary'>
				<i className={`${config.theme.fa} fa-calendar-check`} />
				{date.published}
			</div>
		</ContextMenuTrigger>

		<ContextMenu id='menu__date'>
			<MenuItem
				onClick={() => {
					handleModal(
						'Change Time',
						<input
							type='text'
							ref={input => input && input.focus()}
							onKeyDown={e => handleKeyPress(e, handleDate)}
						/>
					)
				}}
			>
				<i className={`${config.theme.fa} fa-edit`} />
				Edit Date
			</MenuItem>
		</ContextMenu>
	</>
)

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
