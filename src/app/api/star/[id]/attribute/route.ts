import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /star/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { name, remove } = validate(
    z.object({
      name: z.string(),
      remove: z.boolean().optional()
    }),
    await req.json()
  )

  const { id: attributeID } = await prisma.attribute.findFirstOrThrow({ where: { name } })
  if (remove !== undefined) {
    // Remove attribute to star
    return NextResponse.json(
      await prisma.starAttributes.delete({
        where: { attributeID_starID: { starID: id, attributeID } }
      })
    )
  } else {
    // Add attribute to star
    return NextResponse.json(
      await prisma.starAttributes.create({
        data: { starID: id, attributeID }
      })
    )
  }
}
