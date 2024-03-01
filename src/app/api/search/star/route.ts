import { formatDate } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import { getUnique } from '@utils/shared'

export const dynamic = 'force-dynamic'

//NEXT /video/search
export async function GET() {
  return Response.json(
    (
      await db.star.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          image: true,
          breast: true,
          haircolor: true,
          hairstyle: true,
          attributes: { select: { attribute: { select: { name: true } } } },
          videos: { select: { video: { select: { date_published: true } } } }
        }
      })
    ).map(star => {
      const published =
        star.videos.length > 0
          ? star.videos
              .map(({ video }) => video)
              .flatMap(v => (v.date_published !== null ? [v.date_published] : []))
              .sort((a, b) => b.getTime() - a.getTime())[0]
          : null

      return {
        ...star,
        attributes: getUnique(star.attributes.map(({ attribute }) => attribute.name)),
        videos: {
          total: star.videos.length,
          last: published ? formatDate(published, true) : null
        }
      }
    })
  )
}
