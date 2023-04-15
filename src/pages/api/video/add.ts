import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { videos } = validate(
      z.object({
        videos: z.array(
          z.object({
            name: z.string(),
            path: z.string(),
            episode: z.number().int(),
            franchise: z.string()
          })
        )
      }),
      req.body
    )

    for await (const video of videos) {
      await prisma.video.create({
        data: { name: video.name, path: video.path, episode: video.episode, franchise: video.franchise }
      })
    }

    res.end()
  }

  res.status(400)
}
