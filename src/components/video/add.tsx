import { useState, useEffect } from 'react'

import Axios from 'axios'

import Loader from '../loader/loader'

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
		<div className='col-12'>
			<h2 className='text-center'>Import Videos</h2>
			{loaded ? (
				!videos.length ? (
					<div className='text-center'>
						<Button
							label='Generate Thumbnails'
							callback={() => Axios.post(`${config.source}/generate/thumb`)}
						/>
						<Button
							label='Generate Metadata'
							callback={() => Axios.post(`${config.source}/generate/meta`)}
						/>
						<Button label='Generate VTT' disabled={true} />
					</div>
				) : (
					<>
						<table className='table table-sm table-striped'>
							<thead>
								<tr>
									<th>episode</th>
									<th>franchise</th>
									<th>title</th>
									<th>path</th>
								</tr>
							</thead>

							<tbody>
								{videos.map((video) => {
									return (
										<tr key={video.path}>
											<td>{video.episode}</td>
											<td>{video.franchise}</td>
											<td>{video.name}</td>
											<td>{video.path}</td>
										</tr>
									)
								})}
							</tbody>
						</table>

						<div className='text-center'>
							<Button
								label='Add Videos'
								callback={() =>
									Axios.post(`${config.source}/video/add`, { videos }).then(() => {
										window.location.reload()
									})
								}
							/>
						</div>
					</>
				)
			) : (
				<Loader />
			)}
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

export default AddVideoPage
