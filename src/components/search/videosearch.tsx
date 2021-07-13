import React, { useState, useEffect } from 'react'

import {
	Box,
	Card,
	CardActionArea,
	CardMedia,
	Checkbox,
	FormControl,
	FormControlLabel,
	Grid,
	Radio,
	RadioGroup,
	TextField,
	Typography
} from '@material-ui/core'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import Ribbon from '../ribbon/ribbon'
import LabelCount from '../labelcount/labelcount'
import { handler as indeterminateHandler } from '../indeterminate/indeterminate'
import { isHidden, getCount } from './helper'
import Loader from '../loader/loader'

import './search.scss'

import { server as serverConfig } from '../../config'

const VideoSearchPage = () => {
	const [videos, setVideos] = useState([])
	const [categories, setCategories] = useState([])
	const [attributes, setAttributes] = useState([])

	useEffect(() => {
		Axios.get(`${serverConfig.api}/search/video`).then(({ data: videos }) => {
			setVideos(
				videos.filter((video: any) => {
					video.hidden = {
						category: [],
						notCategory: [],
						attribute: [],
						notAttribute: [],
						titleSearch: false,
						noCategory: false,
						notNoCategory: false
					}

					//TODO This code skips videos with .noStar=1
					if (video.noStar) return null

					return video
			})
			)
		})

		Axios.get(`${serverConfig.api}/category`).then(({ data: categories }) => setCategories(categories))
		Axios.get(`${serverConfig.api}/attribute`).then(({ data: attributes }) => setAttributes(attributes))
	}, [])

	return (
		<Grid container id='search-page'>
			<Grid item xs={2}>
				<Sidebar videoData={{ categories, attributes }} videos={videos} update={setVideos} />
			</Grid>

			<Grid item container xs={10} justify='center'>
				<Videos videos={videos} />
			</Grid>

			<ScrollToTop smooth />
		</Grid>
	)
}

// Wrapper
const Videos = ({ videos }: any) => (
	<Box id='videos'>
		{videos.length ? (
			<Typography variant='h6' className='text-center'>
				<span className='count'>{getCount(videos)}</span> Videos
			</Typography>
		) : null}

		<Grid container justify='center'>
			{videos.length ? (
				videos.map((video: any) => {
					if (isHidden(video)) return null

					return <VideoCard key={video.id} video={video} />
				})
			) : (
				<Loader />
			)}
		</Grid>
	</Box>
)

const VideoCard = ({ video }: any) => (
	<a href={`/video/${video.id}`}>
						<Card className='video ribbon-container'>
							<CardActionArea>
				<CardMedia component='img' src={`${serverConfig.source}/images/videos/${video.id}-290.jpg`} />

								<Typography className='text-center'>{video.name}</Typography>

						<Ribbon label={video.quality} />
							</CardActionArea>
						</Card>
					</a>
)

const Sidebar = ({ videos, update, videoData }: any) => (
	<>
		<TitleSearch videos={videos} update={update} />

		<Sort videos={videos} update={update} />

		<Filter videos={videos} update={update} videoData={videoData} />
	</>
)

// Container
const TitleSearch = ({ update, videos }: any) => {
	const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.target.value.toLowerCase()

		update(
			videos.map((video: any) => {
			video.hidden.titleSearch = !video.name.toLowerCase().includes(searchValue)

			return video
		})
		)
	}

	return <TextField autoFocus placeholder='Name' onChange={callback} />
}

const Sort = ({ videos, update }: any) => {
	const sortDefault = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
				const result = a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en')
				return reverse ? result * -1 : result
			})
		)
	}

	const sortAdded = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
				const result = a.id - b.id
				return reverse ? result * -1 : result
			})
		)
	}

	const sortDate = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
			const dateA: any = new Date(a.published)
			const dateB: any = new Date(b.published)

				const result = dateA - dateB
				return reverse ? result * -1 : result
		})
		)
	}

	const sortPlays = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
				const result = a.plays - b.plays
				return reverse ? result * -1 : result
			})
		)
	}

	const sortQuality = (reverse = false) => {
		update(
			[...videos].sort((a: any, b: any) => {
				const result = a.quality - b.quality
				return reverse ? result * -1 : result
			})
		)
	}

	return (
		<>
			<h2>Sort</h2>

			<FormControl>
				<RadioGroup name='sort' defaultValue='alphabetically'>
					<FormControlLabel
						label='A-Z'
						value='alphabetically'
						control={<Radio />}
						onChange={() => sortDefault()}
					/>
					<FormControlLabel
						label='Z-A'
						value='alphabetically_desc'
						control={<Radio />}
						onChange={() => sortDefault(true)}
					/>

					<FormControlLabel
						label='Recent Upload'
						value='added_desc'
						control={<Radio />}
						onChange={() => sortAdded(true)}
					/>
					<FormControlLabel
						label='Old Upload'
						value='added'
						control={<Radio />}
						onChange={() => sortAdded()}
					/>

					<FormControlLabel
						label='Newest'
						value='date_desc'
						control={<Radio />}
						onChange={() => sortDate(true)}
					/>
					<FormControlLabel label='Oldest' value='date' control={<Radio />} onChange={() => sortDate()} />

					<FormControlLabel
						label='Most Popular'
						value='plays'
						control={<Radio />}
						onChange={() => sortPlays(true)}
					/>
					<FormControlLabel
						label='Least Popular'
						value='plays_desc'
						control={<Radio />}
						onChange={() => sortPlays()}
					/>
				</RadioGroup>
			</FormControl>
		</>
	)
}

const Filter = ({ videoData, videos, update }: any) => {
	const category = (ref: any, target: any) => {
		const targetLower = target.name.toLowerCase()

		update(
			videos.map((video: any) => {
			if (ref.indeterminate) {
				const match = video.categories.some((category: any) => category.toLowerCase() === targetLower)

				if (match) {
					video.hidden.notCategory.push(targetLower)
				} else {
					// Remove checked-status from filtering
					video.hidden.category.splice(video.hidden.category.indexOf(targetLower), 1)
				}
			} else if (!ref.checked) {
				video.hidden.noCategory = false

				const match = video.categories.map((category: any) => category.toLowerCase()).includes(targetLower)

				if (match) {
					// Remove indeterminate-status from filtering
					video.hidden.notCategory.splice(video.hidden.notCategory.indexOf(targetLower), 1)
				}
			} else {
				const match = !video.categories.map((category: any) => category.toLowerCase()).includes(targetLower)

				if (match) video.hidden.category.push(targetLower)
			}

			return video
		})
		)
	}

	const attribute = (ref: any, target: any) => {
		const targetLower = target.name.toLowerCase()

		update(
			videos.map((video: any) => {
			if (ref.indeterminate) {
				const match = video.attributes.some((attribute: any) => attribute.toLowerCase() === targetLower)

				if (match) {
					video.hidden.notAttribute.push(targetLower)
				} else {
					// Remove checked-status from filtering
					video.hidden.attribute.splice(video.hidden.attribute.indexOf(targetLower), 1)
				}
			} else if (!ref.checked) {
					const match = video.attributes
						.map((attribute: any) => attribute.toLowerCase())
						.includes(targetLower)

				if (match) {
					// Remove indeterminate-status from filtering
					video.hidden.notAttribute.splice(video.hidden.notAttribute.indexOf(targetLower), 1)
				}
			} else {
					const match = !video.attributes
						.map((attribute: any) => attribute.toLowerCase())
						.includes(targetLower)

				if (match) video.hidden.attribute.push(targetLower)
			}

			return video
		})
		)
	}

	const category_NULL = (ref: any) => {
		update(
			videos.map((video: any) => {
			if (ref.indeterminate) {
				video.hidden.noCategory = false
				video.hidden.notNoCategory = video.categories.length === 0
			} else if (!ref.checked) {
				video.hidden.notNoCategory = false
			} else {
				video.hidden.noCategory = video.categories.length !== 0
			}

			return video
		})
		)
	}

	return (
		<>
			<FilterCheckBox
				data={videoData.categories}
				obj={videos}
				label='category'
				labelPlural='categories'
				callback={category}
				nullCallback={category_NULL}
			/>

			<FilterCheckBox
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
const FilterCheckBox = ({ data, label, labelPlural, obj, callback, nullCallback = null }: any) => (
		<>
			<h2>{capitalize(label, true)}</h2>

		<FormControl>
				{nullCallback !== null ? (
				<IndeterminateItem
					label={<div className='global-category'>NULL</div>}
					value='NULL'
					callback={(ref: any) => nullCallback(ref)}
				/>
				) : null}

				{data.map((item: any) => (
				<IndeterminateItem
					key={item.id}
					label={
						<>
							{item.name} <LabelCount prop={labelPlural} label={item.name} obj={obj} />
						</>
					}
					value={item.name}
					item={item}
					callback={(ref: any, item: any) => callback(ref, item)}
				/>
				))}
		</FormControl>
		</>
	)

const IndeterminateItem = ({ label, value, item = null, callback }: any) => {
	const [indeterminate, setIndeterminate] = useState(false)
	const [checked, setChecked] = useState(false)

	return (
		<FormControlLabel
			label={label}
			value={value}
			control={
				<Checkbox
					checked={checked}
					indeterminate={indeterminate}
					onChange={() => {
						const result = indeterminateHandler({ checked, indeterminate })

						setIndeterminate(result.indeterminate)
						setChecked(result.checked)

						callback(result, item)
					}}
				/>
			}
		/>
	)
}

export default VideoSearchPage
