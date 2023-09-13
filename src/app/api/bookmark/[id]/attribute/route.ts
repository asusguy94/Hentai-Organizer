import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'

//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const bookmarkId = parseInt(params.id)

  return NextResponse.json(
    await db.bookmarkAttributes.deleteMany({
      where: { bookmarkID: bookmarkId }
    })
  )
}
