import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { value } = validate(
        z.object({
          value: z.string()
        }),
        req.body
      )

      await prisma.category.update({ where: { id: parseInt(id) }, data: { name: value } })

      res.end()
    }
  }

  res.status(400)
}