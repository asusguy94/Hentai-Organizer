import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const star = await db.star.findFirstOrThrow({
    where: { id },
    include: { attributes: { select: { attribute: true } } }
  })

  return Response.json({
    id: star.id,
    name: star.name,
    image: star.image,
    info: {
      breast: star.breast ?? '',
      haircolor: star.haircolor ?? '',
      hairstyle: star.hairstyle ?? '',
      attribute: star.attributes.map(({ attribute }) => attribute.name)
    },
    link: star.starLink
  })
}

export async function PUT(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { name, label, value } = validate(
    z.object({
      name: z.string().optional(),
      label: z.string().optional(),
      value: z.string().optional()
    }),
    await req.json()
  )

  if (name !== undefined) {
    return Response.json(
      await db.star.update({
        where: { id },
        data: { name }
      })
    )
  } else if (label !== undefined && value !== undefined) {
    if (value.length) {
      return Response.json(
        await db.star.update({
          where: { id },
          data: { [label]: value }
        })
      )
    } else {
      return Response.json(
        await db.star.update({
          where: { id },
          data: { [label]: null }
        })
      )
    }
  }
}

export async function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  return Response.json(
    await db.star.delete({
      where: { id }
    })
  )
}
