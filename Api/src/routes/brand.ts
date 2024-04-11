import { FastifyInstance } from 'fastify'

import { db } from '../lib/prisma'

export default async function brandRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    const brands = await db.video.groupBy({
      where: { brand: { not: null } },
      by: ['brand'],
      orderBy: { brand: 'asc' }
    })

    return brands.map(({ brand }) => brand)
  })
}
