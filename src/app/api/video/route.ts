import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const limit = 7

  const noBookmarkStar = await db.video.findMany({
    select: { id: true, name: true },
    where: { noStar: false, bookmarks: { some: { star: null } } },
    orderBy: [{ date_published: 'desc' }, { id: 'desc' }],
    take: limit
  })

  const noStarImage = await db.video.findMany({
    select: { id: true, name: true },
    where: { noStar: false, stars: { some: { star: { image: null } } } },
    take: limit
  })

  const noBookmarks = await db.video.findMany({
    select: { id: true, name: true },
    where: { noStar: false, bookmarks: { none: {} } },
    take: limit
  })

  const noStars = await db.video.findMany({
    select: { id: true, name: true },
    where: { noStar: false, stars: { none: {} } },
    take: limit
  })

  const slugMissmatch = (
    await db.video.findMany({
      where: { slug: { not: null }, OR: [{ noStar: true }, { bookmarks: { some: {} } }] }
    })
  )
    .filter(video => `${video.slug}.mp4` !== video.path)
    .slice(0, limit)

  return Response.json({
    video: { noBookmarks, noStars, slugMissmatch, unusedStar: [] },
    stars: { noImage: noStarImage },
    bookmarks: { noStar: noBookmarkStar }
  })
}
