import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'DELETE') {
    const { id, attributeID } = req.query

    if (typeof id === 'string' && typeof attributeID === 'string') {
      await prisma.bookmarkAttributes.delete({
        where: { attributeID_bookmarkID: { bookmarkID: parseInt(id), attributeID: parseInt(attributeID) } }
      })

      res.end()
    }
  }

  res.status(400)
}
