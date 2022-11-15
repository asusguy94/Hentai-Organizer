import type { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { time, categoryID } = validate(
        Joi.object({
          time: Joi.number().integer().min(1),
          categoryID: Joi.number().integer().min(1)
        }).xor('time', 'categoryID'),
        req.body
      )

      if (time !== undefined) {
        // Change BookmarkTime
        res.json(await prisma.bookmark.update({ where: { id: parseInt(id) }, data: { start: parseInt(time) } }))
      } else if (categoryID !== undefined) {
        // Change CategoryID
        res.json(
          await prisma.bookmark.update({
            where: { id: parseInt(id) },
            data: { categoryID: parseInt(categoryID) }
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
