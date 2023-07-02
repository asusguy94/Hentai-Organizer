import Client, { HomeProps } from './client'

import prisma from '@utils/server/prisma'

const HomePage = async () => {
  type Props = HomeProps['data'][number]

  const cols = 16

  const recent: Props = {
    cols,
    label: 'recent',
    videos: (
      await prisma.video.findMany({
        where: { noStar: false },
        select: { id: true, name: true, cover: true },
        orderBy: { id: 'desc' },
        take: 1 * cols
      })
    ).map(({ cover, ...video }) => ({
      ...video,
      image: cover
    }))
  }

  const newest: Props = {
    cols,
    label: 'newest',
    videos: (
      await prisma.video.findMany({
        where: { noStar: false },
        select: { id: true, name: true, cover: true },
        orderBy: { date_published: 'desc' },
        take: 1 * cols
      })
    ).map(({ cover, ...video }) => ({
      ...video,
      image: cover
    }))
  }

  const popular: Props = {
    cols,
    label: 'popular',
    videos: (
      await prisma.video.findMany({
        where: { noStar: false },
        select: { id: true, name: true, cover: true, _count: { select: { plays: true } } },
        orderBy: [{ plays: { _count: 'desc' } }, { date: 'desc' }],
        take: 2 * cols
      })
    ).map(({ cover, _count, ...video }) => ({
      ...video,
      image: cover,
      total: _count.plays
    }))
  }

  return <Client data={[recent, newest, popular]} />
}

export default HomePage
