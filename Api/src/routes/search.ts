import { FastifyInstance } from 'fastify'

import { formatDate, getUnique } from '../lib'
import { db } from '../lib/prisma'

export default async function searchRoutes(fastify: FastifyInstance) {
  fastify.get('/star', async () => {
    return (
      await db.star.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          name: true,
          image: true,
          breast: true,
          haircolor: true,
          hairstyle: true,
          attributes: { select: { attribute: { select: { name: true } } } },
          videos: { select: { video: { select: { date_published: true } } } }
        }
      })
    ).map(star => {
      const published =
        star.videos.length > 0
          ? star.videos
              .map(({ video }) => video)
              .flatMap(v => (v.date_published !== null ? [v.date_published] : []))
              .sort((a, b) => b.getTime() - a.getTime())[0]
          : null

      return {
        ...star,
        attributes: getUnique(star.attributes.map(({ attribute }) => attribute.name)),
        videos: {
          total: star.videos.length,
          last: published ? formatDate(published, true) : null
        }
      }
    })
  })

  fastify.get('/video', async () => {
    return (
      await db.video.findMany({
        orderBy: { name: 'asc' },
        select: {
          id: true,
          noStar: true,
          cen: true,
          height: true,
          franchise: true,
          brand: true,
          name: true,
          date_published: true,
          _count: { select: { plays: true } },
          cover: true,
          poster: true,
          slug: true,
          bookmarks: {
            select: {
              category: true,
              outfit: true,
              attributes: { select: { attribute: { select: { name: true } } } }
            }
          },
          stars: {
            select: { star: { select: { attributes: { select: { attribute: { select: { name: true } } } } } } }
          }
        }
      })
    ).map(({ date_published, height, bookmarks, stars, _count, ...video }) => ({
      ...video,
      plays: _count.plays,
      quality: height,
      attributes: getUnique([
        ...stars.flatMap(({ star }) => star.attributes).map(({ attribute }) => attribute.name),
        ...bookmarks.flatMap(({ attributes }) => attributes).map(({ attribute }) => attribute.name)
      ]),
      published: date_published !== null ? formatDate(date_published, true) : null,
      categories: getUnique(bookmarks.map(({ category }) => category.name)),
      outfits: getUnique(bookmarks.flatMap(({ outfit }) => (outfit !== null ? [outfit.name] : [])))
    }))
  })
}
