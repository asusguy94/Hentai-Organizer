import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function DELETE(req: Request, { params }: Params<['id', 'attributeId']>) {
  const { id, attributeId } = validate(
    z.object({
      id: z.coerce.number(),
      attributeId: z.coerce.number()
    }),
    params
  )

  return Response.json(
    await db.bookmarkAttributes.delete({
      where: { attributeID_bookmarkID: { bookmarkID: id, attributeID: attributeId } }
    })
  )
}
