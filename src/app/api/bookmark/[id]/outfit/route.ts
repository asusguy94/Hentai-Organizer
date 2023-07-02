import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { outfitID } = validate(
    z.object({
      outfitID: z.number().int().positive()
    }),
    await req.json()
  )

  return NextResponse.json(
    await prisma.bookmark.update({
      where: { id },
      data: { outfitID }
    })
  )
}

//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  return NextResponse.json(
    await prisma.bookmark.update({
      where: { id },
      data: { outfit: { disconnect: true } }
    })
  )
}
