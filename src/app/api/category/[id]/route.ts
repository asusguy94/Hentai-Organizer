import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'
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

  return NextResponse.json(
    await prisma.category.update({
      where: { id },
      data: { name: value }
    })
  )
}
