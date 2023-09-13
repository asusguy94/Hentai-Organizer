import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function POST(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

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

  return NextResponse.json({
    ...star,
    attributes: star.attributes.map(({ attribute }) => attribute)
  })
}
