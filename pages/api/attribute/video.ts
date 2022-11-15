import type { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(await prisma.attribute.findMany({ where: { starOnly: false }, orderBy: { name: 'asc' } }))
  }

  res.status(400)
}
