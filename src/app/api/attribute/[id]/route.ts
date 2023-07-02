import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /editor
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { value, label } = validate(
    z.object({
      value: z.string().or(z.boolean()),
      label: z.string().optional()
    }),
    req.body
  )

  if (label !== undefined) {
    if (typeof value === 'boolean') {
      return NextResponse.json(
        await prisma.attribute.update({
          where: { id },
          data: { [label]: value }
        })
      )
    }
  } else if (typeof value === 'string') {
    return NextResponse.json(
      await prisma.attribute.update({
        where: { id },
        data: { name: value }
      })
    )
  }
}
