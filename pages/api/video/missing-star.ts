import type { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

//TODO add this to search-page
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(
      await prisma.video.findMany({
        select: { id: true, name: true },
        where: { noStar: false, bookmarks: { some: { star: null } } },
        orderBy: { name: 'asc' },
        take: 500
      })
    )
  }

  res.status(400)
}