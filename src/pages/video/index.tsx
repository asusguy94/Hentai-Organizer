import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'

import { Grid, List, ListItemButton, ListItemText, Typography } from '@mui/material'

import Link from '@components/link'

import prisma from '@utils/server/prisma'
import { General } from '@interfaces'

export const getServerSideProps: GetServerSideProps<{
  video: { noBookmarks: General[]; noStars: General[] }
  stars: { noImage: General[] }
  bookmarks: { noStar: General[] }
}> = async () => {
  const limit = 7

  const noStar = await prisma.video.findMany({
    select: { id: true, name: true },
    where: { noStar: false, bookmarks: { some: { star: null } } },
    orderBy: [{ date_published: 'desc' }, { id: 'desc' }],
    take: limit
  })

  const noStarImage = await prisma.video.findMany({
    select: { id: true, name: true },
    where: { noStar: false, stars: { some: { star: { image: null } } } },
    take: limit
  })

  const noBookmarks = await prisma.video.findMany({
    select: { id: true, name: true },
    where: { noStar: false, bookmarks: { none: {} } },
    take: limit
  })

  const noStars = await prisma.video.findMany({
    select: { id: true, name: true },
    where: { noStar: false, stars: { none: {} } },
    take: limit
  })

  return {
    props: {
      video: { noBookmarks, noStars },
      stars: { noImage: noStarImage },
      bookmarks: { noStar }
    }
  }
}

const VideosPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ bookmarks, video, stars }) => (
  <Grid container spacing={2}>
    <Grid item xs={6}>
      <Typography variant='h4'>Missing BookmarkStar ({bookmarks.noStar.length})</Typography>
      <List>
        {bookmarks.noStar.map(video => (
          <Link key={video.id} href={{ pathname: '/video/[id]', query: { id: video.id } }}>
            <ListItemButton divider>
              <ListItemText>{video.name}</ListItemText>
            </ListItemButton>
          </Link>
        ))}
      </List>

      <Typography variant='h4'>Missing StarImage ({stars.noImage.length})</Typography>
      <List>
        {stars.noImage.map(video => (
          <Link key={video.id} href={{ pathname: '/video/[id]', query: { id: video.id } }}>
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
          <Link key={video.id} href={{ pathname: '/video/[id]', query: { id: video.id } }}>
            <ListItemButton divider>
              <ListItemText>{video.name}</ListItemText>
            </ListItemButton>
          </Link>
        ))}
      </List>

      <Typography variant='h4'>Missing Stars ({video.noStars.length})</Typography>
      <List>
        {video.noStars.map(video => (
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

export default VideosPage
