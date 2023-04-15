import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(await prisma.attribute.findMany({ where: { starOnly: false }, orderBy: { name: 'asc' } }))
  }

  res.status(400)
}
