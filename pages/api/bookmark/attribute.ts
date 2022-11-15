import type { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { bookmarkID, attributeID, starID, videoID } = validate(
      Joi.object({
        bookmarkID: Joi.number().integer().min(1),
        attributeID: Joi.number().integer().min(1).required(),
        starID: Joi.number().integer().min(1),
        videoID: Joi.number().integer().min(1)
      })
        .with('starID', 'videoID')
        .xor('starID', 'bookmarkID'),
      req.body
    )

    const insertHandler = async (bookmarkID: number, attributeID: number): Promise<void> => {
      await prisma.bookmarkAttributes.create({ data: { attributeID, bookmarkID } })
    }

    if (starID !== undefined && videoID !== undefined) {
      const result = await prisma.bookmark.findMany({
        where: { videoID: parseInt(videoID), starID: parseInt(starID) }
      })

      for await (const data of result) {
        await insertHandler(data.id, parseInt(attributeID))
      }
    } else {
      await insertHandler(parseInt(bookmarkID), parseInt(attributeID))
    }

    res.end()
  }

  res.status(400)
}
