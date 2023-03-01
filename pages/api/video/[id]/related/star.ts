import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const video = await prisma.video.findFirstOrThrow({ where: { id: parseInt(id) } })

      res.json(
        await prisma.star.findMany({
          where: { videos: { some: { video: { franchise: video.franchise } } } },
          select: { id: true, name: true }
        })
      )
    }
  }

  res.status(400)
}
