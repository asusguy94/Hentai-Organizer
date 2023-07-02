'use client'

import { NextPage } from 'next/types'

import { Grid, List, ListItemButton, ListItemText, Typography } from '@mui/material'

import Link from '@components/link'

import { General } from '@interfaces'

const VideosPage: NextPage<{
  video: { noBookmarks: General[]; noStars: General[] }
  stars: { noImage: General[] }
  bookmarks: { noStar: General[] }
}> = ({ bookmarks, video, stars }) => (
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <Typography variant='h4'>Missing BookmarkStar ({bookmarks.noStar.length})</Typography>
      <List>
        {bookmarks.noStar.map(video => (
          <Link key={video.id} href={`/video/${video.id}`}>
            <ListItemButton divider>
              <ListItemText>{video.name}</ListItemText>
            </ListItemButton>
          </Link>
        ))}
      </List>

      <Typography variant='h4'>Missing StarImage ({stars.noImage.length})</Typography>
      <List>
        {stars.noImage.map(video => (
          <Link key={video.id} href={`/video/${video.id}`}>
            <ListItemButton divider>
              <ListItemText>{video.name}</ListItemText>
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Grid>

    <Grid item xs={6}>
      <Typography variant='h4'>Missing Bookmarks ({video.noBookmarks.length})</Typography>
      <List>
        {video.noBookmarks.map(video => (
          <Link key={video.id} href={`/video/${video.id}`}>
            <ListItemButton divider>
              <ListItemText>{video.name}</ListItemText>
            </ListItemButton>
          </Link>
        ))}
      </List>

      <Typography variant='h4'>Missing Stars ({video.noStars.length})</Typography>
      <List>
        {video.noStars.map(video => (
          <Link key={video.id} href={`/video/${video.id}`}>
            <ListItemButton divider>
              <ListItemText>{video.name}</ListItemText>
            </ListItemButton>
          </Link>
        ))}
      </List>
    </Grid>
  </Grid>
)

export default VideosPage
