import { FastifyInstance } from 'fastify'

import { db } from '../lib/prisma'
import validate, { z } from '../lib/validate'

export default async function attributeRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return await db.attribute.findMany({
      select: { id: true, name: true, videoOnly: true, starOnly: true },
      orderBy: { name: 'asc' }
    })
  })

  fastify.post('/', async req => {
    const { name } = validate(
      z.object({
        name: z.string().min(3)
      }),
      req.body
    )

    return await db.attribute.create({
      data: { name }
    })
  })

  fastify.put('/:id', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { value, label } = validate(
      z.object({
        value: z.string().or(z.boolean()),
        label: z.string().optional()
      }),
      req.body
    )

    if (label !== undefined) {
      if (typeof value === 'boolean') {
        return await db.attribute.update({
          where: { id },
          data: { [label]: value }
        })
      }
    } else if (typeof value === 'string') {
      return await db.attribute.update({
        where: { id },
        data: { name: value }
      })
    }
  })

  fastify.get('/video', async () => {
    return await db.attribute.findMany({
      select: { id: true, name: true },
      where: { starOnly: false },
      orderBy: { name: 'asc' }
    })
  })
}
