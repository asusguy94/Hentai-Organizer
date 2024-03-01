import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { time, categoryID } = validate(
    z.object({
      time: z.number().int().positive().optional(),
      categoryID: z.number().int().positive().optional()
    }),
    await req.json()
  )

  if (time !== undefined) {
    // Change BookmarkTime
    return Response.json(
      await db.bookmark.update({
        where: { id },
        data: { start: time }
      })
    )
  } else if (categoryID !== undefined) {
    // Change CategoryID
    return Response.json(
      await db.bookmark.update({
        where: { id },
        data: { categoryID }
      })
    )
  }
}

//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return Response.json(
    await db.bookmark.delete({
      where: { id }
    })
  )
}
