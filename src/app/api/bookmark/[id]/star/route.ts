import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function POST(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { starID } = validate(
    z.object({
      starID: z.number().int().positive()
    }),
    await req.json()
  )

  return Response.json(
    await db.bookmark.update({
      where: { id },
      data: { starID }
    })
  )
}

export async function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return Response.json(
    await db.bookmark.update({
      where: { id },
      data: { star: { disconnect: true } }
    })
  )
}
