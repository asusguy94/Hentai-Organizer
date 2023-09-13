import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'

//NEXT /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const video = await db.video.findFirstOrThrow({ where: { id } })

  return NextResponse.json(
    await db.star.findMany({
      where: { videos: { some: { video: { franchise: video.franchise } } } },
      select: { id: true, name: true }
    })
  )
}
