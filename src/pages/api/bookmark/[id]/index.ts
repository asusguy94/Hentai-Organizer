import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { time, categoryID } = validate(
        z.object({
          time: z.number().int().positive().optional(),
          categoryID: z.number().int().positive().optional()
        }),
        req.body
      )

      if (time !== undefined) {
        // Change BookmarkTime
        res.json(await prisma.bookmark.update({ where: { id: parseInt(id) }, data: { start: time } }))
      } else if (categoryID !== undefined) {
        // Change CategoryID
        res.json(
          await prisma.bookmark.update({
            where: { id: parseInt(id) },
            data: { categoryID }
          })
        )
      }
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.bookmark.delete({ where: { id: parseInt(id) } })

      res.end()
    }
  }

  res.status(400)
}