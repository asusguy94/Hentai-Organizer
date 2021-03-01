import { Component, useState, useEffect } from 'react'

import Axios from 'axios'
import capitalize from 'capitalize'

import './editor.scss'

import config from '../config.json'

//TODO replace float with flex
//TODO pass down to child using cloneElement
//TODO implement country

const EditorPage = () => (
	<div id='editor-page' className='col-12 row'>
		<AttributesPage />

		<Wrapper label='categories' name='category'>
			<WrapperItem label='category' />
		</Wrapper>
	</div>
)

const Wrapper = ({ label, name, children }) => {
	const [input, setInput] = useState('')

	const handleChange = e => setInput(e.target.value)

	const handleSubmit = () => {
		if (input.length) {
			// lower case is not allowed
			//TODO make red border and display notice
			if (input.toLowerCase() === input) return false

			Axios.post(`${config.api}/${name}`, { name: input }).then(() => {
				window.location.reload()

				//TODO use stateObj instead
			})
		}
	}

	const handleKeyPress = e => {
		if (e.key === 'Enter') {
			e.preventDefault()
			handleSubmit()
		}
	}

	return (
		<div className='col-4'>
			<header className='row'>
				<h2 className='col-4'>{capitalize(label)}</h2>

				<div className='mt-1 col-8'>
					<input type='text' className='px-1' onChange={handleChange} onKeyPress={handleKeyPress} />
					<div className='btn btn-sm btn-primary' onClick={handleSubmit}>
						Add {capitalize(name)}
					</div>
				</div>
			</header>

			{children}
		</div>
	)
}

const WrapperItem = ({ label }) => {
	const [data, setData] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/${label}`).then(({ data }) => {
			data.sort((a, b) => a.id - b.id)

			setData(data)
		})
	}, [])

	const updateItem = (ref, value) => {
		Axios.put(`${config.api}/attribute/${ref.id}`, { value }).then(() => {
			setData(
				data.filter(item => {
					if (ref.id === item.id) item.name = value

					return item
				})
			)
		})
	}

	return (
		<table className='table table-striped'>
			<thead>
				<tr>
					<th>ID</th>
					<th>{capitalize(label)}</th>
				</tr>
			</thead>

			<tbody>
				{data.map(item => (
					<Item key={item.id} data={item} update={(ref, value) => updateItem(ref, value)} />
				))}
			</tbody>
		</table>
	)
}

const Item = ({ update, data }) => {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState(null)

	const save = () => {
		setEdit(false)

		if (value) update(data, value)
	}

	const handleKeyPress = e => {
		if (e.key === 'Enter') {
			e.preventDefault()
			save()
		}
	}

	const clickHandler = () => setEdit(true)
	const changeHandler = e => setValue(e.target.value)

	return (
		<tr>
			<th>{data.id}</th>
			<td className='btn-link' onClick={clickHandler}>
				{edit ? (
					<input
						type='text'
						defaultValue={data.name}
						autoFocus
						onBlur={save}
						onKeyPress={handleKeyPress}
						onChange={changeHandler}
					/>
				) : (
					<span>{data.name}</span>
				)}
			</td>
		</tr>
	)
}

class AttributesPage extends Component {
	state = {
		input: ''
	}

	handleChange(e) {
		this.setState({ input: e.target.value })
	}

	handleSubmit() {
		const { input } = this.state

		if (input.length) {
			// lower case is not allowed -- make red border and display notice
			if (input.toLowerCase() === input) return false

			Axios.post(`${config.api}/attribute`, { name: input }).then(() => {
				window.location.reload()

				// TODO use stateObj instead
			})
		}
	}

	handleKeyPress(e) {
		if (e.key === 'Enter') {
			e.preventDefault()
			this.handleSubmit()
		}
	}

	render() {
		return (
			<div className={this.props.className}>
				<header className='row'>
					<h2 className='col-5'>Attributes Page</h2>

					<div className='col-7 mt-1'>
						<input
							type='text'
							className='col-6 px-1'
							ref={input => (this.input = input)}
							onChange={this.handleChange.bind(this)}
							onKeyPress={this.handleKeyPress.bind(this)}
						/>
						<div className='btn btn-sm btn-primary float-right' onClick={this.handleSubmit.bind(this)}>
							Add Attribute
						</div>
					</div>
				</header>

				<Attributes />
			</div>
		)
	}
}

class Attributes extends Component {
	state = {
		attributes: []
	}

	componentDidMount() {
		this.getData()
	}

	updateAttribute(ref, value) {
		Axios.put(`${config.api}/attribute/${ref.id}`, { value }).then(() => {
			this.setState(
				this.state.attributes.filter(attribute => {
					if (ref.id === attribute.id) {
						attribute.name = value
					}

					return attribute
				})
			)
		})
	}

	setCondition(ref, prop, value, checkbox) {
		Axios.put(`${config.api}/attribute/${ref.id}`, { label: prop, value }).catch(() => {
			checkbox.checked = !checkbox.checked
		})
	}

	sortID(obj = null) {
		this.setState(prevState => {
			let attributes = obj || prevState.attributes
			attributes.sort(({ id: valA }, { id: valB }) => valA - valB)

			return attributes
		})
	}
	sortName(obj = null) {
		this.setState(prevState => {
			let attributes = obj || prevState.attributes
			attributes.sort(({ name: valA }, { name: valB }) => valA.localeCompare(valB))

			return attributes
		})
	}

	toggleSort(column) {
		switch (column) {
			case 'id':
				this.sortID()
				break
			case 'name':
				this.sortName()
				break
			default:
				console.log(`${column} is not sortable`)
		}
	}

	render() {
		return (
			<table className='table table-striped'>
				<thead>
					<tr>
						<th>ID</th>
						<th>Attribute</th>
						<th>starOnly</th>
						<th>videoOnly</th>
					</tr>
				</thead>

				<tbody>
					{this.state.attributes.map(attribute => (
						<Attribute
							key={attribute.id}
							data={attribute}
							updateAttribute={(ref, value) => this.updateAttribute(ref, value)}
							setCondition={(ref, prop, value, element) => this.setCondition(ref, prop, value, element)}
						/>
					))}
				</tbody>
			</table>
		)
	}

	getData() {
		Axios.get(`${config.api}/attribute`).then(({ data: attributes }) => {
			this.sortID(attributes)
			this.setState({ attributes })
		})
	}
}

class Attribute extends Component {
	constructor(props) {
		super(props)
		this.state = {
			edit: false,
			value: null,
			conditions: { videoOnly: props.data.videoOnly, starOnly: props.data.starOnly }
		}
	}

	saveAttribute() {
		this.setState({ edit: false })

		if (this.state.value) {
			this.props.updateAttribute(this.props.data, this.state.value)
		}
	}

	handleConditionChange(e, attribute, prop) {
		const value = Number(e.target.checked)

		this.props.setCondition(attribute, prop, value, e.target)
	}

	render() {
		const attribute = this.props.data
		const { id, name, starOnly, videoOnly } = attribute

		return (
			<tr>
				<th>{id}</th>
				<td
					className='btn-link'
					onClick={() => {
						this.setState({ edit: true })
					}}
				>
					{this.state.edit ? (
						<input
							type='text'
							defaultValue={name}
							ref={input => input && input.focus()}
							onBlur={this.saveAttribute.bind(this)}
							onKeyPress={e => {
								if (e.key === 'Enter') {
									e.preventDefault()
									this.saveAttribute()
								}
							}}
							onChange={e => {
								this.setState({ value: e.target.value })
							}}
						/>
					) : (
						<span>{name}</span>
					)}
				</td>

				<td>
					<input
						type='checkbox'
						defaultChecked={starOnly}
						onChange={e => this.handleConditionChange(e, attribute, 'starOnly')}
					/>
				</td>

				<td>
					<input
						type='checkbox'
						defaultChecked={videoOnly}
						onChange={e => this.handleConditionChange(e, attribute, 'videoOnly')}
					/>
				</td>
			</tr>
		)
	}
}

export default EditorPage
