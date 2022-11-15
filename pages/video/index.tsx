import { NextPage } from 'next/types'
import { useState, useEffect } from 'react'

import { Grid, List, ListItem, ListItemText, Typography } from '@mui/material'

import axios from 'axios'

import Link from '@components/link'

import { IGeneral } from '@interfaces'

import { serverConfig } from '@config'

const VideosPage: NextPage = () => {
  const [videos, setVideos] = useState<IGeneral[]>([])

  useEffect(() => {
    axios.get<IGeneral[]>(`${serverConfig.api}/video/missing-star`).then(({ data }) => setVideos(data))
  }, [])

  return (
    <Grid container>
      <Grid item id='videos'>
        <Typography variant='h4'>Without BookmarkStar ({videos.length})</Typography>

        <List>
          {videos.map(video => (
            <Link key={video.id} href={{ pathname: '/video/[id]', query: { id: video.id } }}>
              <ListItem button divider>
                <ListItemText>{video.name}</ListItemText>
              </ListItem>
            </Link>
          ))}
        </List>
      </Grid>
    </Grid>
  )
}

export default VideosPage
