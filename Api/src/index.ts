import fastifyCors from '@fastify/cors'
import fastifySwagger from '@fastify/swagger'
import fastifySwaggerUi from '@fastify/swagger-ui'
import fastify from 'fastify'

import autoTagRoutes from './plugins/autoTagRoutes'
import routes from './routes'

const server = fastify()

// Setup CORS
server.register(fastifyCors, { origin: '*' })

// Setup Swagger
server.register(fastifySwagger)
server.register(fastifySwaggerUi, {
  routePrefix: '/docs',
  uiConfig: { docExpansion: 'list' }
})

// Register routes
server.register(autoTagRoutes, { prefix: '/api' })
server.register(routes, { prefix: '/api' })

// Start the server
server.listen({ port: Number(process.env.PORT ?? '3000'), host: '0.0.0.0' }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }

  console.info(`server listening on ${address}`)
})
