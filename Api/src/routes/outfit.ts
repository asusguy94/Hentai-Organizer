import { FastifyInstance } from 'fastify'

import { db } from '../lib/prisma'
import validate, { z } from '../lib/validate'

export default async function outfitRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    return await db.outfit.findMany({
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

    await db.outfit.create({
      data: { name }
    })
  })

  fastify.put('/:id', async req => {
    const { id } = validate(
      z.object({
        id: z.number()
      }),
      req.params
    )

    const { value } = validate(
      z.object({
        value: z.string()
      }),
      req.body
    )

    return await db.outfit.update({
      where: { id },
      data: { name: value }
    })
  })
}
