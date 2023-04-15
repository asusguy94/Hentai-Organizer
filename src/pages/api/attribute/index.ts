import { NextApiRequest, NextApiResponse } from 'next/types'

import validate, { z } from '@utils/server/validation'
import prisma from '@utils/server/prisma'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(await prisma.attribute.findMany({ orderBy: { name: 'asc' } }))
  } else if (req.method === 'POST') {
    const { name } = validate(
      z.object({
        name: z.string().min(3)
      }),
      req.body
    )

    await prisma.attribute.create({ data: { name } })

    res.end()
  }

  res.status(400)
}
