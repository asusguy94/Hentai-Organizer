import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { name, label, value } = validate(
        z.object({
          name: z.string().optional(),
          label: z.string().optional(),
          value: z.string().optional()
        }),

        req.body
      )

      if (name !== undefined) {
        res.json(await prisma.star.update({ where: { id: parseInt(id) }, data: { name } }))
      } else if (label !== undefined && value !== undefined) {
        if (value.length) {
          await prisma.star.update({ where: { id: parseInt(id) }, data: { [label]: value } })
        } else {
          await prisma.star.update({ where: { id: parseInt(id) }, data: { [label]: null } })
        }
      }

      res.end()
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.star.delete({ where: { id: parseInt(id) } })

      res.end()
    }
  }

  res.status(400)
}
