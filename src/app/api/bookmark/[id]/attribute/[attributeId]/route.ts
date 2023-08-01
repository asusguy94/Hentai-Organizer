import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'

//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<['id', 'attributeId']>) {
  const bookmarkId = parseInt(params.id)
  const attributeId = parseInt(params.attributeId)

  return NextResponse.json(
    await prisma.bookmarkAttributes.delete({
      where: { attributeID_bookmarkID: { bookmarkID: bookmarkId, attributeID: attributeId } }
    })
  )
}