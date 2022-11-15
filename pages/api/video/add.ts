import type { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { videos } = validate(
      Joi.object({
        videos: Joi.array()
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
