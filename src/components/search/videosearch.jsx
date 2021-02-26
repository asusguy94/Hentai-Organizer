import React, { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import Ribbon from '../ribbon/ribbon'
import LabelCount from '../labelcount/labelcount'
import Indeterminate from '../indeterminate/indeterminate'
import { isHidden, getCount } from './helper'
import Loader from '../loader/loader'

import './search.scss'

import config from '../config.json'

class VideoSearchPage extends Component {
	state = {
		videos: [],

		categories: [],
		attributes: []
	}

	render() {
		return (
			<div className='search-page col-12 row'>
				<Sidebar
					videoData={{ categories: this.state.categories, attributes: this.state.attributes }}
					videos={this.state.videos}
					update={videos => this.setState({ videos })}
				/>

				<Videos videos={this.state.videos} />

				<ScrollToTop smooth />
			</div>
		)
	}

	componentDidMount() {
		Axios.get(`${config.api}/search/video`).then(({ data: videos }) => {
			this.setState(() => {
				videos = videos.map(item => {
					item.hidden = {
						category: [],
						notCategory: [],
						attribute: [],
						notAttribute: [],
						titleSearch: false,
						noCategory: false,
						notNoCategory: false
					}

					return item
				})

				return { videos }
			})
		})

		Axios.get(`${config.api}/category`).then(({ data: categories }) => this.setState({ categories }))
		Axios.get(`${config.api}/attribute`).then(({ data: attributes }) => this.setState({ attributes }))
	}
}

// Wrapper
const Videos = ({ videos }) => (
		<section id='videos' className='col-10'>
			{videos.length ? (
				<h2 className='text-center'>
					<span className='count'>{getCount(videos)}</span> Videos
				</h2>
			) : null}

			<div className='row justify-content-center'>
				{videos.length ? (
					videos.map(video => (
						<a
							key={video.id}
							className={`video ribbon-container card ${isHidden(video) ? 'd-none' : ''}`}
							href={`/video/${video.id}`}
						>
							<img
								className='card-img-top'
								src={`${config.source}/images/videos/${video.id}-290.jpg`}
								alt='video'
							/>

							<span className='title card-title text-center'>{video.name}</span>

							<Ribbon label={video.quality} />
						</a>
					))
				) : (
					<Loader />
				)}
			</div>
		</section>
	)

const Sidebar = ({ videos, update, videoData }) => (
		<aside className='col-2'>
			<TitleSearch videos={videos} update={update} />

			<Sort videos={videos} update={update} />

			<Filter videos={videos} update={update} videoData={videoData} />
		</aside>
	)
}

// Container
const Sort = ({ videos, update }) => {
	const sortDefault = (reverse = false) => {
		videos.sort((a, b) => {
			let valA = a.name.toLowerCase()
			let valB = b.name.toLowerCase()

			return valA.localeCompare(valB, 'en')
		})

		if (reverse) videos.reverse()
		update(videos)
	}

	const sortAdded = (reverse = false) => {
		videos.sort((a, b) => a.id - b.id)

		if (reverse) videos.reverse()
		update(videos)
	}

	const sortDate = (reverse = false) => {
		videos.sort((a, b) => new Date(a.date) - new Date(b.date))

		if (reverse) videos.reverse()
		update(videos)
	}

	const sortPlays = (reverse = false) => {
		videos.sort((a, b) => a.plays - b.plays)

		if (reverse) videos.reverse()
		update(videos)
	}

	return (
		<>
			<h2>Sort</h2>

			<SortItem name='A-Z' label='alphabetically' callback={() => sortDefault()} checked={true} />
			<SortItem name='Z-A' label='alphabetically_desc' callback={() => sortDefault(true)} />

			<SortItem name='Recent Upload' label='added_desc' callback={() => sortAdded(true)} />
			<SortItem name='Old Upload' label='added' callback={() => sortAdded()} />

			<SortItem name='Newest' label='date_desc' callback={() => sortDate(true)} />
			<SortItem name='Oldest' label='date' callback={() => sortDate()} />

			<SortItem name='Most Popular' label='plays' callback={() => sortPlays(true)} />
			<SortItem name='Least Popular' label='plays_desc' callback={() => sortPlays()} />
		</>
	)
}

const Filter = ({ videoData, videos, update }) => {
	const category = (e, target) => {
		const targetLower = target.name.toLowerCase()

		videos = videos.map(video => {
			if (e.target.indeterminate) {
				const match = video.categories.some(category => category.toLowerCase() === targetLower)

				if (match) {
					video.hidden.notCategory.push(targetLower)
				} else {
					// Remove checked-status from filtering
					video.hidden.category.splice(video.hidden.category.indexOf(targetLower), 1)
				}
			} else if (!e.target.checked) {
				video.hidden.noCategory = false

				const match = video.categories.map(category => category.toLowerCase()).includes(targetLower)

				if (match) {
					// Remove indeterminate-status from filtering
					video.hidden.notCategory.splice(video.hidden.notCategory.indexOf(targetLower), 1)
				}
			} else {
				const match = !video.categories.map(category => category.toLowerCase()).includes(targetLower)

				if (match) video.hidden.category.push(targetLower)
			}

			return video
		})

		update(videos)
	}

	const attribute = (e, target) => {
		const targetLower = target.name.toLowerCase()

		videos = videos.map(video => {
			if (e.target.indeterminate) {
				const match = video.attributes.some(location => location.toLowerCase() === targetLower)

				if (match) {
					video.hidden.notAttribute.push(targetLower)
				} else {
					// Remove checked-status from filtering
					video.hidden.attribute.splice(video.hidden.attribute.indexOf(targetLower), 1)
				}
			} else if (!e.target.checked) {
				const match = video.attributes.map(attribute => attribute.toLowerCase()).includes(targetLower)

				if (match) {
					// Remove indeterminate-status from filtering
					video.hidden.notAttribute.splice(video.hidden.notAttribute.indexOf(targetLower), 1)
				}
			} else {
				const match = !video.attributes.map(attribute => attribute.toLowerCase()).includes(targetLower)

				if (match) video.hidden.attribute.push(targetLower)
			}

			return video
		})

		update(videos)
	}

	const category_NULL = e => {
		videos = videos.map(video => {
			if (e.target.indeterminate) {
				video.hidden.noCategory = false
				video.hidden.notNoCategory = video.categories.length === 0
			} else if (!e.target.checked) {
				video.hidden.notNoCategory = false
			} else {
				video.hidden.noCategory = video.categories.length !== 0
			}

			return video
		})

		update(videos)
	}

	return (
		<>
			<FilterObj
				data={videoData.categories}
				obj={videos}
				label='category'
				labelPlural='categories'
				callback={category}
				nullCallback={category_NULL}
			/>

			<FilterObj
				data={videoData.attributes}
				obj={videos}
				label='attribute'
				labelPlural='attributes'
				callback={attribute}
			/>
		</>
	)
}

// ContainerItem
const TitleSearch = ({ update, videos }) => {
	const callback = e => {
		const searchValue = e.target.value.toLowerCase()

		videos = videos.map(video => {
			video.hidden.titleSearch = !video.name.toLowerCase().includes(searchValue)

			return video
		})

		update(videos)
	}

	return (
		<div className='input-wrapper'>
			<input type='text' placeholder='Name' autoFocus onChange={callback} />
		</div>
	)
}

const SortItem = ({ callback, label, name, checked = false, disabled = false }) => (
		<div className={`input-wrapper ${disabled ? 'disabled' : ''}`}>
			<input type='radio' name='sort' id={label} onChange={callback} defaultChecked={checked} />
			<label htmlFor={label}>{name}</label>
		</div>
	)

const FilterObj = ({ data, label, labelPlural, obj, callback, nullCallback = null }) => {
	const indeterminate = new Indeterminate()

	return (
		<>
			<h2>{capitalize(label, true)}</h2>

			<div id={label}>
				{nullCallback !== null ? (
					<div className='input-wrapper'>
						<input
							type='checkbox'
							name={label}
							id={`${label}_NULL`}
							onChange={e => {
								indeterminate.handleIndeterminate(e)
								nullCallback(e)
							}}
						/>
						<label className='global-category' htmlFor={`${label}_NULL`}>
							NULL
						</label>
					</div>
				) : null}

				{data.map(item => (
					<div className='input-wrapper' key={item.id}>
						<input
							type='checkbox'
							name={label}
							id={`${label}-${item.name}`}
							onChange={e => {
								indeterminate.handleIndeterminate(e)
								callback(e, item)
							}}
						/>
						<label htmlFor={`${label}-${item.name}`}>
							{item.name} <LabelCount prop={labelPlural} label={item.name} obj={obj} />
						</label>
					</div>
				))}
			</div>
		</>
	)
}

export default VideoSearchPage
