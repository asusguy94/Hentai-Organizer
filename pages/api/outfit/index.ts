import type { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(await prisma.outfit.findMany({ orderBy: { name: 'asc' } }))
  } else if (req.method === 'POST') {
    const { name } = validate(
      Joi.object({
        name: Joi.string().min(3).required()
      }),
      req.body
    )

    await prisma.outfit.create({ data: { name } })

    res.end()
  }

  res.status(400)
}
