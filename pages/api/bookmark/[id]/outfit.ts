import { NextApiRequest, NextApiResponse } from 'next/types'

import { z } from 'zod'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { outfitID } = validate(
        z.object({
          outfitID: z.number().int().min(1)
        }),
        req.body
      )

      await prisma.bookmark.update({ where: { id: parseInt(id) }, data: { outfitID } })

      res.end()
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.bookmark.update({ where: { id: parseInt(id) }, data: { outfit: { disconnect: true } } })

      res.end()
    }
  }

  res.status(400)
}
