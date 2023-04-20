import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { bookmarkID, attributeID, starID, videoID } = validate(
      z.object({
        bookmarkID: z.number().int().positive().optional(),
        attributeID: z.number().int().positive(),
        starID: z.number().int().positive().optional(),
        videoID: z.number().int().positive().optional()
      }),
      req.body
    )

    const insertHandler = async (bookmarkID: number, attributeID: number): Promise<void> => {
      await prisma.bookmarkAttributes.upsert({
        where: {
          attributeID_bookmarkID: {
            attributeID,
            bookmarkID
          }
        },
        create: { attributeID, bookmarkID },
        update: {}
      })
    }

    if (starID !== undefined && videoID !== undefined) {
      const result = await prisma.bookmark.findMany({ where: { videoID, starID } })

      for await (const data of result) {
        await insertHandler(data.id, attributeID)
      }
    } else if (bookmarkID !== undefined) {
      await insertHandler(bookmarkID, attributeID)
    }

    res.end()
  }

  res.status(400)
}
