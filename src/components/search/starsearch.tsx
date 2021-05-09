import React, { Component, useState } from 'react'

import {
	Grid,
	Card,
	CardMedia,
	CardActionArea,
	Box,
	Typography,
	TextField,
	FormControl,
	RadioGroup,
	FormControlLabel,
	Radio,
	Checkbox
} from '@material-ui/core'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import { handler as indeterminateHandler } from '../indeterminate/indeterminate'
import LabelCount from '../labelcount/labelcount'
import { getCount, isHidden } from './helper'
import Loader from '../loader/loader'

import './search.scss'

import config from '../config.json'

//TODO use children-prop instead of coded-children inside component
class StarSearchPage extends Component {
	state = {
		stars: [],

		breasts: [],
		eyecolors: [],
		haircolors: [],
		hairstyles: [],
		attributes: []
	}

	componentDidMount() {
		// Stars
		Axios.get(`${config.api}/search/star`).then(({ data: stars }) => {
			this.setState(() => {
				stars = stars.map((star: any) => {
					star.hidden = {
						titleSearch: false,

						breast: false,
						eyecolor: false,
						haircolor: false,
						hairstyle: false,
						attribute: [],
						notAttribute: []
					}

					return star
				})

				return { stars }
			})
		})

		// starData
		Axios.get(`${config.api}/star`).then(({ data }) => {
			this.setState({
				breasts: data.breast,
				eyecolors: data.eyecolor,
				haircolors: data.haircolor,
				hairstyles: data.hairstyle,
				attributes: data.attribute
			})
		})
	}

	render() {
		return (
			<Grid container id='search-page'>
				<Grid item xs={2}>
				<Sidebar
					starData={{
						breasts: this.state.breasts,
						eyecolors: this.state.eyecolors,
						haircolors: this.state.haircolors,
						hairstyles: this.state.hairstyles,
						attributes: this.state.attributes
					}}
					stars={this.state.stars}
					update={(stars: any) => this.setState({ stars })}
				/>
				</Grid>

				<Grid item container xs={10} justify='center'>
				<Stars stars={this.state.stars} />
				</Grid>

				<ScrollToTop smooth />
			</Grid>
		)
	}
}

// Wrapper
const Sidebar = ({ starData, stars, update }: any) => (
	<>
		<TitleSearch stars={stars} update={update} />

		<Sort stars={stars} update={update} />

		<Filter stars={stars} update={update} starData={starData} />
	</>
)

const Stars = ({ stars }: any) => (
	<Box id='stars'>
		<Typography variant='h6' className='text-center'>
			<span className='count'>{getCount(stars)}</span> Stars
		</Typography>

		<Grid container>
			{stars.length ? (
				stars.map((star: any) => {
					if (isHidden(star)) return null

					return <StarCard key={star.id} star={star} />
				})
			) : (
				<Loader />
			)}
		</Grid>
	</Box>
)

const StarCard = ({ star }: any) => (
	<a href={`/star/${star.id}`}>
						<Card className='star ribbon-container'>
							<CardActionArea>
								<CardMedia component='img' src={`${config.source}/images/stars/${star.id}.jpg`} />

								<Typography className='text-center'>{star.name}</Typography>
							</CardActionArea>
						</Card>
					</a>
)

// Container
interface ISort {
	stars: any[]
	update: any
}

const Sort = ({ stars, update }: ISort) => {
	const sortDefault = (reverse = false) => {
		stars.sort((a: any, b: any) => a.name.toLowerCase().localeCompare(b.name.toLowerCase(), 'en'))

		if (reverse) stars.reverse()
		update(stars)
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
				</RadioGroup>
			</FormControl>
		</>
	)
}

const Filter = ({ stars, starData, update }: any) => {
	const breast = (target: any) => {
		stars = stars.map((star: any) => {
			star.hidden.noBreast = false
			star.hidden.breast = star.breast.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const haircolor = (target: any) => {
		stars = stars.map((star: any) => {
			star.hidden.haircolor = star.haircolor.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const hairstyle = (target: any) => {
		stars = stars.map((star: any) => {
			star.hidden.hairstyle = star.hairstyle.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const attribute = (ref: any, target: any) => {
		const targetLower = target.toLowerCase()

		stars = stars.map((star: any) => {
			if (ref.indeterminate) {
				const match = star.attributes.some((attribute: any) => attribute.toLowerCase() === targetLower)

				if (match) {
					star.hidden.notAttribute.push(targetLower)
				} else {
					// Remove checked-status from filtering
					star.hidden.attribute.splice(star.hidden.attribute.indexOf(targetLower), 1)
				}
			} else if (!ref.checked) {
				const match = star.attributes.map((attribute: any) => attribute.toLowerCase()).includes(targetLower)

				if (match) {
					// Remove indeterminate-status from filtering
					star.hidden.notAttribute.splice(star.hidden.notAttribute.indexOf(targetLower), 1)
				}
			} else {
				const match = !star.attributes.map((attribute: any) => attribute.toLowerCase()).includes(targetLower)

				if (match) star.hidden.attribute.push(targetLower)
			}

			return star
		})

		update(stars)
	}

	const breast_ALL = () => {
		stars = stars.map((star: any) => {
			star.hidden.breast = false
			star.hidden.noBreast = false

			return star
		})

		update(stars)
	}

	const haircolor_ALL = () => {
		stars = stars.map((star: any) => {
			star.hidden.haircolor = false

			return star
		})

		update(stars)
	}

	const hairstyle_ALL = () => {
		stars = stars.map((star: any) => {
			star.hidden.hairstyle = false

			return star
		})

		update(stars)
	}

	return (
		<>
			<FilterRadio
				data={starData.breasts}
				obj={stars}
				label='breast'
				callback={breast}
				globalCallback={breast_ALL}
			/>

			<FilterRadio
				data={starData.haircolors}
				obj={stars}
				label='haircolor'
				callback={haircolor}
				globalCallback={haircolor_ALL}
			/>

			<FilterRadio
				data={starData.hairstyles}
				obj={stars}
				label='hairstyle'
				callback={hairstyle}
				globalCallback={hairstyle_ALL}
			/>

			<FilterCheckBox
				data={starData.attributes}
				obj={stars}
				label='attribute'
				labelPlural='attributes'
				callback={attribute}
			/>
		</>
	)
}

const TitleSearch = ({ stars, update }: any) => {
	const callback = (e: React.ChangeEvent<HTMLInputElement>) => {
		const searchValue = e.currentTarget.value.toLowerCase()

		update(
			stars.map((star: any) => {
			star.hidden.titleSearch = !star.name.toLowerCase().includes(searchValue)

			return star
		})
		)
	}

	return <TextField autoFocus placeholder='Name' onChange={callback} />
}

// ContainerItem
const FilterRadio = ({ data, label, obj, callback, globalCallback = null, nullCallback = null, count = true }: any) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<FormControl>
			<RadioGroup name={label} defaultValue='ALL'>
			{globalCallback !== null ? (
					<FormControlLabel value='ALL' label='ALL' onChange={globalCallback} control={<Radio />} />
			) : null}

			{nullCallback !== null ? (
					<FormControlLabel value='NULL' label='NULL' onChange={nullCallback} control={<Radio />} />
			) : null}

			{data.map((item: any) => (
					<FormControlLabel
						key={item}
						value={item}
						onChange={() => callback(item)}
						label={
							<>
								{item} {count ? <LabelCount prop={label} label={item} obj={obj} isArr /> : null}
							</>
						}
						control={<Radio />}
					/>
			))}
			</RadioGroup>
		</FormControl>
	</>
)

const FilterCheckBox = ({ data, label, labelPlural, obj, callback, nullCallback = null }: any) => (
		<>
			<h2>{capitalize(label, true)}</h2>

		<FormControl>
				{nullCallback !== null ? (
				<IndeterminateItem label='NULL' value='NULL' callback={(ref: any) => nullCallback(ref)} />
				) : null}

				{data.map((item: any) => (
				<IndeterminateItem
					key={item}
					label={
						<>
							{item} <LabelCount prop={labelPlural} label={item} obj={obj} />
						</>
					}
					value={item}
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

export default StarSearchPage
