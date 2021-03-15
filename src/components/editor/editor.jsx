import { useState, useEffect, cloneElement } from 'react'

import Axios from 'axios'
import capitalize from 'capitalize'

import './editor.scss'

import config from '../config.json'

const EditorPage = () => (
	<div id='editor-page' className='col-12 row'>
		<Wrapper label='attributes' name='attribute' obj={['starOnly', 'videoOnly']} />
		<Wrapper label='categories' name='category' />
	</div>
)

const Wrapper = ({ label, name, children, obj = [] }) => {
	const [input, setInput] = useState('')

	const handleChange = e => setInput(e.target.value)

	const handleSubmit = () => {
		if (input.length) {
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
				<h2 className='col-6'>{capitalize(label)}</h2>

				<div className='mt-1 col-6'>
					<input type='text' className='px-1' onChange={handleChange} onKeyPress={handleKeyPress} />
					<div className='btn btn-sm btn-primary mb-1' onClick={handleSubmit}>
						Add {capitalize(name)}
					</div>
				</div>
			</header>

			<>{children ? cloneElement(children, { label: name, obj }) : <WrapperItem label={name} obj={obj} />}</>
		</div>
	)
}

const WrapperItem = ({ label, obj = [] }) => {
	const [data, setData] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/${label}`).then(({ data }) => {
			data.sort((a, b) => a.id - b.id)

			setData(data)
		})
	}, [])

	const updateItem = (ref, value) => {
		Axios.put(`${config.api}/${label}/${ref.id}`, { value }).then(() => {
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

					{obj.map(label => (
						<th key={label}>{label}</th>
					))}
				</tr>
			</thead>

			<tbody>
				{data.map(item => (
					<Item key={item.id} obj={obj} data={item} update={(ref, value) => updateItem(ref, value)} />
				))}
			</tbody>
		</table>
	)
}

const Item = ({ update, data, obj }) => {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState(null)

	const save = () => {
		setEdit(false)

		if (value) update(data, value)
	}

	const setCondition = (ref, prop, value, checkbox) => {
		Axios.put(`${config.api}/attribute/${ref.id}`, { label: prop, value }).catch(() => {
			checkbox.checked = !checkbox.checked
		})
	}

	const handleKeyPress = e => {
		if (e.key === 'Enter') {
			e.preventDefault()
			save()
		}
	}

	const handleConditionChange = (e, data, prop) => setCondition(data, prop, Number(e.target.checked), e.target)
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

			{obj.map(item => (
				<td key={item}>
					<input
						type='checkbox'
						defaultChecked={data[item]}
						onChange={e => handleConditionChange(e, data, item)}
					/>
				</td>
			))}
		</tr>
	)
}

export default EditorPage
