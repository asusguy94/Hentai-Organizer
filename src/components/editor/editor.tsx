import React, { FC, useState, useEffect, cloneElement } from 'react'

import {
	Grid,
	Button,
	Table,
	TableContainer,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	TextField,
	Paper,
	Checkbox
} from '@material-ui/core'

import Axios from 'axios'
import capitalize from 'capitalize'

import './editor.scss'

import config from '../config.json'

const EditorPage = () => (
	<Grid container justify='center' id='editor-page'>
		<Wrapper label='attributes' name='attribute' obj={['starOnly', 'videoOnly']} />
		<Wrapper label='categories' name='category' />
	</Grid>
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
		<Grid item xs={3} style={{ paddingLeft: 3 * 8, paddingRight: 3 * 8 }}>
			<Grid container justify='center' style={{ marginBottom: 10 }}>
				<Grid item component='h2'>
					{capitalize(label)}
				</Grid>

				<Grid item>
					<TextField
						onChange={handleChange}
						onKeyPress={handleKeyPress}
						style={{ marginLeft: 5, marginRight: 5 }}
					/>

					<Button
						variant='contained'
						color='primary'
						size='small'
						onClick={handleSubmit}
						style={{ marginTop: 2 }}
					>
						Add {capitalize(name)}
					</Button>
				</Grid>
			</Grid>

			<>{children ? cloneElement(children, { label: name, obj }) : <WrapperItem label={name} obj={obj} />}</>
		</Grid>
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
		<TableContainer component={Paper}>
			<Table size='small'>
				<TableHead>
					<TableRow>
						<TableCell>ID</TableCell>
						<TableCell>{capitalize(label)}</TableCell>

						{obj.map((label: any) => (
							<TableCell key={label}>{label}</TableCell>
						))}
					</TableRow>
				</TableHead>

				<TableBody>
					{data.map((item: any) => (
						<Item
							key={item.id}
							obj={obj}
							data={item}
							update={(ref: any, value: any) => updateItem(ref, value)}
						/>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	)
}

const Item = ({ update, data, obj }: any) => {
	const [edit, setEdit] = useState(false)
	const [value, setValue] = useState<null | string>(null)

	const save = () => {
		setEdit(false)

		if (value) update(data, value)
	}

	const setCondition = (
		ref: { id: number; name: string; videoOnly: boolean; starOnly: boolean },
		prop: string,
		value: number,
		checkbox: any
	) => {
		Axios.put(`${config.api}/attribute/${ref.id}`, { label: prop, value }).catch(() => {
			checkbox.checked = !checkbox.checked
		})
	}

	return (
		<TableRow>
			<TableCell>{data.id}</TableCell>
			<TableCell>
				{edit ? (
					<TextField
						type='text'
						defaultValue={data.name}
						autoFocus
						onBlur={save}
						onKeyPress={(e) => {
							if (e.key === 'Enter') save()
						}}
						onChange={(e) => setValue(e.currentTarget.value)}
					/>
				) : (
					<span onClick={() => setEdit(true)}>{data.name}</span>
				)}
			</TableCell>

			{obj.map((item) => (
				<TableCell key={item} className='py-0'>
					<Checkbox
						defaultChecked={!!data[item]}
						onChange={(e) => setCondition(data, item, Number(e.currentTarget.checked), e.currentTarget)}
					/>
				</TableCell>
			))}
		</TableRow>
	)
}

export default EditorPage
