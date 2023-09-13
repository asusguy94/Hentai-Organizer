import { NextResponse } from 'next/server'

import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function POST(req: Request) {
  const {
    bookmarkID: bookmarkId,
    attributeID: attributeId,
    starID: starId,
    videoID: videoId
  } = validate(
    z.object({
      bookmarkID: z.number().int().positive().optional(),
      attributeID: z.number().int().positive(),
      starID: z.number().int().positive().optional(),
      videoID: z.number().int().positive().optional()
    }),
    await req.json()
  )

  async function insertHandler(bookmarkId: number, attributeId: number) {
    return await db.bookmarkAttributes.upsert({
      where: {
        attributeID_bookmarkID: {
          attributeID: attributeId,
          bookmarkID: bookmarkId
        }
      },
      create: { attributeID: attributeId, bookmarkID: bookmarkId },
      update: {}
    })
  }

  if (starId !== undefined && videoId !== undefined) {
    const result = await db.bookmark.findMany({ where: { videoID: videoId, starID: starId } })

    const res = []
    for await (const data of result) {
      res.push(await insertHandler(data.id, attributeId))
    }
    return NextResponse.json(res)
  } else if (bookmarkId !== undefined) {
    return NextResponse.json(await insertHandler(bookmarkId, attributeId))
  }
}
