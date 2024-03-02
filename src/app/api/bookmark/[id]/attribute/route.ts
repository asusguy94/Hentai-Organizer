import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return Response.json(
    await db.bookmarkAttributes.deleteMany({
      where: { bookmarkID: id }
    })
  )
}
