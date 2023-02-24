import { NextPage } from 'next/types'

import { Grid, List, ListItemButton, ListItemText, Typography } from '@mui/material'

import Link from '@components/link'
import Spinner from '@components/spinner'

import { videoService } from '@service'

const VideosPage: NextPage = () => {
  const { data: videos } = videoService.useMissingStar()

  if (videos === undefined) return <Spinner />

  return (
    <Grid container>
      <Grid item id='videos'>
        <Typography variant='h4'>Without BookmarkStar ({videos.length})</Typography>

        <List>
          {videos.map(video => (
            <Link key={video.id} href={{ pathname: '/video/[id]', query: { id: video.id } }}>
              <ListItemButton divider>
                <ListItemText>{video.name}</ListItemText>
              </ListItemButton>
            </Link>
          ))}
        </List>
      </Grid>
    </Grid>
  )
}

export default VideosPage
