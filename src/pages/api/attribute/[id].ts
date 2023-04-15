import { NextApiRequest, NextApiResponse } from 'next/types'

import { z } from 'zod'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { value, label } = validate(
        z.object({
          value: z.string().or(z.boolean()),
          label: z.string().optional()
        }),
        req.body
      )

      if (label !== undefined) {
        if (typeof value === 'boolean') {
          await prisma.attribute.update({ where: { id: parseInt(id) }, data: { [label]: value } })
        }
      } else if (typeof value === 'string') {
        await prisma.attribute.update({ where: { id: parseInt(id) }, data: { name: value } })
      }

      res.end()
    }
  }

  res.status(400)
}
