import type { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { value, label } = validate(
        Joi.object({
          value: Joi.alternatives(Joi.string(), Joi.boolean()).required(),
          label: Joi.string()
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
