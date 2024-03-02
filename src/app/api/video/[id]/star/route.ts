import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const stars = await db.star.findMany({
    where: { videos: { some: { videoID: id } } },
    select: {
      id: true,
      name: true,
      image: true,
      attributes: { include: { attribute: { select: { id: true, name: true } } } }
    }
  })

  return Response.json(
    stars.map(star => ({
      ...star,
      attributes: star.attributes.map(({ attribute }) => attribute)
    }))
  )
}

export async function POST(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { name } = validate(
    z.object({
      name: z.string().min(2)
    }),
    await req.json()
  )

  const star = await db.star.upsert({
    where: { name },
    create: { name },
    update: {},
    include: { attributes: { select: { attribute: { select: { id: true, name: true } } } } }
  })
  await db.videoStars.create({ data: { starID: star.id, videoID: id } })

  return Response.json({
    ...star,
    attributes: star.attributes.map(({ attribute }) => attribute)
  })
}
