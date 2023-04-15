import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id, starID } = req.query

    if (typeof id === 'string' && typeof starID === 'string') {
      await prisma.videoStars.delete({
        where: { starID_videoID: { videoID: parseInt(id), starID: parseInt(starID) } }
      })

      res.end()
    }
  }

  res.status(400)
}
