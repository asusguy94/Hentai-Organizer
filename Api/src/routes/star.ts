import { FastifyInstance } from 'fastify'

import fs from 'fs'

import { downloader, sendFile } from '../lib'
import { db } from '../lib/prisma'
import validate, { z } from '../lib/validate'

export default async function starRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    const breast = await db.star.groupBy({
      by: ['breast'],
      where: { breast: { not: null } },
      orderBy: { breast: 'asc' }
    })

    const haircolor = await db.star.groupBy({
      by: ['haircolor'],
      where: { haircolor: { not: null } },
      orderBy: { haircolor: 'asc' }
    })

    const hairstyle = await db.star.groupBy({
      by: ['hairstyle'],
      where: { hairstyle: { not: null } },
      orderBy: { hairstyle: 'asc' }
    })

    const attribute = await db.attribute.findMany({
      where: { videoOnly: false },
      orderBy: { name: 'asc' }
    })

    return {
      breast: breast.map(({ breast }) => breast),
      haircolor: haircolor.map(({ haircolor }) => haircolor),
      hairstyle: hairstyle.map(({ hairstyle }) => hairstyle),
      attribute: attribute.map(attribute => attribute.name)
    }
  })

  fastify.get('/:id', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const star = await db.star.findFirstOrThrow({
      where: { id },
      include: { attributes: { select: { attribute: true } } }
    })

    return {
      id: star.id,
      name: star.name,
      image: star.image,
      info: {
        breast: star.breast ?? '',
        haircolor: star.haircolor ?? '',
        hairstyle: star.hairstyle ?? '',
        attribute: star.attributes.map(({ attribute }) => attribute.name)
      },
      link: star.starLink
    }
  })

  fastify.put('/:id', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { name, label, value } = validate(
      z.object({
        name: z.string().optional(),
        label: z.string().optional(),
        value: z.string().optional()
      }),
      req.body
    )

    if (name !== undefined) {
      return await db.star.update({
        where: { id },
        data: { name }
      })
    } else if (label !== undefined && value !== undefined) {
      if (value.length) {
        return await db.star.update({
          where: { id },
          data: { [label]: value }
        })
      } else {
        return await db.star.update({
          where: { id },
          data: { [label]: null }
        })
      }
    }
  })

  fastify.delete('/:id', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await db.star.delete({
      where: { id }
    })
  })

  fastify.get('/:id/image', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const star = await db.star.findFirstOrThrow({
      where: { id }
    })

    if (star.image !== null) {
      return await sendFile(`./media/images/stars/${star.image}`)
    }
  })

  fastify.post('/:id/image', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )
    const { url } = validate(
      z.object({
        url: z.string().url()
      }),
      req.body
    )

    // Update Database
    await db.star.update({
      where: { id },
      data: { image: `${id}.jpg` }
    })

    // Download Image
    await downloader(url, `media/images/stars/${id}.jpg`)

    return { image: `${id}.jpg` }
  })

  fastify.delete('/:id/image', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const star = await db.star.findFirstOrThrow({
      where: { id }
    })

    if (star.image !== null) {
      const result = await db.star.update({
        where: { id },
        data: { image: null }
      })

      await fs.promises.unlink(`./media/images/stars/${star.image}`)

      return result
    }
  })

  fastify.put('/:id/attribute', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { name, remove } = validate(
      z.object({
        name: z.string(),
        remove: z.literal(true).optional()
      }),
      req.body
    )

    const { id: attributeID } = await db.attribute.findFirstOrThrow({
      where: { name }
    })

    if (remove !== undefined) {
      // Remove attribute to star
      return await db.starAttributes.delete({
        where: { attributeID_starID: { starID: id, attributeID } }
      })
    } else {
      // Add attribute to star
      return await db.starAttributes.create({
        data: { starID: id, attributeID }
      })
    }
  })

  fastify.get('/:id/video', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await db.video.findMany({
      select: { id: true, name: true, path: true },
      where: { stars: { some: { starID: id } } },
      orderBy: [{ franchise: 'asc' }, { episode: 'asc' }]
    })
  })
}
