import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      res.json(
        await prisma.video.findMany({
          select: { id: true, name: true, path: true },
          where: { stars: { some: { starID: parseInt(id) } } },
          orderBy: [{ franchise: 'asc' }, { episode: 'asc' }]
        })
      )
    }
  }

  res.status(400)
}
