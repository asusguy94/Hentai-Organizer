import { useState, useEffect } from 'react'

import {
	Grid,
	Button,
	Table,
	TableContainer,
	TableBody,
	TableRow,
	TableCell,
	TableHead,
	Typography,
	Paper
} from '@mui/material'

import Axios from 'axios'

import Loader from '@components/loader/loader'

import { server as serverConfig } from '@/config'

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
		Axios.post(`${serverConfig.source}/video`)
			.then(({ data }) => setVideos(data))
			.finally(() => setLoaded(true))
	}, [])

	return (
		<Grid className='text-center'>
			<Typography style={{ marginBottom: 8 }}>Import Videos</Typography>

			{loaded ? (
				!videos.length ? (
					<div className='text-center'>
						<Action
							label='Generate Thumbnails'
							callback={() => Axios.post(`${serverConfig.source}/generate/thumb`)}
						/>
						<Action
							label='Generate Metadata'
							callback={() => Axios.post(`${serverConfig.source}/generate/meta`)}
						/>
						<Action label='Generate VTT' disabled={true} />
					</div>
				) : (
					<>
						<TableContainer component={Paper}>
							<Table size='small'>
								<TableHead>
									<TableRow>
										<TableCell>episode</TableCell>
										<TableCell>franchise</TableCell>
										<TableCell>title</TableCell>
										<TableCell>path</TableCell>
									</TableRow>
								</TableHead>

								<TableBody>
									{videos.map((video) => {
										return (
											<TableRow key={video.path}>
												<TableCell>{video.episode}</TableCell>
												<TableCell>{video.franchise}</TableCell>
												<TableCell>{video.name}</TableCell>
												<TableCell>{video.path}</TableCell>
											</TableRow>
										)
									})}
								</TableBody>
							</Table>
						</TableContainer>

						<div style={{ marginTop: 8 }}>
							<Action
								label='Add Videos'
								callback={() =>
									Axios.post(`${serverConfig.source}/video/add`, { videos }).then(() => {
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
		</Grid>
	)
}

interface IButton {
	label: string
	callback?: () => void
	disabled?: boolean
}
const Action = ({ label, callback = () => {}, disabled = false }: IButton) => {
	const [isDisabled, setIsDisabled] = useState(disabled)

	const clickHandler = () => {
		if (!isDisabled) {
			setIsDisabled(true)

			callback()
		}
	}

	return (
		<Button
			variant='outlined'
			color='primary'
			disabled={isDisabled}
			onClick={clickHandler}
			style={{ marginLeft: 6, marginRight: 6 }}
		>
			{label}
		</Button>
	)
}

export default AddVideoPage
