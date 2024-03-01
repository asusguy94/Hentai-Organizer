import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return Response.json(
    await db.video.findMany({
      select: { id: true, name: true, path: true },
      where: { stars: { some: { starID: id } } },
      orderBy: [{ franchise: 'asc' }, { episode: 'asc' }]
    })
  )
}
