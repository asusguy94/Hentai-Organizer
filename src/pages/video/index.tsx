import { GetServerSideProps, InferGetServerSidePropsType, NextPage } from 'next/types'

import { Grid, List, ListItemButton, ListItemText, Typography } from '@mui/material'
import dayjs from 'dayjs'

import Link from '@components/link'

import prisma from '@utils/server/prisma'
import { General } from '@interfaces'

export const getServerSideProps: GetServerSideProps<{ videos: General[] }> = async () => {
  const last10Years = dayjs().subtract(10, 'year').toDate()

  const videos = await prisma.video.findMany({
    select: { id: true, name: true },
    where: { noStar: false, bookmarks: { some: { star: null } }, date_published: { gt: last10Years } },
    orderBy: [{ date_published: 'desc' }, { id: 'desc' }],
    take: 500
  })

  return {
    props: {
      videos
    }
  }
}

const VideosPage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({ videos }) => (
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

export default VideosPage
