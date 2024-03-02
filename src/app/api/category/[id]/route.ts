import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function PUT(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { value } = validate(
    z.object({
      value: z.string()
    }),
    await req.json()
  )

  return Response.json(
    await db.category.update({
      where: { id },
      data: { name: value }
    })
  )
}
