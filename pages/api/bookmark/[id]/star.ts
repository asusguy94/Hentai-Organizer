import type { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { starID } = validate(
        Joi.object({
          starID: Joi.number().integer().min(1).required()
        }),
        req.body
      )

      if (starID !== undefined) {
        res.json(await prisma.bookmark.update({ where: { id: parseInt(id) }, data: { starID: parseInt(starID) } }))
      }
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
