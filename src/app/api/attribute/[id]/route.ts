import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { value, label } = validate(
    z.object({
      value: z.string().or(z.boolean()),
      label: z.string().optional()
    }),
    await req.json()
  )

  if (label !== undefined) {
    if (typeof value === 'boolean') {
      return Response.json(
        await db.attribute.update({
          where: { id },
          data: { [label]: value }
        })
      )
    }
  } else if (typeof value === 'string') {
    return Response.json(
      await db.attribute.update({
        where: { id },
        data: { name: value }
      })
    )
  }
}
