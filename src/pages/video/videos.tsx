import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

import { Grid, List, ListItem, ListItemText } from '@material-ui/core'

import Axios from 'axios'

import { server as serverConfig } from '@/config'

interface IVideo {
	id: number
	name: string
}

const VideosPage = () => {
	const [videos, setVideos] = useState<IVideo[]>([])

	useEffect(() => {
		Axios.get(`${serverConfig.api}/video`).then(({ data }) => setVideos(data))
	}, [])

	return (
		<Grid item id='videos-page'>
			<List>
				{videos.map((video) => (
					<Link key={video.id} to={`${video.id}`}>
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
