import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'

import config from '../config.json'

interface IVideo {
	id: number
	name: string
}

const VideosPage = () => {
	const [videos, setVideos] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/video`).then(({ data }) => setVideos(data))
	}, [])

	return (
		<div className='col-12'>
			<div className='list-group'>
				{videos.map((video: IVideo) => (
					<li key={video.id} className='list-group-item list-group-item-action'>
						<Link to={`video/${video.id}`}>{video.name}</Link>
					</li>
				))}
			</div>
		</div>
	)
}

export default VideosPage
