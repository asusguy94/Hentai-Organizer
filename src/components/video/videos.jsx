import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import Axios from 'axios'

import config from '../config.json'

const VideosPage = () => {
	const [data, setData] = useState([])

	useEffect(() => {
		Axios.get(`${config.api}/video`).then(({ data }) => setData(data))
	}, [])

	return (
		<div className='col-12'>
			<div className='list-group'>
				{data.map(video => (
					<li key={video.id} className='list-group-item list-group-item-action'>
						<Link to={`video/${video.id}`}>{video.name}</Link>
					</li>
				))}
			</div>
		</div>
	)
}

export default VideosPage
