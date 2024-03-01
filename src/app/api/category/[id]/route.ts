import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /editor
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

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
