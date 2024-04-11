import { FastifyInstance } from 'fastify'

import attributeRoutes from './attribute'
import bookmarkRoutes from './bookmark'
import brandRoutes from './brand'
import categoryRoutes from './category'
import generateRoutes from './generate'
import outfitRoutes from './outfit'
import searchRoutes from './search'
import starRoutes from './star'
import videoRoutes from './video'

export default async function routes(fastify: FastifyInstance) {
  fastify.register(attributeRoutes, { prefix: '/attribute' })
  fastify.register(bookmarkRoutes, { prefix: '/bookmark' })
  fastify.register(brandRoutes, { prefix: '/brand' })
  fastify.register(categoryRoutes, { prefix: '/category' })
  fastify.register(generateRoutes, { prefix: '/generate' })
  fastify.register(outfitRoutes, { prefix: '/outfit' })
  fastify.register(searchRoutes, { prefix: '/search' })
  fastify.register(starRoutes, { prefix: '/star' })
  fastify.register(videoRoutes, { prefix: '/video' })
}
