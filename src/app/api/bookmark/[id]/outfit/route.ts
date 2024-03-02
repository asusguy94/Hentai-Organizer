import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function PUT(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { outfitID } = validate(
    z.object({
      outfitID: z.number().int().positive()
    }),
    await req.json()
  )

  return Response.json(
    await db.bookmark.update({
      where: { id },
      data: { outfitID }
    })
  )
}

export async function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return Response.json(
    await db.bookmark.update({
      where: { id },
      data: { outfit: { disconnect: true } }
    })
  )
}
