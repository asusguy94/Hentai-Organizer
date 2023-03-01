import { NextApiRequest, NextApiResponse } from 'next/types'

import { z } from 'zod'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { starID } = validate(
        z.object({
          starID: z.number().int().min(1)
        }),
        req.body
      )

      res.json(await prisma.bookmark.update({ where: { id: parseInt(id) }, data: { starID: starID } }))
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
