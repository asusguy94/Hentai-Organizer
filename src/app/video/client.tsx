'use client'

import { Grid, List, ListItemButton, ListItemText, Typography } from '@mui/material'

import Link from '@components/link'

import { General } from '@interfaces'

type VideosPageProps = {
  video: { noBookmarks: General[]; noStars: General[]; slugMissmatch: General[]; unusedStar: General[] }
  stars: { noImage: General[] }
  bookmarks: { noStar: General[] }
}

export default function VideosPage({ bookmarks, video, stars }: VideosPageProps) {
  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <View label='Missing BookmarkStar' data={bookmarks.noStar} />
        <View label='Missing StarImage' data={stars.noImage} />
      </Grid>

      <Grid item xs={4}>
        <View label='Missing Bookmarks' data={video.noBookmarks} />
        <View label='Missing Stars' data={video.noStars} />
      </Grid>

      <Grid item xs={4}>
        <View label='Slug/Fname Missmatch' data={video.slugMissmatch} />
        <View label='Unused VideoStar' data={video.unusedStar} />
      </Grid>
    </Grid>
  )
}

type ViewProps = {
  data: General[]
  label: string
}
function View({ data, label }: ViewProps) {
  if (data.length === 0) return null

  return (
    <>
      <Typography variant='h4'>
        {label} ({data.length})
      </Typography>
      <List>
        {data.map(video => (
          <Link key={video.id} href={`/video/${video.id}`}>
            <ListItemButton divider>
              <ListItemText>{video.name}</ListItemText>
            </ListItemButton>
          </Link>
        ))}
      </List>
    </>
  )
}
