import { useState, useEffect } from 'react'

import Axios from 'axios'

import config from '../config.json'

interface IVideo {
	path: string
	franchise: string
	episode: string
	name: string
}
const AddVideoPage = () => {
	const [videos, setVideos] = useState<IVideo[]>([])
	const [loaded, setLoaded] = useState(false)

	useEffect(() => {
		Axios.post(`${config.source}/video`)
			.then(({ data }) => setVideos(data))
			.finally(() => setLoaded(true))
	}, [])

	return (
		<div className='row col justify-content-center'>
			<h1 className='text-center'>Add Videos</h1>
			{loaded ? (
				<>
					<form>
						{videos.map((video, key) => (
							<div key={key}>
								<CustomInput label='Path' item={video} />
								<CustomInput label='Name' item={video} />
								<CustomInput label='Franchise' item={video} />
								<CustomInput label='Episode' item={video} />

								<hr />
							</div>
						))}
					</form>

					{videos.length ? (
						<div
							className='btn btn-primary'
							onClick={(e) => {
								Axios.post(`${config.source}/video/add`, { videos }).then(() => {
									window.location.reload()
								})
							}}
						>
							Submit
						</div>
					) : (
						<>
							<Button
								label='Generate Thumbnails'
								callback={() => Axios.post(`${config.source}/generate/thumb`)}
							/>
							<Button label='Generate WebVTT' disabled={true} />
						</>
					)}
				</>
			) : null}
		</div>
	)
}

interface IButton {
	label: string
	callback?: () => void
	disabled?: boolean
}
const Button = ({ label, callback = () => {}, disabled = false }: IButton) => {
	const [isDisabled, setIsDisabled] = useState(disabled)

	const clickHandler = () => {
		if (!isDisabled) {
			setIsDisabled(true)

			callback()
		}
	}

	return (
		<div className={`btn btn-info mx-1 ${isDisabled ? 'disabled' : ''}`} onClick={clickHandler}>
			{label}
		</div>
	)
}

const CustomInput = ({ label, item }: any) => {
	const lowerLabel = label.toLowerCase()
	const data = item[lowerLabel]

	return (
		<div className='form-group'>
			<label htmlFor={lowerLabel}>{label}: </label>
			<input
				id={lowerLabel}
				className='form-control'
				defaultValue={data}
				style={{ width: `${data.length < 4 ? 4 : data.length}ch` }}
			/>
		</div>
	)
}

export default AddVideoPage
