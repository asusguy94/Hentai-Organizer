import { NextApiRequest, NextApiResponse } from 'next/types'

import { z } from 'zod'

import { prisma, validate } from '@utils/server'

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
      await prisma.bookmarkAttributes.create({ data: { attributeID, bookmarkID } })
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
