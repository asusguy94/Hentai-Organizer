import { NextResponse } from 'next/server'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'

//NEXT /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const video = await prisma.video.findFirstOrThrow({ where: { id } })

  return NextResponse.json(
    await prisma.star.findMany({
      where: { videos: { some: { video: { franchise: video.franchise } } } },
      select: { id: true, name: true }
    })
  )
}
