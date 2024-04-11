import { FastifyInstance } from 'fastify'

import { db } from '../lib/prisma'
import validate, { z } from '../lib/validate'

export default async function bookmarkRoutes(fastify: FastifyInstance) {
  fastify.post('/attribute', async req => {
    const { bookmarkID, attributeID, starID, videoID } = validate(
      z.object({
        bookmarkID: z.number().int().positive().optional(),
        attributeID: z.number().int().positive(),
        starID: z.number().int().positive().optional(),
        videoID: z.number().int().positive().optional()
      }),
      req.body
    )

    async function insertHandler(bookmarkId: number, attributeId: number) {
      return await db.bookmarkAttributes.upsert({
        where: {
          attributeID_bookmarkID: {
            attributeID: attributeId,
            bookmarkID: bookmarkId
          }
        },
        create: { attributeID: attributeId, bookmarkID: bookmarkId },
        update: {}
      })
    }

    if (starID !== undefined && videoID !== undefined) {
      const result = await db.bookmark.findMany({ where: { videoID, starID } })

      const res = []
      for await (const data of result) {
        res.push(await insertHandler(data.id, attributeID))
      }

      return res
    } else if (bookmarkID !== undefined) {
      return await insertHandler(bookmarkID, attributeID)
    }
  })

  fastify.put('/:id', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { time, categoryID } = validate(
      z.object({
        time: z.number().int().positive().optional(),
        categoryID: z.number().int().positive().optional()
      }),
      req.body
    )

    if (time !== undefined) {
      // Change BookmarkTime
      return await db.bookmark.update({
        where: { id },
        data: { start: time }
      })
    } else if (categoryID !== undefined) {
      return await db.bookmark.update({
        where: { id },
        data: { categoryID }
      })
    }
  })

  fastify.delete('/:id', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await db.bookmark.delete({
      where: { id }
    })
  })

  fastify.put('/:id/outfit', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { outfitID } = validate(
      z.object({
        outfitID: z.number().int().positive()
      }),
      req.body
    )

    return await db.bookmark.update({
      where: { id },
      data: { outfitID }
    })
  })

  fastify.delete('/:id/outfit', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await db.bookmark.update({
      where: { id },
      data: { outfit: { disconnect: true } }
    })
  })

  fastify.delete('/:id/attribute', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await db.bookmarkAttributes.deleteMany({
      where: { bookmarkID: id }
    })
  })

  fastify.delete('/:id/attribute/:attributeId', async req => {
    const { id, attributeId } = validate(
      z.object({
        id: z.coerce.number(),
        attributeId: z.coerce.number()
      }),
      req.params
    )

    return await db.bookmarkAttributes.delete({
      where: { attributeID_bookmarkID: { bookmarkID: id, attributeID: attributeId } }
    })
  })

  fastify.post('/:id/star', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { starID } = validate(
      z.object({
        starID: z.number().int().positive()
      }),
      req.body
    )

    return await db.bookmark.update({
      where: { id },
      data: { starID }
    })
  })

  fastify.delete('/:id/star', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await db.bookmark.update({
      where: { id },
      data: { star: { disconnect: true } }
    })
  })
}
