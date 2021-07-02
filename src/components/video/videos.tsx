import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Grid, List, ListItem, ListItemText } from '@material-ui/core'

import Axios from 'axios'

import config from '../config.json'

interface IVideo {
	id: number
	name: string
}

const VideosPage = () => {
	const [videos, setVideos] = useState<IVideo[]>([])

	useEffect(() => {
		Axios.get(`${config.api}/video`).then(({ data }) => setVideos(data))
	}, [])

	return (
		<Grid item id='videos-page'>
			<List>
				{videos.map((video) => (
					<Link key={video.id} to={`video/${video.id}`}>
						<ListItem button divider>
							<ListItemText>{video.name}</ListItemText>
						</ListItem>
					</Link>
				))}
			</List>
		</Grid>
	)
}

export default VideosPage
