import type { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { getUnique } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(
      (
        await prisma.video.findMany({
          orderBy: { name: 'asc' },
          include: {
            plays: true,
            bookmarks: {
              select: {
                category: true,
                outfit: true,
                attributes: { select: { attribute: { select: { name: true } } } }
              }
            },
            stars: {
              select: {
                star: { select: { attributes: { select: { attribute: { select: { name: true } } } } } }
              }
            }
          }
        })
      ).map(video => ({
        id: video.id,
        noStar: video.noStar,
        cen: video.cen,
        quality: video.height,
        franchise: video.franchise,
        brand: video.brand,
        name: video.name,
        published: video.date_published,
        plays: video.plays.length,
        cover: video.cover,
        attributes: getUnique([
          ...video.stars.flatMap(({ star }) => star.attributes).map(({ attribute }) => attribute.name),
          ...video.bookmarks.flatMap(({ attributes }) => attributes).map(({ attribute }) => attribute.name)
        ]),
        categories: getUnique(video.bookmarks.map(({ category }) => category.name)),
        outfits: getUnique(video.bookmarks.flatMap(({ outfit }) => (outfit !== null ? [outfit.name] : [])))
      }))
    )
  }

  res.status(400)
}
