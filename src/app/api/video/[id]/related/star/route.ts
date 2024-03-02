import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const video = await db.video.findFirstOrThrow({ where: { id } })

  return Response.json(
    await db.star.findMany({
      where: { videos: { some: { video: { franchise: video.franchise } } } },
      select: { id: true, name: true }
    })
  )
}
