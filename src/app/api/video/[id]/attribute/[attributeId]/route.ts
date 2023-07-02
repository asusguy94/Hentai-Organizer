import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'

//TODO delete this one when finished transfering attributes
//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<['id', 'attributeId']>) {
  if (req.method === 'DELETE') {
    const id = parseInt(params.id)
    const attributeId = parseInt(params.attributeId)

    return NextResponse.json(
      await prisma.bookmarkAttributes.deleteMany({
        where: { bookmark: { videoID: id }, attributeID: attributeId }
      })
    )
  }
}
