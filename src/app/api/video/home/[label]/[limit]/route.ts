import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<['label', 'limit']>) {
  const { label, limit } = validate(
    z.object({
      label: z.enum(['recent', 'newest']),
      limit: z.coerce.number()
    }),
    params
  )

  switch (label) {
    case 'recent':
      return Response.json(
        (
          await db.video.findMany({
            where: { noStar: false },
            select: { id: true, name: true, cover: true },
            orderBy: { id: 'desc' },
            take: limit
          })
        ).map(({ cover, ...video }) => ({
          ...video,
          image: cover
        }))
      )
    case 'newest':
      return Response.json(
        (
          await db.video.findMany({
            where: { noStar: false },
            select: { id: true, name: true, cover: true },
            orderBy: { date_published: 'desc' },
            take: limit
          })
        ).map(({ cover, ...video }) => ({
          ...video,
          image: cover
        }))
      )
  }
}
