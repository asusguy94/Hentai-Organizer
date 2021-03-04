import React, { Component } from 'react'

import Axios from 'axios'
import ScrollToTop from 'react-scroll-to-top'
import capitalize from 'capitalize'

import Indeterminate from '../indeterminate/indeterminate'
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
				stars = stars.map(star => {
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
			<div className='search-page col-12 row'>
				<Sidebar
					starData={{
						breasts: this.state.breasts,
						eyecolors: this.state.eyecolors,
						haircolors: this.state.haircolors,
						hairstyles: this.state.hairstyles,
						attributes: this.state.attributes
					}}
					stars={this.state.stars}
					update={stars => this.setState({ stars })}
				/>

				<Stars stars={this.state.stars} />

				<ScrollToTop smooth />
			</div>
		)
	}
}

// Wrapper
const Sidebar = ({ starData, stars, update }) => (
	<aside className='col-2'>
		<TitleSearch stars={stars} update={update} />

		<Sort stars={stars} update={update} />

		<Filter stars={stars} update={update} starData={starData} />
	</aside>
)

const Stars = ({ stars }) => (
	<section id='stars' className='col-10'>
		<h2 className='text-center'>
			<span className='count'>{getCount(stars)}</span> Stars
		</h2>

		<div className='row justify-content-center'>
			{stars.length ? (
				stars.map(star => (
					<a
						key={star.id}
						href={`/star/${star.id}`}
						className={`star ribbon-container card ${isHidden(star) ? 'd-none' : ''}`}
					>
						<img className='card-img-top' src={`${config.source}/images/stars/${star.id}.jpg`} alt='star' />

						<span className='title card-title text-center'>{star.name}</span>
					</a>
				))
			) : (
				<Loader />
			)}
		</div>
	</section>
)

// Container
const Sort = ({ stars, update }) => {
	const sortDefault = (reverse = false) => {
		stars.sort((a, b) => {
			let valA = a.name.toLowerCase()
			let valB = b.name.toLowerCase()

			return valA.localeCompare(valB, 'en')
		})

		if (reverse) stars.reverse()
		update(stars)
	}

	return (
		<>
			<h2>Sort</h2>
			<SortItem name='A-Z' label='alphabetically' callback={() => sortDefault()} checked={true} />
			<SortItem name='Z-A' label='alphabetically_desc' callback={() => sortDefault(true)} />
		</>
	)
}

const Filter = ({ stars, starData, update }) => {
	const breast = target => {
		stars = stars.map(star => {
			star.hidden.noBreast = false
			star.hidden.breast = star.breast.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const haircolor = target => {
		stars = stars.map(star => {
			star.hidden.haircolor = star.haircolor.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const hairstyle = target => {
		stars = stars.map(star => {
			star.hidden.hairstyle = star.hairstyle.toLowerCase() !== target.toLowerCase()

			return star
		})

		update(stars)
	}

	const attribute = (e, target) => {
		const targetLower = target.toLowerCase()

		stars = stars.map(star => {
			if (e.target.indeterminate) {
				const match = star.attributes.some(location => location.toLowerCase() === targetLower)

				if (match) {
					star.hidden.notAttribute.push(targetLower)
				} else {
					// Remove checked-status from filtering
					star.hidden.attribute.splice(star.hidden.attribute.indexOf(targetLower), 1)
				}
			} else if (!e.target.checked) {
				const match = star.attributes.map(attribute => attribute.toLowerCase()).includes(targetLower)

				if (match) {
					// Remove indeterminate-status from filtering
					star.hidden.notAttribute.splice(star.hidden.notAttribute.indexOf(targetLower), 1)
				}
			} else {
				const match = !star.attributes.map(attribute => attribute.toLowerCase()).includes(targetLower)

				if (match) star.hidden.attribute.push(targetLower)
			}

			return star
		})

		update(stars)
	}

	const breast_ALL = () => {
		stars = stars.map(star => {
			star.hidden.breast = false
			star.hidden.noBreast = false

			return star
		})

		update(stars)
	}

	const haircolor_ALL = () => {
		stars = stars.map(star => {
			star.hidden.haircolor = false

			return star
		})

		update(stars)
	}

	const hairstyle_ALL = () => {
		stars = stars.map(star => {
			star.hidden.hairstyle = false

			return star
		})

		update(stars)
	}

	return (
		<>
			<FilterItem
				data={starData.breasts}
				obj={stars}
				label='breast'
				callback={breast}
				globalCallback={breast_ALL}
			/>

			<FilterItem
				data={starData.haircolors}
				obj={stars}
				label='haircolor'
				callback={haircolor}
				globalCallback={haircolor_ALL}
			/>

			<FilterItem
				data={starData.hairstyles}
				obj={stars}
				label='hairstyle'
				callback={hairstyle}
				globalCallback={hairstyle_ALL}
			/>

			<FilterObj
				data={starData.attributes}
				obj={stars}
				label='attribute'
				labelPlural='attributes'
				callback={attribute}
			/>
		</>
	)
}

const TitleSearch = ({ stars, update }) => {
	const callback = e => {
		const searchValue = e.target.value.toLowerCase()

		stars = stars.map(star => {
			star.hidden.titleSearch = !star.name.toLowerCase().includes(searchValue)

			return star
		})

		update(stars)
	}

	return (
		<div className='input-wrapper'>
			<input type='text' placeholder='Name' autoFocus onChange={callback} />
		</div>
	)
}

// ContainerItem
const FilterItem = ({ data, label, obj, callback, globalCallback = null, nullCallback = null }) => (
	<>
		<h2>{capitalize(label, true)}</h2>

		<div id={label}>
			{globalCallback !== null ? (
				<div className='input-wrapper'>
					<input
						type='radio'
						name={label}
						id={`${label}_ALL`}
						onChange={() => globalCallback()}
						defaultChecked
					/>
					<label className='global-category' htmlFor={`${label}_ALL`}>
						ALL
					</label>
				</div>
			) : null}

			{nullCallback !== null ? (
				<div className='input-wrapper'>
					<input type='radio' name={label} id={`${label}_NULL`} onChange={e => nullCallback(e)} />
					<label className='global-category' htmlFor={`${label}_NULL`}>
						NULL
					</label>
				</div>
			) : null}

			{data.map(item => (
				<div className='input-wrapper' key={item}>
					<input type='radio' name={label} id={`${label}-${item}`} onChange={() => callback(item)} />
					<label htmlFor={`${label}-${item}`}>
						{item} <LabelCount prop={label} label={item} obj={obj} isArr={true} />
					</label>
				</div>
			))}
		</div>
	</>
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
					<div className='input-wrapper' key={item}>
						<input
							type='checkbox'
							name={label}
							id={`${label}-${item}`}
							onChange={e => {
								indeterminate.handleIndeterminate(e)
								callback(e, item)
							}}
						/>
						<label htmlFor={`${label}-${item}`}>
							{item} <LabelCount prop={labelPlural} label={item} obj={obj} />
						</label>
					</div>
				))}
			</div>
		</>
	)
}

const SortItem = ({ callback, label, name, checked = false, disabled = false }) => (
	<div className={`input-wrapper ${disabled ? 'disabled' : ''}`}>
		<input type='radio' name='sort' id={label} onChange={callback} defaultChecked={checked} />
		<label htmlFor={label}>{name}</label>
	</div>
)

export default StarSearchPage
