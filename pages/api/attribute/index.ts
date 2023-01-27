import type { NextApiRequest, NextApiResponse } from 'next/types'

import { z } from 'zod'

import { prisma, validate } from '@utils/server'

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
