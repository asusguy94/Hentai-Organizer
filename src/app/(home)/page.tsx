import Client, { HomePageProps } from './client'

import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function HomePage() {
  type Props = HomePageProps['data'][number]

  const cols = 16

  const recent: Props = {
    cols,
    label: 'recent',
    videos: (
      await db.video.findMany({
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
      await db.video.findMany({
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
      await db.video.findMany({
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
