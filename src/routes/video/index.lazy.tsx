import { Grid, List, ListItemButton, ListItemText, Typography } from '@mui/material'

import { Link, createLazyFileRoute } from '@tanstack/react-router'

import { General } from '@/interface'
import { videoService } from '@/service'

export const Route = createLazyFileRoute('/video/')({
  component: VideosPage
})

export default function VideosPage() {
  const { data } = videoService.useVideos()

  if (data === undefined) return null

  return (
    <Grid container spacing={2}>
      <Grid item xs={4}>
        <View label='Missing BookmarkStar' data={data.bookmarks.noStar} />
        <View label='Missing StarImage' data={data.stars.noImage} />
      </Grid>

      <Grid item xs={4}>
        <View label='Missing Bookmarks' data={data.video.noBookmarks} />
        <View label='Missing Stars' data={data.video.noStars} />
      </Grid>

      <Grid item xs={4}>
        <View label='Slug/Fname Missmatch' data={data.video.slugMissmatch} />
        <View label='Unused VideoStar' data={data.video.unusedStar} />
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
          <Link key={video.id} to='/video/$videoId' params={{ videoId: video.id }}>
            <ListItemButton divider>
              <ListItemText>{video.name}</ListItemText>
            </ListItemButton>
          </Link>
        ))}
      </List>
    </>
  )
}
