import type { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.bookmarkAttributes.deleteMany({ where: { bookmarkID: parseInt(id) } })

      res.end()
    }
  }

  res.status(400)
}
