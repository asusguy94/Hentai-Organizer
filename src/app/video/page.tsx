import Client from './client'

import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

const VideosPage = async () => {
  const limit = 7

  const noBookmarkStar = await prisma.video.findMany({
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

  return (
    <Client video={{ noBookmarks, noStars }} stars={{ noImage: noStarImage }} bookmarks={{ noStar: noBookmarkStar }} />
  )
}

export default VideosPage
