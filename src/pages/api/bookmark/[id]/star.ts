import { NextApiRequest, NextApiResponse } from 'next/types'

import validate, { z } from '@utils/server/validation'
import prisma from '@utils/server/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { starID } = validate(
        z.object({
          starID: z.number().int().positive()
        }),
        req.body
      )

      res.json(
        await prisma.bookmark.update({
          where: { id: parseInt(id) },
          data: { starID: starID }
        })
      )
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.bookmark.update({ where: { id: parseInt(id) }, data: { star: { disconnect: true } } })

      res.end()
    }
  }

  res.status(400)
}
