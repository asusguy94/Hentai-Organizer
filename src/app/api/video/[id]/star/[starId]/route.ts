import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'

//NEXT /video/[id]
export async function DELETE(req: Request, { params }: Params<['id', 'starId']>) {
  const id = parseInt(params.id)
  const starId = parseInt(params.starId)

  return NextResponse.json(
    await db.videoStars.delete({
      where: { starID_videoID: { videoID: id, starID: starId } }
    })
  )
}
