import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /star/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { name, label, value } = validate(
    z.object({
      name: z.string().optional(),
      label: z.string().optional(),
      value: z.string().optional()
    }),
    await req.json()
  )

  if (name !== undefined) {
    return NextResponse.json(
      await db.star.update({
        where: { id },
        data: { name }
      })
    )
  } else if (label !== undefined && value !== undefined) {
    if (value.length) {
      return NextResponse.json(
        await db.star.update({
          where: { id },
          data: { [label]: value }
        })
      )
    } else {
      return NextResponse.json(
        await db.star.update({
          where: { id },
          data: { [label]: null }
        })
      )
    }
  }
}

//NEXT /star/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return NextResponse.json(
    await db.star.delete({
      where: { id }
    })
  )
}
