import { FastifyInstance } from 'fastify'
import fp from 'fastify-plugin'

import capitalize from 'capitalize'

import { getUnique } from '../lib'

async function autoTagRoutes(fastify: FastifyInstance, opts: { prefix: string }) {
  fastify.addHook('onRoute', routeOptions => {
    if (routeOptions.schema?.hide) return // Skip hidden routes

    const prefixTag = capitalize(routeOptions.prefix.replace(new RegExp(`^${opts.prefix}/`), ''))

    if (!routeOptions.schema) routeOptions.schema = {}
    if (!routeOptions.schema.tags) {
      routeOptions.schema.tags = [prefixTag]
    } else {
      routeOptions.schema.tags = getUnique([...routeOptions.schema.tags, prefixTag])
    }
  })
}

export default fp(autoTagRoutes, { name: 'autoTagRoutes' })
