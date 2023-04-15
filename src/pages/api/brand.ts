import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(
      (await prisma.video.groupBy({ where: { brand: { not: null } }, by: ['brand'], orderBy: { brand: 'asc' } })).map(
        ({ brand }) => brand
      )
    )
  }

  res.status(400)
}
