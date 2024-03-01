import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function POST(req: Request) {
  const {
    bookmarkID: bookmarkId,
    attributeID: attributeId,
    starID,
    videoID
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

  if (starID !== undefined && videoID !== undefined) {
    const result = await db.bookmark.findMany({ where: { videoID, starID } })

    const res = []
    for await (const data of result) {
      res.push(await insertHandler(data.id, attributeId))
    }
    return Response.json(res)
  } else if (bookmarkId !== undefined) {
    return Response.json(await insertHandler(bookmarkId, attributeId))
  }
}
