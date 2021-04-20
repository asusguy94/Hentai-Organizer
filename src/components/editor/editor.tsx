import React, { FC } from 'react'
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

const Wrapper: FC<any> = ({ label, name, children, obj = [] }) => {
	const [input, setInput] = useState('')

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

	const handleSubmit = () => {
		if (input.length) {
			if (input.toLowerCase() === input) return false

			Axios.post(`${config.api}/${name}`, { name: input }).then(() => {
				window.location.reload()

				//TODO use stateObj instead
			})
		}
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
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

const WrapperItem = ({ label, obj = [] }: any) => {
	const [data, setData] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/${label}`).then(({ data }) => {
			data.sort((a: any, b: any) => a.id - b.id)

			setData(data)
		})
	}, [])

	const updateItem = (ref: any, value: any) => {
		Axios.put(`${config.api}/${label}/${ref.id}`, { value }).then(() => {
			setData(
				data.filter((item: any) => {
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

					{obj.map((label: any) => (
						<th key={label}>{label}</th>
					))}
				</tr>
			</thead>

			<tbody>
				{data.map((item: any) => (
					<Item
						key={item.id}
						obj={obj}
						data={item}
						update={(ref: any, value: any) => updateItem(ref, value)}
					/>
				))}
			</tbody>
		</table>
	)
}

const Item = ({ update, data, obj }: any) => {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState<null | string>(null)

	const save = () => {
		setEdit(false)

		if (value) update(data, value)
	}

	const setCondition = (ref: any, prop: any, value: any, checkbox: any) => {
		Axios.put(`${config.api}/attribute/${ref.id}`, { label: prop, value }).catch(() => {
			checkbox.checked = !checkbox.checked
		})
	}

	const handleKeyPress = (e: React.KeyboardEvent) => {
		if (e.key === 'Enter') {
			e.preventDefault()
			save()
		}
	}

	const handleConditionChange = (e: any, data: any, prop: any) =>
		setCondition(data, prop, Number(e.target.checked), e.target)
	const clickHandler = () => setEdit(true)
	const changeHandler = (e: React.ChangeEvent<HTMLInputElement>) => setValue(e.currentTarget.value)

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

			{obj.map((item: any) => (
				<td key={item}>
					<input
						type='checkbox'
						defaultChecked={data[item]}
						onChange={(e) => handleConditionChange(e, data, item)}
					/>
				</td>
			))}
		</tr>
	)
}

export default EditorPage
