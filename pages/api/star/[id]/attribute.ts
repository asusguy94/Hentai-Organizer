import type { NextApiRequest, NextApiResponse } from 'next/types'

import Joi from 'joi'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { name, remove } = validate(
        Joi.object({
          name: Joi.string().required(),
          remove: Joi.boolean()
        }),
        req.body
      )

      const { id: attributeID } = await prisma.attribute.findFirstOrThrow({ where: { name } })
      if (remove !== undefined) {
        // Remove attribute to star
        await prisma.starAttributes.delete({
          where: { attributeID_starID: { starID: parseInt(id), attributeID } }
        })
      } else {
        // Add attribute to star
        await prisma.starAttributes.create({ data: { starID: parseInt(id), attributeID } })
      }

      res.end()
    }
  }

  res.status(400)
}
